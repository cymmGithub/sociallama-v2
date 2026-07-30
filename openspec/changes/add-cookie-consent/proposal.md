## Why

Google Analytics 4 is about to be added to the site. GA4 writes cookies to the visitor's device, and there is currently **no consent mechanism of any kind** in this repo — no banner, no consent cookie, no Consent Mode wiring. Adding GA4 as things stand would put the site in breach on day one.

Two separate laws are in play and they are routinely conflated, so this change treats them separately:

- **ePrivacy** (art. 5(3), implemented in Poland by what was art. 173 Prawa telekomunikacyjnego and is now carried into **Prawo komunikacji elektronicznej**, in force since 10 Nov 2024) gates *storing information on, or reading information from, the user's terminal equipment*. This is the law that requires a banner. It fires on cookies, `localStorage`, and fingerprinting — and only on those.
- **RODO/GDPR** governs what is done with the resulting personal data. It requires a lawful basis, disclosure and data-subject rights. It does not, by itself, require a banner.

Sorted against that split:

**Vercel Analytics (`@vercel/analytics` ^2.0.1, already live)** touches no device storage. Vercel's compliance documentation is explicit: *"without using any third-party cookies, instead end users are identified by a hash created from the incoming request"*, discarded after 24 hours. No storage access means the ePrivacy consent obligation never fires. RODO still applies to the transient processing, which is satisfied by legitimate interest plus disclosure and Vercel's DPA. **It keeps running unconditionally and correctly.**

**GA4** writes `_ga` and `_ga_<MEASUREMENT_ID>`. That is unambiguous storage access, so it requires prior, opt-in, freely-given consent, as easy to refuse as to give, withdrawable, and demonstrable. Google additionally requires **Consent Mode v2** for EEA traffic as a contractual matter.

### The privacy policy currently asserts a position that has been dead since 2019

`app/(frontend)/polityka-prywatnosci/page.tsx:346` states that the user consents to cookies by configuring their browser. **CJEU C-673/17 (*Planet49*, October 2019)** ended that reading; browser settings are not consent. The clause is wrong today, independent of this change, and it would directly contradict the banner the moment one ships. It is rewritten here rather than deferred.

### Why the marketing category was proposed — and why it did not ship

*Superseded at implementation, 2026-07-30 (owner decision). Recorded because the reasoning is still the reasoning the day a pixel arrives.*

The original argument: this site is an agency's own shopfront, Meta Pixel / LinkedIn Insight Tag / Google Ads conversion tracking are months away rather than years, and retrofitting categories onto a shipped single-boolean consent invalidates every consent already collected. So build the category model now and ship the marketing bucket empty and honestly labelled.

**What that argument missed:** the re-prompt it was trying to avoid happens anyway. Adding a vendor requires bumping `CONSENT_VERSION`, which discards every stored decision by design — so pre-building the empty category saved nothing, and cost a switch that controls nothing. Shipped with two categories: necessary and analytics. See `design.md` Decision 9.

## What Changes

