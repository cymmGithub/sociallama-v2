/**
 * Seed script — run with `bun run payload:seed`.
 *
 * Idempotent: creates the live site's four categories and one published
 * seed post ("LinkedIn Premium — czy warto?", the post the homepage
 * NewsLAMA card points at), skipping anything that already exists.
 * Full WordPress content arrives via the separate migrate-wp-content change.
 */

import config from '@payload-config'
import { getPayload } from 'payload'

const CATEGORIES = [
  { title: 'Marketing', slug: 'marketing' },
  { title: 'Reklama', slug: 'reklama' },
  { title: 'SEO', slug: 'seo' },
  { title: 'Social media', slug: 'social-media' },
] as const

const SEED_POST = {
  title: 'LinkedIn Premium — czy warto?',
  slug: 'linkedin-premium-czy-warto',
  excerpt:
    'Czy LinkedIn Premium jest wart swojej ceny? Sprawdzamy plany Career, Business, Sales Navigator i Recruiter Lite — komu się opłaca, a kto poradzi sobie bez.',
  publishedAt: '2025-12-30T12:00:00.000Z',
  coverPath: 'public/assets/blog.png',
  coverAlt: 'Ilustracja wpisu o LinkedIn Premium',
} as const

function text(value: string) {
  return {
    type: 'text',
    text: value,
    detail: 0,
    format: 0,
    mode: 'normal',
    style: '',
    version: 1,
  }
}

function block(type: string, children: unknown[], extra = {}) {
  return {
    type,
    children,
    direction: 'ltr',
    format: '',
    indent: 0,
    version: 1,
    ...extra,
  }
}

/** Minimal Lexical body exercising the node types the renderer must map. */
const SEED_CONTENT = {
  root: block('root', [
    block('paragraph', [text(SEED_POST.excerpt)]),
    block('heading', [text('Co sprawdzamy?')], { tag: 'h2' }),
    block(
      'list',
      [
        block('listitem', [text('Career — dla szukających pracy')], {
          value: 1,
        }),
        block('listitem', [text('Business — dla budujących sieć kontaktów')], {
          value: 2,
        }),
        block('listitem', [text('Sales Navigator — dla zespołów sprzedaży')], {
          value: 3,
        }),
        block('listitem', [text('Recruiter Lite — dla rekruterów')], {
          value: 4,
        }),
      ],
      { listType: 'bullet', tag: 'ul', start: 1 }
    ),
    block('quote', [
      text('Premium bywa warte swojej ceny — ale nie dla każdego.'),
    ]),
    block('paragraph', [
      text(
        'Pełna treść wpisu zostanie zaimportowana z obecnego bloga podczas migracji treści.'
      ),
    ]),
  ]),
}

const payload = await getPayload({ config })

for (const category of CATEGORIES) {
  const existing = await payload.find({
    collection: 'categories',
    where: { slug: { equals: category.slug } },
    limit: 1,
  })
  if (existing.totalDocs > 0) {
    console.log(`= category exists: ${category.slug}`)
    continue
  }
  await payload.create({ collection: 'categories', data: category })
  console.log(`+ category created: ${category.slug}`)
}

const existingPost = await payload.find({
  collection: 'posts',
  where: { slug: { equals: SEED_POST.slug } },
  limit: 1,
  draft: true,
})

if (existingPost.totalDocs > 0) {
  console.log(`= post exists: ${SEED_POST.slug}`)
} else {
  const existingCover = await payload.find({
    collection: 'media',
    where: { filename: { equals: 'blog.png' } },
    limit: 1,
  })
  const cover =
    existingCover.docs[0] ??
    (await payload.create({
      collection: 'media',
      data: { alt: SEED_POST.coverAlt },
      filePath: SEED_POST.coverPath,
    }))
  console.log(`+ cover media: ${cover.filename}`)

  const marketing = await payload.find({
    collection: 'categories',
    where: { slug: { equals: 'marketing' } },
    limit: 1,
  })
  const marketingCategory = marketing.docs[0]
  if (!marketingCategory) {
    throw new Error('Seed order error: marketing category missing')
  }

  await payload.create({
    collection: 'posts',
    data: {
      title: SEED_POST.title,
      slug: SEED_POST.slug,
      excerpt: SEED_POST.excerpt,
      publishedAt: SEED_POST.publishedAt,
      cover: cover.id,
      category: marketingCategory.id,
      // biome-ignore lint/suspicious/noExplicitAny: hand-built Lexical JSON; validated by Payload on create
      content: SEED_CONTENT as any,
      _status: 'published',
    },
  })
  console.log(`+ post created: ${SEED_POST.slug}`)
}

console.log('Seed complete.')
process.exit(0)
