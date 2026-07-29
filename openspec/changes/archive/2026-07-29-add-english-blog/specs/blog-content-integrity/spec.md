## ADDED Requirements

### Requirement: A translation preserves the original's structure exactly

An English post body SHALL be the Polish body with its prose replaced and everything else carried through unchanged. Specifically, the English body SHALL have the same block count, the same block types, and the same block order as the Polish body; every `upload` node SHALL reference the same media document in the same position; every `link` node SHALL carry the same target — including the document relationship of an internal link — in the same position; every heading SHALL keep its `tag`; and element-level alignment formats SHALL be carried through.

Inline emphasis SHALL be preserved as emphasis of the corresponding English words, not of the corresponding character positions. Where an English sentence cannot carry the Polish emphasis without changing its meaning, the post SHALL be reported for human resolution rather than resolved by guessing.

Structure that cannot be verified as intact SHALL NOT be written to the database.

#### Scenario: Images survive translation
- **WHEN** a post containing embedded images is translated
- **THEN** the English body references exactly the same media documents, the same number of times, in the same positions

#### Scenario: Links survive translation
- **WHEN** a post containing internal and external links is translated
- **THEN** every link in the English body carries the same target as its Polish counterpart, and no link is added or dropped

#### Scenario: Emphasis follows meaning
- **WHEN** a Polish sentence emphasizes a word and its English rendering places that word differently in the sentence
- **THEN** the English emphasis is on the corresponding English word, not on the same position in the string

#### Scenario: Headings keep their level
- **WHEN** a translated post is rendered
- **THEN** its heading levels match the Polish original's, so the table of contents and the sticky rail behave identically in both locales

#### Scenario: Structural mismatch blocks the write
- **WHEN** a translation's block count, block types, link set, or media set does not match the Polish original
- **THEN** it is reported and not written to the database

#### Scenario: Ambiguity is reported, not guessed
- **WHEN** an inline emphasis run cannot be mapped onto the English sentence without changing meaning
- **THEN** the post is reported for a human decision rather than written with a guessed mapping

### Requirement: A translation is reviewed independently before it is written

Every English post SHALL pass two checks before reaching the database: a mechanical structural check, and a review by a reviewer that did not produce the translation. The reviewer SHALL see the Polish source and the English result and SHALL assess fidelity of meaning, fluency as English prose, register against the site's English voice, and preservation of brand and platform terminology.

A translation that reads fluently but changes, adds, or softens the original's meaning SHALL be rejected. A translation that is faithful but whose subject matter is specific to the Polish market SHALL be flagged for a content decision rather than rejected.

#### Scenario: Independent review
- **WHEN** an English post is produced
- **THEN** it is reviewed against its Polish source by a reviewer that did not produce it, and the verdict is recorded

#### Scenario: Fluent mistranslation is rejected
- **WHEN** a translation reads naturally but omits, adds, or softens a claim present in the Polish original
- **THEN** it is rejected and revised rather than accepted on fluency

#### Scenario: Locally scoped content is flagged, not dropped
- **WHEN** a faithful translation covers a topic specific to the Polish market
- **THEN** it is flagged in the status report for a content decision, and the flag does not block the batch

#### Scenario: Repeated failure escalates
- **WHEN** a post fails review twice
- **THEN** it is reported for human resolution rather than retried indefinitely

## MODIFIED Requirements

### Requirement: Post bodies carry no presentational debris

A post body SHALL NOT carry formatting that exists only to simulate layout. Specifically: no node SHALL carry a `justify` alignment format; no paragraph SHALL exist whose entire content is line breaks, non-breaking spaces, or empty inline wrappers; and a non-breaking space SHALL NOT be used where an ordinary word space is meant, nor to pad — as an indent, as a trailing gap, or alongside an ordinary space. Unlike an ordinary space, a non-breaking space does not collapse at render, so padding with one is visible.

A non-breaking space SHALL be preserved where it is doing typographic work **in the locale it belongs to**: after a Polish one- or two-letter word in Polish content, and between the digit groups of a number in either locale. English content SHALL NOT inherit non-breaking spaces at the positions of the Polish original's one- and two-letter words — English has no such orphan-word convention, and a mechanically inherited non-breaking space there is padding, not typography.

Deliberate `center` alignment SHALL be preserved where it applies to content — it is authored intent, not debris. A `center` format on an otherwise empty paragraph centres nothing and is a spacer.

#### Scenario: Justified text

- **WHEN** the formatting verifier runs against every post
- **THEN** it reports zero nodes carrying a `justify` alignment format

#### Scenario: Centred content survives

- **WHEN** a post body contains a deliberately centred node before the repair
- **THEN** that node is still centred afterwards

#### Scenario: Spacer paragraph

- **WHEN** a post body contains a paragraph holding only a line break or a non-breaking space
- **THEN** that paragraph is absent from the published body, and the surrounding blocks are separated by the template's own spacing

#### Scenario: Non-breaking space as a word space

- **WHEN** a non-breaking space separates two ordinary words in running text or in a heading
- **THEN** it is an ordinary space in the published body, and the text wraps normally

#### Scenario: Non-breaking spaces used as padding

- **WHEN** a block's text is indented with a run of non-breaking spaces, ends in one, or holds one alongside an ordinary space
- **THEN** the published body carries no such run, and the words on either side stay separated

#### Scenario: Non-breaking space doing typographic work

- **WHEN** a non-breaking space follows a Polish one- or two-letter word in Polish content, or sits between the digit groups of a number in either locale
- **THEN** it survives the repair unchanged

#### Scenario: English does not inherit the Polish orphan rule

- **WHEN** an English body is checked at the positions where its Polish original carries a post-one-or-two-letter-word non-breaking space
- **THEN** those positions carry ordinary spaces in the English body

### Requirement: Formatting is machine-verifiable

A verifier script SHALL read post content from Payload directly — not from rendered HTML — and report, per defect class and per post, every violation of the requirements above. It SHALL cover drafts as well as published posts, **and SHALL cover every locale**, reporting the locale alongside the post. It SHALL be re-runnable at any time as a regression check.

Reading the CMS rather than the rendered page is what lets the verifier see draft content and report against the source of truth rather than one render of it. Reading every locale rather than the default one is what stops translated content from satisfying the requirement vacuously.

#### Scenario: Verifier reports a clean blog

- **WHEN** every repair in this change has been applied and the verifier runs
- **THEN** it reports zero justified nodes, zero spacer paragraphs, zero word-space non-breaking spaces, zero excerpt-duplicating headings, and no post lacking an `h2`

#### Scenario: Verifier sees unpublished content

- **WHEN** a draft post carries a defect
- **THEN** the verifier reports it, naming the post

#### Scenario: Verifier sees every locale

- **WHEN** an English post body carries a defect that its Polish counterpart does not
- **THEN** the verifier reports it, naming the post and the locale, rather than passing because the Polish body is clean

#### Scenario: Regression is caught

- **WHEN** a post is edited to reintroduce a defect and the verifier runs
- **THEN** it reports that post and that defect class
