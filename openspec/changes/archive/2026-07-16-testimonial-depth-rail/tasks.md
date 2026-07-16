## 1. Prerequisites

- [x] 1.1 Archive the shipped `testimonial-pull-quote-rail` change so the base `testimonial-rail` spec lands in `openspec/specs/` before this change's deltas apply
- [x] 1.2 ~~Create three placeholder portrait assets~~ (obsolete: client delivered real portraits with the apply request; copied to `public/assets/testimonial-{treszczotko,nartowska,gosiewska}.jpg`)

## 2. Content

- [x] 2.1 ~~Add three placeholder `Testimonial` entries~~ (obsolete: real content arrived before implementation — skipped straight to 2.2)
- [x] 2.2 When the client delivers content: swap in verbatim quotes, pull-phrases with highlight words, author photos, and white-knockable logos; remove the TODO markers (launch gate, can trail the rest)

## 3. Desktop depth-stack rail

- [x] 3.1 Add wrap-around slot math to `app/(home)/sections/testimonial/index.tsx` (`offset = ((i − active) % 6 + 6) % 6` remapped to −2…+3) and expose each row's slot as a data attribute
- [x] 3.2 Restyle the rail in `testimonial.module.css` as a fixed-height centered window: rows stacked and positioned by `translateY(slot × step)`, transitions on transform/opacity/filter, full band (−1/0/+1) keeping today's treatment, ±2 receded (scale ≈0.68, opacity ≈0.22, slight blur), +3 `visibility: hidden`
- [x] 3.3 Suppress transitions on rows entering/leaving the hidden slot so wrap-around never shows a row flying across the rail → verify: let autoplay run past the 6→1 boundary, no visible teleport
- [x] 3.4 Keep receded rows interactive (existing `pick()` + recenter) and focus-visible lifting them to full opacity → verify: click and keyboard-activate a ±2 row
- [x] 3.5 Reduced motion: slot changes apply instantly, autoplay stays disabled → verify with `prefers-reduced-motion` emulation

## 4. Mobile peek strip

- [x] 4.1 Rework the ≤820 px chip strip: three full chips with half-cropped, edge-fading prev/next chips (overflow window + gradient mask), same slot model on the X axis
- [x] 4.2 Verify at 390 px: no horizontal page overflow, swipe still changes slides and stops autoplay on touch

## 5. Verification

- [x] 5.1 Autoplay full cycle: 42 s idle shows all six in order, progress bar filling per row, rail recentering each tick, no layout shift in surrounding sections (screenshot-sample against the user's :3000 server)
- [x] 5.2 Short-viewport check (~900 px height): taller rail (~511 px) doesn't crowd the section or fight the `data-blur-edge-gate` behavior; if it does, tune receded scale/step per design
- [x] 5.3 If receded-row blur janks the glide transition, drop the blur (scale + dim carry the effect) — decide by observing, not preemptively
- [x] 5.4 `pnpm` lint/typecheck (Biome + TS) pass
