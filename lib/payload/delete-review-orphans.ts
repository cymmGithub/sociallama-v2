/**
 * Deletes the media documents the 2026-08-19 review left unreferenced.
 *
 * `strip-pracuj-creatives.ts` and `swap-irobot-humor.ts` detach rather than
 * delete, on purpose: detaching is reversible and can be reviewed on the page
 * first. This is the second half — run it only once those pages have been
 * looked at, because there is no undo beyond re-uploading from
 * `public/case-studies/<slug>/`.
 *
 * Every row is re-counted here rather than trusted from the earlier audit. A
 * media document is deleted ONLY at zero references, and the scan spans the
 * whole database, not just the study it came from:
 *
 *   - case studies: `cover`, `gallery`, `approach[].media`, `client.logo`,
 *     `seo.ogImage` — in BOTH locales, since `approach` is localized as a whole
 *     array and the two locales can disagree;
 *   - posts: `cover`, `seo.ogImage`, and every Lexical `upload` node in the
 *     body.
 *
 * Anything with a live reference is reported and skipped, never deleted.
 *
 * Run:  bun ./lib/payload/delete-review-orphans.ts            # dry run, dev DB
 *       bun ./lib/payload/delete-review-orphans.ts --apply
 *       bun ./lib/payload/delete-review-orphans.ts --apply --prod
 *
 * NOTE: writes bypass the deployed app, so the revalidation hooks cannot reach
 * the live cache — after running against production, redeploy (or revalidate).
 */

export {} // top-level await needs this file to be a module

const APPLY = process.argv.includes('--apply')

if (process.argv.includes('--prod')) {
  const { targetProdEnv } = await import('./prod-env')
  targetProdEnv('delete-review-orphans')
}

/** Detached by strip-pracuj-creatives.ts and swap-irobot-humor.ts. */
const CANDIDATES = [
  'pracuj-pl-ar-grid-anon.jpg',
  'pracuj-pl-edu-1.png',
  'pracuj-pl-edu-2.png',
  'pracuj-pl-funny-1.png',
  'pracuj-pl-funny-2.png',
  'pracuj-pl-funny-3.png',
  'pracuj-pl-influencer.jpg',
  'irobot-gallery-3-anon-cut.webp',
  'irobot-gallery-6-anon-cut.webp',
]

const dbHost = new URL(
  (process.env.DATABASE_URL ?? '').replace(/^postgres(?:ql)?:/, 'http:')
).hostname

const { default: config } = await import('@payload-config')
const { getPayload } = await import('payload')
const payload = await getPayload({ config })

console.log(
  `${APPLY ? 'applying to' : 'dry run against'} ${dbHost}\n` +
    '(pass --apply to write)\n'
)

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

const refs = new Map<number | string, string[]>()
const addRef = (id: number | string | null, where: string) => {
  if (id === null) return
  refs.set(id, [...(refs.get(id) ?? []), where])
}

// Serialized on purpose: parallel Payload queries against a remote database
// time out under concurrency (house rule from the static-build failures).
for (const locale of ['pl', 'en'] as const) {
  const studies = await payload.find({
    collection: 'case-studies',
    limit: 200,
    draft: true,
    locale,
    fallbackLocale: false,
    depth: 0,
    sort: 'slug',
  })
  // biome-ignore lint/suspicious/noExplicitAny: doc shape
  for (const study of studies.docs as any[]) {
    const at = `study:${study.slug}[${locale}]`
    addRef(idOf(study.cover), `${at}.cover`)
    addRef(idOf(study.client?.logo), `${at}.client.logo`)
    addRef(idOf(study.seo?.ogImage), `${at}.seo.ogImage`)
    for (const item of study.gallery ?? []) addRef(idOf(item), `${at}.gallery`)
    // biome-ignore lint/suspicious/noExplicitAny: pillar row shape
    for (const pillar of (study.approach ?? []) as any[]) {
      for (const item of pillar.media ?? [])
        addRef(idOf(item), `${at}.approach["${pillar.tag}"]`)
    }
  }
}

const posts = await payload.find({
  collection: 'posts',
  limit: 500,
  draft: true,
  locale: 'pl',
  depth: 0,
})
// biome-ignore lint/suspicious/noExplicitAny: doc shape
for (const post of posts.docs as any[]) {
  addRef(idOf(post.cover), `post:${post.slug}.cover`)
  addRef(idOf(post.seo?.ogImage), `post:${post.slug}.seo.ogImage`)
  for (const id of uploadIdsIn(post.content?.root))
    addRef(id, `post:${post.slug}.content`)
}

let deleted = 0
let held = 0

for (const filename of CANDIDATES) {
  const res = await payload.find({
    collection: 'media',
    where: { filename: { equals: filename } },
    limit: 2,
    depth: 0,
    locale: 'pl',
  })
  const doc = res.docs[0]
  if (!doc) {
    console.log(`= ${filename}: no media row — already gone`)
    continue
  }
  if (res.docs.length > 1) {
    throw new Error(
      `${filename}: ${res.docs.length} media rows — refusing to delete`
    )
  }

  const where = refs.get(doc.id) ?? []
  if (where.length > 0) {
    held++
    console.log(
      `! ${filename} (id ${doc.id}): still referenced — HELD\n` +
        where.map((w) => `      ${w}`).join('\n')
    )
    continue
  }

  deleted++
  console.log(`${APPLY ? '-' : 'would delete'} ${filename} (id ${doc.id})`)
  if (APPLY) {
    await payload.delete({ collection: 'media', id: doc.id })
  }
}

console.log(
  `\n${deleted} row(s) ${APPLY ? 'deleted' : 'pending'}` +
    (held > 0 ? `, ${held} held (still referenced)` : '')
)
process.exit(0)
