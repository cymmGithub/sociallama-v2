# how-it-works-proof Specification

## Purpose
TBD - created by archiving change refine-how-it-works-proof. Update Purpose after archive.
## Requirements
### Requirement: Each step carries concrete, sourced copy
The homepage process section SHALL present, for each of its five steps, a headline and one supporting sentence drawn from real client work, replacing the unfalsifiable process claims the section carried before.

Each step SHALL carry at most: one headline, one supporting sentence, and one proof card. The supporting sentence SHALL NOT exceed roughly 25 words. Figures appearing in the sentence SHALL be visually distinguished from the surrounding text.

The section SHALL NOT present charts, diagrams, photographs or rendered artefacts, on any viewport (user decision, 2026-07-29 — see `design.md` Decision 13).

#### Scenario: Each step shows its own claim
- **WHEN** the user scrolls through the section and each step becomes active in turn
- **THEN** the panel beside the rail presents that step's headline, sentence and link, and no other step's

#### Scenario: Steps carry no more than the permitted elements
- **WHEN** any step's panel is rendered
- **THEN** it contains at most one headline, one supporting sentence and one proof card, and no chart, diagram, photograph, rendered artefact, list, pull quote or conclusion block

### Requirement: Evidence is named and checkable
Every figure presented SHALL be a real measurement taken from a client report, reproduced without rounding for effect.

Each step presenting client evidence SHALL carry a proof card naming the client it belongs to and linking to the section of that client's case study carrying the same evidence. The card SHALL identify the client by wordmark, and that wordmark SHALL carry the client's readable name as its alternative text, since it stands in for the brand name in the card's sentence.

The section presents no exhibits, so the proof card is the only thing on its surface distinguishing a client's figures from the agency's own — it is load-bearing rather than decorative. The closing step, which describes what the reader receives rather than what was done for a named client, SHALL carry no proof card.

#### Scenario: Client evidence is named and checkable in one click
- **WHEN** a step presents a figure belonging to a named client
- **THEN** its proof card shows that client's wordmark and links to the case-study section carrying the same evidence

#### Scenario: The wordmark is announced as a name
- **WHEN** the proof card is read by assistive technology
- **THEN** the wordmark is announced with the client's readable name, not an internal key

#### Scenario: The closing step addresses the reader
- **WHEN** the final step is rendered
- **THEN** it carries no proof card and no case-study link

### Requirement: Grouped numbers do not break across lines
A figure whose digits are grouped SHALL use a non-breaking separator, so that it cannot be split across two lines and read as two numbers.

#### Scenario: A grouped figure stays whole
- **WHEN** a step's sentence wraps at a figure
- **THEN** the figure moves to the next line intact rather than splitting

### Requirement: Nothing is dated
No copy, label, caption or accessible description in the section SHALL contain a calendar year, a full date, or a month name. Elapsed time SHALL be expressed as a duration.

#### Scenario: No dates in the rendered section
- **WHEN** the section's markup is inspected, including accessible labels
- **THEN** it contains no four-digit year, no `dd.mm.yyyy`-style date and no month name

#### Scenario: Elapsed time reads as duration
- **WHEN** the section refers to time passing between two events
- **THEN** it states the length of the interval rather than the dates bounding it

### Requirement: Step activation and pin behaviour are preserved
The section SHALL remain pinned across its scroll range, activating each of the five steps in sequence as scroll progresses, and SHALL unpin after the final step. The rail SHALL indicate the active step. Under reduced-motion preferences the section SHALL render unpinned in its resting state as it does today.

#### Scenario: Steps still activate in order
- **WHEN** the user scrolls through the section
- **THEN** the five steps activate in order tied to scroll progress, and the section unpins after the last

#### Scenario: Reduced motion
- **WHEN** the user prefers reduced motion
- **THEN** the section renders without pinning, with its content in a readable resting state

### Requirement: The stage does not resize between steps
The panel area SHALL occupy a constant height across all five steps, so that advancing from one step to the next does not change the height of the section or shift surrounding content.

#### Scenario: Constant height across steps
- **WHEN** each of the five steps is activated in turn at a given viewport size
- **THEN** the panel's rendered height is identical for every step

### Requirement: Narrow viewports keep the claim and the link
On narrow viewports each step SHALL present its headline, its sentence and its proof card. The card SHALL present a touch target of at least 44px in height. The rail SHALL keep the active step in view without moving page scroll.

#### Scenario: The card is reachable by touch
- **WHEN** the section is rendered at a narrow viewport
- **THEN** each step's proof card presents a target at least 44px high

#### Scenario: The active step stays visible
- **WHEN** the active step changes at a narrow viewport
- **THEN** the rail scrolls it into view without scrolling the page

### Requirement: Both locales
The section SHALL be available in Polish and English, with all step copy, proof-card label and link text localised, and with case-study links resolving to the current locale's route.

#### Scenario: English homepage carries the section
- **WHEN** the English homepage is rendered
- **THEN** the section appears with English copy and links pointing at the English case-study routes

