# Design — Hero Scroll Scrub

## Context

Today the hero renders the llama clip through `@/components/ui/video` (autoplay, loop, `preload="none"`, IntersectionObserver play/pause). The clip (`public/clips/hero.mp4`) is 3s / 24fps / 72 frames, h264, already all-intra encoded (verified: 72/72 I-frames) — inherited byte-identical from the reference project, whose `Hero.tsx` implements the scrub we are porting.

Satus-specific infrastructure the reference lacks:

- Lenis smooth scroll + `LenisScrollTriggerSync` (`components/layout/lenis/`).
- hamo `useScrollTrigger` — already used for the pinned `how-it-works` section (`start: 'top top'`, `end: 'bottom bottom'`, `onProgress`).
- Chapter theme morphing (`app/(home)/chapters.tsx`): IntersectionObserver with a center-viewport band drives a fixed background layer; the hero composites onto `#892f53`.
- Chapter-1 wrapper in `page.tsx`: `<div className="flex min-h-svh flex-col"><Hero /><ClientLogos /></div>` — hero flexes, belt pins to the bottom edge, column may exceed `100svh` on short viewports (hero has a 620px `min-height` floor).

## Goals / Non-Goals

**Goals:**

- Scroll-driven scrub of the hero clip while hero + belt stay pinned, matching the reference feel.
- Instant, artifact-free seeking (all-intra source, thresholded lerp writes).
- The hero video framed inside a retro TV (landscape ~4:3 screen), retiring the seamless-composite constraint for the hero clip — a visible seam already exists in the shipped clip, and every regenerated take re-rolls that dice.
- A new desktop clip framed head-and-chest to fill the TV screen, whose final ~25% sells "impressed" (ears straight, mouth open, head pull-back, eyebrows raised above the sunglasses; glasses stay on), eyeline clearly out of the screen toward the headline.
- Unchanged reduced-motion experience (static poster, now inside the TV shell).

**Non-Goals:**

- Mobile clip regeneration (known follow-up; mobile keeps the looping upward-glance clip).
- Changes to the shared `Video` primitive or its spec'd behavior.
- Scrubbing the mobile clip (mobile keeps autoplay-loop semantics this change).

## Decisions

### 1. Pin the existing chapter-1 wrapper; add a track around it

The chapter-1 div in `page.tsx` already groups hero + belt into one `min-h-svh` column. Wrap it in a track element (initial runway: **280vh**, tune during implementation) and make the column `sticky top-0 h-svh`. The belt pins for free — no section restructuring, and `Chapters` still sees one chapter-1 child.

*Alternative considered:* pinning only the hero and letting the belt scroll independently — rejected in explore mode; reference-faithful behavior keeps the belt visible throughout the scrub.

### 2. Drive progress with hamo `useScrollTrigger`, not a raw scroll listener

The reference attaches a `window` scroll listener and measures `getBoundingClientRect` per event. Satus's house pattern (`how-it-works`) is `useScrollTrigger` on the track with `onProgress`. Same math, already Lenis-synced, consistent with the codebase.

### 3. Decouple progress from seeking: rAF lerp with a seek threshold

`onProgress` only stores a target: `target = min(1, progress / (1 - HOLD))` with `HOLD = 0.2`. A separate rAF loop moves `currentTime` toward `target * (duration - 0.05)` by a lerp factor, skipping writes when the delta is under **0.02s** — perpetual micro-seeks keep Chrome in a seeking state that composites frames wrong (documented in the reference).

Lerp factor: the reference uses `0.22` against raw scroll. Lenis already smooths scroll, so stacking the same factor may read as lag. Start at `0.35` and tune by feel; keep the threshold as-is.

*Alternative considered:* setting `currentTime` directly in `onProgress` — rejected: unsmoothed seeks stutter and the micro-seek bug returns.

### 4. Hero-local `<video>`, not a scrub mode on the shared primitive

