## 1. Collapse the scroll track

- [x] 1.1 In `hero.module.css`, replace `.track`/`.sticky` with a single `.column` class: `min-height: 100svh; display: flex; flex-direction: column` — no runway height, no `position: sticky`, and delete the three runway-collapse media queries (mobile / touch-only / reduced-motion) that no longer have a runway to collapse
- [x] 1.2 In `page.tsx`, replace `<HeroTrack>` with `<div className={s.column}>` (import `hero.module.css`), keeping Hero + ClientLogos grouped as one Chapters child; update the chapter-1 comment
- [x] 1.3 Delete `app/(frontend)/(home)/sections/hero/track.tsx` and remove its `useScrollTrigger`/context usages; verify nothing else imports `HeroTrack` or `useHeroScrubTarget` besides the hero files touched in section 2

## 2. Time-driven one-shot montage

- [x] 2.1 In `frame-sequence.tsx`, drop `useHeroScrubTarget`; add a start gate that resolves when all 60 frames have decoded (`Promise.all(imgs.map(i => i.decode()))`) AND ≥0.3s has passed since mount, then records the clock baseline
- [x] 2.2 Replace the scrub read in the `useTempus` callback with the elapsed-time clock (`idx = min(59, floor(elapsed / 2500 * 60))`), keeping the redraw-on-change + clearRect logic; stop advancing (and skip further work) once frame 59 has drawn
- [x] 2.3 Keep the immediate frame-0 paint on first decode so the pre-start hold matches the SSR poster

## 3. Timer-based rotator

- [x] 3.1 In hero `index.tsx`, delete `WORD_BOUNDS`, `wordIndexForProgress`, the scrub-watcher effect, `wordIndexRef`, and the local rotation state; call `useRotator(hero.headline.rotator.length)` and attach its observer ref to the headline element (alongside the existing `headlineRef` — merge or nest refs as needed)
- [x] 3.2 Confirm the rotator markup consumes the hook's `{index, prev}` unchanged (active/leaving classes, stable `aria-label`), and that word 0 renders statically under reduced motion and pre-hydration

## 4. Verification

- [x] 4.1 `bun run lint` (with `--diagnostic-level=error` filter for the known Biome panics) and `bunx tsc --noEmit` pass
- [x] 4.2 Playwright desktop pass on the running dev server: montage plays once ~0.3s after load and holds the final pose; words cycle every ~2.6s independently and keep cycling after the montage ends; scrolling never moves playback
- [x] 4.3 Verify normal flow: no dead scroll after the hero, chapter 2 arrives directly after the belt, and the plum→cream chapter-background morph still reads correctly as the hero scrolls away (screenshot the transition band; flag to user if it regressed)
- [x] 4.4 Mobile viewport + reduced-motion checks: static poster, no frame fetches (network tab), no montage; note for user review that mobile/tablet now show rotating words (design D5)
- [x] 4.5 Client-nav regression (Next 16 Activity cache): navigate to /kontakt and back — headline visible (no GSAP poison), montage does not replay, no console errors

## 5. Burst-sync rework (option 1, decided 2026-07-22)

- [x] 5.1 In `frame-sequence.tsx`, add a `wordIndex` prop and the outfit segment table (0-based last frames: 14, 28, 41, 47, 59); on first-pass index advance set the burst target + baseline, mark done permanently when the index wraps lower or segment 4 completes
- [x] 5.2 Rework the `useTempus` callback: advance from the burst baseline at 24fps toward the segment target (clamped), idle on held frames between bursts; keep redraw-on-change + clearRect
- [x] 5.3 Keep the decode + 0.3s gate for burst 0 (word 0 is active from SSR, so burst 0 fires once the gate opens)
- [x] 5.4 In hero `index.tsx`, pass `rotation.index` to `<HeroFrames>`
- [x] 5.5 `bunx tsc --noEmit` + Biome clean; Playwright: word flips and outfit bursts coincide across the full first pass (~11s), llama holds final pose while words wrap and keep cycling, scroll never moves playback, client-nav back does not replay

## 6. Independent cycles — final revert (user decision 2026-07-22: sync rejected as flaky)

- [x] 6.1 Revert `frame-sequence.tsx` to the section-2 engine (elapsed-time clock, no word coupling) and `index.tsx` to plain `useRotator`; revert the `ROTATOR_INTERVAL` export in `use-rotator.ts`
- [x] 6.2 Update proposal/design/specs to record independent cycles as final, with the rejected sync prototypes noted in design Non-Goals
- [x] 6.3 `bunx tsc --noEmit` + Biome clean; Playwright: montage plays once smoothly (~2.5s) and settles on frame 60; words cycle every ~2.6s independently before, during, and after; client-nav back does not replay
