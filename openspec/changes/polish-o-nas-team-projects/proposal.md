## Why

The `/o-nas` page ships with placeholder content: the "NASZE LAMY" team slider carries only 3 members with `LOREM` bios, and the "Zrealizowane projekty" section shows three `NAZWA PROJEKTU` stubs with no images or links. Real bios, photos, and case-study data now exist, so the page can go from scaffold to launch-ready.

## What Changes

- **Team slider 3 → 11.** Expand `oNasTeam.members` to the full Social Lama roster, ordered exactly like the homepage `why-that-works` grid (leadership-first). Replace all `LOREM` bios with real copy from the client bio doc; the 3 existing members (Ania Ozga, Piotrek Zach, Karolina Marcinowska) lose their placeholder bios too.
- **8 new portrait cutouts.** Background-remove, optimize, and crop-match 8 raw photos to transparent PNGs under `/public/o-nas/slider/`, consistent with the 3 existing cutouts' framing and ~300 KB weight.
- **Projects → case studies.** Fill the three "Zrealizowane projekty" cards with iRobot, Pracuj.pl, and Volvo — each with a real hero image and a link to its `/case-studies/<slug>` detail page. **BREAKING** (content shape): `oNasProjects.items` gains `image` (real path) and `href` fields; the `Projects` component is updated to render the image and wrap each card in a link.
- **EN parity.** Mirror every change in `o-nas.en.ts`: 11 translated bios, English project copy, and `/en/case-studies/<slug>` hrefs, keeping the `satisfies LocalizedONas` shapes identical.
- **Role reconciliation.** Where the bio doc and the site disagree, use the site's wording ("Head of Social Media" not "Head of Social Lama"; "Wideo Content Creator" not "Content Creator").

## Capabilities

### New Capabilities
- `onas-team`: The `/o-nas` team slider — roster membership, presentation order (mirrors the homepage grid), per-member bio/role/photo content, and the transparent-cutout asset requirements.
- `onas-projects`: The `/o-nas` "Zrealizowane projekty" section — the three featured case studies, their card content (name/year/client/image), and navigation to the case-study detail pages.

### Modified Capabilities
<!-- None. The homepage `why-that-works` grid is read-only here (used as the ordering source of truth); `case-studies` detail pages are linked to, not modified. -->

## Impact

- **Content**: `lib/content/o-nas.ts`, `lib/content/o-nas.en.ts` (both shape and copy).
- **Component**: `app/(frontend)/o-nas/sections/projects/index.tsx` (render real image, add card link). The team slider component is unchanged — it renders whatever `members` contains.
- **Assets**: 8 new PNGs in `public/o-nas/slider/`; source raws from the client photo drop.
- **Ordering source of truth**: `app/(frontend)/(home)/sections/why-that-works/index.tsx` `TEAM` array (read-only reference).
- **Ops**: new git worktree `sl-onas-polish` on port `:3001`, Docker Postgres `:5434` (Payload boot only — no case-study seed needed since projects are static content).
- **CI**: Biome + TypeScript must stay green; the `LocalizedONas` parity types enforce PL/EN shape equality.
