# Reduce Vercel build usage

## Why

Build minutes are the project's dominant Vercel usage driver: ~15 production
builds in 2.5 days (one per push to `main`, ~2 min each) plus a stream of
preview builds that are 100% dead on arrival — `build:vercel` opens with
`payload migrate`, Preview env carries no `DATABASE_URL`, so every branch push
(mostly dependabot's) burns ~22 s and errors. Dependabot compounds it: weekly,
up to 10 single-dependency PRs, each one a doomed preview build plus an
auto-merged commit that triggers its own production build.

## What Changes

- Vercel skips every non-production build via `ignoreCommand` in
  `vercel.json` — preview deployments are deliberately disabled (they cannot
  build today and nothing consumes them).
- Dependabot cadence drops from `weekly` to `monthly` for both ecosystems
  (github-actions, npm), cutting the auto-merge build fan-out ~4×. GitHub
  security alerts still arrive immediately and are handled manually.
- No change to the build itself: `payload migrate`, `setup:styles`,
  `next build`, `check-prerender` and the build cache stay as they are.

## Capabilities

### New Capabilities

- `deploy-build-policy`: when Vercel builds run (production pushes only,
  previews skipped) and how dependency-update cadence bounds build volume.

### Modified Capabilities

<!-- none — no existing spec's requirements change -->

## Impact

- `vercel.json` — new `ignoreCommand` entry.
- `.github/dependabot.yml` — `interval: weekly` → `monthly` (×2).
- Workflow caveat: real preview deployments stop existing. Anything that would
  need one in the future (e.g. testing Resend email on a preview URL) requires
  reverting the `ignoreCommand` AND provisioning Preview-scoped env vars —
  today neither exists, so nothing is lost.
- Rollout note: `ignoreCommand` in `vercel.json` only takes effect once the
  commit carrying it reaches the repository's default branch on Vercel; the
  dependabot change takes effect on merge.
