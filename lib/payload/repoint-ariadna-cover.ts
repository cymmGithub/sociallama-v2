/**
 * Gives Ariadna a cover that is about Ariadna.
 *
 * The study shipped with a stock photograph — a woman filming in a kitchen —
 * that names neither the brand nor the campaign, and at 608×920 it is the most
 * extreme portrait in the collection, so the 16:10 listing card and the 16:9
 * hero both centre-cropped it into an unreadable slice. The replacement is a
 * brand plate: the Ariadna mark on the site's own cream, built at 2400×1263
 * (1.90:1) — the ratio the 2026-08-19 cover re-cut settled on for surviving
 * both boxes. `scripts/case-studies/ariadna_cover.py` regenerates it.
 *
 * ## A new media row, never a file swap
 *
 * Same rule as repoint-covers.ts: the relation moves, the old row stays. That
 * keeps the change reversible (point `cover` back at the old id, printed below)
 * and it is what the storage layer wants anyway — the Blob adapter refuses to
 * overwrite an existing key, which is why the file is versioned `-cover-2`.
 *
 * ## `cover` is not localized
 *
 * One write serves both /case-studies/ariadna and /en/case-studies/ariadna.
 * That is also why the plate carries no headline: cover art cannot be
 * translated, so a Polish line would ship untranslated on /en. Only the
 * client's own logotype appears, tagline included, exactly as the card already
 * prints it.
 *
 * ## The dev-then-prod filename trap
 *
 * `getSafeFileName` consults the LOCAL `media/` directory even when the bytes
 * are bound for Blob, so a development run that leaves `media/ariadna-cover-2.jpg`
 * on disk makes the production run quietly ship `ariadna-cover-2-1.jpg` while
 * logging the name it asked for. The upload below therefore asserts the
 * filename it got back and aborts rather than repointing the relation at a
 * wrongly-named row. Delete the local copy before the `--prod` run.
 *
 * Run:  bun ./lib/payload/repoint-ariadna-cover.ts            # dry run, dev DB
 *       bun ./lib/payload/repoint-ariadna-cover.ts --apply
 *       bun ./lib/payload/repoint-ariadna-cover.ts --apply --prod
 *
 * NOTE: writes bypass the deployed app, so the revalidation hooks cannot reach
 * the live cache — after running against production, redeploy (or revalidate).
 */

export {} // top-level await needs this file to be a module

const APPLY = process.argv.includes('--apply')

if (process.argv.includes('--prod')) {
  const { targetProdEnv } = await import('./prod-env')
  // `blob: true` — this script uploads bytes. Without the production token the
  // row would point at a file sitting on this laptop.
  targetProdEnv('repoint-ariadna-cover', { blob: true })
}

const SLUG = 'ariadna'
const FILE = 'public/case-studies/ariadna/ariadna-cover-2.jpg'
const FILENAME = 'ariadna-cover-2.jpg'
const ALT_PL = 'Logo Panelu Badawczego Ariadna na kremowym tle'
const ALT_EN = 'The Ariadna Research Panel logo on a cream field'

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

const found = await payload.find({
  collection: 'case-studies',
  where: { slug: { equals: SLUG } },
  limit: 1,
  draft: true,
  depth: 1,
})
// biome-ignore lint/suspicious/noExplicitAny: doc shape
const study = found.docs[0] as any
if (!study) {
  throw new Error(`no case study with slug "${SLUG}" in ${dbHost}`)
}

const before = study.cover
const beforeId = typeof before === 'object' ? before?.id : before
const beforeName = typeof before === 'object' ? before?.filename : '(id only)'
console.log(`current cover: ${beforeId} ${beforeName}`)

if (beforeName === FILENAME) {
  console.log('= already on the new cover — nothing to do')
  process.exit(0)
}

const existing = await payload.find({
  collection: 'media',
  where: { filename: { equals: FILENAME } },
  limit: 2,
  depth: 0,
})
if (existing.docs.length > 1) {
  throw new Error(`${FILENAME} matches ${existing.docs.length} media rows`)
}

console.log(
  `${APPLY ? '~' : 'would'} ${existing.docs[0] ? 'reuse' : 'upload'} ` +
    `${FILENAME} and repoint ${SLUG}.cover ${beforeId} -> it`
)

if (!APPLY) {
  console.log('\n1 write pending')
  process.exit(0)
}

let mediaId = existing.docs[0]?.id
if (mediaId === undefined) {
  const created = await payload.create({
    collection: 'media',
    filePath: FILE,
    locale: 'pl',
    data: { alt: ALT_PL },
  })
  if (created.filename !== FILENAME) {
    throw new Error(
      `upload came back as "${created.filename}" rather than "${FILENAME}" — ` +
        'a stale local media/ copy bumped the name; delete it and re-run ' +
        'rather than repointing at a wrongly-named row'
    )
  }
  // English alt is required on the /en page, so it is written on upload rather
  // than left to a later pass.
  await payload.update({
    collection: 'media',
    id: created.id,
    locale: 'en',
    data: { alt: ALT_EN },
  })
  mediaId = created.id
  console.log(`  + uploaded ${FILENAME} -> media ${mediaId}`)
}

await payload.update({
  collection: 'case-studies',
  id: study.id,
  // `cover` is unlocalized and these studies are published, so no locale and
  // no `draft: true`: the public page is the thing being corrected.
  data: { cover: mediaId },
})

console.log(
  `\n1 write applied. Rollback: point ${SLUG}.cover back at ${beforeId}.`
)
process.exit(0)
