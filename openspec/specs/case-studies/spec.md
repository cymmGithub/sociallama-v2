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

The card surface SHALL be light enough that a black mark reads against it, and each cover SHALL be presented on the shared brand stage backdrop rather than as a bare full-bleed photograph.

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

#### Scenario: Cover renders on the shared brand stage
- **WHEN** any case study card renders on the listing
- **THEN** its cover is composited onto the brand stage backdrop — the plum gradient, orange glow and film-grain overlay used by the homepage stage sections — with the client's cover image presented as a framed artefact above that backdrop

#### Scenario: Stage backdrop matches the homepage
- **WHEN** the card's stage backdrop is compared with a homepage stage section
- **THEN** the gradient, glow placement and grain density are visually identical, the grain tile rendering at a fixed size independent of the panel's own dimensions

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

### Requirement: Client logos are transparent monochrome marks
Every client brand logo shown on a case-study surface SHALL be a transparent, monochrome asset carrying no baked-in background of any kind — no light plate, no dark tile, no mid-tone panel. Logos SHALL render in a single flat ink colour that contrasts with the surface behind them, without relying on a CSS filter to neutralise a background that is present in the asset.

Where a source asset cannot be recovered to this standard automatically, it SHALL be recorded as a known defect with a tracked follow-up rather than disguised by surface treatment.

#### Scenario: No logo shows a background plate
- **WHEN** any case-study logo renders on the listing or a detail page
- **THEN** no rectangular light, dark or mid-tone field is visible around the mark, on any card surface

#### Scenario: Logos with knocked-out interior detail keep it
- **WHEN** a logo whose mark contains negative space inside a filled shape renders
- **THEN** that interior detail remains visible rather than filling in as a solid silhouette

#### Scenario: A study with no logo asset is given one
- **WHEN** the `skibooking` study renders
- **THEN** it displays a brand logo rather than falling back to the client-name text

#### Scenario: Detail page uses the same presentation
- **WHEN** a case study detail page renders its client logo
- **THEN** it uses the same transparent monochrome asset and slot treatment as the listing card, with no corner-rounding applied to disguise a background

### Requirement: Logo slot normalises optical weight
The logo slot SHALL constrain every mark to a fixed box and scale it to fit within that box, so that marks of differing aspect ratio share one alignment and one baseline rather than one height. Marks SHALL additionally be balanced so that a dense wordmark and a sparse crest read at comparable visual weight across the grid.

#### Scenario: Extreme aspect ratios sit in one system
- **WHEN** the widest mark in the set and the tallest mark in the set render on adjacent cards
- **THEN** neither dominates nor disappears relative to the other, and both align to the same slot edge

#### Scenario: Slot is stable regardless of mark shape
- **WHEN** cards with marks of differing aspect ratio render in the same row
- **THEN** the vertical rhythm of the card body is identical across those cards

### Requirement: Closing CTA composition
Each case-study detail page SHALL close with a single CTA block offering exactly one action: a primary link to the contact page. Its label SHALL be the same wording the site header's CTA uses, so a visitor meets one phrasing for one action across the site.

The block SHALL NOT carry an eyebrow label above its title, and SHALL NOT carry a secondary action back to the listing — the breadcrumb at the top of the page already provides that route, and a second button beside the conversion action competes with it.

The same primary wording SHALL be used by the closing CTA on service pages and industry pages, in both locales.

#### Scenario: One action in the closing block
- **WHEN** a case-study detail page renders its closing CTA
- **THEN** the block contains a title, supporting text, and exactly one link, which points at the contact page for the current locale

#### Scenario: Wording matches the header
- **WHEN** the closing CTA's primary label is compared to the site header's CTA label
- **THEN** they express the same phrase

#### Scenario: No eyebrow, no secondary button
- **WHEN** the closing CTA renders
- **THEN** no eyebrow label appears above its title and no link back to the case-studies listing appears inside the block

#### Scenario: Service and industry pages agree
- **WHEN** the closing CTA renders on a service page or an industry page, in either locale
- **THEN** its primary action carries the same wording as the case-study one

### Requirement: Body prose is justified on desktop
Case-study body copy — the rich-text sections and the approach-pillar bodies — SHALL be set justified from the desktop breakpoint upward, and SHALL remain ragged-right below it.

The threshold exists because **hyphenation cannot be relied on for the primary locale.** Chromium ships no Polish hyphenation dictionary (it ships Czech, Slovak and Hungarian, but not Polish), so `hyphens: auto` is a permanent no-op for Polish in Chrome, Edge, Brave and Opera; Firefox and Safari do hyphenate it. Automatic hyphenation SHALL still be requested, so the locales and engines that have a dictionary use it — but the layout SHALL NOT depend on it.

With no dictionary, justification buys flush edges by stretching the word spaces, and the cost is set by the measure. Measured as widest space against the natural space on a representative page: 3.29x at a 357px column, 1.83x at 549px, and 1.2–1.8x at every column from 700px up. Only the mobile layout degrades, so only the mobile layout stays ragged.

The lead paragraph, headings, tags and metric tiles SHALL remain ragged-right at every viewport. Justification artefacts scale with type size, so the largest text is where a bad line is most visible.

#### Scenario: Body copy is justified on desktop
- **WHEN** a case-study rich-text section or approach-pillar body renders at or above the desktop breakpoint
- **THEN** its lines are flush on both edges

#### Scenario: Narrow layouts stay ragged
- **WHEN** the same body copy renders below the desktop breakpoint
- **THEN** it is ragged-right, so a measure too narrow to justify without hyphenation is never justified

#### Scenario: Lead and headings stay ragged
- **WHEN** the same page renders its lead paragraph and section headings, at any viewport
- **THEN** they are not justified

#### Scenario: Narrow column holds up
- **WHEN** an approach pillar renders its body in the two-column layout at its narrowest
- **THEN** the justified text shows no river of whitespace spanning three or more lines

#### Scenario: Hyphenation is requested, not depended on
- **WHEN** a case study renders in a browser and locale whose engine has a matching hyphenation dictionary
- **THEN** long words break with hyphens, inherited from the page's declared language — and where no dictionary exists the layout still holds, because justification is gated on measure rather than on hyphenation

