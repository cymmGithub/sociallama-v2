## ADDED Requirements

### Requirement: The homepage team grid carries member tiles only

The homepage `why-that-works` grid SHALL contain member tiles and nothing else — no call-to-action cell, no filler cell. With sixteen members and a four-column desktop track, the grid closes as an exact 4x4 rectangle without a non-member cell doing that job.

The removed CTA cell was the section's only route to `/o-nas#o-lamie`; member tiles all target `?lama=<slug>#zespol`. Dropping that route is a deliberate trade for the closed rectangle, not an oversight, and the site navigation remains the path to `/o-nas`.

#### Scenario: No CTA cell in the grid

- **WHEN** the homepage team grid renders at any viewport
- **THEN** every cell is a member tile with a portrait, name, and role — no "Dowiedz się więcej" / "Learn more" cell appears

#### Scenario: Desktop grid closes as a rectangle

- **WHEN** the homepage team grid renders at a desktop viewport
- **THEN** the sixteen member tiles fill four complete rows of four with no ragged final row

#### Scenario: The CTA's content and styling leave with it

- **WHEN** the homepage content modules and the section stylesheet are inspected
- **THEN** the `moreCard` entry is absent from both locales and the CTA tile's style rules are absent from the section stylesheet — no orphaned copy or dead CSS remains

### Requirement: Reconstructed portraits SHALL be declared and likeness-verified

Where a member's cutout cannot be produced from photography alone and part of the frame is generated, the change that ships it SHALL record which source it was reconstructed from and how much of the frame is synthetic, and the face SHALL remain photographic — reconstruction extends the body, never the likeness.

Because the framing solver normalises head width, scale-ratio checks cannot detect an anisotropic squeeze introduced by a generative step. Verification SHALL therefore be by template correlation of the face against the pre-reconstruction source across a scale grid, with both axes at or above 0.99.

A reconstructed portrait of an identifiable person SHALL be shown to that person for sign-off before it ships.

#### Scenario: Provenance is recorded

- **WHEN** a reconstructed cutout is added to the roster
- **THEN** the change records the source image it was built from and the proportion of the frame that is generated rather than photographed

#### Scenario: The face survives reconstruction unaltered

- **WHEN** the shipped cutout's face is template-correlated against the pre-reconstruction source across an (sx, sy) scale grid
- **THEN** both axes correlate at 0.99 or above, and the face reads as the same person at slider scale

#### Scenario: The subject approves their own portrait

- **WHEN** a portrait containing generated body or clothing depicts an identifiable person
- **THEN** that person has approved the specific image before it appears on the site

## MODIFIED Requirements

### Requirement: Both surfaces carry the same roster

The `/o-nas` team slider and the homepage `why-that-works` grid SHALL present the same 16 people, with no member appearing on one surface and not the other. Membership parity is normative. The homepage grid is derived from `oNasTeam.members` via `toTeamGrid()` rather than maintained as a second array, so parity is structural; both surfaces SHALL also spell each person's name the same way — a name that differs between surfaces is a defect, not a presentational choice.

#### Scenario: Roster parity across surfaces

- **WHEN** `oNasTeam.members` is compared to the homepage grid rendered from `oNasTeamGrid`
- **THEN** both contain the same 16 people — Anna Ozga, Kamil Mazuruk, Robert Sawicki, Emilia Metryka, Paulina Hildebrand, Magda Rokicka, Piotrek Zach, Agnieszka Klajbert, Katarzyna Kaptur, Oliwia Witewska, Karolina Marcinowska, Wojtek Sochaczyński, Aleksander Dymiński, Iza Harmoza-Sochoń, Łukasz Płociński, Przemysław Świercz — with none omitted from either

#### Scenario: Names agree across surfaces

- **WHEN** the same person is named on the slider and in the homepage grid
- **THEN** the given name matches — in particular Anna Ozga is "Anna" on both, not "Ania" on one, and the newest member is "Łukasz Płociński" on both, matching the spelling used on his blog byline

### Requirement: Client-curated order shared by both surfaces

The homepage grid, the `/o-nas` slider, and the EN locale mirror SHALL all present the roster in the client's curated order: Anna Ozga, Kamil Mazuruk, Robert Sawicki, Emilia Metryka, Paulina Hildebrand, Magda Rokicka, Piotrek Zach, Agnieszka Klajbert, Katarzyna Kaptur, Oliwia Witewska, Karolina Marcinowska, Wojtek Sochaczyński, Aleksander Dymiński, Iza Harmoza-Sochoń, Łukasz Płociński, Przemysław Świercz. No surface deviates; a future reorder is a content change to this list, not a per-surface curation.

