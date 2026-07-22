## ADDED Requirements

### Requirement: Case studies collection
The system SHALL provide a Payload `case-studies` collection, editable in the Polish admin, mirroring the blog `posts` conventions. Each case study SHALL have: `title`, unique `slug`, `client` (name + logo upload), `tags`, collaboration `period`, `excerpt`, `cover` image, `challenge` and `approach` rich text, a structured `results` list of per-platform metrics (`platform`, `metric`, `value`), a `gallery` of images, an `seo` group (`metaTitle`, `metaDescription`, `ogImage`), `publishedAt`, and a draft/published status. Images SHALL use the existing `media` collection.

#### Scenario: Draft not public
- **WHEN** a case study has draft status
- **THEN** it does not appear on the listing, the sitemap, or resolve as a public detail page

#### Scenario: Published study resolves
- **WHEN** a case study is published with slug `irobot`
- **THEN** `/case-studies/irobot` renders its content and it appears on the listing and sitemap

### Requirement: Case studies listing
The site SHALL render a `/case-studies` listing page presenting published case studies as cards (cover, client, title, excerpt), each linking to its detail page, following the blog listing's structure.

#### Scenario: Listing shows published studies
- **WHEN** `/case-studies` is requested
- **THEN** every published case study appears as a card linking to `/case-studies/<slug>`, drafts excluded

### Requirement: Case study detail page
A `/case-studies/[slug]` page SHALL render the study in semantic sections: a hero (`h1` title, client + logo, tags, period), a client section, a challenge section, an approach section structured as content pillars (hashtag/label + heading + HTML copy + the campaign creatives that ran under it, at natural aspect), a results section presenting the per-platform metrics as tiles, an optional image gallery with descriptive alt text (fallback for studies without extracted creatives), and a call-to-action linking to contact and to other case studies. Unknown slugs SHALL 404.

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

### Requirement: Client CTA linking (deferred)
When a client in the ZAUFALI NAM belt has a published case study, its hover-card "Case study" CTA SHALL link to that study's detail page; clients without a study SHALL keep the current playful tooltip. This wiring lands as a follow-up after the `polish-homepage` change (which owns `home.ts`) merges.

#### Scenario: CTA links when a study exists
- **WHEN** a client with a published case study is shown in the belt and its CTA is activated
- **THEN** it navigates to that client's `/case-studies/<slug>` page

#### Scenario: CTA tooltip when no study
- **WHEN** a client without a case study has its CTA activated
- **THEN** the existing tooltip is shown and no navigation occurs
