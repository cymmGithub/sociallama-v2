## ADDED Requirements

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