#### Scenario: Homepage grid order

- **WHEN** the homepage `why-that-works` grid renders
- **THEN** the 16 tiles appear in the curated order above, with Łukasz Płociński immediately before Przemysław Świercz

#### Scenario: Slider order matches the grid

- **WHEN** the `/o-nas` page renders the team slider (either locale)
- **THEN** members step through in exactly the same order as the homepage grid

### Requirement: Every member carries real bio, role, and photo content

Each member entry SHALL provide a non-placeholder `bio`, a `role`, a `given`/`surname` name pair, and a `photo` path. No member may retain `LOREM` bio text. Where the source bio doc and the site disagree on a role label, the site's wording is authoritative ("Head of Social Media", "Wideo Content Creator").

Bios for members covered by the client bio document SHALL carry that document's substance rather than a trimmed abstract of it. Members without client-supplied bio material (Wojtek Sochaczyński, Aleksander Dymiński, Łukasz Płociński) SHALL carry craft-focused bios that state no fabricated employers, client names, year counts, or credentials. All bios SHALL fall in a consistent length band across the roster. The band is normative because the slider's text column takes its height from the incoming member while the outgoing one overlays it absolutely: bios of wildly different lengths make the column jump between steps.

A member who works for a partner company rather than for Social Lama SHALL carry that affiliation in the role label, so the team surfaces do not imply staff membership. Łukasz Płociński's role is "Specjalista SEO, SEOFLY" / "SEO Specialist, SEOFLY", matching the role already published on his blog byline.

Bios SHALL be written in the third person throughout. The source document mixes first and third person between members, and a slider that switches voice mid-roster reads as unedited.

#### Scenario: No placeholder bios remain

- **WHEN** `oNasTeam.members` is inspected
- **THEN** no member's `bio` equals the shared `LOREM` constant, and every `bio` is either drawn from the client bio doc or is approved craft-focused copy

#### Scenario: Bios without client material invent no facts

- **WHEN** Wojtek Sochaczyński's, Aleksander Dymiński's or Łukasz Płociński's bio is read
- **THEN** it names no employer, client, year count, or credential that the client did not supply — Łukasz's SEOFLY affiliation and experience are carried only to the extent his published author bio already states them

#### Scenario: Partner affiliation is visible, not implied

- **WHEN** Łukasz Płociński is presented on either team surface
- **THEN** his role label names SEOFLY, so a visitor reading the tile alone does not take him for Social Lama staff

#### Scenario: Role labels reconcile to the site

- **WHEN** a bio doc role differs from the homepage grid role for the same person
- **THEN** the slider uses the homepage grid's role label — and the members added since the client doc carry "Senior Videographer" (Wojtek Sochaczyński), "Videographer" (Aleksander Dymiński) and "Specjalista SEO, SEOFLY" (Łukasz Płociński) on both surfaces

#### Scenario: Bios sit in a consistent band

- **WHEN** the bios of all 16 members are measured
- **THEN** they fall in one length band, with no member carrying a bio several times another's length

#### Scenario: One voice across the roster

- **WHEN** any member's bio is read
- **THEN** it is in the third person, including for members whose source text was written in the first person

#### Scenario: Stepping the slider does not jump the layout

- **WHEN** the visitor steps from the shortest-bio member to the longest-bio member
- **THEN** the text column does not visibly jump or reflow mid-crossfade

### Requirement: Every member has a transparent, crop-matched portrait cutout

All 16 members SHALL have a transparent-background PNG cutout under `/public/o-nas/slider/`, consistent in framing (head+torso crop, orientation), comparable in file weight (~300 KB target, optimized), and obeying the framing-integrity rules: the subject bleeds off the frame's bottom edge; the frame's side edges may only be touched below elbow height (hip/torso rows); and no limb may exit a side edge and terminate before the bottom of the frame. The same cutouts fill the homepage grid's full-bleed portrait tiles, so a framing defect is visible on both surfaces.

Cutout filenames SHALL follow the roster convention — full name, kebab-case, diacritics stripped — because the filename stem is the identity key for the homepage deep link. Robert Sawicki's cutout is produced from the client's 2026-08 replacement photo under the existing `robert-sawicki.png` filename; the newest member's is `lukasz-plocinski.png`, which is distinct from the unrelated blog avatar at `/public/authors/lukasz-plocinski.png` and does not replace it.

#### Scenario: Cutouts exist and are transparent PNGs

