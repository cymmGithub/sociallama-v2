## Context

The hero already scroll-scrubs a 60-frame transparent WebP sequence: `HeroTrack` (track.tsx) turns scroll through the ~280vh runway into a `scrubTarget` ref (0→1, clip completing at 80% with a 20% hold), and `frame-sequence.tsx` draws the frame nearest that target. The word rotator (`useRotator`) is separate and time-driven. This change binds the rotator to the same scrub progress and re-authors the frames so each fifth of the runway is a different service-themed outfit. (Note: the `hero-scroll-scrub` spec still describes a `<video>` element; the implementation moved to the frame-sequence canvas — out of scope to reconcile here.)

## Goals / Non-Goals

**Goals:**
- Word and outfit advance together, driven purely by scroll.
- Frame-perfect alignment: each word owns an exact 12-frame block.
- Preserve the approved motion (front → neck-only left turn → subtle approving nod) and the clean matte.

**Non-Goals:**
- Reconciling the spec's stale `<video>` language (separate cleanup).
- Any outfit-change animation on mobile / reduced motion (static first look).
- Literal service props (clapperboard etc.) — vibe via clothing, for a clean rembg matte.

## Decisions

- **Scroll-drive the rotator from the existing `scrubTarget`.** The scrub ref is already in context (`ScrubTargetContext`); the headline reads it and computes `wordIndex = clamp(floor(scrubProgress × 5), 0, 4)`, updated in the same rAF loop that draws frames so word and frame never disagree. `useRotator` is dropped for the hero (kept for other consumers). The accessible name stays a stable full string; only the visual active word changes.
- **Deterministic slice pipeline for frame-perfect blocks.** A single AI generation can't time outfit changes to exact frames. Instead: (1) generate **5 themed-outfit stills** (same llama, same front pose, flat mid-gray bg); (2) `motion_control` transfers the **approved test-7 neck-turn + nod** onto each still → 5 clips with identical motion, different outfit; (3) slice **exactly 12 frames** from each in order (STRATEGY 0–12, CONTENT 12–24, SPRZEDAŻ 24–36, KREACJE 36–48, WIDEO 48–60) — because all clips share the motion, the neck is continuous at every seam and only the outfit cuts; (4) `rembg` each frame → transparent; export `001–060.webp` @1370×1080 + regenerate `hero.mp4`/posters.
- **Mid-gray matte background** (from the clip work): flat, even, high-contrast to the white llama — avoids white-on-white bleed and green spill.
- **Reduced-motion / mobile** rests on frame 0 (word 0 + STRATEGY outfit): the poster is already `hero-frames/001.webp`, so this falls out for free.

## Risks / Trade-offs

- **Boundary flicker** — if a wardrobe cut lands mid-visible-word-transition it can read as a jump. Mitigation: align the word-transition easing to the block boundary; keep cuts crisp (they hide inside the head-turn).
- **Asset gating** — the whole feature is moot without 5 clean themed clips; treat generation as a prerequisite spike, not a task to force.
- **Frame count** — 5×12=60 fits the current runway. Extending to ~90 (18/block) for more breathing room is a one-line `FRAME_COUNT` change if desired.

## Migration Plan

Additive: swap the hero's rotator source and replace the frame assets. Rollback is a git revert (old frames + timed rotator). No data/schema involved.

## Open Questions

- 60 frames (12/block) vs ~90 (18/block) for the final runway — decide when the clips are approved.
- Whether to annotate each rotator word in `home.ts` with its outfit theme (documentation only) or keep the mapping implicit by block order.
