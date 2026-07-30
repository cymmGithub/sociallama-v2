## 1. Band restructure

- [x] 1.1 In `outfit-stack.tsx`, move the strip's look image off the band element onto a child `<span>`, and pass the served look URL / ghost vars as inherited custom properties on the band (keep the `servedUrl()` / `currentSrc` rule for both the image and the mask)
- [x] 1.2 Add the `FRINGE_VARIANT` constant (`'a' | 'b' | 'c'`, default `'a'`) mapping to `--fringe-l`, `--fringe-r`, `--fringe-g`, `--fringe-a` on the llama box, with the A/B/C values from the spec table
- [x] 1.3 Verify the restructured tear with no fringe styling yet: settled frame, band joins, and handoff all pixel-identical to main (screenshot compare via headless Playwright, WAAPI `currentTime` seek — wall-clock freezes miss the tear)

## 2. Ghost inks

- [x] 2.1 In `hero.module.css`, add `::before`/`::after` ghost layers on the bands (`z-index: -1`, flat `background-color`, static `mask-image` from the inherited look var, `translateX(±var(--fringe-g))`), with the stepped 0 → α → 0 ghost keyframes duplicated into the existing A/B name-alternation scheme
- [x] 2.2 Confirm ghosts hold no mask/ink until the first tear (network tab: five look requests total, no re-fetch under a mask cache key; nothing rasterized at load — the two tear-time mask fetches are disk-cache replays, `fromDiskCache: true`, 0 bytes on the wire)
- [x] 2.3 Seek-frozen screenshots at +300/+410/+500 ms on both breakpoints: inks fringe the silhouette only, switch on at 270 ms and off at 540 ms, settled frame untouched; check look-02's right-edge column for matte residue picked out by the inks

## 3. Live A/B/C review — user decision gate

- [x] 3.1 With variant A live on the dev server, have the user review the real hero at full cadence (plus reduced-motion check: no fringe)
- [x] 3.2 Flip to B, then C, for the same review; collect the pick — user went straight from A to C and picked C (B never needed a live pass)
- [x] 3.3 Lock the chosen values: delete the losing variants and the `FRINGE_VARIANT` switch, and update this change's spec delta table to the final values

## 4. Close-out

- [x] 4.1 Re-verify after the trim: full-cadence loop on both breakpoints, `bun run check`, and a real-iOS (or WebKit) pass for the mask-rasterization parity requirement
- [x] 4.2 Confirm no `will-change` was introduced and the layer/element budget matches the spec bound (47 drawing layers / 35 elements + 28 pseudos per instance)
