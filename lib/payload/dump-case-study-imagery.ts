/**
 * Read-only inventory of every image on every case study — the baseline the
 * imagery audit reviews against (change: audit-case-study-imagery, task 3).
 *
 * Writes nothing. It exists because case-study content lives only in the
 * database: the Polish drafts are git-ignored, so there is no repository copy of
 * "what each study currently shows" to diff against. This script is that copy.
 *
 * Three things it reports that a naive dump would miss:
 *
 *   - `approach` is a WHOLE-ARRAY localized field, so pillar creatives exist
 *     separately in `pl` and `en`. Both locales are read and compared; a
 *     divergence means a removal has to be written twice, so it is surfaced
 *     rather than assumed away. (`cover` and `gallery` are unlocalized.)
 *   - Reference counts span the entire database, not just the study in hand —
 *     case-study cover/gallery/pillar/logo/ogImage fields, post cover/ogImage
 *     fields, and Lexical `upload` nodes embedded in rich text. A media document
 *     may only be DELETED at count 1; anything higher must be detached only.
 *   - Audit scope is marked per row. The spec covers cover, gallery and pillar
 *     media; client logos and OG images are inventoried for reference counting
 *     but are not the audit's subject.
 *
 * Run:  bun ./lib/payload/dump-case-study-imagery.ts
 *       bun ./lib/payload/dump-case-study-imagery.ts --json <path>
 *       bun ./lib/payload/dump-case-study-imagery.ts --prod
 */

// Payload's config is imported dynamically (after the --prod env switch below),
// so this marks the file as a module — top-level await needs it.
export {}

if (process.argv.includes('--prod')) {
  const prodUrl = process.env.DATABASE_URL_PROD
  if (!prodUrl) {
    throw new Error(
      'dump-case-study-imagery --prod requires DATABASE_URL_PROD in .env.local'
    )
  }
  process.env.DATABASE_URL = prodUrl
  ;(process.env as Record<string, string>).NODE_ENV = 'production'
}

const flags = process.argv.slice(2).filter((a) => a.startsWith('--'))
const jsonIdx = process.argv.indexOf('--json')
const jsonPath = jsonIdx === -1 ? null : process.argv[jsonIdx + 1]
const includeDrafts = flags.includes('--include-drafts')

const { default: config } = await import('@payload-config')
const { getPayload } = await import('payload')
const payload = await getPayload({ config })

type Row = {
  slug: string
  client: string
  field: string
  mediaId: number | string
  filename: string
  altPl: string
  altEn: string
  inScope: boolean
  /** Pillar media only: present in pl but not en, or vice versa. */
  localeDivergent?: boolean
}

/** Unwrap an upload field that may be an id or a populated doc. */
// biome-ignore lint/suspicious/noExplicitAny: hand-walked Payload doc shape
function idOf(v: any): number | string | null {
  if (v === null || v === undefined) return null
  if (typeof v === 'object') return v.id ?? null
  return v
}

/** Collect every `upload` node id from a Lexical rich-text tree. */
// biome-ignore lint/suspicious/noExplicitAny: recursive Lexical walk
function uploadIdsIn(node: any, out: (number | string)[] = []) {
  if (!node || typeof node !== 'object') return out
  if (Array.isArray(node)) {
    for (const n of node) uploadIdsIn(n, out)
    return out
  }
  if (node.type === 'upload') {
    const id = idOf(node.value)
    if (id !== null) out.push(id)
  }
  for (const c of node.children ?? []) uploadIdsIn(c, out)
  return out
}

// —— every media reference in the database, for the deletion-safety count ——
const refs = new Map<number | string, string[]>()
const addRef = (id: number | string | null, where: string) => {
  if (id === null) return
  const list = refs.get(id) ?? []
  list.push(where)
  refs.set(id, list)
}

// Serialized on purpose: parallel Payload queries against the remote database
// time out under concurrency (house rule from the static-build failures).
const studiesRes = await payload.find({
  collection: 'case-studies',
  limit: 200,
  draft: true,
  locale: 'pl',
  depth: 1,
  sort: 'slug',
})
// biome-ignore lint/suspicious/noExplicitAny: doc shape
const plDocs = studiesRes.docs as any[]

const enById = new Map<number | string, unknown>()
for (const doc of plDocs) {
  const enRes = await payload.find({
    collection: 'case-studies',
    where: { id: { equals: doc.id } },
    limit: 1,
    draft: true,
    locale: 'en',
    fallbackLocale: false,
    depth: 1,
  })
  enById.set(doc.id, enRes.docs[0] ?? null)
}

const postsRes = await payload.find({
  collection: 'posts',
  limit: 500,
  draft: true,
  locale: 'pl',
  depth: 0,
})
// biome-ignore lint/suspicious/noExplicitAny: doc shape
for (const post of postsRes.docs as any[]) {
  addRef(idOf(post.cover), `post:${post.slug}.cover`)
  addRef(idOf(post.seo?.ogImage), `post:${post.slug}.seo.ogImage`)
  for (const id of uploadIdsIn(post.content?.root))
    addRef(id, `post:${post.slug}.content`)
}

// —— walk the studies ——
const rows: Row[] = []
const perStudy = new Map<string, Row[]>()

