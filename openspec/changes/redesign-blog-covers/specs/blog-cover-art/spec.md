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
each carrying that category's accent, plus one dedicated LAMÓWKA series cover. A post
SHALL be assigned a variant of its own category, except posts of the LAMÓWKA series,
which SHALL all use the series cover.

#### Scenario: Category post gets category art

- **WHEN** a non-series post in category `seo` is assigned a library cover
- **THEN** it receives one of the `seo` variants, and the variant chosen avoids using
  the same artwork as an adjacent post in the default blog hub ordering where the
  category's variant count allows it

#### Scenario: Series post gets the series cover

- **WHEN** a post whose slug identifies it as part of the LAMÓWKA series is assigned a
  library cover
- **THEN** it receives the dedicated series cover regardless of its category

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
