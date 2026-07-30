## ADDED Requirements

### Requirement: Case-study imagery depicts that study's own client
Every image on a case study — cover, gallery, and approach-pillar media — SHALL depict the client that study is about: its brand or mark, its products, its people or premises, or its own social-media communication such as post screenshots, creatives and campaign stills.

The following SHALL NOT appear on a case study:

- **Another client's material.** Case-study decks are authored by copying a previous client's deck, so leftover slides and images are the normal failure mode rather than an exception. An image's presence in the source deck is therefore not evidence that it belongs to that client.
- **Generic stock or library photography standing in for work.** A case study is a proof surface; an illustrative photograph presented among real creatives claims work that was not shown.
- **Template decoration and interface furniture** — placeholder rectangles, call-to-action badges, icon sets and agency contact slides carried over from the deck's chrome.
- **Any image that misrepresents the client or a person connected to it**, regardless of subject matter. A portrait carrying a job-seeking badge is disqualified even though it depicts a real person at the client.

Where an image is removed, the section SHALL be refilled from that client's own material if any exists, rather than from stock. Where nothing suitable exists, the shorter section is preferred to a substitute.

Image *quality* is not the test. A genuine client creative at modest resolution qualifies; a polished stock photograph does not.

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
- **WHEN** an image is removed and the section would otherwise be short
- **THEN** the replacement is drawn from that client's own material, and if none exists the section is left shorter rather than filled with a substitute

#### Scenario: Modest resolution is not disqualifying
- **WHEN** a genuine client creative is lower resolution than a stock alternative
- **THEN** the client creative is the one shown

#### Scenario: Replacements are described in both locales
- **WHEN** an image is added to a study
- **THEN** it carries real alt text in Polish and in English, not a placeholder

### Requirement: Imagery changes to published studies are reviewed before they are written
Case-study content is held only in the database; the Polish source drafts are not in version control. Removing or replacing imagery on a published study SHALL therefore be recorded as a per-image list — study, image, verdict, reason, and the proposed replacement where there is one — and that list SHALL be approved before any database write.

The applying script SHALL be idempotent, SHALL default to reporting rather than writing, and SHALL run against the development database and be verified there before the production database. Completion SHALL be confirmed by re-running until it reports no remaining changes, because a long production pass continues writing after its shell returns.

A `media` document SHALL be detached from a study rather than deleted unless its reference count shows no other study uses it.

#### Scenario: Nothing is written before approval
- **WHEN** the audit has identified images to remove
- **THEN** no database write has occurred, and the per-image list exists for review

#### Scenario: Every image gets a row
- **WHEN** a study is marked reviewed
- **THEN** the list carries a verdict for every one of that study's images, so a skipped image is visible as a missing row

#### Scenario: Re-running changes nothing
- **WHEN** the applying script is run a second time against the same database
- **THEN** it reports zero changes and writes nothing

#### Scenario: Shared media is detached, not deleted
- **WHEN** an image being removed from one study is also referenced by another
- **THEN** it is detached from the first study and its media document is retained

#### Scenario: Development database first
- **WHEN** the change is applied
- **THEN** it lands on the development database and is verified in the browser before the production database is touched
