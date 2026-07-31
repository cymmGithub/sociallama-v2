/**
 * Repoints the 22 text-bearing blog covers at the art library (change
 * `redesign-blog-covers`, task 4.2). Mirrors `repoint-en-images.ts`.
 *
 *   bun run payload:repoint:covers --prod            dry run
 *   bun run payload:repoint:covers --prod --apply    write
 *
 * ## Relation repoint, never file replacement
 *
 * Design D5. Replacing the file on an existing media row would be destructive
 * and, for at least one of these ids, wrong twice over: a cover row may also be
 * referenced as an in-body image, so overwriting its file would silently change
 * a post body. Pointing the `cover` relation at a new row leaves every old row
 * intact, which is also what makes this reversible — rollback is repointing
 * back, and the old→new pairs are printed for exactly that.
 *
 * ## `cover` is shared across locales, and that is the point
 *
 * Unlike `posts.content`, `cover` is NOT localized: one write serves both the
 * Polish and English page. For the English screenshots that was a blocker (see
 * the audit's `blockedBy` entries). Here it is the design: library art carries
 * no language, so sharing it across locales is correct rather than a compromise.
 *
 * ## `seo.ogImage` is never touched
 *
 * Where it is unset, the new cover flows into OG automatically. Where an editor
 * set one deliberately, that decision outranks this migration.
 *
 * ## Why the count assertion is not paranoia
 *
 * The local dev database holds 1 of these 22 posts. Run without `--prod` it
 * would find one post, repoint it, report success, and change nothing that
 * matters — the silent-empty-run failure this change's design calls out. So
 * `--prod` is mandatory and the script refuses to write unless it matched
 * exactly the expected posts.
 *
 * ## No `draft: true`
 *
 * Same reason as `translate-post.ts` and `repoint-en-images.ts`: all 79 posts
 * are published and the collection has drafts enabled, so a draft write files
 * the change where the live page never reads it.
 */

import { readFile } from 'node:fs/promises'

const MAP_PATH = 'content/media/cover-assignments.json'
const APPLY = process.argv.includes('--apply')

if (!process.argv.includes('--prod')) {
  throw new Error(
    'payload:repoint:covers requires --prod: the local database holds 1 of the ' +
      '22 target posts, so a local run silently succeeds and changes nothing.'
  )
}
const prodUrl = process.env.DATABASE_URL_PROD
if (!prodUrl) {
  throw new Error('payload:repoint:covers --prod requires DATABASE_URL_PROD')
}
process.env.DATABASE_URL = prodUrl
;(process.env as Record<string, string>).NODE_ENV = 'production'

const dbHost = new URL(prodUrl.replace(/^postgres(?:ql)?:/, 'http:')).hostname

interface Assignment {
  piece: string
  slug: string
  category: string
  hubRank: number
  group: string
}
interface Map {
  library: Record<string, { mediaId: number | null; file: string }>
  assignments: Record<string, Assignment>
}

const map = JSON.parse(await readFile(MAP_PATH, 'utf8')) as Map
const entries = Object.entries(map.assignments)

