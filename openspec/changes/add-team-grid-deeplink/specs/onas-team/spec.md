## ADDED Requirements

### Requirement: Homepage tiles deep-link to the member's slider profile

Each homepage `why-that-works` team tile SHALL carry a discrete "WIĘCEJ" link
(EN: "MORE") below the always-visible name + role caption, targeting the team
slider with that member preselected: `/o-nas?lama=<slug>#zespol` on the Polish
homepage, `/en/about-us?lama=<slug>#zespol` on the English one. `<slug>` SHALL
be the member's cutout filename stem (e.g. `martyna-borowik`) — the key the two
surfaces already share — never a positional index, because the surfaces'
orders deliberately differ.

The link label and locale base href SHALL come from the content modules
(`home.ts` / `home.en.ts`), not be hardcoded in the component. The arrow SHALL
be a lucide icon, not a text glyph. Each link's accessible name SHALL include
the member's name, so the twelve links are distinguishable out of context.

On devices with hover, the link SHALL be hidden at rest and revealed by
hovering the tile or by keyboard focus; on devices without hover it SHALL be
always visible. The caption's name and role are unaffected in every state.

#### Scenario: Link targets the member by slug

- **WHEN** the tile for Martyna Borowik (grid position 2, slider position 11)
  is rendered on the Polish homepage
- **THEN** its link href is `/o-nas?lama=martyna-borowik#zespol`, and following
  it features Martyna in the slider — not the member at slider position 2

#### Scenario: EN tile links to the EN page

- **WHEN** the same tile renders on `/en`
- **THEN** the link reads "MORE", and its href is
  `/en/about-us?lama=martyna-borowik#zespol`

#### Scenario: Hover and focus reveal on pointer devices

- **WHEN** on a hover-capable device the tile is neither hovered nor contains
  focus
- **THEN** the link is not visible; hovering the tile or moving keyboard focus
  to the link makes it visible, and the name + role caption is visible in both
  states

#### Scenario: Always visible on touch

- **WHEN** the grid renders on a device without hover (`hover: none`)
- **THEN** every tile's link is visible without interaction

#### Scenario: Links are distinguishable to assistive technology

- **WHEN** the twelve tile links are enumerated by accessible name
- **THEN** each name includes the member's own name and no two are identical,
  and the deterministic homepage a11y gate still passes

### Requirement: The slider honors a `lama` deep-link param

The `/o-nas` and `/en/about-us` team sliders SHALL read the `lama` query
param on arrival and, when it matches a member's cutout slug, feature that
member immediately — an instant swap with no crossfade, arrow lock, or
entrance replay. The `#zespol` hash SHALL continue to scroll the page to the
team section via the existing cross-page hash handling.

The param is an entry point, not synced state: stepping the slider SHALL NOT
rewrite the URL. A missing or unrecognized `lama` value SHALL change nothing —
first member on a fresh mount, current member if already mounted.

Reading the param SHALL NOT alter the pages' static shell: the team section
SHALL render in full in the prerendered HTML (no Suspense fallback swallowing
it, no CSR bailout of the page).

#### Scenario: Deep link features the member

- **WHEN** a visitor opens `/o-nas?lama=przemyslaw-swiercz#zespol`
- **THEN** the page is scrolled to the team section and the slider features
  Przemysław Świercz, with his neighbors in the slider's own order behind him

#### Scenario: Unknown slug degrades gracefully

- **WHEN** a visitor opens `/o-nas?lama=nie-ma-takiej-lamy`
- **THEN** the slider behaves exactly as with no param — first member featured,
  no error, no blank stage

#### Scenario: Repeat navigation while the page stays mounted

- **WHEN** a visitor deep-links to member A, navigates back to the homepage,
  and deep-links to member B while Next keeps the `/o-nas` page alive
- **THEN** the slider features member B

#### Scenario: Static shell is unchanged

- **WHEN** the prerendered HTML of `/o-nas` is inspected with JavaScript
  disabled
- **THEN** the team section is present and complete, exactly as before this
  change
