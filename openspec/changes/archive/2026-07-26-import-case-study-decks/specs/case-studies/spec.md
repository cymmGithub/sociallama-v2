## ADDED Requirements

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
