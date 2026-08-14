# careers-application-form — delta

## ADDED Requirements

### Requirement: Position URLs preselect the role
When the careers page is entered through a position URL, the application form's role select SHALL default to that position instead of the first role. The visitor SHALL remain free to change the selection, and entry through the base careers URL SHALL keep the existing default (first role). Server-side validation of the submitted role is unchanged.

#### Scenario: Deep link preselects the role
- **WHEN** a visitor lands on a position URL and scrolls to the application form
- **THEN** the role select shows that position preselected

#### Scenario: Preselection is not a lock
- **WHEN** a visitor who entered via a position URL changes the role select to another option and submits validly
- **THEN** the application is processed for the role they chose

#### Scenario: Base URL keeps the old default
- **WHEN** a visitor enters via `/zostan-lama` or `/en/become-a-lama`
- **THEN** the role select defaults to the first listed role, as before
