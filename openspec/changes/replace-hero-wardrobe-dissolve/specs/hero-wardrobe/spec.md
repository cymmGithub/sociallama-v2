## MODIFIED Requirements

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

The transition SHALL be expressed as a single class toggle driving CSS keyframes. It SHALL NOT be driven by a chain of JavaScript timers writing inline styles per step.

`will-change` SHALL NOT be applied to the bands, to avoid promoting fourteen layers per instance on memory-constrained devices.

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

The transition SHALL NOT alter how the hero loads. The first look SHALL remain the prioritized, preloaded LCP candidate; the remaining looks SHALL load eagerly at normal priority; and no additional network request SHALL be introduced by the transition.

The layer visible at rest SHALL be a real `<img>` element carrying the existing preload and fetch priority, so that it remains discoverable by the HTML preload scanner. The tear bands MAY be CSS background layers, and SHALL NOT be assigned an image until the first transition fires, so that they issue no request during initial load.

The band decomposition introduces additional DOM nodes. This is accepted, and is bounded: no more than fifteen layers per breakpoint instance.

#### Scenario: First paint is unaffected

- **WHEN** the hero renders for the first time
- **THEN** the first look paints in its settled state with no entrance transition, and the LCP candidate is unchanged from before this change

#### Scenario: The bands cost nothing at load

- **WHEN** the page loads and no transition has yet fired
- **THEN** the tear bands hold no image and issue no network request

#### Scenario: No layout shift

- **WHEN** a transition plays
- **THEN** no element changes size or position in layout, and the transition contributes nothing to CLS

## ADDED Requirements

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
