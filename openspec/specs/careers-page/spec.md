# careers-page Specification

## Purpose
TBD - created by archiving change redesign-careers-page. Update Purpose after archive.
## Requirements
### Requirement: The careers page owns its styles

The careers route SHALL define its own CSS module and SHALL NOT import a CSS
module belonging to another route. In particular it SHALL NOT import
`app/(frontend)/[slug]/post.module.css`, whose classes are written to compose
with `.stage` and produce cream-on-cream text when applied without it.

Every text element on the page SHALL meet WCAG AA contrast against the band it
is painted on, in both locales.

#### Scenario: No cross-route module import

- **WHEN** the Polish or English careers page module graph is inspected
- **THEN** it imports no `.module.css` file from another route directory

#### Scenario: The lede is legible

- **WHEN** the careers page renders in either locale
- **THEN** the hero lede text and every link inside it are visible against the
  page ground at a contrast ratio of at least 4.5:1

### Requirement: Both locales serve the careers page

The page SHALL be served at `/zostan-lama` in Polish and `/en/become-a-lama` in
English, with each declaring the other as its locale alternate. Both SHALL
render the same section composition.

#### Scenario: Locale alternates resolve

- **WHEN** either careers URL is requested
- **THEN** the response returns 200
- **AND** its alternates reference the other locale's careers URL

#### Scenario: Legacy WordPress URL still resolves

- **WHEN** the legacy `/zostan-lama/` URL is requested
- **THEN** it redirects to `/zostan-lama` and returns the careers page

### Requirement: Section composition and band order

The page SHALL render, in order: a marquee hero carrying the page's accessible
heading and lede, role panels, a benefits band, and the application form.

The bands SHALL alternate ground colour in the order deep-ink, deep-ink,
orange, deep-plum, so the benefits band is the page's only light break and sits
immediately before the form.

#### Scenario: Bands render in order

- **WHEN** the careers page renders
- **THEN** the benefits band appears after the role panels and before the
  application form

#### Scenario: The decorative marquee is not the heading

- **WHEN** assistive technology reads the page
- **THEN** exactly one `h1` names the page
- **AND** the repeating marquee text is hidden from the accessibility tree

### Requirement: The page ends on the application form

The application form SHALL be the final section of the page. No content section
SHALL follow it; only site chrome may appear below.

#### Scenario: Nothing follows the form

- **WHEN** the careers page renders
- **THEN** the next element after the application form is the site footer

### Requirement: Open roles render as selectable panels

Open roles SHALL be presented as a set of selectable panels showing one role at
a time, each listing that role's profile, responsibilities and requirements.
Panels SHALL be keyboard operable and expose their selected state to assistive
technology.

#### Scenario: One role visible at a time

- **WHEN** a visitor selects a role
- **THEN** that role's panel is shown and every other role panel is hidden

#### Scenario: Selection is announced

- **WHEN** the role controls are read by assistive technology
- **THEN** the active control reports itself as selected and names the panel it
  controls

### Requirement: Careers copy lives in locale content files

All page copy SHALL be sourced from `lib/content/zostan-lama.ts` and its English
counterpart — role definitions, benefits, form labels and status messages — and
SHALL NOT be hardcoded in component markup. The English file SHALL satisfy the
same shape as the Polish one under the translation-parity gate.

#### Scenario: Parity gate covers the careers content

- **WHEN** the translation-parity check runs
- **THEN** the English careers content is compared against the Polish shape and
  a missing or extra key fails the check

#### Scenario: Adding a role touches content only

- **WHEN** a role is added to the Polish content file and its English twin
- **THEN** the page renders the new role panel without any component change

