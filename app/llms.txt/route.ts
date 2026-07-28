import { APP_DESCRIPTION, APP_NAME } from '@/lib/content/site'
import { APP_DESCRIPTION as APP_DESCRIPTION_EN } from '@/lib/content/site.en'
import { APP_BASE_URL } from '@/lib/env'
import { getCategories, getPostsForLlms } from '@/lib/payload/queries'

/*
 * `/llms.txt` — a curated, LLM-facing map of the site (https://llmstxt.org).
 *
 * Index only: an overview plus links, not a full-content dump. The static
 * pages are hand-curated here (llms.txt is meant to be a human-chosen
 * shortlist); the blog and categories are generated from Payload so the file
 * never rots. Reads flow through the `'use cache'` query helpers, so this
 * route prerenders statically and refreshes via the `posts`/`categories`
 * cache tags when content changes — same mechanism as sitemap.ts.
 */

/** Curated top-level pages, in priority order, with short Polish blurbs. */
const PAGES: readonly { path: string; title: string; blurb: string }[] = [
  {
    path: '/',
    title: 'Strona główna',
    blurb: APP_DESCRIPTION,
  },
  {
    path: '/blog',
    title: 'Blog',
    blurb: 'Wpisy o marketingu i sprzedaży w mediach społecznościowych.',
  },
  {
    path: '/zostan-lama',
    title: 'Zostań lamą',
    blurb: 'Aktualne oferty pracy i współpracy w Social Lama.',
  },
  {
    path: '/kontakt',
    title: 'Kontakt',
    blurb: 'Napisz do agencji — porozmawiajmy o Twoim biznesie.',
  },
]

/** The same shortlist for the English tree, with English blurbs. */
const EN_PAGES: readonly { path: string; title: string; blurb: string }[] = [
  {
    path: '/en',
    title: 'Home',
    blurb: APP_DESCRIPTION_EN,
  },
  {
    path: '/en/blog',
    title: 'Blog',
    blurb: 'Posts on marketing and sales in social media.',
  },
  {
    path: '/en/become-a-lama',
    title: 'Become a Lama',
    blurb: 'Current jobs and collaboration offers at Social Lama.',
  },
  {
    path: '/en/contact',
    title: 'Contact',
    blurb: "Write to the agency — let's talk about your business.",
  },
]

function url(path: string): string {
  return path === '/' ? `${APP_BASE_URL}/` : `${APP_BASE_URL}${path}`
}

function line(title: string, href: string, blurb?: string): string {
  return blurb ? `- [${title}](${href}): ${blurb}` : `- [${title}](${href})`
}

export async function GET(): Promise<Response> {
  // Sequential, not Promise.all: this prerenders alongside every other page,
  // and the English locale doubled the read count here (see the build-time DB
  // concurrency note in app/(frontend)/blog/page.tsx).
  const posts = await getPostsForLlms('pl')
  const categories = await getCategories('pl')
  const enPosts = await getPostsForLlms('en')
  const enCategories = await getCategories('en')

  const sections: string[] = [
    `# ${APP_NAME}`,
    `> ${APP_DESCRIPTION}`,
    [
      '## Strony',
      ...PAGES.map((p) => line(p.title, url(p.path), p.blurb)),
    ].join('\n'),
  ]

  if (posts.length > 0) {
    sections.push(
      [
        '## Blog',
        ...posts.map((post) =>
          line(post.title, url(`/${post.slug}`), post.excerpt ?? undefined)
        ),
      ].join('\n')
    )
  }

  if (categories.length > 0) {
    sections.push(
      [
        '## Kategorie',
        ...categories.map((category) =>
          line(category.title, url(`/category/${category.slug}`))
        ),
      ].join('\n')
    )
  }

  // English tree. Emitted only where it has content: the D6 gate means an
  // untranslated post has no English URL at all, so an empty section here
  // would advertise a locale with nothing behind it.
  sections.push(
    [
      '## English',
      ...EN_PAGES.map((p) => line(p.title, url(p.path), p.blurb)),
    ].join('\n')
  )

  if (enPosts.length > 0) {
    sections.push(
      [
        '## English — blog',
        ...enPosts.map((post) =>
          line(
            post.title,
            url(`/en/blog/${post.slug}`),
            post.excerpt ?? undefined
          )
        ),
      ].join('\n')
    )
  }

  if (enCategories.length > 0) {
    sections.push(
      [
        '## English — categories',
        ...enCategories.map((category) =>
          line(category.title, url(`/en/blog/category/${category.slug}`))
        ),
      ].join('\n')
    )
  }

  sections.push(
    [
      '## Optional',
      line('Polityka prywatności', url('/polityka-prywatnosci')),
      line('Privacy Policy', url('/en/privacy-policy')),
    ].join('\n')
  )

  const body = `${sections.join('\n\n')}\n`

  return new Response(body, {
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  })
}
