/**
 * Gate a translation draft against its Polish source, on disk, with no
 * database.
 *
 *   bun run payload:check:drafts [slug…]     check some
 *   bun run payload:check:drafts --all       check every draft.en.json
 *
 * `translate-post.ts` runs the same checks, but only at write time and only
 * with a database connection. This exists so whoever is *writing* the
 * translation can gate their own work in the loop — a structural mistake found
 * a second after it is made costs nothing, and the same mistake found at write
 * time costs a round trip through the batch.
 *
 * It is the identical code either way: both call into
 * `post-translation-gate.ts`, so they cannot drift into disagreeing about what
 * a defect is.
 *
 * Exits non-zero if any draft has an error, so it can gate a wave.
 */

import { readdir, readFile } from 'node:fs/promises'
import {
  checkDiacritics,
  checkRunMarkup,
  checkSlug,
  type Finding,
  formatFindings,
  hasErrors,
} from '@/lib/payload/post-translation-gate'

const CONTENT_DIR = 'content/posts'
const ALL = process.argv.includes('--all')
const requested = process.argv.slice(2).filter((arg) => !arg.startsWith('-'))

interface Draft {
  source: string
  title: string
  excerpt: string
  slug?: string
  runs: { index: number; parent: string; text: string }[]
}

const allowlist: string[] = await readFile(
  `${CONTENT_DIR}/glossary.json`,
  'utf8'
)
  .then((raw) => JSON.parse(raw) as string[])
  .catch(() => [])

async function slugsToCheck(): Promise<string[]> {
  if (requested.length > 0) {
    return requested
  }
  if (!ALL) {
    return []
  }
  const entries = await readdir(CONTENT_DIR, { withFileTypes: true })
  return entries.filter((entry) => entry.isDirectory()).map((e) => e.name)
}

const slugs = await slugsToCheck()

if (slugs.length === 0) {
  throw new Error('payload:check:drafts needs slugs, or --all')
}

const read = (slug: string, file: string) =>
  readFile(`${CONTENT_DIR}/${slug}/${file}`, 'utf8')
    .then((raw) => JSON.parse(raw) as Draft)
    .catch(() => null)

/** Every English slug claimed by another draft, to catch a collision early. */
const claimed = new Map<string, string>()
for (const slug of slugs) {
  const en = await read(slug, 'draft.en.json')
  if (en?.slug) {
    const owner = claimed.get(en.slug)
    claimed.set(en.slug, owner ? `${owner}, ${slug}` : slug)
  }
}

let checked = 0
let failed = 0
let pending = 0

for (const slug of slugs) {
  const pl = await read(slug, 'draft.pl.json')
  const en = await read(slug, 'draft.en.json')

  if (!pl) {
    console.error(`  ✗ ${slug}: no draft.pl.json — run --extract first`)
    failed += 1
    continue
  }
  if (!en) {
    pending += 1
    continue
  }

  const findings: Finding[] = []

  if (en.runs.length !== pl.runs.length) {
    findings.push({
      level: 'error',
      where: 'body',
      message: `${en.runs.length} run(s), the source has ${pl.runs.length}`,
    })
  } else {
    pl.runs.forEach((plRun, index) => {
      const enRun = en.runs[index]
      if (!enRun) {
        return
      }
      // The out-of-band tables are irrelevant to a markup comparison: what is
      // being checked is the tag grammar, its sequence, and the positions of
      // the structural tokens. `links` is sized from the source so `<aN>`
      // bounds are still enforced.
      const linkCount = (plRun.text.match(/<a\d+>/g) ?? []).length
      findings.push(
        ...checkRunMarkup(
          { text: plRun.text, links: new Array(linkCount).fill({}), meta: [] },
          enRun.text,
          `run ${index} (${plRun.parent})`
        )
      )
    })
  }

  for (const [field, value] of [
    ['title', en.title],
    ['excerpt', en.excerpt],
  ] as const) {
    if (!value || value.trim().toUpperCase() === 'TODO') {
      findings.push({ level: 'error', where: field, message: 'still a stub' })
    }
  }

  const owner = claimed.get(String(en.slug))
  findings.push(
    ...checkSlug(String(en.slug), {
      takenBy: owner && owner.includes(',') ? owner : undefined,
      polishSlug: pl.source,
    }),
    ...checkDiacritics(
      en.runs.map((run) => run.text).join(' '),
      allowlist,
      'body'
    ),
    ...checkDiacritics(en.title, allowlist, 'title')
  )

  checked += 1
  if (hasErrors(findings)) {
    failed += 1
    console.log(`  ✗ ${slug}\n${formatFindings(findings)}`)
  } else if (findings.length > 0) {
    console.log(`  ! ${slug}\n${formatFindings(findings)}`)
  } else {
    console.log(`  ✓ ${slug}`)
  }
}

console.log(
  `\n${checked - failed} clean, ${failed} with errors, ${pending} not yet translated`
)
process.exit(failed === 0 ? 0 : 1)
