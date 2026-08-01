# e2e-monitoring Specification

## Purpose
Verification that the LIVE deployment works, via the Monitor workflow (manual dispatch today; the daily cron is commented out in monitor.yml pending user enablement): external-target Playwright mode, the @monitor tag contract, the sitemap crawl, and the alerting workflow.

## Requirements



### Requirement: External-target mode in the Playwright config
`playwright.config.ts` SHALL detect an external target — `PLAYWRIGHT_BASE_URL` set to a non-localhost URL — and in that mode omit the `webServer` block, set `retries: 2`, and set `trace: 'retain-on-failure'`. When the target is local (unset, or a localhost URL), behavior SHALL be unchanged from today: `webServer` boots the dev server, no retries, no traces, worktree port resolution intact.

#### Scenario: Remote target under CI
- **WHEN** the suite runs with `PLAYWRIGHT_BASE_URL=https://<live-host>` and `CI=1`
- **THEN** Playwright does not attempt to start any local server, drives the remote URL, retries a failed test up to 2 times, and retains a trace for tests that still fail

#### Scenario: Local behavior unchanged
- **WHEN** the suite runs with no `PLAYWRIGHT_BASE_URL` (main checkout or worktree)
- **THEN** the dev server is booted/reused on the resolved port exactly as before, with no retries and no trace collection

### Requirement: The @monitor tag contract
Tests safe and meaningful against the live deployment SHALL carry `@monitor` in their title: home smoke, chrome-link sweeps, locale toggle, client belt, EN blog tree, consent banner-visibility/refusal/no-displacement tests, sitemap crawl, PL blog journey, case-study render, and mobile journeys. Tests with live side effects SHALL NOT carry the tag: every test that clicks consent "accept all" (fires real GA4 consent updates), and the kontakt form submit test (real email / Turnstile). The monitoring run SHALL select tests exclusively via `--grep @monitor`.

#### Scenario: Monitor run excludes side-effect tests
- **WHEN** the suite runs with `--grep @monitor`
- **THEN** no consent-accept test and no kontakt submit test executes

#### Scenario: Full local run unaffected
- **WHEN** the suite runs without a grep filter
- **THEN** all tests run, tagged and untagged alike

### Requirement: Sitemap crawl covers every published URL
A sitemap-crawl spec SHALL fetch `{baseURL}/sitemap.xml`, extract every `<loc>` pathname, and visit each path on the run's `baseURL` (the sitemap's canonical host MUST be discarded — it differs from the host under test pre-cutover). For every URL it SHALL assert: HTTP 200, page hydration, and zero console errors — subject to an explicit, initially-empty allowlist of documented benign patterns. All failing URLs SHALL be reported in a single aggregated assertion, and the crawl SHALL log how many URLs it visited.

#### Scenario: Crawl against the live deployment
- **WHEN** the crawl runs against the live URL with a populated CMS
- **THEN** every sitemap entry (static routes, PL/EN posts, categories, case studies, paginated hubs) is visited on the target host and passes 200 + hydration + console cleanliness

#### Scenario: A newly published post is covered without a test change
- **WHEN** a new post is published and enters the sitemap
- **THEN** the next crawl visits it with no change to any test file

#### Scenario: Broken URLs are reported together
- **WHEN** three sitemap URLs return 500
- **THEN** the crawl fails once, naming all three URLs, rather than stopping at the first

### Requirement: Daily monitoring workflow
A `monitor.yml` GitHub Actions workflow SHALL run on `schedule` (`17 5 * * *` UTC) and `workflow_dispatch`. It SHALL check out main, install dependencies and Chromium, and run the `@monitor` subset with `CI=1` against `${{ vars.MONITOR_BASE_URL }}` — failing fast with a clear message when that variable is unset. It SHALL NOT provision a database, run migrations, or build the app. On failure it SHALL upload Playwright traces/test-results as an artifact.

#### Scenario: Scheduled healthy run
- **WHEN** the cron fires and the live site is healthy
- **THEN** the workflow completes green with no local server, no database service, and no artifacts

#### Scenario: Live regression detected
- **WHEN** a monitored page breaks on the live site
- **THEN** the affected test fails after 2 retries, the workflow goes red, and a trace artifact for the failing test is uploaded

#### Scenario: Target variable unset
- **WHEN** `MONITOR_BASE_URL` is not configured in repo settings
- **THEN** the workflow fails immediately with a message naming the missing variable, rather than testing a wrong or empty URL

### Requirement: Failure visibility
A failed monitoring run SHALL be visible outside the Actions tab: the workflow's failures are forwarded through the existing GitHub→Slack integration (channel subscribed to the `Monitor` workflow), in addition to GitHub's default failure email to the workflow author. The setup step for the Slack subscription SHALL be documented in the workflow file's header comment.

#### Scenario: Red run reaches Slack
- **WHEN** a scheduled monitor run fails
- **THEN** a failure notification appears in the subscribed Slack channel without any human polling the Actions tab
