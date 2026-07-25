## ADDED Requirements

### Requirement: Static-pose outfit stack

The homepage hero SHALL render the llama as a stack of transparent, same-pose stills — one per headline rotator word — composited directly onto the hero's plum ground with no baked background. All stills SHALL render simultaneously with only the active one visible. The llama SHALL NOT change pose, position or scale between looks; only the wardrobe and the head accessory differ.

#### Scenario: Only the wardrobe changes

- **WHEN** the active look advances
- **THEN** the llama's head, ears and body remain in the same place at the same scale, and only the outfit and any head accessory differ

#### Scenario: Composited onto the section ground

- **WHEN** the hero renders
- **THEN** the stills composite seamlessly against the hero's plum with no visible edge or rectangle, on both breakpoints

### Requirement: Wardrobe index is locked to the headline rotator

The active look SHALL be selected by the same rotator index that drives the headline's first-line word. The coupling SHALL be structural — one index feeding both — so the word and the outfit cannot drift apart under any timing, throttling or re-render.

#### Scenario: Word and outfit always agree

- **WHEN** the rotator index changes
- **THEN** the headline word and the llama's outfit both reflect the new index within the same render, with no intermediate frame in which they disagree

### Requirement: Choreographed wardrobe transition

The transition between looks SHALL be staggered behind the headline word rather than fired alongside it, so the word leads and the wardrobe answers. The headline word SHALL slide over 1950 ms and the wardrobe SHALL cross-dissolve over 1260 ms beginning 270 ms after the word. The rotator interval SHALL remain 2600 ms.

#### Scenario: The word leads the outfit

- **WHEN** the rotator advances
- **THEN** the headline word begins moving immediately and the outfit's cross-dissolve begins 270 ms later, so the two are perceived as one action rather than two

#### Scenario: Cadence is unchanged

- **WHEN** the hero is on screen and the visitor does not interact
- **THEN** the look advances every 2600 ms, exactly as before this change

### Requirement: Asymmetric easing

Hero wardrobe and headline motion SHALL use out-easing curves drawn from the project's easing tokens — the wardrobe `--ease-out-quart`, the headline word `--ease-out-expo`. Symmetric in-out curves SHALL NOT be used for either.

#### Scenario: Motion settles rather than coasting

- **WHEN** a look transition plays
- **THEN** it leaves quickly and arrives slowly, with no symmetric acceleration/deceleration profile

### Requirement: Compositor-only motion

The wardrobe transition SHALL animate only `opacity` and `transform`. It SHALL NOT animate `mask-image`, `clip-path`, `filter` or `backdrop-filter`, and SHALL NOT use the View Transitions API or a scroll-driven timeline. Behaviour SHALL be identical on Chrome/Android, Safari on macOS, and Safari on iOS.

#### Scenario: No per-frame rasterization

- **WHEN** the wardrobe transitions on any supported platform
- **THEN** no property that forces the layer to re-rasterize each frame is animated

#### Scenario: iOS Safari parity

- **WHEN** the hero is viewed in Safari on iOS
- **THEN** the transition renders and times identically to Chrome on Android, with no dropped frames attributable to the transition

### Requirement: Loading characteristics are unchanged by choreography

The transition timing SHALL NOT alter how the hero loads. The first look SHALL remain the prioritized, preloaded LCP candidate; the remaining looks SHALL load eagerly at normal priority; and no additional network request, DOM node or composited layer SHALL be introduced by the choreography.

#### Scenario: First paint is unaffected

- **WHEN** the hero renders for the first time
- **THEN** the first look paints in its settled state with no entrance transition, and the LCP candidate is unchanged from before this change

### Requirement: The whole wardrobe is visible on phones

On the stacked mobile layout the llama SHALL be fitted entirely within its media box rather than cropped to the head, so the complete outfit is visible without scrolling. The llama SHALL sit flush on the client-logos band, and its transparent margins SHALL read as section plum.

#### Scenario: Small phone shows the full outfit

- **WHEN** the hero is viewed on a 360 px-wide viewport
- **THEN** the entire wardrobe is visible above the client-logos band, not only the collar

#### Scenario: Framing does not shift layout

- **WHEN** the mobile framing resolves
- **THEN** the media box occupies the same dimensions as before, contributing no layout shift

### Requirement: Reduced-motion holds the first look

With `prefers-reduced-motion: reduce`, the rotator SHALL NOT advance and the hero SHALL hold the first look and the first word indefinitely. No wardrobe transition SHALL run.

#### Scenario: Reduced motion is static

- **WHEN** the user agent reports `prefers-reduced-motion: reduce`
- **THEN** the hero shows the first look and the first word, neither changes over time, and no transition plays
