## Context

State of the repo before this change:

- `@vercel/analytics` ^2.0.1 is mounted in both root layouts — `app/(frontend)/layout.tsx:135` and `app/(frontend-en)/layout.tsx:128`.
- No GA, no GTM, no `gtag`, no `@next/third-parties`.
- No consent mechanism, no consent cookie, no `beforeSend` redaction on Vercel Analytics.
- `next.config.ts:166` sets `Content-Security-Policy: frame-ancestors 'self';` — **no `script-src` directive**, so inline scripts need no nonce. This is load-bearing for Decision 3.
- `zustand` ^5.0.14 and `@base-ui/react` ^1.6.0 are already dependencies.
- Content follows a `lib/content/x.ts` + `x.en.ts` twin pattern with a type-enforced `Localized<>` parity check.

Sources consulted, both fetched during design rather than recalled:

- `https://vercel.com/docs/analytics/privacy-policy` (last updated 2026-06-26)
- `https://vercel.com/docs/speed-insights/privacy-policy` (last updated 2026-03-18)

---

## Decision 1 — Vercel Analytics stays unconditional; only GA is gated

The consent question is not "is this personal data" — it is "does this touch the device's storage". ePrivacy art. 5(3) fires on storing or reading information on terminal equipment, nothing else. RODO governs everything that happens afterwards. Two laws, two triggers.

Vercel Web Analytics writes no cookie, no `localStorage`, and reads nothing back. Visitors are identified by a hash computed server-side from the incoming request and discarded after 24 hours. It never touches the device, so the banner obligation never arises. RODO still covers the transient IP handling — answered by legitimate interest, a privacy-policy paragraph, and Vercel's DPA.

GA4 writes `_ga` and `_ga_<MEASUREMENT_ID>` to the device. Consent required, no exceptions available.

**Two conditions attach to the Vercel conclusion**, and both are ongoing obligations rather than one-off work:

1. **No custom events carrying personal data.** The moment something like `track('lead', { email })` ships, the analysis above stops holding.
2. **PII redacted from URLs via `beforeSend`.** Current routes are clean (`/blog/[slug]`, `/case-studies/[slug]`), so this is presently theoretical — but it is a standing constraint on anything that puts identifiers in a path or query string.

Speed Insights, if ever added, sits on the same side of the line for the same reasons.

## Decision 2 — Consent Mode v2 default-denied, not a hard block

Two shapes were available.

**Default-denied (chosen).** `gtag` loads on every page with all four v2 signals set to `denied`. Google receives *cookieless pings* — no `_ga` is written, but a request carrying an IP and page URL does reach Google. On acceptance, `gtag('consent','update', …)` flips the signals and normal measurement begins.

**Hard block (rejected).** Nothing Google-owned loads until acceptance.

The trade is real and this is not a case where one answer is obviously right. Default-denied is Google's own recommendation, gives conversion modelling for the refusing population, and — the underrated part — makes the refusing population *visible at all*, so the consent rate is measurable instead of guessed. Against it: the cookieless ping is a transmission to Google before any consent, and several EU authorities (the CNIL, and the Austrian and Italian DPAs in the *Google Analytics* decisions) take the view that contacting Google's servers is itself the act needing a basis, not merely the cookie.

Chosen on the strength of the data argument, with the DPA position recorded rather than dismissed. **The reversal is genuinely cheap** — moving `<GoogleAnalytics>` behind a consent check in one component converts this to a hard block without touching the cookie, the store, the banner or the copy. That cheapness is part of why default-denied is acceptable to commit to now.

Expected consent rate for a compliant banner in Poland is roughly 40–70%. Plan the analytics on that basis; the modelled remainder is an estimate, not a measurement.

## Decision 3 — One inline head script that reads the cookie synchronously

This is the load-bearing decision. Everything else is assembly.

Consent Mode wants `gtag('consent','default', …)` to run before GA loads. A **returning** visitor who already accepted also needs their `update` to land before the first pageview, or that visit is recorded as denied and modelled — permanently degrading the data for exactly the people who agreed to be measured.

The conventional fix is `wait_for_update: 500`, which delays every ping by up to half a second and still loses the race on a slow connection. In a React app the update comes from an effect after hydration, which on a cold mobile load is routinely well past 500ms.

The repo constraint makes the usual server-side answer unavailable:

> Reading the consent cookie server-side — `cookies()` in either root layout — would opt the entire tree into dynamic rendering and destroy this site's PPR.

