# contact-form Specification

## Purpose
TBD - created by archiving change polish-forms-and-blog-nav. Update Purpose after archive.
## Requirements
### Requirement: Required consent to submit
The contact form SHALL include a required data-processing consent checkbox in both locales, and SHALL NOT submit successfully unless it is checked. The requirement SHALL be enforced twice: client-side, where the form's readiness gate blocks submission and surfaces a per-locale error while the box is unchecked, and server-side, where the action's schema rejects a payload without `consent: 'on'` with a per-locale message — so the guarantee holds even when the client-side gate is bypassed. The checkbox label SHALL carry the RODO/privacy consent copy (replacing the previous static privacy paragraph), localized in the content files for each locale.

#### Scenario: Unchecked consent blocks submission
- **WHEN** a visitor fills every other field validly but leaves the consent checkbox unchecked and attempts to submit
- **THEN** the form does not send, and a localized error indicates consent is required

#### Scenario: Checked consent allows submission
- **WHEN** a visitor fills the form validly and checks the consent checkbox
- **THEN** the submission proceeds through the existing pipeline (rate limit → Turnstile → validation) and succeeds

#### Scenario: Server rejects a bypassed client
- **WHEN** the server action receives otherwise-valid form data without `consent` set to `'on'`
- **THEN** validation fails with the locale's consent error and no email is sent

#### Scenario: Both locales carry the checkbox
- **WHEN** the form is rendered on `/kontakt` and on `/en/contact`
- **THEN** each shows the consent checkbox with its own locale's label and error copy, and the old static privacy paragraph is gone

### Requirement: Legible numbered field labels
The contact form's field labels, including their CSS-counter step-number prefix (`01 —`, `02 —`, …), SHALL render in full-strength cream (`var(--color-cream)`) — the page's own text color, matching the hero lede — instead of the muted `#8f838b`, keeping number and label text at the same strength and leaving the orange required-asterisk accent unchanged.

#### Scenario: Step numbers are cream on the dark stage
- **WHEN** the contact form renders
- **THEN** every field label and its leading step number display in full cream, at the same strength as the page's lede copy

#### Scenario: Required marker keeps its accent
- **WHEN** a required field's label renders
- **THEN** its asterisk remains in the orange accent color

