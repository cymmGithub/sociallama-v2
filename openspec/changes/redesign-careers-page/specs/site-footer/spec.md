## MODIFIED Requirements

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
