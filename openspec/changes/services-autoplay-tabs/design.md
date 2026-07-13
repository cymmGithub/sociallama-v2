# Design: services-autoplay-tabs

## Context

The Services section (`app/(home)/sections/services/`) currently renders three independent cards, each with a hover-gated generic clip (design D5). The reference is Webflow's homepage `autoplay-tabs` component, inspected in their live DOM (2026-07-13):

- One shared 16:9 stage; each tab's stage layer is stacked and crossfaded (opacity, ~0.25s).
- Webflow's background is a live WebGL "fluted glass" shader behind an RGBA `.webp` cutout (2560×1440, 36% transparent) — the grain/light animation is *not* baked into the image.
- Tab columns each hold a full-cover `<button>`, a progress bar animating `width: 0→100%` linearly over `tab-timing=6000` ms, a title, and a one-sentence description.
- An IntersectionObserver (thresholds `[0,.2,.5,1]`, `rootMargin: 0 0 -20%`) pauses/resumes the loop; below 768px the tabs are dismantled and all panels render open; `prefers-reduced-motion` uses instant sets.

Our adaptation (user decisions, 2026-07-13): CSS/SVG grain-gradient instead of WebGL; real Social Lama assets instead of generated imagery; DOM-composed panels instead of baked cutouts; existing clips are removed; Sprzedaż ships as a placeholder.

Constraints: React 19 / Next.js 16 / Tailwind v4 per AGENTS.md; existing primitives `Image`, `Video` (has `autoPlay` prop gating playback), `useReveal`; brand tokens in `lib/styles/css/tailwind.css` (`--color-plum: #913155`, `--color-orange: #f09b39`); the section lives in the cream chapter of the three-chapter homepage.

## Goals / Non-Goals

**Goals:**

- One shared stage + three tab columns matching the Webflow interaction model (auto-advance, click-to-switch, progress bars, off-screen pause).
- Live animated grain-gradient stage background in brand colors, cheap enough to run continuously (no WebGL, no canvas).
- Per-tab stage media composed in the DOM from real assets, individually swappable.
- Graceful states: Sprzedaż with no media, mobile stacked layout, reduced motion.

**Non-Goals:**

- WebGL/fluted-glass shader or hover-reactive distortion (explicitly rejected — scope/benefit).
- Baked stage images or AI-generated assets (Higgsfield dropped from the plan).
- `/uslugi/*` detail pages or their long-form copy.
- Sprzedaż real assets (follow-up when the user provides them).
- Preserving the old hover-clip behavior or its assets.

## Decisions

### D1 — Stage background: layered CSS gradient + static SVG grain (over WebGL or baked images)

