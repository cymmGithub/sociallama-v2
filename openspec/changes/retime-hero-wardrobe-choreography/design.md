# Design

## The measurement that shaped the change

Alpha-channel analysis of the five shipped stills (`public/clips/hero-looks/look-0{1..5}.webp`, 820×1080):

```
                     look1  look2  look3  look4  look5
 ear-tip left x        243    241    242    245    244    ← ±2px
 ear-tip right x       586    586    584    586    587    ← ±3px
 top of head y          48     46     46     47     48    ← ±2px

 silhouette width by row:
   y=400  (neck)       237    253    253    235    249    ← ~identical
   y=600  (neck)       246    266    262    239    244    ← ~identical
   y=655  ────────────────── seam ──────────────────────
   y=700  (shoulder)   481    401    434    379    409    ← 100px spread
   y=800  (torso)      644    665    661    658    695
```

The head is a pixel-locked anchor; everything that changes lives below y≈655 (60.6%) plus the eyewear band at y≈200–330. A whole-frame cross-dissolve therefore spends its motion on a surface that is ~65% byte-identical.

That finding argued for a masked band split — and a prototype was built. Two things killed it:

1. **The seam bled.** Two complementary gradient masks do not sum to opaque: alpha compositing is `a + b(1-a)`, so two facing 50% ramps cover only 75% and the plum ground showed through the neck as a pink band. Fixable (opaque base, feather only the crown over it) but it is real architecture with a real failure mode.
2. **The silhouette ghost is inherent.** With a 100 px shoulder spread, a wider outgoing look (streetwear, 481 px) visibly fringes around a narrower incoming one (suit, 379 px) mid-transition, regardless of masking.

Weighed against a retiming that needs three declarations and has no failure modes, the band split did not earn its cost.

## Decision: velocity over frequency

Two settings at a comparable share-of-cycle-in-motion feel entirely different:

| | interval | word | outfit | in motion |
|---|---|---|---|---|
| today | 2600 ms | 650 ms | 500 ms | ~25% |
| evaluated | 7800 ms | 1950 ms | 1260 ms | ~25% |
| **chosen** | **2600 ms** | **1950 ms** | **1260 ms** | **~75%** |

The initial hypothesis — that a low still-to-moving ratio is what reads as cheap — did not survive the comparison. The two 25% settings sit at an identical duty cycle and only the slower one reads as composed. **What changes the perception is the absolute speed of the movement, not how often it occurs.**

## Decision: 1950 ms word slide, accepting a 75% duty cycle

Ship values: interval 2600 ms, word 1950 ms, outfit 1260 ms after a 270 ms lead.

The longest chain is the word at 1950 ms, so the hero rests for ~650 ms of each 2600 ms cycle.

**Alternative considered and rejected: word 1100 ms** (42% in motion, ~1500 ms rest), keeping the outfit at 1260 ms. The argument for it: long moving *text* is harder to read than long moving *imagery*, since nobody has to read the outfit; decoupling the word from the outfit would buy an actual beat of rest without touching the wardrobe's unhurried feel.

**Rejected in favour of 1950 ms** on the explicit judgment that the word and the outfit should move at the same tempo — the slower headline is part of the effect being bought, not a side effect of it. Recorded here because it is a deliberate trade, not an oversight.

**Consequence to watch after ship:** with only ~650 ms of slack, a long task on the main thread can let a `setInterval` tick land before the previous slide has settled. An interrupted `transform` transition on the rotator will snap rather than blend, because waiting words sit at `translateY(120%)` with no transition of their own. Not a blocker — the same exposure exists today with a wider margin — but it is the first thing to look at if the headline is ever seen to jump.

## Decision: asymmetric easing

`--ease-in-out-quad` is symmetric, and symmetric easing is the loudest tell of unconsidered motion — heavy things leave fast and arrive slow. The wardrobe moves to `--ease-out-quart`; the word keeps `--ease-out-expo`, which it already used. Both are existing tokens in `lib/styles/css/easings.css`; no new easing is introduced.

## Decision: stagger, not simultaneity

The 270 ms lead (≈21% of the outfit duration) means the word commits first and the wardrobe answers it. The eye reads sequence as intent and simultaneity as automation. This is the single cheapest part of the change and carries a disproportionate share of the result.

## Why nothing else was considered

Ruled out before prototyping, against the constraint that the hero must behave identically on Chrome/Android, Safari/macOS and iOS Safari:

- **View Transitions API** — designed for discrete, user-initiated state changes. Driving it from a 2.6 s timer means a repeated full-document snapshot with rendering frozen, forever, on the LCP element of a page running Lenis smooth scroll.
- **Scroll-driven animations** (`animation-timeline`) — excluded by the brief, and still not Baseline: Firefox stable keeps it behind `layout.css.scroll-driven-animations.enabled`.
- **Animated `mask-image` / `clip-path`** — re-rasterizes the layer each frame. A static mask is baked into the texture once and is free; an animated one is not, and iOS Safari is the weakest platform for exactly this.
- **`filter` / `backdrop-filter` glitch and chromatic effects** — per-frame full-surface repaint on an 820×1080 element, on an infinite loop.

GSAP was available at zero marginal cost — `GSAPRuntime` is mounted unconditionally in `lib/features/index.tsx` and `gsap` is already in `optimizePackageImports` — and was still not needed. CSS transitions express the whole change.
