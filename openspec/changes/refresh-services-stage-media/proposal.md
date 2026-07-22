## Why

Two of the three Usługi stage tabs undercut the section's job (proof of work):

- **CONTENT** shows six screenshots of Social Lama's *own* profiles — self-referential ("here are our accounts") instead of evidential ("here's work we did for clients"). Meanwhile 21 real case-study creatives (Volvo, Pracuj.pl, iRobot) already sit in `public/case-studies/`, full-bleed and collage-ready, and stay on brand with the case-studies pages they echo.
- **SPRZEDAŻ** floats six AI-generated dashboard images that are visually inconsistent: two arrive with *baked-in* device mockups (Meta Ads inside a browser window on a light-blue matte; IG Insights inside an iPhone render on white) while four are raw white-canvas screenshots. The baked mattes read as white/blue rectangles stranded on the plum→orange gradient — the "white background that's part of the image" problem.

## What Changes

- **CONTENT tab → 7-creative case-study collage.** The six profile panels are replaced by seven client creatives (2026-07-22 selection, approved): `volvo-vcw-post` (hero slot), `pracuj-pl-humor-cat`, `irobot-gallery-1`, `volvo-event-ex30`, `irobot-gallery-4` (landscape), `pracuj-pl-ar-creator`, `volvo-vcw-goracy`. A seventh panel slot is added to the collage CSS (position + 620ms reveal delay); existing mobile behavior (only the first three render) is preserved. Alt texts describe client + campaign, sourced from the seed data's gallery alts.
- **SPRZEDAŻ tab → 3 device-framed dashboards** (approved: fewer-but-bigger over re-framing all six):
  - **Laptop** (new CSS frame) — Meta Ads Manager
  - **Phone** (existing `.phoneFrame` vocabulary) — Instagram Insights
  - **Tablet** (new CSS frame) — YouTube Studio (chosen as most visually distinct; swappable at apply time)
  The other three dashboards (X Analytics, TikTok Studio, LinkedIn Analytics) are dropped from the stage.
- **Strip baked backgrounds by cropping to pure screen content.** New assets are cropped from the current files: the Meta Ads image loses its baked browser chrome + blue matte, IG Insights loses its baked iPhone bezel + white matte, YouTube Studio is trimmed to its UI canvas. Device presentation then comes exclusively from the CSS frames — no mockup-inside-a-mockup, no white rectangles on the gradient.
- **Orphaned assets deleted.** The replaced/unused `services-*` images are removed from `public/assets/` (mirroring the promoted spec's own "legacy assets deleted" convention), after verifying nothing else references them.

Explicitly **out of scope** (see Non-Goals): the KREACJE I WIDEO tab, tab/autoplay mechanics, regenerating the AI dashboards' content.

## Capabilities

### Modified Capabilities

- `services-autoplay-tabs`: The CONTENT stage presents seven case-study creatives (client work) instead of six own-profile screenshots; the SPRZEDAŻ stage presents three dashboards inside CSS-built device frames (laptop / phone / tablet) instead of six flat panels; stage assets are cropped to pure screen content with no baked mattes, chrome, or bezels.

## Non-Goals

- **No KREACJE I WIDEO changes.** The video tab, its clips, and the iRobot placeholder are untouched.
- **No tab-machinery changes.** Autoplay loop, dwell times, progress bars, a11y semantics, reduced-motion behavior — all unchanged.
- **No dashboard content regeneration.** The AI-generated dashboards contain gibberish micro-copy (e.g. "Notificazyyvi"); larger device frames make text slightly more readable, but regenerating those images is a separate decision. Flagged, not fixed here.
- **No case-studies page changes.** Creatives are read from `public/case-studies/` as-is.

## Impact

- **Modified code**:
  - `lib/content/home.ts` — CONTENT `panels` (7 creatives + alts), SPRZEDAŻ stage data (3 device-framed entries; may need a small `StagePanel` extension for a `device` variant).
  - `app/(frontend)/(home)/sections/services/services.module.css` — 7th content slot + stagger delay; laptop/tablet CSS frames (extending the `.phoneFrame` vocabulary); new 3-device sprzedaż positions replacing the six `data-stage="sprzedaz"` slots.
  - `app/(frontend)/(home)/sections/services/index.tsx` — render device-framed panels for the sprzedaż stage kind (small; reuses the existing typed-union pattern).
- **New assets**: cropped screen-content versions of Meta Ads, IG Insights, YouTube Studio (in `public/assets/`).
- **Deleted assets**: the six current `services-*` dashboard files plus the six replaced profile screenshots, after a repo-wide reference check.
- **Reused**: existing panel/reveal vocabulary, `.phoneFrame` pattern, `Image` primitive, case-study creatives already in `public/`.
- **No schema, query, or dependency changes.**
- **Sequencing/conflict note**: `lib/content/home.ts` is also uncommitted-modified in the open `sl-hero-montage` worktree (hero region, ~line 235–260; services region is ~429–560) — the eventual git conflict is trivial but expected (approved 2026-07-22 to run parallel). Worktree `sl-services-media` on PORT 3002.
- **Verification note**: screenshot each tab on :3002 (desktop + mobile widths); confirm no white mattes remain visible, 7 creatives render with stagger, the three device frames hold their dashboards at correct aspect, and mobile still shows first-three content panels.
