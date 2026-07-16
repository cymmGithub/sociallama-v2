# Why Team Stage

## Why

The why-that-works media cell currently ships a static team JPG (`why-team.jpg`) whose composition predates the final brand system. The agency now has 10 on-brand avatar stickers (plum→orange gradient circles) plus two team credentials (DIMAQ professional, Meta Small Business Academy) that should be presented on the homepage. A flat photo bakes faces and certificates into fixed pixels — blurry at retina sizes, illegible certs on mobile, and unmaintainable when the team changes.

## What Changes

- Replace the `<Image why-team.jpg>` fill in the why-that-works `.media` box with a live CSS "stage": the existing plum-gradient + orange-glow + grain backdrop recipe already used by the services and how-it-works sections.
- Scatter the 10 team avatar images across the upper ~⅔ of the stage in a deliberately loose arrangement: %-based positions, ±6° rotations, ~20% size variance.
- Present the two certificates as cream chips (rounded rectangles, real PNGs, soft shadow) along the bottom of the stage with gentle tilt (±3°).
- Add optimized team/cert assets to `public/assets/` (avatars downscaled to ~400px WebP; originals are 810px/0.5 MB PNGs — 5 MB total is unacceptable page weight).
- Section heading, manifesto, supporting copy, and CTA link are untouched; only the contents of the `.media` box change. The `.media` container keeps `aspect-ratio: 4/3` and `border-radius: 14px`.
- Remove `public/assets/why-team.jpg` once the stage lands.

## Capabilities

### New Capabilities

_None — this changes an existing homepage section's media treatment._

### Modified Capabilities

- `homepage`: the "Brand media beside supporting copy" scenario changes — the left media cell no longer shows generated/photographic brand media; it renders the team stage (grain-gradient backdrop, scattered avatar stickers, certificate chips). Reveal behavior of the bottom row is preserved.

## Impact

- `app/(home)/sections/why-that-works/index.tsx` — media cell markup.
- `app/(home)/sections/why-that-works/why-that-works.module.css` — stage backdrop (third instance of the services/how-it-works recipe, duplicated per house convention), scatter and chip styles.
- `public/assets/team/` (new: 10 avatar WebPs), `public/assets/certs/` (new: 2 cert images), `public/assets/why-team.jpg` (removed).
- No content-model changes in `lib/content/home.ts` beyond (optionally) listing avatar/cert asset paths.
- No new dependencies; reuses `Image` component, brand tokens, `useReveal`.
