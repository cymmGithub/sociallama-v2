/**
 * Pulls every creative off the Pracuj.pl case study.
 *
 * Ania's 2026-08-19 review: the images on this study are not Social Lama's
 * work, so none of them may stay. The pillars keep their copy — only the
 * creatives go. The cover is NOT detached: it was replaced in place with a
 * stock frame (`pracuj-pl-cover.jpg`, refreshed via
 * refresh-case-study-creatives.ts), so the study still has a card image while
 * claiming nothing about whose work it is. Source: Pexels photo 23496662, free
 * licence, no attribution required — the same terms as the branże imagery.
 *
 * Keyed the same way as detach-comment-screenshots.ts, and for the same
 * reasons:
 *
 *   - **Filename, not media id.** Ids are per-database (development id 1 is
 *     `tiktok.png`, production id 1 is `blog-1.png`), so an id-keyed removal
 *     would detach unrelated images from the other database.
 *   - **The expected set is a guard, not just a selector.** Every filename this
 *     finds attached must be one the plan names; anything else means the study
 *     gained a creative since the plan was written, so it aborts rather than
 *     silently dropping something nobody reviewed.
 *
 * `approach` is localized as a WHOLE ARRAY, so both locales carry their own
 * copy of the pillars pointing at the same media — every removal is written
 * twice.
 *
 * Detaching only. The media rows are left in place: detaching is reversible,
 * deleting is not, and `public/case-studies/pracuj-pl/` still holds the source
 * files. Every one of these rows is referenced by this study alone (verified
 * with dump-case-study-imagery.ts), so they are true orphans afterwards and can
 * be deleted separately once the page has been reviewed.
 *
 * It also re-alts the cover row. The bytes were swapped underneath it, so the
 * seeded alt ("Aplikacja Pracuj.pl otwarta na smartfonie…") now describes a
 * photo nobody can see. `alt` is localized per media row, so both locales are
 * written.
 *
 * Run:  bun ./lib/payload/strip-pracuj-creatives.ts            # dry run, dev DB
 *       bun ./lib/payload/strip-pracuj-creatives.ts --apply
 *       bun ./lib/payload/strip-pracuj-creatives.ts --apply --prod
 *
 * NOTE: writes bypass the deployed app, so the revalidation hooks cannot reach
 * the live cache — after running against production, redeploy (or revalidate).
 */

export {} // top-level await needs this file to be a module

const APPLY = process.argv.includes('--apply')

if (process.argv.includes('--prod')) {
  const { targetProdEnv } = await import('./prod-env')
  targetProdEnv('strip-pracuj-creatives')
}

const SLUG = 'pracuj-pl'

/** Every creative the review found on this study, as of 2026-08-20. */
const EXPECTED = new Set([
  'pracuj-pl-ar-grid-anon.jpg',
  'pracuj-pl-edu-1.png',
  'pracuj-pl-edu-2.png',
  'pracuj-pl-funny-1.png',
  'pracuj-pl-funny-2.png',
  'pracuj-pl-funny-3.png',
  'pracuj-pl-influencer.jpg',
])

/** The cover row keeps its filename; only its bytes and description changed. */
const COVER = {
  filename: 'pracuj-pl-cover.jpg',
  alt: {
    pl: 'Zespół młodych osób pracujących wspólnie przy stole w\u00A0jasnym biurze',
    en: 'A young team working together around a table in a bright office',
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

let changes = 0

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

  const dropped: string[] = []

  // biome-ignore lint/suspicious/noExplicitAny: pillar row shape
  const approach = doc.approach.map((pillar: any) => {
    const media = pillar.media ?? []
    if (media.length === 0) {
      return pillar
    }
    for (const item of media) {
      const filename = typeof item === 'object' ? item?.filename : null
      if (!filename) {
        throw new Error(
          `${SLUG} [${locale}] "${pillar.tag}": media row with no filename — ` +
            'refusing to write'
        )
      }
      if (!EXPECTED.has(filename)) {
        throw new Error(
          `${SLUG} [${locale}] "${pillar.tag}": unexpected creative ` +
            `"${filename}" — the study changed since the plan, refusing to write`
        )
      }
      dropped.push(`${pillar.tag}/${filename}`)
    }
    return { ...pillar, media: [] }
  })

  if (dropped.length === 0) {
    console.log(`= ${SLUG} [${locale}]: already clean`)
    continue
  }

  changes++
  console.log(
    `${APPLY ? '~' : 'would'} ${SLUG} [${locale}]: detach ${dropped.length}\n` +
      dropped.map((d) => `      ${d}`).join('\n')
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

// —— Cover alt ————————————————————————————————————————————————————————————————

const coverRes = await payload.find({
  collection: 'media',
  where: { filename: { equals: COVER.filename } },
  limit: 2,
  depth: 0,
  locale: 'pl',
})
const cover = coverRes.docs[0]
if (!cover || coverRes.docs.length !== 1) {
  throw new Error(
    `expected exactly one media row named ${COVER.filename}, ` +
      `found ${coverRes.docs.length} — refusing to write`
  )
}

for (const locale of LOCALES) {
  const current = (
    await payload.findByID({
      collection: 'media',
      id: cover.id,
      depth: 0,
      locale,
      fallbackLocale: false,
    })
  ).alt
  if (current === COVER.alt[locale]) {
    console.log(`= ${COVER.filename} [${locale}]: alt already correct`)
    continue
  }
  changes++
  console.log(
    `${APPLY ? '~' : 'would'} ${COVER.filename} [${locale}]: re-alt\n` +
      `      from "${current ?? ''}"\n` +
      `      to   "${COVER.alt[locale]}"`
  )
  if (APPLY) {
    await payload.update({
      collection: 'media',
      id: cover.id,
      locale,
      data: { alt: COVER.alt[locale] },
    })
  }
}

console.log(`\n${changes} row(s) ${APPLY ? 'written' : 'pending'}`)
process.exit(0)
