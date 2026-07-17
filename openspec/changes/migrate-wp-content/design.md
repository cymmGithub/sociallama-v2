## Context

`add-payload-blog` delivers the platform: Payload collections shaped for WP content, root-level `/{slug}` post routes, `/blog` hub, `/category/{slug}` pages, and four categories seeded with WP-matching slugs. This change fills it with the live site's content and closes every legacy URL. Verified facts about the source: WordPress + Yoast; open REST API at `/wp-json/wp/v2` (posts expose title, slug, date, HTML content, categories, tags, featured media; Yoast exposes `yoast_head_json`); `post-sitemap.xml` lists 79 posts (2017–2026); categories `marketing`, `reklama`, `seo`, `social-media`; tag pages under `/tag/*`; hub pagination `/blog/page/2..9`; images under `/wp-content/uploads/`.

## Goals / Non-Goals

**Goals:**
- All 79 posts live in Payload with correct slugs, dates, categories, covers, body content, and Yoast SEO fields
- Every image re-hosted in Blob; zero references to the WP host in migrated content
- Every URL in the live Yoast sitemaps resolves on v2 as 200 or 301 — enforced by a scriptable gate
- Import re-runnable without duplicating content (idempotent by slug)

**Non-Goals:**
- Editorial curation (user unpublishes stale posts in the admin afterwards)
- Pixel-fidelity with WP rendering — content renders in the v2 post template's style
- Comments, authors-as-entities (author byline not in the v2 template), WP shortcode emulation beyond sane fallbacks
- Keeping WP running post-launch

## Decisions

**D1 — Import via WP REST API, not database dump or WXR export.** The API is open and returns clean JSON incl. `_embedded` featured media and `yoast_head_json`; no WP admin access needed. Paginate `per_page=100` (one page covers all 79).

**D2 — Bun script using Payload's Local API** (`lib/scripts/migrate-wp.ts`, run with the repo's env loading). Writes go through Payload so hooks, validation (incl. reserved-slug), and Blob storage behave exactly as admin-created content. Alternative — raw SQL inserts — rejected: bypasses validation and Lexical structure.

**D3 — HTML→Lexical via Payload's official converter** (`convertHTMLToLexical` from `@payloadcms/richtext-lexical`), with a pre-pass on the WP HTML: strip WP-specific wrappers/shortcodes, resolve internal links (absolute `sociallama.pl/...` → relative), and extract `<img>` tags. Post-conversion audit logs any node the converter dropped so fidelity issues are visible per-post, not discovered by readers.

**D4 — Two-phase media handling.** Phase A: download every referenced image (featured + in-content, original size) and create media documents keyed by source URL (dedup — WP reuses images across posts). Phase B: during content conversion, replace `<img>` references with Lexical upload nodes pointing at the created media docs. Unfetchable image → warn and continue (logged in the import report), never a silent drop.

**D5 — Idempotency by slug upsert.** Import keyed on WP slug: existing Payload post with that slug is updated, not duplicated; media dedup by source URL. Re-running after a partial failure or fidelity fix is safe. An `--only <slug>` flag re-imports a single post for iteration.

**D6 — SEO fields from Yoast.** `metaTitle`/`metaDescription` from `yoast_head_json.title`/`.description` when present; `publishedAt` from WP `date` (site timezone) so ordering and sitemap `lastModified` match history.

**D7 — Redirects as static `next.config` entries, generated once.** A script reads the live `post_tag-sitemap.xml` and `page-sitemap.xml` and emits a committed redirects module: `/tag/:slug` → `/blog` (301, blanket rule), plus explicit per-page mappings for any WP *pages* with a v2 equivalent (homepage anchors); unmappable pages are listed for a user decision rather than silently 404'd. Legacy `/blog/page/N`: if the v2 hub adopts the same pagination shape this is a 200 and no rule is needed; otherwise a pattern 301 to the hub's shape. Static config over middleware: the set is small, finite, and inspectable in review.

**D8 — Parity gate as a standalone script** (`lib/scripts/check-url-parity.ts`): fetches all four live Yoast sitemaps, requests every URL against a target base URL (preview or prod deployment), and reports 200/301/404 counts with a non-zero exit on any 404. Run against the preview deployment before DNS cutover; this is the launch blocker.

## Risks / Trade-offs

- [HTML→Lexical conversion mangles old content (2017-era markup, shortcodes, embeds)] → D3's per-post drop audit + spot-check the oldest and most complex posts manually; `--only` flag makes per-post fixes cheap.
- [WP host slow/rate-limiting during bulk image download] → throttle requests, retry with backoff, resumable via D5 idempotency.
- [Some WP pages (page-sitemap.xml) have no v2 equivalent] → D7 surfaces them as an explicit decision list (redirect target or accepted 404) instead of deciding silently.
- [Import runs against production DB] → run against a Neon branch first, verify parity + spot-checks, then run against prod (or promote the branch).
- [WP content changes between import and cutover (site still publishing — sitemap lastmod 2026-07-10)] → re-run the import (idempotent) as the final pre-cutover step; parity gate re-run after.

## Migration Plan

1. Build + run redirect-generation script; commit redirects.
2. Run import against a Neon dev branch; review import report (drops, missing images); spot-check rendering of oldest/newest/most-complex posts in the v2 template.
3. Fix converter gaps, re-run affected slugs via `--only`.
4. Run parity gate against preview deployment → iterate until zero 404s.
5. Final re-import + parity re-run immediately before DNS cutover.
Rollback: content-only change — reverting means clearing imported posts (Neon branch discard) and dropping redirect entries; no frontend code at risk.

## Open Questions

- Final disposition list for WP pages without v2 equivalents (produced by D7's audit) — needs a user pass before cutover.
