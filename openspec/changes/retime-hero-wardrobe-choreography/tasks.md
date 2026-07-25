# Tasks

## 1. Retime the hero choreography

- [x] 1.1 In `app/(frontend)/(home)/sections/hero/hero.module.css`, change `.look` from `transition: opacity 0.5s var(--ease-in-out-quad)` to `transition: opacity 1.26s var(--ease-out-quart) 270ms`.
- [x] 1.2 In the same file, change `.rotatorWordActive` and `.rotatorWordLeaving` from `transition: transform 650ms var(--ease-out-expo)` to `transition: transform 1.95s var(--ease-out-expo)`.
- [x] 1.3 Update the comment above `.look` — it currently claims the dissolve "leans toward the 650ms word-flip rhythm", which the new timing supersedes. Say instead that the wardrobe is delayed behind the word so the word leads.
- [x] 1.4 Confirm `ROTATOR_INTERVAL` in `lib/hooks/use-rotator.ts` is untouched at 2600.

→ verify: `bun run lint` and `bunx tsc --noEmit` clean; `git diff --stat` shows one file changed.

## 2. Verify the result in the running app

- [x] 2.1 Load the homepage and confirm the word begins moving before the outfit, and that the outfit's dissolve is visibly unhurried rather than snapping.
- [x] 2.2 Confirm the headline word and the outfit never disagree at any point in the cycle (watch two full rotations through all five looks).
- [x] 2.3 Confirm the mobile hero (stacked layout, `.mobileLook`) transitions with the same timing as desktop.
- [x] 2.4 With `prefers-reduced-motion: reduce` forced, confirm the hero holds look-01 and the first word with no transition at all.

→ verify: screenshots at settled and mid-transition on both breakpoints, plus the reduced-motion state.

## 3. Confirm nothing else moved

- [x] 3.1 Confirm the JoinCta rotator still runs at 650 ms — it has its own `.rotatorWordActive` in `join-cta/join-cta.module.css` and shares only the hook.
- [x] 3.2 Confirm the LCP element is still `look-01` and that exactly five look images are requested, unchanged in priority — the `look-01` preload present, looks 2–5 eager at normal priority.
- [x] 3.3 Confirm no new composited layer appears for the hero in DevTools' layer view.

→ verify: network panel shows five look requests with the same priorities as before; Lighthouse LCP element unchanged.

## 4. Cross-platform check

- [ ] 4.1 Verify on Safari/macOS.
- [ ] 4.2 Verify on Safari/iOS on a real device — the transition should be smooth and identically timed, with no stutter during the dissolve.
- [ ] 4.3 Verify on Chrome/Android.

→ verify: the transition looks and times the same on all three; note any divergence before archiving.

## 5. Fit the whole wardrobe on phones

- [x] 5.1 Change `.mobileLook` from the `cover` head-crop at `object-position: 50% 12%` to `object-fit: contain !important` at `50% 100%`, so the entire llama fits the media box bottom-flush.
- [x] 5.2 Delete the `@media (min-width: 600px) and (orientation: portrait)` block — it existed only to apply `contain` to portrait tablets and is now redundant.
- [x] 5.3 Confirm the media box dimensions are unchanged, so the reframing contributes no layout shift.

→ verify: measured at 360×640, 390×844 and 700×1000 — wardrobe visibility went 34% → 100%, box unchanged at 360×335.

## 6. Watch item

- [ ] 6.1 After ship, watch for the headline word snapping rather than sliding. With ~650 ms of slack between the 1950 ms slide and the 2600 ms interval, a long main-thread task can let a tick land mid-transition; waiting words sit at `translateY(120%)` with no transition and will jump. If observed, revisit the word duration (1100 ms was the evaluated alternative — see `design.md`).
