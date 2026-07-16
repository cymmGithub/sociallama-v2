# Proposal: testimonial-depth-rail

## Why

The testimonial section holds three client opinions and its rail presents them as a closed, static set — nothing tells the visitor more clients exist. Three new testimonials are being added (six total), and the rail must both fit them and visibly communicate "there are more than three" without giving up the current three-row emphasis.

## What Changes

- Testimonial count grows from 3 to 6 in `lib/content/home.ts` (three new entries: author photo, company logo, verbatim quote, pull-phrase). **Content pending from the client — new entries ship as clearly-marked placeholders until delivered (launch blocker).**
- The desktop rail becomes a windowed "depth stack" (accepted Mock B, chosen from three live-page mocks: https://claude.ai/code/artifact/bbb58e8a-df61-49bb-bf55-a3a368e55bdc):
  - Three full-emphasis rows in the middle band, exactly as today (active row barred orange with progress fill).
  - The previous and next entries render whole but receded — scaled ≈0.68, opacity ≈0.22, slightly blurred — like a picker wheel; entries beyond those are hidden.
  - The rail slides one row per 7 s autoplay tick so the active row stays centered; selection wraps around the six entries.
- Mobile: the horizontal chip strip shows three full chips with half-cropped peek chips at the left/right edges, sliding per tick with the same centering.
- Quote stage is unchanged in design; it simply cycles six slides instead of three.

## Capabilities

### New Capabilities

_None._

### Modified Capabilities

- `testimonial-rail`: rail changes from "all testimonials' clients visible simultaneously" to a centered window over six entries with receded prev/next rows; autoplay additionally slides the rail window; responsive rail gains edge-peek chips. Base spec currently lives as the delta in the not-yet-archived `testimonial-pull-quote-rail` change (implemented in code); this change's deltas modify those requirements.

## Impact

- `app/(home)/sections/testimonial/index.tsx` — rail rendering becomes position-relative (slot per entry relative to active, wrap-around math); stage maps over six slides.
- `app/(home)/sections/testimonial/testimonial.module.css` — depth-stack rail styles (scale/dim/blur slots, transitions), taller rail (~354 px → ~511 px measured in the mock; verify short-viewport behavior with the `data-blur-edge-gate` note), mobile peek-chip styles.
- `lib/content/home.ts` — three new `Testimonial` entries (placeholder until content arrives).
- `public/assets/` — three new author photos + any new client logos (pending).
- No API, dependency, or cross-section changes; `useReveal`, blur-edge gating, and autoplay engine are reused.
