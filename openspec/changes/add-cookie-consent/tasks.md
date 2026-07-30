## 0. Blockers — settle before writing code

- [ ] 0.1 **GA4 property + measurement ID.** No property exists yet. Everything below can be built and tested without one (`<GoogleAnalytics>` simply does not render), but the site measures nothing until `NEXT_PUBLIC_GA_ID` is set on Vercel Production. Owner action. Does **not** block implementation.
- [x] 0.2 **Confirm the Marketing category ships visible with zero vendors** (proposal Open Question 3). Affects one array and one string; decide before writing the copy. **RESOLVED (owner, 2026-07-30): the opposite — Marketing does NOT ship.** A category with no vendor behind it is a control that lies about having an effect. Two categories ship: necessary + analytics. `design.md` Decision 9 and the `cookie-consent` spec are amended to match.
- [x] 0.3 **Confirm 12-month retention for refusals as well as acceptances** (proposal Open Question 2). One constant.
- [x] 0.4 **Note for whoever implements this in a worktree:** `playwright.config` hardcodes `:3000` with `reuseExistingServer`. Run from a worktree, the e2e suite silently tests `main`'s code and passes green. Section 8 is meaningless until this is handled — either point the config at the worktree's port or run the suite from the main worktree after merge.

## 1. Dependencies and environment

