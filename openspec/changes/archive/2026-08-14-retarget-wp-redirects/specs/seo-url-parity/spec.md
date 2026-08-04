# seo-url-parity — delta for retarget-wp-redirects

## MODIFIED Requirements

### Requirement: WP pages audited, none silently dropped
Every URL in the live `page-sitemap.xml` SHALL be audited: pages with a v2 equivalent get an explicit 301 mapping; pages without one SHALL be listed in a disposition report for a user decision (redirect target or accepted 404) before cutover. No WP page URL may 404 on launch without an explicit recorded decision.

No redirect destination SHALL carry a URL fragment. Crawlers ignore the fragment, so an anchor destination (e.g. `/#uslugi`) consolidates equity into the bare path instead of the section it names. Specifically: `/oferta` and `/500-zl-na-reklame` SHALL 301 to `/uslugi`, and `/z-lama-warto` SHALL 301 to `/o-nas`. The six `/oferta/{platform}` pages are covered by their own requirement — they target the `prowadzenie-social-media` landing, which is likewise fragment-free — and are not re-specified here.

#### Scenario: Page with v2 equivalent
- **WHEN** a WP page URL maps to a v2 route
- **THEN** it 301s to that route, and the destination contains no URL fragment

#### Scenario: Offer overview and the ad promo target the services hub
- **WHEN** `/oferta/` or `/500-zl-na-reklame/` is requested
- **THEN** the response is a 301 to `/uslugi`, which itself resolves HTTP 200

#### Scenario: Why-us page targets the about page
- **WHEN** `/z-lama-warto/` is requested
- **THEN** the response is a 301 to `/o-nas`, which itself resolves HTTP 200

#### Scenario: No rule anywhere carries a fragment
- **WHEN** the committed redirect map is read
- **THEN** no rule's destination contains `#`

#### Scenario: Page without equivalent
- **WHEN** a WP page has no v2 counterpart
- **THEN** it appears in the disposition report and blocks the parity gate until a decision is recorded
