## 1. Worktree & the cheap win

- [x] 1.1 ~~`bun run worktree:new sl-uslugi-copy <port>`~~ → superseded: the existing `sl-uslugi` worktree was already at main's HEAD (8d6a12a, the proposal commit) with a clean tree, so it *is* the worktree 1.1 asked for. Per user decision, work happens here; `add-seo-performance-page` reuses it.
- [x] 1.2 Influencer marketing: rewrite hero intro and the Folks partner copy from the client doc, adding the Grupa Good One framing and the closing "Jeden partner. Wiele kompetencji. BETTER WORKS." → `/uslugi/influencer-marketing` renders the new copy, no structural change
- [x] 1.3 Translate 1.2 into `uslugi.en.ts` (established EN locale voice) → `Localized` parity compiles, `tsc --noEmit` green

## 2. Dispatch refactor (D8) — before any new kind exists

- [x] 2.1 Replace the property-presence narrowing chain in `ServicePage` with a `switch (section.kind)`, keeping the existing per-branch casts → all six current pages render byte-identically
- [x] 2.2 Verify the refactor against every live services route in both locales before proceeding → no visual or DOM diff on `/uslugi/*` and `/en/services/*`

## 3. New section primitives

- [x] 3.1 `checklist` — heading, tick items, optional graphic; renders copy-only with no empty frame when the graphic is absent
- [x] 3.2 `timeline` — ordered steps with visible sequencing (the client chose a timeline over cards specifically to show next steps)
- [x] 3.3 `banner` — highlighted band with heading, paragraph, one CTA; themed so it reads distinctly on both the Strategia and Audyt pages
- [x] 3.4 `logoStrip` — platform marks from the existing `public/assets/icon-*.svg`, no new artwork, logos only with no separator dots
- [x] 3.5 `posts` — read-only Payload query by blog category, wrapped in React `cache()`, up to three results, whole section omitted on zero matches, absent in EN
- [x] 3.6 Extend `triptych` to an N-column grid → four items lay out with no orphaned final tile at desktop width
- [x] 3.7 Extend `hero` with an optional CTA button → existing heroes without one render unchanged

## 4. Strategia

- [x] 4.1 RESOLVED against the prod DB (79 published posts, 4 categories): Social media 34, Marketing 29, Reklama 11, SEO 5. The wireframe asks for posts on "strategii, marketingu i social media", so `posts` queries `marketing` + `social-media` — 63 posts, guaranteed to fill all three slots.
- [x] 4.2 Rewrite `sections`: hero → triptych(4 benefits) → checklist → timeline(4 steps) → banner → posts; compress the doc's prose to the client's wireframe slots (D1)
- [x] 4.3 Cut the `proof` section → Volvo now appears as a proof case on Audyt only, resolving the duplication (O2)
- [x] 4.4 Translate to EN, omitting the `posts` section → parity compiles

## 5. Audyt i konsultacje

- [x] 5.1 Delete the invented triptych (D7) and rewrite the hero from the doc, adding its CTA
- [x] 5.2 Add the six-item deliverables checklist, the six-platform logo strip, and the consultation banner
- [x] 5.3 RESOLVED with the user: the banner CTA reads **"Zapytaj o termin"** (EN "Ask about a slot"). The client's "Wybierz termin w kalendarzu" was rejected because it promises a calendar the `/kontakt` destination cannot show — which the spec forbids. "Zapytaj o termin" is honest about the mechanics and doesn't duplicate the hero's "Umów konsultację".
- [x] 5.4 Translate to EN → parity compiles

## 6. Verification

- [x] 6.1 `tsc --noEmit` clean; Biome clean on all seven changed files. The only `--diagnostic-level=error` output repo-wide is the known pre-existing internal panic (`index out of bounds`) on untouched files — not from this change.
- [x] 6.2 Sweep done. All 12 service routes 200 in both locales; zero console errors, zero failed requests, zero 4xx/5xx across 14 screenshots (1440 / 900 / 390px). Compositions verified from the DOM: Strategia = hero + triptych(4, `data-count="4"`) + checklist(5) + timeline(4) + banner + posts, **no proof**; Audyt = hero(+CTA) + checklist(6) + logoStrip(6 marks) + banner + proof, **no triptych**; EN mirrors both, with no `posts` section. `posts` omission proven by temporarily pointing it at an empty category (`seo`, 0 posts in the dev DB): heading, kicker, and rows all absent from rendered markup — only the RSC flight payload retains the data, which is not DOM. No scheduler/calendar host appears in either Audyt page; both banner CTAs resolve to `/kontakt` and `/en/contact`. Four-tile triptych confirmed 2×2 at 900px and 4×1 at 1440px — no orphan at either width.
- [x] 6.3 Additive guarantee holds. Byte-diffed the four untouched services against a pre-change baseline: the only markup delta anywhere is the inert `data-count="3"` attribute now emitted on every triptych `<ol>` (CSS keys only on `[data-count="4"]`, so the three-tile layout is untouched); the remainder of the diff is dev-server chunk filenames inside a bailout stack-trace attribute. `/uslugi` and `/en/services` both 200 with all six cards intact.
- [x] 6.4 Visual sign-off from the user on all three rewritten pages before merge — approved 2026-07-26 on the desktop/mid/mobile captures of Strategia, Audyt i konsultacje, and Influencer marketing in both locales.

### Notes for 6.4

- Strategia's "Co zawiera strategia?" graphic is still unsourced, so that checklist renders copy-only (by design; open question).
- Audyt's document also sketches a stats/phone-grid hero visual, a detective-llama illustration, and a team slider with a specialist picker above the banner. All are asset/scope items outside this change — the page ships without them.
- The `posts` section shows one card locally because the dev DB holds exactly one published post (in `marketing`). Prod has 63 across the two queried categories, so it will fill all three slots there.
- Pre-existing, unrelated: the Folks partner block still carries the tagline `from creators to results`, which is not in any client document. Left as-is — out of scope here, but worth a decision at some point.
