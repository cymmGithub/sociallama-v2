## ADDED Requirements

### Requirement: The mobile homepage grid presents as a horizontal snap rail

On mobile viewports the homepage `why-that-works` team grid SHALL render as a single-row, horizontally swipeable scroll-snap rail instead of the two-column vertical grid — at 15 members the stacked grid ran roughly eight rows mid-page. All 16 cells — the 15 member tiles in the client-curated order followed by the CTA tile — SHALL remain present and reachable by swiping; membership, order, captions, and per-member deep links are unchanged by the presentation.

Tile width SHALL stay close to the previous two-column width (~46vw) so the existing image size buckets keep fetching the same variant, and SHALL leave a partial next tile visible at the viewport edge as the swipe affordance. After a swipe settles, tiles SHALL align to the snap grid. The rail SHALL NOT capture vertical gestures — a mostly-vertical drag over it scrolls the page — and SHALL NOT chain into browser navigation gestures at its ends. Desktop SHALL keep the existing four-column grid; the rail is a mobile-only, CSS-only presentation with no new JS behavior.

#### Scenario: Mobile rail replaces the long grid

- **WHEN** the homepage renders at a mobile viewport
- **THEN** the team section shows a single row of tiles roughly one tile-height tall, with a partial next tile peeking at the viewport edge

#### Scenario: Every cell is reachable by swiping

- **WHEN** the visitor swipes the rail to its end
- **THEN** all 15 members have passed in the curated order, with the CTA tile as the final cell

#### Scenario: Deep links survive the presentation change

- **WHEN** a member tile in the rail is tapped
- **THEN** it navigates to that member's `?lama=<slug>#zespol` target exactly as the grid tile did

#### Scenario: Vertical scrolling is not hijacked

- **WHEN** a mostly-vertical drag starts over the rail
- **THEN** the page scrolls vertically and the rail does not consume the gesture

#### Scenario: Desktop keeps the grid

- **WHEN** the homepage renders at a desktop viewport
- **THEN** the team section is the existing four-column grid with no horizontal scrolling

#### Scenario: Both locales present the rail

- **WHEN** the EN homepage (`/en`) renders at a mobile viewport
- **THEN** the same rail presentation applies, since both locales render the shared component
