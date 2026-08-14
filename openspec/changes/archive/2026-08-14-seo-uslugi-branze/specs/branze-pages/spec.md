# branze-pages — delta

## MODIFIED Requirements

### Requirement: Localized SEO surface for industry pages

Each page SHALL emit locale-correct metadata (title, description, OG), hreflang alternates to its counterpart with `x-default` pointing at the Polish URL, and all 24 detail URLs plus both index URLs SHALL appear in the sitemap. On the two industries with measured search demand, the Polish metadata title SHALL lead with the demand phrase and the page SHALL open with a lead paragraph matching that search intent: `hotele-i-miejsca-wypoczynkowe` targets "marketing hotelu" (with "social media dla hoteli" in title or description), and `nieruchomosci-i-deweloperzy` targets "marketing nieruchomości". The remaining ten industry pages are unchanged. Lead-paragraph copy falls under the existing user-approval requirement for industry copy.

#### Scenario: Hreflang pair

- **WHEN** `/branze/petcare` or `/en/industries/pet` renders
- **THEN** each emits alternates referencing the other and `x-default` referencing the Polish page

#### Scenario: Sitemap coverage

- **WHEN** the sitemap is generated
- **THEN** it lists all 12 PL and all 12 EN industry URLs, plus `/branze` and `/en/industries`

#### Scenario: Hotels page targets its demand phrase

- **WHEN** `/branze/hotele-i-miejsca-wypoczynkowe` renders
- **THEN** its metadata title leads with "Marketing hotelu" and its opening lead paragraph addresses hotel marketing intent

#### Scenario: Real-estate page targets its demand phrase

- **WHEN** `/branze/nieruchomosci-i-deweloperzy` renders
- **THEN** its metadata title leads with "Marketing nieruchomości" and its opening lead paragraph addresses real-estate marketing intent

#### Scenario: Other industries untouched

- **WHEN** any of the other ten industry pages renders
- **THEN** its metadata and copy are unchanged by this change
