## Context

The homepage `why-that-works` team grid renders 15 member tiles plus a CTA tile from the `TEAM` array in `app/(frontend)/(home)/sections/why-that-works/index.tsx`. Layout lives in `why-that-works.module.css`: `.faces` is a CSS grid — `repeat(4, 1fr)` on desktop, `repeat(2, 1fr)` under `@media (--mobile)` — and each `.tile` is `aspect-ratio: 4/5` with the cutout image, caption, and a full-tile deep link. The `.stage` wrapper is a `data-reveal-item` inside a `useReveal` group. Images carry `mobileSize="46vw"`, which matches the two-column tile width.

## Goals / Non-Goals

**Goals:**
- Mobile team section collapses from ~8 rows to ~one tile-height, swipeable horizontally.
- Full roster + CTA tile remain reachable; captions and deep links untouched.
- CSS-only; no new component, JS, or content changes.

**Non-Goals:**
- No change to the desktop grid, the `/o-nas` slider (any viewport), or the EN locale beyond what the shared component gives for free.
- No featured-member presentation (bios, certs) on the homepage — explicitly rejected in the proposal.
- No pagination dots, interactive arrows, or autoplay. Native momentum scrolling is the whole interaction. (Amended 2026-08-04: a *passive* chevron swipe hint below the rail was added by user decision — decorative, not a control; it fades out on the first swipe where scroll-driven animations are supported.)

## Decisions

- **Scroll-snap rail over reusing the `/o-nas` slider**: the slider's identity is its details panel and plum-band presentation, not the swipe mechanic; the mechanic alone is ~10 lines of CSS. See the proposal's rejected-alternative note.
- **Keep `.faces` a grid, switch mobile to `grid-auto-flow: column`** with an explicit `grid-auto-columns` tile width, rather than converting to flex — smaller diff, the desktop rule stays untouched, and `gap` carries over.
- **Tile width 44vw + full-bleed breakout** (revised during implementation): the original "~46vw with half a tile peeking" math didn't hold — two ~46vw tiles + gap already overflow the `--safe`-padded ~91.8vw container, leaving a ~6px invisible sliver. The rail breaks out of the section padding (`margin-inline: calc(-1 * var(--safe))` with matching `padding-inline`/`scroll-padding-inline`, so snapped tiles still align to the content edge) and tiles are 44vw, yielding an ~18px peek cut at the literal viewport edge. `mobileSize="46vw"` stays honest (same fetch buckets, marginal overfetch).
- **`scroll-snap-type: x mandatory` + `scroll-snap-align: start` on tiles**: tiles settle aligned; `overscroll-behavior-x: contain` stops the rail chaining into browser back/forward gestures. Vertical page scroll is native — a scroll container doesn't capture cross-axis drags.
- **Scrollbar hidden** per house style for decorative rails (match how other horizontal strips in the repo handle it, e.g. the marquee/client-belt treatment if one exists — otherwise `scrollbar-width: none` + `::-webkit-scrollbar { display: none }`).

## Risks / Trade-offs

- [Settled reveal state clips or transforms the overflow container] → `.stage`/`.bottom` reveal is not the wipe variant, but verify the settled state visually (screenshot, not rect queries — cf. the wipe-clip lesson from the orbit-logos regression).
- [Lenis smooth-scroll interference with a nested horizontal scroller] → Lenis handles vertical wheel/touch; horizontal touch pans inside an `overflow-x` container are native. Verify swipe on a real touch emulation, and wheel behavior on desktop-narrow widths (rail only exists under `--mobile`, so desktop wheel is out of scope).
- [Discoverability: swipe affordance is only the peeking tile] → user rejected this accepted risk during sign-off (2026-08-04): a passive `ChevronsRight` hint sits under the rail at the content edge, brand orange (`--color-orange`, matching the tiles' own arrows; a muted-gray first pass was too subtle — user call), `aria-hidden`, outside the tiles so it cannot read as a tappable control. A CSS scroll-driven animation (behind `@supports (animation-timeline: scroll())` — without the gate the 0s document-timeline fallback would hide it permanently) fades it within the first ~1.5 tiles of swiping; unsupported browsers keep it visible.
- [A 46vw×4:5 tile row is shorter than the old grid, reducing "mass of team" reading on mobile] → accepted trade-off; the rail's cut-off tile implies continuation, and desktop keeps the full mosaic.
