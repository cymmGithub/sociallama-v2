/**
 * Land Emilia's 2026-08-20 creative review on the approach pillars.
 *
 *   bun ./lib/payload/apply-pillar-refresh.ts            report against dev
 *   bun ./lib/payload/apply-pillar-refresh.ts --apply    write to dev
 *   …--apply --prod                                      write to production
 *
 * The plan is `pillar-refresh-plan.ts`, generated from the reviewed `plan.md`;
 * nothing here decides anything. Four kinds of write:
 *
 *   - **pillar creatives** (66 pillars): the whole `media` array is set to the
 *     plan's `to`, guarded by the pillar's tag and by its current contents, in
 *     both locales. Detached rows are kept, never deleted — the spec forbids
 *     deleting a media document anything still references, and a detached
 *     creative is exactly the row a later review might want back.
 *   - **88 uploads**: one row per new creative, alt text in both locales,
 *     filename asserted after the write.
 *   - **7 re-cuts**: new bytes behind an existing filename, so the id and every
 *     reference to it survive.
 *   - **1 cover**: a new row plus a repoint of `cover`, so the displaced cover
 *     survives as an orphan like every other detached creative.
 *
 * ## Re-running is the plan, not a fallback
 *
 * 88 uploads against Blob and Neon take long enough that the shell may return
 * before the run finishes. Every operation reports `already-done` once the
 * target state is there, so the honest end state is "run it until it reports
 * zero pending" — on dev, and again on production.
 *
 * ## What it refuses to do
 *
 * A planned upload whose row carries no `source` is reported and skipped: the
 * case-studies spec requires a recorded origin (Drive file or licence URL) for
 * every replacement creative, and an unsourced picture on a client's case study
 * is the thing this review pass exists to remove.
 */

import {
  begin,
  finish,
  replaceMediaBytes,
  repointPillarMedia,
  repointRelation,
  uploadMedia,
  type Verdict,
} from '@/lib/payload/media-ops'
import {
  BYTE_REPLACES,
  COVERS,
  NEW_MEDIA,
  PILLAR_OPS,
} from '@/lib/payload/pillar-refresh-plan'

const APPLY = process.argv.includes('--apply')
const IS_PROD = process.argv.includes('--prod')

const ctx = await begin({
  script: 'apply-pillar-refresh',
  prod: IS_PROD,
  apply: APPLY,
  host: 'https://sociallama-v2.vercel.app',
})

const byFile = new Map(NEW_MEDIA.map((m) => [m.file, m]))
const unsourced = NEW_MEDIA.filter((m) => !m.source.trim()).map((m) => m.file)

console.log(
  `apply-pillar-refresh — ${PILLAR_OPS.length} pillars, ${NEW_MEDIA.length} new ` +
    `creatives, ${COVERS.length} cover(s), ${BYTE_REPLACES.length} re-cuts\n` +
    `${IS_PROD ? 'PRODUCTION' : 'development'} database, ` +
    `${APPLY ? 'APPLYING' : 'report only'}\n`
)
if (unsourced.length) {
  console.log(
    `! ${unsourced.length} planned upload(s) carry no source and will be ` +
      `skipped: ${unsourced.join(', ')}\n`
  )
}

const counts: Record<Verdict, number> = {
  'already-done': 0,
  pending: 0,
  stale: 0,
  missing: 0,
}
const stale: string[] = []

// —— pillar creatives ————————————————————————————————————————————————————————

