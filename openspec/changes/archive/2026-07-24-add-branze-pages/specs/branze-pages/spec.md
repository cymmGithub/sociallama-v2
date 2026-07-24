## ADDED Requirements

### Requirement: Canonical industry list drives every surface

A single typed content module SHALL define the canonical industry list — order, PL/EN labels, PL/EN slugs — per the design D1 table (proof-first order: Automotive, Elektronika i AGD, Beauty, Health, Finanse, Petcare, then Alkohole, Fashion, Horeca, Hotele i Miejsca Wypoczynkowe, Nieruchomości i Deweloperzy, Rozrywka). The overlay menu BRANŻE column, the footer OFERTA column, `generateStaticParams`, and the sitemap SHALL all derive from this module in this order, in both locales. Labels are bare nouns — no "Branża" prefix anywhere.

#### Scenario: One list, all surfaces

- **WHEN** the menu overlay, footer, and sitemap render in either locale
- **THEN** all three present the same 12 industries in the same canonical order with identical labels and hrefs

#### Scenario: Alcohol not first

- **WHEN** the industry list renders anywhere
- **THEN** Alkohole/Alcohol appears at position 7, never first

### Requirement: Every industry resolves to a live page in both locales

Each of the 12 industries SHALL have a statically generated page at `/branze/<pl-slug>` and `/en/industries/<en-slug>`. No industry link in the menu or footer may 404. Footer OFERTA items SHALL link to these routes (replacing the current `/` placeholders).

#### Scenario: All 24 routes live

- **WHEN** any industry URL from the canonical list is requested
- **THEN** it returns 200 with that industry's page in the matching locale

#### Scenario: Footer links go live

- **WHEN** the footer renders
- **THEN** each OFERTA item navigates to its industry page, not to `/`

### Requirement: Variant is selected by proof data

Both variants SHALL open with the shared industry hero (a per-industry background clip over a plum band, with a poster fallback; solid display wordmark; lead) followed by the under-hero brief. An industry whose content entry carries a `caseStudy` block SHALL then render the proof layout: wall of real feed creatives, numbers band, quote with case-study card linking to `/case-studies/<slug>` (locale-appropriate), CTA. An industry without one SHALL render the editorial layout: a photo collage strip beneath the brief, keyword marquee, manifesto with stat chips, CTA. At ship time exactly Automotive (Volvo) and Elektronika i AGD (iRobot) are proof pages.

Note (2026-07-24): the design evolved after the proposal — a shared video hero replaced the two divergent heroes (the editorial outline-wordmark and the plain proof band), the collage moved beneath the brief and dropped its duotone, the brief's icon motifs were removed, and the client-logo strip was cut entirely (no client logos on industry pages).

#### Scenario: Proof page renders evidence

- **WHEN** `/branze/automotive` renders
- **THEN** it shows real Volvo creatives, stats consistent with the published case study, and a card linking to the Volvo case study

#### Scenario: Editorial page renders without proof affordances

- **WHEN** an industry without a `caseStudy` block renders
- **THEN** it shows the editorial layout and no case-study card, with no empty proof placeholders

#### Scenario: Future upgrade path

- **WHEN** a `caseStudy` block is added to an editorial industry's content entry
- **THEN** that page renders the proof layout with no component changes

### Requirement: Copy is industry-specific and user-approved

Every page SHALL carry copy written for that industry (hero claim, manifesto, marquee keywords, stat/value chips) in PL and EN — no shared boilerplate body across industries. Copy SHALL be reviewed by the user before ship. Proof-page statistics SHALL match the published case study verbatim.

#### Scenario: No cross-industry boilerplate

- **WHEN** any two industry pages are compared
- **THEN** their hero claims, manifestos, and marquee keyword sets differ beyond the industry name

### Requirement: Localized SEO surface for industry pages

Each page SHALL emit locale-correct metadata (title, description, OG), hreflang alternates to its counterpart with `x-default` pointing at the Polish URL, and all 24 URLs SHALL appear in the sitemap.

#### Scenario: Hreflang pair

- **WHEN** `/branze/petcare` or `/en/industries/pet` renders
- **THEN** each emits alternates referencing the other and `x-default` referencing the Polish page

#### Scenario: Sitemap coverage

- **WHEN** the sitemap is generated
- **THEN** it lists all 12 PL and all 12 EN industry URLs
