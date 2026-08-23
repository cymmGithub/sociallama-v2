/**
 * Make prod EN pillar creatives equal prod PL's on the nine studies where they
 * diverged (change: refresh-branze-feed-walls, design D6).
 *
 *   bun ./lib/payload/sync-en-pillar-media.ts            report against dev
 *   bun ./lib/payload/sync-en-pillar-media.ts --apply    write to dev
 *   …--apply --prod                                      write to production
 *
 * `approach` is localized as a WHOLE array, so the August 2026 creative review —
 * done in the admin against the Polish locale — left the English pillars holding
 * the rows PL dropped. `/en/case-studies/skrzat` still shows seven creatives the
 * review removed; `/case-studies/skrzat` shows one.
 *
 * ## Why not `repointPillarMedia`
 *
 * That helper writes both locales at once, but it asserts each locale currently
 * holds the same `from` set. These nine studies are precisely the ones where
 * that stopped being true, so it refuses every pillar. This script inverts the
 * relationship: PL is read as the source of truth and EN is written to match.
 *
 * ## What it copies, and what it will not touch
 *
 * Only `media` ids move. Every EN pillar keeps its own `tag`, `heading` and
 * `body` — the English copy is a translation, not a stale duplicate, and
 * overwriting it would undo real translation work. PL is read with `draft: true`
 * like every other ops script, and the `_status` it read is logged, so a run
 * that copied from an unreviewed draft is visible afterwards.
 *
 * ## Guards
 *
 * Index alignment is the whole assumption: pillar `i` in EN must be the
 * translation of pillar `i` in PL. Two things are checked before any write, and
 * either one aborts that study rather than guessing:
 *
 *   - the two locales carry the same number of pillars;
 *   - wherever PL tags a pillar, EN tags it too. Tags are language-specific so
 *     the values cannot be compared, but a PL pillar with a tag facing an EN
 *     pillar without one means the arrays no longer line up.
 *
 * Fix either in the admin and re-run. Idempotent: a study whose EN media already
 * equal PL's reports `already-done`, so the honest end state is "run it until it
 * reports zero pending".
 */

import { begin, finish, idOf } from '@/lib/payload/media-ops'

/**
 * The nine studies whose prod EN pillar media diverged from PL, from the
 * 2026-08-23 `dump-case-study-imagery --prod` snapshot. Not a discovery pass:
 * an explicit list is what makes the dry-run reviewable and keeps a future
 * divergence somewhere else out of this run.
 */
const SLUGS = [
  'ariadna',
  'dolina-charlotty',
  'dynamic-development',
  'entelo',
  'getaway',
  'personal-effect',
  'riviera',
  'skibooking',
  'skrzat',
] as const

type Verdict = 'already-done' | 'pending' | 'stale' | 'missing'

const APPLY = process.argv.includes('--apply')
const IS_PROD = process.argv.includes('--prod')

const ctx = await begin({
  script: 'sync-en-pillar-media',
  prod: IS_PROD,
  apply: APPLY,
  host: 'https://sociallama-v2.vercel.app',
})

console.log(
  `sync-en-pillar-media — ${SLUGS.length} studies\n` +
    `${IS_PROD ? 'PRODUCTION' : 'development'} database, ` +
    `${APPLY ? 'APPLYING' : 'report only'}\n`
)

// biome-ignore lint/suspicious/noExplicitAny: Payload's doc shape
type Doc = any

const filenameOf = (v: unknown): string =>
  v && typeof v === 'object' && 'filename' in v
    ? ((v as { filename: unknown }).filename as string)
    : String(idOf(v) ?? '?')

const namesOf = (pillar: Doc): string[] =>
  (pillar?.media ?? []).map((m: unknown) => filenameOf(m))

const idsOf = (pillar: Doc): number[] =>
  (pillar?.media ?? [])
    .map((m: unknown) => idOf(m))
    .filter((id: number | null): id is number => id !== null)

