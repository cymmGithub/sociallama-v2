# site-footer — delta

## MODIFIED Requirements

### Requirement: Footer grid adapts across three bands

The footer SHALL stack as a single column below the desktop breakpoint, arrange its five cells in a two-column block between the desktop breakpoint and 1200px, and lay all five out in one row at 1200px and above.

The OFERTA column SHALL render its links in exactly two sub-columns at every width at or above the desktop breakpoint — in the two-column block band and throughout the five-track row band alike. Industry labels SHALL never be clipped; labels wider than their sub-column track wrap to a second line instead.

#### Scenario: Stacked on mobile

- **WHEN** the footer renders below 800px
- **THEN** the invite block and all four columns stack vertically in source order

#### Scenario: Two-column block on small desktops

- **WHEN** the footer renders between 800px and 1199px
- **THEN** the five cells arrange in two columns, and OFERTA renders its links in two sub-columns rather than one tall list

#### Scenario: Single row on wide screens

- **WHEN** the footer renders at 1200px or above
- **THEN** the invite block and four columns occupy one row, with OFERTA given the widest of the four link tracks

#### Scenario: OFERTA splits at laptop widths

- **WHEN** the footer renders at 1280px, 1440px or 1512px viewport width
- **THEN** OFERTA renders its links in two sub-columns

#### Scenario: OFERTA labels are never truncated

- **WHEN** the footer renders at any width at or above the desktop breakpoint
- **THEN** every industry label is fully visible — labels that do not fit their sub-column track on one line wrap instead of clipping

#### Scenario: No horizontal overflow

- **WHEN** the footer renders at 800px, 1024px, 1280px or 1600px in either locale
- **THEN** no column overflows its track and the page scrolls only vertically

## ADDED Requirements

### Requirement: The reveal never places footer content under the header

The desktop footer reveal SHALL only engage when the footer's content fits within the viewport height; otherwise the footer SHALL render in normal document flow. Footer content — the wordmark in particular — must never sit underneath the fixed header as a consequence of the sticky-bottom reveal.

#### Scenario: Default Safari window on a 1440×900 MacBook

- **WHEN** the footer renders at a 1440×760 or 1280×715 viewport and the page is scrolled to the bottom
- **THEN** the wordmark's top edge sits below the fixed header's bottom edge in both Chromium and WebKit

#### Scenario: Short windows fall back to normal flow

- **WHEN** the viewport is shorter than the height at which the footer's content fits
- **THEN** the footer participates in normal document flow (no sticky reveal) and is fully readable by scrolling

#### Scenario: Each band gets its own height threshold

- **WHEN** the footer renders between 800px and 1199px wide, where the five cells stack into a two-column block roughly twice the height of the five-track row
- **THEN** the reveal engages only in windows tall enough for that block, not at the threshold that suffices for the five-track row

#### Scenario: Tall viewports keep the reveal

- **WHEN** the footer renders at 1728×1085
- **THEN** the sticky reveal engages and the footer fills the viewport with no overlap
