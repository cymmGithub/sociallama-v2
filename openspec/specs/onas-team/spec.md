# onas-team Specification

## Purpose
The `/o-nas` "NASZE LAMY" team slider and its relationship to the homepage `why-that-works` team grid: who appears, in what order, with what bio, role, and portrait cutout, in both locales.
## Requirements
### Requirement: Both surfaces carry the same roster

The `/o-nas` team slider and the homepage `why-that-works` `TEAM` grid SHALL present the same 12 people, with no member appearing on one surface and not the other. Membership parity is normative; presentation order is not identical between the two (see the order requirement). Both surfaces SHALL also spell each person's name the same way — a name that differs between surfaces is a defect, not a presentational choice.

#### Scenario: Roster parity across surfaces

- **WHEN** `oNasTeam.members` is compared to the homepage `TEAM` array
- **THEN** both contain the same 12 people — Anna Ozga, Martyna Borowik, Agnieszka Klajbert, Piotrek Zach, Emilia Metryka, Paulina Hildebrand, Magda Rokicka, Kornelia Orlik, Katarzyna Kaptur, Oliwia Witewska, Karolina Marcinowska, Przemysław Świercz — with none omitted from either

#### Scenario: Names agree across surfaces

- **WHEN** the same person is named on the slider and in the homepage grid
- **THEN** the given name matches — in particular Anna Ozga is "Anna" on both, not "Ania" on one

### Requirement: Position-priority order with a curated slider deviation

The homepage grid SHALL order the roster by position seniority — Head of Social Media, then the Senior Social Media Specialists, then Project Manager, Social Media Managers, Social Media Experts, Social Media Specialist, Wideo Content Creator, Fullstack Developer. The slider SHALL follow that same order, except where a placement is deliberately curated for the slider's featured-member presentation. The current curated deviation is **Martyna Borowik moved to second-to-last in the slider** while remaining second in the grid.

#### Scenario: Homepage grid order

- **WHEN** the homepage `why-that-works` grid renders
- **THEN** members appear in this order — Anna Ozga, Martyna Borowik, Agnieszka Klajbert, Piotrek Zach, Emilia Metryka, Paulina Hildebrand, Magda Rokicka, Kornelia Orlik, Katarzyna Kaptur, Oliwia Witewska, Karolina Marcinowska, Przemysław Świercz

#### Scenario: Slider order

- **WHEN** the `/o-nas` page renders the team slider
- **THEN** members appear in this order — Anna Ozga, Agnieszka Klajbert, Piotrek Zach, Emilia Metryka, Paulina Hildebrand, Magda Rokicka, Kornelia Orlik, Katarzyna Kaptur, Oliwia Witewska, Karolina Marcinowska, Martyna Borowik, Przemysław Świercz — i.e. the grid order with Martyna Borowik moved down to second-to-last, ahead of Przemysław Świercz

#### Scenario: Deviations are deliberate, not drift

- **WHEN** the slider order differs from the grid order
- **THEN** the difference is limited to curated placements recorded in this spec, and every other member holds the same relative position on both surfaces

### Requirement: Every member carries real bio, role, and photo content

Each member entry SHALL provide a non-placeholder `bio`, a `role`, a `given`/`surname` name pair, and a `photo` path. No member may retain `LOREM` bio text. Where the source bio doc and the site disagree on a role label, the site's wording is authoritative ("Head of Social Media", "Wideo Content Creator").

Bios SHALL carry the substance of the client bio document rather than a trimmed abstract of it, and SHALL fall in a consistent length band across the roster. The band is normative because the slider's text column takes its height from the incoming member while the outgoing one overlays it absolutely: bios of wildly different lengths make the column jump between steps.

Bios SHALL be written in the third person throughout. The source document mixes first and third person between members, and a slider that switches voice mid-roster reads as unedited.

#### Scenario: No placeholder bios remain

- **WHEN** `oNasTeam.members` is inspected
- **THEN** no member's `bio` equals the shared `LOREM` constant, and every `bio` is drawn from the client bio doc

#### Scenario: Role labels reconcile to the site

- **WHEN** a bio doc role differs from the homepage grid role for the same person
- **THEN** the slider uses the homepage grid's role label

#### Scenario: Bios sit in a consistent band

- **WHEN** the bios of all members covered by the client document are measured
- **THEN** they fall in one length band, with no member carrying a bio several times another's length

#### Scenario: One voice across the roster

- **WHEN** any member's bio is read
- **THEN** it is in the third person, including for members whose source text was written in the first person

#### Scenario: Stepping the slider does not jump the layout

- **WHEN** the visitor steps from the shortest-bio member to the longest-bio member
- **THEN** the text column does not visibly jump or reflow mid-crossfade

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

`o-nas.en.ts` SHALL carry the same 12 members in the same slider order with English bios, satisfying the `LocalizedONas` shape so PL and EN stay structurally identical. English bios SHALL carry the same substance and sit in the same length band as their Polish counterparts, and SHALL declare the same certificates — a locale showing visibly thinner bios or missing a certificate chip is a defect.

