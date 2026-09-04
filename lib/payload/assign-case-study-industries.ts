import type { Industry } from '@/lib/content/branze'
import type { CaseStudy } from '@/payload-types'

/**
 * The judgement calls — the sixteen studies no branża page covers.
 *
 * The other thirty-one are NOT here. They are derived from `branze.ts` below,
 * because each branża page already names its own case studies and that
 * curation is the site's existing answer. Transcribing it into this file would
 * have made a second copy that drifts the first time someone edits a page, and
 * would have buried sixteen decisions in thirty-one restatements.
 */
const NEW_ASSIGNMENTS: Record<string, string> = {
  polomarket: 'retail', // supermarket chain
  riviera: 'retail', // shopping centre
  'galeria-rondo-wiatraczna': 'retail', // shopping centre
  engie: 'energetyka',
  'n-energia': 'energetyka', // photovoltaics
  'produkty-cukiernicze-brzesc': 'zywnosc', // confectionery
  'las-vegans': 'zywnosc', // vegan food brand
  // Vacuum sealers are an appliance, so this sits with the AGD brands rather
  // than with the food it preserves.
  foodsaver: 'elektronika-i-agd',
  'pracuj-pl': 'edukacja-i-hr', // recruitment
  vistula: 'edukacja-i-hr', // university
  'fm-logistics': 'logistyka',
  bioagris: 'rolnictwo',
  ariadna: 'b2b-i-uslugi', // research panel
  kbp: 'b2b-i-uslugi', // industry congress
  'personal-effect': 'b2b-i-uslugi', // psychotherapy practice
  // Ergonomic office furniture. Not an appliance and not a service — the
  // honest home is a `wyposazenie-wnetrz` category that does not exist yet, so
  // it sits under B2B until someone decides otherwise.
  entelo: 'b2b-i-uslugi',
}

const apply = process.argv.includes('--apply')
const isProd = process.argv.includes('--prod')

if (isProd) {
  const { targetProdEnv } = await import('./prod-env')
  targetProdEnv('assign-case-study-industries')
}

const { INDUSTRIES, INDUSTRY_KEYS, INDUSTRY_OPTIONS } = await import(
  '@/lib/content/branze'
)
const industries = INDUSTRIES as readonly Industry[]

/**
 * slug → industry id, derived from the branża pages plus the sixteen calls
 * above.
 *
 * A study named by two branża pages is a contradiction in the content, not
 * something to resolve silently by whichever page happens to come first, so it
 * aborts. Likewise a study the derivation and `NEW_ASSIGNMENTS` disagree
 * about — that means a page has picked up a study this file already filed
 * elsewhere, and a human has to say which is right.
 */
const INDUSTRY_BY_SLUG: Record<string, string> = {}
for (const industry of industries) {
  // Both fields are optional — `finanse` and `fashion` have pages but no case
  // studies yet, which is exactly why the rail drops them.
  const slugs = [
    ...(industry.relatedCaseStudies ?? []).map((study) => study.slug),
    ...(industry.caseStudy ? [industry.caseStudy.slug] : []),
  ]
  for (const slug of slugs) {
    const existing = INDUSTRY_BY_SLUG[slug]
    if (existing && existing !== industry.id) {
      throw new Error(
        `${slug} is named by two branża pages: ${existing} and ${industry.id}`
      )
    }
    INDUSTRY_BY_SLUG[slug] = industry.id
  }
}
for (const [slug, id] of Object.entries(NEW_ASSIGNMENTS)) {
  const derived = INDUSTRY_BY_SLUG[slug]
  if (derived && derived !== id) {
    throw new Error(
      `${slug} is filed as ${id} here but ${derived} by its branża page`
    )
  }
  INDUSTRY_BY_SLUG[slug] = id
}

// A typo would silently file a study under nothing, so every id is checked
// against the field's own vocabulary before anything is read.
const unknown = [...new Set(Object.values(INDUSTRY_BY_SLUG))].filter(
  (id) => !INDUSTRY_KEYS.includes(id)
)
if (unknown.length > 0) {
  throw new Error(`unknown industry ids: ${unknown.join(', ')}`)
}
console.log(
  `${Object.keys(INDUSTRY_BY_SLUG).length} assignments ` +
    `(${Object.keys(NEW_ASSIGNMENTS).length} from this file, the rest from branze.ts)\n`
)

