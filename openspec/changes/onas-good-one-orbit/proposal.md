## Why

The /o-nas "JESTEŚMY CZĘŚCIĄ GOOD ONE" section already reads as an orbital diagram — a Good One hub ringed by six child-company logos on a dotted track — but it's a single static PNG, so nothing moves. Bringing the child companies to life by orbiting the hub completes the metaphor. A live prototype of the effect was built and approved before this proposal.

## What Changes

- Rebuild the good-one wheel from one flat image into a **positioned DOM component**: a fixed center hub, six child logos on a ring, a dotted ring track, and six orange spoke dots.
- **Desktop**: the ring (dotted track + orange dots) and the six logos **co-rotate in lockstep** as a perpetual slow spin (~54s/revolution) — each dot stays on the spoke inboard of its logo, and each logo counter-rotates to stay upright and readable. The center hub holds still.
- **Mobile / below the desktop breakpoint**: keep the **existing static PNG** wheel unchanged — no orbit. Mirrors the site's hero pattern (desktop scroll-scrub, mobile static). Six positioned wide logos crowd and become unreadable at phone width; the single image scales cleanly.
- Respect `prefers-reduced-motion` (halt the spin) and gate the animation to in-view so nothing animates offscreen.
- Logos: use raster crops extracted from the existing wheel PNG for now (clean SVGs may replace them later).

## Capabilities

### New Capabilities
- `onas-good-one`: the /o-nas Good One group section — its content, the desktop orbiting-wheel motion, and the mobile static-image fallback.

### Modified Capabilities
<!-- none — no existing spec covers this section -->

## Impact

- **Code**: `app/(frontend)/o-nas/sections/good-one/index.tsx`, `app/(frontend)/o-nas/sections/good-one/good-one.module.css`; optionally `lib/content/o-nas.ts` (`oNasGoodOne.companies`, currently vestigial with empty `logo:''`, to drive the six logos).
- **Assets**: six child-logo crops + one hub crop under `public/o-nas/good-one/` (raster, extracted from `good-one-wheel.png`); the existing `good-one-wheel.png` stays as the mobile fallback.
- **Scope / parallel-safety**: touches only the good-one section. MUST NOT touch shared surfaces (footer, `home.ts`, socials/menu, `ui/image`, `ui/link`, `global.css` tokens) or the reused homepage sections. Fully independent of `polish-homepage` and `polish-o-nas`.
