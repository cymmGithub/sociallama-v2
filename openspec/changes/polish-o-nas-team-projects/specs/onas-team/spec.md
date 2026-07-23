## ADDED Requirements

### Requirement: Team slider carries the roster in position-priority order

The `/o-nas` "NASZE LAMY" team slider SHALL present the Social Lama roster in the same order as the homepage `why-that-works` `TEAM` grid. The order is normative and MUST NOT diverge from the homepage grid.

> **Note (post-review, applied during implementation):** During review the client directed a **position-priority** ordering (leadership → managers → senior specialists → experts → specialist → creator), so the homepage `TEAM` grid was reordered accordingly — it is no longer read-only, but it remains the single source of truth the slider mirrors. Two members (**Paulina Hildebrand**, **Katarzyna Kaptur**) are **temporarily excluded from the slider** (commented out in both locales) because their only source photos are low-resolution square crops that cannot be cut out to match the front-facing head+torso set. They remain in the homepage medallion grid (decorative WebP, unaffected) and are re-enabled once proper photos are supplied.

#### Scenario: Order is position-priority and matches the homepage grid

- **WHEN** the `/o-nas` page renders the team slider
- **THEN** the members appear in this order — Ania Ozga, Piotrek Zach, Emilia Metryka, Paulina Hildebrand, Magda Rokicka, Martyna Borowik, Agnieszka Klajbert, Kornelia Orlik, Katarzyna Kaptur, Oliwia Witewska, Karolina Marcinowska — with Paulina Hildebrand and Katarzyna Kaptur omitted while their photos are pending (9 shown)

#### Scenario: Order matches the homepage grid

- **WHEN** the homepage `why-that-works` `TEAM` array order is compared to `oNasTeam.members`
- **THEN** the active members appear in the same relative order (the homepage grid additionally carries the two photo-pending members)

### Requirement: Every member carries real bio, role, and photo content

Each member entry SHALL provide a non-placeholder `bio`, a `role`, a `given`/`surname` name pair, and a `photo` path. No member may retain `LOREM` bio text. Where the source bio doc and the site disagree on a role label, the site's wording is authoritative ("Head of Social Media", "Wideo Content Creator").

#### Scenario: No placeholder bios remain

- **WHEN** `oNasTeam.members` is inspected
- **THEN** no member's `bio` equals the shared `LOREM` constant, and every `bio` is drawn from the client bio doc

#### Scenario: Role labels reconcile to the site

- **WHEN** a bio doc role differs from the homepage grid role for the same person
- **THEN** the slider uses the homepage grid's role label

### Requirement: New members have transparent, crop-matched portrait cutouts

The 8 newly added members SHALL each have a transparent-background PNG cutout under `/public/o-nas/slider/`, visually consistent with the 3 pre-existing cutouts in framing (head+torso crop, orientation) and comparable in file weight (~300 KB target, optimized).

#### Scenario: Cutouts exist and are transparent PNGs

- **WHEN** the slider references a new member's `photo`
- **THEN** the file exists at `/public/o-nas/slider/<name>.png`, is a PNG with an alpha channel, and its background is removed

#### Scenario: Framing is consistent across the roster

- **WHEN** all 11 cutouts are viewed together in the slider on `:3001`
- **THEN** crop, scale, and orientation read as one consistent set (no member visibly mis-scaled or differently framed)

### Requirement: EN locale mirrors the team content

`o-nas.en.ts` SHALL carry the same 11 members in the same order with English bios, satisfying the `LocalizedONas` shape so PL and EN stay structurally identical.

#### Scenario: EN roster parity

- **WHEN** `o-nas.en.ts` `oNasTeam.members` is compared to the PL version
- **THEN** it has the same members in the same order, each with a translated (non-`LOREM`) bio, and TypeScript compiles under `satisfies LocalizedONas`
