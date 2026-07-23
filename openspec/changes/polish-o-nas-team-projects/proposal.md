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

## Post-review adjustments (applied during implementation)

Two deviations from the original scope were directed by the client during visual review:

- **Homepage grid reordered to position-priority.** The `why-that-works` `TEAM` grid was originally treated as read-only. The client asked for a seniority/position order (leadership → managers → senior specialists → experts → specialist → creator), so the grid was reordered — Ania, Piotrek, Emilia, Paulina, Magda, Martyna, Agnieszka, Kornelia, Katarzyna, Oliwia, Karolina — and the slider was re-synced to match. It stays the single ordering source of truth.
- **Two members temporarily excluded from the slider.** **Paulina Hildebrand** and **Katarzyna Kaptur** are commented out of `oNasTeam.members` in both locales (parity preserved, 9 shown). Reason: their only source photos are low-resolution square crops that can't be cut out to match the front-facing head+torso set (an outpaint-based torso extension for Katarzyna was tried and rejected on quality). They still appear in the homepage grid and are re-enabled once proper photos arrive. Their slider PNGs stay committed under `public/o-nas/slider/`, referenced by the commented entries.

- **Final order (client-directed).** Ania → the two Senior Social Media Specialists (Martyna, Agnieszka) → Piotrek → Managers (Emilia, Paulina, Magda) → Experts (Kornelia, Katarzyna) → Oliwia → Karolina. Applied to the homepage grid and mirrored into the slider (minus the two excluded members).

- **`homepage-team-grid` redesign (BREAKING — homepage `why-that-works`).** The homepage team grid was redesigned from circular medallions (`/assets/team/*.webp`, decorative cut-outs on a pink radial) to **full-bleed portrait tiles**: each tile is a plum→orange gradient container filled by the member's transparent head+torso cutout (the same `/o-nas/slider/*.png` set), with a standing name + role label always visible (the old hover/tap-to-reveal + pop-out interaction was removed). A `Dowiedz się więcej` **CTA card** fills the 12th slot and links to the `/o-nas#zespol` slider; the "POZNAJ NASZE DOŚWIADCZENIE" link was repointed from `/o-nas` to `/case-studies`; the two credential chips moved out from inside the plum stage to sit under that link (the "Certyfikaty" label was dropped). New content: `whyThatWorks.teamCta` in `home.ts` / `home.en.ts`. This makes the homepage a **Modified Capability** of this change (originally declared read-only).

- **Cross-page hash-scroll fix (`components/layout/scroll-reset`).** The team CTA card exposed a latent bug: `ScrollReset` bailed on any hash, so cross-page anchor navigation (`/o-nas#zespol`) landed at the top instead of the target. It now scrolls to the hash element (deferred one frame, via Lenis) when the pathname changes with a hash present; same-page anchors are unaffected (they don't change `pathname`). Benefits every cross-page `#anchor` link, not just this one.
