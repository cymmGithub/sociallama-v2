## ADDED Requirements

### Requirement: Desktop brief orbit mirrors the GOOD ONE wheel structure
The desktop brief on an industry page SHALL position its pillar chips as direct children of the orbit box, using the same registered `--spin` transform chain as the GOOD ONE wheel on `/o-nas`, so that the chips render on the ring in WebKit and Chromium alike.

#### Scenario: Chips sit on the ring
- **WHEN** `/branze/elektronika-i-agd` is rendered at a desktop viewport in Chromium or WebKit
- **THEN** each pillar chip's bounding-box centre is at distance `--item-r` (±10%) from the hub centre, and no two chips share a centre

#### Scenario: List semantics survive the flat structure
- **WHEN** the orbit box is inspected in the accessibility tree
- **THEN** the chips are exposed as list items of one list, and the hub kicker text remains readable

#### Scenario: Mobile fallback unchanged
- **WHEN** the page is rendered below the desktop breakpoint
- **THEN** the orbit is not in the accessibility tree and the flat kicker + chip list renders as before