Three layers inside the stage (mirrors gggrain.svg's recipe: two linear gradients + `feTurbulence` rect blended `soft-light`):

1. Base: plum→orange gradient using brand tokens.
2. Light loop: 2–3 large blurred radial-gradient blobs, drifting via slow CSS `transform` keyframes (~20–30s, GPU-composited). This is the "self-animated light" analog of Webflow's shader.
3. Grain: a static inline-SVG `feTurbulence` tile (`baseFrequency≈0.62`, per gggrain.svg) as a full-stage overlay with `mix-blend-mode: soft-light`, sitting **above the panels too** — the shared grain unifies screenshots from different sources.

Why: zero dependencies, brand-exact colors, runs on the compositor. Animating `feTurbulence` itself (rejected) forces per-frame filter re-rasterization; animating transforms of pre-blurred blobs does not. Baked images (rejected) freeze the light and compress grain badly.

### D2 — Tab engine: React state + CSS transitions/animations (over GSAP timeline)

A `useState` active-index plus one `setTimeout`/rAF loop per cycle; progress bar as a CSS `scaleX` animation with `animation-duration: var(--tab-timing)` restarted per activation (re-mount or class toggle); stage layers crossfade via opacity transition (~0.3s), all layers stacked in the same grid cell (`grid-area: 1/1`), inactive layers `pointer-events: none`.

Why: the interaction is a timer + three states — GSAP (used for the hero scrub) adds nothing here; CSS animations pause naturally with `animation-play-state` for the off-screen case. Alternative (GSAP `delayedCall` + tweens, as Webflow does) rejected as unneeded coupling.

Off-screen pause: one IntersectionObserver on the section toggles a `paused` flag — timer cleared, progress bar `animation-play-state: paused` (progress preserved, matching Webflow's pause-not-reset semantics). Click on a tab column (whole column is the button, per Webflow) switches immediately and restarts the cycle from that tab.

### D3 — Per-tab media as typed union in `lib/content/home.ts`

Service items drop `poster`/`clip` and gain a `stage` descriptor:

- `{ kind: 'panels', panels: [{ src, alt, width, height }...] }` — Content: three platform screenshots, absolutely positioned floating cards (rounded, shadowed) over the gradient; positions are per-panel CSS, staggered entrance on tab activation (reusing the `useReveal` transform vocabulary, not the hook — activation isn't viewport entry).
- `{ kind: 'video', src, poster }` — Kreacje i Wideo: existing `Video` primitive inside a phone-style frame (rounded-corner mask + border), `autoPlay={active}` so it plays only on the active tab; 9:16 panel centered in the 16:9 stage, gradient breathing room on both sides.
- `{ kind: 'placeholder' }` — Sprzedaż: gradient-only stage (optionally the eyebrow/llama mark, decided at implementation); layout must not reserve empty panel space.

Why a union: the three tabs are genuinely different media shapes; a lowest-common-denominator `image[]` would force the video and placeholder through hacks. Baked RGBA cutouts (Webflow's approach) rejected: per-panel entrance animation, single-file swaps, and crisp text argue for DOM composition.

### D4 — Breakpoints and fallbacks

- **Mobile (below the project's desktop breakpoint)**: no tabs, no autoplay, no timer — three stacked blocks, each `title + body + its stage media` (gradient background retained per block, static). This is essentially the pre-change card layout, so nothing is lost on touch.
- **Reduced motion**: gradient renders without blob drift (static), tab switches are instant (no crossfade), progress bars render full, autoplay disabled (first tab open; user clicks to switch — auto-advancing content against `prefers-reduced-motion` would be hostile). `Video` already falls back to poster.
- **Copy**: bodies trimmed to one sentence (~20 words) so the three columns stay visually even; the full texts move to a code comment / future `/uslugi/*` source, not deleted from history.

### D5 — Asset pipeline

- Video: `ffmpeg` transcode HEVC `.mov` → H.264 MP4 (`720×1280`, CRF ~23, `faststart`), target ≤3 MB; trim to a tight loop (~10s) if the 18.4s cut feels long against the 6s tab cycle — final trim decided by eye at implementation. Poster extracted from a representative frame. The seamless-composite background check does **not** apply (framed panel, edges intentional — see `video-playback` delta).
- Screenshots: copied from `/mem/*.png` into `public/` (project's asset convention), losslessly optimized; current 1× resolution accepted, swap-friendly if re-grabbed at 2× later.
- Old `service-*.mp4` clips + posters deleted in the same change.

## Risks / Trade-offs

- [Grain overlay over panels can muddy small screenshot text] → keep grain opacity low (gggrain uses 0.62 on soft-light; start ~0.3–0.4 and tune by eye at 100% zoom).
- [1× screenshots slightly soft on retina] → accepted; panels render ≤~450 CSS px wide; assets individually replaceable.
- [18s video loop vs 6s tab dwell — clip restarts mid-story every cycle] → trim to ~10s and/or let the clip continue across its tab's re-activation (`Video` keeps element mounted; only `autoPlay` toggles).
- [`mix-blend-mode` + animated transforms can promote large layers on low-end mobiles] → mobile fallback uses the static gradient (no drift), so the cost is desktop-only.
- [Sprzedaż placeholder may read as unfinished] → placeholder is deliberately styled (gradient + copy), and the tab still participates in the loop so the rhythm holds.
- [Uneven column heights if trimmed Polish copy still varies] → cap at one sentence in content review; columns top-aligned so small variance is invisible.

## Migration Plan

Single-PR replacement of the section; no data or route migration. Old clip files deleted in the same commit that stops referencing them. Rollback = revert the commit. Verification: screenshot-sampling against the dev server on :3000 (established workflow), axe/aria pass on the tab buttons (`aria-expanded`, `aria-controls`), reduced-motion and mobile emulation checks.

## Open Questions

- Sprzedaż real assets: what results/screenshots will replace the placeholder, and when (blocked on user).
- Final video trim window (which ~10s of the BTS cut) — decided by eye during implementation.
- Whether the placeholder stage carries a small llama mark / eyebrow text — micro-decision at implementation, show both to the user if unclear.
