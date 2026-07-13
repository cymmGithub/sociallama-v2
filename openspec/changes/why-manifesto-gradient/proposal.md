# Proposal: why-manifesto-gradient

## Why

The why-that-works section reads flat — a sticky two-tone heading and a plain text column on sand, with no visual event between the hero video above and the Usługi grain-gradient stage below (user observation, 2026-07-13). Explore session settled on two composable moves that add life without adding a second permanent animation motor: scroll-scrubbed manifesto copy (direction A) and a grain-gradient fill inside the heading letters (direction C).

## What Changes

- The section's lead and three paragraphs become scroll-scrubbed manifesto text: words fill from faint to full as the reader scrolls, via the existing `ProgressText` effect (the same mechanism the heading already uses). The `useReveal` entrance on those paragraphs is replaced by the scrub; the CTA link keeps a reveal entrance.
- "THAT WORKS" in the heading fills with a user-provided gggrain gradient variant (orange-dominant: base `#f09b39`, plum-hero `#892f53` falloff at ±150°, `feTurbulence` 0.55 grain, soft-light) instead of flat orange. The SVG is embedded verbatim as a data-URI background with `background-clip: text` on the ProgressText wrapper, so the gradient runs continuously across both words and line wraps; "WHY" keeps its ink fill painted on top. The fill is static — no drift animation inside letters (glyph repaint cost; the scroll scrub supplies the motion).
- The existing word-by-word heading scrub (opacity + WHY color) is preserved on top of the gradient fill.

- **Scope addition (user requests, 2026-07-13, mid-implementation):** the section is restructured to the Azurio manifesto pattern (reference: mixdesign.dev Azurio "We are a creative web agency"): "W skrócie:" is dropped from the lead; the lead + first paragraph render as one display-scale sentence-case statement (plum opener → ink) spanning most of the container; the remaining two paragraphs move into a bottom row beside a generated photorealistic brand photo (llama recording a reel in a cream office, nano-banana), later upgraded to a Seedance 2.0 showreel clip that starts on that exact frame (photo = seamless poster) and floats glass social-platform icons around the llama.
- **Progressive bottom blur (Azurio-style, user request):** a global `BlurEdge` layout component — six stacked `backdrop-filter` layers with doubling radii and staggered masks fixed to the viewport bottom, so content melts into frost as it exits. Gated by a `[data-blur-edge-gate]` contract: hidden while any gate element (the client-logos belt) is on screen — the brand marquee is never frosted at page start (user decision).

## Capabilities

### New Capabilities

_None — this restyles an existing homepage section._

### Modified Capabilities

- `homepage`: the "Section motion behaviors" requirement changes — why-that-works gains scrubbed manifesto copy, and the heading's "THAT WORKS" fill becomes the grain-gradient (a scoped exception to the every-"THAT WORKS"-is-flat-orange rule). NOTE: the in-flight `services-autoplay-tabs` change also carries a `homepage` delta for this requirement; archive that change first — this delta restates the requirement inclusive of its wording.

## Impact

- `app/(home)/sections/why-that-works/index.tsx` and `why-that-works.module.css` — only files touched.
- Reuses `ProgressText` (`components/effects/progress-text`) unmodified; drops `useReveal` for the paragraphs.
- No new assets on disk — the gradient SVG is inlined as a data URI in the module CSS.
- Depends on `services-autoplay-tabs` archiving before this change archives (overlapping homepage delta).
