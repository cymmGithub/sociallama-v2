## MODIFIED Requirements

### Requirement: Case-study imagery depicts that study's own client
Every image on a case study's **proof surface** — its gallery and its approach-pillar media — SHALL depict the client that study is about: its brand or mark, its products, its people or premises, or its own social-media communication such as post screenshots, creatives and campaign stills.

The following SHALL NOT appear on a proof surface:

- **Another client's material.** Case-study decks are authored by copying a previous client's deck, so leftover slides and images are the normal failure mode rather than an exception. An image's presence in the source deck is therefore not evidence that it belongs to that client.
- **Generic stock or library photography standing in for work.** A case study is a proof surface; an illustrative photograph presented among real creatives claims work that was not shown.
- **Template decoration and interface furniture** — placeholder rectangles, call-to-action badges, icon sets and agency contact slides carried over from the deck's chrome.
- **Any image that misrepresents the client or a person connected to it**, regardless of subject matter. A portrait carrying a job-seeking badge is disqualified even though it depicts a real person at the client.

Where a proof-surface image is removed, the section SHALL be refilled from that client's own material if any exists, rather than from stock. Where nothing suitable exists, the shorter section is preferred to a substitute.

Image *quality* is not the test for a proof surface. A genuine client creative at modest resolution qualifies; a polished stock photograph does not.

**The cover is not a proof surface.** It renders on the listing card, as the page hero, and as the social preview image — it is the study's entry point, not a claim that work was done. A cover SHOULD be the client's own material, and SHALL be where usable material exists. Licensed stock photography MAY be used as a cover, and nowhere else, when all three of the following hold:

1. the client's own material cannot supply a usable frame — either none is landscape, or the only candidate is too small for the hero without visible softening;
2. the photograph carries **no third-party brand marks**, since a competitor's logo on a multi-brand client's cover is a worse failure than a generic photograph;
3. its provenance is recorded alongside the change that placed it, so a later audit can distinguish a decision from an accident.

A cover sourced this way SHALL NOT be described in alt text as the client's own material.

#### Scenario: Another client's product appears on a study
- **WHEN** a case study's gallery contains an image of a product or creative belonging to a different client
- **THEN** that image is not shown on the study, even though it is present in that study's source deck

#### Scenario: Stock filler among real creatives
- **WHEN** a case study presents a generic library photograph alongside the client's own campaign material
- **THEN** that photograph is not shown, because its placement claims work that was not delivered

#### Scenario: Deck chrome is not content
- **WHEN** a source deck's placeholder frames, call-to-action badges, icons or agency contact slide are extracted with its images
- **THEN** none of them appear on the study

#### Scenario: A portrait that misrepresents the client
- **WHEN** an image depicts a person connected to the client but carries a job-seeking badge or other framing that misrepresents them or the client
- **THEN** that image is not shown, despite depicting a genuine subject

#### Scenario: Refill comes from the same client
- **WHEN** a proof-surface image is removed and the section would otherwise be short
- **THEN** the replacement is drawn from that client's own material, and if none exists the section is left shorter rather than filled with a substitute

#### Scenario: Modest resolution is not disqualifying on a proof surface
- **WHEN** a genuine client creative is lower resolution than a stock alternative
- **THEN** the client creative is the one shown

#### Scenario: Stock is permitted on a cover when the client has no usable frame
- **WHEN** a study's own material offers no landscape cover candidate, or only one too small to render in the hero without visible softening
- **THEN** a licensed stock photograph may be used as that study's cover, provided it carries no third-party brand marks and its source is recorded

#### Scenario: Stock is never permitted on a proof surface
- **WHEN** a licensed stock photograph is proposed for a gallery slot or an approach-pillar creative
- **THEN** it is refused regardless of how well it fits the topic, because that surface claims delivered work

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

### Requirement: A cover is composed for the crops it renders in
A case-study cover SHALL be composed for every box it is rendered into, not merely for the one it was last looked at. It is rendered into three landscape boxes, each through `objectFit: cover`, which fills the box and discards whatever does not fit:

- the listing card, **418x199** (ratio 2.10)
- the page hero, **1150x646** (ratio 1.78)
- the social preview image, **1200x630** (ratio 1.90)

A cover SHALL therefore be composed as a landscape image at a ratio near **1.9:1** — between the widest and narrowest box, so that neither crop removes anything load-bearing. A portrait or square source SHALL be recropped for these boxes before it is used; handing one to `objectFit: cover` unexamined is not composition, and it is how a headline gets sliced in half.

The cover's subject — a face, a headline, a product, a mark — SHALL fall inside the area common to all three crops. A subject placed at an edge survives one box and is cut by another.

A cover SHALL NOT be a screenshot that carries platform interface around its content: a group-name bar, an engagement row, a post header, a browser frame. The crop cuts through such furniture rather than around it, and a half-rendered interface element reads as a broken page rather than as a design choice.

Where a creative's meaning depends on text inside the image, that text SHALL be inside the common crop area or the creative SHALL NOT be used as a cover. An image whose caption carried the joke becomes an unexplained object once the caption is cropped away.

#### Scenario: Portrait source is recropped, not cropped blindly
- **WHEN** the only available cover candidate is portrait or square
- **THEN** it is recropped to a landscape frame near 1.9:1 with the subject centred, rather than passed to `objectFit: cover` as-is

#### Scenario: A headline is not sliced
- **WHEN** a cover carries text as part of the image
- **THEN** that text is either wholly inside the area common to the card, hero and OG crops, or the image is not used as a cover

#### Scenario: Platform furniture disqualifies a screenshot
- **WHEN** a candidate cover is a screenshot showing a group bar, engagement row or post header around its content
- **THEN** it is not used as a cover, because the crop will cut through that furniture

#### Scenario: The subject survives every box
- **WHEN** a cover renders on the listing card, as the hero, and as the OG image
- **THEN** its subject is fully visible in all three, not merely in the one it was checked against

#### Scenario: A joke that needs its caption keeps it
- **WHEN** a creative's meaning depends on a caption or line inside the image
- **THEN** the cover crop retains that line, or a different image is chosen
