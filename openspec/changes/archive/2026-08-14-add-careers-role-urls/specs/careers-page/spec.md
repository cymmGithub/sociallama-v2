# careers-page — delta

## ADDED Requirements

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