**`document.cookie` is readable synchronously from an inline `<script>` in `<head>`.** No server, no hydration, no React, no framework involvement at all. So a single inline script can:

1. `gtag('consent','default', { …all denied… })`
2. read `sl_consent` from `document.cookie`
3. if a valid, current-version decision exists, immediately `gtag('consent','update', { … })`

— all before GA's own script tag is parsed. Returning consenters get a fully-consented first pageview. First-time visitors get clean denied defaults. The server never reads a cookie, so PPR is untouched.

This is the move that makes default-denied work properly on a statically-rendered site. Without it the choice is between broken PPR and degraded data.

`wait_for_update` is still set (500ms) as a belt-and-braces measure for the case where the cookie is malformed and parsing throws.

Head order, both layouts:

```
<script>  consent defaults + synchronous cookie upgrade   </script>
<GoogleAnalytics gaId={…} />       ← unconditional, that is the point
```

The inline script is emitted via `dangerouslySetInnerHTML` from a server component rather than `next/script`. `beforeInteractive` would work, but raw ordering in `<head>` is more predictable than a strategy hint, the payload is a few hundred bytes, and ordering is the entire value here. No nonce is needed — the CSP carries no `script-src`. **If a `script-src` directive is ever added to `next.config.ts`, this script breaks silently and analytics quietly stops working.** Noted in the spec as a constraint, not left to memory.

### Amendment, 2026-07-30 — the Google tag is hand-rolled, and it is `defer`

Two findings during implementation, both measured rather than reasoned:

**`@next/third-parties` was dropped** (owner decision). Its `<GoogleAnalytics>` renders through `next/script` at `afterInteractive`, which in the App Router emits **no script at all** into the served HTML — only a `<link rel="preload">` — and injects both tags from a `useEffect` after hydration (`next/dist/client/script.js`, the `appDir` branch). Correctness would have survived, because `dataLayer` order is what Google acts on and the defaults are queued before anything else. But the `web-analytics` spec requires the consent script to precede the Google tag *in the document*, and a tag that is absent from the document cannot be asserted against — only reasoned about. Rendering the two tags ourselves costs seven lines in `lib/consent/google-analytics.tsx` and removes a dependency.

**The loader is `defer`, not `async`.** React 19 treats `<script async src>` as a hoistable resource and lifts it to the *top* of `<head>` — above the consent defaults. Measured in the build: loader at byte 1998, consent script at 3915. The guarantee still held (both *inline* scripts keep their relative position, so `default` still precedes `config`), but it converts a guarantee into a race. React leaves `defer` scripts where they are written. Re-measured after the change: consent 3825 → loader 4705 → config 4769, in all four prerendered locale roots.

The general lesson is worth keeping: **what protects the visitor here is `dataLayer` command order, not script-tag order.** Script order is the thing that can be asserted, which is why the spec asks for it.

## Decision 4 — Consent state is client-only, and the banner is fixed-position

Following from Decision 3: nothing about consent is read on the server, ever. React reads the same cookie after hydration purely to drive the UI.

The consequence is that the banner necessarily appears a beat after first paint. Legally fine — nothing has been stored yet — but it means the banner **must** be `position: fixed` and outside document flow. In-flow it would introduce CLS on every first visit, on a site where those Core Web Vitals numbers have already been fought for.

The store exposes a three-state `status`: `unknown` (pre-hydration) → `resolved`. The banner renders only when `status === 'resolved'` and no current-version decision exists. Rendering on `unknown` would flash the banner at people who already decided.

