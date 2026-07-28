# case-studies

## Purpose

Turn the ZAUFALI NAM belt's dead "Case study" CTA into real, SEO-strong destinations: a CMS-editable `case-studies` collection surfaced as a `/case-studies` listing and `/case-studies/[slug]` detail pages, each rendering a study's client, challenge, approach (content pillars with the campaign creatives that ran under them), per-platform metrics, and a unique metadata + JSON-LD surface.
## Requirements
### Requirement: Case studies collection
The system SHALL provide a Payload `case-studies` collection, editable in the Polish admin, mirroring the blog `posts` conventions. Each case study SHALL have: `title`, unique `slug`, `client` (name + logo upload), `tags`, `excerpt`, `cover` image, `challenge` and `approach` rich text, a structured `results` list of per-platform metrics (`platform`, `metric`, `value`), a `gallery` of images, an `seo` group (`metaTitle`, `metaDescription`, `ogImage`), `publishedAt`, and a draft/published status. Images SHALL use the existing `media` collection. The collection's content fields (`title`, `excerpt`, `tags`, `client.about`, `challenge`, `approach`, `results` labels, and the `seo` group) SHALL be locale-aware via Payload localization with `pl` as the default locale and `en` as the second locale, with fallback to Polish for untranslated fields; `slug`, `publishedAt`, uploads, and relations SHALL NOT be localized. English translations SHALL be maintained in the repo's seed script (reproducible, not admin-only state).

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

### Requirement: Case study content pipeline
The repo SHALL provide a reproducible path from a source client deck (PPTX or PDF) to a case-study document: a deterministic extraction step that stages each deck's text and embedded creatives into a per-brand working draft, followed by a curated authoring step that fills the study's fields to the quality of the existing seeded studies (`challenge` as an introduction plus ordered objectives, `approach` as hashtag-labelled content pillars each carrying its creatives, `results` as per-platform metric tiles). Imported studies SHALL be created as `case-studies` documents via a re-runnable step that is idempotent by `slug` (re-running updates the existing document rather than duplicating it). Source decks SHALL NOT be committed to the repo.

#### Scenario: Import is idempotent
- **WHEN** the import step runs twice for the same brand `slug`
- **THEN** exactly one `case-studies` document exists for that slug, updated to the latest curated content

#### Scenario: Extraction is reproducible
- **WHEN** the extraction step runs against a deck
- **THEN** it produces the brand's staged text and creative images without manual per-deck tooling changes, for both PPTX and PDF decks

### Requirement: Imported studies are draft and Polish-first
Imported case studies SHALL be created with draft status and Polish (`pl`) content, with English fields left untranslated. An imported study SHALL become published only by an explicit, per-study action taken after the client is confirmed cleared for public display. Until published, an imported study SHALL follow the existing draft behaviour (absent from the listing, sitemap, and public detail routes). Untranslated English reads SHALL rely on the existing Polish fallback rather than blocking the study.

#### Scenario: Imported study starts unpublished
- **WHEN** a study is imported from a deck
- **THEN** it has draft status and does not appear on the listing, sitemap, or as a public detail page

#### Scenario: Polish-only imported study reads in English via fallback
- **WHEN** an imported study with no English translation is queried with `locale: 'en'`
- **THEN** its Polish content is returned via the existing fallback rather than rendering empty

#### Scenario: Publish is gated on clearance
- **WHEN** an imported study is published
- **THEN** it is because a per-study publish action was taken after the client-permission gate cleared, not as an automatic result of import

### Requirement: Case studies listing
The site SHALL render a `/case-studies` listing page presenting published case studies as cards, each linking to its detail page, following the blog listing's structure. Each card SHALL show the study's cover, the client's brand logo, the title, the excerpt, and the study's topic tags. The client's brand logo SHALL be presented in place of the client-name text; the client name SHALL remain available as the logo's accessible name and as crawlable (visually-hidden) text so replacing the visible text with an image does not regress accessibility or SEO. When a study has no client logo, the card SHALL fall back to rendering the client name as text. The topic tags SHALL be rendered as non-interactive labels and SHALL be omitted when a study has none.

#### Scenario: Listing shows published studies
- **WHEN** `/case-studies` is requested
- **THEN** every published case study appears as a card linking to `/case-studies/<slug>`, drafts excluded

#### Scenario: Card shows the brand logo
- **WHEN** a case study with a client logo renders on the listing
- **THEN** the card displays the brand logo in the client slot with the client name as its accessible name, and the visible client-name text is not shown as the primary label

