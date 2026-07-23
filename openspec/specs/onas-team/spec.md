# onas-team Specification

## Purpose
The `/o-nas` "NASZE LAMY" team slider and its relationship to the homepage `why-that-works` team grid: who appears, in what order, with what bio, role, and portrait cutout, in both locales.

## Requirements
### Requirement: Both surfaces carry the same roster

The `/o-nas` team slider and the homepage `why-that-works` `TEAM` grid SHALL present the same 12 people, with no member appearing on one surface and not the other. Membership parity is normative; presentation order is not identical between the two (see the order requirement).

#### Scenario: Roster parity across surfaces

- **WHEN** `oNasTeam.members` is compared to the homepage `TEAM` array
- **THEN** both contain the same 12 people — Ania Ozga, Martyna Borowik, Agnieszka Klajbert, Piotrek Zach, Emilia Metryka, Paulina Hildebrand, Magda Rokicka, Kornelia Orlik, Katarzyna Kaptur, Oliwia Witewska, Karolina Marcinowska, Przemysław Świercz — with none omitted from either

### Requirement: Position-priority order with a curated slider deviation

The homepage grid SHALL order the roster by position seniority — Head of Social Media, then the Senior Social Media Specialists, then Project Manager, Social Media Managers, Social Media Experts, Social Media Specialist, Wideo Content Creator, Fullstack Developer. The slider SHALL follow that same order, except where a placement is deliberately curated for the slider's featured-member presentation. The current curated deviation is **Martyna Borowik moved to second-to-last in the slider** while remaining second in the grid.

#### Scenario: Homepage grid order

- **WHEN** the homepage `why-that-works` grid renders
- **THEN** members appear in this order — Ania Ozga, Martyna Borowik, Agnieszka Klajbert, Piotrek Zach, Emilia Metryka, Paulina Hildebrand, Magda Rokicka, Kornelia Orlik, Katarzyna Kaptur, Oliwia Witewska, Karolina Marcinowska, Przemysław Świercz

#### Scenario: Slider order

- **WHEN** the `/o-nas` page renders the team slider
- **THEN** members appear in this order — Ania Ozga, Agnieszka Klajbert, Piotrek Zach, Emilia Metryka, Paulina Hildebrand, Magda Rokicka, Kornelia Orlik, Katarzyna Kaptur, Oliwia Witewska, Karolina Marcinowska, Martyna Borowik, Przemysław Świercz — i.e. the grid order with Martyna Borowik moved down to second-to-last, ahead of Przemysław Świercz

#### Scenario: Deviations are deliberate, not drift

- **WHEN** the slider order differs from the grid order
- **THEN** the difference is limited to curated placements recorded in this spec, and every other member holds the same relative position on both surfaces

### Requirement: Every member carries real bio, role, and photo content

Each member entry SHALL provide a non-placeholder `bio`, a `role`, a `given`/`surname` name pair, and a `photo` path. No member may retain `LOREM` bio text. Where the source bio doc and the site disagree on a role label, the site's wording is authoritative ("Head of Social Media", "Wideo Content Creator").

#### Scenario: No placeholder bios remain

- **WHEN** `oNasTeam.members` is inspected
- **THEN** no member's `bio` equals the shared `LOREM` constant, and every `bio` is drawn from the client bio doc

#### Scenario: Role labels reconcile to the site

- **WHEN** a bio doc role differs from the homepage grid role for the same person
- **THEN** the slider uses the homepage grid's role label

### Requirement: Every member has a transparent, crop-matched portrait cutout

All 12 members SHALL have a transparent-background PNG cutout under `/public/o-nas/slider/`, consistent in framing (head+torso crop, orientation) and comparable in file weight (~300 KB target, optimized). The same cutouts fill the homepage grid's full-bleed portrait tiles, so a framing defect is visible on both surfaces.

#### Scenario: Cutouts exist and are transparent PNGs

- **WHEN** the slider or the homepage grid references a member's cutout
- **THEN** the file exists under `/public/o-nas/slider/`, is a PNG with an alpha channel, and its background is removed

#### Scenario: Framing is consistent across the roster

- **WHEN** all 12 cutouts are viewed together
- **THEN** crop, scale, and orientation read as one consistent set, with no member visibly mis-scaled or differently framed

#### Scenario: No member is excluded for missing artwork

- **WHEN** the slider renders
- **THEN** all 12 members are present — no member is commented out or skipped pending a usable photo

### Requirement: EN locale mirrors the team content

`o-nas.en.ts` SHALL carry the same 12 members in the same slider order with English bios, satisfying the `LocalizedONas` shape so PL and EN stay structurally identical.

#### Scenario: EN roster parity

- **WHEN** `o-nas.en.ts` `oNasTeam.members` is compared to the PL version
- **THEN** it has the same 12 members in the same order, each with a translated (non-`LOREM`) bio, and TypeScript compiles under `satisfies LocalizedONas`
