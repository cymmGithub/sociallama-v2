## 1. Asset prep (crop to pure screen content)

- [x] 1.1 Crop `services-ads.png` to the browser viewport content (drop baked window chrome + blue matte) → new asset in `public/assets/` (e.g. `services-ads-screen.png`); landscape, laptop-ratio.
- [x] 1.2 Crop `services-insights.png` to the phone screen content (drop baked iPhone bezel + white matte) → new asset; 9:19-ish portrait.
- [x] 1.3 Trim `services-ytstudio.png` to its UI canvas (remove any white margin) → new asset; ~4:3 tablet-ratio.
- [x] 1.4 Repo-wide reference check (`grep -r "services-"` outside the services section), then delete the orphaned originals: the six dashboard PNGs and the six replaced profile screenshots.

## 2. CONTENT tab — case-study collage

- [x] 2.1 In `lib/content/home.ts`, replace the CONTENT `panels` with the approved seven creatives (paths under `/case-studies/…`), real intrinsic dimensions, and client+campaign alt texts (source alts from `lib/payload/seed-case-studies.ts` where they exist).
- [x] 2.2 In `services.module.css`, add the `nth-child(7)` slot (position in the collage per the approved sketch: hero = `volvo-vcw-post` center) and a 620ms reveal delay; retune the six existing slots only as far as the new aspect ratios require.
- [x] 2.3 Confirm mobile keeps rendering only the first three panels (existing rule) and the first three chosen creatives make sense as that trio.

## 3. SPRZEDAŻ tab — three device frames

- [x] 3.1 Extend the stage data/types minimally so a panel can declare a device frame (`laptop` | `phone` | `tablet`), keeping the `panels` union shape; wire the three entries (laptop=Meta Ads, phone=IG Insights, tablet=YT Studio).
- [x] 3.2 In `services.module.css`, build the laptop and tablet CSS frames extending the `.phoneFrame` bezel vocabulary (dark bezel, radius, subtle deck/shadow for the laptop), and position the three devices on the stage replacing the six `data-stage="sprzedaz"` slots.
- [x] 3.3 In `sections/services/index.tsx`, render device-framed panels for entries carrying a device kind (reveal stagger preserved).
- [x] 3.4 Mobile: verify the sprzedaż stacked stage presents the three devices acceptably at small widths (scale or reduce to the phone+laptop pair if crowded — decide visually).

## 4. Verification

- [x] 4.1 Typecheck + Biome clean; no hardcoded copy in components (all strings from `home.ts`).
- [x] 4.2 Drive the homepage on :3002 with Playwright: screenshot each of the three tabs at desktop width — CONTENT shows 7 creatives with stagger, SPRZEDAŻ shows exactly three device-framed dashboards with no white mattes/bezels baked visible, KREACJE unchanged.
- [x] 4.3 Screenshot mobile width: stacked variant sane for both changed tabs (content = first three creatives).
- [x] 4.4 Reduced-motion spot check: static gradient, panels visible without animation.
