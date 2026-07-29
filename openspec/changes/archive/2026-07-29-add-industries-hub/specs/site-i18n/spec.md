## MODIFIED Requirements

### Requirement: Locale toggle
The site chrome (overlay menu and footer) SHALL include a PL/EN toggle on both locales, marking the current locale (`aria-current`) and linking to the counterpart of the current path via the slug map. Section index pages SHALL be mapped pairs — `/uslugi` ↔ `/en/services` and `/branze` ↔ `/en/industries` — so the toggle lands on the counterpart index rather than the locale home. For a path with no English counterpart (e.g. a blog post), the toggle SHALL link to `/en`.

#### Scenario: Toggle round-trips a mapped page
- **WHEN** a visitor on `/o-nas` activates EN and then PL
- **THEN** they land on `/en/about-us` and back on `/o-nas`

#### Scenario: Toggle round-trips the industries index
- **WHEN** a visitor on `/branze` activates EN and then PL
- **THEN** they land on `/en/industries` and back on `/branze`, never on the locale home

#### Scenario: Unmapped page falls back to locale home
- **WHEN** a visitor on a Polish blog post activates EN
- **THEN** they land on `/en`
