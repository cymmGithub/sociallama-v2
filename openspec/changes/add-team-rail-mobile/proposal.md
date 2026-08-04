## Why

The roster refresh (refine-team-roster, merged 2026-08-04) grew the homepage team grid to 15 members plus a CTA tile. On mobile's two-column layout that is 8 rows of 4:5 portrait tiles — roughly eight viewport-heights of scrolling faces mid-homepage. Desktop's four-column grid reads fine and stays as is.

## What Changes

- On mobile viewports only, the `why-that-works` team grid becomes a single-row **horizontal scroll-snap rail**: `overflow-x` + `scroll-snap` on the existing `.faces` list, explicit tile width near the current two-column width so a partial next tile peeks at the viewport edge as the swipe affordance. CSS-only — no new component, no JS.
- All 16 cells stay present and reachable by swiping: the 15 members in the client-curated order, the CTA tile last. Captions and per-member `?lama=<slug>#zespol` deep links are untouched.
- Desktop keeps the four-column grid; the `/o-nas` slider is untouched on every viewport.
- Rejected alternative, for the record: reusing the `/o-nas` Team slider on the homepage. It would drag profile-depth content (bio, certs, plum-band presentation, `?lama=` consumption, a duplicate `#zespol` id under Next's Activity cache) onto the homepage to show one member at a time — inverting the section's "evidence by mass" job. The swipe mechanic alone is free in CSS.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `onas-team`: the homepage grid's mobile presentation changes from a two-column vertical grid to a single-row scroll-snap rail; membership, order, captions, and deep links are unchanged. Note: the unarchived `refine-team-roster` change also carries an `onas-team` delta — archive that change first so this delta applies on top of the 15-member curated-order baseline.

## Impact

- `app/(frontend)/(home)/sections/why-that-works/why-that-works.module.css` — the mobile `.faces` rule and tile sizing; desktop rules untouched.
- `app/(frontend)/(home)/sections/why-that-works/index.tsx` — likely no change; the `mobileSize="46vw"` image hint stays honest only if the rail tile width stays ≈46vw.
- Both locales pick the rail up automatically — the EN homepage renders the same component.
- The section sits inside a reveal group (`.stage` is a `data-reveal-item`); the settled reveal state must not leave a clip/transform that breaks the overflow container.
