/**
 * Independent verification of the English blog corpus (design D5).
 *
 *   bun run payload:verify:post-en [slug…]        verify some
 *   bun run payload:verify:post-en --all          verify every published post
 *   bun run payload:verify:post-en --all --status  …and write STATUS.md
 *   …--prod                                        against production
 *
 * Exits non-zero on any failure, so it can gate a wave.
 *
 * ## Why this exists when the gate already ran
 *
 * `translate-post.ts` gates the tree it is ABOUT to write. This reads back
 * what is actually in the database, in a separate process, and re-derives the
 * same assertions from scratch. The two answer different questions: "is this
 * translation sound?" versus "is the corpus sound?" — and only the second
 * survives a partial write, a hand edit in the admin panel, or a migration.
 *
 * It reads English with **`fallbackLocale: false`**, so a pass means genuinely
 * translated rather than Polish showing through the config's global fallback.
 * Without that, every untranslated post would verify perfectly by rendering
 * its Polish self, which is exactly the failure D6 exists to prevent.
 */

import { mkdir, readFile, writeFile } from 'node:fs/promises'
import type { ProjNode } from '@/lib/payload/post-projection'
import {
  checkDiacritics,
  checkHeadings,
  checkSlug,
  checkTree,
  type Finding,
  formatFindings,
  hasErrors,
  textOf,
} from '@/lib/payload/post-translation-gate'

const ALL = process.argv.includes('--all')
const STATUS = process.argv.includes('--status')
const STATUS_FILE = 'content/posts/STATUS.md'

if (process.argv.includes('--prod')) {
  const prodUrl = process.env.DATABASE_URL_PROD
  if (!prodUrl) {
    throw new Error('payload:verify:post-en --prod requires DATABASE_URL_PROD')
  }
  process.env.DATABASE_URL = prodUrl
  ;(process.env as Record<string, string>).NODE_ENV = 'production'
}

const dbHost = new URL(
  (process.env.DATABASE_URL ?? '').replace(/^postgres(?:ql)?:/, 'http:')
).hostname

const requested = process.argv.slice(2).filter((arg) => !arg.startsWith('-'))

if (requested.length === 0 && !ALL) {
  throw new Error(
    'payload:verify:post-en needs slugs, or --all to sweep every published post'
  )
}

const { default: config } = await import('@payload-config')
const { getPayload } = await import('payload')
const payload = await getPayload({ config })

console.log(`Verifying English posts on: ${dbHost}\n`)

const allowlist: string[] = await readFile(
  'content/posts/glossary.json',
  'utf8'
)
  .then((raw) => JSON.parse(raw) as string[])
  .catch(() => [])

const READ = { depth: 0, fallbackLocale: false } as const

const polish = await payload.find({
  collection: 'posts',
  where:
    requested.length > 0
      ? { slug: { in: requested } }
      : { _status: { equals: 'published' } },
  limit: 0,
  pagination: false,
  locale: 'pl',
  ...READ,
})

/** Detect a slug used twice — the idempotency claim D5 makes. */
const englishAll = await payload.find({
  collection: 'posts',
  limit: 0,
  pagination: false,
  locale: 'en',
  ...READ,
  select: { slug: true },
})
const slugOwners = new Map<string, string[]>()
for (const doc of englishAll.docs) {
  if (doc.slug) {
    slugOwners.set(doc.slug, [
      ...(slugOwners.get(doc.slug) ?? []),
      String(doc.id),
    ])
  }
}

interface Row {
  slug: string
  enSlug: string
  state: 'pass' | 'fail' | 'untranslated'
  findings: Finding[]
  words: number
}

const rows: Row[] = []

