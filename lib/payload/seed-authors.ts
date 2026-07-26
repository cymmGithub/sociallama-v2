/**
 * Author seed — run with `bun run payload:seed:authors` (dev DB) or `--prod`.
 * Idempotent: creates the named guest authors (avatar from public/authors/,
 * bio, external profile) and skips any that already exist, matching on name.
 *
 * Social Lama itself is deliberately NOT seeded here — an unassigned post
 * resolves to the brand Organization in code (lib/blog/author.ts), so the
 * collection stays a list of actual people.
 */

import path from 'node:path'

if (process.argv.includes('--prod')) {
  const prodUrl = process.env.DATABASE_URL_PROD
  if (!prodUrl) {
    throw new Error('payload:seed:authors --prod requires DATABASE_URL_PROD')
  }
  process.env.DATABASE_URL = prodUrl
  ;(process.env as Record<string, string>).NODE_ENV = 'production'
}

const dbHost = new URL(
  (process.env.DATABASE_URL ?? '').replace(/^postgres(?:ql)?:/, 'http:')
).hostname
console.log(`Seeding authors into: ${dbHost}\n`)

const { default: config } = await import('@payload-config')
const { getPayload } = await import('payload')

const AUTHORS = [
  {
    name: 'Łukasz Płociński',
    avatarPath: 'public/authors/lukasz-plocinski.png',
    // Carries the SEOFLY partner credit that used to sit in the post bodies
    // as "Tekst powstał we współpracy z agencją SEOFLY…".
    bio: 'Specjalista SEO w SEOFLY, partnerskiej agencji z naszej grupy. Od ponad piętnastu lat pozycjonuje strony i sklepy internetowe — łączy analityczne podejście z kreatywnością i na bieżąco nadąża za zmianami w algorytmach Google.',
    profileUrl: 'https://seofly.pl/zespol/lukasz-plocinski/',
  },
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

for (const author of AUTHORS) {
  const existing = await payload.find({
    collection: 'authors',
    where: { name: { equals: author.name } },
    limit: 1,
  })
  if (existing.docs[0]) {
    console.log(`= author exists: ${author.name} (#${existing.docs[0].id})`)
    continue
  }
  const avatar = await findOrCreateMedia(
    author.avatarPath,
    `${author.name} — zdjęcie profilowe`
  )
  const created = await payload.create({
    collection: 'authors',
    data: {
      name: author.name,
      avatar: avatar.id,
      bio: author.bio,
      profileUrl: author.profileUrl,
    },
  })
  console.log(`+ author created: ${author.name} (#${created.id})`)
}

console.log('Author seed complete.')
process.exit(0)