`proxy.ts` (Next 16's renamed middleware) already runs per request, but reading consent there buys nothing — every decision it could gate is client-side anyway.

## Decision 5 — Cookie shape and the version field

`sl_consent`, first-party, `SameSite=Lax; Secure; Path=/`, 12 months, **not** `httpOnly` (client JS must read it, in the head script and in React).

```
{ v: 1, analytics: boolean, marketing: boolean, ts: 1753000000 }
```

Stored URI-encoded JSON. Readable in devtools by design — a consent record that a user cannot inspect is a poor consent record.

**`v` is the mechanism that keeps the "pixels later" promise honest.** `CONSENT_VERSION` is a constant in `lib/consent/cookie.ts`. When a vendor is added to the category table, the constant is bumped, every stored cookie fails the version check, and every visitor is asked again. Without this, adding a Meta Pixel would silently opt in everyone who once ticked "marketing" for a category that meant something different at the time.

**`ts` + `v` is the proof of consent.** Combined with the vendor table living in version control, that answers "what did this person agree to, and when" — the copy at version `v` is recoverable from git. A server-side log is the upgrade path if a client ever demands one; it is not day-one work for three categories.

Parsing is defensive: a malformed, truncated or hand-edited cookie is treated as *no decision*, never as an error and never as consent. Unit-tested.

**Retention is 12 months for both acceptance and refusal.** The considered alternative was a shorter window for refusals (the CNIL suggests ~6 months) so refusers are re-asked sooner. UODO publishes no number. Rejected for now as a product decision dressed as a compliance one — re-prompting people who said no is friction they did not ask for. One constant away if wanted.

## Decision 6 — zustand rather than context

The state is read from three unrelated places: the banner, the footer trigger, and the tag gate — across **two separate root layouts**. A context provider would have to be mounted and kept in sync in both trees. zustand is already a dependency, the store is a single module with no provider, and both layouts import the same instance. The state is genuinely global; this is the case zustand is for.

## Decision 7 — Self-built rather than a CMP

Rejected: Cookiebot, CookieYes and equivalents.

- Every CMP is a **render-blocking third-party script** — Cookiebot's is 40–70 KB and must by design run before anything else. It would become the heaviest third-party asset on the page, present solely to gate one analytics tag.
- CMP banners are hard to restyle. A generic grey box on a site with this deliberate a plum/orange identity and custom typography reads as bought.
- The paid features do not apply here. Automatic scanning finds cookies you do not control — all cookies here are controlled. TCF is for programmatic ad publishers. That leaves hosted consent logs, answered by Decision 5.

The honest counter-argument, recorded because it is not a technical one: if a client or their counsel asks "which CMP do you use", a vendor name is a shorter answer than an explanation. Confirmed as not a concern, and reusability across client projects was explicitly ruled out.

## Decision 8 — Three categories, no per-vendor toggles

Necessary / Analytics / Marketing.

**Necessary renders as a locked, always-on row with no interactive control.** A disabled switch that is permanently checked is a common pattern and a bad one — it presents a choice that does not exist. A row stating that these are required is more honest and simpler to build.

Per-vendor granularity is a CMP feature for publishers juggling dozens of ad partners. With at most four vendors ever, categories are the right altitude.

## Decision 9 — Marketing does not ship at all ~~ships visible with zero vendors~~

**REVERSED at implementation, 2026-07-30 (owner decision).** The original text is kept below the line because the reasoning still applies the day a pixel arrives.

**What ships:** two categories, necessary and analytics. There is no Marketing row, no marketing toggle, and no `marketing` field in the consent cookie.

The deciding argument against the original: a switch that controls nothing is not transparency, it is a control that lies about having an effect. "Brak aktywnych narzędzi" explains the lie rather than removing it.

The cost the original was trying to avoid — that adding a pixel later becomes a UI change — turns out to be small, because **the version bump already forces the expensive part**. Adding a marketing vendor requires bumping `CONSENT_VERSION`, which discards every stored decision and re-prompts the entire audience regardless. Against that, adding one entry to `consentCategories` and one field to the cookie is noise. Nothing was actually saved by pre-building the empty category.

Two things keep the door open, and both are load-bearing:

- The settings panel branches on `required`, and `consentCategories` is an array. A second optional category is a data change plus one id-keyed binding in `CategoryRow` — the component does not assume there is exactly one.
- `lib/consent/cookie.ts` documents the bump requirement at `CONSENT_VERSION` in the loudest terms in the file, because it is the step that will be forgotten.

> ~~The Marketing row renders from day one with its vendor list reading "Brak aktywnych narzędzi" / "No active tools".~~
>
> ~~Hiding it until a pixel exists was the alternative. Shipping it visible means adding a pixel later is a **data change plus a version bump**, not a UI change — the banner, the settings panel and the privacy-policy table all pick it up from one array. It is also the more transparent position: the site is stating what categories it operates, including empty ones.~~
>
> ~~The cost is a switch that presently controls nothing, which is why the copy says so explicitly rather than leaving the row blank.~~

## Decision 10 — No geo-gating

Suppressing the banner for non-EEA visitors was considered. Traffic to a Polish agency's site is essentially all EEA, geo-detection introduces a request-time dependency, and a banner shown to someone who did not legally need one costs nothing but a click. Not worth the machinery.

## Decision 11 — GA is gated by environment, not by code

**Amended 2026-07-30: the variable is `NEXT_PUBLIC_GOOGLE_ANALYTICS`, not a new `NEXT_PUBLIC_GA_ID`.** The proposal did not notice that the starter already ships that name in four places — `lib/env.ts`, `analyticsEnvSchema` in `lib/utils/validation.ts`, the `analytics` entry in `lib/integrations/registry.ts`, and its tests. Nothing rendered it, so it was dead config. Adding a second GA id beside it would have left a reader to work out which one was live; reusing it instead makes `isConfigured('analytics')` and its existing tests mean something for the first time.

`NEXT_PUBLIC_GOOGLE_ANALYTICS` is set **only** on Vercel Production. `<GoogleAnalytics>` renders only when the id is present.

One condition, no environment branching, no `VERCEL_ENV` checks scattered around, and no way for a preview deployment or a local dev server to pollute the property. The banner still renders everywhere so it remains developable and testable without a real property.

Rejected: `process.env.NEXT_PUBLIC_VERCEL_ENV === 'production'` guards. Same effect, more code, and it fails confusingly when someone eventually wants a staging property.

## Decision 12 — The privacy policy renders from the same module as the banner

Artykuł 7's cookie table is generated from the same `lib/content/consent.ts` array that feeds the settings panel. Two hand-maintained lists of vendors will drift, and the drift is invisible until someone audits it.

The rewrite drops the browser-settings clause (dead since *Planet49*, C-673/17), names Google as a recipient with cookie names and retention, names Vercel with the no-storage explanation from Decision 1, and gives withdrawal instructions pointing at the footer trigger. Both locales.

**The cookie names in the policy are verified against reality by the e2e test**, which asserts that the cookies observed after acceptance are exactly the set the policy declares. A privacy policy that lists cookies the site does not set, or omits ones it does, is a defect that no amount of review reliably catches by reading.

## Decision 13 — Banner UX: equal weight, no dismissal

**Form settled at mock review, 2026-07-30.** Three treatments were built at full fidelity and reviewed live; the owner chose "Karteczka" — a cream note pinned to the **bottom-left corner**, not a full-width bar. It reads as something placed on the page rather than a strip of chrome, and it leaves the whole bottom edge of the viewport free. Fixed-position either way, so Decision 4's CLS argument is untouched.

Not a blocking modal. It does not obstruct reading, and a modal that traps a first-time visitor is both hostile and unnecessary.

Three actions: **Akceptuję** / **Odrzucam** / **Ustawienia**. The first two at genuinely equal visual weight — same size, same prominence, differing only in fill. This is the single most-enforced point in European banner enforcement; everything else here is negotiable and that is not.

**Equality is structural, not a matter of matched labels.** The two choices sit in a `grid-template-columns: 1fr 1fr`, so they are exactly the same width by construction. The original plan — matched padding plus labels "kept close in length" — silently fails the moment a locale disagrees, and English does: "Reject all" is longer than "Odrzucam". The e2e suite compares the two computed boxes and every property that carries visual weight against *each other* rather than against a literal, so a restyle may change the type scale but never for only one of them.

Two implementation notes that are decisions, not styling:

- **The tilt is desktop-only.** At mobile widths the card is nearly the full viewport, so rotating it pushes its corners past the edge and can force a horizontal scrollbar. Verified at 390px: zero horizontal overflow.
- **The card carries a hairline ring as well as a drop shadow.** It is fixed, so it floats over every scroll chapter in turn — plum, then the sand client-logos band, then plum-dark. Cream on sand is nearly the same value and the shadow alone does not separate them.

**No close/X control.** Dismissal without a choice is legally ambiguous — it is neither consent nor refusal, and treating it as either is indefensible. Since the bar does not obstruct the page, leaving it until a choice is made costs the visitor nothing. The alternative (X behaves as refusal) is defensible but adds a control whose meaning must then be explained.

**The heading's noun is an icon.** "A może trochę 🍪?" carries a lucide `Cookie` where the word would be. The icon is `aria-hidden` and the word is rendered visually-hidden beside it, so the heading is complete when spoken — an icon-only heading would read aloud as "A może trochę?", a different and worse sentence. The body spells "ciasteczek" out in full; only the heading leans on the icon.

The settings panel is a `@base-ui/react` Dialog, which handles focus trapping and escape. The card itself is **not** modal: `role="region"` with an accessible name, no focus trap, no scroll lock.
