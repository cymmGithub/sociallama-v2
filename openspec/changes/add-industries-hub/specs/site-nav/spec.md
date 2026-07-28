## MODIFIED Requirements

### Requirement: Menu overlay
Activating the Menu toggle SHALL open a full-viewport overlay with a fixed `cream` theme (ink text, plum/orange accents) regardless of the chapter theme active at open time. The overlay SHALL contain two link columns and a utility row:

- **BRANŻE** (column label, not a link): the canonical 12-industry list in proof-first order — Automotive, Elektronika i AGD, Beauty, Health, Finanse, Petcare, Alkohole, Fashion, Horeca, Hotele i Miejsca Wypoczynkowe, Nieruchomości i Deweloperzy, Rozrywka — bare-noun labels (no "Branża" prefix), each linking to its industry route under `/branze/` per the canonical content module (see `branze-pages`)
- **USŁUGI** (column label, not a link): Strategia (`/uslugi/strategia`), Content (`/uslugi/content`), Sprzedaż (`/uslugi/sprzedaz`), Kreacje & Wideo (`/uslugi/kreacje-wideo`), Audyt i konsultacje (`/uslugi/audyt-i-konsultacje`), Influencer marketing (`/uslugi/influencer-marketing`), Szkolenia i kursy (`/szkolenia`)
- **Utility row** (below the columns): O NAS (`/#o-nas`), contact email (`mailto:halohalo@sociallama.pl`), social links (per the Social links set requirement)

KONTAKT does not appear as a menu item — the header CTA is the contact action.

The three `/uslugi/*` routes added for Strategia, Audyt i konsultacje, and Influencer marketing MAY not have destination pages yet; the menu items SHALL still render and link to their slugs. All 12 `/branze/*` routes SHALL resolve to live industry pages.

Below the desktop breakpoint each column SHALL be trimmed to a core subset of its items, with a "more" link appended that points at that section's index page — "Wszystkie branże" (`/branze`) and "Wszystkie usługi" (`/uslugi`), and their English counterparts. These "more" links SHALL NOT render at desktop width, where both columns already list every item. Both index destinations SHALL resolve; neither may 404.

#### Scenario: Overlay content and links
- **WHEN** the overlay is open
- **THEN** both columns render the exact items above and each item navigates to its route on click, closing the overlay

#### Scenario: Mobile columns are trimmed and offer a "more" link
- **WHEN** the overlay is open below the desktop breakpoint
- **THEN** each column shows its trimmed subset followed by a "more" link to that section's index page

#### Scenario: Desktop shows every item and no "more" link
- **WHEN** the overlay is open at desktop width
- **THEN** both columns list every item and neither renders a "more" link

#### Scenario: Index destinations resolve
- **WHEN** a "more" link is activated in either locale
- **THEN** the index page returns 200 rather than a 404

#### Scenario: Dismissal and scroll lock
- **WHEN** the overlay is open
- **THEN** page scroll is locked behind it, and pressing Escape or activating the close affordance closes it and returns focus to the Menu toggle

#### Scenario: Reduced motion
- **WHEN** the user has `prefers-reduced-motion: reduce`
- **THEN** the overlay appears and disappears without animated transition
