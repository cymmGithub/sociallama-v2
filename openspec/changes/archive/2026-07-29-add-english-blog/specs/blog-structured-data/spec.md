## MODIFIED Requirements

### Requirement: BlogPosting structured data on post detail pages

Each blog post detail page SHALL emit a valid `BlogPosting` JSON-LD block including `headline` (title), `datePublished` (`publishedAt`), `dateModified` (`updatedAt`), and `mainEntityOfPage` (the canonical URL for the rendering locale), declaring `inLanguage` matching the rendering locale — `"pl"` on Polish pages, `"en"` on English pages. It SHALL include `description` (SEO meta → excerpt) and `image` (OG image → cover) when present, omitting them entirely otherwise. `headline` and `description` SHALL be the rendering locale's text.

`inLanguage` SHALL never be emitted as `"en"` on a page whose text is Polish; a post without an English translation has no English page to emit structured data for.

#### Scenario: Published post renders BlogPosting
- **WHEN** a published post is served at `/{slug}`
- **THEN** its markup contains one `application/ld+json` script with `@type` `BlogPosting` whose `headline`, `datePublished`, `dateModified`, and `mainEntityOfPage` match the post, declaring `inLanguage: "pl"`

#### Scenario: Translated post renders English BlogPosting
- **WHEN** a translated post is served at `/en/blog/{en-slug}`
- **THEN** its `BlogPosting` declares `inLanguage: "en"`, its `headline` and `description` are the English text, and its `mainEntityOfPage` is the English URL

#### Scenario: Language declaration matches the text
- **WHEN** any post page emits structured data
- **THEN** the declared `inLanguage` matches the language the page's `headline` and body are actually written in

#### Scenario: Optional fields are omitted, not empty
- **WHEN** a post has no SEO description, excerpt, or image
- **THEN** the block omits `description` and `image` rather than emitting empty or null values

### Requirement: Breadcrumb structured data

Each blog post detail page SHALL emit a `BreadcrumbList` JSON-LD block: a blog item pointing at the hub for the rendering locale, then the post as the leaf. The blog item's label SHALL be in the rendering locale, and its URL SHALL be `/blog` on Polish pages and `/en/blog` on English pages.

#### Scenario: Breadcrumb mirrors the blog hierarchy
- **WHEN** a published post is served at `/{slug}`
- **THEN** its markup contains a `BreadcrumbList` whose first item links to `/blog` and whose leaf item is the current post URL

#### Scenario: English breadcrumb points at the English hub
- **WHEN** a translated post is served at `/en/blog/{en-slug}`
- **THEN** its `BreadcrumbList` first item links to `/en/blog` with an English label, and its leaf item is the English post URL
