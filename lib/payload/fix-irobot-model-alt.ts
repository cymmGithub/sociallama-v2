/**
 * Correct the model number in `irobot-edukacja-2-cut.webp`'s alt text.
 *
 *   bun ./lib/payload/fix-irobot-model-alt.ts            report against dev
 *   bun ./lib/payload/fix-irobot-model-alt.ts --apply    write to dev
 *   …--apply --prod                                      write to production
 *
 * The creative is a screenshot of an iRobot Polska post whose headline reads
 * "Nowość 2026 - Poznaj iRobot Roomba MAX 775 Combo". Both locales' alt text
 * says 705. A screen reader on `/case-studies/irobot` therefore announces a
 * product that does not exist, which is exactly the failure alt text is for.
 *
 * Found while re-pointing the branże feed walls (change
 * refresh-branze-feed-walls): the wall copied its alt from this row, and
 * cropping the caption band out of the file to settle the disagreement showed
 * the repository's wording was the correct one.
 *
 * `media.alt` is localized, so this writes `pl` and `en` separately. The guard
 * is the wrong string itself: a row whose alt no longer contains "705" is
 * reported and skipped rather than overwritten, because that means someone has
 * already edited it and this script no longer knows what it is replacing.
 */

import { begin, finish } from '@/lib/payload/media-ops'

const FILE = 'irobot-edukacja-2-cut.webp'

/** One row per locale: the substring that must be present, and its replacement. */
const FIXES = [
  { locale: 'pl' as const, from: 'MAX 705 Combo', to: 'MAX 775 Combo' },
  { locale: 'en' as const, from: 'MAX 705 Combo', to: 'MAX 775 Combo' },
]

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

let pending = 0
let done = 0
let stale = 0

for (const fix of FIXES) {
  const res = await ctx.payload.find({
    collection: 'media',
    where: { filename: { equals: FILE } },
    limit: 1,
    locale: fix.locale,
    fallbackLocale: false,
    overrideAccess: true,
  })
  const doc = res.docs[0]
  if (!doc) {
    console.log(`  ! [${fix.locale}] no media row named ${FILE} — skipped`)
    stale++
    continue
  }
  const alt: string = doc.alt ?? ''

  if (alt.includes(fix.to)) {
    console.log(`  = [${fix.locale}] already says ${fix.to}`)
    done++
    continue
  }
  if (!alt.includes(fix.from)) {
    console.log(
      `  ! [${fix.locale}] alt is "${alt}" — expected it to contain ` +
        `"${fix.from}". Skipped: someone has edited this since the audit.`
    )
    stale++
    continue
  }

  const next = alt.replace(fix.from, fix.to)
  console.log(
    `  ${APPLY ? '~' : 'would'} [${fix.locale}] ${alt}\n      -> ${next}`
  )
  ctx.tags.add('case-studies')
  ctx.tags.add('case-study:irobot')
  pending++
  if (!APPLY) continue

  await ctx.payload.update({
    collection: 'media',
    id: doc.id,
    locale: fix.locale,
    data: { alt: next },
    overrideAccess: true,
  })
  ctx.rollback.push(`media ${FILE} [${fix.locale}] alt: ${next} -> ${alt}`)
}

console.log(`\n${pending} pending, ${done} already done, ${stale} stale`)

await finish(ctx)
