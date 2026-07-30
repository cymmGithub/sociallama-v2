# cookie-consent Specification

## Purpose
TBD - created by archiving change add-cookie-consent. Update Purpose after archive.
## Requirements
### Requirement: Nothing non-essential is stored before consent

No script that writes to or reads from the visitor's device — cookies, `localStorage`, `sessionStorage`, or any fingerprinting technique — SHALL execute before the visitor has given consent for the category that script belongs to, with the sole exception of the consent cookie itself.

The consent cookie is exempt because it exists solely to record the visitor's own choice and cannot function otherwise.

Analytics that touch no device storage are outside this requirement — see the `web-analytics` capability.

#### Scenario: A first-time visitor is not tracked

- **WHEN** a visitor loads any page with no consent cookie present
- **THEN** no cookie other than `sl_consent` (absent until they choose) exists in the browser
- **AND** no `localStorage` or `sessionStorage` key has been written by an analytics or marketing vendor

#### Scenario: Refusal is honoured

- **WHEN** a visitor refuses all optional categories
- **THEN** no analytics or marketing cookie is written, then or on any subsequent page view

### Requirement: Refusal is as easy as acceptance

The consent banner SHALL present acceptance and refusal as controls of equal visual weight, reachable in the same number of interactions, at the same level of the interface. Refusal SHALL NOT be available only behind a settings panel, a second screen, or a smaller or lower-contrast control.

The banner SHALL NOT offer a dismissal control that neither accepts nor refuses, and SHALL NOT treat scrolling, navigation, or continued browsing as consent.

Equal weight SHALL be structural rather than a consequence of similar label lengths, so that translating a label cannot make refusal the smaller target.

#### Scenario: Both choices are one click away at the same level

- **WHEN** the banner is shown to a visitor with no stored decision
- **THEN** an accept-all control and a refuse-all control are both directly present
- **AND** they are rendered at the same size and prominence, differing only in fill

#### Scenario: A longer translation does not shrink refusal

- **WHEN** the banner is rendered in any locale
- **THEN** the accept and refuse controls have identical width, height, padding, font size, font weight and letter spacing, whatever their labels say

#### Scenario: There is no ambiguous exit

- **WHEN** the banner is shown
- **THEN** it offers no close, dismiss or X control
- **AND** scrolling or navigating to another page leaves the banner shown and no consent recorded

### Requirement: Consent is category-level and every category is real

Consent SHALL be collected against a necessary category plus one category for each class of optional vendor the site actually operates. Optional categories SHALL default to off in the settings panel until the visitor turns them on.

The necessary category SHALL be presented as a statement that these are required, not as a disabled or pre-checked interactive control, because it offers no choice.

Each optional category SHALL disclose the vendors it covers. A category that covers no vendors SHALL NOT be presented at all: a control that changes nothing misrepresents itself, and explaining that it currently does nothing does not repair it.

Introducing a new category SHALL be accompanied by a vendor-list version increment, per the versioning requirement below.

#### Scenario: Optional categories start off

- **WHEN** a visitor with no stored decision opens the settings panel
- **THEN** every optional category's toggle is off

#### Scenario: The necessary category presents no false choice

- **WHEN** the settings panel is rendered
- **THEN** the necessary category carries no switch, checkbox or other interactive control

#### Scenario: No category without a vendor behind it

- **WHEN** the settings panel is rendered
- **THEN** every category shown covers at least one named vendor
- **AND** no toggle is present that does not gate a vendor

### Requirement: Consent is recorded, versioned, and re-sought when vendors change

The consent decision SHALL be persisted in a first-party cookie carrying, at minimum: the categories chosen, the timestamp of the choice, and the version of the vendor list the choice was made against.

The cookie SHALL be scoped `SameSite=Lax`, `Secure`, path `/`, and SHALL NOT be `httpOnly`, since it is read by client-side code.

When the set of vendors changes, the vendor-list version SHALL be incremented. A stored decision whose version does not match the current version SHALL be treated as no decision, causing the banner to be shown again.

#### Scenario: The decision is recoverable

