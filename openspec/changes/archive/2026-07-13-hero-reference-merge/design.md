# Design — hero-reference-merge

## Context

Two builds of the same hero exist. The reference (`../sociallama`) ships the 2026-07-08 clip take at full hero height (bottom-anchored right, llama at hero scale) and a client-logos belt on a sand band with a "ZAUFALI NAM" heading and colored logos. v2 (this repo) ships the 2026-07-12 take top-inset and reduced, and a belt of white-silhouette logos directly on the plum chapter with a spotlight color-reveal (`hero-client-logos-hover`). The user wants the reference's clip and belt visuals inside v2's structure (header, rotator headline, socials-under-headline, scroll scrub).

Two hard constraints carry over from `hero-bare-clip` (completed 2026-07-13):

- **Seamless composite**: hero clips are graded so their flat background renders as exactly `#892f53` and are gated by `verify-clip-bg.ts` plus a browser-rendered pixel check. The reference clip predates this — its background (~`#8f3851`) was hidden with feather gradients, which v2 explicitly abandoned.
- **Scrub encoding**: all-intra h264, 24fps, explicit colorspace tags (601-encode tagged `smpte170m` — this Chromium decodes 601 regardless of tag; see hero-bare-clip design, Decision 4 outcome).

## Goals / Non-Goals

**Goals:**

- Reference take (3s, 1370×1080) as the desktop hero clip, passing the existing gate.
- Reference presentation: llama at hero scale, bottom-anchored right, full hero height minus header clearance.
- Belt visuals: sand band, centered "ZAUFALI NAM" heading, brand-color logos at rest, edge fades.
- Preserve v2 hover interaction (pause, testimonial cards, keep-on-screen, dim-others) and all scrub machinery untouched.

**Non-Goals:**

- No new clip generation (zero Higgsfield credits).
- No changes to mobile hero/belt behavior, header, headline, socials, `BigMarquee`, or anything outside chapter 1.
- No revival of the feather-gradient seam approach.

## Decisions

### 1. Re-tint the reference take through the existing pipeline (not feather gradients)

User decision (2026-07-13 exploration). Measure the take's flat background by corner sampling, compute the per-channel map to `#892f53`, apply as a global ffmpeg color pass, re-encode all-intra with the smpte170m tagging recipe, poster from frame 0 of the tinted encode, then gate (`verify-clip-bg.ts` + browser screenshot sampling, empirical bump if the browser disagrees — exactly the hero-bare-clip Decision 4 procedure). Expected shift from ~`#8f3851` is ≈ (−6, −9, +2) — inside the ~10/channel escape hatch, so no regeneration risk. The source file is `../sociallama/public/clips/hero.mp4` (pre-tint original; never grade the already-encoded v2 output).

*Alternative rejected:* porting the reference's `--hero-bg` + feather-gradient overlays — walks back the seamless-composite convention and its verification gate on the same day it was established.

### 2. No trim — ship the full 3s

The reference take is already the arc the user wants ("the video as used there"). 3s across the unchanged 280vh runway slightly slows effective scrub speed vs the 4s take; that is the reference feel and needs no constant retuning. HOLD 0.2, lerp 0.35, threshold 0.02 untouched.

### 3. Geometry: shrink the top inset, keep the absolute-box technique

Keep v2's `.video` absolute positioning (top + bottom pin the height, `width: auto` follows the 1370:1080 aspect). Change: top inset drops from `calc(var(--safe) * 3.5 + 53px)` (deliberate shrink) to header clearance only (≈ the header band's occupied height; start from `calc(var(--safe) + 53px)` and tune visually), `right` returns to `0` (the reference take has no empty right margin to bleed off-screen — that offset belonged to the Jul-12 take). The llama's ears must stay clear of the header's top-right CTA/menu — same rule the reference enforced with `height: calc(100% - var(--nav-h))`.

*Alternative rejected:* letting the clip run to `top: 0` behind the transparent header — the llama's head would collide with the CTA/menu pills, which is exactly why the current inset exists.

### 4. Belt: restyle in place, don't port the reference component

The reference `ClientLogos.tsx` is CMS-fed (Payload), uses raw CSS keyframes, and predates v2's touch-gating and keep-on-screen work. v2's component already has the better interaction layer, so only `client-logos.module.css` (plus a heading element) changes:

