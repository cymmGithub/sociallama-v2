## ADDED Requirements

### Requirement: Team slider carries the full roster in leadership order

The `/o-nas` "NASZE LAMY" team slider SHALL present every member of the Social Lama roster, in the same order as the homepage `why-that-works` `TEAM` grid (leadership-first). The order is normative and MUST NOT diverge from the homepage grid.

#### Scenario: Roster is complete and ordered

- **WHEN** the `/o-nas` page renders the team slider
- **THEN** it shows all 11 members in this order: Ania Ozga, Piotrek Zach, Emilia Metryka, Paulina Hildebrand, Magda Rokicka, Karolina Marcinowska, Oliwia Witewska, Martyna Borowik, Kornelia Orlik, Katarzyna Kaptur, Agnieszka Klajbert

#### Scenario: Order matches the homepage grid

- **WHEN** the homepage `why-that-works` `TEAM` array order is compared to `oNasTeam.members`
- **THEN** the two sequences of members are identical

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
