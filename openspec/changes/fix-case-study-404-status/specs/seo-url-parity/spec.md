## ADDED Requirements

### Requirement: Content detail routes answer the right HTTP status
A request for a post or case-study detail URL whose slug no published document owns SHALL respond with HTTP status 404 rather than rendering a not-found body into a committed 200. The decision SHALL happen above the segment's Suspense boundary, so a published document still answers 200 and still streams its route-loading shell.

#### Scenario: Unknown slug on a detail route
- **WHEN** `/{unknown}`, `/en/blog/{unknown}`, `/case-studies/{unknown}` or `/en/case-studies/{unknown}` is requested with a slug no published document owns
- **THEN** the response status is 404

#### Scenario: Published document still streams its shell
- **WHEN** a published post or case study is requested in either locale
- **THEN** the response status is 200, the route-loading shell is present in the streamed HTML, and the page body is not pushed into a hidden late segment

#### Scenario: Draft preview survives the status gate
- **WHEN** an editor opens an unpublished draft through `/api/preview`
- **THEN** the draft renders rather than 404ing

#### Scenario: An empty collection does not break the build
- **WHEN** a collection has no published documents, so `staticParamsOrPlaceholder` emits a synthetic placeholder param for the build to prerender
- **THEN** the gate falls through and the page renders its own not-found, because a `notFound()` reached during prerendering with no boundary above it crashes the build

### Requirement: Listing routes' swallowed status is recorded, not fixed
The blog and category listing routes SHALL keep their `loading.tsx`, and the reason they cannot carry the same gate SHALL be documented in `AGENTS.md` so the next attempt does not rediscover it.

#### Scenario: Listing routes still answer 200 on a miss
- **WHEN** `/category/{unknown}`, `/en/blog/category/{unknown}`, `/blog/page/999`, `/blog/page/1` or the paginated category equivalents are requested
- **THEN** the response is still 200, and `AGENTS.md` explains that their `generateStaticParams` prerenders exactly the params that call `notFound()`, so hoisting the decision above the boundary crashes the build
