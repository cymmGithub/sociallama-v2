## ADDED Requirements

### Requirement: Projects section features the three case studies

The `/o-nas` "Zrealizowane projekty" section SHALL show three cards populated with the live case studies — iRobot, Pracuj.pl, and Volvo — replacing all `NAZWA PROJEKTU` placeholders. Each card carries a project name, year, and client label.

#### Scenario: Placeholders are replaced

- **WHEN** the projects section renders
- **THEN** no card shows `NAZWA PROJEKTU` or `NAZWA MARKI KLIENTA`, and the three cards correspond to iRobot, Pracuj.pl, and Volvo

### Requirement: Each card renders a real hero image

Each project card SHALL render a real image from the corresponding case study's assets under `/public/case-studies/<slug>/`, not the placeholder `ImageIcon`. The content `image` field carries the path and the `Projects` component renders it.

#### Scenario: Real images render

- **WHEN** a project card is displayed
- **THEN** it shows the case study's hero image (not the placeholder icon), and the image path resolves under `/public/case-studies/<slug>/`

### Requirement: Cards link to their case-study detail pages

Each project card SHALL be a link to its case-study detail page — `/case-studies/<slug>` in PL, `/en/case-studies/<slug>` in EN. The content shape gains an `href` field.

#### Scenario: PL card navigates to the study

- **WHEN** a user activates a project card on `/o-nas`
- **THEN** the browser navigates to that study's `/case-studies/<slug>` page

#### Scenario: EN card uses the localized slug

- **WHEN** a user activates a project card on `/en/about-us`
- **THEN** the browser navigates to `/en/case-studies/<slug>`

### Requirement: EN locale mirrors the projects content

`o-nas.en.ts` `oNasProjects` SHALL carry the same three projects with English copy and `image` + `href` fields, keeping the `LocalizedONas` shape identical to PL.

#### Scenario: EN projects parity

- **WHEN** `o-nas.en.ts` `oNasProjects` is compared to the PL version
- **THEN** it has the same three items with matching `image`/`href` field shapes and English `name`/`client` copy, and TypeScript compiles under `satisfies LocalizedONas`
