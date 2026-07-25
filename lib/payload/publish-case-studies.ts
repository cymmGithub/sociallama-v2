/**
 * Publish case-study drafts. Flips `_status` draft → published and stamps
 * `publishedAt` (the listing/detail sort on `-publishedAt`) via the Payload
 * Local API so revalidation hooks fire.
 *
 * The client-permission gate is the real approval step — only run this against
 * `--prod` for studies that have actually cleared it.
 *
 * Run:  bun ./lib/payload/publish-case-studies.ts                    # all drafts, dev DB
 *       bun ./lib/payload/publish-case-studies.ts riviera skrzat     # specific slugs
 *       bun ./lib/payload/publish-case-studies.ts --except kbp luisse mmhygienic
 *       bun ./lib/payload/publish-case-studies.ts --prod riviera     # prod (DATABASE_URL_PROD)
 *
 * NOTE: writes bypass the deployed app, so revalidation hooks can't reach the
 * live cache — after publishing on prod, redeploy (or revalidate) to surface it.
 */

export {} // top-level await needs this file to be a module (only dynamic imports below)

// Env decision before config import (payload.config validates DATABASE_URL at
// import time) — mirrors seed-case-studies.ts / import-case-study.ts.
if (process.argv.includes('--prod')) {
  const prodUrl = process.env.DATABASE_URL_PROD
  if (!prodUrl) {
    throw new Error(
      'publish-case-studies --prod requires DATABASE_URL_PROD in .env.local'
    )
  }
  process.env.DATABASE_URL = prodUrl
  ;(process.env as Record<string, string>).NODE_ENV = 'production'
}

const dbHost = new URL(
  (process.env.DATABASE_URL ?? '').replace(/^postgres(?:ql)?:/, 'http:')
).hostname

const { default: config } = await import('@payload-config')
const { getPayload } = await import('payload')
const payload = await getPayload({ config })

const args = process.argv.slice(2).filter((a) => a !== '--prod')
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
  `Publishing ${targets.length} of ${drafts.docs.length} draft studies into: ${dbHost}`
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
