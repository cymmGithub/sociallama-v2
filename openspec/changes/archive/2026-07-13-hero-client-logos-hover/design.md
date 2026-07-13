## Context

The homepage (built by the `sociallama-homepage` change) renders chapter 1 as `<Hero />` followed by `<ClientLogos />`. The hero is `min-height: 100svh` with centered content, so the logo belt always starts below the fold. `ClientLogos` is a server component that renders the shared `<Marquee>` (RAF-driven via tempus, scroll-velocity-reactive, `pauseOnHover` prop available but unused) with white-silhouette logos (`filter: brightness(0) invert(1)`) on the plum chapter background.

The reference implementation lives in `/mnt/work/goodone/sociallama/app/(frontend)/components/ClientLogos.{tsx,module.css}`: CSS-keyframe belt that pauses on hover, `:has()`-based spotlight dimming, a cream testimonial card absolutely positioned above the hovered logo with a caret, and a small `onMouseEnter` handler that measures the card and sets a `--shift` custom property to keep it inside the viewport (caret counter-shifts to stay on the logo).

Constraints: keep the current Satus visual design; no CMS; house rules in `AGENTS.md` (CSS modules, Biome, React 19 / Next 16).

## Goals / Non-Goals

**Goals:**
- Logo belt visible in the first `100svh` viewport alongside the hero.
- Sociallama hover behavior: pause belt, spotlight hovered logo, testimonial card with edge-shift.
- All 13 brands carry a card (4 real quotes, 9 clearly-flagged lorem placeholders).
- Touch and reduced-motion behavior no worse than today.

**Non-Goals:**
- ~~No color-reveal on hover~~ *(revised during review — see Revisions below)*.
- No CMS/Payload integration; no changes to the shared `<Marquee>` component's API.
- ~~No redesign of the belt's resting look (sizes, gaps, section borders stay)~~ *(revised: section borders removed — see Revisions below)*.
- No card-open-on-tap affordance for touch devices (matches reference).

## Decisions

**1. Keep the RAF `<Marquee>`; do not port sociallama's CSS-keyframe belt.**
The Satus marquee already supports `pauseOnHover` and integrates with Lenis scroll velocity. Its `overflow-x: clip` leaves `overflow-y` visible (the `clip` value is the only overflow keyword that allows mixed-axis behavior), so testimonial cards can escape upward without touching the shared component. Porting the keyframe belt would lose scroll-velocity reactivity and duplicate a working component.
*Alternative considered:* copying sociallama's `[...brands, ...brands]` single-track keyframe approach — rejected; it forks the marquee pattern used elsewhere on the page (`BigMarquee`).

**2. Hero and belt share the first viewport via a chapter-1 layout wrapper.**
Chapter 1's first screen becomes a `100svh` flex column: hero content takes `flex: 1` (still visually centered in the remaining space), the belt pins to the bottom. The hero section drops its own `min-height: 100svh` in favor of the wrapper owning the viewport height. On short viewports (e.g. landscape phones ~660px), a `min-height` floor on the hero content lets the belt overflow below the fold rather than crushing the clamp()-sized headline.
*Alternative considered:* `min-height: calc(100svh - <belt height>)` on the hero — rejected as fragile; the belt height is fluid and the two sections would need to agree on a magic number.

**3. `ClientLogos` becomes a client component; the edge-shift handler ports nearly verbatim.**
The `keepCardOnScreen` mouseenter handler (measure card rect, set `--shift` px custom property on the `<li>`; caret uses `calc(50% - var(--shift))` clamped to the card) is small, proven, and has no dependencies. Hover-only cost: no state, no re-renders — everything else stays CSS.
*Alternative considered:* a floating-UI/popper dependency — rejected; ~20 lines of JS vs. a new dependency for a single tooltip.

**4. Spotlight via `:has()` at the track level, gated to fine pointers.**
`.track:has(.item:hover) .item:not(:hover) .logo { opacity: .2 }` plus full opacity on the hovered item, inside `@media (hover: hover) and (pointer: fine)`. Logos remain white silhouettes; only opacity ramps. All modern targets support `:has()`; degradation without it is the current per-logo hover — acceptable.

