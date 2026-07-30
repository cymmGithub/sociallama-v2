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

### Requirement: Body prose is justified with hyphenation
Case-study body copy — the rich-text sections and the approach-pillar bodies — SHALL be set justified, and SHALL enable automatic hyphenation. Hyphenation is normative rather than optional: the pillar body sits in a narrow column and Polish carries long words, so justification without hyphenation opens rivers of whitespace.

The lead paragraph, headings, tags and metric tiles SHALL remain ragged-right. Justification artefacts scale with type size, so the largest text is where a bad line is most visible.

Hyphenation SHALL rely on the document language already declared by the page, so each locale gets its own dictionary without a per-element attribute.

#### Scenario: Body copy is justified
- **WHEN** a case-study rich-text section or approach-pillar body renders
- **THEN** its lines are flush on both edges and long words break with hyphens rather than leaving large inter-word gaps

#### Scenario: Lead and headings stay ragged
- **WHEN** the same page renders its lead paragraph and section headings
- **THEN** they are not justified

#### Scenario: Narrow column holds up
- **WHEN** an approach pillar renders its body in the two-column layout at its narrowest
- **THEN** the justified text shows no river of whitespace spanning three or more lines

#### Scenario: Both locales hyphenate
- **WHEN** a case study renders in Polish and in English
- **THEN** each uses its own hyphenation dictionary, inherited from the page's declared language
