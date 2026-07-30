/** biome-ignore-all lint/security/noDangerouslySetInnerHtml: this component
 * exists to emit an inline script — that is the entire point (design.md
 * Decision 3). Its payload is a module constant built from other module
 * constants; nothing request-derived or user-supplied reaches it. */

import { CONSENT_COOKIE_NAME, CONSENT_VERSION } from '@/lib/consent/cookie'

/**
 * Google Consent Mode v2 defaults, plus the synchronous cookie upgrade
 * (design.md Decision 3 — the one decision everything else assembles around).
 *
 * Why this is an inline `<script>` in `<head>` and not a component effect:
 *
 * Consent Mode wants the defaults set before the Google tag runs. A RETURNING
 * visitor who already accepted also needs their `update` queued before the
 * first page view, or that visit is recorded as denied and modelled —
 * permanently degrading the data for exactly the people who agreed to be
 * measured. An effect runs after hydration, which on a cold mobile load is
 * routinely hundreds of milliseconds too late.
 *
 * The obvious server-side fix is unavailable here: `cookies()` in either root
 * layout would opt the whole tree into dynamic rendering and destroy this
 * site's PPR. But `document.cookie` is readable synchronously from an inline
 * script — no server, no hydration, no React involved — so the defaults and the
 * returning visitor's upgrade both land while `<head>` is still parsing.
 *
 * What actually guarantees ordering is `dataLayer`, not script tags: every
 * command below is queued into the array and replayed in order whenever
 * `gtag.js` finishes loading. `wait_for_update` is belt-and-braces for the case
 * where the cookie is malformed and the upgrade never happens.
 *
 * ── DUPLICATION NOTICE ────────────────────────────────────────────────────
 * The cookie read below is a hand-written copy of `parseConsent()` in
 * `lib/consent/cookie.ts`. It cannot import it: this runs before any bundle
 * exists. The cookie name and version ARE interpolated from that module, so the
 * two readers cannot disagree about those — but if you change the cookie's
 * SHAPE, change it here too. There are two readers and only one of them can
 * import anything.
 * ──────────────────────────────────────────────────────────────────────────
 *
 * No nonce: `next.config.ts` sets no `script-src` directive. Adding one would
 * block this script silently — consent defaults would never be set and
 * analytics would degrade with no visible error. That is recorded as a
 * requirement in the `web-analytics` spec, not left to memory.
 */

/** The three ad signals have no category that could raise them, so they are
 *  denied in both the default and the update. `functionality_storage` and
 *  `security_storage` are granted: they cover storage the site needs to work. */
const DEFAULTS = [
  "ad_storage:'denied'",
  "ad_user_data:'denied'",
  "ad_personalization:'denied'",
  "analytics_storage:'denied'",
  "personalization_storage:'denied'",
  "functionality_storage:'granted'",
  "security_storage:'granted'",
  'wait_for_update:500',
].join(',')

const SCRIPT = `
window.dataLayer=window.dataLayer||[];
function gtag(){window.dataLayer.push(arguments)}
window.gtag=gtag;
gtag('consent','default',{${DEFAULTS}});
try{
var c=document.cookie.split(';');
for(var i=0;i<c.length;i++){
var p=c[i],e=p.indexOf('=');
if(e<0)continue;
if(p.slice(0,e).trim()!==${JSON.stringify(CONSENT_COOKIE_NAME)})continue;
var d=JSON.parse(decodeURIComponent(p.slice(e+1).trim()));
if(d&&d.v===${CONSENT_VERSION}&&typeof d.analytics==='boolean'){
gtag('consent','update',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:d.analytics?'granted':'denied',personalization_storage:'denied'});
}
break;
}
}catch(_){}
`.trim()

export function ConsentInit() {
  return (
    <script id="sl-consent-init" dangerouslySetInnerHTML={{ __html: SCRIPT }} />
  )
}
