## 0. Assets (from the approved take 10)

- [x] 0.1 Generate + user-approve the hero take: nano-banana start still (streetwear look, same llama identity) → Seedance 2.0 std, locked-off camera, neck-only left turn with five word-themed outfit morphs (streetwear → all-black film look → cream overshirt → charcoal blazer → navy suit), per-look sunglasses swapping with each outfit, ending in an admiring profile settle. Iterated: zoom drift (take 8), rushed turn (takes 9/11), flat ending (take 10 v1), body sway + same glasses (take 10) → approved "take 14". (Per-word slice pipeline abandoned: Kling motion transfer fails on the llama.)
- [x] 0.2 2K-upscale the take (ByteDance aigc preset) and extract 60 frames (10 fps × 6 s)
- [x] 0.3 Matte every frame with bria-rmbg (RMBG 2.0, local rembg) — chosen over u2net/isnet (gray halo) after side-by-side on plum
- [x] 0.4 Composite via union bounding box (stable scale across frames) → `public/clips/hero-frames/001–060.webp` @1370×1080, SouthEast-anchored
- [x] 0.5 Regenerate `hero.mp4` (playable fallback, smpte170m-tagged) + `hero-poster.jpg` (=frame 001 on chapter plum) + `hero-mobile-poster.jpg` (llama-centered 780×820 crop on the token plum) from the new frames

## 1. Scroll-drive the rotator

- [x] 1.1 In `hero/index.tsx`, derive the active word index from the scrub context via `WORD_BOUNDS` (the take's outfit-cut fractions: 0.246 / 0.483 / 0.703 / 0.805) instead of `useRotator`; drive the existing active/leaving word CSS from it
- [x] 1.2 Read `scrubTarget` via `useHeroScrubTarget` in a rAF loop; `setState` only on boundary crossings so word and frame stay in agreement at ≤4 re-renders per scrub
- [x] 1.3 Keep the headline's `aria-label` a single stable string; retire `useRotator` for the hero (leave the hook for other consumers)
- [x] 1.4 Reorder `hero.headline.rotator` in `lib/content/home.ts` to the take's outfit order: KREACJE, WIDEO, CONTENT, SPRZEDAŻ, STRATEGY

## 2. Reduced-motion / mobile

- [x] 2.1 With no scrub runway (reduced motion, mobile poster), pin the hero to word 0 (KREACJE) + frame 0; no timer-driven cycling anywhere

## 3. Verify (dev :3011, Playwright)

- [x] 3.1 Scrub the hero runway; the active word flips at each `WORD_BOUNDS` boundary in lockstep with the outfit (wheel-scroll flip log: y=325/633/920/1049 vs predicted 319/626/911/1043)
- [x] 3.2 Held (no scroll): neither word nor outfit changes; reduced-motion: static KREACJE + frame-001 poster, no canvas
- [x] 3.3 Screenshot each word's block midpoint at desktop 1440 — word matches the look; matte is clean (no gray halo on plum)
- [x] 3.4 a11y: headline announces one stable name; Biome + TypeScript clean
