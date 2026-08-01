# services-pages — delta for add-partner-cover-lockup

## ADDED Requirements

### Requirement: Partner covers pair the partner with Social Lama

A partner cover's branding SHALL be a joint lockup — the partner's logo, an `×` separator, then the Social Lama logo — so the section reads as a collaboration rather than the partner's own advertisement. Logos in the lockup SHALL be sized by a shared height (partner at roughly 40 px on desktop, scaled down responsively), not by width, so all partners hold one optical line despite differing logo aspect ratios. The Social Lama logo SHALL render at 1.2× the partner logo's height with an upward optical adjustment, using a light-on-dark variant whose word "social" is brand orange. The separator SHALL render in cream, neutral between the two marks. The lockup SHALL stay on a single line at mobile widths.

#### Scenario: All three partner covers carry the lockup

- **WHEN** `/uslugi/kampanie-reklamowe`, `/uslugi/kreacje-wideo`, or `/uslugi/influencer-marketing` renders its partner cover (either locale)
- **THEN** the cover shows the partner logo and the Social Lama logo joined by an `×`, in place of the former partner-only logo

#### Scenario: Logos share an optical line

- **WHEN** the lockups on the three covers are compared
- **THEN** each partner logo renders at the same height regardless of its aspect ratio, and the Social Lama logo renders taller than the partner logo (1.2×) rather than matching it

#### Scenario: Separator is cream on every cover

- **WHEN** a partner cover's lockup renders
- **THEN** its `×` is cream on all three covers, not the per-partner accent

#### Scenario: The lockup is one accessible unit

- **WHEN** the lockup is read by assistive technology
- **THEN** it exposes a single name of the form "&lt;Partner&gt; × Social Lama", with the individual images and the `×` glyph not separately announced

#### Scenario: Social Lama wears the duotone light mark

- **WHEN** the Social Lama logo renders in a lockup
- **THEN** the word "social" is brand orange and the remaining lettering and llama mark are cream, legible against the dark cover

## MODIFIED Requirements

### Requirement: The ad-campaigns page presents the group's search offer

`/uslugi/kampanie-reklamowe` and its English counterpart SHALL present six capability tiles — SEO, ADS, content marketing, SEO audits, websites, and analytics & reporting — followed by a partner section identifying SEOFly as part of Grupa Good One. Tiles SHALL NOT be numbered, since they describe parallel capabilities rather than a sequence.

#### Scenario: Six capability tiles

- **WHEN** the ad-campaigns page renders
- **THEN** all six tiles appear, each with its own blurb

#### Scenario: Tiles are unnumbered

- **WHEN** the capability tiles render
- **THEN** no ordinal number is shown on any tile

#### Scenario: Partner section carries the group framing

- **WHEN** the ad-campaigns page renders
- **THEN** its partner section identifies SEOFly as part of Grupa Good One and closes with the group line "Jeden partner. Wiele kompetencji. BETTER WORKS."

#### Scenario: Partner section carries the SEOFly mark

- **WHEN** the ad-campaigns page's partner section renders
- **THEN** it shows the SEOFly logo paired with the Social Lama logo in the light-on-dark lockup, and where no partner logo asset is available it renders the partner wordmark instead, with no empty logo frame
