## MODIFIED Requirements

### Requirement: Every industry resolves to a live page in both locales

Each of the 12 industries SHALL have a statically generated page at `/branze/<pl-slug>` and `/en/industries/<en-slug>`, and an index SHALL exist at `/branze` and `/en/industries` (see `industries-hub`). No industry link in the menu or footer may 404, and neither index path may 404. Footer OFERTA items SHALL link to these routes (replacing the current `/` placeholders).

#### Scenario: All 24 routes live

- **WHEN** any industry URL from the canonical list is requested
- **THEN** it returns 200 with that industry's page in the matching locale

#### Scenario: Footer links go live

- **WHEN** the footer renders
- **THEN** each OFERTA item navigates to its industry page, not to `/`

#### Scenario: Index routes live

- **WHEN** `/branze` or `/en/industries` is requested
- **THEN** it returns 200 with the industries index in the matching locale

### Requirement: Localized SEO surface for industry pages

Each page SHALL emit locale-correct metadata (title, description, OG), hreflang alternates to its counterpart with `x-default` pointing at the Polish URL, and all 24 detail URLs plus both index URLs SHALL appear in the sitemap.

#### Scenario: Hreflang pair

- **WHEN** `/branze/petcare` or `/en/industries/pet` renders
- **THEN** each emits alternates referencing the other and `x-default` referencing the Polish page

#### Scenario: Sitemap coverage

- **WHEN** the sitemap is generated
- **THEN** it lists all 12 PL and all 12 EN industry URLs, plus `/branze` and `/en/industries`
