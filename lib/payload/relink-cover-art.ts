/**
 * Publishes the current cover-art library and points every assigned post at it
 * (change `redesign-blog-covers`).
 *
 *   bun run payload:relink:cover-art --prod            dry run
 *   bun run payload:relink:cover-art --prod --apply    write
 *
 * ## Map-driven, not history-driven
 *
 * `repoint-covers.ts` moves posts off their ORIGINAL covers and asserts each one
 * still carries the id the map expects — correct exactly once, and wrong forever
 * after. This script instead treats `cover-assignments.json` as the desired
 * state: every assignment names a post and the piece it should end on, and the
 * script makes that true. That covers all three things a later revision needs —
 * new artwork for an existing piece, a brand-new piece, and a post reassigned
 * from one piece to another — in a single pass, and it is safely re-runnable.
 *
 * ## New rows, never overwritten files
 *
 * Design D5. Revised art is uploaded as a NEW media row and the relation moves;
 * the previous rows stay intact and simply become unreferenced, so rolling back
 * is pointing the relation at the old id again. The storage layer forces this
 * anyway: dev and prod share one Vercel Blob store and it refuses to overwrite
 * an existing blob key, hence the versioned filenames.
 *
 * ## Alt text
 *
 * Written in both locales and read back with `fallbackLocale: false` — the shape
 * the blog actually queries — and `alts.en.json` is appended in the same step so
 * the alt gate does not revert the English string on its next run.
 */

