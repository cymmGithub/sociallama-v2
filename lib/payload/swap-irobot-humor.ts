/**
 * Replaces the creatives in iRobot's `#HUMOR` pillar with the parrot still.
 *
 * Ania's 2026-08-19 review asked for the pillar's photos to go and be replaced
 * by one supplied frame — the green parrot with the iRobot bug over it. The two
 * that leave are `irobot-gallery-3-anon-cut.webp` and
 * `irobot-gallery-6-anon-cut.webp`, creator videos whose people are not ours to
 * publish. (The cover swap in the same review item is a byte replacement on the
 * existing row, so it goes through refresh-case-study-creatives.ts instead.)
 *
 * Unlike the other imagery scripts this one CREATES a media document: the
 * replacement is a new file, not a re-cut of an existing row. It is created
 * once and then found by filename, so re-running is safe.
 *
 * That create is the one dangerous step here, because Payload's
 * `getSafeFileName` bumps a name that is already taken — and it consults the
 * local `media/` directory even on a --prod run whose bytes go to Vercel Blob.
 * A dev run therefore leaves a file on disk that silently renames the
 * PRODUCTION upload to `<stem>-1.<ext>`, and the log prints the name that was
 * REQUESTED, not the one stored. The pre-flight below refuses to start while
 * that collision exists; the check after the create is the belt to its braces,
 * and deletes the bumped row so a failure leaves nothing behind.
 *
 * Keyed the same way as detach-comment-screenshots.ts, and for the same
 * reasons: filenames rather than media ids (ids are per-database), the pillar
 * tag as a GUARD rather than a selector (a file found under an unexpected tag
 * aborts the run), and every write repeated per locale because `approach` is
 * localized as a whole array.
 *
 * The parrot is a flat frame, not a phone mockup, so it takes the page's own
 * 18px `.shot` radius and needs no baked alpha corner — see the corner-radius
 * note in CLAUDE.md before assuming otherwise.
 *
 * The two detached rows are left in place. Both are referenced by this pillar
 * alone (verified with dump-case-study-imagery.ts), so they are true orphans
 * afterwards and can be deleted separately once the page has been reviewed.
 *
 * Run:  bun ./lib/payload/swap-irobot-humor.ts            # dry run, dev DB
 *       bun ./lib/payload/swap-irobot-humor.ts --apply
 *       bun ./lib/payload/swap-irobot-humor.ts --apply --prod
 *
 * NOTE: writes bypass the deployed app, so the revalidation hooks cannot reach
 * the live cache — after running against production, redeploy (or revalidate).
 */

import fs from 'node:fs'
import path from 'node:path'

const APPLY = process.argv.includes('--apply')

if (process.argv.includes('--prod')) {
  const { targetProdEnv } = await import('./prod-env')
  targetProdEnv('swap-irobot-humor', { blob: true })
}

const SLUG = 'irobot'
const TAGS = { pl: '#HUMOR', en: '#HUMOR' } as const

/** Exactly what the pillar held when the plan was written. */
const REMOVING = new Set([
  'irobot-gallery-3-anon-cut.webp',
  'irobot-gallery-6-anon-cut.webp',
])

const REPLACEMENT = {
  file: 'public/case-studies/irobot/irobot-humor-parrot.jpg',
  alt: {
    pl: 'Kadr z humorystycznego filmu iRobot — zielona papuga w mieszkaniu, na środku zielone logo iRobot',
    en: 'Frame from an iRobot humour video — a green parrot indoors, the green iRobot mark over the centre',
  },
} as const

const LOCALES = ['pl', 'en'] as const

const dbHost = new URL(
  (process.env.DATABASE_URL ?? '').replace(/^postgres(?:ql)?:/, 'http:')
).hostname

const { default: config } = await import('@payload-config')
const { getPayload } = await import('payload')
const payload = await getPayload({ config })

console.log(
  `${APPLY ? 'applying to' : 'dry run against'} ${dbHost}\n` +
    '(pass --apply to write)\n'
)

const filename = path.basename(REPLACEMENT.file)
let changes = 0

// —— The replacement media document ————————————————————————————————————————————

const found = await payload.find({
  collection: 'media',
  where: { filename: { equals: filename } },
  limit: 2,
  depth: 0,
  locale: 'pl',
})
if (found.docs.length > 1) {
  throw new Error(
    `${filename}: ${found.docs.length} media rows — refusing to write`
  )
}

