/**
 * Withdraws one case study: the document, and the media only it referenced.
 *
 * `seed-case-studies.ts --reset` already deletes a study, but it matches media
 * by FILENAME PREFIX and refuses `--prod` by design — both of which are right
 * for a re-seed and wrong here. A prefix is not a reference: `adamed-cover.jpg`
 * shares no prefix with a creative the study picked up from elsewhere, and a
 * file whose name starts with the slug may still be in use by another study.
 * This script therefore selects media by REFERENCE and refuses to delete any
 * row that something else still points at.
 *
 * There is no undo. The Polish drafts that seeded these studies are gitignored
 * and no longer on disk, so a deleted study cannot be re-seeded from the
 * repository — which is why the slug has to be in ALLOWED, why the manifest is
 * printed before anything is written, and why dev runs before prod.
 *
 * Run:  bun ./lib/payload/delete-case-study.ts adamed             report only
 *       bun ./lib/payload/delete-case-study.ts adamed --apply     dev DB
 *       bun ./lib/payload/delete-case-study.ts adamed --apply --prod
 *
 * Deploy the code side FIRST. `/branze/health` featured this study, and a page
 * still linking a slug whose document is gone would 404 from a live route.
 */

export {} // top-level await needs this file to be a module

/**
 * The one slug this change withdraws. A typo'd or pasted slug cannot reach the
 * delete path — the allow-list is the guard, not the argument.
 */
const ALLOWED = new Set(['adamed'])

const APPLY = process.argv.includes('--apply')
const SLUG = process.argv.slice(2).find((a) => !a.startsWith('--'))

if (!SLUG) {
  throw new Error('usage: delete-case-study.ts <slug> [--apply] [--prod]')
}
if (!ALLOWED.has(SLUG)) {
  throw new Error(
    `${SLUG} is not in this script's allow-list (${[...ALLOWED].join(', ')}). ` +
      'Add it deliberately, in a change that says why.'
  )
}

if (process.argv.includes('--prod')) {
  const { targetProdEnv } = await import('./prod-env')
  // `blob: true` with nothing uploaded: production keeps the bytes in Vercel
  // Blob, and Payload can only remove a deleted row's object while its Blob
  // plugin is active. Without the token the row goes and the object is left in
  // the store with nothing pointing at it.
  targetProdEnv('delete-case-study', { blob: true })
}

const { default: config } = await import('@payload-config')
const { getPayload } = await import('payload')
const payload = await getPayload({ config })

const idOf = (v: unknown): number | null => {
  if (typeof v === 'number') return v
  if (v && typeof v === 'object' && 'id' in v) {
    const id = (v as { id: unknown }).id
    return typeof id === 'number' ? id : null
  }
  return null
}

/** id -> every place in the database that points at it. */
const refs = new Map<number, string[]>()
const addRef = (id: number | null, where: string) => {
  if (id === null) return
  refs.set(id, [...(refs.get(id) ?? []), where])
}

// biome-ignore lint/suspicious/noExplicitAny: Lexical node shape
function uploadIdsIn(node: any, out: number[] = []): number[] {
  if (!node) return out
  if (node.type === 'upload') {
    const id = idOf(node.value)
    if (id !== null) out.push(id)
  }
  for (const child of node.children ?? []) uploadIdsIn(child, out)
  return out
}

// Serialized on purpose: parallel Payload queries against a remote database
// time out under concurrency (house rule from the static-build failures).
//
// BOTH locales, because `approach` is localized as a whole array and the two
// can disagree about which media a pillar holds. Reading one locale would let a
// row still referenced from the other look unreferenced.
const mine = new Set<number>()
let studyId: number | string | null = null