- [x] 1.1 Add `@next/third-parties` to `dependencies`. **AMENDED: not added.** `@next/third-parties` renders GA through `next/script@afterInteractive`, which emits no script into the served HTML and injects from a `useEffect` after hydration — so the spec's "defaults precede the tag in the document" could not be asserted, only reasoned about. The tag is hand-rolled in `lib/consent/google-analytics.tsx` instead. No new dependency.
- [x] 1.2 Add `NEXT_PUBLIC_GA_ID` to `.env.example` (or the repo's equivalent) with a comment stating it is production-only by design. **AMENDED: reuses `NEXT_PUBLIC_GOOGLE_ANALYTICS`,** which the starter already ships in `lib/env.ts`, `analyticsEnvSchema`, the integrations registry and its tests — dead config until now. A second GA id beside it would have been ambiguous. Documented in `.env.example` as production-only.
- [x] 1.3 Do **not** add it to `.env.local`. Local dev must not reach the property; the banner is developable without it.

## 2. Content

- [x] 2.1 Create `lib/content/consent.ts`: banner copy (heading, body, three button labels), settings-panel copy (title, intro, save label, close label), and the withdrawal-trigger label.
- [x] 2.2 In the same module, define the category→vendor table as data: for each category, its name, its purpose sentence, and its vendors. Each vendor carries name, purpose, the cookies it sets, each cookie's retention, and a link to that vendor's own privacy policy. This one array feeds the settings panel **and** the privacy-policy table — see 6.2.
- [x] 2.3 Give the marketing category an explicit empty state ("Brak aktywnych narzędzi"), not a blank list. **AMENDED: no marketing category exists,** so there is no empty state to label. `lib/content/consent.test.ts` asserts the inverse instead: every category shown covers at least one vendor, and every vendor at least one cookie.
- [x] 2.4 The necessary category carries the consent cookie itself and nothing else. Its row is a statement, not a control — do not add a disabled switch.
- [x] 2.5 Create `lib/content/consent.en.ts` as the English twin. `Localized<>` parity is type-enforced, so this cannot ship half-done.

## 3. Consent state

- [x] 3.1 Create `lib/consent/cookie.ts`: the `ConsentDecision` type (`{ v, analytics, marketing, ts }`), `CONSENT_VERSION`, the cookie name `sl_consent`, and read/write/parse helpers.
- [x] 3.2 Write the cookie `SameSite=Lax; Secure; Path=/`, 12-month `Max-Age`, **not** `httpOnly` — client code in `<head>` and in React both read it.
- [x] 3.3 Parse defensively. Malformed, truncated, hand-edited or wrong-version values return "no decision". Never throw, never fall through to granted.
- [x] 3.4 Add a prominent comment at `CONSENT_VERSION` stating that adding a vendor to `lib/content/consent.ts` requires bumping it, and why (silent opt-in of people who consented to a different vendor list).
- [x] 3.5 Create `lib/consent/store.ts` — zustand: `status: 'unknown' | 'resolved'`, `analytics`, `marketing`, `settingsOpen`, and actions `hydrate()`, `acceptAll()`, `rejectAll()`, `save(prefs)`, `openSettings()`, `closeSettings()`.
- [x] 3.6 `hydrate()` reads the cookie once on mount and flips `status` to `resolved`. Nothing renders the banner while `status === 'unknown'`.
- [x] 3.7 Every mutating action writes the cookie **and** fires the Consent Mode update (section 4). Keep both in the store so no call site can do one without the other.

## 4. Consent Mode v2 wiring

- [x] 4.1 Create `lib/consent/consent-init.tsx` — a server component emitting an inline `<script dangerouslySetInnerHTML>`. Not `next/script`: raw ordering in `<head>` is more predictable than a strategy hint, and ordering is the whole point.
- [x] 4.2 The script initialises `dataLayer` and `gtag`, then calls `gtag('consent','default', …)` with `ad_storage`, `ad_user_data`, `ad_personalization`, `analytics_storage` and `personalization_storage` all `denied`; `functionality_storage` and `security_storage` `granted`; `wait_for_update: 500`.
- [x] 4.3 **In the same script**, synchronously read `sl_consent` from `document.cookie` and, if a valid current-version decision exists, immediately `gtag('consent','update', …)`. This is the load-bearing detail — see `design.md` Decision 3. Without it, returning consenters' first page view is measured as denied.
- [x] 4.4 Wrap the cookie read in a `try`/`catch`. A parse failure must leave the denied defaults standing, not break the script and take the Google tag's initialisation with it.
- [x] 4.5 Keep this script's logic duplicated-but-minimal rather than importing from `lib/consent/cookie.ts` — it runs before any bundle. Add a comment on both sides pointing at the other, since the cookie shape now has two readers.
- [x] 4.6 Add a `gtag('consent','update', …)` helper in `lib/consent/` for the runtime path (called by the store on accept/refuse/save), so acceptance takes effect without a reload.

## 5. Components

- [x] 5.1 Create `components/consent/consent-banner.tsx` (client). Renders only when `status === 'resolved'` and no current-version decision exists.
- [x] 5.2 Fixed-position bottom bar, outside document flow. In-flow it introduces CLS on every first visit — see `design.md` Decision 4.
- [x] 5.3 Three controls: accept-all, refuse-all, settings. **Accept and refuse at identical size and prominence**, differing only in fill. This is the most-enforced point in EU banner decisions; do not let visual hierarchy quietly demote refusal. **STRENGTHENED:** equality is structural — the two choices sit in a `1fr 1fr` grid, so they are identical by construction rather than because the labels happen to be a similar length. English proves the original approach unsafe: "Reject all" is longer than "Odrzucam".
- [x] 5.4 No close/X control. Do not add one back for "polish".
- [x] 5.5 The bar is `role="region"` with an accessible name. It is **not** modal: no focus trap, no scroll lock.
- [x] 5.6 Settings panel as a `@base-ui/react` Dialog (focus trap and escape handling come free). Three rows from the content module; necessary as a statement, analytics and marketing as switches defaulting to off. "Zapisz wybór" persists.
- [x] 5.7 Each optional row lists its vendors with purpose, cookie names and retention, read from the content module.
- [x] 5.8 Create `components/consent/consent-settings-link.tsx` — a `<button>` matching the footer legal row's treatment, calling `openSettings()`.

## 6. Wiring

- [x] 6.1 In **both** root layouts — `app/(frontend)/layout.tsx` and `app/(frontend-en)/layout.tsx`: `<ConsentInit />` in `<head>`, then `<GoogleAnalytics gaId={…} />` immediately after, rendered only when the env var is set. Then `<ConsentBanner />` in the body. Leave `<Analytics />` exactly where it is — Vercel Analytics is unconditional by design.
- [x] 6.2 Add the consent-settings button to the footer's bottom legal row (`components/layout/footer/index.tsx:111`), beside the existing `footer.legal` links. It is a button, not a link — it opens a panel, it does not navigate.
- [x] 6.3 Verify `<head>` order in the rendered HTML: consent defaults must precede the Google tag. Assert it in section 8, do not eyeball it.

## 7. Privacy policy

- [x] 7.1 Rewrite Artykuł 7 in `app/(frontend)/polityka-prywatnosci/page.tsx`. **Delete the browser-settings-as-consent clause at line 346** — dead since *Planet49* (C-673/17, 2019) and directly contradicted by the banner.
- [x] 7.2 Render the cookie/vendor table from `lib/content/consent.ts` rather than hand-writing it. Two maintained lists will drift and the drift is invisible until audited.
- [x] 7.3 Name Google as a recipient, with GA4's cookie names and retention. Name Vercel with the no-storage explanation (hash from the incoming request, discarded after 24h) and state that it therefore runs without consent.
- [x] 7.4 Add withdrawal instructions pointing at the footer control, and state the consent cookie's own name and lifetime.
- [x] 7.5 Mirror all of it in `app/(frontend-en)/en/privacy-policy/page.tsx`.
- [x] 7.6 Keep the existing browser-configuration links (Chrome/Firefox/Opera etc.) if desired — as *information* about managing cookies, explicitly not as a consent mechanism.

## 8. Verification

- [x] 8.1 Unit (`bun test`): cookie serialize→parse round-trip preserves every field.
- [x] 8.2 Unit: version mismatch parses as "no decision".
- [x] 8.3 Unit: malformed input (empty, truncated JSON, wrong types, unescaped junk) parses as "no decision" and never throws.
- [x] 8.4 E2E: fresh context → banner visible, **no `_ga` cookie**.
- [x] 8.5 E2E: refuse-all → no `_ga` cookie, banner gone, reload → still no `_ga`, still no banner.
- [x] 8.6 E2E: accept-all → `_ga` and `_ga_*` appear **without a reload**; reload → no banner. **VERIFIED against a production build** (`next start`, dummy `G-TESTONLY123`): `_ga` and `_ga_TESTONLY123` appear without a reload. Against a dev server the assertion is `dataLayer` order instead, since no measurement id means no Google tag at all.
- [x] 8.7 E2E: DOM-order assertion — the consent-default script appears before the Google tag script. **DONE, and it found a real bug.** React 19 hoists `<script async src>` to the top of `<head>`, above the consent defaults (measured: loader 1998, consent 3915). Switched the loader to `defer`, which React leaves in place. Re-measured: consent 3825 → loader 4705 → config 4769.
- [x] 8.8 E2E: after accept-all, enumerate every cookie set and assert the set matches exactly what the privacy policy declares. This is what stops the policy drifting from reality; a mismatch in either direction fails. **DONE, split in two.** "Nothing undeclared is set" runs everywhere; "everything declared is set" needs a measurement id and self-skips without one, rather than hiding a passing assertion inside a skipped test.
- [x] 8.9 E2E: the footer control opens the settings panel and shows the stored choices.
- [x] 8.10 E2E in the English locale: banner renders, copy is English, behaviour identical.
- [x] 8.11 Confirm the production build still prerenders every route that was prerendered before — `bun run build` runs `check-prerender.ts`. A regression here means something read the cookie server-side.
- [x] 8.12 Measure CLS on a first visit with the banner appearing. It must be zero.
- [x] 8.13 `bun run check` green (biome + tsc + tests + manifest).

## 9. Follow-ups, deliberately not in this change

*These stay unchecked on purpose — they are a record of what was scoped out, not
outstanding work. Section 0.1 (the GA4 property itself) is the one genuinely
open item, and it is an owner action rather than an engineering task.*

- [ ] 9.1 `beforeSend` redaction on Vercel Analytics. Current routes carry no identifiers, so there is nothing to redact today — but the constraint is now written into the `web-analytics` spec and needs implementing the moment a route carries one.
- [ ] 9.2 Server-side consent log. Not needed at two categories; unblocked if a client ever demands one.
- [ ] 9.3 When the first marketing pixel lands: add it to `lib/content/consent.ts`, **bump `CONSENT_VERSION`**, gate its script on `marketing`, and add it to the privacy policy. The version bump is the part that will be forgotten.
