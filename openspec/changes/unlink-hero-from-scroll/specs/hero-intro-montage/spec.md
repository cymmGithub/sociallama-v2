## ADDED Requirements

### Requirement: One-shot time-driven montage playback
The desktop hero SHALL play its 60-frame llama sequence (canvas frame-sequence renderer) as a one-shot montage on a time clock at the source's natural speed (2.5s, 24fps, one continuous motion): frame index derives from elapsed time since the clock started — not from scroll position and not from the headline rotator. After the last frame draws, the hero SHALL hold that frame indefinitely — no loop, no ping-pong, no replay on scroll or viewport re-entry within the same mount.

#### Scenario: Montage plays without scrolling
- **WHEN** the desktop hero mounts and the visitor does not scroll
- **THEN** the llama montage plays through once (~2.5s) as a single smooth motion and settles on the final pose

#### Scenario: Final frame holds
- **WHEN** the montage has completed
- **THEN** the canvas continues to show the last frame, and no further frame changes occur for the lifetime of the mount

#### Scenario: Scroll has no effect on playback
- **WHEN** the visitor scrolls in any direction, before, during, or after the montage
- **THEN** the playback position is unaffected — frames advance only with elapsed time

### Requirement: Decode-gated start with mount delay
The montage clock SHALL NOT start until every frame image has decoded AND at least 0.3s has elapsed since mount (so the montage lands alongside the headline stagger). While waiting, the hero SHALL show the first frame as soon as it decodes — the media area is never blank.

#### Scenario: Slow network delays start, not smoothness
- **WHEN** frames are still downloading or decoding at mount + 0.3s
- **THEN** the hero holds frame 1 and the montage starts only once all frames are ready, playing through without dropped or skipped frames

#### Scenario: First frame paints early
- **WHEN** frame 1 finishes decoding before the rest of the sequence
- **THEN** it is drawn immediately, matching the SSR poster's appearance

### Requirement: Independent timer-based headline rotator
The hero headline's word rotator SHALL advance on the shared timer mechanism (`useRotator`: 2600ms interval), cycling KREACJE → WIDEO → TREŚCI → SPRZEDAŻ → STRATEGIA and wrapping indefinitely, with NO synchronization to the llama montage in either direction (final user decision 2026-07-22 — sync prototypes were reviewed and rejected). The interval SHALL run only while the headline is in the viewport and SHALL NOT run under `prefers-reduced-motion: reduce` (the first word stays put). The accessible name of the headline SHALL remain a single stable string regardless of the active word.

#### Scenario: Words cycle on their own clock
- **WHEN** the hero is on screen and the visitor does nothing
- **THEN** the active word advances every 2600ms and keeps cycling after the montage has long finished, regardless of which outfit is visible

#### Scenario: Off-screen pause
- **WHEN** the headline leaves the viewport
- **THEN** the rotation interval stops, and resumes when it re-enters

#### Scenario: Reduced motion
- **WHEN** the user agent reports `prefers-reduced-motion: reduce`
- **THEN** the first word (KREACJE) is shown statically and no rotation occurs

#### Scenario: Stable accessible name
- **WHEN** assistive technology reads the hero headline at any moment
- **THEN** it announces one stable headline string, not the currently visible word

### Requirement: Chapter 1 in normal document flow
The chapter-1 column (hero + client-logos belt) SHALL render in normal document flow as a single flex column filling at least one viewport height (100svh), with no scroll runway beyond its own content and no sticky pinning, for all visitors regardless of device or motion preference. On short viewports the hero SHALL keep its 620px minimum height and the belt MAY fall below the fold.

#### Scenario: No dead scroll
- **WHEN** the visitor scrolls down from the top of the homepage
- **THEN** the page moves continuously past the hero and belt into chapter 2 — at no point does scrolling advance without visible page movement

#### Scenario: First viewport composition
- **WHEN** the homepage loads at desktop size
- **THEN** the hero and the client-logos belt together compose the first viewport, as before the runway removal

### Requirement: Poster fallbacks unchanged
Mobile viewports, touch-only devices above the desktop breakpoint, and reduced-motion visitors SHALL receive the existing static poster (no canvas, no frame downloads, no montage). The SSR/pre-mount render SHALL remain the first-frame poster so hydration does not flash.

#### Scenario: Mobile stays static
- **WHEN** the hero renders on a mobile viewport or a touch-only device
- **THEN** the static poster is shown, the 60-frame sequence is not fetched, and no montage plays

#### Scenario: Reduced motion stays static
- **WHEN** the user agent reports `prefers-reduced-motion: reduce`
- **THEN** the poster renders with no canvas element and no playback
