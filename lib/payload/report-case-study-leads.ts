/**
 * What every case study currently claims as its number — read-only.
 *
 * The scoreboard change makes array order editorial: `results[0]` becomes the
 * hub card's one numeral and the detail hero's large one, and each group's
 * first entry becomes that group's lead. Nothing in the admin shows an editor
 * what that resolves to today, and the answer is occasionally not the one they
 * would pick — Volvo leads on `+1000`, ASUS's YouTube group on `4`.
 *
 * So this prints the face of every study before launch. There is deliberately
 * no threshold and no suggestion: a rule that demoted small numbers would also
 * demote `3.` (place in Polish crowdfunding history) and `361` (investors),
 * which are among the strongest claims on the site. The fix, when there is
 * one, is an editor dragging a row in the admin — no deploy, no migration.
 *
 * Run:  bun ./lib/payload/report-case-study-leads.ts
 *       bun ./lib/payload/report-case-study-leads.ts --locale en
 *       bun ./lib/payload/report-case-study-leads.ts --prod > leads.txt
 */

// Payload's config is imported dynamically (after the --prod env switch), so
// this marks the file as a module — top-level await needs it.
export {}

const args = process.argv.slice(2)
const localeArg = args[args.indexOf('--locale') + 1]
const locale = args.includes('--locale') && localeArg === 'en' ? 'en' : 'pl'

if (args.includes('--prod')) {
  const { targetProdEnv } = await import('./prod-env')
  targetProdEnv('report-case-study-leads')
}

const { groupResults } = await import('./case-study-scoreboard')
const { default: config } = await import('@payload-config')
const { getPayload } = await import('payload')
const payload = await getPayload({ config })

const studies = await payload.find({
  collection: 'case-studies',
  where: { _status: { equals: 'published' } },
  // The listing's own order, so the report reads down the page as a visitor
  // meets it — the studies at the top are the ones whose lead matters most.
  sort: '_order',
  limit: 200,
  locale,
  depth: 0,
})

const pad = (value: string, width: number) => value.padEnd(width)

console.log(
  `# Case-study leads — ${locale.toUpperCase()}, ${studies.docs.length} published, ` +
    `${args.includes('--prod') ? 'production' : 'dev'}\n`
)
console.log(
  'CARD is the numeral on the hub card and the large one in the hero.\n' +
    'LEAD is a group’s first metric — its numeral on the scoreboard and in\n' +
    'the results ledger. The indented rows are the rest of that group, in\n' +
    'order; promoting one is a drag in the admin.\n'
)

let noResults = 0

for (const study of studies.docs) {
  const groups = groupResults(study.results)
  console.log(`── ${study.slug} — ${study.client.name}`)

  if (groups.length === 0) {
    noResults++
    console.log('   (no results — the card shows the cover with no numeral)\n')
    continue
  }

  for (const [index, group] of groups.entries()) {
    const [lead, ...rest] = group.items
    if (!lead) {
      continue
    }
    // Only the very first group's first metric is the study's face; the marker
    // is the whole point of the report, so it is not subtle.
    const marker = index === 0 ? 'CARD' : 'LEAD'
    const mark = group.platform ? `[${group.platform}]` : '[—]'
    console.log(
      `   ${marker} ${pad(lead.value, 22)} ${pad(group.label, 30)} ${lead.metric} ${mark}`
    )
    for (const item of rest) {
      console.log(
        `        · ${pad(item.value, 21)} ${pad('', 30)} ${item.metric}`
      )
    }
  }
  console.log('')
}

console.log(
  `${studies.docs.length - noResults} studies carry a lead; ${noResults} carry none.`
)
process.exit(0)
