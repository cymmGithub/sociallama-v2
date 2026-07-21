## Context

The good-one section renders one finished PNG (`good-one-wheel.png`) with every logo, label, spoke, and the hub baked in. A true "children orbit the hub" motion is impossible on a flat image — rotating it spins the hub and every label too. The effect requires decomposing the wheel into individually-positioned elements. A working prototype validated the approach, the co-rotating ring, and the exact CSS gotchas below before this change was written.

## Goals / Non-Goals

**Goals:**
- Desktop: child companies orbit a fixed hub, logos upright, ring + orange dots co-rotating in lockstep.
- Mobile: zero regression — keep the proven static wheel.
- Motion is safe: reduced-motion and offscreen states don't animate.

**Non-Goals:**
- Any orbit on mobile (deliberately excluded — crowding/readability).
- Clean vector logos (raster crops for now; SVG swap is a later, drop-in change).
- Scroll-linked motion (perpetual spin chosen); touching any section other than good-one.

## Decisions

- **Perpetual spin, not scroll-linked.** User chose continuous rotation (~54s/rev). Trade-off vs. the site's scroll-scrub language: it always moves while in view, so it MUST be in-view-gated and reduced-motion-aware to avoid wasted/unwanted animation. Alternative (scroll-linked, matching hero/how-it-works) was considered and declined.
- **Co-rotate the ring with the logos as one system.** The dotted track + six orange dots and the six logos share one duration and start phase, so each dot stays on its logo's spoke. Logos counter-rotate to stay upright; dots (radially symmetric) don't need to.
- **Animate a registered `@property` angle on the same element whose `transform` reads it.** With `@property --a { inherits: false }`, the animated value only reaches the transform if it's on the same element — the prototype's first attempt animated it on a parent and every logo piled at 12 o'clock. Lesson encoded here.
- **`overflow: visible` on the ring SVG.** Spoke dots sit on the ring at the viewBox edge; the SVG's default `overflow: hidden` clips them as the ring rotates (found in the prototype — "the dots are cut in half").
- **Desktop-only rebuild; mobile keeps the PNG.** Same pattern as the hero (desktop scrub / mobile static poster). Below the desktop breakpoint the component renders the existing `<Image src="good-one-wheel.png">` verbatim; at/above it, the orbiting DOM.

## Risks / Trade-offs

- **Raster logos soften at large sizes** → they're small on the ring, so acceptable; SVGs can drop in later without a structural change.
- **Perpetual animation cost** → mitigated by in-view gating (IntersectionObserver / existing reveal hook) and GPU-only transforms; six elements, negligible.
- **Breakpoint seam** (orbit vs static PNG) → both render the same six companies + hub, so the switch reads as a fidelity change, not a content change.

## Migration Plan

Additive: the new component replaces the single `<Image>` on desktop and reuses it on mobile. The `good-one-wheel.png` asset stays. Rollback is a git revert.

## Open Questions

None blocking. Clean vector logos are a possible later enhancement, not a prerequisite.
