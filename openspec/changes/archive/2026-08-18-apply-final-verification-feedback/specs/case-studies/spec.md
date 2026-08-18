# case-studies — delta

## MODIFIED Requirements

### Requirement: Case-study imagery depicts that study's own client
Every image on a case study's **proof surface** — its gallery and its approach-pillar media — SHALL depict the client that study is about: its brand or mark, its products, its people or premises, or its own social-media communication such as post screenshots, creatives and campaign stills.

The following SHALL NOT appear on a proof surface:

- **Another client's material.** Case-study decks are authored by copying a previous client's deck, so leftover slides and images are the normal failure mode rather than an exception. An image's presence in the source deck is therefore not evidence that it belongs to that client.
- **Generic stock or library photography standing in for work without explicit approval.** A case study is a proof surface; an illustrative photograph presented among real creatives claims work that was not shown. Stock MAY fill a proof-surface slot only under the approval conditions below.
- **Template decoration and interface furniture** — placeholder rectangles, call-to-action badges, icon sets and agency contact slides carried over from the deck's chrome.
- **Any image that misrepresents the client or a person connected to it**, regardless of subject matter. A portrait carrying a job-seeking badge is disqualified even though it depicts a real person at the client.

Where a proof-surface image is removed, the section SHALL be refilled from that client's own material if any exists. Where nothing suitable exists, a licensed stock photograph MAY fill the slot instead of shortening the section, but only when all of the following hold:

1. the substitution is **explicitly approved per image** by the publisher and recorded in the change's per-image plan — stock is never a silent default;
2. the photograph carries **no third-party brand marks**;
3. its provenance (source URL and licence) is recorded alongside the change that placed it;
4. its alt text describes the photograph plainly and does not attribute the subject to the client.

Where no approval exists, the shorter section remains preferred to a substitute.

Image *quality* is not the test for a proof surface. A genuine client creative at modest resolution qualifies; a polished stock photograph does not.

**The cover is not a proof surface.** It renders on the listing card, as the page hero, and as the social preview image — it is the study's entry point, not a claim that work was done. A cover SHOULD be the client's own material, and SHALL be where usable material exists. Licensed stock photography MAY be used as a cover when all three of the following hold:

1. the client's own material cannot supply a usable frame — either none is landscape, or the only candidate is too small for the hero without visible softening;
2. the photograph carries **no third-party brand marks**, since a competitor's logo on a multi-brand client's cover is a worse failure than a generic photograph;
3. its provenance is recorded alongside the change that placed it, so a later audit can distinguish a decision from an accident.

A cover sourced this way SHALL NOT be described in alt text as the client's own material.

#### Scenario: Another client's product appears on a study
- **WHEN** a case study's gallery contains an image of a product or creative belonging to a different client
- **THEN** that image is not shown on the study, even though it is present in that study's source deck

#### Scenario: Unapproved stock filler among real creatives
- **WHEN** a case study presents a generic library photograph alongside the client's own campaign material without a recorded per-image approval
- **THEN** that photograph is not shown, because its placement claims work that was not delivered

#### Scenario: Deck chrome is not content
- **WHEN** a source deck's placeholder frames, call-to-action badges, icons or agency contact slide are extracted with its images
- **THEN** none of them appear on the study

#### Scenario: A portrait that misrepresents the client
- **WHEN** an image depicts a person connected to the client but carries a job-seeking badge or other framing that misrepresents them or the client
- **THEN** that image is not shown, despite depicting a genuine subject

#### Scenario: Refill comes from the same client first
- **WHEN** a proof-surface image is removed and the section would otherwise be short
- **THEN** the replacement is drawn from that client's own material where any exists, before stock is considered

#### Scenario: Approved stock fills a slot the client cannot
- **WHEN** the client's own material cannot fill a removed slot and the publisher has approved a specific licensed stock photograph for it in the per-image plan
- **THEN** that photograph may be shown, with no third-party marks, its provenance recorded, and alt text that does not attribute it to the client

#### Scenario: Unapproved stock is still refused
- **WHEN** a licensed stock photograph is proposed for a gallery slot or an approach-pillar creative with no recorded approval
- **THEN** it is refused regardless of how well it fits the topic

#### Scenario: Modest resolution is not disqualifying on a proof surface
- **WHEN** a genuine client creative is lower resolution than a stock alternative
- **THEN** the client creative is the one shown

#### Scenario: Stock is permitted on a cover when the client has no usable frame
- **WHEN** a study's own material offers no landscape cover candidate, or only one too small to render in the hero without visible softening
- **THEN** a licensed stock photograph may be used as that study's cover, provided it carries no third-party brand marks and its source is recorded

#### Scenario: A third-party mark disqualifies a stock cover
- **WHEN** a candidate stock cover shows another manufacturer's or platform's logo
- **THEN** it is rejected, because a competitor's mark on the client's own case study is worse than a generic image

#### Scenario: A stock cover is described as what it is
- **WHEN** alt text is written for a stock cover
- **THEN** it describes the photograph plainly and does not attribute the subject to the client

#### Scenario: Replacements are described in both locales
- **WHEN** an image is added to a study
- **THEN** it carries real alt text in Polish and in English, not a placeholder

## ADDED Requirements

### Requirement: Approach creatives render frameless
Approach-pillar creatives SHALL render as plain images without device-frame chrome: no card border, no surface plate, and no simulated phone bezel around a creative. Layout affordances that are not chrome — corner radius, spacing, and the portrait/landscape flex sizing that keeps phone-shaped creatives at phone-like width — MAY remain.

#### Scenario: Portrait creative shows no frame
- **WHEN** a published study renders an approach pillar whose creative is portrait (height > width)
- **THEN** the image appears without a border or background plate around it, sized like the frameless treatment on `riviera`

#### Scenario: No study opts back into frames
- **WHEN** any case study detail page renders
- **THEN** no approach creative carries device-frame chrome, regardless of study or locale

### Requirement: Third-party identities in screenshots are anonymized
A social-media screenshot on a proof surface that shows third parties who are not cleared for display (commenter avatars and names in moderation threads, employee account icons, visible clock times that date the capture) SHALL be anonymized rather than removed, where anonymization preserves the evidential value of the screenshot: profile photos blurred beyond recognition, real names replaced with plausible pseudonyms, and clock times or status-bar chrome cropped away. Where anonymization cannot preserve what the screenshot proves, the image SHALL be removed under the existing imagery-integrity requirement.

#### Scenario: Moderation thread is anonymized, not deleted
- **WHEN** a moderation screenshot shows real commenters' names and avatars
- **THEN** the published version shows blurred avatars and pseudonymized names, and the screenshot remains on the study

#### Scenario: Clock time is cropped
- **WHEN** a screenshot's status bar shows the capture time
- **THEN** the published version is cropped so no clock time is visible

#### Scenario: Unsalvageable screenshot is removed
- **WHEN** a screenshot's evidential content is itself the uncleared identity (e.g. a former employee is the subject)
- **THEN** the image is removed rather than anonymized
