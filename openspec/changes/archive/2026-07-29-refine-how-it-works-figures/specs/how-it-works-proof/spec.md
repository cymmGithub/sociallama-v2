## MODIFIED Requirements

### Requirement: Each step carries concrete, sourced copy
The homepage process section SHALL present, for each of its five steps, a headline and one supporting sentence drawn from real client work, replacing the unfalsifiable process claims the section carried before.

Each step SHALL carry at most: one headline, one supporting sentence, one figure row, and one proof card. The supporting sentence SHALL NOT exceed roughly 25 words. Figures appearing in the sentence SHALL be visually distinguished from the surrounding text.

The section SHALL NOT present charts, diagrams, photographs or rendered artefacts, on any viewport (user decision, 2026-07-29). The figure row is set type, not an exhibit, and does not relax that prohibition.

#### Scenario: Each step shows its own claim
- **WHEN** the user scrolls through the section and each step becomes active in turn
- **THEN** the panel beside the rail presents that step's headline, sentence, figure row and link, and no other step's

#### Scenario: Steps carry no more than the permitted elements
- **WHEN** any step's panel is rendered
- **THEN** it contains at most one headline, one supporting sentence, one figure row and one proof card, and no chart, diagram, photograph, rendered artefact, pull quote or conclusion block

### Requirement: Narrow viewports keep the claim and the link
On narrow viewports each step SHALL present its headline, its sentence, its figure row and its proof card. The card SHALL present a touch target of at least 44px in height and SHALL span the panel's width. The rail SHALL keep the active step in view without moving page scroll.

On narrow viewports the panel — not the rail — sets the stage's height, so the section SHALL remain within one pinned screen at the viewport heights the site supports. Where it would not, the figure row SHALL be reduced in scale rather than removed.

#### Scenario: The card is reachable by touch
- **WHEN** the section is rendered at a narrow viewport
- **THEN** each step's proof card presents a target at least 44px high, spanning the panel

#### Scenario: The section fits a short phone
- **WHEN** the section is rendered at a narrow viewport no taller than 620px
- **THEN** the figure row renders at reduced scale and the stage stays within the viewport

#### Scenario: The active step stays visible
- **WHEN** the active step changes at a narrow viewport
- **THEN** the rail scrolls it into view without scrolling the page

## ADDED Requirements

### Requirement: Each step restates its figures at display scale
Each step SHALL present a row of two or three figures beneath its supporting sentence, each figure paired with the noun it counts.

Every figure in the row SHALL already be present on that step's own surface — in its supporting sentence, or in its headline, or in the cadence its sentence states. The row SHALL NOT introduce a measurement the step does not otherwise make, whether by adding a new figure or by deriving one.

The row SHALL span the panel's full width and SHALL sit at the foot of the panel, so that it renders on the same baseline for every step regardless of that step's sentence length.

This requirement exists because the panel is sized by the five-item rail beside it while carrying a headline and one capped sentence, which left the stage's trailing half empty on every step and most of it empty on the closing step.

#### Scenario: The row restates rather than adds
- **WHEN** a step's figure row is read against that step's headline and sentence
- **THEN** every figure in the row is a restatement of something the step already states, and no figure is new evidence

#### Scenario: The row lands on a constant baseline
- **WHEN** each of the five steps is activated in turn at a given viewport size
- **THEN** each step's figure row renders at the same vertical position

#### Scenario: The closing step is filled too
- **WHEN** the closing step — which carries no proof card — is rendered
- **THEN** it presents a figure row, so the panel is not left substantially emptier than the others

### Requirement: Grouped figures in the row do not break across lines
A figure in the row whose digits are grouped SHALL use a non-breaking separator, and the row SHALL NOT wrap a figure across two lines.

The row's cells are roughly a third of the panel's width, so a plain group separator is a likely wrap point rather than an unlikely one.

#### Scenario: A grouped row figure stays whole
- **WHEN** the figure row is rendered at any supported viewport
- **THEN** each figure renders on one line, with its grouped digits intact
