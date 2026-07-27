/**
 * One-off data fix: the `volvo` case study's `client.name` reads
 * "Volvo Car Warszawa & Dom VolvoS" — a stray trailing S on the second brand,
 * introduced by the latest version (versions 7 and 8 hold the correct string).
 *
 * Goes through the Local API rather than SQL so the published row and a fresh
 * version stay consistent; a direct UPDATE would leave the version history
 * disagreeing, and the next admin save would restore the typo.
 *
 * Run:  bun ./lib/payload/fix-volvo-client-name.ts           # dev DB
 *       bun ./lib/payload/fix-volvo-client-name.ts --prod    # DATABASE_URL_PROD
 *
 * NOTE: writes bypass the deployed app, so revalidation hooks can't reach the
 * live cache — after running against prod, redeploy (or revalidate).
 */

export {} // top-level await needs this file to be a module

// Env decision before config import (payload.config validates DATABASE_URL at
// import time) — mirrors publish-case-studies.ts.
if (process.argv.includes('--prod')) {
  const prodUrl = process.env.DATABASE_URL_PROD
  if (!prodUrl) {
    throw new Error(
      'fix-volvo-client-name --prod requires DATABASE_URL_PROD in .env.local'
    )
  }
  process.env.DATABASE_URL = prodUrl
  ;(process.env as Record<string, string>).NODE_ENV = 'production'
}

const WRONG = 'Volvo Car Warszawa & Dom VolvoS'
const RIGHT = 'Volvo Car Warszawa & Dom Volvo'

const dbHost = new URL(
  (process.env.DATABASE_URL ?? '').replace(/^postgres(?:ql)?:/, 'http:')
).hostname

const { default: config } = await import('@payload-config')
const { getPayload } = await import('payload')
const payload = await getPayload({ config })

const found = await payload.find({
  collection: 'case-studies',
  where: { slug: { equals: 'volvo' } },
  limit: 1,
  depth: 0,
  locale: 'pl',
})

const study = found.docs[0]
if (!study) {
  throw new Error(`no case study with slug "volvo" in ${dbHost}`)
}

const current = study.client.name
if (current === RIGHT) {
  console.log(`Already correct in ${dbHost}: "${current}" — nothing to do.`)
  process.exit(0)
}
if (current !== WRONG) {
  throw new Error(
    `unexpected client.name in ${dbHost}: "${current}" — refusing to overwrite`
  )
}

await payload.update({
  collection: 'case-studies',
  id: study.id,
  data: { client: { ...study.client, name: RIGHT } },
})

console.log(`Fixed in ${dbHost}: "${WRONG}" -> "${RIGHT}"`)
process.exit(0)
