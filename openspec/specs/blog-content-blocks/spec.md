# blog-content-blocks Specification

## Purpose
TBD - created by archiving change blog-reading-enhancements. Update Purpose after archive.
## Requirements
### Requirement: Editors can insert a pull-stat block
The posts rich-text editor SHALL offer a `stat` block with two required text fields: `value` (the figure, for example `45%`) and `caption` (one sentence). The block SHALL be stored inside the post's Lexical `content` JSON, so adding the block requires no database migration and changes no existing post. A post page SHALL render a `stat` block as an aside on the accent rule, with the value set in the display face and the caption beside it on the same axis, at the position the editor placed it in the body.

#### Scenario: Stat block in the admin
- **WHEN** an editor opens a post body in the admin panel
- **THEN** the editor's block menu offers "Statystyka" with `value` and `caption` fields, and saving the post stores the block in the body JSON

#### Scenario: Stat block rendered
- **WHEN** a published body contains a `stat` block with value `45%` and caption `więcej szans sprzedażowych generują osoby z wysokim SSI` after a paragraph
- **THEN** the page renders, after that paragraph, an aside showing `45%` large in the display face and the caption beside it, and the prose paragraph is unchanged

#### Scenario: Existing posts are untouched
- **WHEN** the block feature is deployed
- **THEN** no existing post body changes and no post renders a stat aside until an editor inserts one

### Requirement: Editors can insert a pillars block
The posts rich-text editor SHALL offer a `pillars` block with an `items` array of two to six entries, each with a required `title` and an optional `description`, plus an optional `chip` text. A post page SHALL render the block as a numbered card grid in array order, each card showing its ordinal, title, description, and the chip when set; two columns from the tablet breakpoint and one column below it.

#### Scenario: Pillars block rendered
- **WHEN** a body contains a `pillars` block with four items and chip `maks. 25 pkt`
- **THEN** the page renders four cards numbered 1–4 in array order, each carrying the chip `maks. 25 pkt`, in two columns on desktop

#### Scenario: Item bounds enforced
- **WHEN** an editor tries to save a `pillars` block with one item or seven items
- **THEN** validation fails naming the two-to-six bound and the post is not saved

#### Scenario: Chip omitted
- **WHEN** a `pillars` block has no chip
- **THEN** the cards render without a chip element, not with an empty one

### Requirement: Blocks import from the authored markdown source
`import-post.ts` SHALL accept both blocks in `source.pl.md` through Lexical's JSX block syntax: `<Stat value="…">caption</Stat>` and `<Pillars chip="…">` wrapping an ordered list whose items read `N. **title** description`. Each block SHALL define the matching Lexical `jsx` import and export so that markdown → Lexical → markdown round-trips the block unchanged. A `Pillars` child line that does not parse SHALL abort the import with a message naming the line; no block SHALL be dropped silently.

#### Scenario: Round trip
- **WHEN** a markdown source containing one `Stat` and one `Pillars` block is converted to Lexical and back
- **THEN** the resulting markdown contains the same two blocks with the same attributes and items

#### Scenario: Unparseable pillar line aborts
- **WHEN** a `Pillars` block contains a child line that is not `N. **title** …`
- **THEN** the import exits non-zero naming that line and writes nothing

#### Scenario: Re-import is idempotent
- **WHEN** the same source with blocks is imported twice
- **THEN** the second run updates the same draft and the body contains each block once

