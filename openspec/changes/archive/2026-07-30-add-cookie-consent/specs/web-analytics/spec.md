## ADDED Requirements

### Requirement: Storage-free analytics run without consent

Analytics that write nothing to and read nothing from the visitor's device SHALL run unconditionally, without a consent gate, since the ePrivacy consent obligation is triggered by terminal-equipment access rather than by processing alone.

Vercel Web Analytics qualifies: it sets no cookie and uses no client-side storage, identifying visitors by a hash derived server-side from the incoming request and discarded after 24 hours.

This exemption is conditional. It SHALL cease to apply if such a tool is configured in a way that writes to the device, or is sent data capable of identifying an individual.

#### Scenario: Vercel Analytics measures a refusing visitor

- **WHEN** a visitor refuses all optional categories and browses the site
- **THEN** Vercel Web Analytics still records the page views
- **AND** no cookie or storage entry attributable to it exists in the browser

### Requirement: No personal data reaches an unconsented analytics vendor

Any analytics tool running without consent SHALL NOT be sent data capable of identifying an individual. URLs and query parameters containing identifiers SHALL be redacted before transmission, and custom events SHALL NOT carry personal data.

#### Scenario: Identifiers never leave in a URL

- **WHEN** a page view occurs on a route whose path or query string carries an identifier
- **THEN** the value transmitted to the unconsented analytics vendor has that identifier redacted

#### Scenario: Custom events stay anonymous

- **WHEN** a custom event is sent to an analytics tool running without consent
- **THEN** its payload contains no email address, name, phone number or other personal identifier

### Requirement: Google Analytics loads under Consent Mode v2, defaulting to denied

Google Analytics SHALL be loaded with Google Consent Mode v2. All four v2 signals — `ad_storage`, `ad_user_data`, `ad_personalization` and `analytics_storage` — SHALL be set to `denied` before the Google tag executes, and SHALL be raised to `granted` only for categories the visitor has accepted.

The consent defaults SHALL be established by a script that executes before the Google tag is parsed. Consent signals SHALL NOT be granted by default and corrected afterwards.

#### Scenario: Defaults precede the tag

- **WHEN** any page is served
- **THEN** the consent-default script appears in the document before the Google tag script
- **AND** it sets every v2 signal to `denied`

#### Scenario: Refusal writes no Google cookie

- **WHEN** a visitor refuses the analytics category and browses several pages
- **THEN** no `_ga` or `_ga_*` cookie exists in the browser

#### Scenario: Acceptance enables measurement

- **WHEN** a visitor accepts the analytics category
- **THEN** the analytics consent signal is updated to `granted` without a page reload
- **AND** `_ga` and `_ga_*` cookies are subsequently present

### Requirement: A returning visitor's consent is applied before the first measurement

For a visitor holding a valid stored decision, the consent update SHALL be applied before the first page view is measured, so that the visit is not recorded as unconsented.

Because consent state is not readable on the server, this SHALL be achieved by reading the consent cookie synchronously in the consent-default script rather than after hydration.

#### Scenario: The first page view of a returning consenter is consented

- **WHEN** a visitor who previously accepted analytics loads a new page
- **THEN** the consent signals are already `granted` at the time the first page view is sent
- **AND** no consent update originating after hydration is required for that page view to be measured correctly

#### Scenario: A returning refuser is still refused

- **WHEN** a visitor who previously refused loads a new page
- **THEN** the consent signals remain `denied` and no Google cookie is written

### Requirement: Google Analytics exists only in production

The Google tag SHALL be rendered only when a measurement ID is configured, and that ID SHALL be configured only for the production environment, so that local development and preview deployments never send data to the analytics property.

The consent mechanism SHALL remain fully functional in environments where no measurement ID is configured, so it can be developed and tested without one.

#### Scenario: Previews do not pollute the property

- **WHEN** a page is served from a preview deployment or a local development server
- **THEN** no Google tag script is present in the document

#### Scenario: The banner works without a property

- **WHEN** no measurement ID is configured
- **THEN** the consent banner, settings panel and withdrawal control still render and record decisions

### Requirement: The consent-default script survives the site's CSP

The consent-default script is inline and unhashed. The site's Content-Security-Policy SHALL NOT carry a `script-src` directive that would block it, or the script SHALL be supplied with a matching nonce or hash.

This is recorded because the failure is silent: the script is blocked, consent defaults are never set, and analytics degrade without any visible error.

#### Scenario: A future CSP change does not silently break consent

- **WHEN** a `script-src` directive is added to the site's Content-Security-Policy
- **THEN** the consent-default script is accompanied by a nonce or hash permitting its execution
