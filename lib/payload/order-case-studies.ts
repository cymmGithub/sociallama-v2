/**
 * Stamp the running order of /case-studies onto the collection's `_order`
 * field, from the ranking below.
 *
 * This is a one-shot: after it runs, the order is maintained by dragging rows
 * in the admin list view, and this script only exists to re-seed a database
 * from scratch. It refuses to run against a set of slugs that does not match
 * ORDER exactly, so a study added since is a loud failure rather than a silent
 * drop to the bottom.
 *
 * Run:  bun ./lib/payload/order-case-studies.ts           # dev DB
 *       bun ./lib/payload/order-case-studies.ts --prod    # DATABASE_URL_PROD
 *
 * NOTE: writes bypass the deployed app, so revalidation hooks can't reach the
 * live cache — after running on prod, redeploy (or revalidate).
 */

export {} // top-level await needs this file to be a module (only dynamic imports below)

/**
 * The portfolio ranking, strongest first. Volvo, iRobot and Pracuj.pl lead by
 * decision (2026-07-27); below them the order runs international brands, then
 * the major Polish names, then the rest, with the three studies flagged as
 * thin in CASE-STUDIES-STATUS.md last.
 */
const ORDER = [
  // Pinned.
  'volvo',
  'irobot',
  'pracuj-pl',
  // International brands.
  'asus',
  'engie',
  'fm-logistics',
  'julius-meinl',
  'breville',
  'foodsaver',
  'laurastar',
  'stadler-form',
  'mercator',
  'motointegrator',
  'adamed',
  // Major Polish names.
  'polomarket',
  'vistula',
  'vobis',
  'riviera',
  'kontigo',
  'aquael',
  'ariadna',
  'entelo',
  'belvedere',
  'dolina-charlotty',
  'galeria-rondo-wiatraczna',
  'faktoria-win',
  // The rest.
  'skrzat',
  'power-elements',
  'mazurska-manufaktura-alkoholi',
  'las-vegans',
  'kohersen',
  'a1-karting',
  'bioagris',
  'rabkoland',
  'skibooking',
  'getaway',
  'jw-construction',
  'dynamic-development',
  'ed-invest',
  'n-energia',
  'produkty-cukiernicze-brzesc',
  'ozgasl',
  'personal-effect',
  'imid-cmv',
  'fundacja-saventic',
  // Thin content — see CASE-STUDIES-STATUS.md.
  'kbp',
  'luisse',
  'mmhygienic',
]

// Env decision before config import (payload.config validates DATABASE_URL at
// import time) — mirrors publish-case-studies.ts.
if (process.argv.includes('--prod')) {
  const prodUrl = process.env.DATABASE_URL_PROD
  if (!prodUrl) {
    throw new Error(
      'order-case-studies --prod requires DATABASE_URL_PROD in .env.local'
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
// Payload's own fractional-index generator, so the keys this writes are the
// same shape the admin's drag-and-drop produces.
const { generateNKeysBetween } = await import('payload/shared')
const payload = await getPayload({ config })

const existing = await payload.find({
  collection: 'case-studies',
  limit: 0,
  pagination: false,
  depth: 0,
  select: { slug: true },
})

const found = new Set(existing.docs.map((doc) => doc.slug as string))
const missing = ORDER.filter((slug) => !found.has(slug))
const unranked = [...found].filter((slug) => !ORDER.includes(slug))

if (missing.length > 0 || unranked.length > 0) {
  if (missing.length > 0) {
    console.error(`Ranked but not in the database: ${missing.join(', ')}`)
  }
  if (unranked.length > 0) {
    console.error(`In the database but not ranked: ${unranked.join(', ')}`)
  }
  throw new Error(
    'ORDER does not match the collection — reconcile it before running.'
  )
}

const bySlug = new Map(existing.docs.map((doc) => [doc.slug as string, doc.id]))
const keys = generateNKeysBetween(null, null, ORDER.length)

console.log(`Ordering ${ORDER.length} case studies in: ${dbHost}`)

for (const [index, slug] of ORDER.entries()) {
  const id = bySlug.get(slug)
  const order = keys[index]
  // Both are guaranteed by the reconciliation above and by generateNKeysBetween
  // returning ORDER.length keys; narrowing them keeps the update call honest.
  if (id === undefined || order === undefined) {
    throw new Error(`No id or order key for ${slug}`)
  }
  await payload.update({
    collection: 'case-studies',
    id,
    data: { _order: order },
    depth: 0,
  })
  console.log(`${String(index + 1).padStart(2)} ${slug}`)
}

console.log('Done. /case-studies now lists in this order.')
process.exit(0)
