import { jsonLdScript } from '@/components/seo/structured-data'
import { APP_NAME } from '@/lib/content/site'
import { APP_BASE_URL } from '@/lib/env'
import type { Locale } from '@/lib/i18n/slug-map'
import type { CaseStudy } from '@/payload-types'

/**
 * Structured data for the `/case-studies` listing: a `CollectionPage` whose
 * `mainEntity` is an `ItemList` of the published studies, each linked by URL and
 * named by client. Helps the hub surface as a collection and clarifies each
 * study as an entity. No `BreadcrumbList` — the listing has no visible
 * breadcrumb to mirror (structured breadcrumbs should reflect on-page nav).
 */
export function CaseStudiesListingJsonLd({
  studies,
  basePath = '/case-studies',
  locale = 'pl',
  name,
  description,
}: {
  studies: CaseStudy[]
  basePath?: string
  locale?: Locale
  name: string
  description?: string
}) {
  const pageUrl = `${APP_BASE_URL}${basePath}`

  return jsonLdScript({
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    inLanguage: locale,
    name,
    ...(description ? { description } : {}),
    url: pageUrl,
    isPartOf: {
      '@type': 'WebSite',
      name: APP_NAME,
      url: APP_BASE_URL,
    },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: studies.length,
      itemListElement: studies.map((study, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: `${pageUrl}/${study.slug}`,
        name: study.client.name,
      })),
    },
  })
}
