## ADDED Requirements

### Requirement: Resting-state text contrast
Homepage text that is meant to be readable without scroll interaction — section eyebrows, subheads, card meta/identity lines — SHALL meet WCAG AA contrast (≥4.5:1 small text, ≥3:1 large text) in its resting (pre-scroll) state, measured against the chapter ground behind it when the element is in view. Scroll-scrubbed ghost/progress text whose unlit form is intentionally decorative MAY rest below AA only when it conveys no information exclusively in the dim state. Two documented exceptions MAY stay below AA: the orange "…THAT WORKS"/"…IT WORKS" display headlines (brand rule, user decision 2026-07-14; adjacent Polish subheads carry the information) and the testimonial queue's dimmed upcoming cards (full content reaches AA contrast when the card becomes active).

#### Scenario: Static-read text at rest
- **WHEN** the homepage loads and no scrolling has occurred
- **THEN** eyebrows, subheads, and the sponsored-card identity line each meet their WCAG AA contrast threshold against their rendered background

#### Scenario: Ghost text remains scrubbed
- **WHEN** the user scrolls through a progress-text section
- **THEN** the dim-to-lit scrub effect still plays and the lit state meets AA contrast

### Requirement: Deterministic homepage a11y gate
The homepage Playwright smoke SHALL assert zero serious or critical axe violations and pass deterministically: the test settles the page into its final visual state before scanning (instant scroll through the document under reduced-motion emulation), paints each scroll chapter with its own theme ground so contrast is measured against the in-view background, and excludes only the documented decorative/brand-exception selectors (progress-text ghosts, orange display headlines, testimonial queue), each with the design rationale in the test.

#### Scenario: Gate passes on a clean homepage
- **WHEN** `bun run test:e2e` runs against the current homepage
- **THEN** the axe assertion reports zero serious/critical violations and the test passes repeatably

#### Scenario: Gate catches a real regression
- **WHEN** a change introduces a serious contrast violation in settled, non-excluded content
- **THEN** the a11y assertion fails
