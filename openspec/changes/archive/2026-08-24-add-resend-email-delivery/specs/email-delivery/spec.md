# email-delivery

## ADDED Requirements

### Requirement: Form submissions are delivered through the Resend API

Form email SHALL be sent through the Resend API using the official `resend`
SDK, authenticated by `RESEND_API_KEY`, with the sender address taken from
`EMAIL_FROM`. The sender address is the only address offered to Resend as
`from`; the submitter's address SHALL travel in `Reply-To` so the team can
answer a lead or applicant directly from the inbox.

#### Scenario: Contact submission delivers to the contact inbox

- **WHEN** a valid contact submission is made while `RESEND_API_KEY`,
  `EMAIL_FROM` and `CONTACT_INBOX` are configured
- **THEN** one email is sent via Resend from `EMAIL_FROM` to `CONTACT_INBOX`
  with the submitter's address as `Reply-To`

#### Scenario: Careers submission carries the CV as an attachment

- **WHEN** a valid careers application with a CV is submitted while delivery
  is configured
- **THEN** the email sent via Resend carries the CV file as an attachment with
  its original filename

### Requirement: Unconfigured delivery fails soft and fails loud

Delivery configuration SHALL be optional at boot: with `RESEND_API_KEY`,
`EMAIL_FROM` or the destination inbox missing, the pages still render and the
client resolves to none with a single logged warning — but any submission
made in that state SHALL return a failure state to the visitor, never a
success it did not earn.

#### Scenario: Pages render without secrets

- **WHEN** the app boots with no Resend configuration
- **THEN** `/kontakt` and `/zostan-lama` render normally and one warning names
  the missing configuration

#### Scenario: Submission without configuration reports failure

- **WHEN** a form is submitted while any of `RESEND_API_KEY`, `EMAIL_FROM` or
  the destination inbox is missing
- **THEN** the visitor sees the failure state and the gap is logged
  server-side

### Requirement: API-level send errors fail the submission

The send call SHALL treat Resend's returned `error` object as a delivery
failure equal to a thrown transport error: log it and return the failure
state. A submission SHALL NOT be reported as delivered on the strength of a
completed HTTP call alone.

#### Scenario: Resend rejects the send

- **WHEN** the Resend API responds to a send with an error (e.g. unverified
  domain, invalid sender)
- **THEN** the action logs the error and returns the failure state to the
  visitor

### Requirement: Careers mail routes to its own inbox with a warned fallback

Careers applications SHALL deliver to `CAREERS_INBOX`; when it is unset they
SHALL fall back to `CONTACT_INBOX` and log a warning naming the fallback, so
candidate documents landing in the sales inbox is a visible condition, not a
silent one.

#### Scenario: Fallback is logged

- **WHEN** an application is submitted with `CONTACT_INBOX` set and
  `CAREERS_INBOX` unset
- **THEN** the mail delivers to `CONTACT_INBOX` and a warning notes that
  `CAREERS_INBOX` is not set
