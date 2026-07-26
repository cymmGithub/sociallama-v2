## ADDED Requirements

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