- **WHEN** the slider or the homepage grid references a member's cutout
- **THEN** the file exists under `/public/o-nas/slider/`, is a PNG with an alpha channel, and its background is removed

#### Scenario: Framing is consistent across the roster

- **WHEN** all 16 cutouts are viewed together on the brand plum ground
- **THEN** crop, scale, and orientation read as one consistent set, with no member visibly mis-scaled or differently framed — in particular no member's head is visibly larger in-frame than their teammates'

#### Scenario: Robert's portrait is the replacement photo

- **WHEN** `robert-sawicki.png` is compared to the pre-change asset
- **THEN** it is the new client-supplied portrait (arms-crossed, blue shirt), not the previous photo

#### Scenario: No member is excluded for missing artwork

- **WHEN** the slider renders
- **THEN** all 16 members are present — no member is commented out or skipped pending a usable photo

#### Scenario: Subject is grounded on the bottom edge

- **WHEN** a cutout's bottom pixel row is inspected
- **THEN** it carries subject alpha — the figure bleeds off the frame rather than floating above it

#### Scenario: No high side cuts

- **WHEN** a cutout's left and right edge columns are inspected
- **THEN** any subject alpha on them sits below elbow height, reading as a deliberate hip/torso bleed rather than a cut arm or shoulder

#### Scenario: No mid-frame amputations

- **WHEN** subject alpha touches a side edge
- **THEN** that contact run extends to the frame's bottom edge — a limb never exits the side and ends mid-frame

### Requirement: EN locale mirrors the team content

`o-nas.en.ts` SHALL carry the same 16 members in the same slider order with English bios, satisfying the `LocalizedONas` shape so PL and EN stay structurally identical. English bios SHALL carry the same substance and sit in the same length band as their Polish counterparts, and SHALL declare the same certificates — a locale showing visibly thinner bios or missing a certificate chip is a defect.

#### Scenario: EN roster parity

- **WHEN** `o-nas.en.ts` `oNasTeam.members` is compared to the PL version
- **THEN** it has the same 16 members in the same order, each with a translated (non-`LOREM`) bio, and TypeScript compiles under `satisfies LocalizedONas`

#### Scenario: EN bios match PL substance

- **WHEN** an English bio is compared to its Polish counterpart
- **THEN** it conveys the same content at a comparable length, rather than a shortened summary

#### Scenario: EN certificates match

- **WHEN** a member carries a certificate in the Polish content
- **THEN** the same member carries it in the English content, and the chip renders on the English page

### Requirement: The mobile homepage grid presents as a horizontal snap rail

On mobile viewports the homepage `why-that-works` team grid SHALL render as a single-row, horizontally swipeable scroll-snap rail instead of the two-column vertical grid — at roster scale the stacked grid ran roughly eight rows mid-page. All 16 member tiles SHALL remain present and reachable by swiping; membership, order, captions, and per-member deep links are unchanged by the presentation.

Tile width SHALL stay close to the previous two-column width (~46vw) so the existing image size buckets keep fetching the same variant, and SHALL leave a partial next tile visible at the viewport edge as the swipe affordance. A passive chevron swipe hint SHALL sit below the rail — decorative and non-interactive, never presented as a control — and SHALL fade out once the visitor swipes the rail, where scroll-driven animations are supported; elsewhere it remains visible. After a swipe settles, tiles SHALL align to the snap grid. The rail SHALL NOT capture vertical gestures — a mostly-vertical drag over it scrolls the page — and SHALL NOT chain into browser navigation gestures at its ends. Desktop SHALL keep the existing four-column grid; the rail is a mobile-only, CSS-only presentation with no new JS behavior.

#### Scenario: Mobile rail replaces the long grid

- **WHEN** the homepage renders at a mobile viewport
- **THEN** the team section shows a single row of tiles roughly one tile-height tall, with a partial next tile peeking at the viewport edge

#### Scenario: Every member is reachable by swiping

- **WHEN** the visitor swipes the rail to its end
- **THEN** all 16 members have passed in the curated order, with Przemysław Świercz as the final cell

#### Scenario: Deep links survive the presentation change

- **WHEN** a member tile in the rail is tapped
- **THEN** it navigates to that member's `?lama=<slug>#zespol` target exactly as the grid tile did

#### Scenario: Swipe hint teaches the gesture then leaves

- **WHEN** the rail is at its start position, unswiped
- **THEN** a brand-orange chevron hint is visible below the rail, and after the visitor swipes past roughly the first tile it fades out (in browsers with scroll-driven animation support)
