# blog-cover-art

Covers for blog posts served by the language-agnostic art library: what a cover may
contain, how the library is structured and assigned, and what every cover guarantees
under the site's crop ratios. Governs the 22 posts repointed by `redesign-blog-covers`
and any future post adopting the library; the remaining photo/campaign covers are
outside this capability until migrated.

## ADDED Requirements

### Requirement: Library covers are language-agnostic

A cover served from the art library SHALL contain no written language, with exactly one
exception: the wordmark "LAMÓWKA" MAY appear in the dedicated series cover, because it is
a brand name that localized titles keep verbatim. Headlines, UI captures, slogans and any
other text — Polish or English — MUST NOT appear in library artwork.

#### Scenario: The same cover serves both locales

- **WHEN** a post using a library cover is rendered on its Polish URL and its English URL
- **THEN** both locales serve the same media row, and no reader of either language is
  shown words they cannot read inside the cover image

#### Scenario: Series cover carries only the wordmark

- **WHEN** the LAMÓWKA series cover is inspected
- **THEN** the only text in the artwork is the wordmark "LAMÓWKA", and it appears
  identically on the series' Polish and English pages

### Requirement: Covers survive every live crop

Every library cover SHALL be produced from a 16:10 master at least 2048px wide, composed
so the focal subject remains intact when cropped to the central 4/3 (post header) and
when extended to 16/9 (hub lead), and MUST be verified on the rendered surfaces — not the
master file — before it is applied to any post.

#### Scenario: Post header crop keeps the subject

- **WHEN** a library cover renders in the post page header column at aspect ratio 4/3
  with `object-fit: cover`
- **THEN** the focal subject of the artwork is visible and uncut in a way that changes
  its meaning, with no critical element lost to the crop

#### Scenario: Card and lead crops keep the subject

- **WHEN** the same cover renders as a 16/10 grid card and, if the post is the hub lead,
  at 16/9
- **THEN** the artwork composes acceptably at each ratio without the subject touching or
  crossing the frame edges

### Requirement: The library is category-coded with a series exception

The library SHALL consist of a small fixed set of pieces sharing one style anchor
(playful llama artwork in the brand plum palette): multiple variants per blog category,
plus one dedicated LAMÓWKA series cover. Category SHALL be carried by which llama of the
mascot cast appears — one cast member per category — rather than by an accent colour, so
the coding survives at card size. A post SHALL be assigned a variant of its own category,
except posts of the LAMÓWKA series, which SHALL all use the series cover.

#### Scenario: Category post gets category art

- **WHEN** a non-series post in category `seo` is assigned a library cover
- **THEN** it receives one of the `seo` variants, and the variant chosen avoids using
  the same artwork as an adjacent post in the default blog hub ordering where the
  category's variant count allows it

#### Scenario: Series post gets the series cover

- **WHEN** a post whose slug identifies it as part of the LAMÓWKA series is assigned a
  library cover
- **THEN** it receives the dedicated series cover regardless of its category

### Requirement: A post may be given bespoke art instead of a library piece

Artwork drawn for a single post's own subject SHALL be permitted in place of a shared
library piece, and SHALL obey every rule that governs library art — no written language,
the same style anchor and mascot cast, the same crop guarantees, alt text in both locales,
and the same new-row-and-repoint application. Bespoke art SHALL be recorded in the
assignment map as a single-use piece, so the map remains the complete record of what
every post carries.

The library SHALL remain the default: a post with no bespoke piece assigned to it receives
a category variant by the rule above. Bespoke art is therefore a per-post decision, not a
property of a category, a series, or an author — a second post by the same author, or a
later post in the same category, receives library art unless someone commissions art for
it specifically.

#### Scenario: A post carries art drawn for its own subject

- **WHEN** a post is assigned a bespoke piece
- **THEN** that piece serves only that post, is listed in the assignment map like any
  other, and satisfies the language, crop and alt requirements identically

#### Scenario: A new post does not inherit bespoke art

- **WHEN** a post is published and no bespoke piece has been assigned to it
- **THEN** it receives a variant of its own category from the library, even where another
  post by the same author or in the same category carries bespoke art

#### Scenario: A library piece with no posts is not published

- **WHEN** a library piece exists but the assignment map gives it no posts
- **THEN** it remains part of the library for future use and no media row is created for
  it, so the media library gains no rows that nothing references

### Requirement: Applying a library cover never destroys prior artwork

A library cover SHALL be applied by uploading the artwork as a new media row and
repointing the post's `cover` relation. The file on a previously used media row MUST NOT
be replaced or deleted, and `seo.ogImage` MUST NOT be modified by cover assignment.

#### Scenario: Old cover remains recoverable

- **WHEN** a post's cover relation is repointed to a library piece
- **THEN** the previous media row still exists with its original file, and repointing the
  relation back fully restores the previous state

#### Scenario: Shared cover/in-body media is unaffected

- **WHEN** the repointed post's old cover media row is also referenced as an in-body
  image anywhere on the site
- **THEN** that in-body usage renders exactly as before the repoint

### Requirement: Library media rows carry alt text in both locales

Every library media row SHALL have descriptive alt text written in both Polish and
English at creation time, describing the artwork at the library level (one description
per piece, reused across the posts it serves), and the English alt bookkeeping file
(`content/media/alts.en.json`) SHALL be updated in the same step as any alt write.

#### Scenario: Both locales read a real description

- **WHEN** a library cover renders on a Polish page and on an English page (blog queries
  use `fallbackLocale: false`)
- **THEN** each locale receives its own non-empty alt text describing the artwork

#### Scenario: The alt gate stays consistent

- **WHEN** `payload:translate:alt` runs after library rows are created
- **THEN** it reports zero unexplained diffs for the library rows, because
  `alts.en.json` was updated together with the database writes

### Requirement: Cover changes are recorded in the image audit artifact

Every cover repoint SHALL be recorded in `content/media/image-audit.json` on the
existing entry for the superseded media id: the new media id, the supersession, and — for
entries previously blocked — clearance of the `blockedBy` marker. Entry keys MUST remain
stable so a later locale's incremental audit still recognizes reviewed ids.

#### Scenario: Blocked verdicts resolve

- **WHEN** the covers for the audit's blocked ids (28, 29, 31, 179, 180) are repointed
  to library art
- **THEN** their entries no longer carry `blockedBy: "cover-relation-not-localized"` and
  record which media id superseded them

#### Scenario: A future audit run preserves the resolution

- **WHEN** `payload:audit:blog-images` re-runs after the repoints
- **THEN** the supersession records survive the merge and no repointed entry reverts to
  an actionable verdict
