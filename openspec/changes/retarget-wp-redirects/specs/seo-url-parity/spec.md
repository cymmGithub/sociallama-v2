# seo-url-parity — delta for retarget-wp-redirects

## MODIFIED Requirements

### Requirement: WP pages audited, none silently dropped
Every URL in the live `page-sitemap.xml` SHALL be audited: pages with a v2 equivalent get an explicit 301 mapping; pages without one SHALL be listed in a disposition report for a user decision (redirect target or accepted 404) before cutover. No WP page URL may 404 on launch without an explicit recorded decision.

Redirect targets SHALL be dedicated v2 routes without URL fragments. Crawlers ignore fragments in redirect targets, so an anchor destination (e.g. `/#uslugi`) consolidates equity into the bare path instead of the intended section. Specifically: `/oferta`, each `/oferta/{platform}` page (facebook, instagram, linkedin, tiktok, twitter, pinterest), and `/500-zl-na-reklame` SHALL 301 to `/uslugi`; `/z-lama-warto` SHALL 301 to `/o-nas`.

#### Scenario: Page with v2 equivalent
- **WHEN** a WP page URL maps to a v2 route
- **THEN** it 301s to that route, and the destination contains no URL fragment

#### Scenario: Offer pages target the services hub
- **WHEN** `/oferta/`, any `/oferta/{platform}/`, or `/500-zl-na-reklame/` is requested
- **THEN** the response is a 301 to `/uslugi`, which itself resolves HTTP 200

#### Scenario: Why-us page targets the about page
- **WHEN** `/z-lama-warto/` is requested
- **THEN** the response is a 301 to `/o-nas`, which itself resolves HTTP 200

#### Scenario: Page without equivalent
- **WHEN** a WP page has no v2 counterpart
- **THEN** it appears in the disposition report and blocks the parity gate until a decision is recorded
