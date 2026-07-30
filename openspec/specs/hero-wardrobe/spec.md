# hero-wardrobe

## Purpose

Define the homepage hero's static-pose outfit stack: five transparent, same-pose stills index-locked to the headline rotator, the staggered choreography that transitions between them, the mobile framing that keeps the whole wardrobe visible, and the loading and reduced-motion characteristics the choreography must not disturb.
## Requirements
### Requirement: Static-pose outfit stack

The homepage hero SHALL render the llama as a stack of transparent, same-pose stills — one per headline rotator word — composited directly onto the hero's plum ground with no baked background. The llama SHALL NOT change pose, position or scale between looks; only the wardrobe and the head accessory differ.

At rest the active look SHALL be drawn as a single un-banded layer. The band decomposition SHALL exist only for the duration of a transition.

#### Scenario: Only the wardrobe changes

- **WHEN** the active look advances
- **THEN** the llama's head, ears and body remain in the same place at the same scale, and only the outfit and any head accessory differ

#### Scenario: Composited onto the section ground

- **WHEN** the hero renders
- **THEN** the stills composite seamlessly against the hero's plum with no visible edge or rectangle, on both breakpoints

#### Scenario: No band structure at rest

- **WHEN** the hero is settled between transitions
- **THEN** the llama is drawn as one continuous surface with no horizontal division visible anywhere in it

### Requirement: Wardrobe index is locked to the headline rotator

The active look SHALL be selected by the same rotator index that drives the headline's first-line word. The coupling SHALL be structural — one index feeding both — so the word and the outfit cannot drift apart under any timing, throttling or re-render.

#### Scenario: Word and outfit always agree

- **WHEN** the rotator index changes
- **THEN** the headline word and the llama's outfit both reflect the new index within the same render, with no intermediate frame in which they disagree

### Requirement: Choreographed wardrobe transition

The transition between looks SHALL be a horizontal slice tear, staggered behind the headline word rather than fired alongside it, so the word leads and the wardrobe answers. The llama SHALL be divided into seven horizontal bands which displace horizontally and hand off to the incoming look over 270 ms, in three discrete steps 90 ms apart, beginning 270 ms after the word. The headline word SHALL continue to slide over 1950 ms. The rotator interval SHALL remain 2600 ms.

The tear SHALL be applied identically on both breakpoints. The displacement table SHALL be fixed and identical for every transition, and SHALL NOT be randomized — the transition must be deterministic so that server and client render alike.

#### Scenario: The word leads the wardrobe

- **WHEN** the rotator advances
- **THEN** the headline word begins moving immediately and the tear begins 270 ms later, so the two are perceived as one action rather than two

#### Scenario: The wardrobe changes band by band

- **WHEN** the tear is mid-flight
- **THEN** some bands already show the incoming look while others still show the outgoing one, so the change reads as a costume being rewritten in strips rather than as a rendering fault

#### Scenario: Cadence is unchanged

- **WHEN** the hero is on screen and the visitor does not interact
- **THEN** the look advances every 2600 ms, exactly as before this change

#### Scenario: Deterministic across renders

- **WHEN** the same transition plays twice
- **THEN** the bands displace by the same amounts in the same order both times

### Requirement: Asymmetric easing

The headline word SHALL use `--ease-out-expo`, drawn from the project's easing tokens. Symmetric in-out curves SHALL NOT be used for it.

The wardrobe tear SHALL NOT be eased. It is a stepped, discrete effect and SHALL advance in hard steps rather than interpolating between them.

#### Scenario: The word settles rather than coasting

- **WHEN** the headline word slides
- **THEN** it leaves quickly and arrives slowly, with no symmetric acceleration/deceleration profile

#### Scenario: The tear steps rather than eases

- **WHEN** the tear plays
- **THEN** each displacement step lands discretely, with no interpolated movement between steps

### Requirement: Compositor-only motion

The wardrobe transition SHALL animate only `opacity` and `transform`. It SHALL NOT animate `mask-image`, `clip-path`, `filter` or `backdrop-filter`, and SHALL NOT use the View Transitions API or a scroll-driven timeline. Behaviour SHALL be identical on Chrome/Android, Safari on macOS, and Safari on iOS.

A **static** `clip-path` is permitted and is the basis of the band decomposition: it is baked into the layer's texture at rasterization and costs nothing per frame. The prohibition is on animating it, not on using it. `clip-path` SHALL be recomputed only when the media box resizes, never per frame.

A **static** `mask-image` is permitted on the same rationale and is the basis of the ghost inks: a mask whose value never animates is baked into the layer's texture at rasterization. A ghost's mask SHALL be assigned when a tear fires and SHALL change only when the look it mirrors changes, never per frame or per step.

The transition SHALL be expressed as a single class toggle driving CSS keyframes. It SHALL NOT be driven by a chain of JavaScript timers writing inline styles per step.

`will-change` SHALL NOT be applied to the bands, their strip images, or their ghost layers, to avoid promoting the band stack's layers on memory-constrained devices.

#### Scenario: No per-frame rasterization

- **WHEN** the wardrobe transitions on any supported platform
- **THEN** no property that forces the layer to re-rasterize each frame is animated

#### Scenario: iOS Safari parity

- **WHEN** the hero is viewed in Safari on iOS
- **THEN** the transition renders and times identically to Chrome on Android, with no dropped frames attributable to the transition

#### Scenario: The main thread is not used per step

- **WHEN** a transition plays
- **THEN** the main thread performs one style change to start it and no further per-step work

