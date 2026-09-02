import { APP_NAME } from '@/lib/content/site'
import { socials } from '@/lib/content/socials'
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

/**
 * The one place JSON-LD becomes markup. Takes a single node or an array of
 * nodes (pages that emit several use one script carrying all of them).
 *
 * CMS free text (post titles, excerpts, client names) reaches this sink and
 * `JSON.stringify` leaves `<` literal, so a stored `</script>` would close the
 * tag and turn the rest into markup. The escaped form is valid JSON that parses
 * back to `<`, so consumers see identical data.
 */
export function jsonLdScript(node: object) {
  return (
    <script
      type="application/ld+json"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD must be inline script content
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(node).replace(/</g, '\\u003c'),
      }}
    />
  )
}

/** Absolute-ify a Payload media URL (local dev uploads are relative). */
export function absoluteUrl(
  url: string | null | undefined
): string | undefined {
  if (!url) {
    return undefined
  }
  return url.startsWith('http') ? url : `${APP_BASE_URL}${url}`
}

/**
 * `BreadcrumbList` node. Pass the trail in visible order — positions are
 * derived, so they cannot drift from the on-page breadcrumb.
 */
export function breadcrumbList(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
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
      // The group's own site, which the footer signature now links to. Without
      // it this node was an unresolvable name — a claim of parentage with
      // nothing for a consumer to resolve it against.
      url: 'https://goodone.co/',
      ...(groupYouTube ? { sameAs: [groupYouTube] } : {}),
    },
  })
}

/**
 * `FAQPage` node for a page that carries an FAQ section — both locale
 * homepages, and the `/uslugi/prowadzenie-social-media` landing and its English
 * twin.
 *
 * Fed the same array the section renders, from the locale's own content file —
 * Google requires the markup to match the visible copy, and hand-maintained
 * duplicates drift. Rendered server-side from `page.tsx`, not from the client
 * section component: structured data has no reason to wait on hydration.
 * Answers are plain strings in the content modules, so nothing needs stripping
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
  /** Structural rather than `LocalizedHome['faq']['items']`: the service-page
   *  `faq` section carries the same pair and is not a homepage type. */
  items: readonly { question: string; answer: string }[]
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
