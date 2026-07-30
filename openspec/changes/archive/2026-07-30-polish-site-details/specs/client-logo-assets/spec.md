## MODIFIED Requirements

### Requirement: Logos render without a background plate
Every emitted logo SHALL have a genuinely transparent background, and enclosed counters and interior negative space inside glyphs SHALL survive. Edges SHALL be feathered rather than hard-keyed.

Plate removal SHALL be chosen to fit the artwork, because one keying rule cannot serve both kinds of source:

- **Positive artwork** (coloured ink on a plate) SHALL have the plate removed by clearing only those pixels that both fall within tolerance of the border colour and are connected to the image border. Interior negative space in this artwork is genuine opaque ink, and a global colour key would punch holes in it.
- **Knockout artwork** (white or light ink reversed out of a solid brand-colour plate, which the pipeline then repaints in that plate colour) SHALL have plate-coloured pixels cleared **wherever they occur, connected to the border or not.** In a knockout mark the counters are filled with the plate colour and are enclosed by the glyph, so border-connected keying leaves them opaque; repainting the ink in the plate colour then merges glyph and counter into one silhouette. This SHALL apply at minimum to POLOmarket and Mercator Medical.

Ink that is not the plate colour SHALL survive a knockout key — POLOmarket's yellow sun sits on its red plate and is not part of the plate.

#### Scenario: Logo delivered on a white plate
- **WHEN** a source logo arrives as opaque artwork on a white rectangle
- **THEN** the emitted asset has a transparent background and shows no rectangle against the sand band

#### Scenario: Glyph with an enclosed counter
- **WHEN** a source logo contains a letter with an enclosed counter whose fill matches the background colour
- **THEN** that counter remains cleared while the surrounding glyph strokes are preserved

#### Scenario: Knockout wordmark with enclosed counters
- **WHEN** POLOmarket or Mercator Medical is emitted for the belt
- **THEN** the counters of `p`, `o`, `o` and of `R`, `A`, `O` read as holes rather than as solid brand colour, at belt size and under the belt's resting grayscale treatment

#### Scenario: Non-plate colour survives a knockout key
- **WHEN** POLOmarket is emitted
- **THEN** its yellow sun is still present and still yellow, because only plate-coloured pixels were cleared

#### Scenario: Positive artwork is not globally keyed
- **WHEN** a mark whose interior detail is opaque ink of roughly the background's colour is emitted
- **THEN** that interior detail survives, because global keying is applied only to marks declared as knockout artwork

#### Scenario: Background is a gradient or watermark
- **WHEN** automated plate removal leaves visible residue because the background was not flat
- **THEN** that asset is corrected by hand before being emitted, rather than shipped with the residue
