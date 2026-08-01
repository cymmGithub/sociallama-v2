# Design: add-e2e-monitoring

## Context

The e2e suite (7 files, 54 passing tests, ~4 min) runs only in `ci.yml` on push/PR to main, against a dev server Playwright boots itself (`webServer: bun run dev`). `playwright.config.ts` already resolves the port safely for worktrees, but has no notion of an external target: `PLAYWRIGHT_BASE_URL` pointing at a remote URL only works by accident through `reuseExistingServer`, and breaks outright under `CI=1`. There are no retries and no trace artifacts — fine interactively, useless for unattended runs.

Verified constraints (2026-08-01 audit):

- Suite is green: 54 passed / 4 honest skips / 3.9 min cold.
- `lighthouse-to-slack.yml` has **no Slack webhook secret** — the repo relies on the GitHub→Slack app forwarding commit comments and workflow events.
- `app/sitemap.ts` emits absolute URLs on `APP_BASE_URL` (`NEXT_PUBLIC_BASE_URL`), i.e. the **canonical** host — not necessarily the host under test (vercel.app pre-cutover, localhost in dev/CI).
- CI's Postgres is migrated but empty — content-driven URLs (posts, case studies) exist only against the live/dev DB.
- Specs import repo source (`CLIENT_ROSTER`, consent copy, theme colors), so any runner needs a checkout of main.
- GitHub Actions runners have no static IP, so GA4 internal-traffic filtering by IP is unavailable.
- "Prod" is pre-launch: the live target today is the Vercel production deployment domain; sociallama.pl cutover comes later.

## Goals / Non-Goals

**Goals:**

- A daily scheduled GitHub Actions run of a curated test subset against the live deployment, with retries, traces on failure, and a failure signal a human actually sees.
- One config serving both modes; no divergence between what CI tests and what monitoring tests beyond the deliberate `@monitor` contract.
- Close the two known coverage holes now (PL blog tree, case-study detail render) and add a mobile viewport lane.
- "Every user path" via a self-updating sitemap crawl rather than hand-enumerated specs.

**Non-Goals:**

- Contact-form delivery monitoring (user decision — deferred; the kontakt submit test stays CI-only).
- Performance/Lighthouse monitoring (exists in `lighthouse-to-slack.yml`).
- A VPS runner (superseded by Actions).
- Making every existing desktop spec pass on mobile — the mobile lane is a curated journey set, not a blanket re-run.

## Decisions

### D1 — External-target mode lives in `playwright.config.ts`, keyed off `PLAYWRIGHT_BASE_URL`

When `PLAYWRIGHT_BASE_URL` is set to a non-localhost URL: omit `webServer` entirely, set `retries: 2` and `trace: 'retain-on-failure'`. Local/CI behavior is unchanged (no retries — flake in CI is signal about our code; retries against a remote target are noise about the network).

*Alternative rejected:* a separate `playwright.monitor.config.ts`. Two configs drift, and the worktree-port safety logic would need duplicating. One config, one branch point.

### D2 — The `@monitor` tag is an explicit contract, in test titles

Tagged in (safe + meaningful against live): home smoke, chrome-link sweeps + locale toggle, client belt, EN blog tree, consent banner-visibility/refusal/no-displacement tests, and the new sitemap crawl, PL blog journey, case-study render, and mobile journeys.

Tagged out, and this is load-bearing:

- **consent-accept tests** — each accept click on the live site queues a real `analytics_storage: granted` update to a real GA4 property, and runners have no static IP to filter on. (Page loads under default-denied consent send only cookieless pings; a handful daily is negligible.)
- **kontakt submit test** — real SMTP email or a real Turnstile challenge daily; excluded per user decision.

The monitor workflow runs `--grep @monitor`; nothing untagged can leak into the daily run, and a future test author must opt in deliberately.

### D3 — Sitemap crawl rewrites hosts and runs in every mode

