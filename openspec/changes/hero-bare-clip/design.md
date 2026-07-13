# Design — Hero Bare Clip

## Context

The hero currently renders the scrubbed clip inside a raster retro TV shell (`hero-tv-shell`, archived change `2026-07-13-hero-scroll-scrub`). The user is shelving the TV direction: the presentation reverts to the reference's (`../sociallama/app/(frontend)/components/Hero.tsx` + `Hero.module.css`) bare, right-anchored clip composited directly onto the plum chapter, and the clip is regenerated with neck-only motion and a subtler beat.

What the shell was doing for us — and what its removal costs:

- h264 has no alpha; a bare clip composites invisibly only if its background renders as exactly `#892f53` (the seamless-composite convention, `verify-clip-bg.ts`). The shell's bezel/vignette made drift unreadable; without it the gate is back in force for the hero clip.
- The reference sidesteps this by tuning its page color to the clip's rendered background (`#8f3851` — see `Hero.tsx` comment). We cannot: `#892f53` is the brand token driving the chapter theme morph, and the convention forbids adjusting tokens to clips.
- The current clip (tight 4:3 head-and-chest, 1440×1080) was framed for the TV screen and its background is visibly lighter than the token — it cannot ship bare. **Code revert and clip swap must land together**; generation runs first.

Unaffected: the scroll scrub (`hero-scroll-scrub` capability — track, pin, context ref, `useTempus` seek loop, constants 280vh / HOLD 0.2 / lerp 0.35 / threshold 0.02). Its requirements never referenced the shell.

## Goals / Non-Goals

**Goals:**

- Reference-faithful bare presentation: video right-anchored in the pinned hero, headline overflowing onto the clip's empty plum left half (the original invisible-seam layout intent).
- New clip: wide composition, motion carried by the neck alone (body/shoulders static), subtle impressed beat — attentive ears + slightly parted mouth at most.
- Seam handled by a deterministic post-tint to the token, gated by `verify-clip-bg.ts`.
- 4s final duration (trim from the 5s generation).

**Non-Goals:**

- Any change to the scrub mechanics or constants.
- Mobile clip changes (still the looping upward-glance clip, unchanged presentation).
- Reduced-motion changes (poster-only; the poster simply renders bare now).
- Preserving the TV shell behind a flag — it's removed; the archive keeps the assets for revival.

## Decisions

### 1. Sequencing: clip first, revert second

The bare layout cannot ship against the current clip (background mismatch would be a full-height seam). Generate → post-process → gate the new clip first; the presentation revert lands in the same working tree and is verified against the final clip.

### 2. Generation: wide composition, neck-only arc, subtle beat

