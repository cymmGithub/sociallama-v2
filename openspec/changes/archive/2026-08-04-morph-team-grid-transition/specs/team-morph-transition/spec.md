# team-morph-transition Delta

## ADDED Requirements

### Requirement: Clicked tile morphs into the featured slot

On browsers supporting same-document view transitions, navigating from a
homepage team tile to the team slider SHALL animate the clicked member's
cutout from its grid-tile position into the slider's featured slot as a
shared-element morph, while the rest of the viewport crossfades between the
two pages. The morph SHALL target the featured slot at its final on-screen
position — the page is already landed on `#zespol` in the new state the
browser captures. The same behavior SHALL apply on the EN surfaces
(`/en` → `/en/about-us`).

#### Scenario: Morph runs on a supported browser

- **WHEN** a visitor on a view-transition-capable browser clicks the
  homepage tile for a member
- **THEN** that member's cutout visibly animates from the tile into the
  featured slot of the team slider, which is scrolled into view, and the
  member featured at the end of the transition is the clicked member

#### Scenario: Morph never animates toward an off-screen target

- **WHEN** the transition's new state is captured
- **THEN** the page is already at its `#zespol` landing position, so the
  morph's destination is within the viewport — a transition whose
  destination is off-screen is a defect, not a degraded mode

### Requirement: Only the morphing pair carries transition names

Each homepage grid tile SHALL carry a view-transition name derived from the
member's cutout slug (`team-<slug>`), and the slider SHALL name only the
featured slot with the active member's slug. The peer (neighbour) slots
SHALL NOT carry transition names — a peer showing another member would
duplicate that member's tile name and silently disable the transition. The
fixed site header SHALL carry its own transition name so the page crossfade
does not double-draw it.

#### Scenario: Peer slots are anonymous

- **WHEN** the slider renders the featured member with two peers behind
- **THEN** only the featured slot participates in view transitions; the
  peers carry no transition name

#### Scenario: Header stays stable through the crossfade

- **WHEN** the page crossfade runs
- **THEN** the fixed header does not visibly double-expose or fade against
  itself

### Requirement: The morph replaces competing entrance animations

On a morphing arrival, the team slider's wipe-reveal entrance SHALL NOT
play — the morph is the entrance. On non-morphing paths (direct URL visits,
scroll-into-view on the page itself), the wipe entrance SHALL play exactly
as before, including its settled state.

#### Scenario: No double entrance on morph arrival

- **WHEN** a visitor arrives at the slider via a tile-click morph
- **THEN** the slider does not additionally play its wipe reveal over or
  after the morph

#### Scenario: Direct visits keep the wipe

- **WHEN** a visitor opens `/o-nas` directly and scrolls to the team section
- **THEN** the wipe reveal plays and settles exactly as it did before this
  change

### Requirement: Absence of the morph is the current experience, improved

Where the morph cannot run — unsupported browsers, `prefers-reduced-motion`,
or any state where the shared element cannot participate — the navigation
SHALL fall back to, at minimum, today's instant behavior with the corrected
arrival sequencing (right member, right scroll position at first paint). A
plain page crossfade without the element morph is an accepted degraded mode;
a broken or partial animation is not.

#### Scenario: Reduced motion gets no morph

- **WHEN** a visitor with `prefers-reduced-motion: reduce` clicks a team
  tile
- **THEN** the navigation completes with no morph and no crossfade, landing
  on the correct member at the correct scroll position

#### Scenario: Unsupported browser degrades to the instant swap

- **WHEN** a visitor on a browser without the View Transitions API clicks a
  team tile
- **THEN** the navigation behaves as an instant, correctly-sequenced arrival
  with no animation artifacts