let currentSlug = ''
for (const op of PILLAR_OPS) {
  if (op.slug !== currentSlug) {
    currentSlug = op.slug
    console.log(`${op.slug}`)
  }
  const missingSource = op.to.filter(
    (f) => byFile.has(f) && !byFile.get(f)?.source.trim()
  )
  if (missingSource.length) {
    console.log(
      `  ! ${op.tagPl}: ${missingSource.join(', ')} has no recorded source — skipped`
    )
    counts.stale++
    stale.push(`${op.slug} ${op.tagPl}: unsourced creative`)
    continue
  }

  const verdict = await repointPillarMedia(ctx, {
    slug: op.slug,
    pillar: op.pillar,
    tagPl: op.tagPl,
    tagEn: op.tagEn,
    from: op.from,
    to: op.to,
    tags: ['case-studies', `case-study:${op.slug}`],
    resolve: async (file) => {
      const planned = byFile.get(file)
      if (!planned) {
        // A creative the pillar keeps: its row exists, it is only being
        // reordered around the new ones.
        const found = await ctx.payload.find({
          collection: 'media',
          where: { filename: { equals: file } },
          limit: 1,
          overrideAccess: true,
        })
        return found.docs[0] ?? null
      }
      const { doc, created } = await uploadMedia(ctx, {
        file: planned.file,
        fromPath: `public/case-studies/${planned.slug}/${planned.file}`,
        altPl: planned.altPl,
        altEn: planned.altEn,
      })
      if (doc && created) {
        console.log(`    + uploaded ${doc.filename} (id ${doc.id})`)
      }
      return doc
    },
  })
  counts[verdict]++
  if (verdict === 'stale') stale.push(`${op.slug} ${op.tagPl}`)
}

// —— covers —————————————————————————————————————————————————————————————————

if (COVERS.length) {
  console.log('\ncovers')
  for (const cover of COVERS) {
    const current = await ctx.payload.find({
      collection: 'case-studies',
      where: { slug: { equals: cover.slug } },
      limit: 1,
      depth: 1,
      draft: false,
      overrideAccess: true,
    })
    // The displaced cover is whatever the target database holds — dev and prod
    // have disagreed on exactly this field before (the Pracuj and Brześć
    // covers), so it is read rather than assumed, and `repointRelation` still
    // refuses to write if the read finds nothing.
    const from = current.docs[0]?.cover?.filename
    const verdict = await repointRelation(ctx, {
      collection: 'case-studies',
      slug: cover.slug,
      field: 'cover',
      from: from ? [from] : [],
      to: cover.file,
      tags: ['case-studies', `case-study:${cover.slug}`],
      upload: async () => {
        const { doc, created } = await uploadMedia(ctx, {
          file: cover.file,
          fromPath: `public/case-studies/${cover.slug}/${cover.file}`,
          altPl: cover.altPl,
          altEn: cover.altEn,
        })
        if (doc && created) {
          console.log(`    + uploaded ${doc.filename} (id ${doc.id})`)
        }
        return doc
      },
    })
    counts[verdict]++
    if (verdict === 'stale') stale.push(`${cover.slug}.cover`)
  }
}

// —— re-cuts ————————————————————————————————————————————————————————————————

console.log('\nre-cut creatives (bytes replaced in place)')
for (const rc of BYTE_REPLACES) {
  const verdict = await replaceMediaBytes(ctx, {
    file: rc.file,
    fromPath: `public/case-studies/${rc.slug}/${rc.file}`,
    // Spread rather than assign: `exactOptionalPropertyTypes` treats an
    // explicit `undefined` as a different thing from an absent key, and only
    // four of the seven re-cuts change their alt text.
    ...(rc.altPl ? { altPl: rc.altPl } : {}),
    ...(rc.altEn ? { altEn: rc.altEn } : {}),
    tags: ['case-studies', `case-study:${rc.slug}`],
  })
  counts[verdict]++
  if (verdict === 'stale') stale.push(rc.file)
}

// —— report ————————————————————————————————————————————————————————————————

console.log(
  `\n${counts.pending} pending · ${counts['already-done']} already done · ` +
    `${counts.stale} stale · ${counts.missing} missing`
)
if (stale.length) {
  console.log(
    '\nStale — the target database does not hold what the plan expects. ' +
      'Resolve each by hand before re-running:'
  )
  for (const line of stale) console.log(`  ${line}`)
}
if (!APPLY && counts.pending > 0) {
  console.log('\nPass --apply to write.')
}

await finish(ctx)
process.exit(0)