**5. One caveat vs. the reference: the marquee repeats children as whole blocks.**
`<Marquee repeat={2}>` duplicates the entire track `div`, so `:has()` scoping must sit on the track `ul` *inside* each repeat (dimming applies within the hovered copy; the clone is a belt-width away and off-focus, so cross-copy dim mismatch is imperceptible). The duplicate copy is already `aria-hidden` by `<Marquee>`; cards inside it are hidden from AT for free.

**6. Content contract: optional `testimonial` on `Client` in `lib/content/home.ts`.**
`testimonial?: { quote: string; author: string; company: string }`. 4 real quotes copied verbatim from the verified content export (Funtronic — Piotr Treszczotko, Intrum Justitia — Katarzyna Gosiewska, Uniphar — Marta Szwat, Aquael — Beata Nartowska). 9 lorem entries authored as "Imię Nazwisko, {company}" matching the reference DB, each preceded by `// TODO: placeholder — replace before launch` so they are one grep away from an audit. The featured iRobot quote stays where it is (it is not a belt logo).

**7. Z-index: cards float above hero content via section stacking.**
The client-logos section gets a `z-index` above the hero (reference uses the same fix). Card itself stacks above the belt's edge-fade overlays.

## Risks / Trade-offs

- [Lorem quotes reachable in production] → By design for client review; every placeholder carries a grep-able TODO and the proposal marks them a launch blocker.
- [Belt + hero don't fit short viewports] → `min-height` floor on hero content; belt drops below the fold instead of compressing the headline. Verify at ~660px height.
- [Hovered logo moves under a stationary cursor before pause kicks in] → `pauseOnHover` pauses the whole marquee on section mouseenter, same as the reference's belt freeze; jitter is bounded by one frame.
- [Card clipped by an ancestor] → `<Marquee>`'s `overflow-x: clip` is safe, but the new chapter-1 wrapper and `Chapters` ancestors must not introduce `overflow: hidden`/`clip` on the y-axis; check during implementation.
- [`:has()` on a moving track forces style recalc during hover] → Belt is paused while hovered, so recalc happens on a static layout; no measurable cost.
- [Edge-shift measures once on mouseenter, not on resize] → Same trade-off as the reference; a resize mid-hover is vanishingly rare and self-corrects on next hover.

## Open Questions

- None blocking. Card visual styling (cream card on plum) follows the reference; exact tokens (`--color-*`) to be matched to the Satus theme during implementation.

## Revisions (post-implementation review)

User-directed changes after visually reviewing the first implementation:

1. **Color reveal on hover, via a cream chip.** The hovered logo now shows its original brand colors (like sociallama) — but on a cream chip that fades in behind it, because dark marks (Worldline, Medicover, Roche blue, pracuj navy) are illegible directly on plum. The chip echoes the testimonial card above and is absolutely positioned so belt layout never shifts.
2. **Section borders removed.** The belt's `border-block` read as stray white lines once the belt was pinned to the viewport edge.
3. **Theme-matched resting silhouettes.** The fixed chapter background morphs to cream while the belt is still on screen; `html[data-theme='cream']` (set by `Chapters`) flips the silhouette filter from white to ink so logos never sit white-on-cream mid-scroll.
4. **Asset fix (knockout).** Roche, pracuj.pl, and Oryginalny Sok baked their lettering as opaque white pixels on solid fills, so any silhouette filter collapsed them into blobs. Near-white pixels were punched out to transparency (ImageMagick `-fuzz 12% -transparent white`), making them proper knockout marks. (Next dev's `.next/dev/cache/images` persists optimized AVIF/WebP variants across restarts — it must be cleared to see edited source images.)
5. **Shared `<Marquee>` bug fix (pre-existing).** The repeated copies were flex-shrunk to fit the clipped container and painted over each other, and the RAF wrap-modulo used the shrunken width. `flex-shrink: 0` on `.inner` fixes both; behavior fix only, no API change.
