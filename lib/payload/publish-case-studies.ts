/**
 * Publish case-study drafts (dev/local). Flips `_status` draft → published and
 * stamps `publishedAt` (the listing/detail sort on `-publishedAt`) via the
 * Payload Local API so revalidation hooks fire.
 *
 * The client-permission gate is a real-prod concern; on local this just surfaces
 * the drafts on the public listing for review.
 *
 * Run:  bun ./lib/payload/publish-case-studies.ts            # all current drafts
 *       bun ./lib/payload/publish-case-studies.ts riviera skrzat   # specific slugs
 *       bun ./lib/payload/publish-case-studies.ts --except kbp luisse mmhygienic
 */

export {} // top-level await needs this file to be a module (only dynamic imports below)

const { default: config } = await import('@payload-config')
const { getPayload } = await import('payload')
const payload = await getPayload({ config })

const args = process.argv.slice(2)
const exceptMode = args[0] === '--except'
const listed = (exceptMode ? args.slice(1) : args).filter(
  (a) => !a.startsWith('--')
)

const drafts = await payload.find({
  collection: 'case-studies',
  where: { _status: { equals: 'draft' } },
  draft: true,
  limit: 500,
  depth: 0,
  locale: 'pl',
})

const targets = drafts.docs.filter((doc) => {
  const slug = doc.slug as string
  if (exceptMode) return !listed.includes(slug)
  if (listed.length > 0) return listed.includes(slug)
  return true
})

console.log(
  `Publishing ${targets.length} of ${drafts.docs.length} draft studies…`
)

const now = new Date().toISOString()
for (const doc of targets) {
  await payload.update({
    collection: 'case-studies',
    id: doc.id,
    data: {
      _status: 'published',
      // keep an existing date if one was set; otherwise stamp now
      publishedAt: (doc.publishedAt as string | null) ?? now,
    },
  })
  console.log(`+ published: ${doc.slug}`)
}

console.log(
  'Done. Published studies now appear on /case-studies and the sitemap.'
)
process.exit(0)
