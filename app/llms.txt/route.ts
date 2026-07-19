import { APP_DESCRIPTION, APP_NAME } from '@/lib/content/site'
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

function url(path: string): string {
  return path === '/' ? `${APP_BASE_URL}/` : `${APP_BASE_URL}${path}`
}

function line(title: string, href: string, blurb?: string): string {
  return blurb ? `- [${title}](${href}): ${blurb}` : `- [${title}](${href})`
}

export async function GET(): Promise<Response> {
  const [posts, categories] = await Promise.all([
    getPostsForLlms(),
    getCategories(),
  ])

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

  sections.push(
    [
      '## Optional',
      line('Polityka prywatności', url('/polityka-prywatnosci')),
    ].join('\n')
  )

  const body = `${sections.join('\n\n')}\n`

  return new Response(body, {
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  })
}