`sitemap-crawl.e2e.ts` fetches `{baseURL}/sitemap.xml`, parses `<loc>` values, **keeps only the pathname** and joins it onto the run's `baseURL` — the sitemap's canonical host (sociallama.pl-to-be) is not the host under test. Each URL gets: response 200, hydration (existing `waitForHydration` helper — every frontend page mounts Lenis), zero console errors. Failures accumulate into one report listing every broken URL (no fail-fast on URL #3 of 60).

It runs in all modes and degrades gracefully: against CI's empty DB it crawls only static routes; against live it crawls everything published (~60+ URLs, grows with content — the count is logged, never capped). It carries `@monitor` and `@slow`; the docs note `--grep-invert @slow` for a quick local loop.

Console-error handling starts strict (empty allowlist). If live third-party noise (gtag) appears, patterns get added to an explicit, commented allowlist in the spec — never a blanket "ignore console errors on prod".

### D4 — Mobile is a new project running curated `@mobile` journeys

A `mobile-chromium` project (Pixel-class: 393×852, `isMobile`, `hasTouch`, mobile UA) with `grep: @mobile`, and the existing desktop project gets `grepInvert: @mobile`. New `mobile.e2e.ts` covers what only mobile can regress: MENU-overlay open → navigate (both locales — the overlay control is universal at every width, but only mobile renders the compact chrome around it), home renders with zero console errors at mobile width, consent banner buttons visible and tappable within the viewport, and the 800px `--mobile`/`--desktop` custom-media fold pinned via the header's compact-vs-desktop metrics.

*Alternative rejected:* running all existing specs under the mobile project. Desktop-authored assertions (header CTA visibility, boundingBox parity, wheel-driven Lenis scroll) fail on mobile for reasons that aren't bugs; retrofitting all 54 tests is a separate effort and would ship a permanently-yellow lane.

### D5 — Alerting rides the existing GitHub→Slack integration, not a webhook

`monitor.yml` needs no new secret: GitHub's Slack app forwards workflow failures once the channel subscribes with `/github subscribe <owner>/<repo> workflows:{name:"Monitor"}`. GitHub additionally emails the workflow author on failed scheduled runs by default. Traces upload as an artifact on failure (`if: failure()`), 7-day retention — enough to debug any red run.

*Alternative deferred:* a dedicated Slack webhook step. Adds a secret to manage for no reach the integration doesn't already have. Revisit only if the subscription proves unreliable.

### D6 — The live URL is a repo variable, not a hardcode

`monitor.yml` reads `PLAYWRIGHT_BASE_URL: ${{ vars.MONITOR_BASE_URL }}`. Today that's the Vercel production domain (`*.vercel.app`); at sociallama.pl cutover it's a Settings change, not a commit. The workflow fails fast with a clear message when the variable is unset. Schedule: `cron: '17 5 * * *'` UTC (off the top of the hour — Actions cron congestion) + `workflow_dispatch` for on-demand runs. No Postgres service, no migrations, no build — checkout + bun install (specs import repo modules) + chromium install + run.

### D7 — PL blog and case-study specs sample the rendered site, not the DB

`pl-blog.e2e.ts` mirrors the `en-blog.e2e.ts` approach (read links from the rendered hub — tests what a visitor can reach, and `'use cache'` query functions can't run outside a request scope): hub resolves with `lang="pl"`, hub links → root-level `/{slug}` posts resolve and render an article, category pages resolve, pagination offers only resolving pages, page-999 404s. Unlike EN, the PL tree has no legitimate empty state — zero posts on the hub is a **failure**.

`case-study.e2e.ts` navigates from the `/case-studies` hub to the first detail page and asserts real render: hub link count > 0, detail h1 non-empty, approach/media sections attached, zero console errors and page errors. Both locales.

## Risks / Trade-offs

- **[Main ahead of the deployed build]** Monitor checks out main; specs import content modules. In the window between an ff-push and Vercel build completion, assertions can mismatch the live site. → Accepted: window is minutes, cadence is daily; `retries: 2` absorbs most of it; a red run at deploy time is re-runnable via `workflow_dispatch`. Triage rule documented in the workflow header.
- **[Scheduled-run auto-disable]** GitHub disables cron workflows in repos with 60 days of no activity (public repos). → Repo is active and private; noted in the workflow header anyway.
- **[Crawl duration growth]** Serial worker × growing content. 333 URLs at setup time (~20 min remote at a few seconds each; the workflow budget is 60 min); at daily cadence that is fine. → Log the URL count each run; revisit `workers` for the remote-target mode only if it ever matters (the single-worker constraint exists for the shared *dev* server, which monitor mode doesn't use).
- **[Deployment Protection]** If the Vercel production URL has protection enabled, every request 401s. → Explicit verification task; if enabled, add `x-vercel-protection-bypass` header via secret (documented Vercel mechanism) or disable for production.
- **[CI e2e job gets longer]** Two new spec files + mobile project on every push to main. → Acceptable; the sitemap crawl is near-empty on CI's DB, and the mobile lane is small. If the job crosses ~10 min, split `@slow` out of the push path — not done preemptively.

## Open Questions

- None blocking. The two environment facts to pin down during implementation are captured as tasks: the exact `MONITOR_BASE_URL` value, and the Deployment Protection status of that URL.
