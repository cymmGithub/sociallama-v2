import type { MetadataRoute } from 'next'
import { INDUSTRIES } from '@/lib/content/branze'
import { SERVICES } from '@/lib/content/uslugi'
import { APP_BASE_URL } from '@/lib/env'
import { pathPairs } from '@/lib/i18n/slug-map'
import {
  getCaseStudiesForSitemap,
  getCategories,
  getPostsForSitemap,
  getPostsPage,
} from '@/lib/payload/queries'
import { STATIC_ROUTES } from '@/lib/static-routes'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseRoutes: MetadataRoute.Sitemap = STATIC_ROUTES.map(
    ({ path, changeFrequency, priority }) => ({
      url: path === '/' ? APP_BASE_URL : `${APP_BASE_URL}${path}`,
      lastModified: new Date(),
      changeFrequency,
      priority,
    })
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

  /** hreflang for a pair, `x-default` on Polish (design D8). */
  const languagesFor = (pl: string, en: string) => ({
    languages: {
      pl: `${APP_BASE_URL}${pl}`,
      en: `${APP_BASE_URL}${en}`,
      'x-default': `${APP_BASE_URL}${pl}`,
    },
  })

  const postRoutes: MetadataRoute.Sitemap = posts.map((post) => {
    const enSlug = enSlugByPostId.get(post.id)
    return {
      url: `${APP_BASE_URL}/${post.slug}`,
      lastModified: new Date(post.updatedAt),
      changeFrequency: 'monthly',
      priority: 0.7,
      ...(enSlug
        ? { alternates: languagesFor(`/${post.slug}`, `/en/blog/${enSlug}`) }
        : {}),
    }
  })

  const enPostRoutes: MetadataRoute.Sitemap = enPosts.map((post) => ({
    url: `${APP_BASE_URL}/en/blog/${post.slug}`,
    lastModified: new Date(post.updatedAt),
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  const caseStudyRoutes: MetadataRoute.Sitemap = caseStudies.map((study) => ({
    url: `${APP_BASE_URL}/case-studies/${study.slug}`,
    lastModified: new Date(study.updatedAt),
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((category) => {
    const enSlug = enSlugByCategoryId.get(category.id)
    return {
      url: `${APP_BASE_URL}/category/${category.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
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

  const enCategoryRoutes: MetadataRoute.Sitemap = enCategories.map(
    (category) => ({
      url: `${APP_BASE_URL}/en/blog/category/${category.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    })
  )

  /**
   * Hub pagination, missing entirely until now — in either locale.
   *
   * No `alternates`: page counts differ per locale under the D6 gate, so
   * /blog/page/2 and /en/blog/page/2 are different sets of posts (task 7.4).
   * Page 1 is omitted because it is canonical at the hub itself.
   */
  const paginationRoutes: MetadataRoute.Sitemap = [
    ...Array.from({ length: Math.max(plHub.totalPages - 1, 0) }, (_, i) => ({
      url: `${APP_BASE_URL}/blog/page/${i + 2}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.4,
    })),
    ...Array.from({ length: Math.max(enHub.totalPages - 1, 0) }, (_, i) => ({
      url: `${APP_BASE_URL}/en/blog/page/${i + 2}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.4,
    })),
  ]

  // English marketing/legal pages (translated-slug URLs from the slug map) plus
  // the EN case-study details (same slugs + updatedAt as the Polish docs).
  const enStaticRoutes: MetadataRoute.Sitemap = pathPairs
    .map(([, en]) => en)
    .map((en) => ({
      url: `${APP_BASE_URL}${en}`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: en === '/en' ? 0.9 : 0.6,
    }))

  const enCaseStudyRoutes: MetadataRoute.Sitemap = caseStudies.map((study) => ({
    url: `${APP_BASE_URL}/en/case-studies/${study.slug}`,
    lastModified: new Date(study.updatedAt),
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  // Industry pages — the index + all 24 detail URLs (12 PL + 12 EN) from the
  // canonical list (design D6). Each PL entry carries its EN counterpart slug
  // (`pairSlug`). The two index URLs are listed here even though desktop chrome
  // no longer links them (design D4), so they stay crawlable.
  const industryRoutes: MetadataRoute.Sitemap = [
    { path: '/branze', priority: 0.8 },
    { path: '/en/industries', priority: 0.8 },
    ...INDUSTRIES.flatMap((industry) => [
      { path: `/branze/${industry.slug}`, priority: 0.7 },
      { path: `/en/industries/${industry.pairSlug}`, priority: 0.7 },
    ]),
  ].map(({ path, priority }) => ({
    url: `${APP_BASE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority,
  }))

  // Service pages — the index + six services in both locales. Each PL entry
  // carries its EN counterpart slug (`pairSlug`), mirroring the industry block.
  const serviceRoutes: MetadataRoute.Sitemap = [
    { path: '/uslugi', priority: 0.8 },
    { path: '/en/services', priority: 0.8 },
    ...SERVICES.flatMap((service) => [
      { path: `/uslugi/${service.slug}`, priority: 0.7 },
      { path: `/en/services/${service.pairSlug}`, priority: 0.7 },
    ]),
  ].map(({ path, priority }) => ({
    url: `${APP_BASE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority,
  }))

  return [
    ...baseRoutes,
    ...postRoutes,
    ...enPostRoutes,
    ...caseStudyRoutes,
    ...categoryRoutes,
    ...enCategoryRoutes,
    ...paginationRoutes,
    ...enStaticRoutes,
    ...enCaseStudyRoutes,
    ...industryRoutes,
    ...serviceRoutes,
  ]
}
