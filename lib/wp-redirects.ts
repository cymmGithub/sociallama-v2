/**
 * Legacy WordPress URL redirects — GENERATED FILE, do not edit by hand.
 * Regenerate with: bun ./lib/scripts/generate-wp-redirects.ts
 * (dispositions are recorded in that script; the WP host is gone after
 * cutover, so this committed output is the artifact of record).
 *
 * Generated from the live Yoast sitemaps: 151 tag URLs,
 * 14 page URLs. `statusCode: 301` throughout — Next's
 * `permanent: true` would emit 308; the seo-url-parity spec requires 301.
 */

interface WpRedirect {
  source: string
  destination: string
  statusCode: 301
}

export const wpRedirects: WpRedirect[] = [
  // All 151 /tag/* archive pages are thin content — blanket rule.
  { source: '/tag/:slug', destination: '/blog', statusCode: 301 },
  // /oferta/ — offer overview → services section anchor
  { source: '/oferta', destination: '/#uslugi', statusCode: 301 },
  // /z-lama-warto/ — why-us page → about section anchor
  { source: '/z-lama-warto', destination: '/#o-nas', statusCode: 301 },
  // /500-zl-na-reklame/ — user decision 2026-07-17: obsolete 2017 ad promo → services anchor
  { source: '/500-zl-na-reklame', destination: '/#uslugi', statusCode: 301 },
  // /cookie-policy/ — user decision 2026-07-17: cookie info folds into the privacy policy page
  {
    source: '/cookie-policy',
    destination: '/polityka-prywatnosci',
    statusCode: 301,
  },
  // /oferta/pinterest/ — platform offer page → services section anchor
  { source: '/oferta/pinterest', destination: '/#uslugi', statusCode: 301 },
  // /oferta/facebook/ — platform offer page → services section anchor
  { source: '/oferta/facebook', destination: '/#uslugi', statusCode: 301 },
  // /oferta/instagram/ — platform offer page → services section anchor
  { source: '/oferta/instagram', destination: '/#uslugi', statusCode: 301 },
  // /oferta/linkedin/ — platform offer page → services section anchor
  { source: '/oferta/linkedin', destination: '/#uslugi', statusCode: 301 },
  // /oferta/tiktok/ — platform offer page → services section anchor
  { source: '/oferta/tiktok', destination: '/#uslugi', statusCode: 301 },
  // /oferta/twitter/ — platform offer page → services section anchor
  { source: '/oferta/twitter', destination: '/#uslugi', statusCode: 301 },
]
