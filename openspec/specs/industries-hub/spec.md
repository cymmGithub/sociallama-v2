# industries-hub Specification

## Purpose
TBD - created by archiving change add-industries-hub. Update Purpose after archive.
## Requirements
### Requirement: The industries index resolves in both locales

A statically generated index page SHALL exist at `/branze` and `/en/industries`, returning 200 in the matching locale. Neither path may 404, and no exemption list may excuse them from the chrome-link sweep.

#### Scenario: Both index routes are live

- **WHEN** `/branze` or `/en/industries` is requested
- **THEN** it returns 200 and renders the industries index in the matching locale

#### Scenario: No pending-page exemption remains

- **WHEN** the locale-routing chrome sweep walks every internal menu and footer link in either locale
- **THEN** it requests `/branze` and `/en/industries` without skipping them, and both respond below 400

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
- **THEN** it shows 12 poster cards in canonical order — Automotive,
  Elektronika i AGD, Beauty, Health, Finanse, Petcare, Alkohole, Fashion,
  Horeca, Hotele i Miejsca Wypoczynkowe, Nieruchomości i Deweloperzy,
  Rozrywka — with labels identical to the menu and footer

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

### Requirement: Index chrome copy is parity-gated across locales

The index heading, intro and card CTA SHALL live in the per-locale industry content module as an `index` block on the existing `chrome` export, so the shared localized-content type fails to compile when one locale is missing the block. English copy SHALL follow the established English voice.

#### Scenario: Missing English copy fails the build

- **WHEN** the Polish industry module declares `chrome.index` and the English twin does not
- **THEN** type checking fails rather than shipping an untranslated index

#### Scenario: Both locales render their own chrome

- **WHEN** the index renders on `/branze` and on `/en/industries`
- **THEN** each shows its own locale's section label, title, intro and card CTA, with no copy leaking across locales

### Requirement: Localized SEO surface for the industries index

Each index page SHALL emit locale-correct metadata (title, description, OG), hreflang alternates referencing its counterpart with `x-default` pointing at the Polish URL, and both index URLs SHALL appear in the sitemap.

#### Scenario: Hreflang pair on the index

- **WHEN** `/branze` or `/en/industries` renders
- **THEN** each emits alternates referencing the other and `x-default` referencing the Polish index

#### Scenario: Sitemap lists both index URLs

- **WHEN** the sitemap is generated
- **THEN** it contains `/branze` and `/en/industries` alongside the 24 industry detail URLs

