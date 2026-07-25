## MODIFIED Requirements

### Requirement: Localized SEO surface
Every English page SHALL emit its own English metadata (title, description, OG). Every mapped page in BOTH locales — including the services index and the six service pages (`/uslugi/*` ↔ `/en/services/*`) — SHALL emit `hreflang` alternate links to its counterpart (with `x-default` pointing at the Polish version), and English URLs SHALL be included in the sitemap. The URL-parity gate for legacy Polish URLs SHALL remain green.

#### Scenario: Hreflang pairs on both sides
- **WHEN** `/kontakt` or `/en/contact` renders
- **THEN** each emits alternates referencing the other and `x-default` referencing the Polish page

#### Scenario: Services hreflang pairs
- **WHEN** any service page or the services index renders in either locale
- **THEN** it emits alternates referencing its counterpart per the canonical slug mapping and `x-default` referencing the Polish URL

#### Scenario: Sitemap covers English
- **WHEN** the sitemap is generated
- **THEN** it lists the English marketing, legal, case-study, and services URLs alongside the Polish ones
