# case-studies — delta

## ADDED Requirements

### Requirement: An upscaled cover's text is verified against its source
A cover produced by a generative upscaler SHALL have every legible word in the image compared against the original file at 1:1 before it is used, because such models regenerate small lettering into plausible nonsense rather than sharpening it, and the output looks confident and sharp exactly where it is wrong.

Where the regenerated text is a client's own brand mark and a clean asset exists in `public/case-studies/<slug>/`, that asset SHALL be composited back over the lockup rather than the whole upscale being discarded. Where the regenerated text is product copy, a claim, or anything a reader would take as fact, the upscale SHALL be rejected outright — a soft cover is a cosmetic problem, a fabricated one is a false statement about a client's product.

An upscaled cover SHALL be recorded as such wherever the study's imagery provenance is tracked, so a later reader can tell a photograph from a reconstruction.

#### Scenario: Fabricated product copy rejects the upscale
- **WHEN** an upscaled cover's packaging copy differs from the source — for example a "30-Day Power Supply" claim returning as "20-Dey Porrar Sapply"
- **THEN** the upscale is not used, and the study keeps its existing cover until a real asset is available

#### Scenario: A garbled logo is repaired, not accepted
- **WHEN** an upscale regenerates a client's logo tagline into nonsense and a clean logo asset exists in the repository
- **THEN** the clean asset is composited back over the lockup and the repaired file is the one uploaded

#### Scenario: A frame with no text passes without repair
- **WHEN** an upscaled cover contains no legible lettering at all
- **THEN** the text check has nothing to compare and the upscale is used as-is

#### Scenario: Provenance is recorded
- **WHEN** an upscaled cover is applied to a published study
- **THEN** the imagery record notes that the file is a reconstruction and what was repaired
