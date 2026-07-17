## MODIFIED Requirements

### Requirement: WP pages audited, none silently dropped
Every URL in the live `page-sitemap.xml` SHALL be audited: pages with a v2 equivalent get an explicit 301 mapping, EXCEPT where the v2 equivalent is a real route served at the same path (e.g. `/kontakt`), which SHALL be served directly as HTTP 200 with no redirect; pages without an equivalent SHALL be listed in a disposition report for a user decision (redirect target or accepted 404) before cutover. No WP page URL may 404 on launch without an explicit recorded decision.

#### Scenario: Page with v2 equivalent at a different path
- **WHEN** a WP page URL maps to a v2 route or homepage anchor at a different path
- **THEN** it 301s to that target

#### Scenario: Page served by a v2 route at the same path
- **WHEN** a WP page URL (e.g. `/kontakt`) is now served by a real v2 route at that same path
- **THEN** it returns HTTP 200 directly and no 301 redirect is configured for it

#### Scenario: Page without equivalent
- **WHEN** a WP page has no v2 counterpart
- **THEN** it appears in the disposition report and blocks the parity gate until a decision is recorded

### Requirement: Sitemap-driven launch parity gate
A parity script SHALL fetch all URLs from the live site's Yoast sitemaps (post, page, category, post_tag) and request each against a target v2 deployment, reporting per-URL status. The gate passes only when every post, `/blog`, category URL, and any legacy URL now served by a real v2 route at the same path (e.g. `/kontakt`) returns HTTP 200, and every remaining URL returns a 301 to a resolving target — zero 404s. The script SHALL exit non-zero on failure and SHALL be run against the preview deployment before DNS cutover, and re-run after the final pre-cutover import.

#### Scenario: Gate passes
- **WHEN** the parity script runs against a deployment where all 79 posts, hub, categories, and `/kontakt` resolve 200 and all remaining legacy URLs 301 correctly
- **THEN** it reports success and exits zero

#### Scenario: Gate catches a regression
- **WHEN** any sitemap URL returns 404 on the target deployment
- **THEN** the script lists the failing URLs and exits non-zero, blocking cutover
