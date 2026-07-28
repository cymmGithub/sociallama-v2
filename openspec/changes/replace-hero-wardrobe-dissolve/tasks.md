# Tasks

## 1. Build the band decomposition

- [ ] 1.1 In `outfit-stack.tsx`, keep the resting layer as an `<img>` per look, carrying today's `preload` on look-01 (primary instance), `fetchPriority="high"` (secondary instance) and `unoptimized`. This is the LCP candidate and must stay preload-scanner-discoverable.
- [ ] 1.2 Add two band layers of seven `<div>` each — outgoing and incoming — using `background-image`, `background-size: contain`, `background-position: center bottom`. Absolutely positioned at `inset: 0` so they never participate in layout.
- [ ] 1.3 Leave band `background-image` unset until the first transition fires, so no request is issued during initial load.
- [ ] 1.4 Compute band boundaries in integer pixels from the measured box height via `ResizeObserver`, rounding both sides of each boundary to the same integer: `top = Math.round(i * h / 7)`, `bottom = h - Math.round((i + 1) * h / 7)`. Do not use percentages, and do not bleed the bands.

→ verify: `bun run lint` and `bunx tsc --noEmit` clean; at rest the DOM shows one visible `<img>` per instance and fourteen zero-opacity bands.

## 2. Express the tear in CSS

- [ ] 2.1 In `hero.module.css`, retire `.look`'s `transition: opacity 1.26s var(--ease-out-quart) 270ms` and add `.band`.
- [ ] 2.2 Write one shared `@keyframes` reading per-band `--dx-a`, `--dx-b`, `--dx-c` custom properties, timed `270ms` with `steps(1)` so the three displacement steps land discretely 90 ms apart. Delay `270ms` so the word still leads.
- [ ] 2.3 Set the per-band `--dx-*` values from a single fixed table, identical for every transition. No `Math.random`.
- [ ] 2.4 Trigger the tear with a single class toggle. Do not drive it from a chain of `setTimeout` calls writing inline styles.
- [ ] 2.5 Do not add `will-change` to the bands.

→ verify: a transition produces one style recalculation to start it and no further per-step main-thread work in the Performance panel.

## 3. Per-band handoff

- [ ] 3.1 Ensure exactly one layer owns each band at every step: as a band flips to the incoming look, switch the corresponding outgoing band off rather than covering it.
- [ ] 3.2 On completion, hand off to the resting `<img>` for the incoming look and switch every band off, so no band structure survives into the settled state.

→ verify: step look-05 → look-01 (widest silhouette to narrowest) and confirm no bicorne is visible at any frame during or after; screenshot the settled state.

## 4. Verify the seams

- [ ] 4.1 With all bands visible showing one look at zero displacement, confirm no band boundary is distinguishable.
- [ ] 4.2 Repeat at device pixel ratios 1, 2 and 3. Deviation at any boundary row should sit below ~2/255 and improve with density.
- [ ] 4.3 Confirm the resting state shows zero anomalies at band-edge rows.

→ verify: controlled join test measured at all three densities; record the numbers.

## 5. Core Web Vitals

- [ ] 5.1 Confirm the LCP element is still look-01 and is still the `<img>`, not a background layer. This is the most likely regression in this change.
- [ ] 5.2 Confirm exactly five look requests, with the `look-01` preload present and looks 2–5 eager at normal priority — unchanged from before.
- [ ] 5.3 Confirm the tear bands issue no network request before the first transition.
- [ ] 5.4 Confirm CLS contribution is zero — no element changes size or position in layout during a tear.
- [ ] 5.5 Confirm no long tasks are attributable to the transition over at least ten consecutive cycles.

→ verify: Lighthouse LCP element unchanged; network panel matches the pre-change request list; Performance panel shows no long tasks.

## 6. Cross-platform check

- [ ] 6.1 Verify on Chrome/Android.
- [ ] 6.2 Verify on Safari/macOS.
- [ ] 6.3 Verify on Safari/iOS **on a real device**. This is gating, not optional: the claim that a static `clip-path` plus an animated `transform` stays on WebKit's compositor fast path is the one assertion in this change that cannot be verified without hardware. Both breakpoints get the tear, so test phone and tablet.
- [ ] 6.4 If iOS shows jank, add `will-change: transform` for the tear's duration only and remove it on completion — never leave it applied at rest.

→ verify: the tear looks and times the same on all three; note any divergence before archiving.

## 7. Confirm nothing else moved

- [ ] 7.1 Confirm `ROTATOR_INTERVAL` in `lib/hooks/use-rotator.ts` is untouched at 2600.
- [ ] 7.2 Confirm the headline word still slides at 1950 ms with `--ease-out-expo`.
- [ ] 7.3 Confirm `JoinCta` is unaffected — it shares the hook but not the transition.
- [ ] 7.4 With `prefers-reduced-motion: reduce` forced, confirm the hero holds look-01 with no tear and no band structure.
- [ ] 7.5 Confirm the mobile hero still fits the whole wardrobe bottom-flush, as established in `retime-hero-wardrobe-choreography`.

→ verify: screenshots at settled and mid-tear on both breakpoints, plus the reduced-motion state.

## 8. Watch items (carried past archive)

- [ ] 8.1 Recorded, not closed — one fixed offset table is reused for all five transitions, so the identical tear repeats roughly 23 times a minute. Watch for it beginning to read as mechanical. If observed, vary the table per look index; the alternative was evaluated and deliberately deferred (see `design.md`).
- [ ] 8.2 Recorded, not closed — the mattes' bodies sit at alpha 250–254 rather than 255, so ~1.2% of the plum ground reads through the llama. This predates the change and affects the shipped fade equally; the per-band handoff means nothing composites over anything, so this change does not depend on it. A clamp of alpha ≥ 250 → 255 at export would fix it for every layered technique. Out of scope here.
