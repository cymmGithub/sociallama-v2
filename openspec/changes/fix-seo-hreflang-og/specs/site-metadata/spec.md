## ADDED Requirements

### Requirement: Shareable Open Graph cards on hub and home pages
The hub/listing pages `/blog`, `/case-studies`, `/kontakt` and their English twins SHALL ship page-specific Open Graph metadata — the page's own title and description, `og:url` pointing at the page itself, and the brand `og:image` (`/opengraph-image.jpg`, 1200×630) — via the shared `pairMetadata` builder, not inherited root-layout values. Both home documents (`/`, `/en`) SHALL include `og:url` and the brand `og:image` alongside their bespoke OG title/description. Blog category pages retain their deliberate no-OG stance.

#### Scenario: Listing page share card
- **WHEN** `/case-studies` is shared and its OG tags are read from raw HTML
- **THEN** `og:title` is the page's own title (not the bare brand default), `og:url` is `https://sociallama.pl/case-studies`, and `og:image` is the brand card

#### Scenario: Home page carries an image
- **WHEN** `/` or `/en` is fetched
- **THEN** the document contains an `og:image` pointing at the brand card and an `og:url` pointing at that locale's root

#### Scenario: English twin mirrors the treatment
- **WHEN** `/en/contact` is fetched
- **THEN** its OG tags carry the English page title, `og:url` `https://sociallama.pl/en/contact`, and the brand image
