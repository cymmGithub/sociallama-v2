# testimonial-rail Specification

## Purpose
TBD - created by archiving change testimonial-pull-quote-rail. Update Purpose after archive.
## Requirements
### Requirement: Two-tier quote hierarchy
Each testimonial SHALL render as a short pull-phrase in display type (Exo 2, ~clamp(1.7rem, 3.4vw, 3rem)) above the full quote at reading size (Manrope, ~1rem, max-width ~58ch), followed by a byline (author name + company). The key words of the pull-phrase SHALL be highlighted in the contrast color (orange text with a translucent orange underline band). The full quote SHALL be the client's verbatim text from `lib/content/home.ts`.

#### Scenario: Pull-phrase carries the display type, not the full quote
- **WHEN** a testimonial is active
- **THEN** its pull-phrase renders in display type with the highlight, and the full quote renders below at reading size — the full quote never renders at display size

#### Scenario: Pull-phrase content is sourced, not hardcoded
- **WHEN** the section renders
- **THEN** pull-phrases (including which words are highlighted) come from `lib/content/home.ts`, not from component code

### Requirement: Client rail replaces dots and arrows
The section SHALL display the clients in a vertical rail that is the only slide navigation (no dots, no arrow buttons). The rail SHALL be a fixed-height, centered window over all six entries, positioned by each entry's wrap-around offset from the active testimonial:

- Offsets −1, 0, +1 (the middle band) render as full rows — author photo, white-knocked company logo, author name — with the active row (offset 0) visually distinguished (full opacity, orange edge bar, avatar ring) and the other two dimmed, exactly as the previous three-row rail.
- Offsets ±2 render whole but receded — scaled to ≈0.68, opacity ≈0.22, slightly blurred — communicating that more entries exist beyond the middle band. Receded rows SHALL remain interactive: activating one selects that testimonial and the rail recenters on it.
- The remaining entry (offset +3) SHALL be invisible and removed from the focus/accessibility order (e.g. `visibility: hidden`).

Rows SHALL glide between slots when the active testimonial changes; an entry cycling through the hidden slot SHALL NOT visibly travel across the rail (its repositioning happens while invisible). Rows SHALL be keyboard-accessible tab controls with `aria-selected` state, and changing slots SHALL never shift the rail's outer height or the sections around it.

#### Scenario: Window shows three full rows plus two receded hints
- **WHEN** the section is on screen on desktop
- **THEN** exactly three full rows are visible with the active one centered and treated as today, one receded row shows above and one below, and the sixth entry is not visible

#### Scenario: Receded row selects and recenters
- **WHEN** the user clicks or keyboard-activates a receded (±2) row
- **THEN** that testimonial's slide becomes active and the rail glides so the chosen row sits in the center with the active treatment

#### Scenario: Wrap-around without visible teleport
- **WHEN** autoplay advances past the last entry back to the first
- **THEN** rows settle into their new slots without any row visibly flying across the full height of the rail

#### Scenario: No layout shift from sliding
- **WHEN** the rail slides one row on an autoplay tick
- **THEN** the rail's outer height and the position of surrounding content do not change

### Requirement: Autoplay with visible progress
The slider SHALL auto-advance to the next testimonial every 7 seconds, cycling through all six, with a thin orange progress bar filling along the active rail row over the cycle duration. Each advance SHALL slide the rail one row so the newly active row is centered. Autoplay SHALL NOT pause on hover. Manual selection via the rail SHALL restart the cycle from the selected testimonial on hover-capable devices, and SHALL stop autoplay permanently on touch-only devices. When `prefers-reduced-motion` is set, autoplay SHALL be disabled entirely and slot changes SHALL apply instantly without gliding.

#### Scenario: Full cycle
- **WHEN** the section is idle for 42 seconds
- **THEN** every one of the six testimonials has been shown once, in order, each with its progress bar filling over its 7 s window and the rail recentering on each advance

#### Scenario: Touch interaction stops autoplay
- **WHEN** a user on a touch-only device selects a testimonial manually (rail tap or swipe)
- **THEN** autoplay stops for the rest of the page view

#### Scenario: Reduced motion
- **WHEN** the user has `prefers-reduced-motion: reduce`
- **THEN** the slider never advances on its own, no progress bar animates, and any manual selection repositions the rail instantly

### Requirement: Directional slide transitions
Slide changes SHALL animate directionally — the outgoing slide exits toward the left while the incoming slide enters from the right — using the layout-stable stacked-grid technique (all slides share one grid cell so the section height is reserved by the tallest slide and never shifts). Under `prefers-reduced-motion`, slides SHALL switch instantly.

#### Scenario: No layout shift on slide change
- **WHEN** the slider moves between the shortest and longest quote
- **THEN** the rail and any content below the section do not move

### Requirement: Responsive rail
At viewport widths ≤ 820 px the rail SHALL render as a horizontal strip above the quote stage showing three full chips (avatar + author name, active indicated by an orange top bar; company logos MAY be omitted), with the previous and next chips half-cropped and fading out at the strip's left and right edges to signal more entries. The strip SHALL slide one chip per advance so the active chip stays centered, using the same wrap-around slot model as the desktop rail. Horizontal swipe on the quote stage SHALL change slides on touch devices.

#### Scenario: Mobile layout with edge peeks
- **WHEN** the viewport is 390 px wide
- **THEN** three full chips render in one row with a half-cropped chip fading out at each edge, without horizontal page overflow

#### Scenario: Swipe changes slides
- **WHEN** a touch user swipes horizontally on the quote stage
- **THEN** the slider moves to the adjacent testimonial, the strip recenters on it, and autoplay stops (per the autoplay requirement)

### Requirement: Section chrome preserved
The section SHALL keep its existing chapter-3 integration: plum-deep theme ground, `useReveal` entrance, `data-blur-edge-gate` attribute, and an sr-only or eyebrow heading naming the section ("Opinie klientów").

#### Scenario: Blur gate still suppresses the viewport-bottom blur
- **WHEN** the section is on screen on desktop
- **THEN** the viewport-bottom progressive blur is hidden, keeping the byline and rail crisp

### Requirement: Six testimonials with gated placeholder content
The section SHALL render six testimonials sourced from `lib/content/home.ts`. Until the client delivers the three new entries' content, those entries SHALL ship as visibly generic placeholders — placeholder name, anonymized/blurred portrait, no company logo — each marked with a `TODO(content)`/`TODO(sign-off)` comment in the content file, in the same launch-blocker category as the existing lorem placeholders.

#### Scenario: Placeholders are generic, not fake-real
- **WHEN** a placeholder testimonial renders before real content arrives
- **THEN** it shows no real person's photo, no real company logo, and no fabricated verbatim quote attributed to a named client

#### Scenario: Content swap requires no component change
- **WHEN** the real content for a new testimonial is added to `lib/content/home.ts`
- **THEN** the section renders it without any component or style edits

