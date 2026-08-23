## ADDED Requirements

### Requirement: A feed wall shows only what its source studies show today
Every tile on an industry's creatives wall SHALL reference a file that is, at the time of the change, a current approach-pillar creative on a published case study in the PL locale, and the bytes served from `public/` SHALL be identical to the bytes the study serves from Payload media. A tile whose creative was detached from its study SHALL be removed from the wall in the same change that detached it, or at the next imagery audit. When a study's file is replaced in place, the wall's copy SHALL be replaced too and its URL bumped (`?v=N`) so the image optimizer cannot keep serving the previous variant. PL and EN walls SHALL reference the same files in the same order.

#### Scenario: Detached creative leaves the wall
- **WHEN** a case-study pillar creative that an industry wall references is detached from the study on prod PL
- **THEN** the wall no longer references that file in either locale

#### Scenario: Re-cut creative is re-copied
- **WHEN** a study's creative file is replaced in place on Payload media and the wall references the same filename
- **THEN** `public/` holds the new bytes and the wall `src` carries a bumped `?v=` parameter

#### Scenario: Wall assets are pinned by a test
- **WHEN** the content test suite runs
- **THEN** every wall `src` in both locales resolves to a file under `public/` whose pixel size equals the declared `width` and `height`, and the PL and EN walls list the same files in the same order

### Requirement: An editorial industry renders a standalone creatives wall
An industry content entry without a `caseStudy` block MAY carry an industry-level `creatives` list. When present and non-empty, the editorial layout SHALL render the same creatives wall as the proof layout (kicker, heading, "real creatives" badge, tiles) between the brief and the marquee, with no case card and no numbers band. When absent, the editorial layout SHALL render no wall and no placeholder. Carrying `creatives` SHALL NOT change the variant selection: the page stays editorial.

#### Scenario: Health renders a wall without a case card
- **WHEN** `/branze/health` renders with industry-level `creatives` and no `caseStudy`
- **THEN** it shows the creatives wall after the brief, then the marquee, manifesto and related-studies row, and no case-study card or numbers band

#### Scenario: Editorial industry without creatives is unchanged
- **WHEN** `/branze/finanse` renders with no `creatives`
- **THEN** the page shows no wall section and no empty placeholder

### Requirement: A wall mixes studies only where the page copy is not study-specific
A creatives wall MAY reference files from more than one related case study only when the industry page's brief, numbers and case card do not present the page as one client's story. Each tile's alt text SHALL name the brand shown in that creative. Industries whose copy is written around one study (automotive/Volvo, elektronika-i-agd/iRobot, beauty/Kontigo, hotele/Dolina Charlotty, nieruchomości/ED Invest, rozrywka/Skrzat, petcare/Aquael, horeca/Julius Meinl) SHALL draw the wall from that study only.

#### Scenario: Alkohole shows two clients
- **WHEN** `/branze/alkohole` renders
- **THEN** its wall carries Faktoria Win and Mazurska Manufaktura Alkoholi creatives, each alt naming its brand, while the case card still links the Faktoria Win study

#### Scenario: Automotive stays Volvo
- **WHEN** `/branze/automotive` renders
- **THEN** every wall tile is a current Volvo pillar creative

### Requirement: Wall tiles size to their shape and count
Portrait and square tiles SHALL render at the phone-sized width (14rem on desktop, two-up on mobile). A landscape tile, meaning one at least 1.5 times as wide as it is tall, SHALL span two tile widths plus the gap on desktop and full width on mobile, keeping its intrinsic aspect. The threshold is a ratio rather than `width > height` because several wall tiles are square within a pixel or two (`julius-meinl-eventy-1.png` is 1574×1572) and must keep the phone-sized slot. Each tile's `sizes` hint SHALL match the slot it renders in, so a wider slot is not served a narrower variant. When the wall holds exactly one tile, that tile SHALL render wider than the phone size (22rem on desktop) with no stagger offset.

#### Scenario: iRobot landscape tile spans two columns
- **WHEN** `/branze/elektronika-i-agd` renders `irobot-innowacja-1.png` (2056×1164) among three portrait tiles
- **THEN** the landscape tile is twice the portrait tile width on desktop and keeps its aspect without cropping

#### Scenario: A near-square tile keeps the phone slot
- **WHEN** `/branze/horeca` renders `julius-meinl-eventy-1.png` (1574×1572), which is two pixels wider than it is tall
- **THEN** it renders at the phone-sized width like every other tile on that wall

#### Scenario: Rozrywka single tile renders larger
- **WHEN** `/branze/rozrywka` renders with one wall tile
- **THEN** the tile is wider than a five-up tile and sits centred with no stagger offset
