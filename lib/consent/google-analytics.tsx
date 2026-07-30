/** biome-ignore-all lint/security/noDangerouslySetInnerHtml: the Google tag is
 * an inline script by definition; the only interpolated value is the
 * measurement id, a build-time environment variable, JSON-encoded on the way
 * in. No request-derived data reaches this markup. */

import { env } from '@/lib/env'

/**
 * The Google tag. Rendered immediately after `<ConsentInit />`, never before.
 *
 * Hand-rolled rather than `@next/third-parties/google` on purpose. That
 * package's `<GoogleAnalytics>` renders through `next/script` at
 * `afterInteractive`, which in the App Router emits NO script into the served
 * HTML — only a `<link rel="preload">` — and injects both tags from a
 * `useEffect` after hydration (see `next/dist/client/script.js`). Correctness
 * would survive that, because `dataLayer` ordering is what matters and the
 * consent defaults are already queued. Two things would not:
 *
 *  1. The `web-analytics` spec requires the consent-default script to precede
 *     the Google tag *in the document*. With the tag absent from the document
 *     that requirement cannot be asserted, only reasoned about.
 *  2. Waiting for hydration to even begin fetching `gtag.js` loses measurement
 *     on exactly the short, bouncy visits that are hardest to reason about.
 *
 * Rendering the tag ourselves costs seven lines and removes a dependency.
 *
 * Gated by environment, not by branching logic (design.md Decision 11):
 * `NEXT_PUBLIC_GOOGLE_ANALYTICS` is set only on Vercel Production, so local
 * development and previews cannot reach the property. The consent mechanism
 * stays fully functional without it — the banner, the panel and the cookie all
 * work, there is simply nothing to grant consent *to*.
 */
export function GoogleAnalytics() {
  const gaId = env.NEXT_PUBLIC_GOOGLE_ANALYTICS
  if (!gaId) return null

  return (
    <>
      {/* `defer`, not `async`, and that is not a style choice. React 19 treats
          `<script async src>` as a hoistable resource and lifts it to the TOP of
          <head> — above the consent defaults, measured in the 2026-07-30 build.
          The dataLayer ordering still held (both inline scripts keep their
          relative position, so `default` precedes `config` regardless), but it
          turned a guarantee into a race worth reasoning about. React leaves
          `defer` scripts where they are written. Still non-blocking; it simply
          executes once parsing is done. */}
      <script
        defer
        src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`}
      />
      {/* `gtag` and `dataLayer` already exist — <ConsentInit /> defined them,
          along with the denied defaults these commands queue behind. */}
      <script
        id="sl-ga-config"
        dangerouslySetInnerHTML={{
          __html: `gtag('js',new Date());gtag('config',${JSON.stringify(gaId)});`,
        }}
      />
    </>
  )
}
