# Design — refine-services-clip-playback

## Context

The kreacje phone rail (`StageMedia`, `app/(frontend)/(home)/sections/services/index.tsx`)
maps three clips to `Video` primitives with `autoPlay={active}` — all three play
whenever the tab is active (desktop) or the stack item is in view (mobile).

Facts that constrain the design:

- The `Video` primitive (`components/ui/video/index.tsx`) has no pause concept:
  `autoPlay={false}` routes to the reduced-motion path, which unmounts the
  `<video>` and renders the poster `Image`. Flipping it mid-play snaps from
  live motion to the poster frame — a jump cut. Playback position is lost.
- With `preload="none"`, a mounted-but-never-played `<video>` shows its
  `poster` attribute and downloads nothing. Play-on-tap therefore also defers
  the network cost of the two side clips (~4.9 MB) until requested.
- Rotation never stops today. `autoplay` is `isDesktop && !reducedMotion`;
  `select()` (tab click) only calls `setActive` + `setCycle`. Off-screen
  visibility pauses the dwell bar via `data-paused`, but nothing disables the
  loop permanently.
- `.phoneFrame:nth-child(n)` CSS drives the alternating tilts, so the frames
  must remain the direct children of `.phone` in the same order.
- The repo's global reset is `all: unset`-based and a global `*:focus-visible`
  ring exists (drawn ~2px outside the element). `.phoneFrame` has
  `overflow: hidden`, which would clip an outside ring.

## Goals / Non-Goals

**Goals:**

- One playing clip at a time; middle (DPD) by default.
- Deselected clips freeze in place and resume on re-selection.
- Dimmed, play-badged neighbours that read as deliberately paused, not broken.
- First clip tap permanently disables tab auto-rotation for the page view.
- Identical model on the mobile stack.

**Non-Goals:**

- No change to tab-column click behavior (still restarts dwell and keeps
  rotating) — clip engagement is deliberately a deeper interaction tier.
- No pause/unpause toggle on the playing card itself (tap on it is a no-op;
  no button is rendered there).
- No audio, no scrubbing, no fullscreen — these stay decorative loops.
- No behavior change for other `Video` call sites (hero looks, CTA, covers).

## Decisions

### 1. Controlled `playing` prop on the `Video` primitive (vs. poster-snap or a new component)

Add optional `playing?: boolean`. Undefined preserves today's contract
(play whenever in viewport). When set, playback requires
`playing !== false && inViewport`; `false` calls `video.pause()` on the
mounted element — freeze-frame, position kept, resumable. Implementation:
lift the observer's `isIntersecting` into state and move play/pause into an
effect over `(inViewport, playing)`. `autoPlay` keeps its existing meaning
(mount the `<video>` at all) and still tears the rail down when the tab
deactivates; position loss on tab-away is acceptable because rotation has
stopped by the time anyone has tapped a clip.

Rejected: poster-snap via `autoPlay` alone (jump cut, loses position, zero
primitive change was its only virtue); a separate controlled component
(duplicates the reduced-motion/viewport logic).

### 2. `ClipRail` child component owns the playing index

Extract the video branch of `StageMedia` into `ClipRail` holding
`useState(Math.floor(clips.length / 2))` — hooks stay unconditional (the
panels branch never mounts it), and "middle by default" is derived, not
hardcoded to index 1.

### 3. Overlay button only on non-playing cards (vs. making frames buttons)

Frames stay `<div>`s (preserving the `nth-child` tilt contract); each
non-playing card gets an absolutely positioned full-card `<button>` with
`aria-label` `` `${playLabel}: ${clip.alt}` `` and a centered lucide `Play`
badge. The playing card renders no button — nothing actionable, nothing
focusable. Focus ring: rely on the global `*:focus-visible` ring but pull it
inward (negative `outline-offset`) so `overflow: hidden` cannot clip it.

### 4. Dimming via `filter` on the Video wrapper, transitioned

A `.phoneDimmed` class on the frame dims the media
(`brightness`/`saturate` filter with a ~400ms transition) so swaps read as a
focus shift, not a content change. The badge sits on a translucent scrim
circle (`color-mix` ink/cream tokens, backdrop blur) sized with `clamp()`.

### 5. Engagement kills rotation via section-level state

`Services` gains `const [engaged, setEngaged] = useState(false)`;
`autoplay` becomes `isDesktop === true && !reducedMotion && !engaged`.
`onEngage` threads through `StageMedia` → `ClipRail` and fires on every play
button click. Permanent for the page view: a resume timer would steal the
video back from someone still watching. The existing non-live dwell bar
rendering already handles the `autoplay === false` state; on mobile the
callback is harmless (no loop exists).

### 6. Reduced motion: today's rail, untouched

`ClipRail` reads `usePreferredReducedMotion()`; when reduced, it renders no
buttons and no dimming — three plain posters, exactly as now. Rationale:
`Video` cannot play under reduced motion (no `<video>` exists), so a play
button would be a lie. WCAG would permit explicit user-initiated playback,
but wiring an override through the primitive is scope this change doesn't
need.

## Risks / Trade-offs

- [Two dimmed cards read as less "alive" than today's triple-play wall] →
  accepted in brainstorm; the play badge + dim transition mark them as
  deliberately paused, and the single live clip reads as focus.
- [SSR/first paint: `usePreferredReducedMotion` and `Video`'s `reduced`
  state both start conservative, so badges may appear a beat after
  hydration] → same class of settle-in the section already has (progress
  bars, stagger); no layout shift because badges are overlays.
- [`Video`'s observer refactor touches every call site's play/pause path] →
  keep the `playing === undefined` behavior bit-identical; verify hero/CTA
  clips still play-pause on scroll during review.
- [Frozen frame on a side card survives only while the `<video>` stays
  mounted] → fine: before any tap, sides show posters; after a tap rotation
  is dead, so the rail only unmounts if the user manually clicks another tab
  — poster fallback there is acceptable.

## Migration Plan

Pure frontend change, no data or route impact; ships as one commit. Rollback
is a revert.

## Open Questions

None — visual tuning of the dim strength and badge size happens against the
live rail during implementation.
