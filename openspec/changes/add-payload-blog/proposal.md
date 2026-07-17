## Why

The homepage NewsLAMA card links to `/blog/linkedin-premium-czy-warto`, which 404s — no blog exists in v2. The live site (sociallama.pl, WordPress) has 79 indexed posts spanning 2017–2026 whose Google indexing must survive the v2 launch, and the client needs to manage news/blog content themselves. Payload CMS is the chosen platform (deliberate decision over the starter's unused Sanity scaffolding: self-hosted, client owns data, no SaaS fees).

## What Changes

- Mount Payload 3 inside this Next 16 app: admin panel at `/admin` (Polish locale), REST/Local API, `payload.config.ts`. Requires restructuring `app/` — the current root layout moves into a `(frontend)` route group; Payload adds a `(payload)` route group. Verified compatible: Payload 3.85 requires Next `>=16.2.6 <17`; repo is on 16.2.10.
- Infrastructure: Neon Postgres (via Vercel Marketplace) as Payload's database, Vercel Blob as media storage.
- Collections: `posts` (title, slug, excerpt, cover image, Lexical rich text, category, publishedAt, SEO fields, draft/publish status), `categories` (seeded with the live site's four: marketing, reklama, seo, social-media), `media`, `users` (admin auth).
- Blog post pages at **root-level URLs** `/{slug}` (user decision, 2026-07-17) — exact URL parity with the live WordPress site so indexing is preserved without redirects. Custom Lexical renderer mapping rich-text nodes to the design-system components; single bespoke post template.
- `/blog` hub page: paginated post listing (mirrors live `sociallama.pl/blog/` which is indexed), plus `/category/{slug}` category listing pages (also indexed on the live site).
- NewsLAMA homepage section switches from hardcoded `lib/content/home.ts` content to the latest published post fetched via Payload's Local API.
- **BREAKING**: remove the unused Sanity integration (`lib/integrations/sanity/`, `next-sanity`, `@sanity/*`, `@portabletext/react` deps, `sanity:*` scripts) — dead scaffolding once Payload is the CMS.
- Sitemap (`app/sitemap.ts`) extended with post, blog-hub, and category URLs from Payload.
- One seed post ("LinkedIn Premium — czy warto?") so the pipeline is verifiable end-to-end; full content migration is a separate follow-up change (`migrate-wp-content`).

## Capabilities

### New Capabilities
- `payload-cms`: Payload platform in this app — mounting/route groups, admin panel (Polish), database and blob storage wiring, the four collections and their fields, auth for editors.
- `blog-post-page`: root-level `/{slug}` post route — rendering (Lexical → design-system components), metadata/SEO/OG, draft handling, 404 behavior, slug-collision constraints with static routes.
- `blog-hub`: `/blog` listing with pagination and `/category/{slug}` pages — ordering, page size, empty states, indexability.

### Modified Capabilities
- `homepage`: the "Content sections from typed data" requirement changes — NewsLAMA no longer shows the hardcoded card; it renders the latest published post from Payload (falling back gracefully when no post exists).

## Impact

- **Dependencies**: add `payload`, `@payloadcms/next`, `@payloadcms/db-vercel-postgres` (or `db-postgres`), `@payloadcms/storage-vercel-blob`, `@payloadcms/richtext-lexical`, `@payloadcms/translations` (pl); remove `next-sanity`, `@sanity/*`, `@portabletext/react`, Sanity dev deps and scripts.
- **App structure**: root layout and all existing routes move under `app/(frontend)/`; new `app/(payload)/` route group (generated files); new `payload.config.ts` at repo root.
- **Environment**: new vars `DATABASE_URL` (Neon), `PAYLOAD_SECRET`, `BLOB_READ_WRITE_TOKEN`; Sanity vars dropped from env validation.
- **Affected code**: `app/(home)/sections/news-lama/` (data source), `lib/content/home.ts` (news export retired), `app/sitemap.ts`, `lib/integrations/` registry, CI (`bun run check` must pass with Payload's generated types).
- **Systems**: Vercel project gains Neon Postgres + Blob store; `/admin` becomes an authenticated surface.
- **SEO**: no URL moves in this change; new indexed surfaces (`/blog`, `/category/*`, post pages) match live-site paths. Launch-day parity for all 79 posts is owned by `migrate-wp-content`.
