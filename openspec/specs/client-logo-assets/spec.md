# client-logo-assets Specification

## Purpose
The visual contract every homepage client-belt logo satisfies — transparency,
optical-mass normalisation, resting contrast, crop-to-primary-mark and output
geometry — and the repeatable pipeline that produces them from a per-brand
chosen source. Created by archiving change rebuild-client-marquee.
## Requirements
### Requirement: Source selection precedence
Every belt logo SHALL be produced from an explicitly recorded source. Where the repository already holds a clean asset at `public/case-studies/<slug>/<slug>-logo.png`, that asset SHALL be preferred. The gDrive `TOP MARKI na strone główną` file SHALL be used only where the repository asset is absent, is a solid-background plate, is lower resolution than the belt output geometry requires, or is a crop out of a larger layout that carries artwork belonging to neighbouring elements. The per-brand choice SHALL be recorded in the pipeline source so it is reviewable and repeatable.

#### Scenario: Repository asset is already clean
- **WHEN** the pipeline processes a brand whose `public/case-studies/<slug>/<slug>-logo.png` has real transparency and a tight crop
- **THEN** that file is used as the source and the gDrive copy is ignored

#### Scenario: Repository asset is a plate or too small
- **WHEN** the pipeline processes a brand whose repository asset is opaque or smaller than the required output geometry
- **THEN** the gDrive file is used as the source instead

#### Scenario: Repository asset carries a neighbour's artwork
- **WHEN** a repository asset is a crop out of a larger layout and includes part of an adjacent graphic
- **THEN** the gDrive file is used instead, because that artwork is real ink and de-matting cannot remove it

#### Scenario: Brand has no case study
- **WHEN** the pipeline processes a brand with no published case study
- **THEN** the gDrive file is the only permitted source

#### Scenario: Known-bad source is rejected
- **WHEN** the pipeline resolves a source for Skrzat
- **THEN** the gDrive file `film skrzat.webp` is never used, because it is a film poster rather than the client's mark

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

### Requirement: Logos are cropped to their primary mark
Where a brand's lockup carries a secondary line that is illegible at the belt's rendered logo height, the emitted asset SHALL be cropped to the primary mark and the secondary line dropped. Where a stacked lockup's remaining parts would leave the mark too small or too sparse to hold its slot, the crop SHALL keep only the part that carries the brand at belt size, dropping elements above it as well as below. Cuts SHALL be taken at a blank row band the artwork itself reports wherever one exists, so a cut cannot land mid-glyph. This SHALL apply at minimum to KCPU, Medicover, Dolina Charlotty, Rabkoland, Manufaktura Czekolady, and the Volvo lockup.

#### Scenario: Lockup with an unreadable descender line
- **WHEN** the pipeline processes Medicover's lockup, whose "SPORT" line is unreadable at belt size
- **THEN** the emitted asset contains only the primary MEDICOVER mark

#### Scenario: Lockup whose secondary line stays legible
- **WHEN** a brand's secondary line still reads clearly at belt size
- **THEN** the lockup is emitted intact

#### Scenario: Stacked lockup that reads as empty space
- **WHEN** a lockup's surviving parts are so sparse that the mark fills only part of its slot and reads as a gap between its neighbours
- **THEN** the crop keeps only the part that carries the brand, so it fills the slot at comparable weight

#### Scenario: Lockup with no blank row to cut at
- **WHEN** a mark's artwork inks every row, so no seam exists
- **THEN** the cut is set by hand and verified at belt size rather than derived

### Requirement: Logos are normalized by optical mass
Emitted logos SHALL be scaled so their inked area is comparable across the belt, rather than scaled to fill a common bounding box. Scale SHALL be derived from each logo's alpha-weighted ink area relative to the roster median, and SHALL be clamped so that no logo exceeds the belt's rendered logo box and none is reduced below half its contain-fit size.

#### Scenario: Wide wordmark beside a compact mark
- **WHEN** a wide wordmark and a small square mark are adjacent in the belt
- **THEN** neither visually dominates, because both carry comparable ink area

#### Scenario: Dense logo would overflow
- **WHEN** normalizing a very dense logo would scale it beyond the logo box
- **THEN** its scale is clamped to the contain-fit size

### Requirement: Light ink reaches a contrast floor without dulling its hover colour
Every belt logo SHALL read against the sand band under the belt's resting treatment. Because that treatment is grayscaled, resting legibility is a luminance problem, so the correction SHALL be applied by the belt's resting filter wherever that filter can reach — never in the asset, which would spend a hover cost on a resting problem, since the darkened ink is what hover reveals.

Ink too light for the resting filter to reach SHALL be corrected in the asset, and only such ink. Where that ink is a white knockout lifted off a solid coloured plate, the asset SHALL repaint it in the plate's colour rather than darkening it — the plate colour is the brand's own, so this reconstructs the mark the brand uses elsewhere instead of producing a grey one. Ink that must still be darkened SHALL be taken only as far as the resting state requires, preserving hue.

#### Scenario: White-on-colour mark loses its plate
- **WHEN** a mark drawn in white on a solid coloured plate has that plate removed, leaving white ink
- **THEN** the ink is repainted in the plate's colour, so the mark reads on the sand band and hovers to its real brand colour

#### Scenario: Knockout mark with a second colour
- **WHEN** a repainted knockout mark also carries artwork in another colour
- **THEN** only the near-white ink is repainted and the other colour is left alone

#### Scenario: Mid-tone mark
- **WHEN** a logo's ink is light enough to need correction but within the resting filter's reach
- **THEN** its asset is left untouched and hovering reveals its unmodified brand colour

#### Scenario: Already-dark mark
- **WHEN** a logo's ink is already dark enough to read at resting opacity
- **THEN** its colours pass through unchanged

### Requirement: Emitted asset geometry and location
Emitted logos SHALL be written to `public/assets/clients/<brand>.png` using the brand's kebab-case key, at approximately twice the belt's rendered logo box so they stay crisp on high-density displays. No emitted mark SHALL have ink on the canvas's outermost pixel rows or columns: the belt halves the canvas, so edge ink maps onto a half pixel and loses most of its weight, rendering as though the logo were clipped. Scale SHALL therefore be solved against an inset box rather than the full canvas. Existing files in that directory that are still referenced by other sections SHALL NOT be deleted when their marquee entry is removed.

#### Scenario: Asset emitted for a new brand
- **WHEN** the pipeline emits the logo for a brand new to the belt
- **THEN** it is written to `public/assets/clients/<brand>.png` at roughly 2x the rendered logo box, with a margin between its ink and every canvas edge

#### Scenario: Mark whose contain-fit is height-bound
- **WHEN** a mark is tall enough that fitting it to the canvas would put ink on the top and bottom rows
- **THEN** it is scaled to the inset box instead, so the belt renders its full height rather than shaving it

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

