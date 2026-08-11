# services-pages — delta

## ADDED Requirements

### Requirement: Partner covers render the collaboration pitch as paragraphs

A partner cover's copy SHALL support multiple paragraphs, rendered as separate paragraph elements. The two covers whose client documents carry multi-paragraph collaboration copy — SEOFly on the ad-campaigns page and Folks on the influencer-marketing page — SHALL present that copy's argument structure across paragraphs: the division of responsibilities between the partner and Social Lama, the benefit of the Grupa Good One model to the client, and the closing group line. Covers with single-paragraph copy SHALL continue to render unchanged.

#### Scenario: Multi-paragraph partner copy

- **WHEN** the ad-campaigns or influencer-marketing partner cover renders in either locale
- **THEN** its copy appears as more than one paragraph element, and the final paragraph closes with "Jeden partner. Wiele kompetencji. BETTER WORKS." (or its English equivalent)

#### Scenario: Single-paragraph covers unchanged

- **WHEN** the kreacje-wideo DIEA cover renders
- **THEN** its copy renders as a single paragraph exactly as before

#### Scenario: Copy stays legible over the cover video

- **WHEN** a partner cover with multi-paragraph copy renders at mobile or desktop width
- **THEN** all paragraphs meet WCAG AA contrast over the scrimmed video ground

### Requirement: Partner taglines are publisher-authored

A partner cover SHALL only display a tagline the partner actually publishes. No tagline SHALL be invented for a partner that has none.

#### Scenario: Folks carries no invented tagline

- **WHEN** the influencer-marketing partner cover renders
- **THEN** no tagline renders beneath the lockup

#### Scenario: A published tagline is kept

- **WHEN** the kreacje-wideo DIEA cover renders
- **THEN** DIEA's published "from idea to Design" tagline renders as before

### Requirement: The audit page cross-sells the group's website audits

`/uslugi/audyt-i-konsultacje` and its English counterpart SHALL close with a SEOFly partner cover that reuses the ad-campaigns cover's video assets. Its copy SHALL be complementary to the ad-campaigns block, not a duplicate: it SHALL present Social Lama as the auditor of social media profiles and SEOFly as the group's auditor of websites and SEO, and SHALL NOT present SEOFly as the provider of this page's audits. The cover SHALL close with the group line.

#### Scenario: The cover reuses the existing video

- **WHEN** the audit page's partner cover renders
- **THEN** it plays the same cover video sources as the ad-campaigns SEOFly cover, and no new video asset is introduced

#### Scenario: The boundary is stated, not blurred

- **WHEN** the audit page's partner cover copy renders in either locale
- **THEN** it names websites/SEO as SEOFly's audit domain, distinct from the social media profile audits offered by this page, and closes with "Jeden partner. Wiele kompetencji. BETTER WORKS." (or its English equivalent)

## MODIFIED Requirements

### Requirement: Documented services follow their client page structure

The three services with client copy documents — Strategia, Influencer marketing, and Audyt i konsultacje — SHALL compose the page structure those documents specify, in both locales.

#### Scenario: Strategia composition

- **WHEN** `/uslugi/strategia` renders
- **THEN** it shows a hero, a four-item benefits triptych, a checklist of strategy contents, a four-step process timeline, and a standalone-strategy banner, in that order
- **AND** no proof section appears on the page

#### Scenario: Audyt composition

- **WHEN** `/uslugi/audyt-i-konsultacje` renders
- **THEN** it shows a hero with a call-to-action, a deliverables checklist, a strip of the six audited platform marks, a consultation banner, a proof section, and a SEOFly partner cover, in that order
- **AND** no triptych appears on the page

#### Scenario: Audyt speaks the client's headline voice

- **WHEN** the audit page's checklist section renders
- **THEN** its heading is the client's "Zobacz swoją markę z nowej perspektywy" (or its English equivalent), not a generic scope heading

#### Scenario: A proof case is not duplicated across services

- **WHEN** the service pages are taken together
- **THEN** no single case study appears as the proof case on more than one of them

#### Scenario: Influencer marketing carries the group framing

- **WHEN** `/uslugi/influencer-marketing` renders
- **THEN** its Folks partner block identifies Folks as part of Grupa Good One and closes with the group line "Jeden partner. Wiele kompetencji. BETTER WORKS."

#### Scenario: A four-item triptych leaves no orphan

- **WHEN** a triptych with four items renders at desktop width
- **THEN** the items are laid out without a single item stranded alone on its own row

### Requirement: Partner covers pair the partner with Social Lama

A partner cover's branding SHALL be a joint lockup — the partner's logo, an `×` separator, then the Social Lama logo — so the section reads as a collaboration rather than the partner's own advertisement. Logos in the lockup SHALL be sized by a shared height (partner at roughly 40 px on desktop, scaled down responsively), not by width, so all partners hold one optical line despite differing logo aspect ratios. The Social Lama logo SHALL render at 1.2× the partner logo's height with an upward optical adjustment, using a light-on-dark variant whose word "social" is brand orange. The separator SHALL render in cream, neutral between the two marks. The lockup SHALL stay on a single line at mobile widths.

#### Scenario: All four partner covers carry the lockup

- **WHEN** `/uslugi/kampanie-reklamowe`, `/uslugi/kreacje-wideo`, `/uslugi/influencer-marketing`, or `/uslugi/audyt-i-konsultacje` renders its partner cover (either locale)
- **THEN** the cover shows the partner logo and the Social Lama logo joined by an `×`, in place of the former partner-only logo

#### Scenario: Logos share an optical line

- **WHEN** the lockups on the four covers are compared
- **THEN** each partner logo renders at the same height regardless of its aspect ratio, and the Social Lama logo renders taller than the partner logo (1.2×) rather than matching it

#### Scenario: Separator is cream on every cover

- **WHEN** a partner cover's lockup renders
- **THEN** its `×` is cream on all four covers, not the per-partner accent

#### Scenario: The lockup is one accessible unit

- **WHEN** the lockup is read by assistive technology
- **THEN** it exposes a single name of the form "&lt;Partner&gt; × Social Lama", with the individual images and the `×` glyph not separately announced

#### Scenario: Social Lama wears the duotone light mark

- **WHEN** the Social Lama logo renders in a lockup
- **THEN** the word "social" is brand orange and the remaining lettering and llama mark are cream, legible against the dark cover