#### Scenario: Logo-less study falls back to text
- **WHEN** a case study without a client logo renders on the listing
- **THEN** the card displays the client name as text, as before

#### Scenario: Card shows topic tags
- **WHEN** a case study with one or more tags renders on the listing
- **THEN** the card displays those tags as non-interactive labels; a study with no tags shows no tag block

### Requirement: Case study detail page
A `/case-studies/[slug]` page SHALL render the study in semantic sections: a hero (`h1` title, client + logo, tags), a client section, a challenge section, an approach section structured as content pillars (hashtag/label + heading + HTML copy + the campaign creatives that ran under it, at natural aspect), a results section presenting the per-platform metrics as tiles, an optional image gallery with descriptive alt text (fallback for studies without extracted creatives), and a call-to-action linking to contact and to other case studies. Unknown slugs SHALL 404.

#### Scenario: Sections and headings
- **WHEN** a published case study detail page renders
- **THEN** the title is the page's single `h1`, each section is a labelled `h2`, the results render as per-platform metric tiles, and every gallery image has non-empty alt text

#### Scenario: Unknown slug
- **WHEN** `/case-studies/<unknown>` is requested
- **THEN** the response is 404

### Requirement: Case study SEO surface
Each case study detail page SHALL emit unique metadata (title, description, canonical `/case-studies/<slug>`, Open Graph) and JSON-LD structured data (`Article` with the client as `about`, plus `BreadcrumbList`). Published case studies and the listing SHALL be included in `sitemap.ts`; drafts SHALL NOT.

#### Scenario: Structured data and canonical
- **WHEN** a published case study detail page renders
- **THEN** its head carries a unique title/description, a canonical URL of `/case-studies/<slug>`, and a valid `Article` + `BreadcrumbList` JSON-LD block

#### Scenario: Sitemap inclusion
- **WHEN** `sitemap.xml` is generated
- **THEN** the `/case-studies` listing and every published case study URL are present, and no draft URL appears

### Requirement: Client CTA linking
When a client in the ZAUFALI NAM belt has a published case study, its hover-card "Case study" CTA SHALL link to that study's detail page; clients without a study SHALL keep the current playful tooltip.

#### Scenario: CTA links when a study exists
- **WHEN** a client with a published case study is shown in the belt and its CTA is activated
- **THEN** it navigates to that client's `/case-studies/<slug>` page

#### Scenario: CTA tooltip when no study
- **WHEN** a client without a case study has its CTA activated
- **THEN** the existing tooltip is shown and no navigation occurs

### Requirement: English case-study pages
The site SHALL serve the case-studies listing at `/en/case-studies` and each published study at `/en/case-studies/<slug>` (same slugs as Polish), rendering English-locale content through the same components as the Polish pages, with English metadata and JSON-LD declaring `inLanguage: 'en'`, and hreflang alternate links pairing each English page with its Polish counterpart.

#### Scenario: English detail page renders translated content
- **WHEN** `/en/case-studies/irobot` is requested for a published study
- **THEN** the page renders the English title, excerpt, tags, challenge, approach, and results labels, with the same media as the Polish page

#### Scenario: English pages in the SEO surface
- **WHEN** the sitemap and page metadata are generated
- **THEN** English case-study URLs appear in the sitemap and each English page emits hreflang alternates to its Polish twin (and vice versa)

### Requirement: Imported studies gain English translations
For each imported `case-studies` document that has Polish content, the repo SHALL provide a reproducible, re-runnable step that populates the `en` locale's fields (`title`, `excerpt`, `tags`, `client.about`, `challenge`, each `approach` pillar's `tag`, `heading` and `body`, and `results` metric labels) with translated content, without altering the document's draft/published status or its media/creative associations. Re-running the step for the same slug SHALL update the existing document's `en` locale rather than creating a new document or duplicating media uploads.

#### Scenario: English locale renders translated content after the step runs
- **WHEN** a case study's `en` locale fields have been populated by the translation step
- **THEN** querying the study with `locale: 'en'` returns the translated text for those fields instead of falling back to Polish

#### Scenario: Re-running translation is idempotent
- **WHEN** the translation step runs twice for the same slug
- **THEN** exactly one `case-studies` document exists for that slug, with its `en` locale fields matching the latest run, and no duplicate media uploads occur

#### Scenario: Pillar media is reused, not re-uploaded
- **WHEN** the translation step populates a pillar's English `heading` and `body`
- **THEN** that pillar's `media` array on the document is unchanged from the Polish `approach` entry at the same index — no new media collection documents are created by this step
