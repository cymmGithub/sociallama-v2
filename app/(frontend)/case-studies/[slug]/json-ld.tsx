import { APP_NAME } from '@/lib/content/site'
import { APP_BASE_URL } from '@/lib/env'
import type { Locale } from '@/lib/i18n/slug-map'
import type { CaseStudy } from '@/payload-types'

/** Absolute-ify a Payload media URL (local dev uploads are relative). */
function absolute(url: string | null | undefined): string | undefined {
  if (!url) {
    return undefined
  }
  return url.startsWith('http') ? url : `${APP_BASE_URL}${url}`
}

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
  const image = absolute(coverUrl)
  const description = study.seo?.metaDescription || study.excerpt || undefined

  const publisher = {
    '@type': 'Organization',
    name: APP_NAME,
    url: APP_BASE_URL,
    logo: {
      '@type': 'ImageObject',
      url: `${APP_BASE_URL}/icon.png`,
    },
  }

  const article = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    inLanguage: locale,
    headline: study.title,
    ...(description ? { description } : {}),
    ...(image ? { image: [image] } : {}),
    ...(study.publishedAt ? { datePublished: study.publishedAt } : {}),
    dateModified: study.updatedAt,
    author: publisher,
    publisher,
    about: {
      '@type': 'Organization',
      name: study.client.name,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': pageUrl,
    },
  }

  const breadcrumbs = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Case studies',
        item: `${APP_BASE_URL}${basePath}`,
      },
      {
        // Matches the visible breadcrumb leaf (client name), per Google's
        // guidance that structured breadcrumbs reflect on-page navigation.
        '@type': 'ListItem',
        position: 2,
        name: study.client.name,
        item: pageUrl,
      },
    ],
  }

  return (
    <script
      type="application/ld+json"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD must be inline script content
      dangerouslySetInnerHTML={{
        __html: JSON.stringify([article, breadcrumbs]),
      }}
    />
  )
}
