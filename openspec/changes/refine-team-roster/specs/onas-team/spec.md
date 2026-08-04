## MODIFIED Requirements

### Requirement: Both surfaces carry the same roster

The `/o-nas` team slider and the homepage `why-that-works` `TEAM` grid SHALL present the same 15 people, with no member appearing on one surface and not the other. Membership parity is normative. Both surfaces SHALL also spell each person's name the same way — a name that differs between surfaces is a defect, not a presentational choice.

#### Scenario: Roster parity across surfaces

- **WHEN** `oNasTeam.members` is compared to the homepage `TEAM` array
- **THEN** both contain the same 15 people — Anna Ozga, Kamil Mazuruk, Robert Sawicki, Emilia Metryka, Paulina Hildebrand, Magda Rokicka, Piotrek Zach, Agnieszka Klajbert, Katarzyna Kaptur, Oliwia Witewska, Karolina Marcinowska, Wojtek Sochaczyński, Aleksander Dymiński, Iza Harmoza-Sochoń, Przemysław Świercz — with none omitted from either

#### Scenario: Names agree across surfaces

- **WHEN** the same person is named on the slider and in the homepage grid
- **THEN** the given name matches — in particular Anna Ozga is "Anna" on both, not "Ania" on one, and the new members are "Wojtek Sochaczyński" and "Aleksander Dymiński" on both

### Requirement: Every member carries real bio, role, and photo content

Each member entry SHALL provide a non-placeholder `bio`, a `role`, a `given`/`surname` name pair, and a `photo` path. No member may retain `LOREM` bio text. Where the source bio doc and the site disagree on a role label, the site's wording is authoritative ("Head of Social Media", "Wideo Content Creator").

Bios for members covered by the client bio document SHALL carry that document's substance rather than a trimmed abstract of it. Members without client-supplied bio material (Wojtek Sochaczyński, Aleksander Dymiński) SHALL carry craft-focused bios that state no fabricated employers, client names, year counts, or credentials. All bios SHALL fall in a consistent length band across the roster. The band is normative because the slider's text column takes its height from the incoming member while the outgoing one overlays it absolutely: bios of wildly different lengths make the column jump between steps.

Bios SHALL be written in the third person throughout. The source document mixes first and third person between members, and a slider that switches voice mid-roster reads as unedited.

#### Scenario: No placeholder bios remain

- **WHEN** `oNasTeam.members` is inspected
- **THEN** no member's `bio` equals the shared `LOREM` constant, and every `bio` is either drawn from the client bio doc or is approved craft-focused copy

#### Scenario: New members' bios invent no facts

- **WHEN** Wojtek Sochaczyński's or Aleksander Dymiński's bio is read
- **THEN** it names no employer, client, year count, or credential that the client did not supply

#### Scenario: Role labels reconcile to the site

- **WHEN** a bio doc role differs from the homepage grid role for the same person
- **THEN** the slider uses the homepage grid's role label — and the new members carry "Senior Videographer" (Wojtek Sochaczyński) and "Videographer" (Aleksander Dymiński) on both surfaces

#### Scenario: Bios sit in a consistent band

- **WHEN** the bios of all 15 members are measured
- **THEN** they fall in one length band, with no member carrying a bio several times another's length

#### Scenario: One voice across the roster

- **WHEN** any member's bio is read
- **THEN** it is in the third person, including for members whose source text was written in the first person

#### Scenario: Stepping the slider does not jump the layout

- **WHEN** the visitor steps from the shortest-bio member to the longest-bio member
- **THEN** the text column does not visibly jump or reflow mid-crossfade

### Requirement: Every member has a transparent, crop-matched portrait cutout

All 15 members SHALL have a transparent-background PNG cutout under `/public/o-nas/slider/`, consistent in framing (head+torso crop, orientation) and comparable in file weight (~300 KB target, optimized). The same cutouts fill the homepage grid's full-bleed portrait tiles, so a framing defect is visible on both surfaces. Robert Sawicki's cutout SHALL be produced from the client's 2026-08 replacement photo, under the existing `robert-sawicki.png` filename so deep links and both surfaces pick it up unchanged. The new members' cutouts SHALL be `wojtek-sochaczynski.png`, `aleksander-dyminski.png`, and `iza-harmoza-sochon.png` (full-name kebab-case, diacritics stripped, matching the roster convention).

