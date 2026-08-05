# services-hub Specification

## Purpose
TBD - created by archiving change add-uslugi-poster-morph. Update Purpose after archive.
## Requirements
### Requirement: Hub cards present the approved line-art posters

The `/uslugi` and `/en/services` indexes SHALL render one poster card per service, sourced from the canonical service list in menu order, each presenting that service's approved line-art SVG artwork (direction A, mock of 2026-08-05) as a full-bleed ground: plum field, cream strokes, exactly one orange accent element per poster. Card copy SHALL be the service `label` and the locale module's `chrome.index.cardCta` — no summaries, no new per-service copy, no photographic or raster artwork. Each card SHALL link to the service's detail route in the current locale.

#### Scenario: Seven poster cards in canonical order

- **WHEN** the hub renders in either locale
- **THEN** it shows seven poster cards in the canonical order — Strategia, Content, Sprzedaż, Kampanie reklamowe, Kreacje & Wideo, Audyt i konsultacje, Influencer marketing — with labels identical to the menu

#### Scenario: Card artwork matches the destination hero's

- **WHEN** a service card renders
- **THEN** its artwork is the same motif that opens the service's detail-page hero

#### Scenario: Cards link to locale-correct routes

- **WHEN** a card is activated on `/uslugi` or `/en/services`
- **THEN** it navigates to `/uslugi/<pl-slug>` or `/en/services/<en-slug>` respectively, and that route returns 200

### Requirement: The grid closes as 1 + 3 + 3

The hub grid SHALL render Strategia as a full-width feature card in the first row, followed by the remaining six services in two rows of three at desktop width, leaving no orphan card. Below desktop width the grid SHALL collapse to a stacked or two-column layout with the feature card first.

#### Scenario: No orphan row at desktop width

- **WHEN** the hub renders at desktop width
- **THEN** the first row is a single full-width Strategia card and the following six cards fill two complete rows of three

### Requirement: Copy stays legible over every poster

Card label and CTA SHALL meet WCAG AA contrast against the composited ground beneath them on all seven cards in both locales, using a scrim between artwork and copy where the artwork alone does not guarantee it.

#### Scenario: Label legible on every card

- **WHEN** any of the seven cards renders in either locale
- **THEN** its label and CTA meet WCAG AA contrast over the artwork-plus-scrim ground

### Requirement: Poster micro-motion is disciplined and revocable

Each poster SHALL carry at most one ambient animation loop (the motion approved per motif on the 2026-08-05 mock), implemented with compositor-cheap properties only (`stroke-dashoffset`, `transform`, `opacity`), with cycle times in the 8–22s range. Draw-on accents SHALL fire once when the card enters the viewport via the existing reveal system, not on hover. Ambient loops SHALL pause while the poster is outside the viewport. Under `prefers-reduced-motion: reduce`, all poster animation — ambient and entrance — SHALL be disabled, leaving the settled artwork.

#### Scenario: Reduced motion shows settled posters

- **WHEN** the hub renders for a visitor with `prefers-reduced-motion: reduce`
- **THEN** every poster is fully drawn and static, with no ambient loops and no entrance animation

#### Scenario: Off-screen posters do not animate

- **WHEN** a poster card is scrolled out of the viewport
- **THEN** its ambient loop is paused until it re-enters

