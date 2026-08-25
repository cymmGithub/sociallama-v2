# site-metadata

## Purpose

Define the site-wide document metadata baseline: Polish language and locale, Social Lama titles/description/OG identity, favicon and web-app manifest identity, and where per-page metadata may override it.
## Requirements
### Requirement: Social Lama Polish metadata baseline
The root layout SHALL declare the site's document baseline as Social Lama in Polish: `html lang="pl"`, default title `Social Lama`, title template appending `— Social Lama` to page titles, a Polish site description, `applicationName` "Social Lama", Open Graph `siteName` "Social Lama" with `locale pl_PL`, and no Satus starter branding or English-locale alternates anywhere in rendered metadata. Per-page `metadata` exports SHALL be able to override title and description while inheriting the rest.

#### Scenario: Default page metadata
- **WHEN** any page without its own metadata renders
- **THEN** the document title is "Social Lama", `<html>` carries `lang="pl"`, and OG tags carry siteName "Social Lama" with locale `pl_PL`

#### Scenario: Page override keeps the brand suffix
- **WHEN** a page (e.g. `/blog` or a post) exports its own title
- **THEN** the rendered title is "{page title} — Social Lama" and no "Satūs" string appears in the document

#### Scenario: No starter leftovers
- **WHEN** the homepage HTML is inspected
- **THEN** it contains no `Satūs` text, no `en-US` alternate link, and no English OG locale

### Requirement: Social Lama favicon and web-app identity
The site SHALL serve the Social Lama llama mark as its favicon (`/icon.png`, 192×192) and apple touch icon (`/apple-icon.png`, 180×180), matching the icons served by sociallama.pl, and the web-app manifest SHALL declare the Social Lama name and Polish description with icon entries whose declared sizes match the actual assets.

#### Scenario: Browser tab icon
- **WHEN** any page renders
- **THEN** the document links `/icon.png` (llama mark) as its icon and `/apple-icon.png` as apple-touch-icon — not the Satus starter art

#### Scenario: Manifest identity
- **WHEN** `/manifest.webmanifest` is fetched
- **THEN** its name and short_name are "Social Lama" and no `@darkroom.engineering/satus` string appears

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

