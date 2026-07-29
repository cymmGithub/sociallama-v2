## MODIFIED Requirements

### Requirement: Case studies listing
The site SHALL render a `/case-studies` listing page presenting published case studies as cards, each linking to its detail page, following the blog listing's structure. Each card SHALL show the study's cover, the client's brand logo, the title, the excerpt, and the study's topic tags. The client's brand logo SHALL be presented in place of the client-name text; the client name SHALL remain available as the logo's accessible name and as crawlable (visually-hidden) text so replacing the visible text with an image does not regress accessibility or SEO. When a study has no client logo, the card SHALL fall back to rendering the client name as text. The topic tags SHALL be rendered as non-interactive labels and SHALL be omitted when a study has none.

The card surface SHALL be light enough that a black mark reads against it, and each cover SHALL be presented on the shared brand stage backdrop rather than as a bare full-bleed photograph.

#### Scenario: Listing shows published studies
- **WHEN** `/case-studies` is requested
- **THEN** every published case study appears as a card linking to `/case-studies/<slug>`, drafts excluded

#### Scenario: Card shows the brand logo
- **WHEN** a case study with a client logo renders on the listing
- **THEN** the card displays the brand logo in the client slot with the client name as its accessible name, and the visible client-name text is not shown as the primary label

#### Scenario: Logo-less study falls back to text
- **WHEN** a case study without a client logo renders on the listing
- **THEN** the card displays the client name as text, as before

#### Scenario: Card shows topic tags
- **WHEN** a case study with one or more tags renders on the listing
- **THEN** the card displays those tags as non-interactive labels; a study with no tags shows no tag block

#### Scenario: Cover renders on the shared brand stage
- **WHEN** any case study card renders on the listing
- **THEN** its cover is composited onto the brand stage backdrop — the plum gradient, orange glow and film-grain overlay used by the homepage stage sections — with the client's cover image presented as a framed artefact above that backdrop

#### Scenario: Stage backdrop matches the homepage
- **WHEN** the card's stage backdrop is compared with a homepage stage section
- **THEN** the gradient, glow placement and grain density are visually identical, the grain tile rendering at a fixed size independent of the panel's own dimensions

## ADDED Requirements

### Requirement: Client logos are transparent monochrome marks
Every client brand logo shown on a case-study surface SHALL be a transparent, monochrome asset carrying no baked-in background of any kind — no light plate, no dark tile, no mid-tone panel. Logos SHALL render in a single flat ink colour that contrasts with the surface behind them, without relying on a CSS filter to neutralise a background that is present in the asset.

Where a source asset cannot be recovered to this standard automatically, it SHALL be recorded as a known defect with a tracked follow-up rather than disguised by surface treatment.

#### Scenario: No logo shows a background plate
- **WHEN** any case-study logo renders on the listing or a detail page
- **THEN** no rectangular light, dark or mid-tone field is visible around the mark, on any card surface

#### Scenario: Logos with knocked-out interior detail keep it
- **WHEN** a logo whose mark contains negative space inside a filled shape renders
- **THEN** that interior detail remains visible rather than filling in as a solid silhouette

#### Scenario: A study with no logo asset is given one
- **WHEN** the `skibooking` study renders
- **THEN** it displays a brand logo rather than falling back to the client-name text

#### Scenario: Detail page uses the same presentation
- **WHEN** a case study detail page renders its client logo
- **THEN** it uses the same transparent monochrome asset and slot treatment as the listing card, with no corner-rounding applied to disguise a background

### Requirement: Logo slot normalises optical weight
The logo slot SHALL constrain every mark to a fixed box and scale it to fit within that box, so that marks of differing aspect ratio share one alignment and one baseline rather than one height. Marks SHALL additionally be balanced so that a dense wordmark and a sparse crest read at comparable visual weight across the grid.

#### Scenario: Extreme aspect ratios sit in one system
- **WHEN** the widest mark in the set and the tallest mark in the set render on adjacent cards
- **THEN** neither dominates nor disappears relative to the other, and both align to the same slot edge

#### Scenario: Slot is stable regardless of mark shape
- **WHEN** cards with marks of differing aspect ratio render in the same row
- **THEN** the vertical rhythm of the card body is identical across those cards
