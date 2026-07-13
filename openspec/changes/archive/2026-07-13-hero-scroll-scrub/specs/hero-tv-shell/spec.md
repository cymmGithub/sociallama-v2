# hero-tv-shell

## ADDED Requirements

### Requirement: Retro TV frames the hero video
The hero video SHALL render inside a retro TV shell with a landscape ~4:3 screen and the classic retro identifiers: a rabbit-ear antenna on top, walnut cabinet, a screen-left / control-column-right layout (dials and a speaker grille), and a CRT glass curve. The cabinet floats without legs. The shell SHALL be a generated raster cutout with an alpha background (photoreal product-shot style, matching the llama's aesthetic), optimized for the web (alpha-capable format, sized for its rendered width) before ship.

#### Scenario: Reads as a TV
- **WHEN** the hero is viewed at desktop widths
- **THEN** the object framing the llama is recognizable as a retro television (not a generic monitor or phone), with antenna, cabinet, controls, and grille visible

#### Scenario: Complete object composition
- **WHEN** the hero renders at any desktop width
- **THEN** the TV sits fully inside the viewport with breathing room from the right edge — no part of the shell is clipped by the viewport

### Requirement: Video aligned to the measured screen rect
The video SHALL be absolutely positioned over the shell's screen region using coordinates measured from the asset's pixels, inset slightly so the video edges sit under the dark bezel rim, with a border-radius approximating the glass corner curve. When the shell asset changes, the screen rect SHALL be re-measured — the coordinates are asset-specific.

#### Scenario: No visible misalignment
- **WHEN** the hero renders at desktop widths from 1280px to 1680px
- **THEN** the video neither peeks past the glass curve at the corners nor leaves a gap along the glass edges beyond the natural dark rim

### Requirement: Screen overlays neutralize background drift
The screen SHALL layer glass effects above the video — diagonal glare, scanlines, and an edge vignette — clipped to the screen's radius, so background-color differences between the clip and the page are unreadable.

#### Scenario: Legitimized mismatch
- **WHEN** the clip's background tone differs visibly from the page's plum token
- **THEN** no seam or rectangle edge is perceivable — the difference reads as "what's on TV"

#### Scenario: Overlays don't block interaction
- **WHEN** the user interacts near the hero media
- **THEN** the overlay layers are `pointer-events: none` and purely decorative (`aria-hidden`)

### Requirement: Shell wraps every media state
The TV shell SHALL frame whatever the hero media shows — the scrubbed video, the poster before video data arrives, and the reduced-motion static poster — so no state renders a bare unframed clip.

#### Scenario: Reduced motion
- **WHEN** the user has `prefers-reduced-motion: reduce`
- **THEN** the static poster renders inside the TV screen with the same shell and overlays

### Requirement: Hero clip exempt from seamless-composite gate
The hero clip SHALL be exempt from the seamless-composite background verification (`verify-clip-bg.ts`); the convention continues to apply to clips composited directly onto themed sections elsewhere.

#### Scenario: Pipeline without the gate
- **WHEN** a new hero clip is prepared for commit
- **THEN** no background-color verification is required for it, and other sections' clips remain subject to the existing convention
