# testimonial-rail

## ADDED Requirements

### Requirement: Two-tier quote hierarchy
Each testimonial SHALL render as a short pull-phrase in display type (Exo 2, ~clamp(1.7rem, 3.4vw, 3rem)) above the full quote at reading size (Manrope, ~1rem, max-width ~58ch), followed by a byline (author name + company). The key words of the pull-phrase SHALL be highlighted in the contrast color (orange text with a translucent orange underline band). The full quote SHALL be the client's verbatim text from `lib/content/home.ts`.

#### Scenario: Pull-phrase carries the display type, not the full quote
- **WHEN** a testimonial is active
- **THEN** its pull-phrase renders in display type with the highlight, and the full quote renders below at reading size — the full quote never renders at display size

#### Scenario: Pull-phrase content is sourced, not hardcoded
- **WHEN** the section renders
- **THEN** pull-phrases (including which words are highlighted) come from `lib/content/home.ts`, not from component code

### Requirement: Client rail replaces dots and arrows
The section SHALL display all testimonials' clients simultaneously in a rail — each row showing the author photo, white-knocked company logo, and author name. The rail SHALL be the only slide navigation (no dots, no arrow buttons). The active row SHALL be visually distinguished (full opacity, orange edge bar, avatar ring); inactive rows SHALL be dimmed. Activating a row SHALL select that testimonial. Rows SHALL be keyboard-accessible tab controls with `aria-selected` state.

#### Scenario: All clients visible at once
- **WHEN** the section is on screen
- **THEN** iRobot, Uniphar, and STAG rows are all visible without any interaction

#### Scenario: Rail row selects its testimonial
- **WHEN** the user clicks or keyboard-activates an inactive rail row
- **THEN** that testimonial's slide becomes active and the row gains the active treatment

### Requirement: Autoplay with visible progress
The slider SHALL auto-advance to the next testimonial every 7 seconds, cycling through all of them, with a thin orange progress bar filling along the active rail row over the cycle duration. Hovering the section SHALL pause both the timer and the progress bar, resuming from the paused point on leave. Manual selection via the rail SHALL restart the cycle from the selected testimonial on hover-capable devices, and SHALL stop autoplay permanently on touch-only devices. When `prefers-reduced-motion` is set, autoplay SHALL be disabled entirely.

#### Scenario: Full cycle
- **WHEN** the section is idle for 21 seconds
- **THEN** every testimonial has been shown once, in order, each with its progress bar filling over its 7 s window

#### Scenario: Hover pauses
- **WHEN** the pointer enters the section mid-cycle and stays for any duration
- **THEN** the active slide and its partially-filled progress bar hold in place, and the cycle resumes from the same point when the pointer leaves

#### Scenario: Touch interaction stops autoplay
- **WHEN** a user on a touch-only device selects a testimonial manually (rail tap or swipe)
- **THEN** autoplay stops for the rest of the page view

#### Scenario: Reduced motion
- **WHEN** the user has `prefers-reduced-motion: reduce`
- **THEN** the slider never advances on its own and no progress bar animates

### Requirement: Directional slide transitions
Slide changes SHALL animate directionally — the outgoing slide exits toward the left while the incoming slide enters from the right — using the layout-stable stacked-grid technique (all slides share one grid cell so the section height is reserved by the tallest slide and never shifts). Under `prefers-reduced-motion`, slides SHALL switch instantly.

#### Scenario: No layout shift on slide change
- **WHEN** the slider moves between the shortest and longest quote
- **THEN** the rail and any content below the section do not move

### Requirement: Responsive rail
At viewport widths ≤ 820 px the rail SHALL render as a horizontal row of three chips (avatar + author name, active indicated by an orange top bar) above the quote stage; company logos MAY be omitted from the chips. Horizontal swipe on the quote stage SHALL change slides on touch devices.

#### Scenario: Mobile layout
- **WHEN** the viewport is 390 px wide
- **THEN** the three client chips render in one row above the pull-phrase, all fitting without horizontal page overflow

#### Scenario: Swipe changes slides
- **WHEN** a touch user swipes horizontally on the quote stage
- **THEN** the slider moves to the adjacent testimonial (and autoplay stops, per the autoplay requirement)

### Requirement: Section chrome preserved
The section SHALL keep its existing chapter-3 integration: plum-deep theme ground, `useReveal` entrance, `data-blur-edge-gate` attribute, and an sr-only or eyebrow heading naming the section ("Opinie klientów").

#### Scenario: Blur gate still suppresses the viewport-bottom blur
- **WHEN** the section is on screen on desktop
- **THEN** the viewport-bottom progressive blur is hidden, keeping the byline and rail crisp
