## ADDED Requirements

### Requirement: Payload mounted inside the Next.js app
Payload 3 SHALL be mounted in this Next.js app via the standard route-group install: the existing root layout and all frontend routes move under `app/(frontend)/`, and Payload's generated `app/(payload)/` route group serves the admin panel at `/admin` and Payload's API routes. The frontend SHALL render identically after the restructure. `payload.config.ts` SHALL live at the repo root and pass `bun run check` (generated Payload files excluded from Biome).

#### Scenario: Admin panel reachable
- **WHEN** an editor navigates to `/admin` with valid credentials
- **THEN** the Payload admin panel loads, served by the same Next.js deployment as the frontend

#### Scenario: Frontend unaffected by restructure
- **WHEN** the homepage is rendered after the route-group restructure
- **THEN** its output (routes, metadata, styles, behavior) is unchanged from before the restructure

### Requirement: Polish admin UI
The admin panel SHALL display in Polish: `i18n` configured with Polish via `@payloadcms/translations`, and collection/field labels authored in Polish.

#### Scenario: Editor opens admin
- **WHEN** an editor opens any admin view
- **THEN** the Payload UI chrome and collection/field labels appear in Polish

### Requirement: Postgres and Blob infrastructure
Payload SHALL use the `@payloadcms/db-postgres` adapter with a Neon Postgres connection string from `DATABASE_URL`, and `@payloadcms/storage-vercel-blob` for media files via `BLOB_READ_WRITE_TOKEN`. `PAYLOAD_SECRET` SHALL be required. Env vars SHALL be validated with Zod following the repo's integration env pattern, failing loudly with setup instructions when missing.

#### Scenario: Missing configuration
- **WHEN** the app starts without `DATABASE_URL` or `PAYLOAD_SECRET`
- **THEN** startup fails with a validation error naming the missing variable and how to set it

#### Scenario: Media upload
- **WHEN** an editor uploads an image in the admin panel
- **THEN** the file is stored in Vercel Blob and served via the media collection with generated sizes

### Requirement: Posts collection
A `posts` collection SHALL exist with fields: `title` (required), `slug` (required, unique, URL-safe), `excerpt`, `cover` (relation to media), `content` (Lexical rich text), `category` (relation to categories, required), `publishedAt` (datetime), and an SEO group (`metaTitle`, `metaDescription`, `ogImage` with fallback to cover). Drafts and versions SHALL be enabled; only published posts are publicly visible. Post slugs SHALL be validated against a reserved-slug list (at minimum: `blog`, `category`, `admin`, `api`, and existing top-level routes) exported as a single constant.

#### Scenario: Draft is not public
- **WHEN** a post exists in draft status
- **THEN** it does not appear on any public route or in the sitemap, but is visible in the admin panel

#### Scenario: Reserved slug rejected
- **WHEN** an editor sets a post slug to `blog` or another reserved value
- **THEN** validation fails with a message naming the conflict, and the post cannot be saved with that slug

### Requirement: Categories collection seeded with live-site taxonomy
A `categories` collection SHALL exist with `title` and `slug`, seeded with the live site's four categories: `marketing`, `reklama`, `seo`, `social-media`. Category slugs SHALL match the live WordPress category slugs exactly.

#### Scenario: Seed run
- **WHEN** the seed script runs against an empty database
- **THEN** exactly these four categories exist with slugs identical to the live site's `/category/*` paths

### Requirement: Users collection for editor auth
A `users` auth-enabled collection SHALL gate the admin panel. Public routes SHALL NOT require authentication.

#### Scenario: Unauthenticated admin access
- **WHEN** an unauthenticated visitor requests `/admin`
- **THEN** they are presented with the login screen and no content-management UI

### Requirement: Published changes appear without redeploy
Blog routes SHALL use static rendering with on-demand revalidation: Payload `afterChange`/`afterDelete` hooks on posts and categories SHALL revalidate the affected post page, `/blog` hub, category pages, and homepage. Editors SHALL NOT need a rebuild or deploy for published content to appear.

#### Scenario: Editor publishes a post
- **WHEN** an editor publishes a post in the admin panel
- **THEN** within seconds the post page, `/blog`, its category page, and the homepage NewsLAMA card reflect the change without a redeploy

### Requirement: Sanity integration removed
The unused Sanity integration SHALL be fully removed: `lib/integrations/sanity/`, all `@sanity/*`, `next-sanity`, and `@portabletext/react` dependencies, `sanity:*` package scripts, and Sanity entries in env validation and the integration registry.

#### Scenario: Clean removal
- **WHEN** `bun run check` runs after removal
- **THEN** it passes with no references to Sanity remaining in source, scripts, or the integration registry
