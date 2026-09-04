import type { CaseStudy } from '@/payload-types'

/**
 * slug → industry id.
 *
 * `[branze]` marks an assignment this file did not invent: the branża page
 * already lists that study. `[new]` marks a judgement call — the sixteen
 * studies no branża page covers today.
 */
const INDUSTRY_BY_SLUG: Record<string, string> = {
  // —— from lib/content/branze.ts —————————————————————————————————————
  volvo: 'automotive', // [branze]
  motointegrator: 'automotive', // [branze]
  ozgasl: 'automotive', // [branze]
  // [branze] A karting track, filed under automotive by the branża page
  // itself. Left where the site's own curation put it.
  'a1-karting': 'automotive',
  irobot: 'elektronika-i-agd', // [branze]
  asus: 'elektronika-i-agd', // [branze]
  vobis: 'elektronika-i-agd', // [branze]
  breville: 'elektronika-i-agd', // [branze]
  kohersen: 'elektronika-i-agd', // [branze]
  'stadler-form': 'elektronika-i-agd', // [branze]
  laurastar: 'elektronika-i-agd', // [branze]
  kontigo: 'beauty', // [branze]
  luisse: 'beauty', // [branze]
  mercator: 'health', // [branze]
  'imid-cmv': 'health', // [branze]
  'fundacja-saventic': 'health', // [branze]
  'power-elements': 'health', // [branze]
  mmhygienic: 'health', // [branze]
  aquael: 'petcare', // [branze]
  'faktoria-win': 'alkohole', // [branze]
  'mazurska-manufaktura-alkoholi': 'alkohole', // [branze]
  'julius-meinl': 'horeca', // [branze]
  belvedere: 'horeca', // [branze]
  'dolina-charlotty': 'hotele-i-miejsca-wypoczynkowe', // [branze]
  skibooking: 'hotele-i-miejsca-wypoczynkowe', // [branze]
  getaway: 'hotele-i-miejsca-wypoczynkowe', // [branze]
  'ed-invest': 'nieruchomosci-i-deweloperzy', // [branze]
  'jw-construction': 'nieruchomosci-i-deweloperzy', // [branze]
  'dynamic-development': 'nieruchomosci-i-deweloperzy', // [branze]
  skrzat: 'rozrywka', // [branze]
  rabkoland: 'rozrywka', // [branze]

  // —— no branża page covers these ———————————————————————————————————
  polomarket: 'retail', // [new] supermarket chain
  riviera: 'retail', // [new] shopping centre
  'galeria-rondo-wiatraczna': 'retail', // [new] shopping centre
  engie: 'energetyka', // [new]
  'n-energia': 'energetyka', // [new] photovoltaics
  'produkty-cukiernicze-brzesc': 'zywnosc', // [new] confectionery
  'las-vegans': 'zywnosc', // [new] vegan food brand
  // [new] Vacuum sealers are an appliance, so this sits with the AGD brands
  // rather than with the food it preserves.
  foodsaver: 'elektronika-i-agd',
  'pracuj-pl': 'edukacja-i-hr', // [new] recruitment
  vistula: 'edukacja-i-hr', // [new] university
  'fm-logistics': 'logistyka', // [new]
  bioagris: 'rolnictwo', // [new]
  ariadna: 'b2b-i-uslugi', // [new] research panel
  kbp: 'b2b-i-uslugi', // [new] industry congress
  'personal-effect': 'b2b-i-uslugi', // [new] psychotherapy practice
  // [new] Ergonomic office furniture. Not an appliance and not a service —
  // the honest home is a `wyposazenie-wnetrz` category that does not exist
  // yet, so it sits under B2B until someone decides otherwise.
  entelo: 'b2b-i-uslugi',
}

const apply = process.argv.includes('--apply')

if (process.argv.includes('--prod')) {
  const { targetProdEnv } = await import('./prod-env')
  targetProdEnv('assign-case-study-industries')
}

const { INDUSTRY_KEYS, INDUSTRY_OPTIONS } = await import('@/lib/content/branze')

// A typo in the table would silently file a study under nothing, so the table
// is checked against the field's own vocabulary before anything is read.
const unknown = [...new Set(Object.values(INDUSTRY_BY_SLUG))].filter(
  (id) => !INDUSTRY_KEYS.includes(id)
)
if (unknown.length > 0) {
  throw new Error(`unknown industry ids in the table: ${unknown.join(', ')}`)
}

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
    await payload.update({
      collection: 'case-studies',
      id: study.id,
      // Not localized, so one write covers PL and EN. `draft: false` publishes
      // the change rather than parking it on a draft version nobody promotes.
      // The table is validated against `INDUSTRY_KEYS` above, so this cast
      // asserts what that check already proved: `target` is one of the
      // field's options. Payload types the column as the literal union.
      data: { industry: target as NonNullable<CaseStudy['industry']> },
      draft: false,
      depth: 0,
    })
  }
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
process.exit(0)
