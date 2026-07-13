# hero-scroll-scrub

## Purpose

Define the pinned hero scroll track and the scroll-driven scrubbing of the hero video, including the hold phase, seek smoothing, the hero-local video element, and reduced-motion behavior.

## Requirements

### Requirement: Pinned hero track
The chapter-1 column (hero + client-logos belt) SHALL be pinned as a sticky viewport-height element inside a scroll track several viewports tall (~280vh, tuned during implementation), so both remain visible for the duration of the scrub, and normal page flow resumes after the track.

#### Scenario: Pin during scrub
- **WHEN** the scroll position is inside the hero track
- **THEN** the hero and the client-logos belt remain fixed in the viewport while scroll advances the track progress

#### Scenario: Release after track
- **WHEN** the scroll position passes the end of the track
- **THEN** the pinned column scrolls away normally and chapter 2 enters as before

#### Scenario: Short viewport
- **WHEN** the viewport is shorter than the hero's 620px minimum height
- **THEN** the hero keeps its minimum height, the belt may fall below the fold (as it does pre-change), and scrubbing still tracks the track's progress without layout breakage

### Requirement: Scroll-driven video scrub with hold
Scroll progress through the hero track SHALL drive the hero video's `currentTime`: the clip completes at 80% of the track runway, and the final 20% holds the finished pose so the visitor parks on the clip's last frame.

#### Scenario: Progress maps to clip time
- **WHEN** the track progress is p ≤ 0.8
- **THEN** the video's target time is (p / 0.8) × clip duration, so the clip's midpoint appears at 40% of the runway

#### Scenario: Hold phase
- **WHEN** the track progress is between 0.8 and 1
- **THEN** the video rests on its final frame while the hero remains pinned

#### Scenario: Scrubbing backwards
- **WHEN** the visitor scrolls up inside the track
- **THEN** the clip plays in reverse toward its first frame with the same smoothing, with no stutter or frame artifacts

### Requirement: Smoothed thresholded seeking
The scrub SHALL decouple scroll events from video seeks: scroll updates only a target time, and a requestAnimationFrame loop lerps `currentTime` toward the target, skipping writes when the remaining delta is below 0.02s.

#### Scenario: No perpetual micro-seeks
- **WHEN** the visitor stops scrolling and the video is within 0.02s of its target
- **THEN** no further `currentTime` writes occur, avoiding Chrome's seeking-state compositing artifacts

#### Scenario: Smoothing catches up
- **WHEN** the visitor jumps scroll position rapidly (fast wheel, keyboard, scrollbar drag)
- **THEN** the video converges on the new target over a few frames rather than snapping frame-to-frame

### Requirement: Hero-local scrubbed video element
The hero SHALL render its own muted, inline `<video>` element with `preload="auto"`, no loop attribute, and no play-back — the element is only ever seeked. The shared `@/components/ui/video` primitive SHALL remain unchanged and unused by the hero.

#### Scenario: Video never plays
- **WHEN** the hero is on screen and the visitor does not scroll
- **THEN** the video stays on its current frame; no `play()` is invoked at any point in the component's lifecycle

#### Scenario: Poster-first paint
- **WHEN** the hero renders before video data is available
- **THEN** the poster is visible and composites seamlessly against the `#892f53` background

### Requirement: Reduced-motion fallback
With `prefers-reduced-motion: reduce`, the hero SHALL render the static poster image with no `<video>` element, and the pinned track SHALL NOT trap the visitor in a multi-viewport scroll with no visible change.

#### Scenario: Poster only
- **WHEN** the user agent reports `prefers-reduced-motion: reduce`
- **THEN** the hero shows the poster via the image component, creates no video element, and the track collapses to a single viewport height (no dead scroll runway)
