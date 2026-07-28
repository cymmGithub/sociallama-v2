/**
 * EN translation verifier — the check side of translate-case-study.ts.
 *
 * Reads each slug's PL and EN locales (EN with fallback DISABLED, so only what
 * was genuinely written to `en` is visible) and asserts the guarantees this
 * change's spec delta makes:
 *
 *   - exactly one document per slug                      (idempotency)
 *   - EN localized fields are populated and differ from PL (actually translated,
 *     not silently falling back)
 *   - every pillar's `media` array is byte-identical to PL (creatives reused,
 *     never re-uploaded or re-paired)
 *   - pillar and results counts match PL                  (index pairing intact)
 *   - the EN content is on the PUBLISHED version          (design D5)
 *
 * Run:  bun ./lib/payload/verify-case-study-en.ts riviera skrzat
 *       bun ./lib/payload/verify-case-study-en.ts --all
 *       bun ./lib/payload/verify-case-study-en.ts --all --prod
 *
 * Exits non-zero if any check fails.
 */

// Payload's config is imported dynamically (after the --prod env switch below),
// so this marks the file as a module — top-level await needs it.
export {}

if (process.argv.includes('--prod')) {
  const prodUrl = process.env.DATABASE_URL_PROD
  if (!prodUrl) {
    throw new Error(
      'verify-case-study-en --prod requires DATABASE_URL_PROD in .env.local'
    )
  }
  process.env.DATABASE_URL = prodUrl
  ;(process.env as Record<string, string>).NODE_ENV = 'production'
}

const flags = process.argv.slice(2).filter((a) => a.startsWith('--'))
const slugArgs = process.argv.slice(2).filter((a) => !a.startsWith('--'))
const isAll = flags.includes('--all')
// `--status` also writes content/case-studies/STATUS.md. That directory is
// git-ignored, so the table has to be regenerable rather than hand-maintained.
const writeStatus = flags.includes('--status')

if (!isAll && slugArgs.length === 0) {
  throw new Error(
    'usage: verify-case-study-en.ts <slug...>|--all [--status] [--prod]'
  )
}

const { default: config } = await import('@payload-config')
const { getPayload } = await import('payload')
const payload = await getPayload({ config })

const j = (v: unknown) => JSON.stringify(v)

// biome-ignore lint/suspicious/noExplicitAny: hand-walked Payload doc shape
function textOf(node: any): string {
  if (!node || typeof node !== 'object') return ''
  if (node.type === 'text') return node.text ?? ''
  // biome-ignore lint/suspicious/noExplicitAny: recursive Lexical walk
  return (node.children ?? []).map((c: any) => textOf(c)).join('')
}

let slugs = slugArgs
if (isAll) {
  const all = await payload.find({
    collection: 'case-studies',
    limit: 200,
    draft: true,
    locale: 'pl',
    depth: 0,
  })
  // biome-ignore lint/suspicious/noExplicitAny: doc shape
  slugs = (all.docs as any[]).map((d) => d.slug).sort()
}

let totalFailed = 0
let totalUntranslated = 0
const rows: {
  slug: string
  client: string
  status: string
  pillars: number
  results: number
  en: string
}[] = []

