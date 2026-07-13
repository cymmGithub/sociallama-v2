# Tasks: services-autoplay-tabs

## 1. Assets

- [x] 1.1 Copy the three screenshots (`/mem/insta.png`, `/mem/tiktok.png`, `/mem/linkedin.png`) into `public/` under the project's asset convention, losslessly optimized; verify dimensions/weight
- [x] 1.2 Transcode `~/Downloads/copy_8F341DF7-47AF-4BD5-A529-6C7ED3D249E4.mov` (HEVC 1080×1920, 18.4s, 42 MB) → H.264 MP4 ~720×1280 `faststart`, trimmed to a tight ~10s loop, target ≤3 MB; extract a poster frame; verify by playing the output
- [x] 1.3 Delete `public/clips/service-*` legacy clips and posters (after nothing references them — coordinate with 3.x)

## 2. Content model

- [x] 2.1 In `lib/content/home.ts`, replace service `poster`/`clip` fields with the typed `stage` union (`panels` / `video` / `placeholder`) and point Content/Kreacje/Sprzedaż at the new assets; update the `Service` type
- [x] 2.2 Trim the three service bodies to one short sentence each (~20 words, Polish), preserving the original long-form texts in the content module for future `/uslugi/*` pages; confirm the trimmed copy with the user

## 3. Stage and background

- [x] 3.1 Build the grain-gradient stage background: plum→orange base gradient, 2–3 blurred drifting blobs (CSS transform keyframes, ~20–30s), static SVG `feTurbulence` grain overlay (`soft-light`, opacity ~0.3–0.4) covering the whole stage above panels; static variant for reduced motion/mobile
- [x] 3.2 Implement the three stage media renderers from the `stage` union: floating screenshot panels (rounded, shadowed, per-panel positions, staggered entrance on activation), phone-framed 9:16 `Video` with `autoPlay` bound to active tab, and the styled placeholder state
- [x] 3.3 Verify grain legibility over screenshot text at 100% zoom and tune opacity

## 4. Tab engine

- [x] 4.1 Rewrite `app/(home)/sections/services/` as the autoplay-tabs component: shared stage (stacked layers, ~0.3s crossfade) + three tab columns with full-column `<button>`s, `aria-expanded`/`aria-controls`, ~6s dwell auto-advance with wrap, linear progress bars, click-to-switch restarting the cycle
- [x] 4.2 Add IntersectionObserver pause/resume: off-screen stops the timer and freezes progress (`animation-play-state`), re-entry resumes from the paused fill
- [x] 4.3 Implement reduced-motion behavior: static gradient, instant switches, autoplay off (first tab open), progress bars rendered full
- [x] 4.4 Implement the mobile stacked fallback: all three services open (title + body + media), static gradient, no timers/progress bars, video on standard in-viewport playback

## 5. Verification

- [x] 5.1 Screenshot-sample the section on the dev server (:3000): each tab's stage, mid-crossfade, progress bar states, mobile emulation, reduced-motion emulation
- [x] 5.2 Verify the full loop timing by watching one complete cycle (auto-advance, wrap, off-screen pause/resume, click-to-switch restart)
- [x] 5.3 Keyboard/AT pass on the tab buttons (Tab + Enter/Space, `aria-expanded` updates); run Biome + TypeScript checks
- [x] 5.4 Confirm no references to deleted `service-*` clips remain (grep) and the page has no console errors

## 6. Follow-up assets (user request, 2026-07-13)

- [x] 6.1 Transcode the second Kreacje clip (DPD event `.mov`, 36.5s → 12s, H.264 600×1066, 2.3 MB) + poster; extend the `video` stage kind to a clips array rendered as paired tilted phone frames
- [x] 6.2 Add the real X profile screenshot as a fourth Content panel
- [x] 6.3 Generate Pinterest + YouTube brand panels with Higgsfield (nano-banana, real screenshots as identity references) and add as Content panels 5–6; six-slot desktop collage layout, mobile capped at three panels
- [x] 6.4 Regenerate the Pinterest panel with explicit Polish pin titles (fixes gibberish headlines)
- [x] 6.5 Replace the Sprzedaż placeholder with three generated results dashboards (Meta Ads Manager, Instagram Insights, YouTube Studio) laid out via per-count panel geometry (`data-count` overrides for 2- and 3-panel stages)
- [x] 6.6 Add a generated X Analytics dashboard as the fourth Sprzedaż panel (`data-count="4"` geometry)
- [x] 6.7 Per-tab dwell override (`dwellMs`): KREACJE I WIDEO holds 11s (default 6s) so the clips get watch time
- [x] 6.8 Add a generated TikTok Studio analytics dashboard as the fifth Sprzedaż panel (`data-count="5"` symmetric geometry)
- [x] 6.9 Add a generated LinkedIn Analytics dashboard as the sixth Sprzedaż panel; re-key Sprzedaż panel geometry by stage id (`data-stage="sprzedaz"`) since Content shares the six-panel count
- [x] 6.10 Fill "WHY" in the why-that-works heading to ink instead of plum (user decision, 2026-07-13)
