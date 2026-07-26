## ADDED Requirements

### Requirement: BlogPosting structured data on post detail pages

Each blog post detail page (`/{slug}`) SHALL emit a valid `BlogPosting` JSON-LD block including `headline` (title), `datePublished` (`publishedAt`), `dateModified` (`updatedAt`), and `mainEntityOfPage` (canonical `/{slug}`), declaring `inLanguage: "pl"`. It SHALL include `description` (SEO meta → excerpt) and `image` (OG image → cover) when present, omitting them entirely otherwise.

#### Scenario: Published post renders BlogPosting
- **WHEN** a published post is served at `/{slug}`
- **THEN** its markup contains one `application/ld+json` script with `@type` `BlogPosting` whose `headline`, `datePublished`, `dateModified`, and `mainEntityOfPage` match the post

#### Scenario: Optional fields are omitted, not empty
- **WHEN** a post has no SEO description, excerpt, or image
- **THEN** the block omits `description` and `image` rather than emitting empty or null values

### Requirement: Author reflects the resolved author

The `BlogPosting` `author` SHALL reflect the resolved author. For a guest (named) author it SHALL be a `Person` with `name` and, when an external profile URL exists, `sameAs`. For the Social Lama default it SHALL be the `Organization`, referenced by its `@id` (`{APP_BASE_URL}/#organization`).

#### Scenario: Guest-authored post
- **WHEN** a post authored by Łukasz Płociński is served
- **THEN** its `BlogPosting.author` is a `Person` named "Łukasz Płociński" whose `sameAs` includes his SEOFLY profile URL

#### Scenario: Default-authored post
- **WHEN** an unauthored post is served
- **THEN** its `BlogPosting.author` references the site `Organization` `@id`

### Requirement: Organization is always the publisher

Regardless of author, the `BlogPosting` `publisher` SHALL reference the site `Organization` by its `@id`, not duplicate its fields.

#### Scenario: Publisher references the site organization
- **WHEN** any post's `BlogPosting` block is emitted
- **THEN** its `publisher` resolves to the same `@id` as the root layout's `Organization` node

### Requirement: Breadcrumb structured data

Each blog post detail page SHALL emit a `BreadcrumbList` JSON-LD block: a "Blog" item pointing at `/blog`, then the post as the leaf.

#### Scenario: Breadcrumb mirrors the blog hierarchy
- **WHEN** a published post is served at `/{slug}`
- **THEN** its markup contains a `BreadcrumbList` whose first item links to `/blog` and whose leaf item is the current post URL