### Requirement: Each open position has its own URL
Each open position SHALL be reachable at a dedicated, server-rendered URL in both locales — Polish `/zostan-lama/{id}` and English `/en/become-a-lama/{id}` — where `{id}` is the position's locale-independent id from the careers content. A position URL SHALL render the existing careers page composition with that position's tab active and SHALL NOT introduce a separate position-detail template. Position URLs SHALL be statically generated from the careers content, and an unknown id SHALL return a 404 via `notFound()`. Existing URLs SHALL NOT move: the base careers pages behave unchanged, and the legacy `/zostan-lama/` redirect keeps resolving.

#### Scenario: Position URL renders with its tab active
- **WHEN** a visitor opens `/zostan-lama/{id}` for an existing position
- **THEN** the careers page renders with that position's tab selected and its panel visible

#### Scenario: English position URL
- **WHEN** a visitor opens `/en/become-a-lama/{id}` for the same position
- **THEN** the English careers page renders with that position's tab selected

#### Scenario: Unknown position id
- **WHEN** a visitor opens a position URL whose id matches no current position
- **THEN** the app's 404 page is returned

#### Scenario: Base page unaffected
- **WHEN** a visitor opens `/zostan-lama` directly
- **THEN** the page behaves as before — first tab active, tabs switch client-side without navigation or URL changes

### Requirement: Position URLs land on the position
A position URL SHALL bring the position into view on load: after the page mounts, the viewport SHALL jump — instantly, without animated scrolling — to the roles section, so the shared link presents the job rather than the page hero.

#### Scenario: Shared link shows the job
- **WHEN** a visitor lands on a valid position URL
- **THEN** the roles section with the active position panel is in the viewport without the visitor scrolling

#### Scenario: Base page does not auto-scroll
- **WHEN** a visitor opens `/zostan-lama` or `/en/become-a-lama` without a position segment
- **THEN** the page loads at the top as before

### Requirement: Position URLs carry their own SEO surface
Each position URL SHALL emit its own metadata: a title and description carrying the position's name (sourced from the locale content files in both locales), OpenGraph tags so a shared link unfurls with the position title, hreflang alternates pairing the Polish and English position URLs with `x-default` pointing at the Polish URL, and locale-toggle resolution to its counterpart via the static slug map. Both locales' position URLs SHALL appear in the sitemap with their language alternates.

#### Scenario: Shared link unfurls with the job title
- **WHEN** a social platform's crawler fetches a position URL
- **THEN** the served HTML contains OG title/description naming that position, without executing client JS

#### Scenario: hreflang pairing
- **WHEN** either locale's position URL is fetched
- **THEN** its metadata lists the Polish and English counterpart URLs as language alternates with `x-default` on the Polish URL

#### Scenario: Locale toggle from a position URL
- **WHEN** a visitor on a position URL uses the locale toggle
- **THEN** they land on the same position's URL in the other locale, not the locale home

#### Scenario: Sitemap lists position URLs
- **WHEN** the sitemap is generated
- **THEN** it contains every current position URL in both locales, derived from the same careers content as the routes

### Requirement: Each position offers a share affordance
Each position's panel SHALL include a compact share row — copy-link, LinkedIn share intent, and Facebook share intent, using the site's established share behavior (shared component with the blog post share row; icons are lucide/`SocialGlyph`, never raw glyphs). The prepared link SHALL always be the absolute URL of that panel's position, regardless of which URL the page was entered from or which tab was previously active. Copy confirmation SHALL be indicated inline (temporary state change), and share labels SHALL come from the locale content files.

#### Scenario: Recruiter copies a position link
- **WHEN** a visitor on `/zostan-lama` switches to the second position's tab and activates its copy-link button
- **THEN** the clipboard receives the absolute URL of the second position, and the button shows a temporary copied confirmation

#### Scenario: Social intents target the position URL
- **WHEN** the LinkedIn or Facebook share button in a position's panel is activated
- **THEN** the intent opens with that position's absolute URL as the shared target

#### Scenario: Localized share labels
- **WHEN** the share row renders on the Polish and English careers pages
- **THEN** each shows its own locale's accessible labels from the content files

