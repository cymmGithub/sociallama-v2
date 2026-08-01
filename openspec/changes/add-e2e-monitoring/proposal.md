# Proposal: add-e2e-monitoring

## Why

The e2e suite (54 passing tests) only runs against a self-booted dev server on push/PR to main — nobody learns when the *live deployment* breaks between deploys (expired cert, dead DB, broken route, CMS content that 404s). A daily scheduled run against the live URL turns the suite into monitoring. At the same time, coverage has two known blind spots that matter for both CI and monitoring: the PL blog tree (the money tree, WordPress-parity root-level URLs) has zero tests while the EN tree has seven, and case-study detail pages — the richest pages on the site — are only ever HTTP-200-checked.

## What Changes

- `playwright.config.ts` gains an **external-target mode**: when `PLAYWRIGHT_BASE_URL` points at a non-localhost URL, the `webServer` block is omitted and the run gets `retries: 2` + `trace: 'retain-on-failure'`.
- Existing tests that are safe and meaningful against the live site are tagged `@monitor` (home smoke, chrome-link sweeps, locale toggle, client belt, EN blog tree, consent banner/refusal tests). Consent-*accept* tests are excluded (they would fire real GA4 hits daily from IP-less Actions runners) and the kontakt submit test is excluded (would send real email / hit real Turnstile — user decision to skip contact-form monitoring for now).
- New **sitemap-crawl spec**: fetches `/sitemap.xml`, visits every URL, asserts 200 + hydration + zero console errors. Self-updating as content is published — this is the "every user path" tier.
- New **PL blog journey tests** mirroring `en-blog.e2e.ts`: hub → post → category → pagination, root-level `/{slug}` post URLs.
- New **case-study detail render test**: a detail page actually renders its content (not just returns 200), with no console errors.
- New **mobile viewport project** in the Playwright config so the suite exercises mobile chrome (burger menu, mobile layout) in addition to desktop.
- New `.github/workflows/monitor.yml`: cron `17 5 * * *` UTC + `workflow_dispatch`, installs bun + chromium, runs the `@monitor` subset against the live deployment with `CI=1`, uploads traces on failure, posts a Slack alert on failure reusing the existing Slack webhook from `lighthouse-to-slack.yml`.

Not in scope: contact-form delivery monitoring (deliberately deferred), VPS runner (superseded by GitHub Actions), performance budgets (Lighthouse workflow already exists).

## Capabilities

### New Capabilities

- `e2e-monitoring`: the daily scheduled run — external-target config mode, the `@monitor` tag contract (what must be in, what must never be in), the sitemap crawl, and the alerting workflow.
- `e2e-coverage`: the coverage floor the suite must hold — PL blog journey, case-study detail render, mobile viewport project.

### Modified Capabilities

<!-- none — no existing spec's requirements change; this adds test/infra behavior around them -->

## Impact

- `playwright.config.ts` — external-target branch, mobile project, retries/trace in monitor mode.
- `e2e/*.e2e.ts` — `@monitor` tags added to existing titles; new files `sitemap-crawl.e2e.ts`, `pl-blog.e2e.ts`, `case-study.e2e.ts`.
- `.github/workflows/monitor.yml` — new; reads the live URL and the existing Slack webhook secret.
- GitHub repo settings — needs the live target URL decided (vercel.app production domain until the sociallama.pl cutover) and, if Vercel Deployment Protection is on for that URL, a bypass secret.
- CI runtime — the two new spec files and the mobile project lengthen the push-to-main e2e job; the sitemap crawl visits every published URL (~60+ pages, grows with content).