The scrubbed element needs `preload="auto"`, no loop, no `play()` call ever, and no visibility observer. That shares almost nothing with `@/components/ui/video`'s contract (lazy, looping, autoplaying), so the hero renders its own `<video>` (muted, `playsInline`, `aria-hidden` with the accessible label staying on the section as today). Reduced motion renders the poster `Image` exactly as the primitive does now — that branch is small enough to duplicate locally.

### 5. Short viewports: cap the sticky, keep today's overflow behavior

The sticky element is `h-svh`. On viewports shorter than the hero's 620px floor, the column exceeds the viewport; a sticky taller than the viewport pins late/releases early. Accept this: the hero keeps its floor, the belt drops below the fold during the scrub (same as it drops below the fold today), and the scrub still tracks the track's progress. No special-case code — but verify visually at ~600px-tall viewports.

### 6. Headline stagger stays mount-based

The stagger currently runs on mount via GSAP; the `homepage` spec ties it narratively to the video's "first loop", which no longer exists. Keep the mount-based tween unchanged; only the spec wording changes.

### 7. Retro TV shell frames the video (composition study 2026-07-12)

Root cause the shell solves: h264 has no alpha channel, so compositing video onto the page requires exact color match — a gate (`verify-clip-bg.ts`) that the shipped clip already visibly fails and that every regenerated take re-rolls. Framing the video in a TV makes the screen's contents legitimately "other" — no seam to hide.

A CSS stand-in study compared portrait (0.92, current crop) vs landscape (1.27/4:3) screens. Decision: **landscape 4:3** (most convincing TV silhouette), paired with a re-framed clip (Decision 8) to fix the scale loss the old wide framing caused. Required retro identifiers (established through the CSS iterations, then locked): rabbit-ear antenna with ball tips, walnut cabinet, screen-left / control-column-right layout (dials + vertical speaker grille), CRT glass curve. No legs — the cabinet floats.

Implementation: **generated raster shell** (user decision after comparing both live). Seedream 4.5 product-shot generation from the identifier brief (~1 credit/candidate), `remove_background` for the alpha cutout, screen rect measured from the asset's pixels by flood-filling the glass region (winning candidate: ~1.37 screen aspect — matches the 4:3 clip target). The video is absolutely positioned over the measured rect, inset ~1% so its edges tuck under the dark bezel rim, with a border-radius approximating the glass corner curve. The CSS glass overlay (diagonal glare + scanlines + heavy edge vignette) stays layered above the video: it sells CRT and makes residual background-tone drift in the clip unreadable. The CSS-built shell from the study remains in history as a fallback, but raster won decisively on material depth (wood grain, metal, dial texture).

Asset coupling to accept: the screen-rect percentages belong to this specific image — swapping the asset means re-running the measurement script; palette/layout changes mean regenerating. The raw cutout (PNG, ~4MB at 1757×1652) must be optimized before ship (WebP/AVIF with alpha, sized for its rendered width).

Layout deltas: media column widened (40%/560px → 46%/680px) so the landscape TV keeps the llama's presence; the shell gets breathing room from the viewport edge (`margin-inline-end`) — a complete object can't bleed off-screen the way the seamless-composite clip did. Open styling question: the nowrap headline ("THAT WORKS") now grazes the TV glass — cap the headline clamp or embrace the layered overlap; decide during implementation.

### 8. New clip: head-and-chest 4:3 framing, image-to-video, fixed post-pipeline

