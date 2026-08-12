# blog-cover-art — delta

## ADDED Requirements

### Requirement: Rendered cover crops honor the stored focal point

Every blog cover render surface SHALL apply the media row's stored focal point (`focalX`/`focalY`) as the CSS `object-position` of its `object-fit: cover` crop — the post header 4:3 box, the hub featured lead, hub grid cards, and the popular rail alike, in both locales. A media row without an explicit focal point SHALL render with the browser-default centered crop, identical to current behavior.

#### Scenario: Focal point steers the post header crop

- **WHEN** a post's cover has a focal point set away from center (e.g. `focalX: 25`)
- **THEN** the post header renders that cover with `object-position: 25% 50%` and the crop window follows the subject

#### Scenario: No focal point means no behavior change

- **WHEN** a post's cover has no explicit focal point (Payload default 50/50 or null)
- **THEN** the rendered crop is visually identical to the pre-change centered crop

#### Scenario: All surfaces follow the same point

- **WHEN** a cover with a non-center focal point renders on the post header, a hub card, and the featured lead
- **THEN** each surface's crop window is positioned by the same stored focal point

#### Scenario: Both locales

- **WHEN** the same post is viewed at its Polish and English URLs
- **THEN** the cover crop is positioned identically on both, since the cover and its focal point are shared across locales

## MODIFIED Requirements

### Requirement: Covers survive every live crop

Every library cover SHALL be produced from a 16:10 master at least 2048px wide, composed
so the focal subject remains intact when extended to 16/9 (hub lead) and when a
narrower-than-16:10 master is cropped to the 16/10 boxes, and MUST be verified on the
rendered surfaces — not the master file — before it is applied to any post.

The post header and the hub grid card SHALL both render their cover at aspect ratio
16/10 — the same ratio this requirement mandates of every master, so a library cover
fills the header with no crop at all, and one focal point governs both surfaces
identically.

For existing covers whose subject does not survive a rendered crop, setting the media
row's focal point SHALL be the first repair tool — recomposing or replacing the master is
required only when no focal point makes every surface acceptable. Each focal-point
adjustment SHALL be recorded in the image audit artifact.

#### Scenario: Post header crop keeps the subject

- **WHEN** a library cover renders in the post page header column at aspect ratio 16/10
  with `object-fit: cover`
- **THEN** the focal subject of the artwork is visible and uncut in a way that changes
  its meaning, with no critical element lost to the crop

#### Scenario: A master at the library ratio is not cropped at all

- **WHEN** a cover produced from a 16:10 master renders in the post header or a hub card
- **THEN** the box and the master share an aspect ratio, so the whole artwork is shown
  and the focal point has no effect on those two surfaces

#### Scenario: Card and lead crops keep the subject

- **WHEN** the same cover renders as a 16/10 grid card and, if the post is the hub lead,
  at 16/9
- **THEN** the artwork composes acceptably at each ratio without the subject touching or
  crossing the frame edges

#### Scenario: A miscropped cover is repaired by focal point

- **WHEN** a rendered surface cuts a cover's subject and an editor sets the media row's
  focal point onto the subject
- **THEN** the rendered surfaces re-crop toward the subject with no re-upload, and the
  adjustment is logged in the image audit artifact