#### Scenario: Cutouts exist and are transparent PNGs

- **WHEN** the slider or the homepage grid references a member's cutout
- **THEN** the file exists under `/public/o-nas/slider/`, is a PNG with an alpha channel, and its background is removed

#### Scenario: Framing is consistent across the roster

- **WHEN** all 15 cutouts are viewed together
- **THEN** crop, scale, and orientation read as one consistent set, with no member visibly mis-scaled or differently framed — in particular the two new members' heads are not visibly larger in-frame than their teammates'

#### Scenario: Robert's portrait is the replacement photo

- **WHEN** `robert-sawicki.png` is compared to the pre-change asset
- **THEN** it is the new client-supplied portrait (arms-crossed, blue shirt), not the previous photo

#### Scenario: No member is excluded for missing artwork

- **WHEN** the slider renders
- **THEN** all 15 members are present — no member is commented out or skipped pending a usable photo

### Requirement: EN locale mirrors the team content

`o-nas.en.ts` SHALL carry the same 15 members in the same slider order with English bios, satisfying the `LocalizedONas` shape so PL and EN stay structurally identical. English bios SHALL carry the same substance and sit in the same length band as their Polish counterparts, and SHALL declare the same certificates — a locale showing visibly thinner bios or missing a certificate chip is a defect.

#### Scenario: EN roster parity

- **WHEN** `o-nas.en.ts` `oNasTeam.members` is compared to the PL version
- **THEN** it has the same 15 members in the same order, each with a translated (non-`LOREM`) bio, and TypeScript compiles under `satisfies LocalizedONas`

#### Scenario: EN bios match PL substance

- **WHEN** an English bio is compared to its Polish counterpart
- **THEN** it conveys the same content at a comparable length, rather than a shortened summary

#### Scenario: EN certificates match

- **WHEN** a member carries a certificate in the Polish content
- **THEN** the same member carries it in the English content, and the chip renders on the English page

## REMOVED Requirements

### Requirement: Position-priority order with a curated slider deviation

**Reason**: The client dictated an explicit presentation order for the full roster (2026-08-04), replacing the position-seniority principle and its curated slider deviation. Ordering is no longer derived from roles, and the grid and slider no longer differ.
**Migration**: Both surfaces adopt the client-curated order defined in "Client-curated order shared by both surfaces".

## ADDED Requirements

### Requirement: Client-curated order shared by both surfaces

The homepage grid, the `/o-nas` slider, and the EN locale mirror SHALL all present the roster in the client's curated order: Anna Ozga, Kamil Mazuruk, Robert Sawicki, Emilia Metryka, Paulina Hildebrand, Magda Rokicka, Piotrek Zach, Agnieszka Klajbert, Katarzyna Kaptur, Oliwia Witewska, Karolina Marcinowska, Wojtek Sochaczyński, Aleksander Dymiński, Iza Harmoza-Sochoń, Przemysław Świercz. No surface deviates; a future reorder is a content change to this list, not a per-surface curation.

#### Scenario: Homepage grid order

- **WHEN** the homepage `why-that-works` grid renders
- **THEN** the 15 tiles appear in the curated order above

#### Scenario: Slider order matches the grid

- **WHEN** the `/o-nas` page renders the team slider (either locale)
- **THEN** members step through in exactly the same order as the homepage grid

### Requirement: The longest surname still fits the slider display slot

Because "HARMOZA-SOCHOŃ" (14 characters) and "SOCHACZYŃSKI" (12) replace "MARCINOWSKA" (11) as the roster's longest surnames, the slider's large display slot SHALL render it complete — no clipping, truncation, or horizontal overflow — at every viewport, including above 1700px where the display scale is largest.

#### Scenario: The longest surnames fit at all viewports

- **WHEN** Wojtek Sochaczyński or Iza Harmoza-Sochoń is the featured member at 390px, 768px, 1280px, 1920px, and above 1700px
- **THEN** the surname renders complete in the large slot with no clipping or horizontal overflow
