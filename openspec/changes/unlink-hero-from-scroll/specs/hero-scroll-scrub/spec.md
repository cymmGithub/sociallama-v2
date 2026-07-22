## REMOVED Requirements

### Requirement: Pinned hero track
**Reason**: The scroll-driven scrub is retired; without a scrub there is nothing for a pinned runway to drive, and the ~280vh of pinned scroll made the top of the homepage feel heavy.
**Migration**: Chapter 1 renders in normal document flow as a plain 100svh flex column — see `hero-intro-montage` (Chapter 1 in normal document flow).

### Requirement: Scroll-driven video scrub with hold
**Reason**: Replaced by one-shot time-driven playback; the montage plays once on entry instead of following scroll, and the 20% hold phase has no meaning without a runway.
**Migration**: See `hero-intro-montage` (One-shot time-driven montage playback) — the final pose still holds, but indefinitely after playback rather than over a scroll segment.

### Requirement: Smoothed thresholded seeking
**Reason**: Seek smoothing existed to decouple scroll events from video seeks. There are no seeks: playback is a monotonic time clock over canvas frame draws.
**Migration**: None needed — the frame-sequence renderer's redraw-on-change draw loop is retained; only its input changes from scrub target to elapsed time.

### Requirement: Hero-local scrubbed video element
**Reason**: Already obsolete in implementation (the hero renders canvas frames, not a `<video>`); retired formally now that the scrub it described is gone.
**Migration**: The canvas frame-sequence renderer and its poster-first paint are covered by `hero-intro-montage` (Decode-gated start with mount delay).

### Requirement: Reduced-motion fallback
**Reason**: The requirement's substance was "poster + don't trap visitors in a dead runway"; the runway no longer exists for anyone, so only the poster half remains meaningful.
**Migration**: See `hero-intro-montage` (Poster fallbacks unchanged).

### Requirement: Scroll-synced service wardrobe
**Reason**: The outfit↔word synchronization is retired outright (final user decision, 2026-07-22, after two time-based sync prototypes were reviewed and rejected as flaky): the montage plays once at native pace while the words rotate on their own timer — independent cycles feel more natural than any coupling.
**Migration**: See `hero-intro-montage` (Independent timer-based headline rotator) — same word order and stable accessible name, timer-driven; the wardrobe montage plays once independently.
