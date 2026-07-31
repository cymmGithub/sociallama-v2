## MODIFIED Requirements

### Requirement: Each step carries concrete, sourced copy
The homepage process section SHALL present, for each of its five steps, one supporting sentence drawn from real client work, replacing the unfalsifiable process claims the section carried before. A step MAY additionally carry a headline above that sentence.

A step SHALL NOT carry a headline that restates its own sentence. Where a step's sentence already opens with the claim its headline made, the step SHALL present the sentence alone, because the headline and the sentence render at the same size and the pair would read as the same statement twice.

Each step SHALL carry at most: one headline, one supporting sentence, one figure row, and one proof card. The supporting sentence SHALL NOT exceed roughly 25 words. Figures appearing in the sentence SHALL be visually distinguished from the surrounding text.

The section SHALL NOT present charts, diagrams, photographs or rendered artefacts, on any viewport (user decision, 2026-07-29). The figure row is set type, not an exhibit, and does not relax that prohibition.

#### Scenario: Each step shows its own claim
- **WHEN** the user scrolls through the section and each step becomes active in turn
- **THEN** the panel beside the rail presents that step's sentence, figure row and link — and its headline where it carries one — and no other step's

#### Scenario: Steps carry no more than the permitted elements
- **WHEN** any step's panel is rendered
- **THEN** it contains at most one headline, one supporting sentence, one figure row and one proof card, and no chart, diagram, photograph, rendered artefact, pull quote or conclusion block

#### Scenario: A step does not state its claim twice
- **WHEN** a step whose sentence already opens with its claim is rendered
- **THEN** no headline appears above that sentence

### Requirement: Each step restates its figures at display scale
Each step SHALL present a row of two or three figures beneath its supporting sentence, each figure paired with the noun it counts.

Every figure in the row SHALL already be present on that step's own surface — in its supporting sentence, or in its headline where it carries one, or in the cadence its sentence states. The row SHALL NOT introduce a measurement the step does not otherwise make, whether by adding a new figure or by deriving one.

The row SHALL span the panel's full width and SHALL sit at the foot of the panel, so that it renders on the same baseline for every step regardless of that step's sentence length.

This requirement exists because the panel's copy is one headline-scale sentence and, on some steps, a headline above it — which leaves the stage's trailing depth empty on every step and most of it empty on the closing step. A step MAY end its sentence on a colon so the row completes the statement, rather than restating in prose the figures the row already carries.

#### Scenario: The row restates rather than adds
- **WHEN** a step's figure row is read against that step's sentence, and its headline where it carries one
- **THEN** every figure in the row is a restatement of something the step already states, and no figure is new evidence

#### Scenario: The row lands on a constant baseline
- **WHEN** each of the five steps is activated in turn at a given viewport size
- **THEN** each step's figure row renders at the same vertical position

#### Scenario: The closing step is filled too
- **WHEN** the closing step — which carries no proof card — is rendered
- **THEN** it presents a figure row, so the panel is not left substantially emptier than the others

### Requirement: Narrow viewports keep the claim and the link
On narrow viewports each step SHALL present its sentence, its figure row and its proof card, plus its headline where it carries one. The card SHALL present a touch target of at least 44px in height and SHALL span the panel's width. The rail SHALL keep the active step in view without moving page scroll.

On narrow viewports the panel — not the rail — sets the stage's height, so the section SHALL remain within one pinned screen at the viewport heights the site supports. Where it would not, the panel's type SHALL be reduced in scale, and the figure row with it, rather than either being removed.

Because the panel's type is bound to the viewport rather than chosen freely, claims about fit at narrow viewports SHALL be measured against the running application. A standalone reproduction cannot resolve the section's custom-media queries and will report a false pass.

#### Scenario: The card is reachable by touch
- **WHEN** the section is rendered at a narrow viewport
- **THEN** each step's proof card presents a target at least 44px high, spanning the panel

#### Scenario: The section fits a short phone
- **WHEN** the section is rendered at a narrow viewport no taller than 620px
- **THEN** the panel's type and the figure row render at reduced scale and the stage stays within the viewport

#### Scenario: The active step stays visible
- **WHEN** the active step changes at a narrow viewport
- **THEN** the rail scrolls it into view without scrolling the page

## ADDED Requirements

### Requirement: The panel's copy renders at one type size
A step's headline and its supporting sentence SHALL render at the same font size, at every viewport. They MAY be distinguished by weight, letter case and tint, but SHALL NOT be distinguished by size, so that the panel reads as one statement rather than a claim with a caption beneath it.

#### Scenario: Headline and sentence match in size
- **WHEN** a step carrying both a headline and a sentence is rendered at any viewport
- **THEN** the two elements report the same computed font size

#### Scenario: The panel reads as one statement
- **WHEN** any step's panel is rendered
- **THEN** no element of its copy is set at a size that presents it as subordinate to another

### Requirement: The panel's type is bounded by the pinned viewport
The panel's shared type size SHALL be chosen so that the section renders complete within one pinned screen at every viewport the site supports, in both locales. "Complete" means the step's copy, its figure row and its proof card are all on screen.

This requirement is load-bearing because the failure is silent and section-wide. All five panels occupy one grid cell, so the stage is permanently as tall as its tallest step: copy that overflows does so on every step at once. The section is pinned, so the overflow is clipped off the top and bottom of the screen rather than scrolled to, and nothing in the layout reports it.

A change to the panel's type size, line height, or to the length of any step's copy, SHALL be measured against the shortest supported viewport before it is accepted.

#### Scenario: The proof card survives at the design viewport
- **WHEN** the section is rendered at 1440×816, the site's declared desktop design size
- **THEN** every step's figure row and proof card render fully on screen

#### Scenario: A type increase that does not fit is rejected
- **WHEN** a proposed shared type size makes the stage taller than the pinned viewport at any supported size
- **THEN** that size is not adopted, and either the type or the copy is reduced until the section fits
