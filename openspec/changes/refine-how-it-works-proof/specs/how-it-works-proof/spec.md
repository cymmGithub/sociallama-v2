## ADDED Requirements

### Requirement: One exhibit per step
The homepage process section SHALL present, for each of its five steps, exactly one piece of evidence drawn from real client work — a chart, a diagram, a photograph of published work, or a rendered artefact. The exhibit SHALL occupy a dedicated panel beside the step rail, and only the active step's exhibit SHALL be presented at a time.

Each panel SHALL consist of at most: an eyebrow label, a client mark, one headline, one supporting sentence, one exhibit, and one link. The supporting sentence SHALL NOT exceed roughly 25 words.

#### Scenario: Each step shows its own exhibit
- **WHEN** the user scrolls through the section and each step becomes active in turn
- **THEN** the panel beside the rail presents that step's exhibit, and no other step's exhibit is presented

#### Scenario: Panels carry no more than the permitted elements
- **WHEN** any step's panel is rendered
- **THEN** it contains at most an eyebrow, a client mark, one headline, one supporting sentence, one exhibit and one link, and no list, table of prose, pull quote or conclusion block

### Requirement: Evidence is real and attributed
Every figure presented SHALL be a real measurement taken from a client report, reproduced without rounding for effect. Each panel presenting client evidence SHALL name the client it belongs to, and SHALL link to the section of that client's case study carrying the same evidence.

The closing step, which describes what the reader receives rather than what was done for a named client, SHALL NOT carry a client mark.

#### Scenario: Client evidence is attributed and linked
- **WHEN** a panel presents a figure or artefact belonging to a named client
- **THEN** the panel shows that client's mark and links to the corresponding case study section

#### Scenario: The closing step addresses the reader
- **WHEN** the final step's panel is rendered
- **THEN** no client mark is shown

### Requirement: Nothing is dated
No copy, label, caption, alternative text or accessible description in the section SHALL contain a calendar year, a full date, or a month name. Elapsed time SHALL be expressed as a duration. Any artefact reproduced visually SHALL be selected or cropped so that no date is legible within it.

#### Scenario: No dates in the rendered section
- **WHEN** the section's markup is inspected, including alternative text and accessible labels
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
The exhibit area SHALL occupy a constant height across all five steps, so that advancing from one step to the next does not change the height of the section's panel or shift surrounding content.

#### Scenario: Constant height across steps
- **WHEN** each of the five steps is activated in turn at a given viewport size
- **THEN** the panel's rendered height is identical for every step

### Requirement: Narrow viewports keep the claim and the link
On narrow viewports each step SHALL present its headline, its single strongest visual and a link to the relevant case study, and SHALL omit supporting detail that cannot be read at that size. Where omitting the detail would leave a panel without substance, a one-sentence summary SHALL stand in its place. The link SHALL present a touch target of at least 44px in height.

#### Scenario: Dense detail is deferred on a phone
- **WHEN** the section is rendered at a narrow viewport
- **THEN** multi-cell diagrams, tag lists, pull quotes and conclusion blocks are not shown, and each panel ends in a link to the case study

#### Scenario: No panel is left empty
- **WHEN** a panel's only substantive content is hidden at a narrow viewport
- **THEN** a one-sentence summary is shown in its place

#### Scenario: The link is reachable by touch
- **WHEN** the section is rendered at a narrow viewport
- **THEN** each panel's link presents a target at least 44px high

### Requirement: Charts are honest by construction
Charts presenting magnitude SHALL use a zero-based value axis. Charts SHALL NOT interpolate data points that were not measured. Where two measures of different magnitude are presented together, they SHALL NOT share a single value axis. Chart gridlines and axes SHALL be less prominent than the data they frame.

#### Scenario: Growth is not visually exaggerated
- **WHEN** a chart presents growth between two measurements
- **THEN** its value axis begins at zero

#### Scenario: Unmeasured points are not drawn
- **WHEN** only start and end measurements exist for a series
- **THEN** the chart plots those two points and does not depict intermediate values

#### Scenario: Differing magnitudes are separated
- **WHEN** two measures differing by an order of magnitude are presented in one panel
- **THEN** they are not plotted against a shared axis

### Requirement: Both locales
The section SHALL be available in Polish and English, with all step copy, exhibit labels and link text localised, and with case-study links resolving to the current locale's route.

#### Scenario: English homepage carries the section
- **WHEN** the English homepage is rendered
- **THEN** the section appears with English copy and links pointing at the English case-study routes
