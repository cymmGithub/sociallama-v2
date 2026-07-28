/**
 * Media alt-text translation, PL → EN (change `add-english-blog`, task 2.8).
 *
 *   bun run payload:translate:alt --extract     PL → content/media/alts.pl.json
 *   bun run payload:translate:alt               dry run against alts.en.json
 *   bun run payload:translate:alt --apply       …and write
 *   …--prod                                     target production
 *
 * Same shape as `translate-post.ts` and for the same reasons: disk is the
 * source of truth, the database write is a projection of it, and a post that
 * fails the gate is left exactly as it was.
 *
 * ## Why alt text is worth this machinery
 *
 * It is the one string on the page a sighted reader never sees, so a wrong one
 * survives every visual spot-check. It is also announced by a speech
 * synthesizer using the page's `lang`: Polish prose on an `<html lang="en">`
 * page is not merely untranslated, it is read aloud as noise.
 *
 * ## Alts are shared, posts are not
 *
 * One media row can be referenced by many posts and by pages outside the blog
 * entirely. So this keys on media id and translates the collection whole,
 * rather than per-post the way `translate-post.ts` does. Two rows with
 * identical Polish alt text still get their own entries: they are different
 * images, and English that reads well for one may not for the other.
 */

import { mkdir, readFile, writeFile } from 'node:fs/promises'
import {
  checkDiacritics,
  type Finding,
  formatFindings,
  hasErrors,
} from '@/lib/payload/post-translation-gate'

const EXTRACT = process.argv.includes('--extract')
const APPLY = process.argv.includes('--apply')

const DIR = 'content/media'
const PL_FILE = `${DIR}/alts.pl.json`
const EN_FILE = `${DIR}/alts.en.json`
const ALLOWLIST_FILE = 'content/posts/glossary.json'

if (process.argv.includes('--prod')) {
  const prodUrl = process.env.DATABASE_URL_PROD
  if (!prodUrl) {
    throw new Error('payload:translate:alt --prod requires DATABASE_URL_PROD')
  }
  process.env.DATABASE_URL = prodUrl
  ;(process.env as Record<string, string>).NODE_ENV = 'production'
}

interface Entry {
  id: number
  /** Filename, so a translator has something to go on beyond the Polish. */
  filename: string
  /** The Polish alt this English was written from; a mismatch means stale. */
  source?: string
  alt: string
}

const looksStub = (value?: string) =>
  !value || value.trim() === '' || value.trim().toUpperCase() === 'TODO'

/**
 * A quoted phrase immediately followed by a parenthetical.
 *
 * Alt text describes what is ON the image, so Polish words printed inside a
 * creative — a slogan, a headline, an event title — stay Polish and take an
 * English gloss. Translating them away would describe an image that does not
 * exist. That convention is deliberate, and without this the diacritic check
 * fires on every single one of them: 3 real warnings arrived buried under 16
 * correct ones, which is how a gate becomes something people mute.
 *
 * Only the GLOSSED form is exempt. Quoted Polish with no gloss still warns,
 * which is what keeps this a rule rather than a blanket exemption.
 */
const GLOSSED_QUOTE = /["“„][^"“”„]*["”]\s*\((?:[^()]|\([^()]*\))*\)/g

const withoutGlossedQuotes = (alt: string) => alt.replace(GLOSSED_QUOTE, ' ')

const { default: config } = await import('@payload-config')
const { getPayload } = await import('payload')
const payload = await getPayload({ config })

const dbHost = new URL(
  (process.env.DATABASE_URL ?? '').replace(/^postgres(?:ql)?:/, 'http:')
).hostname

function modeLabel(): string {
  if (EXTRACT) {
    return 'Extracting from'
  }
  return APPLY ? 'Writing to' : 'Dry run against'
}

console.log(`${modeLabel()}: ${dbHost}\n`)

const allowlist: string[] = await readFile(ALLOWLIST_FILE, 'utf8')
  .then((raw) => JSON.parse(raw) as string[])
  .catch(() => [])

/**
 * `fallbackLocale: false` matters in both directions here. Extracting, it
 * guarantees the Polish read is really Polish. Writing, it is how an
 * already-translated row is told from one merely inheriting Polish through the
 * global `fallback: true` — without it every row looks translated.
 */
const readLocale = async (locale: 'pl' | 'en') =>
  (
    await payload.find({
      collection: 'media',
      limit: 0,
      pagination: false,
      depth: 0,
      locale,
      fallbackLocale: false,
    })
  ).docs

if (EXTRACT) {
  const docs = await readLocale('pl')
  const entries: Entry[] = docs
    .map((doc) => ({
      id: Number(doc.id),
      filename: String(doc.filename ?? ''),
      alt: String(doc.alt ?? ''),
    }))
    .sort((a, b) => a.id - b.id)

  await mkdir(DIR, { recursive: true })
  await writeFile(PL_FILE, `${JSON.stringify(entries, null, 2)}\n`)
  console.log(`${entries.length} alt(s) extracted to ${PL_FILE}`)
  process.exit(0)
}

// —— write mode ————————————————————————————————————————————————————————
const plDocs = await readLocale('pl')
const plById = new Map(plDocs.map((d) => [Number(d.id), String(d.alt ?? '')]))

const enEntries = await readFile(EN_FILE, 'utf8')
  .then((raw) => JSON.parse(raw) as Entry[])
  .catch(() => null)

if (!enEntries) {
  throw new Error(`no ${EN_FILE} — translate the extracted alts first`)
}

let written = 0
let skipped = 0
let warned = 0

for (const entry of enEntries) {
  const findings: Finding[] = []
  const plAlt = plById.get(entry.id)

  if (plAlt === undefined) {
    findings.push({
      level: 'error',
      where: `media ${entry.id}`,
      message: 'no such media row',
    })
  } else if (entry.source !== undefined && entry.source !== plAlt) {
    // A drifted source means the Polish changed after this English was
    // written, so the English describes an alt that no longer exists.
    findings.push({
      level: 'error',
      where: `media ${entry.id}`,
      message: `source drifted: draft has ${JSON.stringify(entry.source)}, database has ${JSON.stringify(plAlt)}`,
    })
  }

  if (looksStub(entry.alt)) {
    findings.push({
      level: 'error',
      where: `media ${entry.id}`,
      message: 'still a stub',
    })
  }

  findings.push(
    ...checkDiacritics(
      withoutGlossedQuotes(entry.alt),
      allowlist,
      `media ${entry.id}`
    )
  )

  if (hasErrors(findings)) {
    console.log(formatFindings(findings))
    skipped += 1
    continue
  }

  // Warnings are the whole point of the diacritic check, and printing only on
  // error swallowed every one of them — the run looked clean while telling
  // nobody that three alts still carry Polish. Per-entry rather than a count,
  // because the id is what makes one actionable.
  if (findings.length > 0) {
    console.log(formatFindings(findings))
    warned += 1
  }

  if (APPLY) {
    await payload.update({
      collection: 'media',
      id: entry.id,
      locale: 'en',
      data: { alt: entry.alt },
    })
    written += 1
  } else {
    written += 1
  }
}

const untouched = plDocs.filter(
  (d) => !enEntries.some((e) => e.id === Number(d.id))
)
if (untouched.length > 0) {
  console.log(
    `\n  ! ${untouched.length} media row(s) have no English alt and will fall back to Polish`
  )
}

console.log(
  `\n${written} ${APPLY ? 'written' : 'would be written'}, ${skipped} skipped, ${warned} with warnings.` +
    (APPLY ? '' : ' Dry run — re-run with --apply to write.')
)

process.exit(skipped === 0 ? 0 : 1)
