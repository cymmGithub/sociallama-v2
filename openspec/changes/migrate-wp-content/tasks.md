## 1. Redirects and audits

- [x] 1.1 Script to fetch live `post_tag-sitemap.xml` and `page-sitemap.xml`; emit committed redirects module (`/tag/:slug` → `/blog` blanket 301; per-page 301 mappings) plus disposition report of WP pages with no v2 equivalent
- [x] 1.2 Wire redirects into Next config; decide `/blog/page/N` handling (200 via matching hub pagination shape, else pattern 301); verify sample URLs locally
- [x] 1.3 Get user decisions on the disposition report (redirect target or accepted 404 per unmapped page); record them in the redirects module — decisions 2026-07-17: `/500-zl-na-reklame`→`/#uslugi`, `/cookie-policy`→`/polityka-prywatnosci`; `/polityka-prywatnosci` and `/zostan-lama` rebuilt as static v2 pages from WP content (added to RESERVED_SLUGS)

## 2. Import script

- [x] 2.1 Build `lib/scripts/migrate-wp.ts`: fetch all posts from `/wp-json/wp/v2/posts` (`_embed`, `per_page=100`) with category/tag/Yoast fields
- [x] 2.2 HTML pre-pass: strip WP wrappers/shortcodes, relativize internal `sociallama.pl` links, extract image references
- [x] 2.3 Media phase: download featured + in-content images (throttled, retry with backoff), create media docs deduplicated by source URL
- [x] 2.4 Convert HTML → Lexical via `convertHTMLToLexical`, replacing `<img>` refs with upload nodes; log dropped/unmapped nodes per post in the import report
- [x] 2.5 Upsert posts by slug via Local API (published, mapped category, cover, publishedAt from WP date, Yoast metaTitle/metaDescription); support `--only <slug>`
- [x] 2.6 Import report: per-post status, dropped nodes, unfetchable images; non-zero exit on hard failures

## 3. Migration run and verification

- [x] 3.1 Full run against a Neon dev branch; confirm 79/79 slugs present and zero `wp-content` references in stored content
- [x] 3.2 Spot-check rendering in the v2 template: oldest post, newest post, most complex markup (embeds/galleries); fix converter gaps and re-import via `--only`
- [x] 3.3 Verify idempotency: full re-run produces no duplicate posts or media
- [x] 3.4 Promote to production data (re-run against prod DB or promote branch); verify `/blog`, categories, and NewsLAMA reflect real content — data promoted 2026-07-17 (79/79, 262 media, zero wp-content refs); visual verify of the deployed app pending redeploy (cache bypassed by Local API writes)

## 4. Parity gate and cutover readiness

- [x] 4.1 Build `lib/scripts/check-url-parity.ts`: fetch live Yoast sitemaps, request every URL against a target base URL, report 200/301/404 per URL, exit non-zero on any 404
- [ ] 4.2 Run gate against preview deployment; iterate until zero 404s (posts/hub/categories 200, tags/pages/legacy pagination 301)
- [x] 4.3 Document the cutover checklist: final re-import while WP still publishes → parity gate re-run → DNS cutover
