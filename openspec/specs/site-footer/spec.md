# site-footer Specification

## Purpose
TBD - created by archiving change add-industries-hub. Update Purpose after archive.
## Requirements
### Requirement: Footer column inventory

The footer SHALL render an invite block followed by three link columns sourced from the locale's chrome content, then a hardcoded contact column:

- **NAWIGACJA / NAVIGATION**: O NAS (`/o-nas`), BLOG (`/blog` in Polish, `/en/blog` in English), CASE STUDIES (`/case-studies`), ZOSTAŃ LAMĄ (`/zostan-lama` in Polish, `/en/become-a-lama` in English), KONTAKT (`/kontakt`) — and their English counterparts
- **USŁUGI / SERVICES**: the seven service detail pages in canonical order — Strategia, Content, Sprzedaż, Kampanie reklamowe, Kreacje & Wideo, Audyt i konsultacje, Influencer marketing — each linking to `/uslugi/<pl-slug>` or `/en/services/<en-slug>`
- **OFERTA / OFFER**: the canonical 12-industry list, each linking to its detail route (unchanged)
- **Contact column**: phone, email, addresses and the social links set (unchanged)

The USŁUGI column SHALL sit between NAWIGACJA and OFERTA.

The careers link SHALL sit between CASE STUDIES and KONTAKT in the NAWIGACJA
column.

The overlay menu SHALL also link the careers page, in its utility list,
immediately after CASE STUDIES. The menu's service and industry columns are
unaffected — careers belongs with the utility destinations, not among the
canonical service or industry lists.

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

#### Scenario: The careers page is reachable from site chrome

- **WHEN** the footer renders in either locale
- **THEN** the NAWIGACJA/NAVIGATION column contains a careers link resolving to
  `/zostan-lama` in Polish and `/en/become-a-lama` in English

#### Scenario: The overlay menu links the careers page

- **WHEN** the overlay menu renders in either locale
- **THEN** its utility list contains a careers link, directly after CASE
  STUDIES, resolving to `/zostan-lama` in Polish and `/en/become-a-lama` in
  English

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

The OFERTA column SHALL render its links in exactly two sub-columns at every width at or above the desktop breakpoint — in the two-column block band and throughout the five-track row band alike. Industry labels SHALL never be clipped; labels wider than their sub-column track wrap to a second line instead.

#### Scenario: Stacked on mobile

- **WHEN** the footer renders below 800px
- **THEN** the invite block and all four columns stack vertically in source order

#### Scenario: Two-column block on small desktops

- **WHEN** the footer renders between 800px and 1199px
- **THEN** the five cells arrange in two columns, and OFERTA renders its links in two sub-columns rather than one tall list

#### Scenario: Single row on wide screens

- **WHEN** the footer renders at 1200px or above
- **THEN** the invite block and four columns occupy one row, with OFERTA given the widest of the four link tracks

#### Scenario: OFERTA splits at laptop widths

- **WHEN** the footer renders at 1280px, 1440px or 1512px viewport width
- **THEN** OFERTA renders its links in two sub-columns

#### Scenario: OFERTA labels are never truncated

- **WHEN** the footer renders at any width at or above the desktop breakpoint
- **THEN** every industry label is fully visible — labels that do not fit their sub-column track on one line wrap instead of clipping

#### Scenario: No horizontal overflow

- **WHEN** the footer renders at 800px, 1024px, 1280px or 1600px in either locale
- **THEN** no column overflows its track and the page scrolls only vertically

### Requirement: The footer carries the consent-settings trigger

The footer's bottom legal row SHALL carry a control that reopens the consent settings panel, alongside the existing legal links, in both locales. This is the site's persistent withdrawal mechanism and SHALL be present on every page.

Because it opens a panel rather than navigating, it SHALL be a button rather than a link, while matching the legal row's visual treatment.

#### Scenario: The trigger is present site-wide

- **WHEN** the footer renders on any page in either locale
- **THEN** the bottom legal row contains a consent-settings control

#### Scenario: The trigger opens the settings panel

- **WHEN** a visitor activates the consent-settings control
- **THEN** the settings panel opens showing their current category choices

#### Scenario: It is a button, not a link

- **WHEN** the consent-settings control is inspected or read by assistive technology
- **THEN** it is announced as a button, and it does not navigate

### Requirement: The reveal never places footer content under the header

The desktop footer reveal SHALL only engage when the footer's content fits within the viewport height; otherwise the footer SHALL render in normal document flow. Footer content — the wordmark in particular — must never sit underneath the fixed header as a consequence of the sticky-bottom reveal.

#### Scenario: Default Safari window on a 1440×900 MacBook

- **WHEN** the footer renders at a 1440×760 or 1280×715 viewport and the page is scrolled to the bottom
- **THEN** the wordmark's top edge sits below the fixed header's bottom edge in both Chromium and WebKit

#### Scenario: Short windows fall back to normal flow

- **WHEN** the viewport is shorter than the height at which the footer's content fits
- **THEN** the footer participates in normal document flow (no sticky reveal) and is fully readable by scrolling

#### Scenario: Each band gets its own height threshold

- **WHEN** the footer renders between 800px and 1199px wide, where the five cells stack into a two-column block roughly twice the height of the five-track row
- **THEN** the reveal engages only in windows tall enough for that block, not at the threshold that suffices for the five-track row

#### Scenario: Tall viewports keep the reveal

- **WHEN** the footer renders at 1728×1085
- **THEN** the sticky reveal engages and the footer fills the viewport with no overlap

