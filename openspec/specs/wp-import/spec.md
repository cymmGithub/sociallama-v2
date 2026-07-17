# wp-import

## Purpose

One-time migration of the live WordPress site (79 posts + media) into the Payload CMS: REST extraction, HTML→Lexical conversion, media re-hosting to Vercel Blob, category/SEO mapping, and idempotent re-runs.

## Requirements

### Requirement: All live posts imported with fidelity
A migration script SHALL import every post listed in the live site's `post-sitemap.xml` (79 posts) from the WP REST API into the Payload `posts` collection via the Local API, preserving: slug (exact), title, excerpt, publish date (WP `date`, site timezone), category (mapped to the four seeded categories), featured image as cover, and body content converted from WP HTML to Lexical. Yoast `metaTitle`/`metaDescription` SHALL be imported when `yoast_head_json` provides them. Imported posts SHALL be created as published so their URLs resolve immediately.

#### Scenario: Full import run
- **WHEN** the import script completes against an empty (seeded) database
- **THEN** every slug from the live post sitemap exists as a published Payload post with matching title, date, and category

#### Scenario: Content conversion audit
- **WHEN** the HTML→Lexical conversion drops or cannot map a node in any post
- **THEN** the import report lists the post slug and the dropped content, and the import continues

### Requirement: Media re-hosted, no WP references
All images referenced by imported posts — featured images and in-content `<img>` tags — SHALL be downloaded from the WP host and stored in the Payload media collection (Vercel Blob), deduplicated by source URL. In-content image references SHALL be rewritten to Lexical upload nodes pointing at the created media documents. Migrated content SHALL contain zero references to the WP host. An unfetchable image SHALL be logged in the import report, never silently dropped.

#### Scenario: In-content image
- **WHEN** a WP post body contains an `<img>` pointing at `/wp-content/uploads/...`
- **THEN** the migrated post renders that image from Payload media (Blob), and no `wp-content` URL remains in the stored content

#### Scenario: Shared image dedup
- **WHEN** two posts reference the same source image URL
- **THEN** both migrated posts reference a single media document

### Requirement: Idempotent, resumable import
The import SHALL be idempotent keyed on slug: re-running updates existing posts instead of duplicating them, and media dedup by source URL prevents duplicate uploads. The script SHALL support importing a single post by slug (`--only <slug>`) for iterative fixes, and SHALL be re-runnable as a final pre-cutover refresh while the WP site is still publishing.

#### Scenario: Re-run after partial failure
- **WHEN** the import is re-run after failing partway
- **THEN** it completes without creating duplicate posts or duplicate media

#### Scenario: Single-post re-import
- **WHEN** the script runs with `--only <slug>` after a converter fix
- **THEN** only that post is re-imported and updated in place
