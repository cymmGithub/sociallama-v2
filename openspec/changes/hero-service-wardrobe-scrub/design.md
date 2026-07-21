## Context

The hero already scroll-scrubs a 60-frame transparent WebP sequence: `HeroTrack` (track.tsx) turns scroll through the ~280vh runway into a `scrubTarget` ref (0→1, clip completing at 80% with a 20% hold), and `frame-sequence.tsx` draws the frame nearest that target. The word rotator (`useRotator`) is separate and time-driven. This change binds the rotator to the same scrub progress and replaces the frames with a single approved take in which the outfit morphs through five word-themed looks during the head-turn. (Note: the `hero-scroll-scrub` spec still describes a `<video>` element; the implementation moved to the frame-sequence canvas — out of scope to reconcile here.)

## Goals / Non-Goals

**Goals:**
- Word and outfit advance together, driven purely by scroll.
- Word flips land on the clip's actual outfit cuts.
- Each outfit visibly themes its word; motion stays a steady neck-only turn with a subtle admiring settle at the end.
- Halo-free matte at a resolution that doesn't soften on the 1370×1080 canvas.

**Non-Goals:**
- Reconciling the spec's stale `<video>` language (separate cleanup).
- Any outfit-change animation on mobile / reduced motion (static first look).
- Literal service props (clapperboard etc.) — vibe via clothing, for a clean matte.

## Decisions

- **One generated take with word-themed outfits, iterated to approval.** Recipe: extract a front-facing identity frame from the prior approved clip → nano-banana redress into the first look (start still) → Seedance 2.0 (std) from that still with a locked-off-camera prompt morphing through the five looks in word order while the neck turns left. Each look pairs its own sunglasses (rainbow wayfarers, slim black rectangles, amber tortoiseshell, dark aviator-style, thin silver frames), swapped in the same morph as the outfit. The per-word slice pipeline (5 stills + motion transfer + 12-frame blocks) stays abandoned: Kling motion transfer fails on the llama's anatomy. Iteration history: zoom drift → "locked-off tripod, pixel-identical framing" wording; rushed turns → per-second pacing markers; flat vs overdone ending → "subtle but complete admiring reaction that fully finishes"; residual body sway → "frozen like a mannequin bolted in place".
- **Words ordered to the take** (KREACJE, WIDEO, CONTENT, SPRZEDAŻ, STRATEGY): informal → formal keeps the morphs subtle and ends on the strongest look (navy suit) for the final word.
- **Scroll-drive the rotator from the existing `scrubTarget`.** The headline reads the scrub ref via `useHeroScrubTarget` and maps progress to a word index in its own rAF loop, `setState` only when the index crosses a boundary (≤4 re-renders per full scrub). `useRotator` is dropped for the hero (kept for other consumers). The accessible name stays a stable full string; only the visual active word changes.
- **Word boundaries from the take's cuts.** The outfit morphs are single-frame cuts, located by consecutive-frame MAE spikes (between frames 15/16, 29/30, 42/43, 48/49 at 10 fps) → `WORD_BOUNDS = [0.246, 0.483, 0.703, 0.805]`. The fifth word (STRATEGY) holds through the profile + admiring settle.
- **2K upscale before matting.** The 720p source softens when the llama is scaled to the 1370×1080 canvas. ByteDance video upscale (aigc preset, ~0.24 credits) to 2560×1440 first; its hallucinated background texture is irrelevant because the background is matted away.
- **Matte with bria-rmbg (RMBG 2.0), locally via rembg.** Side-by-side on plum: u2net leaves a gray halo hugging the fur (the reason the first frame set was rejected); isnet-general-use only marginally better; a diff-matte from Higgsfield's video background remover breaks on dark clothing; bria-rmbg matches Higgsfield's per-image remover (1 credit/frame) at zero cost. Model at `~/.u2net/bria-rmbg.onnx` (~1 GB).
- **Union-bbox composite.** Frames are cropped to the union bounding box across all 60 mattes (not per-frame trim) before the resize + SouthEast anchor into 1370×1080 — per-frame trim made the llama's scale breathe with its own silhouette.
- **Reduced-motion / mobile** rests on frame 0 (word 0, the streetwear look): the poster is already `hero-frames/001.webp`, so this falls out for free.

## Risks / Trade-offs

- **Boundary drift** — the bounds are read from the take's cut frames; if the clip is ever regenerated the bounds must be re-derived.
- **Credit budget** — std takes cost 27 credits; always preflight with `get_cost` before generating.
- **Model size** — bria-rmbg is a ~1 GB local download; regenerating frames on a new machine re-downloads it.

## Migration Plan

Additive: swap the hero's rotator source, reorder the words, replace the frame assets. Rollback is a git revert (old frames + timed rotator). No data/schema involved.

## Open Questions

- Whether to nudge the llama's framing slightly left of the current SouthEast anchor to balance the headline — pending visual review.
