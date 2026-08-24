/**
 * Correct the model number in `irobot-edukacja-2-cut.webp`'s alt text.
 *
 *   bun ./lib/payload/fix-irobot-model-alt.ts            report against dev
 *   bun ./lib/payload/fix-irobot-model-alt.ts --apply    write to dev
 *   …--apply --prod                                      write to production
 *
 * The creative is a screenshot of an iRobot Polska post whose headline reads
 * "Nowość 2026 - Poznaj iRobot Roomba MAX 775 Combo". Both locales' alt said
 * 705, so a screen reader on `/case-studies/irobot` announced a product that
 * does not exist — which is exactly the failure alt text is for.
 *
 * Found while re-pointing the branże feed walls (change
 * refresh-branze-feed-walls): the wall copied its alt from this row, and
 * cropping the caption band out of the file to settle the disagreement showed
 * the repository's wording was the correct one.
 *
 * The guard lives in `updateMediaAlt`: the wrong string is also the
 * precondition, so a row someone has already edited is reported and skipped
 * rather than overwritten. Ran to zero pending on dev and prod 2026-08-23.
 */

import {
  begin,
  finish,
  updateMediaAlt,
  type Verdict,
} from '@/lib/payload/media-ops'

const FILE = 'irobot-edukacja-2-cut.webp'
const LOCALES = ['pl', 'en'] as const

const APPLY = process.argv.includes('--apply')
const IS_PROD = process.argv.includes('--prod')

const ctx = await begin({
  script: 'fix-irobot-model-alt',
  prod: IS_PROD,
  apply: APPLY,
  host: 'https://sociallama-v2.vercel.app',
})

console.log(
  `fix-irobot-model-alt — ${FILE}\n` +
    `${IS_PROD ? 'PRODUCTION' : 'development'} database, ` +
    `${APPLY ? 'APPLYING' : 'report only'}\n`
)

const counts: Record<Verdict, number> = {
  'already-done': 0,
  pending: 0,
  stale: 0,
  missing: 0,
}

for (const locale of LOCALES) {
  counts[
    await updateMediaAlt(ctx, {
      file: FILE,
      locale,
      from: 'MAX 705 Combo',
      to: 'MAX 775 Combo',
      tags: ['case-studies', 'case-study:irobot'],
    })
  ]++
}

console.log(
  `\n${counts.pending} pending, ${counts['already-done']} already done, ` +
    `${counts.stale} stale, ${counts.missing} missing`
)

await finish(ctx)
