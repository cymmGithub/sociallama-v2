## MODIFIED Requirements

### Requirement: Case studies listing
The site SHALL render a `/case-studies` listing page presenting published case studies as cards, each linking to its detail page, following the blog listing's structure. Each card SHALL show the study's cover, the study's lead metric (its first result's value and group label, per `case-study-scoreboard`), the client's brand logo, the title, and the study's topic tags. The card SHALL NOT show the excerpt. The client's brand logo SHALL be presented in place of the client-name text; the client name SHALL remain available as the logo's accessible name and as crawlable (visually-hidden) text so replacing the visible text with an image does not regress accessibility or SEO. When a study has no client logo, the card SHALL fall back to rendering the client name as text. The topic tags SHALL be rendered as non-interactive labels and SHALL be omitted when a study has none.

The card surface SHALL be light enough that a black mark reads against it, and each cover SHALL be presented on the shared brand stage backdrop rather than as a bare full-bleed photograph. The stage SHALL be the card's board: the cover fills it under the plum gradient, and the lead metric sits on the gradient's lower half.

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

#### Scenario: Card shows the lead metric, not the excerpt
- **WHEN** a case study with results renders on the listing
- **THEN** the card shows the first result's value as its numeral with the group label beneath, and the excerpt is absent from the card

#### Scenario: Cover renders on the shared brand stage
- **WHEN** any case study card renders on the listing
- **THEN** its cover is composited under the brand stage backdrop — the plum gradient, orange glow and film-grain overlay used by the homepage stage sections — with the lead metric on the gradient

#### Scenario: Stage backdrop matches the homepage
- **WHEN** the card's stage backdrop is compared with a homepage stage section
- **THEN** the gradient, glow placement and grain density are visually identical, the grain tile rendering at a fixed size independent of the panel's own dimensions

### Requirement: Case study detail page
A `/case-studies/[slug]` page SHALL render the study in semantic sections: a hero (`h1` title, client + logo, lead, tags-bearing meta rail, and the scoreboard carrying the cover and the lead metrics per `case-study-scoreboard`), a client section, a challenge section, a results section presenting the per-group metrics as a ledger, an approach section structured as content pillars (hashtag/label + heading + HTML copy + the campaign creatives that ran under it, at natural aspect), an optional image gallery with descriptive alt text (fallback for studies without extracted creatives), and a call-to-action linking to contact. From the desktop breakpoint the body SHALL carry a sticky section rail in its left column. Unknown slugs SHALL 404.

#### Scenario: Sections and headings
- **WHEN** a published case study detail page renders
- **THEN** the title is the page's single `h1`, each section is a labelled `h2`, the results render as a per-group ledger with one large numeral per group, and every gallery image has non-empty alt text

#### Scenario: Unknown slug
- **WHEN** `/case-studies/<unknown>` is requested
- **THEN** the response is 404
