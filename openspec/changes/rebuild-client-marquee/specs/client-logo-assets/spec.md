## ADDED Requirements

### Requirement: Source selection precedence
Every belt logo SHALL be produced from an explicitly recorded source. Where the repository already holds a clean asset at `public/case-studies/<slug>/<slug>-logo.png`, that asset SHALL be preferred. The gDrive `TOP MARKI na strone główną` file SHALL be used only where the repository asset is absent, is a solid-background plate, or is lower resolution than the belt output geometry requires. The per-brand choice SHALL be recorded in the pipeline source so it is reviewable and repeatable.

#### Scenario: Repository asset is already clean
- **WHEN** the pipeline processes a brand whose `public/case-studies/<slug>/<slug>-logo.png` has real transparency and a tight crop
- **THEN** that file is used as the source and the gDrive copy is ignored

#### Scenario: Repository asset is a plate or too small
- **WHEN** the pipeline processes a brand whose repository asset is opaque or smaller than the required output geometry
- **THEN** the gDrive file is used as the source instead

#### Scenario: Brand has no case study
- **WHEN** the pipeline processes a brand with no published case study
- **THEN** the gDrive file is the only permitted source

#### Scenario: Known-bad source is rejected
- **WHEN** the pipeline resolves a source for Skrzat
- **THEN** the gDrive file `film skrzat.webp` is never used, because it is a film poster rather than the client's mark

### Requirement: Logos render without a background plate
Every emitted logo SHALL have a genuinely transparent background. Solid or near-solid background plates SHALL be removed by clearing only those pixels that both fall within tolerance of the border colour and are connected to the image border, so that enclosed counters and interior negative space inside glyphs survive. Edges SHALL be feathered rather than hard-keyed.

#### Scenario: Logo delivered on a white plate
- **WHEN** a source logo arrives as opaque artwork on a white rectangle
- **THEN** the emitted asset has a transparent background and shows no rectangle against the sand band

#### Scenario: Glyph with an enclosed counter
- **WHEN** a source logo contains a letter with an enclosed counter whose fill matches the background colour
- **THEN** that counter remains cleared while the surrounding glyph strokes are preserved

#### Scenario: Background is a gradient or watermark
- **WHEN** automated plate removal leaves visible residue because the background was not flat
- **THEN** that asset is corrected by hand before being emitted, rather than shipped with the residue

### Requirement: Logos are cropped to their primary mark
Where a brand's lockup carries a secondary line that is illegible at the belt's rendered logo height, the emitted asset SHALL be cropped to the primary mark and the secondary line dropped. This SHALL apply at minimum to KCPU, Medicover, Dolina Charlotty, Rabkoland, and the Volvo lockup.

#### Scenario: Lockup with an unreadable descender line
- **WHEN** the pipeline processes Medicover's lockup, whose "SPORT" line is unreadable at belt size
- **THEN** the emitted asset contains only the primary MEDICOVER mark

#### Scenario: Lockup whose secondary line stays legible
- **WHEN** a brand's secondary line still reads clearly at belt size
- **THEN** the lockup is emitted intact

### Requirement: Logos are normalized by optical mass
Emitted logos SHALL be scaled so their inked area is comparable across the belt, rather than scaled to fill a common bounding box. Scale SHALL be derived from each logo's alpha-weighted ink area relative to the roster median, and SHALL be clamped so that no logo exceeds the belt's rendered logo box and none is reduced below half its contain-fit size.

#### Scenario: Wide wordmark beside a compact mark
- **WHEN** a wide wordmark and a small square mark are adjacent in the belt
- **THEN** neither visually dominates, because both carry comparable ink area

#### Scenario: Dense logo would overflow
- **WHEN** normalizing a very dense logo would scale it beyond the logo box
- **THEN** its scale is clamped to the contain-fit size

### Requirement: Light ink is darkened to a contrast floor
Logos whose mean ink luminance is too light to read against the sand band under the belt's resting treatment SHALL be darkened toward a contrast floor before emission, preserving hue. Logos already dark enough SHALL be left untouched.

#### Scenario: White-on-colour mark loses its plate
- **WHEN** a mark drawn in white on a coloured plate has that plate removed, leaving white ink
- **THEN** the ink is darkened so the mark reads against the sand band at resting opacity

#### Scenario: Already-dark mark
- **WHEN** a logo's ink is already dark enough to read at resting opacity
- **THEN** its colours pass through unchanged

### Requirement: Emitted asset geometry and location
Emitted logos SHALL be written to `public/assets/clients/<brand>.png` using the brand's kebab-case key, at approximately twice the belt's rendered logo box so they stay crisp on high-density displays. Existing files in that directory that are still referenced by other sections SHALL NOT be deleted when their marquee entry is removed.

#### Scenario: Asset emitted for a new brand
- **WHEN** the pipeline emits the logo for a brand new to the belt
- **THEN** it is written to `public/assets/clients/<brand>.png` at roughly 2x the rendered logo box

#### Scenario: Retired marquee brand still used elsewhere
- **WHEN** a brand is removed from the marquee roster but its logo is still referenced by the testimonial slider
- **THEN** its existing logo file remains in place

### Requirement: Output is verified against the belt background
The pipeline SHALL produce a contact sheet rendering every emitted logo under the belt's actual resting treatment on the belt's actual background colour, so regressions in transparency, weight, or contrast are caught visually before the assets ship.

#### Scenario: Verifying a pipeline run
- **WHEN** the pipeline finishes emitting the roster
- **THEN** a contact sheet is produced showing each logo grayscaled at resting opacity on the sand band

#### Scenario: Asset fails review
- **WHEN** the contact sheet shows a logo with a visible plate, residue, or unreadable ink
- **THEN** that asset is corrected and the pipeline re-run before the change is considered complete