- Section gets `background: var(--sand)` (token exists in `brand-theme`), top padding, and the centered "ZAUFALI NAM" heading in the display face — sourced from `lib/content/home.ts`.
- `.logo` drops the `brightness(0) invert(1)` silhouette filter and the `html[data-theme]` flip; logos render `grayscale(1)` at ~0.55 opacity at rest, revealing brand colors at full opacity on hover — the reference's exact treatment (user correction 2026-07-13).
- The cream hover chip (`.item::before`) is deleted; the color reveal happens directly on the sand band, and dim-others on hover stays as the focus affordance.
- Edge fades: `::before/::after` gradient overlays from `var(--sand)` to transparent (the reference technique — no mask, so testimonial cards can still overflow the marquee box).
- Heading is presentational alongside the existing `aria-label="Zaufali nam"` on the section — use `aria-hidden` on the visual heading or swap the label for a real heading; pick whichever keeps AT output non-duplicated.

### 5. Archive the two completed changes first

`hero-bare-clip` and `hero-client-logos-hover` are complete but unarchived, so main specs still describe the TV shell and lack the `client-logos-marquee` capability. This change's deltas are written against their *post-archive* state; archiving them is the first implementation task, not an optional cleanup.

## Implementation Outcomes (2026-07-13)

- **The browser/ffmpeg "matrix disagreement" was a container-tagging artifact, not a decoder quirk.** A bitstream-only remux (`h264_metadata` bsf writing SPS VUI tags) is ignored by Chromium — it reads the mp4 `colr` atom, which only a real re-encode writes. With a clean libx264 all-intra encode (crf 13, `-g 1`, smpte170m tags), the browser render matches ffmpeg decode exactly; no empirical lut bump is needed (two bump iterations were built and discarded once this was isolated). The reference take's background was already at the token (Δmax ≤ 2), so the "grade" is identity.
- **The poster must bypass the Next image optimizer.** The optimizer's WebP re-encode decodes several RGB points dark in Chromium (raw JPEG decodes exact), breaking the seamless composite in poster states — `unoptimized` on the hero poster `Image`.
- **`<img>` posters don't stretch to top/bottom pins** the way `<video>` does (auto height resolves from the intrinsic ratio); `.video` now sets an explicit `height: calc(100% - clearance)` so both media fill the same box.
- **Scope additions accepted mid-implementation (user):** grayscale-at-rest belt logos with hover color reveal (reference behavior); light-chapter ground → sand; "THAT WORKS" always bold orange homepage-wide.
- **Known pre-existing issue (out of scope):** the mobile clip (`hero-mobile.mp4`, untouched) has the same missing-`colr` encoding and shows a faint boundary; the same clean-encode pipeline would fix it in a follow-up.

## Risks / Trade-offs

- [Reference take's background less flat than the Jul-12 take (it was never generated for tinting)] → Corner-sampling before committing to the grade; the gate tolerance (±3/channel) and the ~10/channel grade ceiling are unchanged — if corners disagree beyond tolerance, surface to the user before burning time (regeneration is out of scope).
- [Browser YUV matrix mismatch resurfaces] → Follow the proven recipe: 601-encode tagged smpte170m, verify against browser-rendered screenshot, apply the empirical per-channel bump on top of the base grade if needed.
- [Full-height llama collides with header CTA/menu on short/wide viewports] → Top clearance is a hard floor (Decision 3); verify at 1280×720 and ultrawide during implementation.
- [Colored logos vary in visual weight on sand (some marks are light)] → Tune resting opacity per the reference (it shipped this exact treatment); worst case a slight uniform opacity drop.
- [Sand band interrupts the chapter-1 plum look during the pinned scrub] → Intentional — that is the reference fold the user asked for.

## Migration Plan

Asset swap + CSS-only component changes; no data, route, or dependency migrations. Rollback = restore the previous `hero.mp4`/`hero-poster.jpg` (in git history) and revert the two CSS modules.

## Open Questions

- Exact header clearance value (tuned visually at implementation; start `calc(var(--safe) + 53px)`).
- Resting opacity for colored logos on sand (start at 1; the reference used full color).
