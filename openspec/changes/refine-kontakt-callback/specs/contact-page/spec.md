## MODIFIED Requirements

### Requirement: Low-friction contact form
The contact form SHALL collect four core inputs plus one optional contact input: `Imię` (required), `E-mail` (required, valid email format), service tags (optional, multi-select from Social media / Kampanie / Wideo / Strategia / Współpraca), `Wiadomość` (required), and `Telefon` (**optional**). It SHALL NOT include budget, company, position, or company-size fields — the goal is inquiry volume, not lead qualification. The `Telefon` field SHALL be presented as opt-in for a callback and SHALL NOT block submission when left blank; no strict format validation is applied so international and informal numbers are accepted. All labels, placeholders, and messages SHALL come from content modules, never hardcoded in components.

#### Scenario: Valid submission accepted
- **WHEN** a visitor submits with a non-empty name, a valid email, and a non-empty message
- **THEN** the submission is accepted and a success state is shown, whether or not a phone number was provided

#### Scenario: Invalid input blocked
- **WHEN** a required field is empty or the email is malformed
- **THEN** the form shows a field-level error and does not submit

#### Scenario: Blank phone does not block
- **WHEN** a visitor submits a valid form with the `Telefon` field left empty
- **THEN** the submission is accepted and no phone-related error is shown

### Requirement: Email delivery to the Social Lama inbox
A valid submission SHALL be emailed to the `CONTACT_INBOX` address via SMTP (nodemailer over Google Workspace), with the submitter's address set as `Reply-To` and the body including the name, email, phone (when provided), selected service tags, and message. On send failure the visitor SHALL see an error state, the failure SHALL be logged server-side, and the request SHALL NOT throw an unhandled exception.

#### Scenario: Email delivered
- **WHEN** a valid submission passes the spam and rate checks
- **THEN** an email is delivered to the configured inbox with `Reply-To` set to the submitter, and a success state is returned

#### Scenario: Phone included when provided
- **WHEN** a valid submission includes a non-empty `Telefon`
- **THEN** the delivered email body includes the phone number so the team can call back

#### Scenario: Delivery failure handled gracefully
- **WHEN** SMTP credentials are missing or the send fails
- **THEN** the visitor sees a submission-failed error, the failure is logged, and no unhandled exception propagates

## ADDED Requirements

### Requirement: Callback offer and next-steps
The `/kontakt` page SHALL lead with a concrete offer rather than an open question: the hero lede SHALL present a clear call to action to get in touch (e.g. booking a free consultation). The one-working-day (24h) response time SHALL be stated on the page — in the "what happens next" strip and the submit-row note — rather than being required in the lede. The page SHALL render a "what happens next" strip of exactly three ordered steps between the lede and the metrics band, describing (1) the visitor writing a short message, (2) the team getting back within 24h on working days, and (3) a conversation about specifics. The strip SHALL NOT promise deliverables (e.g. finished concepts) produced before that conversation. All step copy SHALL come from a content module, never hardcoded in the component.

#### Scenario: Offer is stated
- **WHEN** a visitor loads `/kontakt`
- **THEN** the lede presents a concrete call to action (rather than an open question), and the one-working-day (24h) response time is stated on the page in the next-steps strip and the submit-row note

#### Scenario: Next steps are shown
- **WHEN** a visitor loads `/kontakt`
- **THEN** a three-step strip is rendered describing write → we respond in 24h → we talk specifics, in that order

### Requirement: Privacy information note
The contact form SHALL display a short privacy note near the submit row stating that submitted data is used only to respond to the inquiry (including calling back when a phone number is provided), with a link to the existing `/polityka-prywatnosci` page. The note copy SHALL come from the content module, never hardcoded in the component.

#### Scenario: Note is visible and linked
- **WHEN** a visitor views the contact form
- **THEN** the privacy note is rendered near the submit row and its link navigates to `/polityka-prywatnosci`
