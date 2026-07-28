# Design

## Decision: slice tear, chosen against three alternatives

Four treatments were built on the real `look-01…05.webp` mattes, on brand plum, at the real 2600 ms cadence with the real easing tokens, and reviewed side by side with slow-motion and single-step controls.

| | mechanism | animates | verdict |
| --- | --- | --- | --- |
| Baseline | opacity cross-dissolve, 1260 ms | `opacity` | the control |
| A — chromatic cut | matte as mask over flat cyan/magenta, offset | `opacity`, `transform` | rejected |
| **B — slice tear** | **7 bands, static clip, displaced horizontally** | **`transform`** | **chosen** |
| C — strobe cut | hard opacity cuts, one frame of bare plum | `opacity` | rejected |

**A was rejected on a property of the assets.** The looks are alpha mattes, so the offset-channel idiom that works for the TikTok glyph in `brand-icons.tsx:11` does not transfer: a solid masked silhouette overlaps the body and tints the whole llama rather than fringing its edges. True edge-only fringe needs mask-compositing to subtract the un-offset matte — real work, for a subtler result than B.

**C was rejected on accessibility headroom.** It reads well, but it spends its whole budget on flashes. WCAG 2.3.1 trips at three flashes in a second and the desktop llama is a large slice of the viewport, so C ships permanently one flash away from a violation with no room to tune.

**B won because it explains itself.** The strongest objection to any glitch here was that five identical poses give the effect nothing to justify itself with, so it would read as a rendering fault rather than a costume change. The band-by-band handoff answers that directly: the viewer sees the wardrobe rewritten in strips, top bands already on the new look while lower bands still show the old one. It is legible as a change of clothes in a way a whole-frame effect is not.

## Decision: per-band handoff, not layered overlay

This is the fix the previous change was waiting for. `retime-hero-wardrobe-choreography` recorded in its Non-goals that the band split "needs a fix for outgoing looks whose silhouette is up to 100 px wider at the shoulder than the incoming one."

Layering the incoming look over the outgoing one fails on alpha mattes: wherever the new silhouette is narrower, the old llama shows through the transparent pixels. look-05's bicorne behind look-01 is the worst case and is unmistakable.

The fix is that **exactly one layer owns each band at any moment**:

```js
over[i].style.opacity  = flipped ? '1' : '0'
under[i].style.opacity = flipped ? '0' : '1'
```

Nothing is ever drawn behind anything, so there is nothing to ghost through. This also makes the effect more authentic rather than less — a real datamosh tear is a handoff, not a dissolve.

## Decision: butt-joins on integer pixels, never a bleed overlap

Band boundaries expressed as percentages land on fractional pixels, so two antialiased clip edges meet at roughly 75% coverage and read as a pale hairline. The textbook remedy is to overlap the bands slightly. **Here that is actively wrong**, and measuring the assets shows why:

```
alpha distribution across all five mattes
              0      1-127   128-249   250-254     255
look-01:   52.1%     2.1%      1.5%     30.9%    13.4%
look-05:   42.9%     1.6%      0.8%     47.1%     7.7%
                                        ▲▲▲▲▲
                              the llama's BODY lives here
```

The body is **~98.8% opaque, not 100%** — a rembg/WebP artifact. Overlapping composites two near-opaque pixels (`1 - (1 - 0.988)² ≈ 0.9998`) into a strip measurably *more* opaque than its surroundings. A bleed cures a gap and creates a ridge; a prototype using one measured deviations of 3.3–3.7/255 at the boundaries, and the ridge was visible to the naked eye.

Rounding both sides of every boundary to the same integer gives a true butt-join — no gap to antialias, no overlap to double-composite:

```js
const top = Math.round((i * h) / BANDS)
const bot = Math.round(((i + 1) * h) / BANDS)   // === next band's top
```

Measured on a controlled join test (all bands visible, identical look, zero offset, so any boundary deviation is the join alone):

| device pixel ratio | max deviation at any boundary row |
| --- | --- |
| 1 | 1.58 / 255 |
| 2 | 0.76 / 255 |
| 3 | 0.36 / 255 |

All below the ~2–3/255 visibility floor for a one-pixel line, and improving with density — the signature of a rounding fix working rather than a coincidence.

## Decision: the bands retire at rest

Bands only need to exist for the 270 ms of the tear. The other ~90% of the cycle hands off to a single un-banded layer, so the state the visitor actually spends their time looking at has no band structure to seam in the first place. It also means any residual join artifact is only ever on screen while it is camouflaged by the tear.

## Core Web Vitals

**LCP — the one real regression risk, and the reason the resting layer stays an `<img>`.**