const { default: config } = await import('@payload-config')
const { getPayload } = await import('payload')
const payload = await getPayload({ config })

const studies = await payload.find({
  collection: 'case-studies',
  where: { _status: { equals: 'published' } },
  sort: '_order',
  limit: 200,
  locale: 'pl',
  depth: 0,
})

const nameOf = (id: string) =>
  INDUSTRY_OPTIONS.find((option) => option.id === id)?.label ?? id

let pending = 0
let already = 0
const missing: string[] = []
const writes: (() => Promise<unknown>)[] = []

for (const study of studies.docs) {
  const target = INDUSTRY_BY_SLUG[study.slug]
  if (!target) {
    missing.push(study.slug)
    continue
  }
  if (study.industry === target) {
    already++
    continue
  }
  pending++
  const from = study.industry ? `${study.industry} → ` : ''
  console.log(
    `${apply ? 'set  ' : 'would'} ${study.slug.padEnd(32)} ${from}${target}  (${nameOf(target)})`
  )
  if (apply) {
    // Queued, not awaited: the writes are independent, and against a remote
    // database 47 serialized round trips is a quarter-minute of pure latency.
    // The plan is printed here, in `_order`, before any of it is drained.
    writes.push(() =>
      payload.update({
        collection: 'case-studies',
        id: study.id,
        // Not localized, so one write covers PL and EN. `draft: false`
        // publishes the change rather than parking it on a draft version
        // nobody promotes. The table is validated against `INDUSTRY_KEYS`
        // above, so the cast asserts what that check already proved.
        data: { industry: target as NonNullable<CaseStudy['industry']> },
        draft: false,
        depth: 0,
      })
    )
  }
}

// Five at a time — enough to hide the latency, few enough not to open a
// connection pool's worth of transactions against a serverless database.
const CONCURRENCY = 5
for (let i = 0; i < writes.length; i += CONCURRENCY) {
  await Promise.all(writes.slice(i, i + CONCURRENCY).map((run) => run()))
}

if (missing.length > 0) {
  console.log(`\nNOT IN THE TABLE (${missing.length}): ${missing.join(', ')}`)
}

// The distribution is the thing to eyeball: a bucket of one is fine, a bucket
// of twenty means the taxonomy is not doing any work.
const tally = new Map<string, number>()
for (const study of studies.docs) {
  const id = INDUSTRY_BY_SLUG[study.slug]
  if (id) {
    tally.set(id, (tally.get(id) ?? 0) + 1)
  }
}
console.log('\nDistribution:')
for (const id of INDUSTRY_KEYS) {
  const n = tally.get(id) ?? 0
  const page = INDUSTRY_OPTIONS.find((o) => o.id === id)?.href
  console.log(
    `  ${String(n).padStart(2)}  ${id.padEnd(30)} ${page ? '' : '(no page yet)'}`
  )
}

console.log(
  `\n${already} already set, ${pending} ${apply ? 'written' : 'pending'}, ${missing.length} unmapped, of ${studies.docs.length}.`
)
if (!apply && pending > 0) {
  console.log('Dry run — re-run with --apply to write.')
}

/**
 * Revalidate what was written.
 *
 * A collection hook calls `revalidateTag` on change, but that is a no-op from
 * a CLI process — the tag lives in the running server's cache, not in this
 * one. `findCaseStudies` is `'use cache'` with `cacheLife('weeks')`, so
 * without this the deployed hub keeps serving the pre-backfill payload for
 * weeks and the industry rail renders empty. This was not theory: it happened
 * on dev while building the feature, and only the POST cleared it.
 */
if (apply && pending > 0) {
  const host = isProd
    ? 'https://sociallama.pl'
    : `http://localhost:${process.env.PORT ?? 3000}`
  const url = `${host}/api/revalidate?tag=case-studies`
  const secret = process.env.REVALIDATE_SECRET
  if (!secret) {
    console.log(`\nSet REVALIDATE_SECRET and POST ${url} — nothing was purged.`)
  } else {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'x-revalidate-secret': secret },
    })
    console.log(
      res.ok
        ? `\nRevalidated case-studies at ${host}.`
        : `\nRevalidate FAILED (${res.status}) — the data is written but ` +
            `${host} will serve the old payload until you POST ${url}.`
    )
  }
}
process.exit(0)
