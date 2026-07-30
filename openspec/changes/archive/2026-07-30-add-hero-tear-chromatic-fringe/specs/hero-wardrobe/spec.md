## ADDED Requirements

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

## MODIFIED Requirements

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
