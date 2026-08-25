## ADDED Requirements

### Requirement: Reciprocal sitemap hreflang clusters
Every PL↔EN URL pair in the sitemap SHALL carry the same hreflang cluster (`pl`, `en`, `x-default` → PL) on **both** locales' entries — statics, careers roles, posts with an English twin, categories with an English twin, case-study details, and services/industries section pages. A document without a counterpart in the other locale SHALL carry no `languages` alternates at all. Blog pagination entries (`/blog/page/N`, `/en/blog/page/N`) SHALL carry none, because the locale page sets differ. Alternate `href`s SHALL byte-match the paired entries' `<loc>` values (no trailing-slash divergence on the home pair).

#### Scenario: English entry lists its return link
- **WHEN** the sitemap renders the entry for `https://sociallama.pl/en/about-us`
- **THEN** it carries alternates `pl` → `/o-nas`, `en` → `/en/about-us`, and `x-default` → `/o-nas`, identical to the cluster on the `/o-nas` entry

#### Scenario: Case-study pair is annotated on both sides
- **WHEN** the sitemap renders `/case-studies/irobot` and `/en/case-studies/irobot`
- **THEN** both entries carry the same `pl`/`en`/`x-default` cluster for that slug

#### Scenario: Untranslated post stays bare
- **WHEN** a Polish post has no English version
- **THEN** neither a phantom EN entry nor `languages` alternates appear for it

#### Scenario: Home cluster matches its loc
- **WHEN** the sitemap renders the home pair
- **THEN** the `pl`/`x-default` href equals the home `<loc>` exactly (no trailing-slash mismatch)