for (const slug of slugs) {
  const failures: string[] = []
  const warnings: string[] = []
  const check = (name: string, ok: boolean, detail = '') => {
    if (!ok) failures.push(detail ? `${name} — ${detail}` : name)
  }
  // Short metric labels are often already English loanwords in the Polish
  // original ("Stories", "Reels", "Followers"), so PL === EN is legitimate
  // there — surface it for review rather than failing the study.
  const soft = (name: string, ok: boolean, detail = '') => {
    if (!ok) warnings.push(detail ? `${name} — ${detail}` : name)
  }

  const plRes = await payload.find({
    collection: 'case-studies',
    where: { slug: { equals: slug } },
    limit: 10,
    draft: true,
    locale: 'pl',
    depth: 0,
  })
  const enRes = await payload.find({
    collection: 'case-studies',
    where: { slug: { equals: slug } },
    limit: 10,
    draft: false, // published version — what the live /en page renders (D5)
    locale: 'en',
    fallbackLocale: false,
    depth: 0,
  })

  // biome-ignore lint/suspicious/noExplicitAny: doc shape
  const pl = plRes.docs[0] as any
  // biome-ignore lint/suspicious/noExplicitAny: doc shape
  const en = enRes.docs[0] as any

  if (!pl) {
    console.log(`✗ ${slug}: no PL document`)
    totalFailed++
    continue
  }
  const row = {
    slug,
    client: pl.client?.name ?? '',
    status: pl._status === 'published' ? 'published' : 'draft',
    pillars: (pl.approach ?? []).length,
    results: (pl.results ?? []).length,
    en: '—',
  }
  rows.push(row)
  if (!en?.title) {
    console.log(`· ${slug}: not yet translated`)
    totalUntranslated++
    continue
  }

  check(
    'exactly one document',
    plRes.totalDocs === 1,
    `found ${plRes.totalDocs}`
  )
  check('EN title differs from PL', pl.title !== en.title)
  check('EN excerpt present', Boolean(en.excerpt))
  check('EN excerpt differs from PL', pl.excerpt !== en.excerpt)
  check('EN tags present', (en.tags ?? []).length > 0)
  check(
    'EN client.about present',
    textOf(en.client?.about?.root).trim().length > 0
  )
  check(
    'EN client.about differs from PL',
    textOf(pl.client?.about?.root) !== textOf(en.client?.about?.root)
  )
  check('EN challenge present', textOf(en.challenge?.root).trim().length > 0)
  check(
    'EN challenge differs from PL',
    textOf(pl.challenge?.root) !== textOf(en.challenge?.root)
  )
  check(
    'client.name preserved',
    Boolean(en.client?.name) && pl.client?.name === en.client?.name,
    `pl=${pl.client?.name} en=${en.client?.name}`
  )

  const plPillars = pl.approach ?? []
  const enPillars = en.approach ?? []
  check(
    'pillar count matches PL',
    plPillars.length === enPillars.length,
    `pl=${plPillars.length} en=${enPillars.length}`
  )
  for (let i = 0; i < plPillars.length; i++) {
    check(
      `pillar[${i}] media reused`,
      j(plPillars[i].media) === j(enPillars[i]?.media),
      `pl=${j(plPillars[i].media)} en=${j(enPillars[i]?.media)}`
    )
    check(
      `pillar[${i}] heading translated`,
      Boolean(enPillars[i]?.heading) &&
        plPillars[i].heading !== enPillars[i].heading
    )
    check(
      `pillar[${i}] body translated`,
      textOf(plPillars[i].body?.root) !== textOf(enPillars[i]?.body?.root) &&
        textOf(enPillars[i]?.body?.root).trim().length > 0
    )
  }

  const plResults = pl.results ?? []
  const enResults = en.results ?? []
  check(
    'results count matches PL',
    plResults.length === enResults.length,
    `pl=${plResults.length} en=${enResults.length}`
  )
  for (let i = 0; i < plResults.length; i++) {
    check(
      `results[${i}].platform present`,
      Boolean(enResults[i]?.platform),
      `metric="${plResults[i].metric}"`
    )
    check(`results[${i}].metric present`, Boolean(enResults[i]?.metric))
    soft(
      `results[${i}].metric identical to PL`,
      plResults[i].metric !== enResults[i]?.metric,
      `"${plResults[i].metric}" — confirm this is already English`
    )
  }

  if (failures.length === 0) {
    console.log(`✓ ${slug}`)
    row.en = warnings.length > 0 ? `✅ (${warnings.length} note)` : '✅'
  } else {
    console.log(`✗ ${slug}`)
    for (const f of failures) console.log(`    ${f}`)
    totalFailed++
    row.en = `❌ ${failures.length} issue(s)`
  }
  for (const w of warnings) console.log(`    ⚠ ${w}`)
}

if (writeStatus) {
  const { writeFileSync } = await import('node:fs')
  const header = [
    '# Case-study status',
    '',
    `Generated by \`bun run payload:verify:case-study-en --all --status\` — do not hand-edit.`,
    '',
    'The EN column reflects the **published** version of each document, read with',
    'the Polish fallback disabled, so ✅ means genuinely translated rather than',
    'falling back to Polish.',
    '',
    '| Study | Client | Status | Pillars | Results | EN |',
    '| --- | --- | --- | ---: | ---: | --- |',
  ].join('\n')
  const body = rows
    .map(
      (r) =>
        `| \`${r.slug}\` | ${r.client} | ${r.status} | ${r.pillars} | ${r.results} | ${r.en} |`
    )
    .join('\n')
  const translated = rows.filter((r) => r.en.startsWith('✅')).length
  const footer = [
    '',
    '',
    `**${translated}/${rows.length}** studies carry an English translation.`,
    '',
    '`medicover` is intentionally absent: its source deck was corrupted during',
    'the import, so no document was ever created for it.',
    '',
  ].join('\n')
  writeFileSync('content/case-studies/STATUS.md', `${header}\n${body}${footer}`)
  console.log('\nwrote content/case-studies/STATUS.md')
}

const ok = slugs.length - totalFailed - totalUntranslated
console.log(
  `\n${ok} passed, ${totalFailed} failed, ${totalUntranslated} not yet translated (of ${slugs.length})`
)
process.exit(totalFailed === 0 ? 0 : 1)