#### Scenario: EN roster parity

- **WHEN** `o-nas.en.ts` `oNasTeam.members` is compared to the PL version
- **THEN** it has the same 12 members in the same order, each with a translated (non-`LOREM`) bio, and TypeScript compiles under `satisfies LocalizedONas`

#### Scenario: EN bios match PL substance

- **WHEN** an English bio is compared to its Polish counterpart
- **THEN** it conveys the same content at a comparable length, rather than a shortened summary

#### Scenario: EN certificates match

- **WHEN** a member carries a certificate in the Polish content
- **THEN** the same member carries it in the English content, and the chip renders on the English page

### Requirement: Slider name treatment
The slider SHALL present each member's name in two stacked slots: a small slot above and a large display slot below. The **given name SHALL occupy the small slot and the surname the large one.**

Colour SHALL be bound to the word, not to the slot: the given name SHALL be orange and the surname SHALL be the theme's light foreground. On the plum band this means a small orange given name over a large cream surname.

Because orange on plum measures ≈3.41:1, the small slot's type SHALL stay within the WCAG large-text threshold — at least 18.66px when bold, or 24px otherwise — at every viewport. Contrast compliance here is a consequence of the type size, so the size is normative and not merely aesthetic.

The large slot SHALL accommodate the longest surname in the roster without clipping or overflow at any viewport, including above 1700px where the display scale is largest.

#### Scenario: Given name small, surname large
- **WHEN** the slider renders a member
- **THEN** the given name appears in the small slot above and the surname in the large display slot below

#### Scenario: Colour follows the word
- **WHEN** the slider renders a member on the plum band
- **THEN** the given name is orange and the surname is cream

#### Scenario: Orange type stays large enough to pass
- **WHEN** the small slot renders at its smallest computed size, at any viewport
- **THEN** that size is at or above the WCAG large-text threshold for its weight, so the orange-on-plum pair meets AA

#### Scenario: The longest surname fits
- **WHEN** the member with the longest surname is featured, at 390px, 768px, 1280px, 1920px and above 1700px
- **THEN** the surname renders complete, with no clipping, truncation or horizontal overflow

### Requirement: Members may carry certificate chips
A member entry MAY declare the professional certificates that member holds, and the slider SHALL render each as a chip between the role line and the bio.

A chip SHALL present the certificate's own mark, unmodified — not recoloured, cropped or distorted — on a light chip ground rather than tinted onto the band, matching how the homepage presents the same marks. Each chip SHALL carry an accessible name identifying the certificate.

Where a member carries a certificate chip, the bio SHALL NOT also state that certificate in prose. The chip is the statement; repeating it is the redundancy the chip exists to remove.

The certificates declared SHALL be true of that member. DIMAQ Professional SHALL be shown for Anna Ozga and Magda Rokicka.

#### Scenario: Chip renders for a certified member
- **WHEN** the slider features Anna Ozga or Magda Rokicka
- **THEN** a DIMAQ Professional chip appears between the role line and the bio, carrying the DIMAQ mark and an accessible name

#### Scenario: No chip for members without one
- **WHEN** the slider features a member who declares no certificates
- **THEN** no chip row renders, and the role line runs straight into the bio as before

#### Scenario: The mark is not altered
- **WHEN** a certificate chip renders
- **THEN** the mark is drawn at its own aspect ratio on a light ground, with no recolour, crop or stretch

#### Scenario: Certificate is stated once
- **WHEN** a member carries a certificate chip
- **THEN** that member's bio text does not also name the certificate

### Requirement: A member may carry one personal link
A member entry MAY declare a single personal link — a blog, portfolio or profile of their own — and the slider SHALL render it beneath the bio. Members that declare none render nothing.

The link's visible text SHALL name its destination (a domain rather than "click here"), so the reader knows where it goes before following it. Because it leaves the site, it SHALL open in a new tab with `rel="noopener noreferrer"`.

The link SHALL meet WCAG AA contrast **for normal-size text** against the plum band — at least 4.5:1. The band's orange accent measures ≈3.4:1 and therefore SHALL NOT be used as the link's text colour; orange clears AA only under the large-text allowance the name slot relies on. Orange MAY carry the underline, which is decoration rather than text.

While a member's layer is the outgoing half of a crossfade it is hidden from assistive technology, so its link SHALL also leave the tab order — a control that is fading out may not be focusable.

#### Scenario: Link renders for a member who declares one
- **WHEN** the slider features a member carrying a personal link
- **THEN** it appears beneath the bio, labelled with its destination, and opens in a new tab with `rel="noopener noreferrer"`

#### Scenario: No link for members without one
- **WHEN** the slider features a member who declares no link
- **THEN** no link row renders

#### Scenario: Link text meets AA at its own size
- **WHEN** the link's computed colour, size and weight are measured against the band
- **THEN** the contrast ratio is at or above the threshold for that size and weight — 4.5:1 at normal body size

#### Scenario: The outgoing layer is not focusable
- **WHEN** a step is mid-crossfade and both layers are mounted
- **THEN** the outgoing layer's link is out of the tab order

