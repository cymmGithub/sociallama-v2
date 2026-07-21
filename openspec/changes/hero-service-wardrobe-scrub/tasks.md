## 0. Prerequisite spike (asset generation — gates the build)

- [ ] 0.1 Generate 5 service-themed outfit stills of the same llama (STRATEGY: sharp suit; CONTENT: smart-casual creator; SPRZEDAŻ: confident blazer; KREACJE: bold designer streetwear; WIDEO: filmmaker/field-vest), same front pose, flat mid-gray bg — iterate + user-approve each look
- [ ] 0.2 `motion_control`: transfer the approved neck-turn + subtle nod (test-7 clip) onto each of the 5 stills → 5 clips, identical motion, different outfit
- [ ] 0.3 Slice exactly 12 frames per clip in order (STRATEGY 1–12 … WIDEO 49–60) so seams are motion-continuous and outfit cuts land on 12/24/36/48
- [ ] 0.4 `rembg`/`remove_background` every frame → transparent; export `public/clips/hero-frames/001–060.webp` @1370×1080
- [ ] 0.5 Regenerate `hero.mp4` (playable fallback) + `hero-poster.jpg` (=frame 001) + `hero-mobile-poster.jpg` from the new frames

## 1. Scroll-drive the rotator

- [ ] 1.1 In `hero/index.tsx`, derive the active word index from the scrub context (`floor(progress × 5)`, clamped) instead of `useRotator`; drive the existing active/leaving word CSS from it
- [ ] 1.2 Expose `scrubTarget` to the headline (via `useHeroScrubTarget`) and update the word index inside the same rAF loop as the frame draw so word and frame stay in agreement
- [ ] 1.3 Keep the headline's `aria-label` a single stable string; retire `useRotator` for the hero (leave the hook for other consumers)

## 2. Reduced-motion / mobile

- [ ] 2.1 With no scrub runway (reduced motion, mobile poster), pin the hero to word 0 (STRATEGY) + frame 0; no timer-driven cycling anywhere

## 3. Verify (dev :3000, Playwright)

- [ ] 3.1 Scrub the hero runway; assert the active word changes exactly at each 1/5 boundary and matches the outfit block on screen (STRATEGY→…→WIDEO)
- [ ] 3.2 Held (no scroll): neither word nor outfit changes; reduced-motion: static STRATEGY + first outfit
- [ ] 3.3 Screenshot each block's midpoint desktop 1440 — outfit reads as the themed look for that word; matte is clean (no bg halo on plum)
- [ ] 3.4 a11y: headline announces one stable name; Biome + TypeScript clean
