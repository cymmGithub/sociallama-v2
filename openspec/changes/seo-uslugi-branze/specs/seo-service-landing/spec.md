# seo-service-landing

## ADDED Requirements

### Requirement: The landing resolves in both locales

A statically generated landing page SHALL exist at
`/uslugi/prowadzenie-social-media` and `/en/services/social-media-management`,
emitting locale-correct metadata, hreflang alternates to its counterpart with
`x-default` pointing at the Polish URL, and both URLs SHALL appear in the
sitemap.

#### Scenario: Both routes live

- **WHEN** either landing URL is requested
- **THEN** it returns 200 with the page in the matching locale

#### Scenario: Hreflang pair

- **WHEN** either locale's landing renders
- **THEN** it emits alternates referencing the other and `x-default` referencing the Polish page

#### Scenario: Sitemap coverage

- **WHEN** the sitemap is generated
- **THEN** it lists both landing URLs

### Requirement: The page targets the "prowadzenie social media" cluster

The Polish landing's metadata title and H1 SHALL lead with the phrase
"prowadzenie social media", and the page SHALL contain, in order: a scope
section describing what the service covers, a pricing section stating a
concrete starting price consistent with the homepage FAQ pricing answer, and
a page-level FAQ whose questions cover the cluster's cost variants (at
minimum: what the service costs, and what it includes). Draft copy SHALL be
flagged for content-team approval before launch.

#### Scenario: Title and H1 carry the head phrase

- **WHEN** `/uslugi/prowadzenie-social-media` renders
- **THEN** both its metadata title and its H1 begin with "Prowadzenie social media"

#### Scenario: Pricing is concrete and consistent

- **WHEN** the pricing section renders
- **THEN** it states a starting price figure that matches the figure in the homepage FAQ pricing answer

#### Scenario: Page FAQ covers cost variants

- **WHEN** the page FAQ renders
- **THEN** it answers at least "ile kosztuje prowadzenie social media" and "co obejmuje prowadzenie social media" (locale-equivalent phrasing on EN)

### Requirement: The page emits FAQ structured data

The landing SHALL emit FAQPage JSON-LD generated from the same content that
renders its visible FAQ, in the page locale.

#### Scenario: JSON-LD matches visible FAQ

- **WHEN** the landing renders
- **THEN** a FAQPage JSON-LD block is present whose questions and answers match the visible FAQ content

### Requirement: The landing stays out of primary navigation

The landing SHALL NOT appear in the USŁUGI mega-menu, the homepage services
section, the hero rotator, or any other surface that enumerates the canonical
service roster. The canonical service list consumed by those surfaces SHALL
remain seven entries.

#### Scenario: Menu unchanged

- **WHEN** the USŁUGI mega-menu renders in either locale
- **THEN** it lists exactly the seven canonical services and not the landing

#### Scenario: Homepage services section unchanged

- **WHEN** the homepage services section renders
- **THEN** its tabs/cards enumerate the seven canonical services only

### Requirement: The landing is reachable through internal links

The landing SHALL be linked from the `/uslugi` (and `/en/services`) index page
and from the homepage FAQ pricing answer in the matching locale, so it is not
an orphan page.

#### Scenario: Services index links the landing

- **WHEN** the `/uslugi` index renders
- **THEN** it contains a link to `/uslugi/prowadzenie-social-media` (EN index links the EN landing)

#### Scenario: FAQ pricing answer links the landing

- **WHEN** the homepage FAQ pricing answer renders in either locale
- **THEN** it links to that locale's landing URL
