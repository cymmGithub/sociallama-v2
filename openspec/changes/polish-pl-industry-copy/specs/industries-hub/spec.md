# industries-hub — delta

## MODIFIED Requirements

### Requirement: Index cards derive from the canonical industry module

The index SHALL render one card per industry, sourced from the canonical
industry list in the same proof-first order used by the menu, footer and
sitemap. Each card SHALL present the industry's own hero poster
(`/branze/<id>/hero.jpg` — the same asset that opens the industry's detail
page) as a full-bleed background, the industry's bare-noun `label`, and a
call-to-action reading "Więcej" (PL) / "More" (EN), linking to that
industry's detail route in the current locale. The card SHALL NOT carry the
industry tagline — the tagline belongs to the destination page. No new
per-industry copy or artwork SHALL be authored for this page; the CTA copy
SHALL come from the locale content module's `chrome.index.cardCta`, not be
hardcoded in the component.

Label and CTA SHALL remain legible over every poster: a scrim sized to the
text block (not a full-card wash) SHALL sit between the photograph and the
copy, and the copy SHALL meet WCAG AA contrast against the composited
ground beneath it on all 12 cards in both locales.

#### Scenario: All 12 industries listed in canonical order

- **WHEN** the index renders in either locale
- **THEN** it shows 12 poster cards in canonical order — Motoryzacja,
  Elektronika i AGD, Beauty, Zdrowie, Finanse, Zoologiczna, Alkohole, Moda,
  Horeca, Hotele i Miejsca Wypoczynkowe, Nieruchomości i Deweloperzy,
  Rozrywka on the Polish index (EN labels unchanged) — with labels
  identical to the menu and footer

#### Scenario: Card shows the destination's own poster

- **WHEN** an industry card renders
- **THEN** its background image is that industry's `/branze/<id>/hero.jpg`
  — the identical asset the detail page's hero opens with

#### Scenario: Cards link to locale-correct detail routes

- **WHEN** a card is activated on `/branze` or on `/en/industries`
- **THEN** it navigates to `/branze/<pl-slug>` or `/en/industries/<en-slug>`
  respectively, and that route returns 200

#### Scenario: No tagline on the card

- **WHEN** an industry card renders in either locale
- **THEN** it contains the label and the CTA but not the industry's
  `tagline`

#### Scenario: CTA reads "Więcej" / "More" from the content module

- **WHEN** the index renders on `/branze` and on `/en/industries`
- **THEN** every card's CTA reads "Więcej" on the Polish index and "More"
  on the English one, sourced from that locale's `chrome.index.cardCta`

#### Scenario: Copy stays legible on every poster

- **WHEN** the label and CTA of each of the 12 cards are measured against
  the composited scrim-over-poster ground beneath them, in both locales
- **THEN** each meets WCAG AA contrast for its size and weight

#### Scenario: Services hubs are unaffected

- **WHEN** `/uslugi` and `/en/services` render after this change
- **THEN** their cards are today's text cards — white ground, label,
  summary, their own CTA copy — with no poster, and their markup is
  unchanged by the shared component's new optional image slot
