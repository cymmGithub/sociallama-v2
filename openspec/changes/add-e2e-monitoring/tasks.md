# Tasks: add-e2e-monitoring

## 1. Config — external-target mode + mobile project

- [x] 1.1 Add external-target detection to `playwright.config.ts`: `PLAYWRIGHT_BASE_URL` set to a non-localhost URL → omit `webServer`, `retries: 2`, `trace: 'retain-on-failure'`; local behavior (webServer, worktree port, no retries) byte-for-byte unchanged
- [x] 1.2 Add the `mobile-chromium` project (≈393×852, `isMobile`, `hasTouch`, mobile UA) with `grep: /@mobile/`, and `grepInvert: /@mobile/` on the desktop project
- [x] 1.3 Verify both modes by resolving the config under each env: local → webServer present, retries 0, trace off; non-localhost `PLAYWRIGHT_BASE_URL` → no webServer, retries 2, trace retain-on-failure (localhost is never external by design — a localhost URL keeps the webServer)

## 2. Tag the @monitor subset

- [x] 2.1 Add `@monitor` to titles in: `home.e2e.ts`, `locale-routing.e2e.ts`, `client-belt.e2e.ts`, `en-blog.e2e.ts`, and the consent banner-visibility / refusal / no-displacement / defaults-order tests in `consent.e2e.ts` (used Playwright's `{ tag: '@monitor' }` option; also tagged the script-precedence test — read-only and more meaningful on live)
- [x] 2.2 Confirm the exclusions: no `@monitor` on any test that clicks accept-all in `consent.e2e.ts`, and none anywhere in `kontakt.e2e.ts`; verified with `--grep @monitor --list` — 44 tests in 5 files, no excluded title present

## 3. New specs — crawl + coverage floor

- [x] 3.1 Write `e2e/sitemap-crawl.e2e.ts` (`@monitor @slow`): fetch `{baseURL}/sitemap.xml`, extract `<loc>` pathnames (discard hosts), visit each on `baseURL`, assert 200 + hydration + zero console errors (explicit empty allowlist const), aggregate all failures into one report, log the visited count (plus page recycling every 15 URLs — one renderer across the whole crawl hit ERR_INSUFFICIENT_RESOURCES on media-heavy case studies)
- [x] 3.2 Write `e2e/pl-blog.e2e.ts` (`@monitor`) mirroring `en-blog.e2e.ts`: hub resolves `lang="pl"`, hub→post at root-level `/{slug}` renders an article with Polish chrome, categories resolve, offered pagination resolves + `/blog/page/999` is the 404 state; empty hub FAILS (no skip path)
- [x] 3.3 Write `e2e/case-study.e2e.ts` (`@monitor`): PL and EN hub each list ≥1 study; first detail page hydrates, non-empty `h1`, content/media sections attached, zero console + page errors; EN detail links stay in the `/en` tree
- [x] 3.4 Write `e2e/mobile.e2e.ts` (`@mobile @monitor`): MENU overlay opens and navigates (PL + EN), home renders at mobile width with zero console errors, consent accept + reject both inside the viewport and tappable; breakpoint-boundary test — compact header metrics at 799px, desktop metrics at 800px (logo mark size)
- [x] 3.5 Run the full suite locally (`bun run test:e2e`) — 66 passed / 4 honest skips; the crawl's initial ERR_INSUFFICIENT_RESOURCES failure fixed via page recycling and re-run green in isolation (2.9 min, full sitemap)

## 4. Monitoring workflow

- [x] 4.1 Set the repo variable `MONITOR_BASE_URL=https://sociallama-v2.vercel.app` via `gh variable set` (stable production alias, 200 + live sitemap with 333 URLs verified)
- [x] 4.2 Verify Deployment Protection status for that URL: the vercel.app production alias serves 200 unauthenticated — no bypass needed (the team-scoped `*-cymmgithubs-projects` URL 302s to SSO, but it is not the monitoring target)
- [x] 4.3 Write `.github/workflows/monitor.yml`: `schedule: '17 5 * * *'` + `workflow_dispatch`; guard step failing fast if `vars.MONITOR_BASE_URL` is empty; checkout, setup-bun (version from package.json), `bun install --frozen-lockfile`, `bunx playwright install --with-deps chromium`, `bunx playwright test --grep @monitor` with `PLAYWRIGHT_BASE_URL` + `CI=1`; `actions/upload-artifact` of `test-results/` on `failure()`; header comment documenting the Slack subscription command and the deploy-window triage rule (design D5/Risks); 60-min job timeout for the 333-URL crawl
- [x] 4.4 Triggered via `workflow_dispatch` against the live URL — run 30691806528 green in 7 min (all @monitor tests incl. the 333-URL crawl), no webServer, no DB service
- [x] 4.5 Forced a red run via the dispatch `target` input pointed at an unreachable host — run 30692064840 concluded `failure` and uploaded the `monitor-traces` artifact (2.2 MB). Slack leg pending the one-time `/github subscribe cymmGithub/sociallama-v2 workflows:{name:"Monitor"}` in the target channel (user action; GitHub failure emails work regardless)

## 5. Close out

- [x] 5.1 `bun run check` clean (biome + tsc + 653 unit tests + manifest); committed with the CI-runtime note in the body
- [ ] 5.2 After the first scheduled run completes on its own (next morning), confirm the green run in Actions and archive the change
