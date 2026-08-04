/**
 * Legacy WordPress URL redirects — GENERATED FILE, do not edit by hand.
 * Regenerate with: bun ./lib/scripts/generate-wp-redirects.ts
 * (dispositions are recorded in that script; the WP host is gone after
 * cutover, so this committed output is the artifact of record).
 *
 * Generated from the live Yoast sitemaps: 151 tag URLs,
 * 14 page URLs. `statusCode: 301` throughout — Next's
 * `permanent: true` would emit 308; the seo-url-parity spec requires 301.
 *
 * Two later amendments, each applied to this file and to the generator's
 * disposition table together, by hand — the generator reads the WP host, which
 * is decommissioned, so it can no longer be re-run. The disposition table
 * remains the decision record either way.
 *
 *   2026-08-14, seo-uslugi-branze — the six `/oferta/<platform>` URLs now point
 *   at `/uslugi/prowadzenie-social-media`, their content successor, rather than
 *   the `/#uslugi` homepage anchor.
 *
 *   2026-08-14, retarget-wp-redirects — the last three anchor targets go
 *   fragment-free (board decision 2026-08-04): `/oferta` and
 *   `/500-zl-na-reklame` to `/uslugi`, `/z-lama-warto` to `/o-nas`. Crawlers
 *   ignore a fragment in a redirect target, so an anchor destination
 *   consolidates equity into `/` instead of the section it names. No rule in
 *   this file carries a fragment any more.
 */

interface WpRedirect {
  source: string
  destination: string
  statusCode: 301
}

export const wpRedirects: WpRedirect[] = [
  // All 151 /tag/* archive pages are thin content — blanket rule.
  { source: '/tag/:slug', destination: '/blog', statusCode: 301 },
  // /oferta/ — board decision 2026-08-04: offer overview → services hub (fragment-free)
  { source: '/oferta', destination: '/uslugi', statusCode: 301 },
  // /z-lama-warto/ — board decision 2026-08-04: why-us page → about page (fragment-free)
  { source: '/z-lama-warto', destination: '/o-nas', statusCode: 301 },
  // /500-zl-na-reklame/ — board decision 2026-08-04: obsolete 2017 ad promo → services hub (fragment-free)
  { source: '/500-zl-na-reklame', destination: '/uslugi', statusCode: 301 },
  // /cookie-policy/ — user decision 2026-07-17: cookie info folds into the privacy policy page
  {
    source: '/cookie-policy',
    destination: '/polityka-prywatnosci',
    statusCode: 301,
  },
  // /oferta/pinterest/ — platform offer page → prowadzenie social media landing (content successor; seo-uslugi-branze 2026-08-14)
  {
    source: '/oferta/pinterest',
    destination: '/uslugi/prowadzenie-social-media',
    statusCode: 301,
  },
  // /oferta/facebook/ — platform offer page → prowadzenie social media landing (content successor; seo-uslugi-branze 2026-08-14)
  {
    source: '/oferta/facebook',
    destination: '/uslugi/prowadzenie-social-media',
    statusCode: 301,
  },
  // /oferta/instagram/ — platform offer page → prowadzenie social media landing (content successor; seo-uslugi-branze 2026-08-14)
  {
    source: '/oferta/instagram',
    destination: '/uslugi/prowadzenie-social-media',
    statusCode: 301,
  },
  // /oferta/linkedin/ — platform offer page → prowadzenie social media landing (content successor; seo-uslugi-branze 2026-08-14)
  {
    source: '/oferta/linkedin',
    destination: '/uslugi/prowadzenie-social-media',
    statusCode: 301,
  },
  // /oferta/tiktok/ — platform offer page → prowadzenie social media landing (content successor; seo-uslugi-branze 2026-08-14)
  {
    source: '/oferta/tiktok',
    destination: '/uslugi/prowadzenie-social-media',
    statusCode: 301,
  },
  // /oferta/twitter/ — platform offer page → prowadzenie social media landing (content successor; seo-uslugi-branze 2026-08-14)
  {
    source: '/oferta/twitter',
    destination: '/uslugi/prowadzenie-social-media',
    statusCode: 301,
  },
]
