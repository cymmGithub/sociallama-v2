# uslugi-morph-transition — delta

## RENAMED Requirements

- FROM: `### Requirement: Card poster morphs into the service hero`
- TO: `### Requirement: Card poster morphs into the destination hero`

## MODIFIED Requirements

### Requirement: Card poster morphs into the destination hero

Navigating from any poster card on the services hub SHALL, on browsers supporting same-document view transitions, animate the card's poster into the destination page's hero poster as a shared-element morph while the rest of the viewport crossfades — the seven services and the SEO landing alike, since both are addressed by the same `usluga-<id>` pair. This applies to `/uslugi` and `/en/services` alike. The morph SHALL target the hero at its final on-screen position: the arriving page is at scroll position zero in the state the browser captures, regardless of how far down the hub was scrolled at click time.

#### Scenario: Morph runs on a supported browser

- **WHEN** a visitor on a view-transition-capable browser clicks a poster card
- **THEN** the card's poster visibly expands into that page's hero artwork, and the page behind it crossfades

#### Scenario: Arrival is at the top of the page

- **WHEN** the transition's new state is captured after clicking a card on a scrolled hub
- **THEN** the destination page is at scroll position zero — the morph never animates toward an off-screen or mid-page target
