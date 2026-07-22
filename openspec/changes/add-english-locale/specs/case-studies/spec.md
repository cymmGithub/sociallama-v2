## MODIFIED Requirements

### Requirement: Case studies collection
The system SHALL provide a Payload `case-studies` collection, editable in the Polish admin, mirroring the blog `posts` conventions. Each case study SHALL have: `title`, unique `slug`, `client` (name + logo upload), `tags`, collaboration `period`, `excerpt`, `cover` image, `challenge` and `approach` rich text, a structured `results` list of per-platform metrics (`platform`, `metric`, `value`), a `gallery` of images, an `seo` group (`metaTitle`, `metaDescription`, `ogImage`), `publishedAt`, and a draft/published status. Images SHALL use the existing `media` collection. The collection's content fields (`title`, `excerpt`, `tags`, `period`, `client.about`, `challenge`, `approach`, `results` labels, and the `seo` group) SHALL be locale-aware via Payload localization with `pl` as the default locale and `en` as the second locale, with fallback to Polish for untranslated fields; `slug`, `publishedAt`, uploads, and relations SHALL NOT be localized. English translations SHALL be maintained in the repo's seed script (reproducible, not admin-only state).

#### Scenario: Draft not public
- **WHEN** a case study has draft status
- **THEN** it does not appear on the listing, the sitemap, or resolve as a public detail page

#### Scenario: Published study resolves
- **WHEN** a case study is published with slug `irobot`
- **THEN** `/case-studies/irobot` renders its content and it appears on the listing and sitemap

#### Scenario: Localized read returns the requested locale
- **WHEN** a case study is queried with `locale: 'en'`
- **THEN** localized fields return their English values, and any untranslated field falls back to its Polish value rather than rendering empty

#### Scenario: Polish reads unchanged
- **WHEN** a case study is queried without an explicit locale
- **THEN** the Polish (default-locale) content is returned exactly as before localization was introduced

## ADDED Requirements

### Requirement: English case-study pages
The site SHALL serve the case-studies listing at `/en/case-studies` and each published study at `/en/case-studies/<slug>` (same slugs as Polish), rendering English-locale content through the same components as the Polish pages, with English metadata and JSON-LD declaring `inLanguage: 'en'`, and hreflang alternate links pairing each English page with its Polish counterpart.

#### Scenario: English detail page renders translated content
- **WHEN** `/en/case-studies/irobot` is requested for a published study
- **THEN** the page renders the English title, excerpt, tags, challenge, approach, and results labels, with the same media as the Polish page

#### Scenario: English pages in the SEO surface
- **WHEN** the sitemap and page metadata are generated
- **THEN** English case-study URLs appear in the sitemap and each English page emits hreflang alternates to its Polish twin (and vice versa)