import { copyFile, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { targetProdEnv } from '@/lib/payload/prod-env'

const MAP_PATH = 'content/media/cover-assignments.json'
const ALTS_EN_PATH = 'content/media/alts.en.json'
const STAGING = '.cover-art-staging'
const APPLY = process.argv.includes('--apply')

// `--only t-227,t-235` restricts the run to the named pieces. Without it every
// in-use piece is re-uploaded, which is right for the first publish and wrong
// for a revision: redrawing one piece would otherwise mint a fresh media row
// for all sixteen and repoint every post at art that did not change.
const onlyArg = process.argv.find((a) => a.startsWith('--only'))
const ONLY = onlyArg
  ? new Set(
      (onlyArg.includes('=')
        ? onlyArg.slice(onlyArg.indexOf('=') + 1)
        : (process.argv[process.argv.indexOf(onlyArg) + 1] ?? '')
      )
        .split(',')
        .map((k) => k.trim())
        .filter(Boolean)
    )
  : null
if (ONLY?.size === 0) {
  throw new Error('--only needs a comma-separated list of library piece keys')
}

if (!process.argv.includes('--prod')) {
  throw new Error(
    'payload:relink:cover-art requires --prod: the library serves posts that only ' +
      'exist in production.'
  )
}
targetProdEnv('payload:relink:cover-art', { blob: true })

const dbHost = new URL(
  (process.env.DATABASE_URL ?? '').replace(/^postgres(?:ql)?:/, 'http:')
).hostname

interface Piece {
  category: string
  mediaId: number | null
  file: string
  altPl: string
  altEn: string
  revision?: number
}
interface Map {
  library: Record<string, Piece>
  assignments: Record<string, { piece: string; slug: string }>
}

const map = JSON.parse(await readFile(MAP_PATH, 'utf8')) as Map
const altsEn = JSON.parse(await readFile(ALTS_EN_PATH, 'utf8')) as {
  id: number
  filename: string
  source: string
  alt: string
}[]

const assignments = Object.entries(map.assignments)
const rejected: string[] = []
if (assignments.length !== 23) {
  rejected.push(`assignment map has ${assignments.length} entries, expected 23`)
}
for (const [key, piece] of Object.entries(map.library)) {
  try {
    await readFile(piece.file)
  } catch {
    rejected.push(`${key}: cannot read ${piece.file}`)
  }
  if (!(piece.altPl?.trim() && piece.altEn?.trim())) {
    rejected.push(`${key}: alt missing in one or both locales`)
  }
}
for (const [oldId, a] of assignments) {
  if (!map.library[a.piece]) {
    rejected.push(`${oldId}: unknown piece "${a.piece}"`)
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
  `${APPLY ? 'Relinking' : 'DRY RUN — would relink'} cover art on: ${dbHost}\n`
)

const published = await payload.find({
  collection: 'posts',
  where: { _status: { equals: 'published' } },
  locale: 'pl',
  fallbackLocale: false,
  depth: 0,
  pagination: false,
  limit: 0,
  select: { slug: true, cover: true },
})
const bySlug = new global.Map(published.docs.map((d) => [String(d.slug), d]))
const coverOf = (d: unknown) => {
  const c = (d as { cover?: unknown })?.cover
  return c && typeof c === 'object'
    ? Number((c as { id: number }).id)
    : Number(c)
}

const missing = assignments.filter(([, a]) => !bySlug.has(a.slug))
if (missing.length > 0) {
  console.error(
    `Refusing to write — ${missing.length} assigned post(s) not found:\n` +
      missing.map(([, a]) => `  ✗ ${a.slug}`).join('\n')
  )
  process.exit(1)
}

const uses = new global.Map<string, number>()
for (const [, a] of assignments) {
  uses.set(a.piece, (uses.get(a.piece) ?? 0) + 1)
}

// A library piece nobody is assigned to still belongs in the library — it is
// there for a future post — but uploading it would create a media row that
// nothing references. Skip it; it publishes when something first uses it.
const toUpload = Object.entries(map.library).filter(
  ([key]) => (uses.get(key) ?? 0) > 0 && (ONLY?.has(key) ?? true)
)
const idle = Object.keys(map.library).filter((key) => !uses.get(key))

if (ONLY) {
  const unknown = [...ONLY].filter((key) => !map.library[key])
  if (unknown.length > 0) {
    throw new Error(
      `--only names pieces not in the library: ${unknown.join(', ')}`
    )
  }
  const noPosts = [...ONLY].filter((key) => !uses.get(key))
  if (noPosts.length > 0) {
    throw new Error(
      `--only names pieces no post uses: ${noPosts.join(', ')} — uploading them ` +
        'would create media rows nothing references'
    )
  }
  console.log(
    `--only ${[...ONLY].join(', ')} — every other piece is left alone.\n`
  )
}

console.log(
  `${published.docs.length} published posts scanned, all 22 assignments resolved.\n`
)
for (const [key, piece] of toUpload) {
  const from = piece.mediaId === null ? '(new piece)' : `media ${piece.mediaId}`
  console.log(
    `  ${key.padEnd(8)} ${from.padEnd(12)} → (new row)   ${uses.get(key)} post(s)`
  )
}
if (idle.length > 0) {
  console.log(
    `\nNot uploaded — in the library but assigned to nothing: ${idle.join(', ')}`
  )
}

const moves = assignments.filter(([, a]) => {
  const cur = coverOf(bySlug.get(a.slug))
  return cur !== map.library[a.piece]?.mediaId
})
if (moves.length > 0) {
  console.log('\nReassignments (post changes piece, not just artwork):')
  for (const [, a] of moves) {
    console.log(`  ${a.slug} → ${a.piece}`)
  }
}

if (!APPLY) {
  console.log('\nDRY RUN — nothing written. Re-run with --apply to write.')
  process.exit(0)
}

await mkdir(STAGING, { recursive: true })
const appended: typeof altsEn = []
const newIds = new global.Map<string, number>()

for (const [key, piece] of toUpload) {
  const revision = (piece.revision ?? 1) + 1
  const staged = `${STAGING}/${key}-v${revision}.jpg`
  await copyFile(piece.file, staged)

  const row = await payload.create({
    collection: 'media',
    locale: 'pl',
    data: { alt: piece.altPl },
    filePath: staged,
  })
  await payload.update({
    collection: 'media',
    id: row.id,
    locale: 'en',
    data: { alt: piece.altEn },
  })
  const enRow = await payload.findByID({
    collection: 'media',
    id: row.id,
    locale: 'en',
    fallbackLocale: false,
  })
  if (!enRow.alt?.trim()) {
    throw new Error(`media ${row.id} (${key}) has an empty English alt`)
  }

  newIds.set(key, Number(row.id))
  console.log(`  + ${key.padEnd(8)} media ${piece.mediaId ?? '—'} → ${row.id}`)
  piece.mediaId = Number(row.id)
  piece.revision = revision
  appended.push({
    id: Number(row.id),
    filename: String(row.filename ?? ''),
    source: piece.altPl,
    alt: piece.altEn,
  })
}

console.log('')
let moved = 0
for (const [, a] of assignments) {
  // A restricted run leaves every other post on the cover it already carries.
  if (ONLY && !ONLY.has(a.piece)) {
    continue
  }
  const post = bySlug.get(a.slug)
  const want = newIds.get(a.piece)
  // Both were proven above — every assigned slug resolved, every assigned piece
  // uploaded — but prove it again rather than assert, so a future edit that
  // breaks either guard fails here instead of writing a null cover.
  if (!post) {
    throw new Error(`${a.slug}: post disappeared between planning and writing`)
  }
  if (want === undefined) {
    throw new Error(`${a.slug}: piece "${a.piece}" was never uploaded`)
  }
  await payload.update({
    collection: 'posts',
    id: post.id,
    locale: 'pl',
    data: { cover: want },
  })
  // `cover` is unlocalized, so a correct write shows on the English page too.
  const en = await payload.findByID({
    collection: 'posts',
    id: post.id,
    depth: 0,
    locale: 'en',
    fallbackLocale: false,
  })
  if (coverOf(en) !== want) {
    throw new Error(
      `${a.slug}: cover read back as ${coverOf(en)} on EN, expected ${want}`
    )
  }
  moved += 1
  console.log(`  ✓ ${a.slug} → ${a.piece} (${want})`)
}

await rm(STAGING, { recursive: true, force: true })
await writeFile(MAP_PATH, `${JSON.stringify(map, null, 2)}\n`)
await writeFile(
  ALTS_EN_PATH,
  `${JSON.stringify([...altsEn, ...appended], null, 2)}\n`
)

console.log(`\nMoved ${moved} post(s) onto the current library.`)
console.log(
  'Previous rows are intact and now unreferenced — rollback is pointing back.'
)
process.exit(0)
