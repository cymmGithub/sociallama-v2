## ADDED Requirements

### Requirement: Closing CTA composition
Each case-study detail page SHALL close with a single CTA block offering exactly one action: a primary link to the contact page. Its label SHALL be the same wording the site header's CTA uses, so a visitor meets one phrasing for one action across the site.

The block SHALL NOT carry an eyebrow label above its title, and SHALL NOT carry a secondary action back to the listing — the breadcrumb at the top of the page already provides that route, and a second button beside the conversion action competes with it.

The same primary wording SHALL be used by the closing CTA on service pages and industry pages, in both locales.

#### Scenario: One action in the closing block
- **WHEN** a case-study detail page renders its closing CTA
- **THEN** the block contains a title, supporting text, and exactly one link, which points at the contact page for the current locale

#### Scenario: Wording matches the header
- **WHEN** the closing CTA's primary label is compared to the site header's CTA label
- **THEN** they express the same phrase

#### Scenario: No eyebrow, no secondary button
- **WHEN** the closing CTA renders
- **THEN** no eyebrow label appears above its title and no link back to the case-studies listing appears inside the block

#### Scenario: Service and industry pages agree
- **WHEN** the closing CTA renders on a service page or an industry page, in either locale
- **THEN** its primary action carries the same wording as the case-study one

### Requirement: Body prose is justified on desktop
Case-study body copy — the rich-text sections and the approach-pillar bodies — SHALL be set justified from the desktop breakpoint upward, and SHALL remain ragged-right below it.

The threshold exists because **hyphenation cannot be relied on for the primary locale.** Chromium ships no Polish hyphenation dictionary (it ships Czech, Slovak and Hungarian, but not Polish), so `hyphens: auto` is a permanent no-op for Polish in Chrome, Edge, Brave and Opera; Firefox and Safari do hyphenate it. Automatic hyphenation SHALL still be requested, so the locales and engines that have a dictionary use it — but the layout SHALL NOT depend on it.

With no dictionary, justification buys flush edges by stretching the word spaces, and the cost is set by the measure. Measured as widest space against the natural space on a representative page: 3.29x at a 357px column, 1.83x at 549px, and 1.2–1.8x at every column from 700px up. Only the mobile layout degrades, so only the mobile layout stays ragged.

The lead paragraph, headings, tags and metric tiles SHALL remain ragged-right at every viewport. Justification artefacts scale with type size, so the largest text is where a bad line is most visible.

#### Scenario: Body copy is justified on desktop
- **WHEN** a case-study rich-text section or approach-pillar body renders at or above the desktop breakpoint
- **THEN** its lines are flush on both edges

#### Scenario: Narrow layouts stay ragged
- **WHEN** the same body copy renders below the desktop breakpoint
- **THEN** it is ragged-right, so a measure too narrow to justify without hyphenation is never justified

#### Scenario: Lead and headings stay ragged
- **WHEN** the same page renders its lead paragraph and section headings, at any viewport
- **THEN** they are not justified

#### Scenario: Narrow column holds up
- **WHEN** an approach pillar renders its body in the two-column layout at its narrowest
- **THEN** the justified text shows no river of whitespace spanning three or more lines

#### Scenario: Hyphenation is requested, not depended on
- **WHEN** a case study renders in a browser and locale whose engine has a matching hyphenation dictionary
- **THEN** long words break with hyphens, inherited from the page's declared language — and where no dictionary exists the layout still holds, because justification is gated on measure rather than on hyphenation
