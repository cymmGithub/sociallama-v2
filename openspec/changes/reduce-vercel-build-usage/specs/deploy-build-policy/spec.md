# deploy-build-policy

## ADDED Requirements

### Requirement: Only production pushes build on Vercel
Vercel SHALL run a build only for pushes that target the production environment; every preview/development deployment SHALL be skipped via a repo-versioned `ignoreCommand` in `vercel.json` before any build minutes are spent.

#### Scenario: Push to main
- **WHEN** a commit is pushed to `main`
- **THEN** Vercel runs the full production build (`build:vercel`)

#### Scenario: Push to any other branch
- **WHEN** a commit is pushed to a non-production branch (feature branch, dependabot branch)
- **THEN** the deployment is skipped by the ignore command without starting the build container's build step

### Requirement: Dependency updates arrive monthly
Dependabot SHALL raise its version-update waves on a monthly cadence for both configured ecosystems (github-actions, npm), bounding the auto-merge-driven production-build volume to one wave per month.

#### Scenario: Scheduled update wave
- **WHEN** dependabot's schedule fires
- **THEN** it is a monthly occurrence, and each resulting patch/minor PR still auto-merges individually (single-dependency PRs preserved for the title parser)

#### Scenario: Security advisory
- **WHEN** GitHub raises a security alert for a dependency
- **THEN** the alert appears immediately regardless of the monthly cadence and is handled manually
