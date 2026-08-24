# careers-application-form Specification

## Purpose
TBD - created by archiving change redesign-careers-page. Update Purpose after archive.
## Requirements
### Requirement: Applications are submitted through a form, not an email link

The careers page SHALL accept applications through a form submitted to a server
action. The `mailto:` call to action SHALL be removed as the primary
application path.

The form SHALL collect the applicant's name, email address, the role applied
for, a free-text message, a CV attachment, and an explicit recruitment-consent
acknowledgement. Every one of them is required.

#### Scenario: A complete application is accepted

- **WHEN** a visitor submits the form with a name, a valid email, a selected
  role, a message, a CV, and consent granted
- **THEN** the submission is accepted and a success state is shown

#### Scenario: Missing required fields are reported per field

- **WHEN** a visitor submits with a required field empty
- **THEN** the submission is rejected
- **AND** the error is attributed to that field in the submitter's locale

### Requirement: Role selection includes a spontaneous option

The role control SHALL offer every open role from the content file plus a
spontaneous-application option, so the form remains usable when no advertised
role fits the applicant.

#### Scenario: Open roles are selectable

- **WHEN** the form renders
- **THEN** the role control lists each open role defined in the locale's content
  file, plus a spontaneous-application option

#### Scenario: An unknown role value is rejected

- **WHEN** a submission carries a role value that is not an open role or the
  spontaneous option
- **THEN** the submission is rejected

### Requirement: A CV is required, and constrained by type and size

An application SHALL carry a CV. A submission without one SHALL be rejected,
with the error attributed to the attachment control.

An attached CV SHALL be accepted only when it is a PDF or DOCX document of at
most 5 MB. The constraint SHALL be enforced in the server action's schema, and
SHALL additionally be checked in the browser before submission so an oversized
file produces a readable message rather than a runtime rejection.

The application server action's request body limit SHALL be configured above the
attachment cap, so a file within the cap is never rejected before the action
runs.

#### Scenario: An application without a CV is rejected

- **WHEN** a visitor submits the form with no file attached
- **THEN** the submission is rejected
- **AND** the error is attributed to the attachment control in the submitter's
  locale

#### Scenario: A valid CV is attached

- **WHEN** a visitor attaches a 2 MB PDF and submits
- **THEN** the submission is accepted and the file is delivered with it

#### Scenario: An oversized file is refused before submission

- **WHEN** a visitor selects a file larger than 5 MB
- **THEN** the browser reports the size limit and the form is not submitted

#### Scenario: An oversized file bypassing the browser check is rejected

- **WHEN** a submission carries an attachment larger than 5 MB
- **THEN** the server action rejects it with a size error rather than delivering
  it

#### Scenario: A disallowed file type is rejected

- **WHEN** a submission carries an attachment that is not a PDF or DOCX
- **THEN** the server action rejects it with a file-type error

#### Scenario: A CV at the cap is not blocked by the runtime

- **WHEN** a submission carries a 5 MB attachment
- **THEN** the request reaches the server action and is validated there, rather
  than failing with an untargeted request-size error

### Requirement: Consent is explicit, and marketing consent is separate

The form SHALL present two independent, unchecked-by-default consent controls:

- a **required** acknowledgement covering the storage and processing of the
  applicant's personal data so the agency can reply. A submission without it
  SHALL be rejected.
- an **optional** marketing consent, referencing the privacy policy. Declining
  it SHALL NOT affect whether the application is accepted.

The marketing permission SHALL NOT be bundled into the required consent: a
permission the applicant must grant in order to apply is not freely given.

Both consent texts SHALL be sourced from the locale content file, and the
recorded state of each SHALL be carried in the delivered application.

#### Scenario: Both consents default to unchecked

- **WHEN** the form renders
- **THEN** neither consent control is pre-selected

#### Scenario: Submission without the required consent is rejected

- **WHEN** a visitor submits without granting the required consent
- **THEN** the submission is rejected and the error is attributed to that
  control

#### Scenario: Declining marketing consent still submits

- **WHEN** a visitor completes the form, grants the required consent and leaves
  the marketing consent unchecked
- **THEN** the submission is accepted
- **AND** the delivered application records the marketing consent as not
  granted

### Requirement: Submissions are verified and rate limited

Each submission SHALL be verified with Turnstile before validation, and SHALL be
rate limited by client IP under a key distinct from the contact form's. Turnstile
SHALL fail open when unconfigured in development and fail closed in production,
matching the contact form.

#### Scenario: A failed challenge is rejected

- **WHEN** a submission arrives with a missing or invalid Turnstile token in
  production
- **THEN** it is rejected before schema validation and nothing is delivered

#### Scenario: Careers submissions do not consume the contact form's budget

- **WHEN** the careers rate limit is exhausted from one IP
- **THEN** the contact form remains submittable from that IP

### Requirement: Accepted applications are delivered to the careers inbox

An accepted application SHALL be sent to a configured careers inbox, separate
from the inbox the contact form delivers to, with the applicant's address as
reply-to, the selected role identified in the message, and the CV carried as a
file attachment. The CV SHALL NOT be persisted to storage.

When no careers inbox is configured the application SHALL still be delivered,
to the contact inbox, and the substitution SHALL be logged — a missing setting
must never cost an application, and must never pass unnoticed.

#### Scenario: The application arrives with its attachment

- **WHEN** an application with a CV is accepted
- **THEN** a message is sent to the careers inbox carrying the applicant's
  details, the selected role, and the CV as an attachment
- **AND** replying to that message addresses the applicant

#### Scenario: Candidate documents stay out of the sales-lead inbox

- **WHEN** a careers inbox is configured
- **THEN** applications are delivered there and not to the contact form's inbox

#### Scenario: A missing careers inbox does not drop the application

- **WHEN** an application is accepted while no careers inbox is configured
- **THEN** it is delivered to the contact inbox
- **AND** the substitution is logged server-side

#### Scenario: No CV is retained

- **WHEN** an application with a CV has been delivered
- **THEN** the file exists in no storage bucket, database record, or log

### Requirement: Delivery failure is reported, never masked

The action SHALL return a failure state whenever mail delivery is unavailable,
including when the email delivery client is unconfigured and resolves to none.
It SHALL NOT report success for an application it did not deliver.

#### Scenario: Unconfigured delivery fails the submission

- **WHEN** an application is submitted while email delivery is unconfigured
  (missing API key, sender address, or destination inbox)
- **THEN** the visitor is shown a failure state rather than a success
  confirmation

#### Scenario: Status messages follow the submitter's locale

- **WHEN** an application is submitted from the English careers page
- **THEN** validation errors and the success or failure message are returned in
  English

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

