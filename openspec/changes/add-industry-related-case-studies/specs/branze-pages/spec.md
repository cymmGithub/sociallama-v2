## ADDED Requirements

### Requirement: Industry pages link their related case studies
An industry content entry MAY carry a list of related case studies, each identified by a case-study `slug` and a locale-authored short `title`. When the list is present and non-empty, the industry page SHALL render a compact row of cards linking to `/case-studies/<slug>` in the page's own locale, in **both** the proof and editorial layout variants. The list SHALL NOT influence which layout variant is selected — an editorial industry that gains related case studies SHALL remain an editorial page, retaining its collage, keyword marquee and manifesto. When the list is absent or empty, the page SHALL render no related-studies affordance and no empty placeholder. Related-study cards SHALL NOT require a client quote.

#### Scenario: Editorial industry keeps its layout while gaining links

- **WHEN** an industry with `manifesto`, `marquee` and `collage` but no `caseStudy` block is given related case studies
- **THEN** it still renders the editorial layout with its collage, marquee and manifesto intact, plus a row of cards linking to those case studies

#### Scenario: Proof industry also shows related studies

- **WHEN** `/branze/automotive` renders
- **THEN** it shows its existing Volvo proof layout unchanged, plus a row linking to its related case studies

#### Scenario: Industry without related studies shows nothing

- **WHEN** an industry has no related case studies configured
- **THEN** the page renders no related-studies row and no empty placeholder

#### Scenario: Links are locale-correct

- **WHEN** the English industry page for a mapped industry renders
- **THEN** each related-study card links to `/en/case-studies/<slug>` using the same non-localized slug
