/**
 * Google Consent Mode v2 — the runtime half.
 *
 * The denied defaults are set in the inline `<head>` script
 * (`lib/consent/consent-init.tsx`) before anything Google-owned runs. This
 * module handles the other direction: a visitor changing their mind while the
 * page is open, so acceptance takes effect without a reload.
 *
 * `window.gtag` is defined by that head script, not by Google's library, so it
 * exists from the first byte of `<head>` onwards — pushed commands queue in
 * `dataLayer` and are replayed in order whenever `gtag.js` finishes loading.
 * That ordering, not script-tag ordering, is what makes consent land before the
 * first measurement.
 */

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
  }
}

type ConsentSignal = 'granted' | 'denied'

/**
 * The v2 signal set, as the update path sends it.
 *
 * The three ad signals stay `denied` unconditionally: there is no marketing
 * category, so there is no consent that could raise them. They are sent
 * explicitly rather than omitted so the state Google holds is unambiguous —
 * an omitted signal is "unchanged", which is not the same statement.
 */
function signals(analytics: boolean): Record<string, ConsentSignal> {
  const analyticsSignal: ConsentSignal = analytics ? 'granted' : 'denied'
  return {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: analyticsSignal,
    personalization_storage: 'denied',
  }
}

/**
 * Push a Consent Mode update for the current decision.
 *
 * Called by the store on every accept / refuse / save, so no call site can
 * write the cookie without also telling Google.
 */
export function updateConsent(analytics: boolean): void {
  if (typeof window === 'undefined') return
  // Absent only if the head script was blocked (a `script-src` CSP directive
  // would do it — see the web-analytics spec). Nothing to update in that case,
  // and the denied defaults were never set either, so failing quietly here is
  // the honest behaviour: no consent is claimed.
  window.gtag?.('consent', 'update', signals(analytics))
}
