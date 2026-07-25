## Why

The hero's llama changes outfit every 2.6 s with a 500 ms `ease-in-out-quad` opacity cross-dissolve, fired on the same tick as the headline word's 650 ms `ease-out-expo` slide. Two motions, two unrelated curves, no stagger — they read as two scripts running at once rather than one thing causing another.

A side-by-side study of five candidate treatments (whole-frame dissolve, retimed choreography, a masked wardrobe band, a horizontal wardrobe rail, and a flash cut) established two things:

- **The mechanism was never the problem.** The five looks are pixel-registered at the head — ear tips within 3 px, top of head within 2 px across all five stills — so only the wardrobe below 60.6% and the eyewear band actually change. Every candidate that added machinery (masks, band splits, slides) bought less than simply retiming what already ships.
- **Absolute velocity is what reads as expensive, not frequency.** Today's 2.6 s / 650 ms and a much slower alternative sit at comparable duty cycles yet feel nothing alike. Slowing the movement itself was the whole effect.

So this change ships the retiming and nothing else: same elements, same images, same cross-dissolve, different durations and curves.

## What Changes

- **Slow the wardrobe cross-dissolve** from 500 ms to **1260 ms** and switch its curve from the symmetric `--ease-in-out-quad` to `--ease-out-quart`.
- **Delay the wardrobe by 270 ms** so it resolves *behind* the headline word instead of alongside it — the word leads, the outfit follows.
- **Slow the hero's headline word slide** from 650 ms to **1950 ms**, keeping `--ease-out-expo`.
- **Leave `ROTATOR_INTERVAL` at 2600 ms.** The cadence is unchanged; only the motion inside it slows.
- **Fit the whole llama on phones.** `.mobileLook` switches from a `cover` head-crop anchored at 12% to `contain` bottom-flush, so the entire wardrobe is visible instead of ~34% of it on a 360 px phone. This removes the `@media (min-width: 600px) and (orientation: portrait)` override, which existed only to apply `contain` to portrait tablets.
- **Record the shipped hero wardrobe behaviour as a capability.** No current spec describes it — `hero-scroll-scrub` and the hero section of `homepage` still describe the superseded pinned-scrub video hero.

## Capabilities

### New Capabilities

- `hero-wardrobe`: the homepage hero's static-pose outfit stack — five transparent stills sharing one pose, index-locked to the headline rotator, and the choreography that transitions between them.

### Modified Capabilities

<!-- none — hero-scroll-scrub and homepage are stale rather than changed by this work; see Impact -->

## Impact

- **Modified**: `app/(frontend)/(home)/sections/hero/hero.module.css` only — `.look`, `.rotatorWordActive`, `.rotatorWordLeaving`, and `.mobileLook` (plus deletion of the now-redundant portrait-tablet override).
- **Not modified**: `lib/hooks/use-rotator.ts` (`ROTATOR_INTERVAL` unchanged), `outfit-stack.tsx`, `index.tsx`, and every image asset.
- **Blast radius is hero-only.** `JoinCta` carries its own `.rotatorWordActive` at 650 ms in `join-cta/join-cta.module.css`; it shares the hook but not the timing, so it is untouched.
- **Core Web Vitals unaffected.** No change to the LCP element, the `look-01` preload, the five eager fetches, the DOM, the composited layer count, or the reduced-motion path. A 1260 ms opacity transition is the same compositor work as a 500 ms one, spread over more wall-clock.
- **Cross-platform risk: none added.** `opacity` and `transform` are compositor-driven on Chrome/Android, Safari/macOS and iOS Safari alike. No masks, no `clip-path`, no filters, no View Transitions, no scroll-driven animation.
- **Known tradeoff, accepted:** at a 2600 ms interval the 1950 ms word slide leaves ~650 ms of rest, so the headline is in motion ~75% of the cycle. A 1100 ms word was evaluated against 1950 ms and 1950 ms was chosen. See `design.md`.

## Non-goals

- The masked wardrobe band, the wardrobe rail and the flash cut. All three were prototyped and set aside; the band split additionally needs a fix for outgoing looks whose silhouette is up to 100 px wider at the shoulder than the incoming one.
- Correcting the stale `hero-scroll-scrub` and `homepage` hero requirements. Flagged here, out of scope.
- Pausing the client-logos marquee while the hero is on screen. Identified as likely worth more than this change; deliberately kept separate.
