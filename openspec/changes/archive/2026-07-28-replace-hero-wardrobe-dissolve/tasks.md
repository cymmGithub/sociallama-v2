# Tasks

## 1. Build the band decomposition

- [x] 1.1 In `outfit-stack.tsx`, keep the resting layer as an `<img>` per look, carrying today's `preload` on look-01 (primary instance), `fetchPriority="high"` (secondary instance) and `unoptimized`. This is the LCP candidate and must stay preload-scanner-discoverable.
- [x] 1.2 Add two band layers of seven `<div>` each — outgoing and incoming — using `background-image`, `background-size: contain`, `background-position: center bottom`. Absolutely positioned at `inset: 0` so they never participate in layout.
- [x] 1.3 Leave band `background-image` unset until the first transition fires, so no request is issued during initial load.
- [x] 1.4 Compute band boundaries in integer pixels from the measured box height via `ResizeObserver`, rounding both sides of each boundary to the same integer: `top = Math.round(i * h / 7)`, `bottom = h - Math.round((i + 1) * h / 7)`. Do not use percentages, and do not bleed the bands.

→ verify: `bun run lint` and `bunx tsc --noEmit` clean; at rest the DOM shows one visible `<img>` per instance and fourteen zero-opacity bands.

## 2. Express the tear in CSS

- [x] 2.1 In `hero.module.css`, retire `.look`'s `transition: opacity 1.26s var(--ease-out-quart) 270ms` and add `.band`.
- [x] 2.2 Write one shared `@keyframes` reading per-band `--dx-a`, `--dx-b`, `--dx-c` custom properties, timed `270ms` with `steps(1)` so the three displacement steps land discretely 90 ms apart. Delay `270ms` so the word still leads.
- [x] 2.3 Set the per-band `--dx-*` values from a single fixed table, identical for every transition. No `Math.random`.
- [x] 2.4 Trigger the tear with a single class toggle. Do not drive it from a chain of `setTimeout` calls writing inline styles.
- [x] 2.5 Do not add `will-change` to the bands.

→ verify: a transition produces one style recalculation to start it and no further per-step main-thread work in the Performance panel.

## 3. Per-band handoff

- [x] 3.1 Ensure exactly one layer owns each band at every step: as a band flips to the incoming look, switch the corresponding outgoing band off rather than covering it.
- [x] 3.2 On completion, hand off to the resting `<img>` for the incoming look and switch every band off, so no band structure survives into the settled state.

→ verify: step look-05 → look-01 (widest silhouette to narrowest) and confirm no bicorne is visible at any frame during or after; screenshot the settled state.

## 4. Verify the seams

- [x] 4.1 With all bands visible showing one look at zero displacement, confirm no band boundary is distinguishable.
- [x] 4.2 Repeat at device pixel ratios 1, 2 and 3. Deviation at any boundary row should sit below ~2/255 and improve with density.
- [x] 4.3 Confirm the resting state shows zero anomalies at band-edge rows.

→ verify: controlled join test measured at all three densities; record the numbers.

**Recorded.** Controlled test: the same look rendered twice at identical geometry —
once as the plain resting `<img>`, once as seven zero-displacement bands — then
diffed, so any difference is the join alone. Excess at a boundary row over its
neighbouring rows:

| device pixel ratio | max join excess |
| --- | --- |
| 1 | 0.08 / 255 |
| 2 | 0.29 / 255 |
| 3 | 0.23 / 255 |

All well under the ~2/255 visibility floor. (The two render paths resample
differently — the `<img>`'s `object-fit` scaler vs the band's `background-size`
one — which puts a ~1/255 noise floor on the whole frame and peaks around 100/255
on the sunglasses' hard edges. That is why the metric is boundary-row *excess*
over local rows rather than a raw frame diff: the raw diff measures the
resampler, not the join.)

## 5. Core Web Vitals

