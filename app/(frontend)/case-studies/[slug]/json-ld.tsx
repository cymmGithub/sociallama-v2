import {
  absoluteUrl,
  breadcrumbList,
  jsonLdScript,
  organizationRef,
} from '@/components/seo/structured-data'
import { APP_BASE_URL } from '@/lib/env'
import type { Locale } from '@/lib/i18n/slug-map'
import type { CaseStudy } from '@/payload-types'

/**
 * Structured data for a case study detail page: an `Article` (schema.org has
 * no CaseStudy type — Article is the honest fit, with the client as `about`)
 * plus a `BreadcrumbList`. Emitted as one JSON-LD script carrying both.
 */
export function CaseStudyJsonLd({
  study,
  coverUrl,
  basePath = '/case-studies',
  locale = 'pl',
}: {
  study: CaseStudy
  coverUrl: string | null | undefined
  basePath?: string
  locale?: Locale
}) {
  const pageUrl = `${APP_BASE_URL}${basePath}/${study.slug}`
  const image = absoluteUrl(coverUrl)
  const description = study.seo?.metaDescription || study.excerpt || undefined

  const article = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    inLanguage: locale,
    headline: study.title,
    ...(description ? { description } : {}),
    ...(image ? { image: [image] } : {}),
    ...(study.publishedAt ? { datePublished: study.publishedAt } : {}),
    dateModified: study.updatedAt,
    author: organizationRef(),
    publisher: organizationRef(),
    about: {
      '@type': 'Organization',
      name: study.client.name,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': pageUrl,
    },
  }

  const breadcrumbs = breadcrumbList([
    { name: 'Case studies', url: `${APP_BASE_URL}${basePath}` },
    // The leaf is the client name, matching the visible breadcrumb — per
    // Google's guidance that structured breadcrumbs reflect on-page navigation.
    { name: study.client.name, url: pageUrl },
  ])

  return jsonLdScript([article, breadcrumbs])
}
