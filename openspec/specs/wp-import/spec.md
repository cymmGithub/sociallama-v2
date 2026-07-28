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

### Requirement: Internal post embeds convert to a single link

A WordPress internal post embed — emitted by WP as a `<blockquote class="wp-embedded-content">` holding the titled permalink followed by an `<iframe class="wp-embedded-content" src="…/embed/#?secret=…">` — SHALL convert to exactly one link in the migrated body: the blockquote's permalink. The accompanying iframe SHALL be dropped rather than degraded to a link, since it carries no information the blockquote does not already hold.

This narrows, but does not replace, the converter's general iframe handling: an iframe that is NOT an internal post embed (YouTube, Facebook, and other third-party players) SHALL continue to degrade to a link, because no sibling element preserves its URL.

Migrated bodies SHALL contain no `…/embed/#?secret=…` URL, in link hrefs or in visible text.

#### Scenario: Internal post embed

- **WHEN** a WP post body embeds another post of the same site
- **THEN** the migrated body contains the blockquote's titled permalink and no raw `…/embed/#?secret=…` paragraph

#### Scenario: Third-party iframe is unaffected

- **WHEN** a WP post body contains a YouTube or Facebook iframe
- **THEN** the migrated body still contains a link to that iframe's src

#### Scenario: Already-imported content is repaired

- **WHEN** the repair has run against posts imported before this change
- **THEN** no published post contains a `…/embed/#?secret=…` URL, and every blockquote permalink that accompanied one is still present

### Requirement: Converted links resolve

Every link the converter writes into a migrated body SHALL have an href that resolves as authored: an internal href SHALL be a root-relative path (leading `/`, no percent-encoded path separators), and no href SHALL be produced by URL-encoding a full path into a single segment.

#### Scenario: Internal link href

- **WHEN** the converter writes a link to another post on the site
- **THEN** its href is a root-relative path such as `/jak-stworzyc-brief-marketingowy`, not `%2Fjak-stworzyc-brief-marketingowy%2F…`

#### Scenario: No dead internal links remain

- **WHEN** every internal link in the published posts is requested
- **THEN** each resolves to an existing page rather than a not-found response

### Requirement: Converted bodies carry no presentational debris

The HTML→Lexical converter SHALL drop WordPress formatting that exists only to simulate layout, rather than carrying it into Payload:

- **Alignment** — a `text-align: justify` declaration, whether inline or via a WP alignment class, SHALL NOT become a `justify` format on the Lexical node. `center` alignment SHALL continue to convert, since it is authored intent.
- **Spacer paragraphs** — a paragraph whose entire content is line breaks, non-breaking spaces, or empty inline wrappers SHALL NOT be emitted. WordPress uses these for vertical rhythm; the post template supplies its own spacing, so they arrive as double gaps.
- **Non-breaking spaces** — a `&nbsp;` separating two ordinary words SHALL be converted to an ordinary space, and a `&nbsp;` used to pad — indenting a block, trailing it, or sitting beside an ordinary space — SHALL NOT survive. A `&nbsp;` that is genuinely holding a phrase together (between digit groups, after a one- or two-letter word in Polish) SHALL be preserved.

This closes a regression path: the repair in this change cleans content already imported, and these requirements stop `migrate-wp.ts` from putting it back on a re-run.

#### Scenario: Justified WordPress paragraph

- **WHEN** a WP post body contains a paragraph styled `text-align: justify`
- **THEN** the migrated Lexical node carries no alignment format

#### Scenario: Centred WordPress paragraph

- **WHEN** a WP post body contains a deliberately centred paragraph or image
- **THEN** the migrated node still carries a `center` format

#### Scenario: WordPress spacer paragraph

- **WHEN** a WP post body contains `<p>&nbsp;</p>` or `<p><br /></p>` between two blocks
- **THEN** the migrated body contains no corresponding empty paragraph

#### Scenario: Non-breaking space between words

- **WHEN** a WP paragraph or heading separates two ordinary words with `&nbsp;`
- **THEN** the migrated text carries an ordinary space and wraps normally

#### Scenario: Non-breaking spaces used as WordPress indentation

- **WHEN** a WP paragraph opens or closes with a run of `&nbsp;`
- **THEN** the migrated text carries neither the run nor a leading or trailing gap

#### Scenario: Already-imported content is repaired

- **WHEN** the repair has run against posts imported before this change
- **THEN** no post carries a `justify` format, a spacer paragraph, or a word-space non-breaking space, and every deliberately centred node is still centred

#### Scenario: Re-import stays clean

- **WHEN** the migration is re-run against posts already repaired
- **THEN** the resulting bodies contain none of the three debris classes

