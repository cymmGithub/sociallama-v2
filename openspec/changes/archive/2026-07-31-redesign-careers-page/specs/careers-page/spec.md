## ADDED Requirements

### Requirement: The careers page owns its styles

The careers route SHALL define its own CSS module and SHALL NOT import a CSS
module belonging to another route. In particular it SHALL NOT import
`app/(frontend)/[slug]/post.module.css`, whose classes are written to compose
with `.stage` and produce cream-on-cream text when applied without it.

Every text element on the page SHALL meet WCAG AA contrast against the band it
is painted on, in both locales.

#### Scenario: No cross-route module import

- **WHEN** the Polish or English careers page module graph is inspected
- **THEN** it imports no `.module.css` file from another route directory

#### Scenario: The lede is legible

- **WHEN** the careers page renders in either locale
- **THEN** the hero lede text and every link inside it are visible against the
  page ground at a contrast ratio of at least 4.5:1

### Requirement: Both locales serve the careers page

The page SHALL be served at `/zostan-lama` in Polish and `/en/become-a-lama` in
English, with each declaring the other as its locale alternate. Both SHALL
render the same section composition.

#### Scenario: Locale alternates resolve

- **WHEN** either careers URL is requested
- **THEN** the response returns 200
- **AND** its alternates reference the other locale's careers URL

#### Scenario: Legacy WordPress URL still resolves

- **WHEN** the legacy `/zostan-lama/` URL is requested
- **THEN** it redirects to `/zostan-lama` and returns the careers page

### Requirement: Section composition and band order

The page SHALL render, in order: a marquee hero carrying the page's accessible
heading and lede, role panels, a benefits band, and the application form.

The bands SHALL alternate ground colour in the order deep-ink, deep-ink,
orange, deep-plum, so the benefits band is the page's only light break and sits
immediately before the form.

#### Scenario: Bands render in order

- **WHEN** the careers page renders
- **THEN** the benefits band appears after the role panels and before the
  application form

#### Scenario: The decorative marquee is not the heading

- **WHEN** assistive technology reads the page
- **THEN** exactly one `h1` names the page
- **AND** the repeating marquee text is hidden from the accessibility tree

### Requirement: The page ends on the application form

The application form SHALL be the final section of the page. No content section
SHALL follow it; only site chrome may appear below.

#### Scenario: Nothing follows the form

- **WHEN** the careers page renders
- **THEN** the next element after the application form is the site footer

### Requirement: Open roles render as selectable panels

Open roles SHALL be presented as a set of selectable panels showing one role at
a time, each listing that role's profile, responsibilities and requirements.
Panels SHALL be keyboard operable and expose their selected state to assistive
technology.

#### Scenario: One role visible at a time

- **WHEN** a visitor selects a role
- **THEN** that role's panel is shown and every other role panel is hidden

#### Scenario: Selection is announced

- **WHEN** the role controls are read by assistive technology
- **THEN** the active control reports itself as selected and names the panel it
  controls

### Requirement: Careers copy lives in locale content files

All page copy SHALL be sourced from `lib/content/zostan-lama.ts` and its English
counterpart — role definitions, benefits, form labels and status messages — and
SHALL NOT be hardcoded in component markup. The English file SHALL satisfy the
same shape as the Polish one under the translation-parity gate.

#### Scenario: Parity gate covers the careers content

- **WHEN** the translation-parity check runs
- **THEN** the English careers content is compared against the Polish shape and
  a missing or extra key fails the check

#### Scenario: Adding a role touches content only

- **WHEN** a role is added to the Polish content file and its English twin
- **THEN** the page renders the new role panel without any component change
