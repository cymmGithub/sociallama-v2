# Design — reduce Vercel build usage

## Context

Every push to any branch of the GitHub repo triggers a Vercel build. Production
builds (~2 min, occasionally ~9 min on cache miss) fire on every `main` push —
7–8/day at the current working rhythm. Preview builds fire on every other
branch push and all fail after ~22 s: `build:vercel` starts with
`payload migrate`, and no `DATABASE_URL` exists outside Production (all email/DB
env vars are deliberately Production-only and Sensitive). Dependabot runs
weekly with up to 10 single-dependency PRs, each producing one doomed preview
build and, via the auto-merge workflow, one production build.

## Goals / Non-Goals

**Goals:**
- Zero build minutes spent on preview deployments.
- Cut the dependabot-driven production-build fan-out.
- Keep the change fully versioned in the repo (no dashboard-only state).

**Non-Goals:**
- Making preview deployments work (Preview env provisioning) — nothing consumes
  them today.
- Shortening the production build itself (migrate, static generation, cache
  behaviour stay untouched).
- Batching `main` pushes — that is working habit, not configuration.

## Decisions

- **`ignoreCommand` in `vercel.json`, guarding on `VERCEL_ENV`**:
  `[ "$VERCEL_ENV" != "production" ]`. Vercel skips the build when the command
  exits 0, builds when it exits 1 — so the expression is true (skip) for
  preview/development and false (build) for production.
  - *Alternative — dashboard "Ignored Build Step" setting*: same effect but
    lives outside the repo; rejected for versioning.
  - *Alternative — disable preview deployments in Git settings*: dashboard-only
    state again, and coarser (cannot be lifted per-branch later).
  - *Alternative — fix previews instead (add Preview env vars)*: spends more
    build minutes, not fewer, and creates a second environment to maintain with
    no consumer.
- **Dependabot `interval: monthly` for both ecosystems**: one update wave per
  month instead of four. Single-PR-per-dependency stays — the auto-merge title
  parser depends on it (documented in `.github/dependabot.yml`).
  - *Alternative — grouped updates*: fewer builds still, but breaks the
    auto-merge parser; rejected.

## Risks / Trade-offs

- [Preview URLs silently stop existing] → documented here and in the proposal;
  the revert path (drop `ignoreCommand`, provision Preview env) is written
  down. Anyone pushing a branch expecting a preview gets a "skipped" state in
  the dashboard, not an error.
- [`ignoreCommand` change only takes effect after it lands on `main`] → merge
  order note in tasks; the first push after merge still builds (it must — it
  is a production push).
- [Security patches wait up to a month] → GitHub security advisories still
  raise alerts immediately; handle those manually as they arrive.

## Migration Plan

1. Merge to `main` (one production build — unavoidable).
2. Verify: next dependabot branch push (or a throwaway branch push) shows the
   deployment as skipped/canceled by ignore command in the dashboard, with no
   build minutes consumed.
3. Rollback: revert the `vercel.json` line; previews resume their previous
   (failing) behaviour.

## Open Questions

- None blocking. If real preview deployments are ever wanted (e.g. email
  testing on a preview URL), that is its own change: Preview-scoped
  `DATABASE_URL` + Resend vars, and a narrower ignore rule.
