# seo-url-parity

## Purpose

Preserve Google indexing across the WordPress→v2 cutover: 301 legacy thin URLs (tags, obsolete pages), audit every WP page for a disposition, and gate launch on a sitemap-driven check that every live URL resolves as 200 or 301 — zero 404s.

## Requirements

### Requirement: Legacy thin URLs redirect with 301
Legacy WordPress URLs without v2 equivalents SHALL 301-redirect: `/tag/{slug}` → `/blog` (blanket rule), and legacy `/blog/page/{n}` SHALL resolve on v2 either as HTTP 200 (if the hub adopts the same pagination shape) or via a pattern 301 to the hub's pagination URL. Redirects SHALL be static, committed configuration generated from the live `post_tag-sitemap.xml` — inspectable in review, not runtime lookups.

#### Scenario: Tag URL
- **WHEN** a visitor or crawler requests `/tag/instagram/`
- **THEN** they receive a 301 to `/blog`

#### Scenario: Legacy pagination URL
- **WHEN** `/blog/page/2/` is requested on v2
- **THEN** the response is HTTP 200 with hub page 2, or a 301 to the v2 hub's page-2 URL — never a 404

### Requirement: WP pages audited, none silently dropped
Every URL in the live `page-sitemap.xml` SHALL be audited: pages with a v2 equivalent get an explicit 301 mapping; pages without one SHALL be listed in a disposition report for a user decision (redirect target or accepted 404) before cutover. No WP page URL may 404 on launch without an explicit recorded decision.

#### Scenario: Page with v2 equivalent
- **WHEN** a WP page URL maps to a v2 route or homepage anchor
- **THEN** it 301s to that target

#### Scenario: Page without equivalent
- **WHEN** a WP page has no v2 counterpart
- **THEN** it appears in the disposition report and blocks the parity gate until a decision is recorded

### Requirement: Sitemap-driven launch parity gate
A parity script SHALL fetch all URLs from the live site's Yoast sitemaps (post, page, category, post_tag) and request each against a target v2 deployment, reporting per-URL status. The gate passes only when every post, `/blog`, and category URL returns HTTP 200 and every remaining URL returns a 301 to a resolving target — zero 404s. The script SHALL exit non-zero on failure and SHALL be run against the preview deployment before DNS cutover, and re-run after the final pre-cutover import.

#### Scenario: Gate passes
- **WHEN** the parity script runs against a deployment where all 79 posts, hub, and categories resolve 200 and all legacy URLs 301 correctly
- **THEN** it reports success and exits zero

#### Scenario: Gate catches a regression
- **WHEN** any sitemap URL returns 404 on the target deployment
- **THEN** the script lists the failing URLs and exits non-zero, blocking cutover