for (const locale of ['pl', 'en'] as const) {
  const studies = await payload.find({
    collection: 'case-studies',
    limit: 200,
    draft: true,
    locale,
    fallbackLocale: false,
    depth: 0,
    sort: 'slug',
    overrideAccess: true,
  })
  // biome-ignore lint/suspicious/noExplicitAny: doc shape
  for (const study of studies.docs as any[]) {
    const at = `study:${study.slug}[${locale}]`
    const own = study.slug === SLUG
    if (own) studyId = study.id
    const take = (id: number | null, where: string) => {
      addRef(id, where)
      if (own && id !== null) mine.add(id)
    }
    take(idOf(study.cover), `${at}.cover`)
    take(idOf(study.client?.logo), `${at}.client.logo`)
    take(idOf(study.seo?.ogImage), `${at}.seo.ogImage`)
    for (const item of study.gallery ?? []) take(idOf(item), `${at}.gallery`)
    // biome-ignore lint/suspicious/noExplicitAny: pillar row shape
    for (const pillar of (study.approach ?? []) as any[]) {
      for (const item of pillar.media ?? []) {
        take(idOf(item), `${at}.approach["${pillar.tag}"]`)
      }
    }
  }
}

if (studyId === null) {
  console.log(`${SLUG}: no such study — nothing to do`)
  process.exit(0)
}

const posts = await payload.find({
  collection: 'posts',
  limit: 500,
  draft: true,
  locale: 'pl',
  depth: 0,
  overrideAccess: true,
})
// biome-ignore lint/suspicious/noExplicitAny: doc shape
for (const post of posts.docs as any[]) {
  addRef(idOf(post.cover), `post:${post.slug}.cover`)
  addRef(idOf(post.seo?.ogImage), `post:${post.slug}.seo.ogImage`)
  for (const id of uploadIdsIn(post.content?.root)) {
    addRef(id, `post:${post.slug}.content`)
  }
}

// A referrer that is not this study is a reason to stop. Deleting a shared row
// would blank an image on a page this change never looked at.
const shared: string[] = []
const manifest: { id: number; filename: string }[] = []

for (const id of [...mine].sort((a, b) => a - b)) {
  const others = (refs.get(id) ?? []).filter(
    (where) => !where.startsWith(`study:${SLUG}[`)
  )
  const doc = await payload.findByID({
    collection: 'media',
    id,
    depth: 0,
    overrideAccess: true,
  })
  const filename = (doc?.filename as string) ?? '(missing row)'
  if (others.length > 0) {
    shared.push(
      `${filename} (id ${id}) — also referenced by ${others.join(', ')}`
    )
  } else {
    manifest.push({ id, filename })
  }
}

console.log(
  `delete-case-study ${SLUG} — ${process.argv.includes('--prod') ? 'PRODUCTION' : 'development'} database, ` +
    `${APPLY ? 'APPLYING' : 'report only'}\n`
)
console.log(`  study document: ${SLUG} (id ${studyId})`)
console.log(`  media referenced only by it: ${manifest.length}`)
for (const m of manifest) console.log(`    - ${m.filename} (id ${m.id})`)

if (shared.length > 0) {
  console.log(`\n  ! ${shared.length} of its media are referenced elsewhere:`)
  for (const s of shared) console.log(`    - ${s}`)
  throw new Error(
    'Aborting before any write: a media row this study references is also in ' +
      'use elsewhere. Detach it there first, or exclude it deliberately.'
  )
}

if (!APPLY) {
  console.log('\nReport only — nothing written. Pass --apply to delete.')
  process.exit(0)
}

// The study first: while it exists it still references these rows, and Payload
// would refuse (or silently orphan the relation) deleting media out from under
// a live document.
await payload.delete({
  collection: 'case-studies',
  id: studyId,
  overrideAccess: true,
})
console.log(`\n  - deleted study ${SLUG} (id ${studyId})`)

let removed = 0
for (const m of manifest) {
  await payload.delete({ collection: 'media', id: m.id, overrideAccess: true })
  console.log(`  - deleted media ${m.filename} (id ${m.id})`)
  removed++
}

console.log(`\nDone. study=1 media=${removed}`)
console.log(
  'Writes bypass the deployed app cache — redeploy or revalidate to surface this.'
)
process.exit(0)