### Requirement: Loading characteristics are unchanged by choreography

The transition SHALL NOT alter how the hero loads. The first look SHALL remain the prioritized, preloaded LCP candidate; the remaining looks SHALL load eagerly at normal priority; and no additional network request SHALL be introduced by the transition. Ghost masks SHALL cite the URL the browser actually served for the look images, so no look is ever fetched or revalidated under a second cache key.

The layer visible at rest SHALL be a real `<img>` element carrying the existing preload and fetch priority, so that it remains discoverable by the HTML preload scanner. The tear bands' strip images and ghost inks MAY be CSS background and mask layers, and SHALL NOT be assigned an image or mask until the first transition fires, so that they issue no request and rasterize nothing during initial load.

The band decomposition introduces additional DOM nodes. This is accepted, and is bounded: no more than forty-seven drawing layers per breakpoint instance — the five resting stills plus fourteen strips of three paint layers each (two ghost inks beneath one strip image) — carried by no more than thirty-five elements plus twenty-eight pseudo-elements. The band elements themselves paint nothing; the two band-layer wrappers only hold opacity.

The five stills are not reducible to one. This requirement's own first clause obliges looks 2–5 to load eagerly at normal priority, and the eager `<img>` per look is the mechanism that does it.

#### Scenario: First paint is unaffected

- **WHEN** the hero renders for the first time
- **THEN** the first look paints in its settled state with no entrance transition, and the LCP candidate is unchanged from before this change

#### Scenario: The bands and ghosts cost nothing at load

- **WHEN** the page loads and no transition has yet fired
- **THEN** the tear bands hold no image, the ghost layers hold no mask or ink, and neither issues any network request

#### Scenario: No layout shift

- **WHEN** a transition plays
- **THEN** no element changes size or position in layout, and the transition contributes nothing to CLS

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

### Requirement: Per-band handoff

During a tear, exactly one layer SHALL own each band at any moment: as a band flips to the incoming look, the corresponding outgoing band SHALL be switched off rather than covered over.

The looks are transparent mattes, so an outgoing look left drawn beneath an incoming one shows through wherever the incoming silhouette is narrower. The handoff is what makes the tear correct on this asset set, not merely a stylistic choice.

#### Scenario: No ghost of the outgoing look

- **WHEN** a look with a wide silhouette hands off to a narrower one — look-05's bicorne to look-01 being the widest case
- **THEN** no part of the outgoing llama is visible at any point during or after the transition

#### Scenario: Settled state is the incoming look alone

- **WHEN** a transition completes
- **THEN** only the incoming look is drawn, with no residue of the outgoing one anywhere in the frame

### Requirement: Seamless band joins

Band boundaries SHALL be computed on integer pixel rows, with both sides of every boundary rounded to the same integer so that adjacent bands butt exactly.

Bands SHALL NOT be overlapped to hide antialiasing. The mattes are approximately 98.8% opaque through the body — alpha 250–254 rather than 255 — so overlapping composites two near-opaque pixels into a strip more opaque than its surroundings, replacing a pale seam with a dark ridge.

#### Scenario: No hairline at a band boundary

- **WHEN** the llama is drawn with all bands visible, showing one look at zero displacement
- **THEN** no band boundary is distinguishable from the surrounding image

#### Scenario: Holds across pixel densities

- **WHEN** the hero is viewed at device pixel ratios 1, 2 and 3
- **THEN** band boundaries remain invisible at every density

### Requirement: Chromatic misregistration fringe

During a tear, each band strip SHALL draw flat-color ghost silhouettes of its own look — one ink offset left, one ink offset right — beneath the strip's image, so the inks peek past the silhouette edge only and the llama's body is never tinted. The ghosts SHALL be produced by combining a solid ink color with the look's own alpha as a static mask; no image filter and no blend mode SHALL be used.

Ghosts SHALL be visible only while the bands are displaced — switching on at 270 ms and off at 540 ms after the rotator tick, in hard steps on the same stepped schedule as the tear — and SHALL ride each band's own shear displacement at a constant additional offset of ±G. At rest and between transitions no ghost SHALL be drawn anywhere, and the settled frame SHALL be pixel-identical to the pre-change hero.

The fringe SHALL use these values — a literal RGB split, deliberately off-palette, picked by the user in live review on the dev server against two brand-palette alternatives:

| Left ink | Right ink | G | Opacity |
| --- | --- | --- | --- |
| cyan `#21e6ff` | red `#ff2e5b` | 10 px | 0.50 |

#### Scenario: Fringe exists only inside the displacement window

- **WHEN** a tear plays
- **THEN** ghost inks are visible between 270 ms and 540 ms after the rotator tick and at no other time, switching on and off in hard steps with no interpolated fade

#### Scenario: Inks fringe the silhouette, never the body

- **WHEN** ghosts are visible on a strip
- **THEN** the ink shows only where the offset silhouette extends past the strip's drawn look, and the look's own pixels remain untinted

#### Scenario: Settled frame is unchanged

- **WHEN** the hero is settled between transitions, before the first transition, or after any transition completes
- **THEN** the rendered llama is pixel-identical to the hero before this change, with no ghost, ink, or residue anywhere

#### Scenario: Reduced motion shows no fringe

- **WHEN** the user agent reports `prefers-reduced-motion: reduce`
- **THEN** no tear plays and therefore no ghost ink is ever drawn

#### Scenario: Deterministic across renders

- **WHEN** the same transition plays twice
- **THEN** the ghosts appear with the same inks, offsets, and timing both times

