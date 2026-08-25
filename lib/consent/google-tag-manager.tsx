/** biome-ignore-all lint/security/noDangerouslySetInnerHtml: the GTM loader is
 * an inline script by definition; the only interpolated value is the container
 * id, a build-time environment variable, JSON-encoded on the way in. No
 * request-derived data reaches this markup. */

import { env } from '@/lib/env'

/**
 * The Google Tag Manager container. Rendered immediately after
 * `<ConsentInit />`, never before — GTM reads the same `dataLayer`, so the
 * denied Consent Mode defaults queued there govern every tag the container
 * fires, exactly as they govern the direct Google tag.
 *
 * Hand-rolled for the same reasons as `<GoogleAnalytics />` (see that file):
 * `@next/third-parties` injects after hydration, which makes the
 * defaults-before-tag ordering unassertable in the served document and loses
 * measurement on short visits.
 *
 * Deviations from Google's copy-paste snippet, both deliberate:
 *
 * - No `<noscript>` iframe. A visitor without JavaScript never sees the
 *   consent banner and cannot consent, and the noscript path bypasses Consent
 *   Mode entirely (the denied defaults are set by script). Rendering it would
 *   make no-JS the one path that pings Google without consent — backwards.
 * - `defer`, not the snippet's dynamic `async` injection. React leaves
 *   `defer` scripts where they are written, keeping the tag visible and
 *   ordered in the served HTML; `async` src scripts get hoisted to the top of
 *   `<head>`, above the consent defaults (measured in the 2026-07-30 build —
 *   see `<GoogleAnalytics />`).
 *
 * Gated by environment, not by branching logic (design.md Decision 11):
 * `NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID` is set only on Vercel Production, so
 * local development and previews cannot reach the container. The consent
 * mechanism stays fully functional without it.
 *
 * The container's contents are not under this repo's control. Two standing
 * guards, worth knowing when someone edits the container:
 *
 * - The consent signals only ever raise `analytics_storage`; the ad signals
 *   stay denied (`lib/consent/gtag.ts`). A marketing tag added to the
 *   container will not fire until the site grows a marketing consent
 *   category.
 * - The e2e cookie audit (`e2e/consent.e2e.ts`) fails when a tag sets a
 *   cookie the privacy policy does not declare.
 */
export function GoogleTagManager() {
  const gtmId = env.NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID
  if (!gtmId) return null

  return (
    <>
      {/* `dataLayer` already exists — <ConsentInit /> defined it, along with
          the denied defaults this event queues behind. The `||=` guard only
          matters if that script was blocked, and then it keeps this one from
          throwing. */}
      <script
        id="sl-gtm-init"
        dangerouslySetInnerHTML={{
          __html: `window.dataLayer=window.dataLayer||[];window.dataLayer.push({'gtm.start':new Date().getTime(),event:'gtm.js'});`,
        }}
      />
      <script
        defer
        src={`https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(gtmId)}`}
      />
    </>
  )
}
