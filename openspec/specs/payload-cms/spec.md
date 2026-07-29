# payload-cms Specification

## Purpose
TBD - created by archiving change add-payload-blog. Update Purpose after archive.
## Requirements
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
A `posts` collection SHALL exist with fields: `title` (required), `slug` (required, unique, URL-safe), `excerpt`, `cover` (relation to media), `content` (Lexical rich text), `category` (relation to categories, required), `publishedAt` (datetime), and an SEO group (`metaTitle`, `metaDescription`, `ogImage` with fallback to cover). Drafts and versions SHALL be enabled; only published posts are publicly visible. Post slugs SHALL be validated against a reserved-slug list (at minimum: `blog`, `category`, `admin`, `api`, `en`, and existing top-level routes) exported as a single constant.

`title`, `slug`, `excerpt`, `content`, `seo.metaTitle`, and `seo.metaDescription` SHALL be localized, so each locale carries its own text and its own URL slug. `cover`, `category`, `author`, `publishedAt`, and `seo.ogImage` SHALL be shared across locales — a translation is a language change, not an editorial or media change. Slug uniqueness and reserved-slug validation SHALL apply per locale.

#### Scenario: Draft is not public
- **WHEN** a post exists in draft status
- **THEN** it does not appear on any public route or in the sitemap, but is visible in the admin panel

#### Scenario: Reserved slug rejected
- **WHEN** an editor sets a post slug to `blog`, `en`, or another reserved value in either locale
- **THEN** validation fails with a message naming the conflict, and the post cannot be saved with that slug

#### Scenario: Translating a post does not change its media or taxonomy
- **WHEN** a post's English locale is written
- **THEN** its `cover`, `category`, `author`, `publishedAt`, and `seo.ogImage` are unchanged, and its Polish fields are unchanged

#### Scenario: Each locale has its own slug
- **WHEN** a post carries both locales
- **THEN** its Polish and English slugs are stored independently, and the same slug string may be used by different posts in different locales

### Requirement: Categories collection seeded with live-site taxonomy
A `categories` collection SHALL exist with `title` and `slug`, seeded with the live site's four categories: `marketing`, `reklama`, `seo`, `social-media`. Polish category slugs SHALL match the live WordPress category slugs exactly. `title` and `slug` SHALL be localized, so English category listings render English names at English URLs.

#### Scenario: Seed run
- **WHEN** the seed script runs against an empty database
- **THEN** exactly these four categories exist with Polish slugs identical to the live site's `/category/*` paths

#### Scenario: English category names and URLs
- **WHEN** a category listing renders in English
- **THEN** its heading and pill show the English category name, and its URL uses the English category slug

### Requirement: Users collection for editor auth
A `users` auth-enabled collection SHALL gate the admin panel. Public routes SHALL NOT require authentication.

#### Scenario: Unauthenticated admin access
- **WHEN** an unauthenticated visitor requests `/admin`
- **THEN** they are presented with the login screen and no content-management UI

### Requirement: Published changes appear without redeploy
Blog routes SHALL use static rendering with on-demand revalidation: Payload `afterChange`/`afterDelete` hooks on posts and categories SHALL revalidate the affected post page, `/blog` hub, category pages, and homepage. Revalidation SHALL cover both locales' surfaces for the affected document. Editors SHALL NOT need a rebuild or deploy for published content to appear.

#### Scenario: Editor publishes a post
- **WHEN** an editor publishes a post in the admin panel
- **THEN** within seconds the post page, `/blog`, its category page, and the homepage NewsLAMA card reflect the change without a redeploy

#### Scenario: Editor edits an English translation
- **WHEN** an editor changes a post's English fields
- **THEN** the English post page, `/en/blog`, its English category page, and `/en` reflect the change without a redeploy

### Requirement: Sanity integration removed
The unused Sanity integration SHALL be fully removed: `lib/integrations/sanity/`, all `@sanity/*`, `next-sanity`, and `@portabletext/react` dependencies, `sanity:*` package scripts, and Sanity entries in env validation and the integration registry.

#### Scenario: Clean removal
- **WHEN** `bun run check` runs after removal
- **THEN** it passes with no references to Sanity remaining in source, scripts, or the integration registry

### Requirement: Localization schema changes never rely on schema push

The Postgres adapter SHALL be configured with `push: false` in every environment, so that schema changes reach the database only through committed migrations. A migration that moves scalar columns into a `*_locales` table SHALL copy the existing rows into the new table under the default locale **before** dropping the source columns, and SHALL provide a `down` that restores the columns and copies the default-locale rows back.

Schema push diffs table shape and cannot infer that a dropped column and a new localized column hold the same data; left enabled, it drops populated columns with no backfill.

#### Scenario: Push is not the schema path

- **WHEN** a developer adds `localized: true` to a field and starts the dev server
- **THEN** no schema change is applied automatically, and the change takes effect only after its migration is written and run

#### Scenario: Existing content survives localization

- **WHEN** the localization migration runs against a collection holding published documents
- **THEN** every document still returns its `title`, `excerpt`, and body content under the default locale, byte-identical to before the migration, and its version history is intact

#### Scenario: Localization is reversible

- **WHEN** the localization migration's `down` is run
- **THEN** the original columns exist again carrying the default-locale values, rather than being left empty

#### Scenario: Every localized collection is backfilled, not just the largest

- **WHEN** one migration localizes several collections at once
- **THEN** each of them carries its own copy step, and none is left with an empty locales table

#### Scenario: Localizing a `hasMany` relationship keeps its existing rows

- **WHEN** a `hasMany` relationship becomes localized and its join table gains a locale column
- **THEN** the existing rows are assigned the default locale rather than being left unassigned and invisible in every locale

#### Scenario: A database can actually receive migrations

- **WHEN** migrations become the only schema path for an environment whose schema was previously built by push
- **THEN** its migration ledger is reconciled first, and `payload migrate` reports a clean no-op before any new migration is written