- **A self-built, two-category consent mechanism.** Necessary (always on, no toggle) / Analytics. Copy and the category→vendor table live in `lib/content/consent.ts` + `consent.en.ts`, under the same `Localized<>` parity that the rest of the site's copy uses. *(Was three categories; Marketing dropped — see above.)*
- **A first-party `sl_consent` cookie** carrying `{ v, analytics, ts }`. `v` is a vendor-list version: bumping it re-prompts everyone, which is what keeps "add a pixel later" honest. `ts` + `v` is the record of consent.
- **Consent Mode v2, defaulting to denied.** One inline `<script>` in `<head>` sets all four v2 signals to `denied`, then synchronously reads `sl_consent` from `document.cookie` and immediately fires `gtag('consent','update', …)` if a decision is stored. The Google tag follows it in the same `<head>`, as a hand-rolled `defer` loader plus its `config` call. *(Was `@next/third-parties/google`; dropped — see `design.md` Decision 3's amendment.)*
- **GA4 gated to production by environment**, not by branching logic: `NEXT_PUBLIC_GOOGLE_ANALYTICS` — the variable the starter already shipped — is set only on Vercel Production, and the tag renders only when the id is present. Localhost and previews never reach the property.
- **Both root layouts.** This repo has two — `app/(frontend)/layout.tsx` (PL) and `app/(frontend-en)/layout.tsx` (EN). Every piece here mounts in both, and every string ships in both languages.
- **A footer entry point** to reopen the settings panel, satisfying the withdrawal requirement.
- **Artykuł 7 of the privacy policy rewritten** in both locales: the browser-settings clause removed, the category table rendered from the same content module that feeds the banner, Google named as a recipient with observed cookie names and retention, Vercel named with the no-storage explanation, and withdrawal instructions pointing at the footer.
- **No new dependency.** `@next/third-parties` was proposed and rejected during implementation; the Google tag is seven lines in `lib/consent/google-analytics.tsx`. `lucide-react` (already present) supplies the banner's cookie and heart icons.

## Capabilities

### Added Capabilities

- `cookie-consent`: The site SHALL obtain prior, opt-in, category-level consent before any non-essential storage is written to a visitor's device, SHALL make refusal exactly as easy as acceptance — structurally, not by matching label lengths — SHALL allow consent to be withdrawn at any time from site chrome, SHALL record what was consented to and when, and SHALL re-prompt when the set of vendors changes. Consent state SHALL be resolved entirely on the client so that static rendering is preserved.
- `web-analytics`: Analytics that touch no device storage SHALL run unconditionally; analytics that do SHALL be gated by consent. Google Analytics SHALL be loaded under Consent Mode v2 with all consent signals defaulting to `denied`, and SHALL be present only in the production environment.

### Modified Capabilities

- `site-footer`: the footer gains a consent-settings trigger alongside the existing legal links, in both locales. Column inventory and grid behaviour are otherwise unchanged.

## Non-Goals

- **No Google Tag Manager.** A ~30 KB render-blocking third-party container, bought to let marketing add tags without a deploy. This site's performance budget has been fought for; nobody has asked for deploy-free tag changes. Revisit if and when they do.
- **No third-party CMP** (Cookiebot, CookieYes). Their value is automatic cookie scanning, hosted consent logs and IAB TCF — scanning is for cookies you do not control, TCF is for programmatic ad publishers, and the log requirement is met here by the cookie itself. What you would actually get is the heaviest third-party script on the page and a generic grey box on a site with a very deliberate visual identity. Reconsider only if a client's counsel wants a vendor name in an answer.
- **No server-side consent log.** The cookie's `ts` + `v`, alongside version-controlled copy in git, is a defensible record at this scale. The upgrade path is real and unblocked if one is ever demanded.
- **No per-vendor toggles.** Category-level only. Per-vendor granularity is a CMP feature that suits publishers with dozens of ad partners.
- **No geo-gating.** Some sites suppress the banner outside the EEA. Traffic here is essentially all EEA, and geo-detection would add a request-time dependency for no gain.
- **No IAB TCF.**
- **No session recording** (Hotjar, Clarity). Noted only to record that if it is ever added it does *not* belong in the marketing category — it can capture keystrokes and form contents, and on `/kontakt` that means names, emails and phone numbers. It needs its own category and its own masking configuration.
- **No server-side tracking as a consent workaround.** Meta's Conversions API and server-side GTM are sometimes pitched this way. The legal basis is unchanged and an `fbclid` forwarded from a server still identifies a person. Recorded so it is not proposed later as a shortcut.

## Open Questions

**1. STILL OPEN — the only outstanding item in this change.** The GA4 property does not exist yet. No measurement ID has been supplied and no property has been created. The work can be built and tested end-to-end without one — `<GoogleAnalytics>` simply does not render — but the site is not actually measuring anything until the ID is set on Vercel Production. Owner action, not an engineering task.

**2. RESOLVED (owner, 2026-07-30): 12 months for both outcomes, as proposed.** Consent lifetime is set to 12 months for both outcomes. Acceptance and refusal are stored with the same TTL, after which the banner returns. The alternative widely used in France is a shorter window for refusals (CNIL suggests ~6 months) so that refusers are asked again sooner. UODO has published no hard number. The shorter-refusal variant is deliberately not implemented — it is one constant away if wanted, but re-prompting people who said no is a product decision, not a compliance one.

**3. RESOLVED (owner, 2026-07-30): the Marketing category does NOT ship — the alternative below was chosen.** ~~The Marketing toggle ships with no vendors behind it~~, its row reading "Brak aktywnych narzędzi". The alternative is hiding the category until a pixel exists. Shipping it visible is judged more honest and means adding a pixel later is a data change plus a version bump rather than a UI change — but it does mean offering a switch that currently controls nothing. Reversible either way.

**4. No lawyer has reviewed the rewritten Artykuł 7.** This change corrects a clause that is demonstrably wrong and replaces it with the current mainstream reading, which is a clear improvement on what is published today. It is not a substitute for review by someone qualified, particularly on the retention periods and the description of Google as a recipient.

**5. Consent Mode's cookieless pings are a transmission to Google before consent.** Under default-denied, `gtag` loads on every page and sends pings carrying an IP and page URL to Google even when the visitor has refused — no cookie is written, but a request is made. This was decided in favour of the data quality it buys (see `design.md` Decision 2). Several EU authorities take the view that contacting Google's servers at all is the part needing a basis. The conservative alternative — loading nothing Google-owned until acceptance — is one component change away and is documented.