- **WHEN** a visitor accepts or refuses
- **THEN** the stored cookie records which categories were chosen, when, and against which vendor-list version

#### Scenario: Adding a vendor re-prompts everyone

- **WHEN** a new vendor is added to a category and the vendor-list version is incremented
- **THEN** a visitor holding a decision made against the previous version is shown the banner again
- **AND** no vendor in that category is loaded until they choose again

#### Scenario: A corrupted decision is not consent

- **WHEN** the consent cookie is malformed, truncated, or hand-edited to an invalid shape
- **THEN** it is treated as no decision, the banner is shown, and nothing optional is loaded
- **AND** no error is thrown to the visitor

### Requirement: Consent can be withdrawn at any time

Site chrome SHALL provide, on every page and in both locales, a persistent control that reopens the consent settings and allows a previous decision to be changed, including withdrawing consent entirely.

Withdrawing consent for a category SHALL stop that category's vendors from being loaded on subsequent page views.

#### Scenario: Withdrawal is always reachable

- **WHEN** a visitor is on any page in either locale, having already made a decision
- **THEN** a control exists in site chrome that reopens the consent settings showing their current choices

#### Scenario: Withdrawal takes effect

- **WHEN** a visitor who previously accepted analytics withdraws that consent and reloads
- **THEN** the analytics vendor is not granted consent on the new page view

### Requirement: Consent resolution does not force dynamic rendering

Consent state SHALL be read on the client only. No server component, layout, route handler or proxy SHALL read the consent cookie, because doing so would opt the containing route tree out of static rendering.

#### Scenario: Static rendering survives

- **WHEN** the production build runs
- **THEN** every route that was statically prerendered before this change is still statically prerendered

### Requirement: The banner does not shift layout

Because consent is resolved after hydration, the banner appears after first paint. It SHALL therefore be rendered outside document flow and SHALL NOT displace page content when it appears.

The banner SHALL NOT be rendered while consent state is still unresolved, so that a visitor who has already decided never sees it flash.

#### Scenario: No layout shift on first visit

- **WHEN** a first-time visitor loads a page and the banner appears
- **THEN** no page content changes position

#### Scenario: No flash for a returning visitor

- **WHEN** a visitor with a valid stored decision loads a page
- **THEN** the banner is never rendered, at any point during load or hydration

### Requirement: Consent copy ships in both locales

Every string in the banner, the settings panel and the withdrawal control SHALL exist in Polish and English, under the same locale-parity enforcement used elsewhere in the repo. The vendor list, including each vendor's purpose and the cookies it sets, SHALL be maintained as data in a single module serving both locales.

Where an icon stands in for a word in visible copy, the word it replaces SHALL still be available to assistive technology, so that the sentence is complete when read aloud.

#### Scenario: An icon standing in for a word is still spoken

- **WHEN** the banner heading substitutes an icon for a noun
- **THEN** the icon is hidden from assistive technology
- **AND** the noun is present in the accessible text of the heading

#### Scenario: The English tree is protected too

- **WHEN** a visitor loads any page under the English locale
- **THEN** the same consent behaviour applies and all consent copy renders in English

#### Scenario: Parity is enforced, not reviewed

- **WHEN** a consent string is added to one locale but not the other
- **THEN** the type check fails

### Requirement: The privacy policy states what is actually stored

The privacy policy SHALL, in both locales, describe the cookie categories the site operates, name each vendor receiving personal data, state the cookies each sets and their retention, and explain how consent is withdrawn.

The policy SHALL NOT state or imply that consent to non-essential cookies can be given through browser settings, or through continued use of the site.

The vendor and cookie information in the policy SHALL be rendered from the same data used by the consent settings panel, so the two cannot diverge.

#### Scenario: The dead browser-settings clause is gone

- **WHEN** the privacy policy is read in either locale
- **THEN** it contains no statement that browser configuration constitutes consent to cookies

#### Scenario: The policy matches reality

- **WHEN** a visitor accepts all categories and the resulting cookies are enumerated
- **THEN** every cookie observed is declared in the privacy policy, and every cookie the policy declares for those categories is observed

