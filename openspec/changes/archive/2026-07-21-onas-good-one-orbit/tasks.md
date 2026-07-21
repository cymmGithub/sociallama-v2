## 1. Assets

- [x] 1.1 Extract the 6 child logos + hub crop from `public/o-nas/good-one-wheel.png` (transparent background) and save under `public/o-nas/good-one/` (e.g. `hub.png`, `goodone-pr.png`, `sociallama.png`, `diea.png`, `tymkor.png`, `folks.png`, `seofly.png`)
- [x] 1.2 Keep `good-one-wheel.png` in place — it remains the mobile fallback

## 2. Desktop orbit component

- [x] 2.1 In `good-one/index.tsx`, add the positioned-DOM wheel for desktop: fixed center hub, dotted ring SVG track, 6 orange spoke dots, 6 child logos on the ring (drive the 6 from `oNasGoodOne.companies` in `lib/content/o-nas.ts`)
- [x] 2.2 In `good-one.module.css`, implement the perpetual co-rotation: ring (track + dots) and logos share one ~54s period + start phase; each logo counter-rotates to stay upright; animate a registered `@property` angle on the same element whose `transform` reads it; set `overflow: visible` on the ring SVG so edge dots aren't clipped
- [x] 2.3 Render the desktop orbit only at/above the desktop breakpoint; render the existing `<Image src="/o-nas/good-one-wheel.png">` below it (static, unchanged)

## 3. Motion safety

- [x] 3.1 Gate the orbit animation to in-view (IntersectionObserver or the existing `useReveal` pattern) so it doesn't animate offscreen
- [x] 3.2 Disable the orbit under `prefers-reduced-motion: reduce` (static presentation, no revolving elements)

## 4. Verify (dev server :3000, Playwright)

- [x] 4.1 Desktop 1440: logos revolve upright around the static hub; orange dots co-rotate on their spokes; no clipped dots; hub stationary
- [x] 4.2 Mobile 390: static PNG retained, no orbit, layout unchanged from today
- [x] 4.3 `prefers-reduced-motion`: no revolving motion; offscreen: animation not running
- [x] 4.4 Run Biome + TypeScript checks; confirm clean
