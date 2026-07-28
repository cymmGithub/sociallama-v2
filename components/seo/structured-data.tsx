import { type LocalizedHome, socials } from '@/lib/content/home'
import { APP_NAME } from '@/lib/content/site'
import { APP_BASE_URL } from '@/lib/env'
import { localeOf } from '@/lib/i18n/slug-map'

/**
 * Site-wide structured data (JSON-LD), placed per Google's rules:
 *
 * - `OrganizationJsonLd` — the brand entity. Rendered in both root layouts so
 *   every page carries a baseline `Organization`.
 * - `WebSiteJsonLd` — powers Google's site-name feature. That feature is only
 *   honored at the domain root, so this is rendered on the Polish homepage (`/`)
 *   alone. (It is NOT the deprecated Sitelinks Search Box — no `SearchAction`.)
 * - `FaqJsonLd` — the homepage FAQ section, one node per locale homepage.
 *
 * Both nodes share stable `@id`s so `WebSite.publisher` resolves to the same
 * Organization node the layout already emits.
 */

export const ORG_ID = `${APP_BASE_URL}/#organization`
const WEBSITE_ID = `${APP_BASE_URL}/#website`
const CONTACT_EMAIL = 'halohalo@sociallama.pl'

/**
 * Reference the Organization node emitted by the root layout instead of
 * inlining a duplicate. Any page-level node that needs the brand entity
 * (a post's `publisher`, or its `author` when Social Lama wrote it) points
 * here, so there is exactly one Organization in the site's graph.
 */
export function organizationRef() {
  return { '@id': ORG_ID }
}

// The YouTube entry points at the parent group (@GOODONEGROUP), not a Social
// Lama channel — so it models the parent relationship instead of leaking into
// Social Lama's own `sameAs` identity set.
const groupYouTube = socials.find((s) => s.label === 'YouTube')?.href
const sameAs = socials.filter((s) => s.label !== 'YouTube').map((s) => s.href)

function jsonLdScript(node: object) {
  return (
    <script
      type="application/ld+json"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD must be inline script content
      dangerouslySetInnerHTML={{ __html: JSON.stringify(node) }}
    />
  )
}

/** `Organization` entity. `description` differs per locale (PL vs EN copy). */
export function OrganizationJsonLd({ description }: { description: string }) {
  return jsonLdScript({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': ORG_ID,
    name: APP_NAME,
    url: APP_BASE_URL,
    logo: {
      '@type': 'ImageObject',
      url: `${APP_BASE_URL}/icon.png`,
      width: 192,
      height: 192,
    },
    description,
    email: CONTACT_EMAIL,
    sameAs,
    parentOrganization: {
      '@type': 'Organization',
      name: 'GOODONE GROUP',
      ...(groupYouTube ? { sameAs: [groupYouTube] } : {}),
    },
  })
}

/**
 * `FAQPage` node for the homepage FAQ section.
 *
 * Fed the same `faq.items` array the section renders, from each locale's
 * content file — Google requires the markup to match the visible copy, and
 * hand-maintained duplicates drift. Rendered server-side from `page.tsx`, not
 * from the client section component: structured data has no reason to wait on
 * hydration. Answers are plain strings in `home.ts`, so nothing needs stripping
 * before serialising.
 *
 * Expect no rich result: FAQ rich results have been restricted to authoritative
 * government and health sites since August 2023. This is here to be parsed by
 * answer engines, which is a different (and cheaper) bet.
 */
export function FaqJsonLd({
  items,
  path,
}: {
  items: LocalizedHome['faq']['items']
  /** Path of the page carrying the section, e.g. `/` or `/en`. */
  path: string
}) {
  const pageUrl = `${APP_BASE_URL}${path}`

  return jsonLdScript({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `${pageUrl}#faq`,
    url: pageUrl,
    inLanguage: localeOf(path),
    publisher: organizationRef(),
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  })
}

/** `WebSite` node for the site-name feature. Homepage-root only. */
export function WebSiteJsonLd() {
  return jsonLdScript({
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    name: APP_NAME,
    url: APP_BASE_URL,
    inLanguage: 'pl',
    publisher: { '@id': ORG_ID },
  })
}
