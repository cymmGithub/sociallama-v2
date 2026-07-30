## Context

The tear (replace-hero-wardrobe-dissolve) shears the llama into seven bands that displace in three 90 ms `steps(1)` jumps and hand off outgoing→incoming per band. Everything is CSS keyframes; JS toggles one class and writes band geometry. The `hero-wardrobe` spec forbids animating `filter`/`mask-image`/`clip-path` (compositor-only motion) but permits a *static* `clip-path` because it bakes into the texture at rasterization.

A 4-variant mock (artifact 7fb776e6, built from the production timing tables) settled the mechanism and the shortlist. Two findings from the mock carry over:

- A deep-plum ghost is invisible against the plum ground; **cream + orange** is the pair that completes the torn-print read for variants A/B.
- Freezing choreography by wall-clock timers misses the tear (the first style flush after creating band layers can start CSS animations late); verification must seek `animation.currentTime` via WAAPI. Capture the `getAnimations({subtree: true})` references once at freeze time and reuse them for every seek: a finished fill-none animation stops being "relevant" and drops out of later `getAnimations()` queries, so any seek past 540 ms silently loses `tearShift`/ghost from a re-queried list (found implementing 2.3 — the held references stay seekable and rewinding makes them relevant again).

## Goals / Non-Goals

**Goals:**

- Chromatic fringes on the tear strips, on the exact existing schedule — no timing, cadence, or easing changes.
- All three shortlisted variants switchable by editing one constant, so the user can review A → B → C live on `bun dev` with HMR.
- Zero cost at rest: no extra network requests, no layers holding images before the first tear, settled frame pixel-identical to today.

**Non-Goals:**

- No runtime/production variant switch (no query param, no env var) — the switch is a source-level constant that dies after the pick.
- No fringe on the headline word, no changes to the sheen-rejected treatment, no changes to reduced-motion behavior (no tear ⇒ no fringe, for free).
- No mobile-specific tuning beyond what the shared CSS already gives both breakpoint instances.

## Decisions

**1. Ghosts are flat-color layers masked by the look's own alpha — not filters, not blends.**
`background-color: <ink>` + static `mask-image: <look URL>` produces an exact brand-color silhouette. A static mask rasterizes once like the permitted static `clip-path`; only `opacity`/`transform` ever animate. Rejected: tinting via static `filter` chains (approximate colors, harder to reason about), `mix-blend-mode` (compositing-group cost on 14 strips, and the mock showed flat inks read better).

**2. Band structure becomes: band element (clip + shear vars, paints nothing) → `::before` ghost-left, `::after` ghost-right, plus one child `<span>` carrying the look image.**
The image must paint *above* the ghosts so fringes peek only past the silhouette edge; an element's own background is always its lowest layer, so the current `background-image`-on-band arrangement cannot sit above pseudo-element ghosts — the image moves to a child span, ghosts take the pseudos with `z-index: -1`. Costs 14 extra DOM nodes per instance (28 across breakpoints). Rejected: three real children per band (mock structure — heavier DOM for no gain); one alternating ghost per band via pseudos only (halves the effect; the mock's two-ink read was the point).

**3. Ghost geometry rides the parent band.**
Pseudos inherit the band's animated shear transform, so a ghost is `translateX(±G)` — constant offset, no per-ghost displacement table. Fringe timing is one `steps(1)` keyframe animation (`0% → 0`, `50% → α`, `100% → 0`, duration 540 ms) so ghosts switch on exactly at 270 ms and off at 540 ms; the band's own opacity handoff gates which layer's ghosts are visible, and the A/B animation-name alternation applies to the ghost animation the same way it does to `tearShiftA/B`.

**4. Variants are a `FRINGE_VARIANT` constant in `outfit-stack.tsx` mapping to CSS custom properties (`--fringe-l`, `--fringe-r`, `--fringe-g`, `--fringe-a`) on the llama box.**
One line to flip, HMR shows it live, and locking the pick means deleting two table rows. Values: A = cream/orange 6 px 35%; B = cream/orange 14 px 60%; C = `#21e6ff`/`#ff2e5b` 10 px 50%.

**5. Ghost masks are assigned only when a tear fires, from `servedUrl()`.**
Same rule and same code path as band `background-image` today: the mask URL must be the browser's `currentSrc` (Vercel `?dpl` skew-protection) or every look's mask becomes a second cache entry. Before the first tear the pseudos have no mask and no ink — nothing to fetch, nothing to raster. Mask + color ride the same inline `--look`-style custom properties the bands already get.

## Risks / Trade-offs

- [Mask rasterization of 28 ghost layers per instance during a tear could jank low-end iOS] → layers are opacity-0 outside the 270–540 ms window and carry no `will-change`, so nothing persists between tears; verify on real iOS Safari before merge (spec already requires parity).
- [Matte edge residue: the looks' alpha edges sit at 250–254 and look-02 touches the canvas edge; a bright ink can pick out a 1-px edge column] → the mock needed `clip-path: inset(0 2px)` only for the *sheen* (bright gradient); flat inks at ≤60% did not show it. Check during A review; if visible, shave the ghost pseudos with the band's existing static clip.
- [6 px / 35% (variant A) may be subliminal at real cadence] → that is precisely what the on-dev review is for; the tokens make intensity a two-number tweak if the user wants an A/B intermediate.
- [Pseudo-elements can't be styled from React inline styles] → all per-band values already flow through inherited custom properties; ghosts only consume inherited vars, so this stays a CSS-module concern.

## Migration Plan

Frontend-only, no data or schema changes; ships like any hero CSS/JSX change. Rollback = revert the commit. The dev-DB worktree flow needs no `--isolated`.

## Open Questions

- Which variant ships (A / B / C, or a tuned intermediate) — resolved by the user on local dev; the spec delta is written parameterized and gets locked to the chosen values before archive.