Today `look-01` is an `<img>` carrying `preload` and `fetchPriority="high"`, discovered by the HTML preload scanner during parsing. That is the earliest discovery a browser offers. A CSS `background-image` is discovered only after the stylesheet downloads, CSSOM builds and style resolves — materially later, and `<link rel=preload>` for a background is fragile.

So the split is deliberate: **the resting layer is an `<img>` and keeps today's preload and priority; only the fourteen tear bands use `background-image`.** The bands are `opacity: 0` and are never LCP candidates. Because they share the looks' URLs they hit the same cache entry and the same decoded bitmap, so the decode-sharing benefit survives intact. Band backgrounds are additionally not assigned until the first transition fires, so during initial load they issue no request at all and nothing competes with look-01.

**CLS — zero contribution.** Bands are `position: absolute; inset: 0` inside `.llamaBox`, so they never participate in layout. Both `transform` and `clip-path` are layout-neutral, and the media box is unchanged, so no new shift source is introduced.

**INP — protected by construction, and the reason for CSS keyframes.**

Today's dissolve is one class toggle; the browser then runs 1260 ms on the compositor with no further main-thread work. A JS-timer tear is three callbacks 90 ms apart, each writing inline styles across 28 elements — roughly 69 style-write bursts a minute, forever, on a page already running Lenis in rAF.

The prototype measured **0 long tasks** over 8 s and up to ~10 ms of scripting per transition (an upper bound: the figure covers four panels plus instrument chrome, so it substantially overstates one tear), with 5.6 ms of layout across 16 s. There is no cliff here — but there is no reason to spend it either.

Driving the tear from CSS keyframes returns it to a single class toggle. One shared `@keyframes` reads per-band `--dx-a/--dx-b/--dx-c` custom properties, stepped with `steps(1)`; the compositor runs the rest. This also matches the previous change's finding that GSAP was available at zero marginal cost and still was not needed.

## Platform compatibility

Held to the same bar as the previous change: identical behaviour on Chrome/Android, Safari/macOS and Safari/iOS.

- **`clip-path: inset()`** — Safari 9.1+, unprefixed since 13. A static clip is baked into the texture at rasterization; only an animated one re-rasterizes. This is the whole basis for relaxing the compositor rule from a property ban to an animation ban.
- **`ResizeObserver`** — Safari 13.1+. Used only to recompute integer band boundaries on resize, never per frame.
- **Custom properties in `@keyframes`** — safe here specifically because the tear *steps* rather than interpolates them. Interpolating an unregistered custom property does not work, and `@property` registration is comparatively new; `steps(1)` sidesteps the question entirely.
- **`will-change: transform` SHALL NOT be applied to the bands.** Fourteen promoted layers per instance, twenty-eight across both breakpoints, on an 820×1080 element at dpr 3, is a memory hazard on precisely the platform the previous change identified as weakest. If a specific device shows jank without it, add it for the tear's duration only and remove it on completion.

The claim that a static clip plus an animated transform stays on WebKit's fast path is **the one assertion in this change that cannot be verified without hardware.** It is a gating task, not an assumption. The choice to ship on both breakpoints compounds this: iOS gets the tear on phone and tablet alike.

## Decision: both breakpoints, one fixed tear table

**Both breakpoints** — one transition language in one component, at the cost of roughly 30 nodes where 5 `<img>` sit today. The alternative left mobile on the dissolve and the component speaking two languages.

**One fixed offset table**, reused for all five transitions, rather than varying per look. Simplest to spec and fully deterministic — no `Math.random`, so SSR and reduced motion stay predictable. The accepted risk is that the identical tear repeats roughly 23 times a minute and may begin to read as mechanical. Recorded as a watch item rather than pre-solved.

## Why nothing else was considered

Carried forward from `retime-hero-wardrobe-choreography`, still binding:

- **View Transitions API** — a repeated full-document snapshot with rendering frozen, forever, on the LCP element of a page running Lenis.
- **Scroll-driven animations** — excluded by the brief and still not Baseline.
- **Animated `clip-path` / `mask-image`** — re-rasterizes per frame. This change animates neither; the clip is static.
- **`filter` / `backdrop-filter` chromatic effects** — per-frame full-surface repaint on an 820×1080 element on an infinite loop. Still rejected, and note this is what killed glitch treatments last time: the objection was always about *animated* filters, and this change animates none.
- **Canvas / WebGL displacement** — a true datamosh shader is the "right" way to do this and the wrong price: a second rendering pipeline, a context to manage, and a fallback path, for an effect that seven divs and a transform already deliver.
