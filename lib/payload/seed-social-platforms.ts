/**
 * Social-platform seed — run with `bun run payload:seed:platforms` (dev DB) or
 * `--prod`. Idempotent: creates the reusable platform logos (TikTok, YouTube,
 * …) from the plum glyphs under public/social-platforms/, skipping any that
 * already exist. Logos are PNG (Payload's media collection rejects SVG).
 */

import path from 'node:path'

if (process.argv.includes('--prod')) {
  const prodUrl = process.env.DATABASE_URL_PROD
  if (!prodUrl) {
    throw new Error('payload:seed:platforms --prod requires DATABASE_URL_PROD')
  }
  process.env.DATABASE_URL = prodUrl
  ;(process.env as Record<string, string>).NODE_ENV = 'production'
}

const dbHost = new URL(
  (process.env.DATABASE_URL ?? '').replace(/^postgres(?:ql)?:/, 'http:')
).hostname
console.log(`Seeding social platforms into: ${dbHost}\n`)

const { default: config } = await import('@payload-config')
const { getPayload } = await import('payload')

const PLATFORMS = [
  { key: 'tiktok', name: 'TikTok' },
  { key: 'youtube', name: 'YouTube' },
  { key: 'instagram', name: 'Instagram' },
  { key: 'facebook', name: 'Facebook' },
  { key: 'linkedin', name: 'LinkedIn' },
] as const

const payload = await getPayload({ config })

async function findOrCreateMedia(filePath: string, alt: string) {
  const filename = path.basename(filePath)
  const existing = await payload.find({
    collection: 'media',
    where: { filename: { equals: filename } },
    limit: 1,
  })
  if (existing.docs[0]) {
    return existing.docs[0]
  }
  return payload.create({ collection: 'media', data: { alt }, filePath })
}

for (const platform of PLATFORMS) {
  const existing = await payload.find({
    collection: 'social-platforms',
    where: { key: { equals: platform.key } },
    limit: 1,
  })
  if (existing.totalDocs > 0) {
    console.log(`= platform exists: ${platform.key}`)
    continue
  }
  const logo = await findOrCreateMedia(
    `public/social-platforms/${platform.key}.png`,
    `Logo ${platform.name}`
  )
  await payload.create({
    collection: 'social-platforms',
    data: { key: platform.key, name: platform.name, logo: logo.id },
  })
  console.log(`+ platform created: ${platform.key}`)
}

console.log('Social-platform seed complete.')
process.exit(0)
