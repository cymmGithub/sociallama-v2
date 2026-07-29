## MODIFIED Requirements

### Requirement: Sitemap-driven launch parity gate
A parity script SHALL fetch all URLs from the live site's Yoast sitemaps (post, page, category, post_tag) and request each against a target v2 deployment, reporting per-URL status. The gate passes only when every post, `/blog`, and category URL returns HTTP 200 and every remaining URL returns a 301 to a resolving target — zero 404s. The script SHALL exit non-zero on failure and SHALL be run against the preview deployment before DNS cutover, and re-run after the final pre-cutover import.

The gate's scope is the **Polish** URL surface, because that is the surface the live WordPress site indexed. English URLs have no legacy counterparts and SHALL NOT be added to this gate. Adding an English locale SHALL NOT change the set of Polish URLs the gate asserts, and the gate SHALL remain green across this change — no Polish URL moves, and no post's Polish slug changes.

English blog URLs SHALL nonetheless have a reachability gate of their own. The chrome-link sweep asserts only the entry points reachable from the menu and footer, which for the blog is the hub alone; every other English blog URL shape — post, category, and pagination — SHALL be covered by an explicit check that samples each shape against live content.

#### Scenario: Gate passes
- **WHEN** the parity script runs against a deployment where all 79 posts, hub, and categories resolve 200 and all legacy URLs 301 correctly
- **THEN** it reports success and exits zero

#### Scenario: Gate catches a regression
- **WHEN** any sitemap URL returns 404 on the target deployment
- **THEN** the script lists the failing URLs and exits non-zero, blocking cutover

#### Scenario: Adding English does not move a Polish URL
- **WHEN** the parity script runs against a deployment carrying the English blog
- **THEN** every Polish post, hub, and category URL still resolves exactly as before, and the gate exits zero

#### Scenario: The chrome sweep covers only what chrome links to
- **WHEN** the locale-routing chrome sweep runs on the English locale
- **THEN** it requests the English blog hub, because that is the one blog URL the menu and footer link to, and it makes no claim about post, category, or pagination URLs

#### Scenario: Every English blog URL shape is gated
- **WHEN** the English blog tree is checked for reachability
- **THEN** a check samples each URL shape against live content — the hub, a hub pagination page, a post, and a category listing — and every sample responds below 400