const same = (a: readonly unknown[], b: readonly unknown[]) =>
  a.length === b.length && a.every((v, i) => v === b[i])

async function load(slug: string, locale: 'pl' | 'en'): Promise<Doc | null> {
  const res = await ctx.payload.find({
    collection: 'case-studies',
    where: { slug: { equals: slug } },
    limit: 1,
    draft: true,
    locale,
    fallbackLocale: false,
    depth: 1, // media populated so the report can name files, not ids
    overrideAccess: true,
  })
  return res.docs[0] ?? null
}

async function syncStudy(slug: string): Promise<Verdict> {
  const pl = await load(slug, 'pl')
  const en = await load(slug, 'en')
  if (!(pl && en)) {
    console.log(`  ! ${slug}: no case study with that slug — skipped`)
    return 'missing'
  }

  const plPillars: Doc[] = pl.approach ?? []
  const enPillars: Doc[] = en.approach ?? []

  if (plPillars.length !== enPillars.length) {
    console.log(
      `  ! ${slug}: PL has ${plPillars.length} pillars, EN has ` +
        `${enPillars.length} — skipped, the arrays no longer line up. Fix in ` +
        'the admin and re-run.'
    )
    return 'stale'
  }

  const untagged = plPillars
    .map((p, i) => ({ i, plTag: p.tag, enTag: enPillars[i]?.tag }))
    .filter((row) => row.plTag && !row.enTag)
  if (untagged.length) {
    console.log(
      `  ! ${slug}: EN pillar(s) ${untagged.map((r) => r.i).join(', ')} carry ` +
        `no tag where PL has ${untagged.map((r) => r.plTag).join(', ')} — ` +
        'skipped, the arrays no longer line up.'
    )
    return 'stale'
  }

  if (plPillars.every((p, i) => same(idsOf(p), idsOf(enPillars[i])))) {
    return 'already-done'
  }

  console.log(`${slug} (PL read as ${pl._status ?? 'unknown'})`)
  for (const [i, plPillar] of plPillars.entries()) {
    const from = namesOf(enPillars[i])
    const to = namesOf(plPillar)
    if (same(from, to)) continue
    console.log(
      `  ${APPLY ? '~' : 'would'} pillar ${i} [${enPillars[i]?.tag ?? 'no tag'}]: ` +
        `${from.join(', ') || '(none)'} -> ${to.join(', ') || '(none)'}`
    )
    // Reversed on purpose: `finish` prints these as the undo instruction, and
    // there is no `git revert` for a database write.
    if (APPLY) {
      ctx.rollback.push(
        `${slug} pillar ${i}: ${to.join(', ') || '(none)'} -> ${from.join(', ') || '(none)'}`
      )
    }
  }

  ctx.tags.add('case-studies')
  ctx.tags.add(`case-study:${slug}`)
  if (!APPLY) return 'pending'

  // Rebuild the whole array: `approach` is localized as a unit, so a partial
  // write would blank the pillars it omits. EN keeps its own tag, heading and
  // body; only `media` comes from PL. Populated relations reduce back to ids.
  const approach = enPillars.map((pillar, i) => ({
    ...pillar,
    media: idsOf(plPillars[i]),
  }))
  await ctx.payload.update({
    collection: 'case-studies',
    id: en.id,
    locale: 'en',
    // No `draft: true`: these studies are published, and the published English
    // page is what still shows the removed creatives.
    data: { approach } as Doc,
    overrideAccess: true,
  })
  return 'pending'
}

const counts: Record<Verdict, number> = {
  'already-done': 0,
  pending: 0,
  stale: 0,
  missing: 0,
}

for (const slug of SLUGS) {
  counts[await syncStudy(slug)]++
}

console.log(
  `\n${counts.pending} pending, ${counts['already-done']} already done, ` +
    `${counts.stale} stale, ${counts.missing} missing`
)

await finish(ctx)
