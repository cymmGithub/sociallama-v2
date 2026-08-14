import type { MetadataRoute } from 'next'
import { INDUSTRIES } from '@/lib/content/branze'
import { USLUGI_PAGES } from '@/lib/content/uslugi'
import { careersRoles } from '@/lib/content/zostan-lama'
import { APP_BASE_URL } from '@/lib/env'
import {
  getCaseStudiesForSitemap,
  getCategories,
  getPostsForSitemap,
  getPostsPage,
} from '@/lib/payload/queries'
import { STATIC_PAGES } from '@/lib/static-routes'

type SitemapEntry = MetadataRoute.Sitemap[number]
type ChangeFrequency = SitemapEntry['changeFrequency']

function entry(
  path: string,
  changeFrequency: ChangeFrequency,
  priority: number,
  lastModified: Date = new Date()
): SitemapEntry {
  return {
    url: path === '/' ? APP_BASE_URL : `${APP_BASE_URL}${path}`,
    lastModified,
    changeFrequency,
    priority,
  }
}

/** hreflang for a pair, `x-default` on Polish (design D8). */
const languagesFor = (pl: string, en: string) => ({
  languages: {
    pl: `${APP_BASE_URL}${pl}`,
    en: `${APP_BASE_URL}${en}`,
    'x-default': `${APP_BASE_URL}${pl}`,
  },
})

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages, both locales, from the shared PL↔EN registry
  // (lib/static-routes.ts, derived from pathPairs). The PL entry carries the
  // pair's hreflang alternates; the EN half keeps its flat monthly cadence.
  const staticRoutes: MetadataRoute.Sitemap = STATIC_PAGES.flatMap(
    ({ pl, en, changeFrequency, priority }) => [
      {
        ...entry(pl, changeFrequency, priority),
        alternates: languagesFor(pl, en),
      },
      entry(en, 'monthly', en === '/en' ? 0.9 : 0.6),
    ]
  )

  // Published only — every query constrains _status; drafts never appear here.
  //
  // Read SEQUENTIALLY rather than with Promise.all, per the project's
  // build-time DB concurrency constraint (see app/(frontend)/blog/page.tsx).
  // This runs during static generation alongside every other page; the English
  // locale doubled the number of reads here, which is the wrong direction to
  // take a concurrent burst against the unpooled prod instance.
  const posts = await getPostsForSitemap('pl')
  const enPosts = await getPostsForSitemap('en')
  const categories = await getCategories('pl')
  const enCategories = await getCategories('en')
  const caseStudies = await getCaseStudiesForSitemap()
  const plHub = await getPostsPage(1, undefined, 'pl')
  const enHub = await getPostsPage(1, undefined, 'en')

  // Joined by id, so a Polish post can name its English URL without one lookup
  // each. A post absent from `enPosts` has no English version — the D6 gate
  // already excluded it — and so gets no `alternates` rather than a guess.
  const enSlugByPostId = new Map(enPosts.map((post) => [post.id, post.slug]))
  const enSlugByCategoryId = new Map(
    enCategories.map((category) => [category.id, category.slug])
  )

  const postRoutes: MetadataRoute.Sitemap = posts.map((post) => {
    const enSlug = enSlugByPostId.get(post.id)
    return {
      ...entry(`/${post.slug}`, 'monthly', 0.7, new Date(post.updatedAt)),
      ...(enSlug
        ? { alternates: languagesFor(`/${post.slug}`, `/en/blog/${enSlug}`) }
        : {}),
    }
  })

  const enPostRoutes: MetadataRoute.Sitemap = enPosts.map((post) =>
    entry(`/en/blog/${post.slug}`, 'monthly', 0.7, new Date(post.updatedAt))
  )

  // Case-study details exist at the same slug in both locales (same docs,
  // same updatedAt).
  const caseStudyRoutes: MetadataRoute.Sitemap = caseStudies.flatMap(
    (study) => [
      entry(
        `/case-studies/${study.slug}`,
        'monthly',
        0.7,
        new Date(study.updatedAt)
      ),
      entry(
        `/en/case-studies/${study.slug}`,
        'monthly',
        0.7,
        new Date(study.updatedAt)
      ),
    ]
  )

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((category) => {
    const enSlug = enSlugByCategoryId.get(category.id)
    return {
      ...entry(`/category/${category.slug}`, 'weekly', 0.6),
      ...(enSlug
        ? {
            alternates: languagesFor(
              `/category/${category.slug}`,
              `/en/blog/category/${enSlug}`
            ),
          }
        : {}),
    }
  })

  const enCategoryRoutes: MetadataRoute.Sitemap = enCategories.map((category) =>
    entry(`/en/blog/category/${category.slug}`, 'weekly', 0.6)
  )

  /**
   * Hub pagination, missing entirely until now — in either locale.
   *
   * No `alternates`: page counts differ per locale under the D6 gate, so
   * /blog/page/2 and /en/blog/page/2 are different sets of posts (task 7.4).
   * Page 1 is omitted because it is canonical at the hub itself.
   */
  const paginationRoutes: MetadataRoute.Sitemap = (
    [
      ['/blog', plHub],
      ['/en/blog', enHub],
    ] as const
  ).flatMap(([base, hub]) =>
    Array.from({ length: Math.max(hub.totalPages - 1, 0) }, (_, i) =>
      entry(`${base}/page/${i + 2}`, 'weekly', 0.4)
    )
  )

  // Section pages — index + every detail URL in both locales, from the
  // canonical content lists (design D6). Each PL entry carries its EN
  // counterpart slug (`pairSlug`). The index URLs are listed even though
  // desktop chrome no longer links them (design D4), so they stay crawlable.
  //
  // Services read `USLUGI_PAGES`, not the roster: the SEO landings are kept out
  // of navigation, which makes the sitemap the main way a crawler finds them.
  const sectionRoutes: MetadataRoute.Sitemap = [
    { pl: '/branze', en: '/en/industries', items: INDUSTRIES },
    { pl: '/uslugi', en: '/en/services', items: USLUGI_PAGES },
  ].flatMap(({ pl, en, items }) => [
    entry(pl, 'monthly', 0.8),
    entry(en, 'monthly', 0.8),
    ...items.flatMap((item) => [
      entry(`${pl}/${item.slug}`, 'monthly', 0.7),
      entry(`${en}/${item.pairSlug}`, 'monthly', 0.7),
    ]),
  ])

  // Open positions — one URL per role per locale, from the same array the
  // careers page renders its tabs from, so a closed position leaves the sitemap
  // the moment it leaves the content. Ranked below the careers page itself:
  // these are its details, and they turn over faster than it does.
  const careersRoleRoutes: MetadataRoute.Sitemap = careersRoles.flatMap(
    (role) => {
      const pl = `/zostan-lama/${role.id}`
      const en = `/en/become-a-lama/${role.id}`
      return [
        { ...entry(pl, 'weekly', 0.6), alternates: languagesFor(pl, en) },
        entry(en, 'weekly', 0.6),
      ]
    }
  )

  return [
    ...staticRoutes,
    ...careersRoleRoutes,
    ...postRoutes,
    ...enPostRoutes,
    ...caseStudyRoutes,
    ...categoryRoutes,
    ...enCategoryRoutes,
    ...paginationRoutes,
    ...sectionRoutes,
  ]
}
