## 1. Worktree & the cheap win

- [ ] 1.1 `bun run worktree:new sl-uslugi-copy <port> --change align-existing-services` from main (shared DB — no schema change) → verify the port serves. This worktree is reused by `add-seo-performance-page`; do not open a second one.
- [ ] 1.2 Influencer marketing: rewrite hero intro and the Folks partner copy from the client doc, adding the Grupa Good One framing and the closing "Jeden partner. Wiele kompetencji. BETTER WORKS." → `/uslugi/influencer-marketing` renders the new copy, no structural change
- [ ] 1.3 Translate 1.2 into `uslugi.en.ts` (established EN locale voice) → `Localized` parity compiles, `tsc --noEmit` green

## 2. Dispatch refactor (D8) — before any new kind exists

- [ ] 2.1 Replace the property-presence narrowing chain in `ServicePage` with a `switch (section.kind)`, keeping the existing per-branch casts → all six current pages render byte-identically
- [ ] 2.2 Verify the refactor against every live services route in both locales before proceeding → no visual or DOM diff on `/uslugi/*` and `/en/services/*`

## 3. New section primitives

- [ ] 3.1 `checklist` — heading, tick items, optional graphic; renders copy-only with no empty frame when the graphic is absent
- [ ] 3.2 `timeline` — ordered steps with visible sequencing (the client chose a timeline over cards specifically to show next steps)
- [ ] 3.3 `banner` — highlighted band with heading, paragraph, one CTA; themed so it reads distinctly on both the Strategia and Audyt pages
- [ ] 3.4 `logoStrip` — platform marks from the existing `public/assets/icon-*.svg`, no new artwork, logos only with no separator dots
- [ ] 3.5 `posts` — read-only Payload query by blog category, wrapped in React `cache()`, up to three results, whole section omitted on zero matches, absent in EN
- [ ] 3.6 Extend `triptych` to an N-column grid → four items lay out with no orphaned final tile at desktop width
- [ ] 3.7 Extend `hero` with an optional CTA button → existing heroes without one render unchanged

## 4. Strategia

- [ ] 4.1 Confirm which blog categories `posts` should query, verified against the prod database (~79 posts; the local dev DB has one seeded post and proves nothing) → resolves an open question
- [ ] 4.2 Rewrite `sections`: hero → triptych(4 benefits) → checklist → timeline(4 steps) → banner → posts; compress the doc's prose to the client's wireframe slots (D1)
- [ ] 4.3 Cut the `proof` section → Volvo now appears as a proof case on Audyt only, resolving the duplication (O2)
- [ ] 4.4 Translate to EN, omitting the `posts` section → parity compiles

## 5. Audyt i konsultacje

- [ ] 5.1 Delete the invented triptych (D7) and rewrite the hero from the doc, adding its CTA
- [ ] 5.2 Add the six-item deliverables checklist, the six-platform logo strip, and the consultation banner
- [ ] 5.3 Settle the banner's CTA wording — it routes to `/kontakt`, so it must not promise a calendar it cannot show (open question) → wording agreed with the user before ship
- [ ] 5.4 Translate to EN → parity compiles

## 6. Verification

- [ ] 6.1 Biome (`--diagnostic-level=error`) + `tsc --noEmit` green
- [ ] 6.2 Playwright sweep across all services routes in both locales — 200s, the three rewritten pages match their spec'd compositions, `posts` omits correctly, no third-party scheduler script is requested, mobile + desktop
- [ ] 6.3 Confirm the four untouched surfaces (Content, Kreacje & Wideo, Sprzedaż, `/uslugi` index) render unchanged → the additive guarantee holds
- [ ] 6.4 Visual sign-off from the user on all three rewritten pages before merge