let replacementId = found.docs[0]?.id
if (replacementId) {
  console.log(`= ${filename}: media row already exists (id ${replacementId})`)
} else {
  // See the note above: a same-named file in the local upload dir renames the
  // upload, whichever database is being written.
  const collision = path.join('media', filename)
  if (fs.existsSync(collision)) {
    throw new Error(
      `${collision} exists, which would rename this upload to ` +
        `"${path.parse(filename).name}-1${path.parse(filename).ext}". ` +
        `Move it aside first:  mv ${collision.replace(/\.[^.]+$/, '')}* /tmp/`
    )
  }
  changes++
  console.log(`${APPLY ? '+' : 'would'} create media row for ${filename}`)
  if (APPLY) {
    const created = await payload.create({
      collection: 'media',
      locale: 'pl',
      data: { alt: REPLACEMENT.alt.pl },
      filePath: REPLACEMENT.file,
    })
    // Payload bumps a name when one is taken; a bump here means the lookup
    // above missed a row and the pillar would point at a duplicate.
    if (created.filename !== filename) {
      // Undo it, so the run is all-or-nothing rather than leaving an
      // unreferenced row (and, on production, an orphaned Blob object).
      await payload.delete({ collection: 'media', id: created.id })
      throw new Error(
        `${filename}: Payload stored it as "${created.filename}" — something ` +
          'already claims that name. The row just created has been deleted; ' +
          'find the claimant before re-running.'
      )
    }
    await payload.update({
      collection: 'media',
      id: created.id,
      locale: 'en',
      data: { alt: REPLACEMENT.alt.en },
    })
    replacementId = created.id
    console.log(`  created id ${replacementId}`)
  }
}

// —— The pillar ————————————————————————————————————————————————————————————————

for (const locale of LOCALES) {
  const res = await payload.find({
    collection: 'case-studies',
    where: { slug: { equals: SLUG } },
    limit: 1,
    draft: true,
    locale,
    fallbackLocale: false,
    depth: 1, // media resolved so rows can be matched by filename
  })
  // biome-ignore lint/suspicious/noExplicitAny: doc shape
  const doc = res.docs[0] as any
  if (!doc?.approach?.length) {
    console.log(`! ${SLUG} [${locale}]: no approach pillars — skipping`)
    continue
  }

  const expectedTag = TAGS[locale]
  const dropped: string[] = []
  let done = false

  // biome-ignore lint/suspicious/noExplicitAny: pillar row shape
  const approach = doc.approach.map((pillar: any) => {
    const media = pillar.media ?? []
    // biome-ignore lint/suspicious/noExplicitAny: resolved media row shape
    const names = media.map((m: any) =>
      typeof m === 'object' ? m?.filename : null
    )

    if (names.includes(filename) && pillar.tag === expectedTag) {
      done = true
      return pillar
    }
    if (!names.some((n: string | null) => n && REMOVING.has(n))) {
      return pillar
    }
    if (pillar.tag !== expectedTag) {
      throw new Error(
        `${SLUG} [${locale}]: the creatives sit under "${pillar.tag}", not ` +
          `"${expectedTag}" — the content moved, refusing to write`
      )
    }
    for (const n of names) {
      if (n && !REMOVING.has(n)) {
        throw new Error(
          `${SLUG} [${locale}] "${pillar.tag}": also holds "${n}", which the ` +
            'plan does not name — refusing to write'
        )
      }
      if (n) dropped.push(n)
    }
    return { ...pillar, media: replacementId ? [replacementId] : [] }
  })

  if (done) {
    console.log(`= ${SLUG} [${locale}] ${expectedTag}: already swapped`)
    continue
  }
  if (dropped.length === 0) {
    console.log(`! ${SLUG} [${locale}] ${expectedTag}: nothing matched`)
    continue
  }

  changes++
  console.log(
    `${APPLY ? '~' : 'would'} ${SLUG} [${locale}] ${expectedTag}: ` +
      `${dropped.join(' + ')} -> ${filename}`
  )

  if (APPLY) {
    await payload.update({
      collection: 'case-studies',
      id: doc.id,
      locale,
      // No `draft: true`: the study is published and the public page is the
      // thing being corrected.
      // biome-ignore lint/suspicious/noExplicitAny: hand-built rows, validated by Payload
      data: { approach } as any,
    })
  }
}

console.log(`\n${changes} change(s) ${APPLY ? 'written' : 'pending'}`)
process.exit(0)
