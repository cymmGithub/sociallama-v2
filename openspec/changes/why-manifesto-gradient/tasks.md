# Tasks: why-manifesto-gradient

## 1. Implementation

- [x] 1.1 Encode the user's gggrain SVG variant (fix `f09b39` → `#f09b39`) as a data-URI background in `why-that-works.module.css`; add the wrapper class (`background-clip: text`, cover) and the transparent-fill word class
- [x] 1.2 Heading: pass WordSegment objects to `ProgressText` ("WHY" plain, "THAT WORKS" with the gradient word class + wrapper class on ProgressText); adjust the scrub callback so it no longer sets `color` on gradient words (opacity only; "WHY" keeps ink)
- [x] 1.3 Copy: render lead and each paragraph through `ProgressText` (default opacity scrub, `start="top bottom"` `end="center center"`); remove their `data-reveal-item`s, keep the CTA link on reveal

## 2. Verification

- [x] 2.1 Screenshot-sample on :3000 — mid-scrub (partially filled paragraphs), fully scrolled state, gradient continuity across the "THAT WORKS" wrap, mobile, reduced-motion emulation
- [x] 2.2 Run `bun run check`; confirm no console errors

## 3. Azurio manifesto + blur edge (scope addition, 2026-07-13)

- [x] 3.1 Trim "W skrócie:" from the lead; restructure the section: display-scale manifesto (lead + paragraph 1, sentence case, plum→ink), bottom row with media left + paragraphs 2–3 and CTA right; force ProgressText chunks inline so the statement flows as one paragraph
- [x] 3.2 Generate the brand photo (photoreal llama recording a reel, nano-banana) and install as the media-slot image
- [x] 3.3 Build the global `BlurEdge` progressive-blur component (6 layers, doubling blur, staggered masks) mounted in `Wrapper`; gate via `[data-blur-edge-gate]` on the client-logos belt so the marquee is never frosted at page start
- [x] 3.4 Generate the Seedance 2.0 showreel (start-frame = the llama photo, glass platform icons), transcode, and swap the media slot to the `Video` primitive with the photo as poster
- [x] 3.5 Re-verify: manifesto flow/scale, blur gate at top vs mid-page, mobile, reduced motion; run `bun run check`
- [x] 3.6 Azurio two-tone typography (user decision, 2026-07-13): manifesto splits mid-statement into bold-ink `strong` + muted-gray `muted` (plum lead dropped); supporting paragraphs move to display font, bold, larger, with the same strong/muted split — content model carries the split explicitly
