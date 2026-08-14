# services-hub — delta

## RENAMED Requirements

- FROM: `### Requirement: The grid closes as 1 + 3 + 3`
- TO: `### Requirement: The grid closes as 1 + 3 + 3 + 1`

## MODIFIED Requirements

### Requirement: Hub cards present the approved line-art posters

The `/uslugi` and `/en/services` indexes SHALL render one poster card per page they list — the seven services in menu order, then the SEO landings — each presenting that page's approved line-art SVG artwork (direction A; the services from the mock of 2026-08-05, `prowadzenie-social-media` from the mock of 2026-08-14) as a full-bleed ground: plum field, cream strokes, exactly one orange accent element per poster. Card copy SHALL be the page `label` and the locale module's `chrome.index.cardCta` — no summaries, no new per-page copy, no photographic or raster artwork. Each card SHALL link to the page's detail route in the current locale.

#### Scenario: Eight poster cards in canonical order

- **WHEN** the hub renders in either locale
- **THEN** it shows eight poster cards in the canonical order — Strategia, Content, Sprzedaż, Kampanie reklamowe, Kreacje & Wideo, Audyt i konsultacje, Influencer marketing, Prowadzenie social media — with the seven service labels identical to the menu

#### Scenario: Card artwork matches the destination hero's

- **WHEN** a card renders
- **THEN** its artwork is the same motif that opens the destination page's hero

#### Scenario: Cards link to locale-correct routes

- **WHEN** a card is activated on `/uslugi` or `/en/services`
- **THEN** it navigates to `/uslugi/<pl-slug>` or `/en/services/<en-slug>` respectively, and that route returns 200

### Requirement: The grid closes as 1 + 3 + 3 + 1

The hub grid SHALL render Strategia as a full-width feature card in the first row and the SEO landing as a full-width feature card in the last, with the remaining six services in two rows of three between them at desktop width, leaving no orphan card. Below desktop width the grid SHALL collapse to a stacked or two-column layout with Strategia first and the landing last.

#### Scenario: No orphan row at desktop width

- **WHEN** the hub renders at desktop width
- **THEN** the first row is a single full-width Strategia card, the next six cards fill two complete rows of three, and the last row is a single full-width Prowadzenie social media card

### Requirement: Copy stays legible over every poster

Card label and CTA SHALL meet WCAG AA contrast against the composited ground beneath them on every card in both locales, using a scrim between artwork and copy where the artwork alone does not guarantee it.

#### Scenario: Label legible on every card

- **WHEN** any card renders in either locale
- **THEN** its label and CTA meet WCAG AA contrast over the artwork-plus-scrim ground