for (const pl of plDocs) {
  const published = pl._status === 'published'
  if (!(published || includeDrafts)) continue

  const slug: string = pl.slug
  const client: string = pl.client?.name ?? ''
  // biome-ignore lint/suspicious/noExplicitAny: doc shape
  const en = enById.get(pl.id) as any

  const studyRows: Row[] = []
  const push = (
    field: string,
    // biome-ignore lint/suspicious/noExplicitAny: upload field shape
    value: any,
    inScope: boolean,
    localeDivergent?: boolean
  ) => {
    const id = idOf(value)
    if (id === null) return
    const doc = typeof value === 'object' ? value : null
    studyRows.push({
      slug,
      client,
      field,
      mediaId: id,
      filename: doc?.filename ?? '(unpopulated)',
      altPl: doc?.alt ?? '',
      altEn: '',
      inScope,
      ...(localeDivergent === undefined ? {} : { localeDivergent }),
    })
    addRef(id, `study:${slug}.${field}`)
  }

  // In scope: the spec's "cover, gallery, and approach-pillar media".
  push('cover', pl.cover, true)
  const gallery = pl.gallery ?? []
  for (let i = 0; i < gallery.length; i++)
    push(`gallery[${i}]`, gallery[i], true)

  const plPillars = pl.approach ?? []
  const enPillars = en?.approach ?? []
  for (let p = 0; p < plPillars.length; p++) {
    const plMedia = plPillars[p].media ?? []
    const enMedia = enPillars[p]?.media ?? []
    const enIds = new Set(enMedia.map((m: unknown) => idOf(m)))
    for (let i = 0; i < plMedia.length; i++) {
      const id = idOf(plMedia[i])
      push(
        `approach[${p}].media[${i}]`,
        plMedia[i],
        true,
        // EN carries its own copy of the array; if this creative is missing
        // there the two locales already disagree and a removal must handle both.
        id !== null && !enIds.has(id)
      )
    }
    // A creative present only in EN would never be visited by the PL walk.
    for (let i = 0; i < enMedia.length; i++) {
      const id = idOf(enMedia[i])
      if (id === null) continue
      if (!plMedia.some((m: unknown) => idOf(m) === id))
        push(`en:approach[${p}].media[${i}]`, enMedia[i], true, true)
    }
  }

  // Out of audit scope, inventoried so the reference counts are honest.
  push('client.logo', pl.client?.logo, false)
  push('seo.ogImage', pl.seo?.ogImage, false)

  perStudy.set(slug, studyRows)
  rows.push(...studyRows)
}

// —— EN alt text, fetched once per distinct media document ——
const distinct = [...new Set(rows.map((r) => r.mediaId))]
const altEnById = new Map<number | string, string>()
for (const id of distinct) {
  const res = await payload.find({
    collection: 'media',
    where: { id: { equals: id } },
    limit: 1,
    locale: 'en',
    fallbackLocale: false,
    depth: 0,
  })
  // biome-ignore lint/suspicious/noExplicitAny: doc shape
  altEnById.set(id, ((res.docs[0] as any)?.alt as string) ?? '')
}
for (const r of rows) r.altEn = altEnById.get(r.mediaId) ?? ''

// —— report ——
const inScope = rows.filter((r) => r.inScope)
const divergent = rows.filter((r) => r.localeDivergent)
const shared = distinct.filter((id) => (refs.get(id) ?? []).length > 1)

for (const [slug, studyRows] of perStudy) {
  const g = studyRows.filter((r) => r.field.startsWith('gallery')).length
  const p = studyRows.filter((r) => r.field.includes('approach')).length
  const scoped = studyRows.filter((r) => r.inScope).length
  console.log(
    `${slug.padEnd(34)} ${String(scoped).padStart(3)} in scope  (cover ${
      studyRows.some((r) => r.field === 'cover') ? 1 : 0
    }, gallery ${g}, pillars ${p})`
  )
}

console.log(`\n${perStudy.size} studies`)
console.log(
  `${inScope.length} in-scope images (cover + gallery + pillar media)`
)
console.log(`${rows.length} total references including logos and OG images`)
console.log(`${distinct.length} distinct media documents`)
console.log(`${shared.length} media documents referenced more than once`)
console.log(
  `${divergent.length} pillar creatives that differ between pl and en`
)

if (shared.length > 0) {
  console.log('\nShared media (detach only — never delete):')
  for (const id of shared) {
    const r = rows.find((x) => x.mediaId === id)
    console.log(`  ${id}  ${r?.filename ?? ''}`)
    for (const w of refs.get(id) ?? []) console.log(`      ${w}`)
  }
}

if (divergent.length > 0) {
  console.log('\nLocale-divergent pillar creatives:')
  for (const r of divergent)
    console.log(`  ${r.slug}  ${r.field}  ${r.filename}`)
}

const missingAlt = rows.filter((r) => r.inScope && !r.altPl.trim())
if (missingAlt.length > 0) {
  console.log(`\n${missingAlt.length} in-scope images with empty Polish alt:`)
  for (const r of missingAlt) console.log(`  ${r.slug}  ${r.field}`)
}

if (jsonPath) {
  const { writeFileSync } = await import('node:fs')
  writeFileSync(
    jsonPath,
    `${JSON.stringify(
      {
        studies: [...perStudy].map(([slug, studyRows]) => ({
          slug,
          client: studyRows[0]?.client ?? '',
          images: studyRows,
        })),
        refs: Object.fromEntries(
          [...refs].map(([id, where]) => [id, { count: where.length, where }])
        ),
        totals: {
          studies: perStudy.size,
          inScope: inScope.length,
          references: rows.length,
          distinctMedia: distinct.length,
          shared: shared.length,
          localeDivergent: divergent.length,
        },
      },
      null,
      2
    )}\n`
  )
  console.log(`\nwrote ${jsonPath}`)
}
