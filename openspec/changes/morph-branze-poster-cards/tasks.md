# Tasks: morph-branze-poster-cards

## 1. Poster cards (standalone — no morph dependency)

- [x] 1.1 Add the optional per-item `image` slot to `SectionIndex` and the
      poster-card branch: full-bleed cover image (house `Image`, card-sized
      `sizes` ~33vw desktop / ~90vw mobile), 3:2 aspect, bottom scrim sized
      to the copy block, cream label with orange dot, CTA from
      `chrome.index.cardCta` with the lucide arrow — per the approved
      Variant A mock; items without an image render today's text card
      unchanged
- [x] 1.2 Pass poster paths (`/branze/<id>/hero.jpg`) from the PL and EN
      branze hub pages; leave the services hub pages untouched
- [x] 1.3 Change `chrome.index.cardCta` to "Więcej" in `branze.ts` and
      "More" in `branze.en.ts`
- [x] 1.4 Verify legibility: label + CTA contrast over the composited scrim
      on all 12 cards in both locales (screenshot pass, both viewports);
      adjust the scrim, not the copy, where a poster fights it

## 2. Hub verification (standalone)

- [x] 2.1 Screenshot `/branze` and `/en/industries` at mobile + desktop:
      grid alignment, reveal stagger, hover lift, focus-visible state on
      poster cards
- [x] 2.2 Confirm `/uslugi` and `/en/services` render byte-identical text
      cards (locale-parity test + visual spot-check)
- [x] 2.3 Measure hub image weight and LCP (house PSI recipe): card-sized
      variants actually served (never the hero's 100vw variant), decide
      first-row `preload` per measurement; `bun run check` green

## 3. Morph wiring (gated on morph-team-grid-transition machinery + spike verdict)

- [ ] 3.1 Confirm the team-morph change landed its machinery (config, header
      pin, pre-paint scroll path, wrapper passthrough) and the spike verdict
      was go; if the verdict was no-go, strike groups 3–4 and close this
      change as the poster-card redesign only
- [ ] 3.2 Name the poster media `branza-<id>` on both sides: the card image
      in `SectionIndex`'s poster branch and the hero poster `Image` in
      `HeroMedia`; containers, scrims, copy and video stay unnamed
- [ ] 3.3 Extend `ScrollReset`'s pre-paint path to no-hash navigations
      (scroll to 0 inside the commit, mechanism per the spike verdict),
      keeping the post-paint path as fallback
- [ ] 3.4 Reduced-motion gate covers the new pair (shared `::view-transition`
      CSS from the team change — verify it applies, don't duplicate it)

## 4. Morph verification (gated with group 3)

- [ ] 4.1 Playwright pass on PL + EN: card click from a scrolled hub morphs
      the poster into the on-screen hero at scroll zero; reduced-motion
      emulation gets the instant arrival; screenshot settled states
- [ ] 4.2 Regression sweep: hub ⇄ industry ⇄ hub round trips under the
      Activity cache (reveal stagger on return, Lenis offset, reverse-morph
      quality — observe and note), hero video fade-in after a morph arrival,
      direct URL visit to an industry page unchanged
- [ ] 4.3 Full `bun run check` + test suite green

## 5. Documentation

- [ ] 5.1 Record in design.md: the inherited scroll mechanism, the LCP /
      preload decision from 2.3, and the reverse-morph observation from 4.2
