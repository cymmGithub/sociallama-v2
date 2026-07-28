## ADDED Requirements

### Requirement: No heading duplicates the post's own excerpt

A post body SHALL NOT open with a heading whose text restates the post's `excerpt`, which the template already renders as the lead in the page header. Where such a heading exists, it SHALL be resolved by one of three treatments, chosen by how the heading's text relates to the excerpt:

- **Subsumed** — the heading's text is contained in the excerpt and adds nothing: the heading block SHALL be deleted.
- **Extended** — the heading carries content beyond the excerpt: the duplicated portion SHALL be dropped, the remaining text SHALL become a paragraph, and a heading SHALL be authored for the section it introduces.
- **Genuine but overlong** — the heading is a real section label written at paragraph length: it SHALL be shortened to a label.

Replacement copy SHALL be authored in Polish, reviewed, and approved before it is applied; no replacement headline is written directly to the database unreviewed.

Independently of excerpt duplication, no heading in a post body SHALL exceed 85 characters.

#### Scenario: Heading restates the excerpt verbatim

- **WHEN** a post's first heading text is contained within that post's excerpt
- **THEN** the published body contains no such heading, and the post's first body block is prose

#### Scenario: Heading extends past the excerpt

- **WHEN** a post's first heading duplicates the excerpt but continues past it
- **THEN** the continuation survives as a paragraph, the duplicated text appears exactly once on the page, and the section that followed carries a heading of its own

#### Scenario: No oversized headings remain

- **WHEN** the formatting verifier runs against every post
- **THEN** it reports zero headings longer than 85 characters

#### Scenario: Copy is reviewed before it ships

- **WHEN** replacement headings have been drafted but not yet approved
- **THEN** no post content has been written, and the drafts exist only in the review document

### Requirement: Post bodies use a real heading hierarchy

Every post body whose content divides into sections SHALL mark those sections with heading nodes, not with paragraphs whose entire text is bold. The hierarchy SHALL start at `h2` and SHALL NOT skip a level: an `h3` SHALL NOT appear before the body's first `h2`, and `h4` and deeper SHALL be used only for genuine sub-subsections — never as image captions or as a substitute for emphasis.

This is what makes the post page's table of contents work: `buildToc` tracks only `h2` and `h3`, and the rail renders only when at least three tracked headings exist.

#### Scenario: Bold paragraph used as a section label

- **WHEN** a post body contains a paragraph whose entire visible text is bold and reads as a section label
- **THEN** that node is a heading of the appropriate level in the published body

#### Scenario: Body opens below h2

- **WHEN** a post body's first heading is an `h3` or deeper
- **THEN** the hierarchy is re-levelled so the body's first heading is an `h2`

#### Scenario: Table of contents renders for a sectioned post

- **WHEN** a post has three or more sections
- **THEN** its page renders the table-of-contents rail, with one entry per section

#### Scenario: Deep levels are not decorative

- **WHEN** the formatting verifier runs against every post
- **THEN** it reports no `h4`–`h6` heading that is an image caption or a lone emphasis node

### Requirement: Post bodies carry no presentational debris

A post body SHALL NOT carry formatting that exists only to simulate layout. Specifically: no node SHALL carry a `justify` alignment format; no paragraph SHALL exist whose entire content is line breaks, non-breaking spaces, or empty inline wrappers; and a non-breaking space SHALL NOT be used where an ordinary word space is meant.

Deliberate `center` alignment SHALL be preserved — it is authored intent, not debris.

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

### Requirement: Formatting is machine-verifiable

A verifier script SHALL read post content from Payload directly — not from rendered HTML — and report, per defect class and per post, every violation of the requirements above. It SHALL cover drafts as well as published posts, and SHALL be re-runnable at any time as a regression check.

Reading the CMS rather than the rendered page is what lets the verifier see draft content and report against the source of truth rather than one render of it.

#### Scenario: Verifier reports a clean blog

- **WHEN** every repair in this change has been applied and the verifier runs
- **THEN** it reports zero justified nodes, zero spacer paragraphs, zero word-space non-breaking spaces, zero excerpt-duplicating headings, and no post lacking an `h2`

#### Scenario: Verifier sees unpublished content

- **WHEN** a draft post carries a defect
- **THEN** the verifier reports it, naming the post

#### Scenario: Regression is caught

- **WHEN** a post is edited to reintroduce a defect and the verifier runs
- **THEN** it reports that post and that defect class