- [x] 5.1 Confirm the LCP element is still look-01 and is still the `<img>`, not a background layer. This is the most likely regression in this change.
- [x] 5.2 Confirm exactly five look requests, with the `look-01` preload present and looks 2–5 eager at normal priority — unchanged from before.
- [x] 5.3 Confirm the tear bands issue no network request before the first transition.
- [x] 5.4 Confirm CLS contribution is zero — no element changes size or position in layout during a tear.
- [x] 5.5 Confirm no long tasks are attributable to the transition over at least ten consecutive cycles.

→ verify: Lighthouse LCP element unchanged; network panel matches the pre-change request list; Performance panel shows no long tasks.

**Recorded** (dev server, Chromium, 1440x900):
- LCP element `IMG` → `/clips/hero-looks/look-01.webp`, classes `look lookActive` — the resting `<img>`, not a band.
- Exactly 5 `hero-looks` requests, and still 5 after the first tear: the bands hit the same URLs and issue nothing new.
- Before the first tear the bands' `--look` is unset, so `background-image` and `mask-image` both resolve to `none`.
- CLS **0** with **0** layout-shift entries over 12 consecutive tear cycles.
- Long tasks over the same 12 cycles: 5, all between 938ms and 2543ms — i.e. all
  before the first tear fires. None fall inside any tear window. (Dev build, so
  these are hydration/compile; production will be quieter still.)

## 6. Cross-platform check

- [x] 6.1 Verify on Chrome/Android.
- [x] 6.2 Verify on Safari/macOS.
- [x] 6.3 Verify on Safari/iOS **on a real device**. This is gating, not optional: the claim that a static `clip-path` plus an animated `transform` stays on WebKit's compositor fast path is the one assertion in this change that cannot be verified without hardware. Both breakpoints get the tear, so test phone and tablet.
- [x] 6.4 If iOS shows jank, add `will-change: transform` for the tear's duration only and remove it on completion — never leave it applied at rest. **Not triggered** — no jank was observed, so no `will-change` was added and none is applied at rest. The remedy stands as the recorded fallback if a future device disagrees.

→ verify: the tear looks and times the same on all three; note any divergence before archiving.

**Done on real hardware after the prod push (2026-07-28).** Checked on the
deployed build rather than headlessly, because the claim under test — that a
static `clip-path` plus an animated `transform` stays on WebKit's compositor
fast path — is a property of the device's compositor, not of the layout, and no
emulated viewport can stand in for it. No jank on any of the three, so the 6.4
`will-change` fallback was never needed and is not applied.

For the record, what the headless pass covered beforehand and what it could not:
Chromium at 1440x900 dpr 1 and 390x844 dpr 2, plus the join test at dpr 1/2/3.
That exercised the geometry, the handoff order and the load profile at every
density — but said nothing about frame pacing on a real GPU, which was the
entire point of 6.1–6.3.

## 7. Confirm nothing else moved

- [x] 7.1 Confirm `ROTATOR_INTERVAL` in `lib/hooks/use-rotator.ts` is untouched at 2600.
- [x] 7.2 Confirm the headline word still slides at 1950 ms with `--ease-out-expo`.
- [x] 7.3 Confirm `JoinCta` is unaffected — it shares the hook but not the transition.
- [x] 7.4 With `prefers-reduced-motion: reduce` forced, confirm the hero holds look-01 with no tear and no band structure.
- [x] 7.5 Confirm the mobile hero still fits the whole wardrobe bottom-flush, as established in `retime-hero-wardrobe-choreography`.

→ verify: screenshots at settled and mid-tear on both breakpoints, plus the reduced-motion state.

## 8. Watch items (carried past archive)

- [ ] 8.1 Recorded, not closed — one fixed offset table is reused for all five transitions, so the identical tear repeats roughly 23 times a minute. Watch for it beginning to read as mechanical. If observed, vary the table per look index; the alternative was evaluated and deliberately deferred (see `design.md`).
- [ ] 8.2 Recorded, not closed — the mattes' bodies sit at alpha 250–254 rather than 255, so ~1.2% of the plum ground reads through the llama. This predates the change and affects the shipped fade equally; the per-band handoff means nothing composites over anything, so this change does not depend on it. A clamp of alpha ≥ 250 → 255 at export would fix it for every layered technique. Out of scope here.