- **Framing:** wide reference composition — llama head-and-neck right-of-center, generous flat plum field on the left where the headline overflows, torso entering from the bottom edge. Match the reference clip's effective geometry (1370×1080 ≈ 1.27:1 after crop); generate at the nearest supported ratio and crop in post.
- **Motion:** ONLY the neck and head rotate slowly screen-left across ~70% of the take; shoulders and torso stay planted (prompt this explicitly — the current take's whole-body drift is the complaint). Eyeline exits frame-left toward the headline.
- **Beat (subtle):** final ~30%: ears perk to attentive, mouth parts slightly. Explicitly exclude: mouth-drop, head pull-back, eyebrow theatrics. Glasses stay on.
- **Source:** identity reference (same llama media id as the previous run) + prompt; `models_explore action:'recommend'` first (previous: seedance_2_0, 45 credits/take at 5s/1080p). Budget 2–4 takes against ~344 credits.

### 3. Trim to 4s at review

Generate 5s, ship 4s (user decision). Which second to drop is a review-time call with one constraint: **the final frame of the trimmed clip must be the subtle-impressed pose** — the hold phase parks on it. Expected: trim tail slack if the beat lands early, or head dead-time if the turn starts slow. 4s × 24fps = 96 all-intra frames over the 80%-of-280vh scrub — granularity fine.

### 4. Seam: global per-channel tint to the token, then gate

Measure the winning take's flat background (corner sampling, same method as `verify-clip-bg.ts`), compute the per-channel mapping to `#892f53`, apply as a global ffmpeg color pass (`curves`/`colorlevels`) before the all-intra encode. Global grade, not chroma-key: fur edges are unkeyable, and a few-RGB-point global shift is imperceptible on the llama but decisive at the seam.

**Escape hatch:** if the required shift exceeds ~10 per channel, the take's background missed the prompt — regenerate rather than grade harder (a large grade visibly tints the white fur).

Gate: `verify-clip-bg.ts <clip> '#892f53'` must pass on the final encode (tolerance ±3/channel or ΔE<3 absorbs YUV rounding). The hero exemption note added to the script's docstring is removed.

### 5. Presentation: port the reference's absolute right-anchored video

Reference geometry: video `position: absolute; bottom: 0; right: 0; height: <hero height minus the header band>; width: auto`. Port this into the hero section (the video escapes the `.inner` flex flow; the `.media` flex column remains only for the mobile branch). Details tuned at implementation:

- Top edge respects the hero's header padding so the llama's ears never sit under the fixed header controls.
- Bottom edge sits on the hero/belt boundary.
- `.copy` keeps `z-index: 1` — the nowrap headline overflows onto the clip's empty plum left half, which is once again the *invisible-seam* overlap (update the CSS comment written for the TV era).
- Poster `Image` (SSR/pre-mount/reduced-motion) renders in the same absolute box — all states bare, no layout shift when the video mounts.
- Socials stay in the left copy column (v2 never had the reference's right-rail problem).

### 6. Removal is clean, revival is archived

Delete `tv-shell.webp`, shell JSX (`role="img"` wrapper, `.tvScreen`, `.tvGlass`) and shell CSS (`.tvShell*`, `.tvScreen`, `.tvMedia`, `.tvGlass`, `.mobileVideo` scoping stays). The archived change retains the generation brief, measurement script, and source PNG.

## Implementation outcome notes (2026-07-13)

- **Decision 2 outcome:** the neck-only take (job `69914070`) passed every checklist item — framing, motion isolation, subtle beat, flat background (+8/+3/+3 from token) — and was rejected by the user on feel. Final clip: the 2026-07-12 take (job `0f18d4c8`), tail-trimmed at t=4.0s (3.5s was tried, judged over-trimmed). Lesson recorded in the acceptance-loop requirement: checklist pass ≠ acceptance.
- **Decision 4 outcome (color, hard-won):** the ffmpeg gate and the browser disagree on the YUV→RGB matrix. Untagged 601-matrix encode rendered −2/−3 off; converting+tagging BT.709 rendered −11/−14 off (this Chromium decodes 601 regardless); final: 601-encode tagged smpte170m + empirical +2/+2/+3 bump on top of the base grade (net lutrgb +10/+5/+6) → browser-rendered match exact at sample points. Residual: the clip's own background has ±4–5 spatial variance (generation lighting falloff), so a faint edge can be perceived at some widths — same class of imperfection the reference shipped with. Browser-rendered verification is now a spec scenario.
- **Decision 5 outcome:** user adjusted placement after seeing it: top inset `calc(var(--safe) * 3.5 + 53px)` (smaller than hero scale), `right: calc(var(--safe) * -2)` (bleeds the clip's empty right margin off-screen; only plum bleeds at ≥1280px).

## Risks / Trade-offs

- [Neck-only motion reads stiff or uncanny] → It's also the ask; judge at rendered hero size in the acceptance review, budget 2–4 takes. If every take is stiff, allow minimal shoulder sway in a later take's prompt (user call).
- [Subtle beat doesn't read at a glance] → Subtlety is the point; acceptance criterion is "readable when parked on the final frame during the hold", not "theatrical mid-scroll".
- [Generated background not flat enough to tint (gradient/noise)] → Prompt "flat, uniform, solid" background; corner-sampling verify catches non-uniformity; regenerate if corners disagree with each other by more than the gate tolerance.
- [Global tint shifts the llama] → Bounded by the ~10/channel escape hatch (Decision 4).
- [Poster/first-frame seam under the headline] → Poster comes from frame 0 of the *tinted* encode, so it inherits the gate's guarantee.
- [YUV re-encode drifts the tint] → Verify runs on the final encode, not the intermediate; ±3 tolerance absorbs 420 rounding.
- [Credits run dry] → Hard ceiling ~7 takes; budget 2–4; each take reviewed against the checklist before another is spent.
