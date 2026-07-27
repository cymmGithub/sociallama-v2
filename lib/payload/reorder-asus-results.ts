/**
 * ASUS results: lead with Facebook, and state the likes in full.
 *
 * The article groups result tiles by platform in first-appearance order
 * (`groupResults` in case-study-article.tsx), so putting Facebook on top is a
 * matter of ordering the rows — Facebook first, then the two channels that only
 * carry production counts.
 *
 * Also writes the `Polubienia` tile, which existed on dev but never reached
 * prod, and spells its value `26 000 000` rather than `26 mln`: the whole point
 * of the figure is its scale, and the long form carries that where an
 * abbreviation flattens it.
 *
 * The array is declared whole rather than patched, so the script is idempotent
 * and the intended order is readable in one place. Written through the Local API
 * so the published row and a fresh version stay consistent.
 *
 * Run:  bun ./lib/payload/reorder-asus-results.ts           # dev DB
 *       bun ./lib/payload/reorder-asus-results.ts --prod    # DATABASE_URL_PROD
 *
 * NOTE: writes bypass the deployed app, so revalidation hooks can't reach the
 * live cache — after running against prod, redeploy (or revalidate).
 */

export {} // top-level await needs this file to be a module

if (process.argv.includes('--prod')) {
  const prodUrl = process.env.DATABASE_URL_PROD
  if (!prodUrl) {
    throw new Error(
      'reorder-asus-results --prod requires DATABASE_URL_PROD in .env.local'
    )
  }
  process.env.DATABASE_URL = prodUrl
  ;(process.env as Record<string, string>).NODE_ENV = 'production'
}

// Thousands are separated with a plain space, matching every other figure in
// the collection.
const RESULTS = [
  { platform: 'Facebook', metric: 'Polubienia', value: '26 000 000' },
  { platform: 'Facebook', metric: 'Posty graficzne i animacje', value: '22' },
  {
    platform: 'Facebook',
    metric: 'Karuzele (Facebook i Instagram)',
    value: '3',
  },
  { platform: 'YouTube', metric: 'Filmy edukacyjne o AI', value: '4' },
  { platform: 'Instagram', metric: 'Reelsy z @technokrata', value: '5' },
  { platform: 'Instagram', metric: 'Stories', value: '10' },
]

const dbHost = new URL(
  (process.env.DATABASE_URL ?? '').replace(/^postgres(?:ql)?:/, 'http:')
).hostname

const { default: config } = await import('@payload-config')
const { getPayload } = await import('payload')
const payload = await getPayload({ config })

const found = await payload.find({
  collection: 'case-studies',
  where: { slug: { equals: 'asus' } },
  limit: 1,
  depth: 0,
  locale: 'pl',
})

const study = found.docs[0]
if (!study) {
  throw new Error(`no case study with slug "asus" in ${dbHost}`)
}

type Row = { platform: string; metric: string; value: string }
const before = (study.results ?? []) as Row[]
console.log(`ASUS results in ${dbHost} — before:`)
for (const r of before) {
  console.log(`  ${r.platform} | ${r.metric} | ${r.value}`)
}

// Guard against writing over rows this script does not know about: every
// existing metric should appear in RESULTS, or something changed upstream.
const known = new Set(RESULTS.map((r) => r.metric))
const unknown = before.filter((r) => !known.has(r.metric))
if (unknown.length > 0) {
  throw new Error(
    `unexpected metrics in ${dbHost}, refusing to overwrite: ` +
      unknown.map((r) => `"${r.metric}"`).join(', ')
  )
}

await payload.update({
  collection: 'case-studies',
  id: study.id,
  locale: 'pl',
  data: { results: RESULTS },
})

const after = await payload.findByID({
  collection: 'case-studies',
  id: study.id,
  depth: 0,
  locale: 'pl',
})
console.log(`\nafter:`)
for (const r of (after.results ?? []) as Row[]) {
  console.log(`  ${r.platform} | ${r.metric} | ${r.value}`)
}
process.exit(0)
