# Design: why-manifesto-gradient

## Context

Why-that-works is the manifesto beat between the hero video and the Usługi autoplay-tabs stage. It must gain visual life without adding an autonomous animation loop (it is the page's only breather). The heading already scrubs word-by-word via `ProgressText` + hamo's `useScrollTrigger`; paragraphs currently enter once via `useReveal`.

## Goals / Non-Goals

**Goals:** scroll-tied motion only (manifesto word fill), a material link to the Usługi section (grain gradient inside "THAT WORKS"), zero new dependencies.

**Non-Goals:** llama illustration placement (direction B — deferred, assets inventoried: `lama-manifest.png`, `stadko.png`, `lama-fotograf.png`); animated drift inside letters; layout restructure; fixing the self-referencing `/#o-nas` CTA link (flagged separately).

## Decisions

### D1 — Gradient as a verbatim data-URI SVG on the ProgressText wrapper

CSS background layers cannot blend with each other, but the user's gggrain SVG blends its grain rect `soft-light` *inside the SVG document*. Embedding the whole SVG as a `data:image/svg+xml` background (URL-encoded, `#` → `%23`, fixing the source's missing `#` on the orange stop) reproduces the exact look. It sits on the ProgressText wrapper span with `-webkit-background-clip: text` / `background-clip: text`, `background-size: cover`:

- Wrapper-level clipping keeps the gradient continuous across words and line wraps.
- "THAT"/"WORKS" word spans get `-webkit-text-fill-color: transparent` via ProgressText's per-word `className` segments (WordSegment API), revealing the gradient.
- "WHY" keeps an opaque ink `color` set by the scrub callback — opaque glyph paint hides the gradient behind it, no special casing in CSS.
- The scrub's per-word opacity (0.2 → 1) still applies: a transparent-fill word at low opacity shows a faint gradient that solidifies — the fill-in reading survives.

Rejected: per-word backgrounds (gradient discontinuity at word boundaries), CSS-only gradient + separate grain layer (no cross-layer blending), drift animation (per-frame glyph repaint under `background-clip: text`).

### D2 — Manifesto scrub via `ProgressText` defaults

Lead and each paragraph render through their own `ProgressText` (default `onChange` = opacity 0.33 → 1) with `start="top bottom"` `end="center center"`, matching the heading's trigger vocabulary. Colors are untouched — the lead stays plum, paragraphs stay ink — only opacity scrubs, so the effect reads as ink "developing" rather than recoloring. `useReveal` moves off the paragraphs (scrub replaces entrance); the CTA link keeps a reveal.

### D3 — Reduced motion

Matches the heading's existing behavior: the scrub is scroll-tied, not autonomous, and `ProgressText` short-circuits under `prefers-reduced-motion` the same way it does today for the heading (no change to that component). The gradient fill is static by design so RM needs no special path.

## Risks / Trade-offs

- [Three paragraphs at opacity 0.33 before scroll may read as low-contrast wall] → the scrub window (`end="center center"`) fills them early in the viewport pass; tune by eye at implementation.
- [`background-clip: text` + large data URI on a huge heading] → the SVG tile is ~2 KB URL-encoded; rendering cost is one rasterization per layout, acceptable.
- [Gradient "THAT WORKS" diverges from the flat-orange brand rule] → deliberate, user-chosen; scoped to this heading only and captured in the homepage spec delta.

## Migration Plan

Two-file change; revert = revert commit. Verify with dev-server screenshots (scrub states at multiple scroll positions, RM emulation, mobile).

## Open Questions

- Whether direction B (banner llama) lands later as a companion change.
- Real destination for the "POZNAJ NASZE DOŚWIADCZENIE" link (currently self-referencing).