// Guard before the database: every assignment must resolve to an uploaded row.
const rejected: string[] = []
if (entries.length !== 22) {
  rejected.push(`assignment map has ${entries.length} entries, expected 22`)
}
for (const [oldId, a] of entries) {
  const piece = map.library[a.piece]
  if (!piece) {
    rejected.push(`${oldId}: unknown piece "${a.piece}"`)
  } else if (piece.mediaId === null) {
    rejected.push(
      `${oldId}: piece "${a.piece}" has no mediaId — run payload:upload:cover-art --prod --apply first`
    )
  } else if (piece.mediaId === Number(oldId)) {
    rejected.push(`${oldId}: piece "${a.piece}" points at the id it replaces`)
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
  `${APPLY ? 'Repointing' : 'DRY RUN — would repoint'} blog covers on: ${dbHost}\n`
)

const READ = {
  depth: 0,
  fallbackLocale: false,
  pagination: false,
  limit: 0,
} as const

const published = await payload.find({
  collection: 'posts',
  where: { _status: { equals: 'published' } },
  locale: 'pl',
  ...READ,
  select: { slug: true, cover: true, seo: true },
})

const bySlug = new global.Map(published.docs.map((d) => [String(d.slug), d]))

interface Plan {
  oldId: number
  newId: number
  postId: number | string
  slug: string
  piece: string
  hasOwnOg: boolean
}
const plan: Plan[] = []
const problems: string[] = []

for (const [oldId, a] of entries) {
  const doc = bySlug.get(a.slug)
  if (!doc) {
    problems.push(`${a.slug}: not found among published posts`)
    continue
  }
  const cover = doc.cover
  const currentId =
    cover && typeof cover === 'object'
      ? Number(cover.id)
      : Number(cover ?? Number.NaN)

  // The map is keyed by the id it expects to find. A mismatch means the cover
  // moved since the audit — repointing anyway would discard whatever replaced
  // it, so stop instead.
  if (currentId !== Number(oldId)) {
    problems.push(
      `${a.slug}: cover is media ${currentId}, map expects ${oldId} — cover changed since the audit`
    )
    continue
  }

  const og = (doc.seo as { ogImage?: unknown } | null | undefined)?.ogImage
  plan.push({
    oldId: Number(oldId),
    // The guard above already rejected an unknown piece or a null mediaId; this
    // re-proves it rather than asserting, so a future edit cannot write NaN.
    newId: Number(map.library[a.piece]?.mediaId ?? Number.NaN),
    postId: doc.id,
    slug: a.slug,
    piece: a.piece,
    hasOwnOg: og !== null && og !== undefined,
  })
}

if (problems.length > 0) {
  console.error(
    `Refusing to write — ${problems.length} post(s) do not match the map:\n` +
      problems.map((p) => `  ✗ ${p}`).join('\n')
  )
  process.exit(1)
}

if (plan.length !== 22) {
  console.error(
    `Refusing to write: matched ${plan.length} posts, expected exactly 22`
  )
  process.exit(1)
}

console.log(
  `Matched all 22 posts. ${published.docs.length} published posts scanned.\n`
)
console.log('  old → new   piece      post')
for (const p of plan.sort((x, y) => x.oldId - y.oldId)) {
  const og = p.hasOwnOg ? '  [has own seo.ogImage — unchanged]' : ''
  console.log(
    `  ${String(p.oldId).padStart(3)} → ${String(p.newId).padStart(3)}   ${p.piece.padEnd(8)}   ${p.slug}${og}`
  )
}

const withOwnOg = plan.filter((p) => p.hasOwnOg).length
console.log(
  `\n${withOwnOg} of 22 posts set seo.ogImage explicitly; those social previews stay as they are.`
)

if (!APPLY) {
  console.log('\nDRY RUN — nothing written. Re-run with --apply to write.')
  process.exit(0)
}

let written = 0
for (const p of plan) {
  await payload.update({
    collection: 'posts',
    id: p.postId,
    locale: 'pl',
    data: { cover: p.newId },
  })

  // Read back in BOTH locales: `cover` is unlocalized, so a correct write shows
  // the new id on the English page too. If it does not, the assumption this
  // whole change rests on is wrong and the run should stop loudly.
  const [pl, en] = [
    await payload.findByID({
      collection: 'posts',
      id: p.postId,
      depth: 0,
      locale: 'pl',
      fallbackLocale: false,
    }),
    await payload.findByID({
      collection: 'posts',
      id: p.postId,
      depth: 0,
      locale: 'en',
      fallbackLocale: false,
    }),
  ]
  const readBack = (d: typeof pl) =>
    d.cover && typeof d.cover === 'object'
      ? Number(d.cover.id)
      : Number(d.cover)
  if (readBack(pl) !== p.newId || readBack(en) !== p.newId) {
    throw new Error(
      `${p.slug}: cover read back as pl:${readBack(pl)} en:${readBack(en)}, expected ${p.newId}`
    )
  }

  written += 1
  console.log(`  ✓ ${p.slug} — cover ${p.oldId} → ${p.newId}`)
}

console.log(
  `\nRepointed ${written} covers. Old rows are untouched; rollback is repointing back.`
)
process.exit(0)
