## ADDED Requirements

### Requirement: Contact page route and layout
The site SHALL serve a dedicated contact page at `/kontakt` inside the standard site chrome (Header + Footer). The page SHALL render, in order: a marquee hero reusing the shared `<Marquee>` component with the homepage treatment (a bold orange-fill line over an outline-stroke line, counter-scrolling) showing `Porozmawiajmy` and `o Twoim biznesie`; the contact form; and an orange metrics band showing `500 000 — zaangażowanych fanów`, `528 — przeprowadzonych kampanii`, `80 — zadowolonych klientów`, `7 000 000 — zasięgu na Facebooku`. `'kontakt'` SHALL be a reserved slug so no Payload post can shadow the route.

#### Scenario: Page renders
- **WHEN** a visitor requests `/kontakt`
- **THEN** the response is HTTP 200 with the marquee hero, contact form, and metrics band rendered within the site header and footer

#### Scenario: Slug is reserved
- **WHEN** a Payload editor attempts to publish a post with slug `kontakt`
- **THEN** validation rejects it because the slug is reserved

### Requirement: Low-friction contact form
The contact form SHALL collect exactly four inputs: `Imię` (required), `E-mail` (required, valid email format), service tags (optional, multi-select from Social media / Kampanie / Wideo / Strategia / Współpraca), and `Wiadomość` (required). It SHALL NOT include budget, company, or last-name fields. All labels, placeholders, and messages SHALL come from content modules, never hardcoded in components.

#### Scenario: Valid submission accepted
- **WHEN** a visitor submits with a non-empty name, a valid email, and a non-empty message
- **THEN** the submission is accepted and a success state is shown

#### Scenario: Invalid input blocked
- **WHEN** a required field is empty or the email is malformed
- **THEN** the form shows a field-level error and does not submit

### Requirement: Spam protection and rate limiting
Submissions SHALL be verified with Cloudflare Turnstile and IP rate-limited through the shared `runFormAction` harness before any email is sent.

#### Scenario: Turnstile failure rejected
- **WHEN** Turnstile verification fails for a submission
- **THEN** the submission is rejected with a security error and no email is sent

#### Scenario: Rate limit enforced
- **WHEN** a single IP exceeds the configured submission rate
- **THEN** further submissions return a rate-limited (429) state until the window resets

### Requirement: Email delivery to the Social Lama inbox
A valid submission SHALL be emailed to the `CONTACT_INBOX` address via SMTP (nodemailer over Google Workspace), with the submitter's address set as `Reply-To` and the body including the name, email, selected service tags, and message. On send failure the visitor SHALL see an error state, the failure SHALL be logged server-side, and the request SHALL NOT throw an unhandled exception.

#### Scenario: Email delivered
- **WHEN** a valid submission passes the spam and rate checks
- **THEN** an email is delivered to the configured inbox with `Reply-To` set to the submitter, and a success state is returned

#### Scenario: Delivery failure handled gracefully
- **WHEN** SMTP credentials are missing or the send fails
- **THEN** the visitor sees a submission-failed error, the failure is logged, and no unhandled exception propagates
