/**
 * Drops the comment-thread screenshots from three moderation pillars.
 *
 * Rabkoland `#KOMUNIKACJA`, Dynamic Development `#MODERACJA` and Vistula
 * `#AKTYWNA_MODERACJA` illustrated themselves with captures of live comment
 * threads — nicknames, avatars and profile links of people who never agreed to
 * appear in a portfolio. The pillars keep their copy; only the creatives go.
 *
 * Two things the plan is keyed on, and why:
 *
 *   - **Filename, not media id.** Ids are per-database (development id 1 is
 *     `tiktok.png`, production id 1 is `blog-1.png`), so an id-keyed removal
 *     would detach unrelated images from the other database.
 *   - **The pillar tag is a guard, not a selector.** The file is searched for
 *     across the whole study; finding it under a different tag aborts rather
 *     than writing, because that means the content moved and the plan is stale.
 *
 * `approach` is localized as a WHOLE ARRAY, so both locales carry their own
 * copy of the pillars pointing at the same media — every removal is written
 * twice. The media documents themselves are left in place: detaching is
 * reversible, deleting is not, and `public/case-studies/<slug>/` still holds
 * the source files if a row ever has to be rebuilt.
 *
 * Run:  bun ./lib/payload/detach-comment-screenshots.ts            # dry run, dev DB
 *       bun ./lib/payload/detach-comment-screenshots.ts --apply
 *       bun ./lib/payload/detach-comment-screenshots.ts --apply --prod
 *
 * NOTE: writes bypass the deployed app, so the revalidation hooks cannot reach
 * the live cache — after running against production, redeploy (or revalidate).
 */

export {} // top-level await needs this file to be a module

const APPLY = process.argv.includes('--apply')

if (process.argv.includes('--prod')) {
  const { targetProdEnv } = await import('./prod-env')
  targetProdEnv('detach-comment-screenshots')
}

/** Tags are listed per locale because `approach` is localized whole-array. */
const PLAN = [
  {
    slug: 'rabkoland',
    tags: { pl: '#KOMUNIKACJA', en: '#COMMUNICATION' },
    files: ['rabkoland-gallery-1-anon.jpg'],
  },
  {
    slug: 'dynamic-development',
    tags: { pl: '#MODERACJA', en: '#MODERATION' },
    files: [
      'dynamic-development-gallery-2.jpg',
      'dynamic-development-gallery-3.jpg',
    ],
  },
  {
    slug: 'vistula',
    tags: { pl: '#AKTYWNA_MODERACJA', en: '#ACTIVE_MODERATION' },
    files: ['vistula-gallery-7-anon.jpg', 'vistula-gallery-8.jpg'],
  },
] as const

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

for (const op of PLAN) {
  for (const locale of LOCALES) {
    const res = await payload.find({
      collection: 'case-studies',
      where: { slug: { equals: op.slug } },
      limit: 1,
      draft: true,
      locale,
      fallbackLocale: false,
      depth: 1, // media resolved so rows can be matched by filename
    })
    // biome-ignore lint/suspicious/noExplicitAny: doc shape
    const doc = res.docs[0] as any
    if (!doc?.approach?.length) {
      console.log(`! ${op.slug} [${locale}]: no approach pillars — skipping`)
      continue
    }

    const expectedTag = op.tags[locale]
    const removing = new Set<string>(op.files)
    const dropped: string[] = []

    // biome-ignore lint/suspicious/noExplicitAny: pillar row shape
    const approach = doc.approach.map((pillar: any) => {
      const media = pillar.media ?? []
      const keep: number[] = []
      let touched = false
      for (const item of media) {
        const id = typeof item === 'object' ? item?.id : item
        const filename = typeof item === 'object' ? item?.filename : null
        if (filename && removing.has(filename)) {
          if (pillar.tag !== expectedTag) {
            throw new Error(
              `${op.slug} [${locale}]: ${filename} sits under "${pillar.tag}", ` +
                `not "${expectedTag}" — the content moved, refusing to write`
            )
          }
          touched = true
          dropped.push(filename)
          continue
        }
        if (typeof id === 'number') keep.push(id)
      }
      return touched ? { ...pillar, media: keep } : pillar
    })

    const missing = op.files.filter((f) => !dropped.includes(f))
    if (dropped.length === 0) {
      console.log(`= ${op.slug} [${locale}]: already clean`)
      continue
    }
    if (missing.length > 0) {
      console.log(
        `! ${op.slug} [${locale}]: not attached — ${missing.join(', ')}`
      )
    }

    changes++
    console.log(
      `${APPLY ? '~' : 'would'} ${op.slug} [${locale}] ${expectedTag}: ` +
        `detach ${dropped.join(', ')}`
    )

    if (APPLY) {
      await payload.update({
        collection: 'case-studies',
        id: doc.id,
        locale,
        // No `draft: true`: these studies are published and the public page is
        // the thing being corrected.
        // biome-ignore lint/suspicious/noExplicitAny: hand-built rows, validated by Payload
        data: { approach } as any,
      })
    }
  }
}

console.log(
  `\n${changes} pillar/locale row(s) ${APPLY ? 'written' : 'pending'}`
)
process.exit(0)