for (const pl of polish.docs) {
  const slug = String(pl.slug)
  const en = (
    await payload.find({
      collection: 'posts',
      where: { id: { equals: pl.id } },
      limit: 1,
      locale: 'en',
      ...READ,
    })
  ).docs[0]

  const plRoot = (pl.content as { root?: ProjNode } | null)?.root
  const enRoot = (en?.content as { root?: ProjNode } | null)?.root
  const words = plRoot ? textOf(plRoot).trim().split(/\s+/).length : 0

  // No English row at all is not a failure: under the D6 gate an untranslated
  // post correctly does not exist in English. It is reported as outstanding
  // work, not as a defect.
  if (!(en?.title && enRoot)) {
    rows.push({ slug, enSlug: '—', state: 'untranslated', findings: [], words })
    continue
  }

  const findings: Finding[] = []

  for (const [field, plValue, enValue] of [
    ['title', pl.title, en.title],
    ['excerpt', pl.excerpt, en.excerpt],
  ] as const) {
    if (!enValue) {
      findings.push({ level: 'error', where: field, message: 'missing' })
    } else if (enValue === plValue) {
      findings.push({
        level: 'warn',
        where: field,
        message: 'identical to Polish',
      })
    }
  }

  if (en._status !== 'published') {
    // D7: a draft-only translation renders nowhere. It would look written and
    // change nothing.
    findings.push({
      level: 'error',
      where: 'status',
      message: `English sits on "${en._status}", not the published version`,
    })
  }

  const owners = slugOwners.get(String(en.slug)) ?? []
  findings.push(
    ...checkSlug(String(en.slug), {
      takenBy: owners.length > 1 ? owners.join(', ') : undefined,
      polishSlug: slug,
    })
  )

  if (plRoot) {
    findings.push(...checkTree(plRoot, enRoot))
  }
  findings.push(
    ...checkHeadings(enRoot),
    ...checkDiacritics(textOf(enRoot), allowlist, 'body'),
    ...checkDiacritics(String(en.title), allowlist, 'title')
  )

  rows.push({
    slug,
    enSlug: String(en.slug),
    state: hasErrors(findings) ? 'fail' : 'pass',
    findings,
    words,
  })
}

for (const row of rows) {
  const mark = { pass: '✓', fail: '✗', untranslated: '–' }[row.state]
  const warns = row.findings.filter((f) => f.level === 'warn').length
  console.log(
    `${mark} ${row.slug.padEnd(52)} ${row.state}${warns > 0 ? ` (${warns} soft)` : ''}`
  )
  if (row.findings.length > 0) {
    console.log(formatFindings(row.findings))
  }
}

const passed = rows.filter((r) => r.state === 'pass').length
const failed = rows.filter((r) => r.state === 'fail').length
const pending = rows.filter((r) => r.state === 'untranslated').length

if (STATUS) {
  const softFlagged = rows.filter(
    (r) => r.state === 'pass' && r.findings.length > 0
  )
  const body = [
    '# English blog — translation status',
    '',
    `Generated by \`payload:verify:post-en\` against \`${dbHost}\`.`,
    '',
    `**${passed} verified · ${failed} failing · ${pending} not yet translated**`,
    '',
    '## Soft flags',
    '',
    softFlagged.length === 0
      ? '_None._'
      : [
          'Verified, but worth a human look. Nothing here blocks a wave.',
          '',
          '| Post | Note |',
          '| --- | --- |',
          ...softFlagged.map(
            (r) =>
              `| \`${r.slug}\` | ${r.findings.map((f) => `${f.where}: ${f.message}`).join('; ')} |`
          ),
        ].join('\n'),
    '',
    '## Not yet translated',
    '',
    pending === 0
      ? '_None._'
      : [
          'These have no English row, so under the D6 gate they correctly do not',
          'exist in English: no URL, no sitemap entry, no hreflang.',
          '',
          '| Post | Polish words |',
          '| --- | --- |',
          ...rows
            .filter((r) => r.state === 'untranslated')
            .sort((a, b) => a.words - b.words)
            .map((r) => `| \`${r.slug}\` | ${r.words} |`),
        ].join('\n'),
    '',
  ].join('\n')
  await mkdir('content/posts', { recursive: true })
  await writeFile(STATUS_FILE, body)
  console.log(`\nwrote ${STATUS_FILE}`)
}

console.log(
  `\n${passed} verified, ${failed} failing, ${pending} not yet translated (of ${rows.length})`
)
process.exit(failed === 0 ? 0 : 1)
