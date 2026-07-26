## ADDED Requirements

### Requirement: Industry pages link their related case studies
An industry content entry MAY carry a list of related case studies, each identified by a case-study `slug` and a locale-authored short `title`. When the list is present and non-empty, the industry page SHALL render a compact row of cards linking to `/case-studies/<slug>` in the page's own locale. The featured case study SHALL NOT be repeated in the row. A related-study card SHALL render title-only when its study has no logo asset, rather than a broken image. When the list is absent or empty, the page SHALL render no related-studies affordance and no empty placeholder.

#### Scenario: Related studies link out

- **WHEN** an industry with related case studies renders
- **THEN** it shows a row of cards linking to each study, excluding the one already featured in its proof block

#### Scenario: Industry without related studies shows nothing

- **WHEN** an industry has no related case studies configured
- **THEN** the page renders no related-studies row and no empty placeholder

#### Scenario: Links are locale-correct

- **WHEN** the English industry page for a mapped industry renders
- **THEN** each related-study card links to `/en/case-studies/<slug>` using the same non-localized slug

#### Scenario: Missing logo degrades gracefully

- **WHEN** a related study has no `<slug>-logo.png` asset
- **THEN** its card renders the title without attempting to load an image

## MODIFIED Requirements

### Requirement: Variant is selected by proof data

Both variants SHALL open with the shared industry hero (a per-industry background clip over a plum band, with a poster fallback; solid display wordmark; lead) followed by the under-hero brief. An industry whose content entry carries a `caseStudy` block SHALL then render the proof layout: wall of real feed creatives, numbers band, quote with case-study card linking to `/case-studies/<slug>` (locale-appropriate), CTA. An industry without one SHALL render the editorial layout: a photo collage strip beneath the brief, keyword marquee, manifesto with stat chips, CTA.

Blocks SHALL render from the data present rather than being reserved to one variant: a proof page SHALL also render its `collage`, `marquee` and `manifesto` when present, so promoting an industry to a proof page never silently drops its editorial copy. The proof block's `quote` SHALL be optional — a proof page without a collected client testimonial renders its creatives, numbers and case card and simply omits the blockquote, rather than carrying an invented quote. The numbers band SHALL read a dedicated `numbers` field (case-study metrics) distinct from the manifesto's `chips` (editorial value words), so a page carrying both renders each once.

Note (2026-07-24): the design evolved after the proposal — a shared video hero replaced the two divergent heroes (the editorial outline-wordmark and the plain proof band), the collage moved beneath the brief and dropped its duotone, the brief's icon motifs were removed, and the client-logo strip was cut entirely (no client logos on industry pages).

Note (2026-07-25): with 45 imported case studies available, every industry with a matching study became a proof page featuring its strongest match — ten of twelve. Only Finanse and Fashion, which have no honest match, remain editorial.

#### Scenario: Proof page renders evidence

- **WHEN** `/branze/automotive` renders
- **THEN** it shows real Volvo creatives, stats consistent with the published case study, and a card linking to the Volvo case study

#### Scenario: Editorial page renders without proof affordances

- **WHEN** an industry without a `caseStudy` block renders
- **THEN** it shows the editorial layout and no case-study card, with no empty proof placeholders

#### Scenario: Promotion preserves editorial copy

- **WHEN** an industry that has `collage`, `marquee` and `manifesto` gains a `caseStudy` block
- **THEN** it renders the proof blocks AND still renders its collage, marquee and manifesto

#### Scenario: Proof page without a testimonial

- **WHEN** a proof industry's `caseStudy` has no `quote`
- **THEN** the page renders the creatives wall, numbers band and case-study card, and omits the blockquote entirely
