## ADDED Requirements

### Requirement: Converted bodies carry no presentational debris

The HTML→Lexical converter SHALL drop WordPress formatting that exists only to simulate layout, rather than carrying it into Payload:

- **Alignment** — a `text-align: justify` declaration, whether inline or via a WP alignment class, SHALL NOT become a `justify` format on the Lexical node. `center` alignment SHALL continue to convert, since it is authored intent.
- **Spacer paragraphs** — a paragraph whose entire content is line breaks, non-breaking spaces, or empty inline wrappers SHALL NOT be emitted. WordPress uses these for vertical rhythm; the post template supplies its own spacing, so they arrive as double gaps.
- **Non-breaking spaces** — a `&nbsp;` separating two ordinary words SHALL be converted to an ordinary space. A `&nbsp;` that is genuinely holding a phrase together (before a unit, after a single-letter preposition in Polish) MAY be preserved.

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

#### Scenario: Already-imported content is repaired

- **WHEN** the repair has run against posts imported before this change
- **THEN** no post carries a `justify` format, a spacer paragraph, or a word-space non-breaking space, and every deliberately centred node is still centred

#### Scenario: Re-import stays clean

- **WHEN** the migration is re-run against posts already repaired
- **THEN** the resulting bodies contain none of the three debris classes
