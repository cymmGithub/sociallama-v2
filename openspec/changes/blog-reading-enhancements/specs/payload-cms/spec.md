## MODIFIED Requirements

### Requirement: Posts collection
A `posts` collection SHALL exist with fields: `title` (required), `slug` (required, unique, URL-safe), `excerpt`, `cover` (relation to media), `content` (Lexical rich text), `category` (relation to categories, required), `publishedAt` (datetime), and an SEO group (`metaTitle`, `metaDescription`, `ogImage` with fallback to cover). Drafts and versions SHALL be enabled; only published posts are publicly visible. Post slugs SHALL be validated against a reserved-slug list (at minimum: `blog`, `category`, `admin`, `api`, `en`, and existing top-level routes) exported as a single constant.

The `content` editor SHALL enable Lexical's blocks feature with exactly the blocks defined by the `blog-content-blocks` capability (`stat`, `pillars`). Block data SHALL be stored inside the `content` JSON; enabling or extending the feature SHALL NOT require a database migration.

`title`, `slug`, `excerpt`, `content`, `seo.metaTitle`, and `seo.metaDescription` SHALL be localized, so each locale carries its own text and its own URL slug. `cover`, `category`, `author`, `publishedAt`, and `seo.ogImage` SHALL be shared across locales — a translation is a language change, not an editorial or media change. Slug uniqueness and reserved-slug validation SHALL apply per locale.

#### Scenario: Draft is not public
- **WHEN** a post exists in draft status
- **THEN** it does not appear on any public route or in the sitemap, but is visible in the admin panel

#### Scenario: Reserved slug rejected
- **WHEN** an editor sets a post slug to `blog`, `en`, or another reserved value in either locale
- **THEN** validation fails with a message naming the conflict, and the post cannot be saved with that slug

#### Scenario: Blocks available without migration
- **WHEN** the blocks feature is enabled on `content`
- **THEN** `payload migrate:create` produces no schema change, and the admin editor offers the `stat` and `pillars` blocks

#### Scenario: Translating a post does not change its media or taxonomy
- **WHEN** a post's English locale is written
- **THEN** its `cover`, `category`, `author`, `publishedAt`, and `seo.ogImage` are unchanged, and its Polish fields are unchanged

#### Scenario: Each locale has its own slug
- **WHEN** a post carries both locales
- **THEN** its Polish and English slugs are stored independently, and the same slug string may be used by different posts in different locales
