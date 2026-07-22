## Why

The hero's scroll-driven scrub (280vh pinned runway driving the llama frame sequence and the headline word rotator in lockstep) makes the top of the homepage feel heavy: ~1.8 extra viewports of pinned scroll before chapter 2, and the animation only moves when the visitor scrolls. The user wants the hero self-contained again — the llama montage fires once like a video, the words rotate on their own clock like before, and the page scrolls normally.

## What Changes

- **BREAKING** Remove the hero scroll track: the 280vh runway, the sticky pin, and the scrub-target context (`HeroTrack` / `useHeroScrubTarget`) are deleted. Chapter 1 (hero + client-logos belt) returns to normal document flow, so chapter 2 arrives ~2 viewports sooner.
- The llama frame sequence (60-frame canvas renderer) becomes a one-shot time-driven montage: plays once at natural speed (2.5s, 24fps, one smooth continuous motion) shortly after mount, then holds the final frame. No loop, no replay on scroll re-entry.
- The headline word rotator returns to the shared timer-based `useRotator` hook (2600ms interval, in-view gated, reduced-motion aware) — same mechanism as JoinCta. The two run fully independent cycles: the outfit↔word coupling was prototyped twice (word-tick bursts with holds; montage-driven flips at the outfit cuts) and rejected by the user both times as flaky/unnatural — final decision 2026-07-22.
- Mobile and reduced-motion behavior unchanged: static poster, no frames payload, no dead runway (the runway no longer exists for anyone).
- Visual verification of the plum→cream chapter transition, which was previously tuned around the sticky pin holding the hero on screen past the chapter flip.

## Capabilities

### New Capabilities

- `hero-intro-montage`: One-shot time-driven playback of the hero llama frame sequence (play once on entry, hold final pose) and the hero headline's independent timer-based word rotator, with poster fallbacks for mobile/reduced motion.

### Modified Capabilities

- `hero-scroll-scrub`: Retired. All requirements are removed — pinned track, scroll-driven scrub with hold, smoothed seeking, hero-local scrubbed video element, reduced-motion runway collapse, and scroll-synced service wardrobe. Replaced by `hero-intro-montage`.

## Impact

- **Deleted**: `app/(frontend)/(home)/sections/hero/track.tsx` (HeroTrack + scrub context); the `.track`/`.sticky` CSS and runway-collapse media queries in `hero.module.css`.
- **Modified**: `app/(frontend)/(home)/sections/hero/frame-sequence.tsx` (scrub ref → elapsed-time clock), `app/(frontend)/(home)/sections/hero/index.tsx` (WORD_BOUNDS + rAF watcher → `useRotator`), `app/(frontend)/(home)/page.tsx` (unwrap HeroTrack).
- **Unchanged**: `lib/hooks/use-rotator.ts` (reused as-is), the 60 WebP frames in `public/clips/hero-frames/`, mobile poster pipeline, `hero-impressed-clip` spec (governs clip generation, not playback).
- **Page behavior**: homepage total scroll length shrinks by ~1.8 viewports; the "park on the impressed stare" hold beat disappears; chapter-background morph timing relative to the hero changes (needs visual pass).
