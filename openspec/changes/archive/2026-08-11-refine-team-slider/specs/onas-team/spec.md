## MODIFIED Requirements

### Requirement: Every member has a transparent, crop-matched portrait cutout

All members SHALL have a transparent-background PNG cutout under `/public/o-nas/slider/`, consistent in framing (head+torso crop, orientation), comparable in file weight (~300 KB target, optimized), and obeying the framing-integrity rules: the subject bleeds off the frame's bottom edge; the frame's side edges may only be touched below elbow height (hip/torso rows); and no limb may exit a side edge and terminate before the bottom of the frame. The same cutouts fill the homepage grid's full-bleed portrait tiles, so a framing defect is visible on both surfaces.

#### Scenario: Cutouts exist and are transparent PNGs

- **WHEN** the slider or the homepage grid references a member's cutout
- **THEN** the file exists under `/public/o-nas/slider/`, is a PNG with an alpha channel, and its background is removed

#### Scenario: Framing is consistent across the roster

- **WHEN** all cutouts are viewed together
- **THEN** crop, scale, and orientation read as one consistent set, with no member visibly mis-scaled or differently framed

#### Scenario: No member is excluded for missing artwork

- **WHEN** the slider renders
- **THEN** every member is present — no member is commented out or skipped pending a usable photo

#### Scenario: Subject is grounded on the bottom edge

- **WHEN** a cutout's bottom pixel row is inspected
- **THEN** it carries subject alpha — the figure bleeds off the frame rather than floating above it

#### Scenario: No high side cuts

- **WHEN** a cutout's left and right edge columns are inspected
- **THEN** any subject alpha on them sits below elbow height, reading as a deliberate hip/torso bleed rather than a cut arm or shoulder

#### Scenario: No mid-frame amputations

- **WHEN** subject alpha touches a side edge
- **THEN** that contact run extends to the frame's bottom edge — a limb never exits the side and ends mid-frame

## ADDED Requirements

### Requirement: The peer wash is atomic with the peer photo

The plum duotone wash on the slider's background peers SHALL be derived from the same loaded resource as the peer photo itself, so that a peer can never paint unwashed and acquire the wash later. This holds at every cache temperature, including the first cold-cache paint after a homepage `?lama=` deep link.

#### Scenario: Cold-cache deep link paints washed peers

- **WHEN** a visitor with an empty cache clicks a homepage team-grid member and lands on `/o-nas?lama=<slug>#zespol`
- **THEN** the two neighbour figures are plum-washed from their first painted frame, with no full-colour flash

#### Scenario: Stepping fetches no wash-only resources

- **WHEN** the visitor steps the slider through the full roster with the network log open
- **THEN** no request is issued whose only purpose is the wash (e.g. a raw cutout fetched as a mask) — the wash reuses the photo's own bytes
