## 1. Snap rail CSS

- [ ] 1.1 In `why-that-works.module.css`, rework the mobile `.faces` rule: `grid-auto-flow: column` with explicit `grid-auto-columns` ≈ the current two-column tile width (~46vw), `overflow-x: auto`, `scroll-snap-type: x mandatory`, `overscroll-behavior-x: contain`, scrollbar hidden; add `scroll-snap-align: start` to `.tile` under the same media query. Desktop rules untouched; no component or JS changes.
- [ ] 1.2 Confirm the CTA tile (`.moreTile`) needs no mobile-specific spans/overrides now that the grid no longer wraps — it should simply be the last rail cell.
- [ ] 1.3 Run `bun run check`.

## 2. Verification

- [ ] 2.1 Playwright, mobile viewport (390px): team section is ~one tile tall with a partial tile peeking; programmatic horizontal scroll reaches the CTA tile past all 15 members in curated order; tiles snap-align after scroll settles.
- [ ] 2.2 Verify the settled reveal state leaves no clip/transform breaking the overflow container — screenshot the settled section, don't trust rect queries (wipe-clip lesson).
- [ ] 2.3 Tap a member tile in the rail and confirm it lands on `/o-nas?lama=<slug>#zespol` with that member featured; confirm a vertical drag over the rail scrolls the page.
- [ ] 2.4 Desktop viewport: four-column grid unchanged, no horizontal scrolling. Spot-check `/en` mobile renders the same rail.
- [ ] 2.5 Show mobile + desktop screenshots to the user for sign-off before any commit.
