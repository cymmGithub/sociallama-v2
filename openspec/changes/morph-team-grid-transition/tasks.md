# Tasks: morph-team-grid-transition

## 1. Spike — prove the morph sequencing (gate for groups 4–6)

- [ ] 1.1 Check the Next 16 view-transitions guide for required config
      (`experimental.viewTransition` or none); enable whatever is needed on a
      throwaway basis and confirm `import { ViewTransition } from 'react'`
      compiles with `reactCompiler: true`
- [ ] 1.2 Wire a minimal, unpolished morph: `ViewTransition name` on one
      grid tile's image and on the slider's featured slot, hardcoded to one
      member — no wipe suppression, no crop tuning
- [ ] 1.3 Test whether a scroll performed inside the navigation commit
      (layout effect) is captured by the new-state snapshot: try Lenis
      `scrollTo(..., { immediate: true })` first, `window.scrollTo` +
      Lenis resync second; record which lands the morph on-screen
- [ ] 1.4 Verify the home ⇄ /o-nas round trip under the Activity cache:
      duplicate `team-*` names on the hidden mounted page must not break or
      hijack snapshots; observe whether the reverse morph (back to home)
      comes for free and looks acceptable
- [ ] 1.5 Judge the cover→contain crop behavior of the default morph;
      note whether `::view-transition-old/new` object-fit CSS is needed
- [ ] 1.6 Confirm the custom `Link` / `Image` wrappers pass through what the
      wiring needs (or note the smallest passthrough change required)
- [ ] 1.7 **Decision point**: record spike findings in design.md (Open
      Questions → answers). If the morph cannot land on-screen reliably,
      descope: strike groups 4–6, keep 2–3, and update proposal.md scope

## 2. Prerender /o-nas (standalone win; prerequisite for the morph)

- [ ] 2.1 Extract an async `ONasNews` child that awaits `getLatestPost()`
      and renders `NewsLama`, wrapped in `Suspense` with a news skeleton on
      the plum-deep band; make `ONasPage` sync (mirror `HomeNews`,
      home/page.tsx)
- [ ] 2.2 Apply the same split to `/en/about-us`
- [ ] 2.3 Verify with `lib/scripts/check-prerender` (or the house
      equivalent) that `/o-nas` and `/en/about-us` now prerender a full
      static shell — team section present in no-JS HTML, news slot showing
      the skeleton — and that client nav from home no longer shows the
      loading shell

## 3. Render-synchronous arrival (standalone win; prerequisite for the morph)

- [ ] 3.1 Derive the slider's initial `index` from `?lama=` at first client
      render, keeping the Suspense-isolated `useSearchParams` read so the
      static shell is untouched; keep the Activity-cache repeat-visit swap
      (param changes while mounted) working as an instant swap
- [ ] 3.2 Add the pre-paint landing path to `ScrollReset`: on pathname
      commit with a hash whose target already exists, scroll inside the
      commit (mechanism per spike finding 1.3); keep the rAF-polling path
      as the fallback for late-appearing targets
- [ ] 3.3 Verify: client-nav from a tile paints frame one with the correct
      member at the `#zespol` position (Playwright; screenshot the first
      settled frame); direct URL visit and unknown-slug behavior unchanged;
      `bun run check` green

## 4. Morph wiring (gated on 1.7 go)

- [ ] 4.1 Land the config flag (if required) in `next.config.ts`
- [ ] 4.2 Name each grid tile `team-<slug>` in `why-that-works`, and the
      featured slot (only — never peers) with the active member's slug in
      the team slider; apply on both locales
- [ ] 4.3 Pin the fixed header with its own `ViewTransition` name
- [ ] 4.4 Suppress the wipe-reveal entrance on morphing arrivals only
      (deep-linked client nav); direct visits keep the wipe, including its
      settled clip state
- [ ] 4.5 Add the `prefers-reduced-motion` gate on the `::view-transition`
      pseudos, and the crop-tuning CSS if spike finding 1.5 called for it

## 5. Verification (gated on 1.7 go)

- [ ] 5.1 Playwright pass on PL + EN: tile click morphs to the on-screen
      featured slot with the right member; reduced-motion emulation gets the
      instant sequenced arrival; screenshot settled states (wipe lesson:
      rects lie, screenshots don't)
- [ ] 5.2 Regression sweep on previously-bitten areas: home ⇄ o-nas ⇄ home
      round trips under the Activity cache (GSAP reveals, Lenis reset,
      settled wipe), slider stepping after a morph arrival, `#zespol` direct
      hash visit
- [ ] 5.3 Confirm no-JS static shell parity (onas-team spec scenario) and
      run the deterministic a11y gate; `bun run check` + full test suite
      green

## 6. Documentation

- [ ] 6.1 Update design.md Open Questions with spike answers and any
      descope decision; note the flag (if any) and the scroll mechanism
      chosen
