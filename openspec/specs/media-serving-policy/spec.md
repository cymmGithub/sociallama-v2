# media-serving-policy Specification

## Purpose
TBD - created by archiving change reduce-media-serving-costs. Update Purpose after archive.
## Requirements
### Requirement: Uploaded media is served by the Blob CDN, not by a function
Every URL a media document exposes — `url`, `thumbnailURL` and each `sizes[*].url` — SHALL point at the Vercel Blob store that holds the bytes, so that serving a public, immutable file costs neither a function invocation nor a database query. The rewrite SHALL apply on read, so existing rows need no migration, and SHALL be inert wherever no Blob write token is configured, leaving local development on Payload's own upload route.

#### Scenario: A page renders an uploaded image
- **WHEN** any surface renders a media document in an environment with a Blob write token
- **THEN** the `src` points at the store host, and no `payload.find()` runs to serve the bytes

#### Scenario: Size variants move with the original
- **WHEN** a listing card reads `sizes.card` or an OG tag reads `sizes.og`
- **THEN** those URLs point at the store host too, not only the original

#### Scenario: Local development without a token
- **WHEN** the app runs with no Blob write token
- **THEN** media URLs keep Payload's `/api/media/file/…` form and uploads fall back to disk

### Requirement: Retired media URLs keep resolving
The `/api/media/file/*` route SHALL be retired without breaking the URLs already indexed by search engines or baked into cached HTML and OG tags: those requests SHALL answer a permanent redirect to the same filename on the Blob store, decided by a static routing rule rather than a function. The redirect SHALL be registered only where media actually lives on Blob, because an environment serving uploads from disk still needs the route. `robots.txt` SHALL keep allowing the path, or crawlers would never fetch it and never see the redirect.

#### Scenario: An indexed image URL is requested
- **WHEN** `/api/media/file/<filename>` is requested against a deployment whose media is on Blob
- **THEN** the response is a 308 to that filename on the store host

#### Scenario: An environment with uploads on disk
- **WHEN** the same path is requested with no Blob write token configured
- **THEN** no redirect is registered and Payload's own route serves the file

### Requirement: Replacing bytes in place changes the URL
A media URL SHALL carry a version derived from the byte count of the file it points at. Bytes are replaced under an unchanged filename and an unchanged row id, so without a version a replacement is invisible to every cache already holding the old copy — and no purge reaches the Blob store's CDN. Each size variant SHALL be versioned by its own byte count. Deriving the version from the file size rather than a timestamp SHALL keep an alt-text edit from churning every image URL on the site.

#### Scenario: A creative is re-cut and re-uploaded
- **WHEN** a maintenance script replaces a media file's bytes under the same filename
- **THEN** the rendered URL differs from the one caches hold, for the direct fetch and for the optimizer alike

#### Scenario: A description is corrected
- **WHEN** only a media document's alt text changes
- **THEN** its URL is unchanged

### Requirement: Only images that gain from resizing reach the optimizer
Images that pass through Next's image optimizer SHALL be limited to those where the transformation earns its recurring cost. Post covers SHALL keep the optimizer whatever the post's age: a cover is one image per page and the preloaded LCP element. Body images and listing cards on posts outside the newest published window SHALL opt out — those are many per page, over an archive of pre-sized exports. An image rendered without the optimizer SHALL be served from the largest generated size variant rather than the original upload, because the original is an unprocessed source file and the opt-out ships `src` verbatim. The `og` variant SHALL NOT be substituted, being cropped to a fixed frame.

#### Scenario: A post outside the window renders
- **WHEN** a post older than the newest window is rendered
- **THEN** its cover goes through the optimizer, while its body images and its cards elsewhere on the site are served straight from the CDN

#### Scenario: An unoptimized image has a generated variant
- **WHEN** a card or body image opts out and the source was large enough for Payload to generate a resized variant
- **THEN** that variant is served, not the original upload

#### Scenario: The window moves on publish
- **WHEN** a new post is published
- **THEN** the window shifts without a migration, a cron, or a redeploy

### Requirement: Cache lifetimes bound the recurring cost
Optimized variants SHALL be retained long enough that re-transformation is not a recurring charge, given that replacing a file in place already requires a changed URL. Page-level time-based revalidation SHALL be a safety net rather than the freshness mechanism: publish-time tag invalidation SHALL remain what refreshes a page.

#### Scenario: A published edit
- **WHEN** an editor publishes a change
- **THEN** the affected pages refresh within seconds through tag invalidation, regardless of the time-based lifetime

#### Scenario: No editorial activity
- **WHEN** nothing is published for a long stretch
- **THEN** pages are not re-rendered nightly, and optimized variants are not re-transformed monthly

