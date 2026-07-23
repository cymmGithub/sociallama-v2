import type { MetadataRoute } from 'next'
import { INDUSTRIES } from '@/lib/content/branze'
import { APP_BASE_URL } from '@/lib/env'
import { pathPairs } from '@/lib/i18n/slug-map'
import {
  getCaseStudiesForSitemap,
  getCategories,
  getPostsForSitemap,
} from '@/lib/payload/queries'
import { STATIC_ROUTES } from '@/lib/static-routes'

// EN routes whose page is only a redirect stub (no unique content yet) — kept
// out of the sitemap until they have real translations.
const EN_STUB_PATHS = new Set(['/en/terms', '/en/cookies'])

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseRoutes: MetadataRoute.Sitemap = STATIC_ROUTES.map(
    ({ path, changeFrequency, priority }) => ({
      url: path === '/' ? APP_BASE_URL : `${APP_BASE_URL}${path}`,
      lastModified: new Date(),
      changeFrequency,
      priority,
    })
  )

  // Published only — both queries constrain _status; drafts never appear here.
  const [posts, categories, caseStudies] = await Promise.all([
    getPostsForSitemap(),
    getCategories(),
    getCaseStudiesForSitemap(),
  ])

  const postRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${APP_BASE_URL}/${post.slug}`,
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

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${APP_BASE_URL}/category/${category.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.6,
  }))

  // English marketing/legal pages (translated-slug URLs from the slug map) plus
  // the EN case-study details (same slugs + updatedAt as the Polish docs).
  const enStaticRoutes: MetadataRoute.Sitemap = pathPairs
    .map(([, en]) => en)
    .filter((en) => !EN_STUB_PATHS.has(en))
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

  // All 24 industry URLs (12 PL + 12 EN) from the canonical list (design D6).
  // Each PL entry carries its EN counterpart slug (`pairSlug`).
  const industryRoutes: MetadataRoute.Sitemap = INDUSTRIES.flatMap(
    (industry) => [
      {
        url: `${APP_BASE_URL}/branze/${industry.slug}`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      },
      {
        url: `${APP_BASE_URL}/en/industries/${industry.pairSlug}`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      },
    ]
  )

  return [
    ...baseRoutes,
    ...postRoutes,
    ...caseStudyRoutes,
    ...categoryRoutes,
    ...enStaticRoutes,
    ...enCaseStudyRoutes,
    ...industryRoutes,
  ]
}
