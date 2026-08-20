# Delta: careers-page

## MODIFIED Requirements

### Requirement: Section composition and band order

The page SHALL render, in order: a marquee hero carrying the page's accessible
heading and lede, role panels, and the application form. The page SHALL NOT
render a benefits section: benefits change over time and the removed section's
items (e.g. "brainstorm") read as filler rather than benefits.

The bands SHALL keep the alternating ground colours of the remaining sections
(deep-ink, deep-ink, deep-plum), with the application form immediately
following the role panels.

The hero lede SHALL be the tone-of-voice-approved copy: "Chcesz zdobywać nowe
umiejętności w świecie social mediów? Aplikuj do Social Lamy" (EN twin carries
its translation). The previous jokey lede ("…Bijesz rekordy w pluciu na
odległość?…") SHALL NOT appear.

#### Scenario: Bands render in order

- **WHEN** the careers page renders
- **THEN** the application form appears immediately after the role panels
- **AND** no benefits section appears anywhere on the page

#### Scenario: The decorative marquee is not the heading

- **WHEN** assistive technology reads the page
- **THEN** exactly one `h1` names the page
- **AND** the repeating marquee text is hidden from the accessibility tree

#### Scenario: Hero lede carries the approved copy

- **WHEN** the Polish careers page renders
- **THEN** the hero lede reads "Chcesz zdobywać nowe umiejętności w świecie
  social mediów? Aplikuj do Social Lamy"

### Requirement: Careers copy lives in locale content files

All page copy SHALL be sourced from `lib/content/zostan-lama.ts` and its English
counterpart — role definitions, form labels and status messages — and
SHALL NOT be hardcoded in component markup. The English file SHALL satisfy the
same shape as the Polish one under the translation-parity gate.

#### Scenario: Parity gate covers the careers content

- **WHEN** the translation-parity check runs
- **THEN** the English careers content is compared against the Polish shape and
  a missing or extra key fails the check

#### Scenario: Adding a role touches content only

- **WHEN** a role is added to the Polish content file and its English twin
- **THEN** the page renders the new role panel without any component change
