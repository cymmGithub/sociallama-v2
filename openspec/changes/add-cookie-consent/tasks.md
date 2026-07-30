## 0. Blockers — settle before writing code

- [ ] 0.1 **GA4 property + measurement ID.** No property exists yet. Everything below can be built and tested without one (`<GoogleAnalytics>` simply does not render), but the site measures nothing until `NEXT_PUBLIC_GA_ID` is set on Vercel Production. Owner action. Does **not** block implementation.
- [ ] 0.2 **Confirm the Marketing category ships visible with zero vendors** (proposal Open Question 3). Affects one array and one string; decide before writing the copy.
- [ ] 0.3 **Confirm 12-month retention for refusals as well as acceptances** (proposal Open Question 2). One constant.
- [ ] 0.4 **Note for whoever implements this in a worktree:** `playwright.config` hardcodes `:3000` with `reuseExistingServer`. Run from a worktree, the e2e suite silently tests `main`'s code and passes green. Section 8 is meaningless until this is handled — either point the config at the worktree's port or run the suite from the main worktree after merge.

## 1. Dependencies and environment

- [ ] 1.1 Add `@next/third-parties` to `dependencies`.
- [ ] 1.2 Add `NEXT_PUBLIC_GA_ID` to `.env.example` (or the repo's equivalent) with a comment stating it is production-only by design.
- [ ] 1.3 Do **not** add it to `.env.local`. Local dev must not reach the property; the banner is developable without it.

## 2. Content

- [ ] 2.1 Create `lib/content/consent.ts`: banner copy (heading, body, three button labels), settings-panel copy (title, intro, save label, close label), and the withdrawal-trigger label.
- [ ] 2.2 In the same module, define the category→vendor table as data: for each category, its name, its purpose sentence, and its vendors. Each vendor carries name, purpose, the cookies it sets, each cookie's retention, and a link to that vendor's own privacy policy. This one array feeds the settings panel **and** the privacy-policy table — see 6.2.
- [ ] 2.3 Give the marketing category an explicit empty state ("Brak aktywnych narzędzi"), not a blank list.
- [ ] 2.4 The necessary category carries the consent cookie itself and nothing else. Its row is a statement, not a control — do not add a disabled switch.
- [ ] 2.5 Create `lib/content/consent.en.ts` as the English twin. `Localized<>` parity is type-enforced, so this cannot ship half-done.

## 3. Consent state

- [ ] 3.1 Create `lib/consent/cookie.ts`: the `ConsentDecision` type (`{ v, analytics, marketing, ts }`), `CONSENT_VERSION`, the cookie name `sl_consent`, and read/write/parse helpers.
- [ ] 3.2 Write the cookie `SameSite=Lax; Secure; Path=/`, 12-month `Max-Age`, **not** `httpOnly` — client code in `<head>` and in React both read it.
- [ ] 3.3 Parse defensively. Malformed, truncated, hand-edited or wrong-version values return "no decision". Never throw, never fall through to granted.
- [ ] 3.4 Add a prominent comment at `CONSENT_VERSION` stating that adding a vendor to `lib/content/consent.ts` requires bumping it, and why (silent opt-in of people who consented to a different vendor list).
- [ ] 3.5 Create `lib/consent/store.ts` — zustand: `status: 'unknown' | 'resolved'`, `analytics`, `marketing`, `settingsOpen`, and actions `hydrate()`, `acceptAll()`, `rejectAll()`, `save(prefs)`, `openSettings()`, `closeSettings()`.
- [ ] 3.6 `hydrate()` reads the cookie once on mount and flips `status` to `resolved`. Nothing renders the banner while `status === 'unknown'`.
- [ ] 3.7 Every mutating action writes the cookie **and** fires the Consent Mode update (section 4). Keep both in the store so no call site can do one without the other.

## 4. Consent Mode v2 wiring

- [ ] 4.1 Create `lib/consent/consent-init.tsx` — a server component emitting an inline `<script dangerouslySetInnerHTML>`. Not `next/script`: raw ordering in `<head>` is more predictable than a strategy hint, and ordering is the whole point.
- [ ] 4.2 The script initialises `dataLayer` and `gtag`, then calls `gtag('consent','default', …)` with `ad_storage`, `ad_user_data`, `ad_personalization`, `analytics_storage` and `personalization_storage` all `denied`; `functionality_storage` and `security_storage` `granted`; `wait_for_update: 500`.
- [ ] 4.3 **In the same script**, synchronously read `sl_consent` from `document.cookie` and, if a valid current-version decision exists, immediately `gtag('consent','update', …)`. This is the load-bearing detail — see `design.md` Decision 3. Without it, returning consenters' first page view is measured as denied.
- [ ] 4.4 Wrap the cookie read in a `try`/`catch`. A parse failure must leave the denied defaults standing, not break the script and take the Google tag's initialisation with it.
- [ ] 4.5 Keep this script's logic duplicated-but-minimal rather than importing from `lib/consent/cookie.ts` — it runs before any bundle. Add a comment on both sides pointing at the other, since the cookie shape now has two readers.
- [ ] 4.6 Add a `gtag('consent','update', …)` helper in `lib/consent/` for the runtime path (called by the store on accept/refuse/save), so acceptance takes effect without a reload.

## 5. Components

- [ ] 5.1 Create `components/consent/consent-banner.tsx` (client). Renders only when `status === 'resolved'` and no current-version decision exists.
- [ ] 5.2 Fixed-position bottom bar, outside document flow. In-flow it introduces CLS on every first visit — see `design.md` Decision 4.
- [ ] 5.3 Three controls: accept-all, refuse-all, settings. **Accept and refuse at identical size and prominence**, differing only in fill. This is the most-enforced point in EU banner decisions; do not let visual hierarchy quietly demote refusal.
- [ ] 5.4 No close/X control. Do not add one back for "polish".
- [ ] 5.5 The bar is `role="region"` with an accessible name. It is **not** modal: no focus trap, no scroll lock.
- [ ] 5.6 Settings panel as a `@base-ui/react` Dialog (focus trap and escape handling come free). Three rows from the content module; necessary as a statement, analytics and marketing as switches defaulting to off. "Zapisz wybór" persists.
- [ ] 5.7 Each optional row lists its vendors with purpose, cookie names and retention, read from the content module.
- [ ] 5.8 Create `components/consent/consent-settings-link.tsx` — a `<button>` matching the footer legal row's treatment, calling `openSettings()`.

## 6. Wiring

- [ ] 6.1 In **both** root layouts — `app/(frontend)/layout.tsx` and `app/(frontend-en)/layout.tsx`: `<ConsentInit />` in `<head>`, then `<GoogleAnalytics gaId={…} />` immediately after, rendered only when the env var is set. Then `<ConsentBanner />` in the body. Leave `<Analytics />` exactly where it is — Vercel Analytics is unconditional by design.
- [ ] 6.2 Add the consent-settings button to the footer's bottom legal row (`components/layout/footer/index.tsx:111`), beside the existing `footer.legal` links. It is a button, not a link — it opens a panel, it does not navigate.
- [ ] 6.3 Verify `<head>` order in the rendered HTML: consent defaults must precede the Google tag. Assert it in section 8, do not eyeball it.

## 7. Privacy policy

- [ ] 7.1 Rewrite Artykuł 7 in `app/(frontend)/polityka-prywatnosci/page.tsx`. **Delete the browser-settings-as-consent clause at line 346** — dead since *Planet49* (C-673/17, 2019) and directly contradicted by the banner.
- [ ] 7.2 Render the cookie/vendor table from `lib/content/consent.ts` rather than hand-writing it. Two maintained lists will drift and the drift is invisible until audited.
- [ ] 7.3 Name Google as a recipient, with GA4's cookie names and retention. Name Vercel with the no-storage explanation (hash from the incoming request, discarded after 24h) and state that it therefore runs without consent.
- [ ] 7.4 Add withdrawal instructions pointing at the footer control, and state the consent cookie's own name and lifetime.
- [ ] 7.5 Mirror all of it in `app/(frontend-en)/en/privacy-policy/page.tsx`.
- [ ] 7.6 Keep the existing browser-configuration links (Chrome/Firefox/Opera etc.) if desired — as *information* about managing cookies, explicitly not as a consent mechanism.

## 8. Verification

- [ ] 8.1 Unit (`bun test`): cookie serialize→parse round-trip preserves every field.
- [ ] 8.2 Unit: version mismatch parses as "no decision".
- [ ] 8.3 Unit: malformed input (empty, truncated JSON, wrong types, unescaped junk) parses as "no decision" and never throws.
- [ ] 8.4 E2E: fresh context → banner visible, **no `_ga` cookie**.
- [ ] 8.5 E2E: refuse-all → no `_ga` cookie, banner gone, reload → still no `_ga`, still no banner.
- [ ] 8.6 E2E: accept-all → `_ga` and `_ga_*` appear **without a reload**; reload → no banner.
- [ ] 8.7 E2E: DOM-order assertion — the consent-default script appears before the Google tag script.
- [ ] 8.8 E2E: after accept-all, enumerate every cookie set and assert the set matches exactly what the privacy policy declares. This is what stops the policy drifting from reality; a mismatch in either direction fails.
- [ ] 8.9 E2E: the footer control opens the settings panel and shows the stored choices.
- [ ] 8.10 E2E in the English locale: banner renders, copy is English, behaviour identical.
- [ ] 8.11 Confirm the production build still prerenders every route that was prerendered before — `bun run build` runs `check-prerender.ts`. A regression here means something read the cookie server-side.
- [ ] 8.12 Measure CLS on a first visit with the banner appearing. It must be zero.
- [ ] 8.13 `bun run check` green (biome + tsc + tests + manifest).

## 9. Follow-ups, deliberately not in this change

- [ ] 9.1 `beforeSend` redaction on Vercel Analytics. Current routes carry no identifiers, so there is nothing to redact today — but the constraint is now written into the `web-analytics` spec and needs implementing the moment a route carries one.
- [ ] 9.2 Server-side consent log. Not needed at three categories; unblocked if a client ever demands one.
- [ ] 9.3 When the first marketing pixel lands: add it to `lib/content/consent.ts`, **bump `CONSENT_VERSION`**, gate its script on `marketing`, and add it to the privacy policy. The version bump is the part that will be forgotten.
