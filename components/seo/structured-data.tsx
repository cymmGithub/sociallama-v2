import { socials } from '@/lib/content/home'
import { APP_NAME } from '@/lib/content/site'
import { APP_BASE_URL } from '@/lib/env'

/**
 * Site-wide structured data (JSON-LD). Two nodes, placed per Google's rules:
 *
 * - `OrganizationJsonLd` — the brand entity. Rendered in both root layouts so
 *   every page carries a baseline `Organization`.
 * - `WebSiteJsonLd` — powers Google's site-name feature. That feature is only
 *   honored at the domain root, so this is rendered on the Polish homepage (`/`)
 *   alone. (It is NOT the deprecated Sitelinks Search Box — no `SearchAction`.)
 *
 * Both nodes share stable `@id`s so `WebSite.publisher` resolves to the same
 * Organization node the layout already emits.
 */

const ORG_ID = `${APP_BASE_URL}/#organization`
const WEBSITE_ID = `${APP_BASE_URL}/#website`
const CONTACT_EMAIL = 'halohalo@sociallama.pl'

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
