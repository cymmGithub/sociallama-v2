# fix-blog-cover-focal-point

## Why

Blog post header covers render in a fixed 4:3 box with `object-fit: cover` and a dead-center crop, so covers whose subject sits off-center lose the important content out the sides of the box. Payload already stores a per-image focal point (`focalX`/`focalY`, with an admin picker), but the frontend ignores it — every crop is 50/50 regardless of what an editor sets.

## What Changes

- Blog cover render surfaces (post header, hub featured lead, hub cards, popular rail) pass the stored focal point through as CSS `object-position`, so an editor-set focal point actually steers every live crop. Images without an explicit focal point keep today's centered crop (Payload defaults to 50/50).
- No change to the `Image` component itself — it already forwards a caller `style`, so this is a per-call-site `objectPosition` computed from the resolved media.
- Editorial pass: audit the published posts' rendered headers, set focal points in the Payload admin for the miscropped covers, and record the adjustments in the image audit artifact (existing `blog-cover-art` bookkeeping requirement). This is DB content — no git rollback — so the audit list is the record.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `blog-cover-art`: adds a requirement that rendered cover crops honor the stored focal point on every cover surface; the existing "covers survive every live crop" verification gains focal-point adjustment as its repair tool (previously the only lever was recomposing the master).

## Impact

- `app/(frontend)/[slug]/post-article.tsx` (header cover), `app/(frontend)/blog/hub-featured.tsx`, `app/(frontend)/blog/post-card.tsx`, `app/(frontend)/blog/hub-popular.tsx` — pass `objectPosition` from `focalX`/`focalY`; EN routes share these components.
- Payload media rows: focal-point values set by editors during the content pass (production DB writes through the admin — low-stakes pre-launch, per project convention).
- Note: changing a focal point makes Payload re-generate the cropped `og` image size for that media row; acceptable, but the pass should spot-check one OG image after adjusting.
