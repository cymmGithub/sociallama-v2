## ADDED Requirements

### Requirement: Replacement creatives record their source
Every creative added to a proof surface by a review pass SHALL be recorded in that change's per-image plan with its origin: the Drive file id (or path) it was supplied under, or for a licensed photograph its source URL and licence. A replacement with no recorded origin SHALL NOT be uploaded.

#### Scenario: Supplied file traces back to the folder
- **WHEN** a pillar creative is replaced from a brand's review folder
- **THEN** the plan row for the new media filename names the Drive file it was encoded from

#### Scenario: Unsourced candidate is refused
- **WHEN** the applying script finds a planned upload whose row has no origin
- **THEN** it reports the row and writes nothing for it

### Requirement: A pillar that loses its last creative keeps its copy
When a review pass removes every creative from an approach pillar and supplies no replacement, the pillar SHALL remain on the study with its tag, heading and body, rendered without a media strip. The pillar SHALL NOT be deleted, and the empty slot SHALL NOT be filled with stock or with another client's material by default.

#### Scenario: Text-only pillar renders
- **WHEN** a published study has a pillar whose `media` array is empty in the rendered locale
- **THEN** the page shows the pillar's tag, heading and body with no image container, in both locales

#### Scenario: Removal does not cascade to the pillar
- **WHEN** the applying script detaches the last creative from a pillar
- **THEN** the pillar's text fields are unchanged in both locales after the run
