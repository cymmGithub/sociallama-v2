# site-footer Specification

## Purpose
TBD - created by archiving change add-industries-hub. Update Purpose after archive.
## Requirements
### Requirement: Footer column inventory

The footer SHALL render an invite block followed by three link columns sourced from the locale's chrome content, then a hardcoded contact column:

- **NAWIGACJA / NAVIGATION**: O NAS (`/o-nas`), BLOG (`/blog` in Polish, `/en/blog` in English), CASE STUDIES (`/case-studies`), KONTAKT (`/kontakt`) — and their English counterparts
- **USŁUGI / SERVICES**: the seven service detail pages in canonical order — Strategia, Content, Sprzedaż, Kampanie reklamowe, Kreacje & Wideo, Audyt i konsultacje, Influencer marketing — each linking to `/uslugi/<pl-slug>` or `/en/services/<en-slug>`
- **OFERTA / OFFER**: the canonical 12-industry list, each linking to its detail route (unchanged)
- **Contact column**: phone, email, addresses and the social links set (unchanged)

The USŁUGI column SHALL sit between NAWIGACJA and OFERTA.

#### Scenario: Both locales render four columns

- **WHEN** the footer renders on any Polish or English page
- **THEN** it shows NAWIGACJA/NAVIGATION, USŁUGI/SERVICES, OFERTA/OFFER and the contact column, in that order

#### Scenario: Every service page is reachable from the footer

- **WHEN** the USŁUGI or SERVICES column renders
- **THEN** it lists all seven services and each link returns 200 in the matching locale

#### Scenario: English footer links the English blog, not the Polish one

- **WHEN** the footer renders on an English page
- **THEN** the NAVIGATION column contains a BLOG link resolving to `/en/blog`
- **AND** it contains no link to `/blog` and no link to any category route

### Requirement: Hub pages are linked from the mobile menu only

The footer SHALL NOT link the `/uslugi`, `/en/services`, `/branze` or `/en/industries` index pages. Those index pages SHALL be reachable from site chrome only through the overlay menu's mobile-only "more" links, because the desktop menu already enumerates every child page while the mobile menu is trimmed. Both index pairs SHALL remain in the sitemap.

#### Scenario: No hub link in the footer

- **WHEN** the footer renders in either locale
- **THEN** no link resolves to `/uslugi`, `/en/services`, `/branze` or `/en/industries`

#### Scenario: Hubs stay crawlable

- **WHEN** the sitemap is generated
- **THEN** it lists all four index URLs even though desktop chrome does not link them

### Requirement: Footer grid adapts across three bands

The footer SHALL stack as a single column below the desktop breakpoint, arrange its five cells in a two-column block between the desktop breakpoint and 1200px, and lay all five out in one row at 1200px and above.

The OFERTA column SHALL flow its links into as many sub-columns as its track can fit at an 11rem floor, and SHALL never render fewer than one column of unwrapped labels. Two sub-columns are therefore reached in the two-column block band and again once the five-track row is wide enough (~1615px); between those the column renders as one clean list. Forcing two sub-columns at mid-range desktop widths is explicitly NOT required, because the widest industry label needs 223px and two non-wrapping tracks need 478px — more than the OFERTA track carries below ~1615px.

#### Scenario: Stacked on mobile

- **WHEN** the footer renders below 800px
- **THEN** the invite block and all four columns stack vertically in source order

#### Scenario: Two-column block on small desktops

- **WHEN** the footer renders between 800px and 1199px
- **THEN** the five cells arrange in two columns, and OFERTA renders its links in two sub-columns rather than one tall list

#### Scenario: Single row on wide screens

- **WHEN** the footer renders at 1200px or above
- **THEN** the invite block and four columns occupy one row, with OFERTA given the widest of the four link tracks

#### Scenario: OFERTA labels are never truncated or wrapped to fit a sub-column

- **WHEN** the footer renders at any width at or above the desktop breakpoint
- **THEN** OFERTA renders however many sub-columns its track fits, and no industry label is clipped

#### Scenario: No horizontal overflow

- **WHEN** the footer renders at 800px, 1024px, 1280px or 1600px in either locale
- **THEN** no column overflows its track and the page scrolls only vertically