- **Source frame:** crop frame 0 of the current `hero.mp4` to a head-and-chest 4:3 composition (upscale if the crop drops below generation-input resolution). First-frame continuity with the old poster is no longer a goal — the hero's pre-scroll look changes deliberately with the TV.
- **Generation:** Higgsfield MCP image-to-video (`models_explore action:'recommend'` first; the original clip came from Seedance). Prompt the motion arc: slow head turn screen-left for ~75% of the clip, eyeline clearly exiting the frame toward the headline, then the impressed beat — ears snap straight/perked, mouth drops open, slight head pull-back, eyebrows rise above the sunglass frames. Glasses stay on; eyes stay hidden. Background: stable, non-distracting (plum-family preferred, exact match NOT required).
- **Timing budget:** generate 5s, expect to trim. The scrub maps clip time linearly onto 80% of a 280vh runway, so "last 25% of frames" ≈ the last ~56vh of scrolling — enough for the beat to land during the HOLD approach.
- **Post-pipeline (ffmpeg):** trim → crop/scale to 4:3 matching the TV screen (e.g. 1440×1080) → all-intra h264 (`-g 1`), 24fps, ≤ ~5MB → extract poster jpg from frame 0. No background gate — the TV vignette absorbs drift.
- **Acceptance before spending more credits:** review each take against the emotion checklist (ears/mouth/eyebrows/pull-back visible in final 25%; eyeline exits screen-left; no glasses removal; framing fills the 4:3 screen). Budget 2–4 takes.

### 9. Sequencing: clip generated ahead of the scrub (revised 2026-07-12)

The original plan gated clip generation on the scrub's constants. That gate dissolved on inspection: the scrub maps clip time onto the runway *proportionally* (fixed 80% scrub / 20% hold), so runway length and lerp factor affect feel, not which pose parks during the hold — and the screen aspect was settled by the raster shell (measured 1.37 ≈ 4:3). The impressed clip was therefore generated first (user-directed) and already ships as the autoplay-loop interim hero inside the TV. Groups 1–2 (track + scrub) build against the final clip; the only clip-related verification deferred to them is the hold-phase check (task 4.7).

## Risks / Trade-offs

- [Expression doesn't read through sunglasses] → Emotion carried by ears + mouth + posture + eyebrows; acceptance checklist per take; budget capped at ~4 takes before revisiting the approach (e.g. head-tilt variant).
- [Shell asset is frozen — palette or layout change breaks it] → Regeneration is ~2 credits + re-measure; the measurement script and generation brief are recorded, so a re-roll is mechanical.
- [Video corners peek past the glass curve at some sizes] → Screen rect is inset under the bezel rim and the border-radius is tunable; verify at 1280–1680px widths alongside the headline-overlap check.
- [Headline overlap with the TV glass reads as a bug] → Decide during implementation: cap the headline clamp max, or make the layering deliberate (text above glass, consistent z-order); check at 1280–1680px widths.
- [Lenis + lerp double-smoothing feels laggy] → Lerp factor is a single tunable constant; verify by feel at 0.35 and adjust.
- [72-frame granularity looks steppy over ~224vh of runway] → Existing clip is the fallback baseline; the new 5s gen yields ~120 frames after trim, improving granularity. If still steppy, shorten the runway.
- [Sticky column taller than viewport on short screens] → Accepted (Decision 5); manual check at ~600px height.
- [Chapter theme morph misfires with a taller chapter 1] → Center-band observer logic is height-agnostic, but verify the plum→cream transition still lands at the belt→why-that-works boundary.
- [Mobile emotional arc diverges from desktop] → Accepted for this change; tracked as a follow-up (regenerate mobile clip with an impressed upward glance).
- [`preload="auto"` downloads ~3.3MB eagerly on desktop] → Acceptable for the primary hero asset; poster still paints first. Keep the new clip ≤ ~5MB after encode.

## Open Questions

- Exact runway length (280vh initial) and lerp factor (0.35 initial) — settle by feel during implementation; they gate the generation prompt's timing language.
- Headline-over-TV overlap treatment (cap vs deliberate layering) — see Risks.
- Whether the winning take needs an upscale pass (`upscale_video`) before the all-intra encode — decide after seeing native generation quality at the hero's rendered size.
- Mobile presentation of the TV shell (the mobile clip keeps its old framing this change) — likely the shell is desktop-only and mobile keeps the bare clip until the mobile follow-up; confirm during implementation.
