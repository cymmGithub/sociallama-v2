/**
 * Uploads the blog cover-art library as new media rows (change
 * `redesign-blog-covers`, task 4.1).
 *
 *   bun run payload:upload:cover-art --prod            dry run
 *   bun run payload:upload:cover-art --prod --apply    write
 *
 * ## Both locales, in one go
 *
 * `media.alt` is localized and the blog reads with `fallbackLocale: false`
 * (design D6), so a row created in one locale renders `alt=""` in the other —
 * silently, because no sighted reader ever sees it. Each row is therefore
 * created with the Polish alt and immediately updated with the English one,
 * and the run refuses to report success unless both came back non-empty.
 *
 * ## `alts.en.json` moves with the database
 *
 * The alt gate treats `content/media/alts.en.json` as source of truth: the next
 * `payload:translate:alt --apply` projects that file onto the database. A row
 * written here but missing from the file would have its English alt reverted on
 * the next run, so the file is appended in the same step — and the run aborts
 * before touching the database if the file cannot be read.
 *
 * ## Idempotent by media id
 *
 * `mediaId` in the assignment map is the record of what already exists. A piece
 * that has one is skipped, so re-running after a partial failure uploads only
 * what is missing rather than creating duplicate rows.
 *
 * ## Prod only
 *
 * The local dev DB holds 1 of the 22 target posts. Uploading there would
 * succeed and be useless, so `--prod` is required rather than optional.
 */

import { readFile, writeFile } from 'node:fs/promises'

const MAP_PATH = 'content/media/cover-assignments.json'
const ALTS_EN_PATH = 'content/media/alts.en.json'
const APPLY = process.argv.includes('--apply')

if (!process.argv.includes('--prod')) {
  throw new Error(
    'payload:upload:cover-art requires --prod: the library serves 22 posts that ' +
      'only exist in production, so a local run is a silent no-op.'
  )
}
const prodUrl = process.env.DATABASE_URL_PROD
if (!prodUrl) {
  throw new Error('payload:upload:cover-art --prod requires DATABASE_URL_PROD')
}
process.env.DATABASE_URL = prodUrl
;(process.env as Record<string, string>).NODE_ENV = 'production'

const dbHost = new URL(prodUrl.replace(/^postgres(?:ql)?:/, 'http:')).hostname

interface Piece {
  category: string
  mediaId: number | null
  file: string
  altPl: string
  altEn: string
}
interface Map {
  library: Record<string, Piece>
  assignments: Record<string, { piece: string }>
}

const map = JSON.parse(await readFile(MAP_PATH, 'utf8')) as Map

interface AltEntry {
  id: number
  filename: string
  source: string
  alt: string
}
const altsEn = JSON.parse(await readFile(ALTS_EN_PATH, 'utf8')) as AltEntry[]
if (!Array.isArray(altsEn)) {
  throw new Error(
    `${ALTS_EN_PATH} is not an array — refusing to touch the database`
  )
}

// Guard before any write: every piece needs a readable file and alt in both
// locales. A missing alt is the failure this script exists to prevent, so it
// is fatal here rather than a warning later.
const rejected: string[] = []
for (const [key, piece] of Object.entries(map.library)) {
  if (!piece.file) {
    rejected.push(`${key}: no file`)
    continue
  }
  try {
    await readFile(piece.file)
  } catch {
    rejected.push(`${key}: cannot read ${piece.file}`)
  }
  if (!piece.altPl?.trim()) {
    rejected.push(`${key}: altPl is empty`)
  }
  if (!piece.altEn?.trim()) {
    rejected.push(`${key}: altEn is empty`)
  }
  if (!Object.values(map.assignments).some((a) => a.piece === key)) {
    rejected.push(`${key}: not assigned to any post`)
  }
}
if (rejected.length > 0) {
  console.error(
    `Refusing to run:\n${rejected.map((r) => `  ✗ ${r}`).join('\n')}`
  )
  process.exit(1)
}

const { default: config } = await import('@payload-config')
const { getPayload } = await import('payload')
const payload = await getPayload({ config })

console.log(
  `${APPLY ? 'Uploading' : 'DRY RUN — would upload'} cover art to: ${dbHost}\n`
)

let created = 0
let skipped = 0
const appended: AltEntry[] = []

for (const [key, piece] of Object.entries(map.library)) {
  if (piece.mediaId !== null) {
    console.log(
      `  = ${key.padEnd(8)} already media ${piece.mediaId} — skipping`
    )
    skipped += 1
    continue
  }

  if (!APPLY) {
    console.log(`  + ${key.padEnd(8)} ${piece.file}`)
    console.log(`      pl: ${piece.altPl}`)
    console.log(`      en: ${piece.altEn}`)
    continue
  }

  const row = await payload.create({
    collection: 'media',
    locale: 'pl',
    data: { alt: piece.altPl },
    filePath: piece.file,
  })

  await payload.update({
    collection: 'media',
    id: row.id,
    locale: 'en',
    data: { alt: piece.altEn },
  })

  // Read both locales back rather than trusting the writes: `fallbackLocale`
  // false is what the blog uses, so this is the shape the pages will see.
  const [pl, en] = [
    await payload.findByID({
      collection: 'media',
      id: row.id,
      locale: 'pl',
      fallbackLocale: false,
    }),
    await payload.findByID({
      collection: 'media',
      id: row.id,
      locale: 'en',
      fallbackLocale: false,
    }),
  ]
  if (!(pl.alt?.trim() && en.alt?.trim())) {
    throw new Error(
      `media ${row.id} (${key}) came back with an empty alt — pl:"${pl.alt}" en:"${en.alt}"`
    )
  }

  piece.mediaId = Number(row.id)
  appended.push({
    id: Number(row.id),
    filename: String(row.filename ?? ''),
    source: piece.altPl,
    alt: piece.altEn,
  })
  created += 1
  console.log(`  + ${key.padEnd(8)} media ${row.id} ← ${piece.file}`)
}

if (APPLY && created > 0) {
  // Both files are rewritten together: the map records what exists, the alts
  // file keeps the gate from reverting the English alt on its next run.
  await writeFile(MAP_PATH, `${JSON.stringify(map, null, 2)}\n`)
  await writeFile(
    ALTS_EN_PATH,
    `${JSON.stringify([...altsEn, ...appended], null, 2)}\n`
  )
  console.log(`\n  ${MAP_PATH} updated with ${created} media id(s)`)
  console.log(
    `  ${ALTS_EN_PATH} appended (${altsEn.length} → ${altsEn.length + appended.length})`
  )
}

console.log(
  `\n${APPLY ? 'Created' : 'Would create'} ${APPLY ? created : Object.values(map.library).filter((p) => p.mediaId === null).length} row(s)` +
    (skipped > 0 ? `, skipped ${skipped} already uploaded` : '')
)

if (!APPLY) {
  console.log('\nRe-run with --apply to write.')
}

process.exit(0)
