# blog-post-page — delta

## ADDED Requirements

### Requirement: Back link to the blog hub
Every post page SHALL display a back link to its locale's blog hub above the header card, on the page's own light ground rather than inside the plum stage, sharing its left edge with that card at every viewport width. The breadcrumb trail inside the card remains unchanged. The link SHALL render as a `lucide-react` `ArrowLeft` icon alone — no visible label, and never a raw text glyph — which makes the locale-appropriate accessible name from the locale content files its only name, and requires a hit area of at least 44×44 CSS pixels around the icon. On Polish pages the link SHALL target `/blog`; on English pages `/en/blog`.

#### Scenario: Polish post shows the back link
- **WHEN** a visitor views a published post at its root-level Polish URL
- **THEN** a bare left-arrow link appears on the light ground above the header card, flush with the card's left edge, linking to `/blog`

#### Scenario: The icon-only link is still nameable
- **WHEN** assistive technology or a role-based query asks for the link's name
- **THEN** it resolves to the locale's back-link copy, even though the link renders no text

#### Scenario: English post shows the localized back link
- **WHEN** a visitor views the same post at its `/en/blog/{slug}` URL
- **THEN** the back link appears in the same position, linking to `/en/blog`, with English accessible copy

#### Scenario: The link tracks the card at any width
- **WHEN** the header card stops growing and centres at wide viewports
- **THEN** the back link stays flush with the card's left edge rather than with the article's padding edge

#### Scenario: Breadcrumbs are unaffected
- **WHEN** a post page renders with the back link
- **THEN** the existing breadcrumb trail (hub → category) still renders in full inside the card below it
