## Why

The homepage team grid shows twelve members but offers no path from a member's
tile to their full profile (bio, certificates, personal link) on `/o-nas`. The
slider there always opens on the first member, so even a curious visitor has to
step through the roster manually. A per-tile "WIĘCEJ" link that lands on the
slider with that member already featured closes the loop between the two team
surfaces — and replaces the orphaned `teamCta` content key that was designed for
exactly this jump but never rendered.

## What Changes

- Each homepage team tile gains a discrete "WIĘCEJ" link (lucide arrow, not a
  glyph) below the existing name + role caption. Captions stay always visible
  exactly as today; only the link is hover/focus-revealed on desktop and always
  visible on touch devices (no hover exists there).
- The link targets `/o-nas?lama=<slug>#zespol` (EN: `/en/about-us?lama=<slug>#zespol`),
  where `<slug>` is the shared cutout filename (e.g. `martyna-borowik`).
  Matching is by slug, never by index — the two surfaces deliberately disagree
  on order (see `onas-team` spec: "Position-priority order with a curated
  slider deviation").
- The `/o-nas` team slider reads `?lama=` and opens with that member featured;
  the page scrolls to the `#zespol` section. Unknown or absent slugs fall back
  to the current behavior (first member, no scroll).
- New copy keys in `lib/content/home.ts` / `home.en.ts` for the link label and
  locale-aware base href; the unused `teamCta` key is removed from both locales.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `onas-team`: two requirement-level additions — (1) homepage tiles link to the
  member's slider profile via a slug-keyed deep link, (2) the slider honors the
  `?lama=` param for its initial featured member and degrades gracefully for
  unknown slugs.

## Impact

- `app/(frontend)/(home)/sections/why-that-works/index.tsx` + its CSS module —
  tile link, hover/focus reveal, slug already present as `cut` filename.
- `app/(frontend)/o-nas/sections/team/index.tsx` — read `?lama=` via
  `useSearchParams` (needs a Suspense boundary in `o-nas/page.tsx` and the EN
  about-us page), effect keyed on the param value (Next 16 Activity can keep
  the page mounted across navigations), explicit Lenis scroll to `#zespol`
  (cross-page hash navigation has plausibly never worked — the hash alone
  likely loses to the scroll-to-top-on-navigation reset).
- `lib/content/home.ts`, `lib/content/home.en.ts` — new link copy/href keys,
  `teamCta` removal.
- No schema/DB changes; no new routes; shared dev DB unaffected.
