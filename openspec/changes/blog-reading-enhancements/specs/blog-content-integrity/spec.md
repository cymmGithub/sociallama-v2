## MODIFIED Requirements

### Requirement: A translation preserves the original's structure exactly

An English post body SHALL be the Polish body with its prose replaced and everything else carried through unchanged. Specifically, the English body SHALL have the same block count, the same block types, and the same block order as the Polish body; every `upload` node SHALL reference the same media document in the same position; every `link` node SHALL carry the same target — including the document relationship of an internal link — in the same position; every heading SHALL keep its `tag`; every Lexical `block` node SHALL keep its block slug, its field keys, and its item count in the same position, with each of its text fields translated; and element-level alignment formats SHALL be carried through.

Inline emphasis SHALL be preserved as emphasis of the corresponding English words, not of the corresponding character positions. Where an English sentence cannot carry the Polish emphasis without changing its meaning, the post SHALL be reported for human resolution rather than resolved by guessing.

Structure that cannot be verified as intact SHALL NOT be written to the database.

#### Scenario: Images survive translation
- **WHEN** a post containing embedded images is translated
- **THEN** the English body references exactly the same media documents, the same number of times, in the same positions

#### Scenario: Links survive translation
- **WHEN** a post containing internal and external links is translated
- **THEN** every link in the English body carries the same target as its Polish counterpart, and no link is added or dropped

#### Scenario: Blocks survive translation
- **WHEN** a post containing a `stat` block and a `pillars` block is translated
- **THEN** the English body carries the same blocks in the same positions, the `pillars` block has the same number of items, and every text field of both blocks was offered to the translator and written back translated

#### Scenario: Emphasis follows meaning
- **WHEN** a Polish sentence emphasizes a word and its English rendering places that word differently in the sentence
- **THEN** the English emphasis is on the corresponding English word, not on the same position in the string

#### Scenario: Headings keep their level
- **WHEN** a translated post is rendered
- **THEN** its heading levels match the Polish original's, so the table of contents and the sticky rail behave identically in both locales

#### Scenario: Structural mismatch blocks the write
- **WHEN** a translation's block count, block types, link set, media set, or Lexical block shape does not match the Polish original
- **THEN** it is reported and not written to the database

#### Scenario: Ambiguity is reported, not guessed
- **WHEN** an inline emphasis run cannot be mapped onto the English sentence without changing meaning
- **THEN** the post is reported for a human decision rather than written with a guessed mapping
