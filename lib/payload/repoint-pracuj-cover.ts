/**
 * Points the Pracuj.pl case study's `cover` at the review-approved image.
 *
 * Production diverged from development here: its study references a
 * `pracuj_digitalx_2-3635319750.jpg` row — a Pracuj.pl mascot ad, which is
 * exactly the "not Social Lama's work" class the 2026-08-19 review removed —
 * while the `pracuj-pl-cover.jpg` row (whose bytes and alt the review pass
 * already replaced in place) sits unreferenced. Development never had the
 * mascot row, so the byte-refresh plan could not see the divergence.
 *
 * Keyed on filenames, never media ids (ids are per-database), and the current
 * state is a guard: any cover other than the two named files means the study
 * changed since the plan, so the script aborts rather than writing. `cover` is
 * unlocalized, so one update serves both locales.
 *
 * The detached mascot row is deleted separately by delete-review-orphans.ts,
 * which re-counts references first — same split as the other review scripts:
 * detaching is reversible, deleting is not.
 *
 * Run:  bun ./lib/payload/repoint-pracuj-cover.ts            # dry run, dev DB
 *       bun ./lib/payload/repoint-pracuj-cover.ts --apply
 *       bun ./lib/payload/repoint-pracuj-cover.ts --apply --prod
 *
 * NOTE: writes bypass the deployed app, so the revalidation hooks cannot reach
 * the live cache — after running against production, redeploy (or revalidate).
 */

export {} // top-level await needs this file to be a module

const APPLY = process.argv.includes('--apply')

if (process.argv.includes('--prod')) {
  const { targetProdEnv } = await import('./prod-env')
  targetProdEnv('repoint-pracuj-cover')
}

const SLUG = 'pracuj-pl'
const WANT = 'pracuj-pl-cover.jpg'
const REPLACING = 'pracuj_digitalx_2-3635319750.jpg'

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

const wantRes = await payload.find({
  collection: 'media',
  where: { filename: { equals: WANT } },
  limit: 2,
  depth: 0,
  locale: 'pl',
})
const want = wantRes.docs[0]
if (!want || wantRes.docs.length !== 1) {
  throw new Error(
    `expected exactly one media row named ${WANT}, ` +
      `found ${wantRes.docs.length} — refusing to write`
  )
}

const res = await payload.find({
  collection: 'case-studies',
  where: { slug: { equals: SLUG } },
  limit: 1,
  draft: true,
  locale: 'pl',
  depth: 1, // cover resolved so it can be matched by filename
})
// biome-ignore lint/suspicious/noExplicitAny: doc shape
const doc = res.docs[0] as any
if (!doc) {
  throw new Error(`no case study with slug "${SLUG}" in ${dbHost}`)
}

const current: string | undefined = doc.cover?.filename
if (current === WANT) {
  console.log(`= ${SLUG}: cover already ${WANT} — nothing to do`)
  process.exit(0)
}
if (current !== REPLACING) {
  throw new Error(
    `${SLUG}: cover is "${current}", not "${REPLACING}" — the study changed ` +
      'since the plan, refusing to write'
  )
}

console.log(
  `${APPLY ? '~' : 'would'} ${SLUG}: cover ${current} -> ${WANT} (id ${want.id})`
)

if (APPLY) {
  await payload.update({
    collection: 'case-studies',
    id: doc.id,
    // No `draft: true`: the study is published and the public page is the
    // thing being corrected.
    data: { cover: want.id },
  })
}

console.log(`\n1 change ${APPLY ? 'written' : 'pending'}`)
process.exit(0)
