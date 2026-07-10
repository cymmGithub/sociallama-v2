## Why

The client-logo marquee is currently a flat, passive strip that sits below the fold: the hero is a full `100svh` screen and `ClientLogos` renders after it, so first-time visitors never see the social proof without scrolling. The sociallama reference build has a proven interactive treatment — hover freezes the belt, spotlights the hovered brand, and pops a testimonial card above the logo — that makes the client list a persuasive element instead of decoration. We want that behavior here while keeping the current Satus visual design (white logo silhouettes on the plum chapter).

## What Changes

- Restructure homepage chapter 1 so the first `100svh` viewport contains both the hero (copy + video) and the client-logo belt pinned at the bottom; on very short viewports the belt drops below the fold instead of crushing the headline.
- Port the sociallama hover behavior into `app/(home)/sections/client-logos`:
  - Belt pauses while the pointer is over the marquee (enable the existing `pauseOnHover` prop on `<Marquee>`).
  - Spotlight dimming: hovered logo reveals its original brand colors on a cream chip (colors alone are illegible on plum), all other logos dim hard; at rest logos are theme-matched silhouettes (white on plum, ink once the scroll morph turns the background cream).
  - Testimonial card pops above the hovered logo with a caret, with JS edge-shift keeping the card inside the viewport near screen edges.
  - All hover interactions gated to `(hover: hover) and (pointer: fine)`; touch devices get the plain scrolling belt.
- Extend `clients` in `lib/content/home.ts` with a `testimonial` field on all 13 entries: 4 real quotes from the verified content export (Funtronic, Intrum Justitia, Uniphar, Aquael) and 9 lorem-ipsum placeholders each flagged with a `TODO: placeholder — replace before launch` comment.
- No CMS involvement — all content stays in the static content file.

## Capabilities

### New Capabilities
- `client-logos-marquee`: Interactive client-logo marquee — placement inside the hero viewport, pause/spotlight/testimonial-card hover behavior, touch and reduced-motion fallbacks, and the static testimonial content contract.

### Modified Capabilities

_None. The active `sociallama-homepage` change's `homepage` spec mentions the client-logo marquee only as "implemented via `<Marquee>`", which remains true; no requirement in that spec changes. (No specs exist yet in `openspec/specs/`.)_

## Impact

- `app/(home)/page.tsx` — chapter 1 composition changes so hero + belt share the first viewport.
- `app/(home)/sections/hero/` — hero yields vertical space to the belt (no longer sole owner of `100svh`).
- `app/(home)/sections/client-logos/` — main work: hover behavior, testimonial card markup/styles, edge-shift handler; becomes a client component.
- `components/ui/marquee` — used as-is (`pauseOnHover` already exists); its `overflow-x: clip` already leaves the y-axis visible for the cards.
- `lib/content/home.ts` — `Client` type gains an optional `testimonial`; 13 entries populated (4 real, 9 lorem placeholders that are a launch blocker by design).
- Z-index: testimonial cards must float above hero copy/video (same fix as sociallama's section `z-index`).
- No new dependencies, no CMS, no API changes.
