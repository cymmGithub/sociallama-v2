## ADDED Requirements

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
