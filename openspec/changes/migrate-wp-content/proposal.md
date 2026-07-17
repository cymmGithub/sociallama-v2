## Why

The live WordPress site has 79 posts (2017–2026, per Yoast `post-sitemap.xml`) indexed at root-level URLs, plus indexed category, tag, and pagination pages. v2 launches with root-level URL parity by design (`add-payload-blog`), but parity only preserves Google indexing if the content actually exists at those URLs on launch day — one seed post and 78 404s is the loss scenario. The WP REST API is open (verified), so the import can be automated.

## What Changes

- One-time migration script: WP REST API → Payload (all 79 posts — titles, slugs, HTML content converted to Lexical, excerpts, publish dates, category mapping to the four seeded categories, Yoast SEO title/description where available).
- Media re-hosting: featured images and in-content images downloaded from `/wp-content/uploads` and uploaded to Payload's media collection (Vercel Blob), with in-content image references rewritten to upload nodes — no hotlinking to the WP host, which will be decommissioned.
- 301 redirects for legacy thin URLs: `/tag/*` → `/blog`; legacy `/blog/page/N` mapped to the v2 hub's pagination URLs (200 if shapes match, 301 otherwise); audit of `page-sitemap.xml` entries with redirects to v2 equivalents where they exist.
- Launch-day parity gate: a script that reads the live Yoast sitemaps and asserts every URL resolves on the v2 deployment as HTTP 200 (posts, `/blog`, categories) or 301 (tags, legacy pagination, mapped pages) — no 404s.
- Editorial cleanup happens post-import in the admin (user can unpublish stale 2017-era posts); the import itself brings everything in as published to preserve URLs.

## Capabilities

### New Capabilities
- `wp-import`: the migration script — WP REST extraction, HTML→Lexical conversion, media re-hosting, category/SEO mapping, idempotent re-runs.
- `seo-url-parity`: legacy-URL handling and the launch gate — tag/pagination/page redirects and the sitemap-driven parity check.

### Modified Capabilities

## Impact

- **Depends on**: `add-payload-blog` (collections, root-level routes, `/blog` hub, category pages must exist).
- **Affected code**: new `lib/scripts/` migration + parity scripts; redirects in Next config; no frontend component changes.
- **Systems**: bulk writes to Neon Postgres and Vercel Blob (~79 posts + all images); reads from the live WP site during import.
- **Risk surface**: content fidelity (HTML→Lexical edge cases), image completeness, and the parity gate blocking launch until green.
