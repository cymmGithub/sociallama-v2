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
- No pagination dots, arrows, or autoplay. Native momentum scrolling is the whole interaction.

## Decisions

- **Scroll-snap rail over reusing the `/o-nas` slider**: the slider's identity is its details panel and plum-band presentation, not the swipe mechanic; the mechanic alone is ~10 lines of CSS. See the proposal's rejected-alternative note.
- **Keep `.faces` a grid, switch mobile to `grid-auto-flow: column`** with an explicit `grid-auto-columns` tile width, rather than converting to flex — smaller diff, the desktop rule stays untouched, and `gap` carries over.
- **Tile width ≈46vw**: keeps the `mobileSize="46vw"` image size buckets honest (no refetch at a new variant) and leaves ~half of the third tile peeking as the swipe affordance.
- **`scroll-snap-type: x mandatory` + `scroll-snap-align: start` on tiles**: tiles settle aligned; `overscroll-behavior-x: contain` stops the rail chaining into browser back/forward gestures. Vertical page scroll is native — a scroll container doesn't capture cross-axis drags.
- **Scrollbar hidden** per house style for decorative rails (match how other horizontal strips in the repo handle it, e.g. the marquee/client-belt treatment if one exists — otherwise `scrollbar-width: none` + `::-webkit-scrollbar { display: none }`).

## Risks / Trade-offs

- [Settled reveal state clips or transforms the overflow container] → `.stage`/`.bottom` reveal is not the wipe variant, but verify the settled state visually (screenshot, not rect queries — cf. the wipe-clip lesson from the orbit-logos regression).
- [Lenis smooth-scroll interference with a nested horizontal scroller] → Lenis handles vertical wheel/touch; horizontal touch pans inside an `overflow-x` container are native. Verify swipe on a real touch emulation, and wheel behavior on desktop-narrow widths (rail only exists under `--mobile`, so desktop wheel is out of scope).
- [Discoverability: swipe affordance is only the peeking tile] → accepted; the CTA tile at the rail's end still reaches /o-nas for the full roster, and the peek is the established pattern for mobile rails.
- [A 46vw×4:5 tile row is shorter than the old grid, reducing "mass of team" reading on mobile] → accepted trade-off; the rail's cut-off tile implies continuation, and desktop keeps the full mosaic.
