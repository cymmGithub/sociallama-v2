## Why

The hero's wardrobe tear reads as a clean mechanical cut; the user wants a subtle, premium chromatic accent on it. A published 4-variant mock (https://claude.ai/code/artifact/7fb776e6-f948-4d74-8cda-c21e148affa4, 2026-07-30) narrowed the direction — the iridescent-sheen variant was rejected — but the mock is not enough to pick between the three fringe variants: the decision needs the real hero, real cadence, real copy, on local dev.

## What Changes

- The seven tear bands gain chromatic "misregistration" ghost fringes: flat-color silhouette copies of the look, offset horizontally, visible only during the 270–540 ms displacement window. The settled llama, the choreography timing, and the loading characteristics stay untouched.
- Three candidate variants are implemented behind a single switch, evaluated live on local dev **in order A → B → C**, and the picked one ships:
  - **A** — cream left / orange right, 6 px, 35% (torn-print, felt more than seen)
  - **B** — cream left / orange right, 14 px, 60% (unmistakable torn-print)
  - **C** — cyan left / red right, 10 px, 50% (literal RGB split, deliberately off-palette)
- The `hero-wardrobe` spec's compositor-only rule gains a static-`mask-image` carve-out (same rationale as the existing static `clip-path` carve-out), and the band DOM/layer budget is restated to cover the ghost layers.
- After the user locks a variant, the losing variants' values are removed; the switch does not ship as a runtime feature.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `hero-wardrobe`: the choreographed tear gains a chromatic fringe requirement (ghosts only during displacement, none at rest, none under reduced motion, deterministic); the compositor-only requirement is amended to permit static `mask-image` alongside static `clip-path`; the loading requirement's element/layer bound is raised to account for ghost layers that hold no image until the first tear.

## Impact

- `app/(frontend)/(home)/sections/hero/outfit-stack.tsx` — band markup gains per-strip ghost layers (look image moves off the band element so ghosts can paint beneath it); ghost mask URLs must reuse `currentSrc` exactly like band backgrounds do (Vercel `?dpl` cache-key rule).
- `app/(frontend)/(home)/sections/hero/hero.module.css` — ghost keyframes on the existing stepped schedule; variant tokens as custom properties.
- No Payload schema, content, or asset changes; the five look WebPs are reused as masks (same URLs, no new requests). No breaking changes.
- Both hero breakpoint instances inherit the effect automatically; iOS Safari parity must be re-verified (mask rasterization during tears).
