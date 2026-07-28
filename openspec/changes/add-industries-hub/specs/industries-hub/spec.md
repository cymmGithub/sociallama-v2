## ADDED Requirements

### Requirement: The industries index resolves in both locales

A statically generated index page SHALL exist at `/branze` and `/en/industries`, returning 200 in the matching locale. Neither path may 404, and no exemption list may excuse them from the chrome-link sweep.

#### Scenario: Both index routes are live

- **WHEN** `/branze` or `/en/industries` is requested
- **THEN** it returns 200 and renders the industries index in the matching locale

#### Scenario: No pending-page exemption remains

- **WHEN** the locale-routing chrome sweep walks every internal menu and footer link in either locale
- **THEN** it requests `/branze` and `/en/industries` without skipping them, and both respond below 400

### Requirement: Index cards derive from the canonical industry module

The index SHALL render one card per industry, sourced from the canonical industry list in the same proof-first order used by the menu, footer and sitemap. Each card SHALL show the industry's bare-noun `label`, its existing `tagline` as the card body, and a call-to-action, linking to that industry's detail route in the current locale. No new per-industry copy SHALL be authored for this page.

#### Scenario: All 12 industries listed in canonical order

- **WHEN** the index renders in either locale
- **THEN** it shows 12 cards in canonical order — Automotive, Elektronika i AGD, Beauty, Health, Finanse, Petcare, Alkohole, Fashion, Horeca, Hotele i Miejsca Wypoczynkowe, Nieruchomości i Deweloperzy, Rozrywka — with labels identical to the menu and footer

#### Scenario: Cards link to locale-correct detail routes

- **WHEN** a card is activated on `/branze` or on `/en/industries`
- **THEN** it navigates to `/branze/<pl-slug>` or `/en/industries/<en-slug>` respectively, and that route returns 200

#### Scenario: Card body reuses the industry tagline

- **WHEN** an industry card renders
- **THEN** its body text is that industry's existing `tagline`, not newly authored copy

#### Scenario: A long tagline does not break the grid

- **WHEN** the industry with the longest tagline renders in either locale
- **THEN** its card body is clamped and the card grid stays aligned

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
