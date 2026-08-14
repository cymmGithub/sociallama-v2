# blog-post-page — delta

## ADDED Requirements

### Requirement: Back link to the blog hub
Every post page SHALL display a back link to its locale's blog hub at the top-left of the header stage, rendered before (above) the breadcrumb trail, which remains unchanged. The link SHALL consist of a `lucide-react` `ArrowLeft` icon and a text label ("Blog"), never a raw text glyph, and SHALL carry a locale-appropriate accessible name sourced from the locale content files. On Polish pages the link SHALL target `/blog`; on English pages `/en/blog`.

#### Scenario: Polish post shows the back link
- **WHEN** a visitor views a published post at its root-level Polish URL
- **THEN** a "Blog" back link with a left-arrow icon appears at the top-left of the header stage above the breadcrumbs, linking to `/blog`

#### Scenario: English post shows the localized back link
- **WHEN** a visitor views the same post at its `/en/blog/{slug}` URL
- **THEN** the back link appears in the same position, linking to `/en/blog`, with English accessible copy

#### Scenario: Breadcrumbs are unaffected
- **WHEN** a post page renders with the back link
- **THEN** the existing breadcrumb trail (hub → category) still renders in full beneath it
