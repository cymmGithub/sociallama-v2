## Why

The hero's wardrobe currently changes with a 1260 ms opacity cross-dissolve, retimed three days ago in `retime-hero-wardrobe-choreography`. The retiming did its job — the word leads, the wardrobe answers — but the mechanism is still the softest possible one: five identical poses fading into each other. For a social agency whose own case-study tiles already render an offset-channel glitch (`brand-icons.tsx:11`), the hero's costume change is the quietest thing on the page.

A **slice tear** replaces the dissolve: the llama shears into seven horizontal bands that displace horizontally and hand off to the incoming look band by band over 270 ms. The wardrobe is rewritten in strips rather than faded.

This is a deliberate reopening of a decision. `retime-hero-wardrobe-choreography` ruled out glitch treatments in its design, on the grounds that they mean "per-frame full-surface repaint on an 820×1080 element, on an infinite loop." That objection is correct **about animated `filter`** and does not apply here: this change animates `transform` only, over layers whose `clip-path` is set once. A static clip is baked into the texture at rasterization and is free thereafter; only an animated one re-rasterizes.

That same change also set the band split aside for a concrete reason, recorded in its Non-goals:

> the band split additionally needs a fix for outgoing looks whose silhouette is up to 100 px wider at the shoulder than the incoming one

That blocker is now solved. Because the looks are alpha mattes, layering the incoming look *over* the outgoing one leaves the old llama visible wherever the new silhouette is narrower — look-05's bicorne ghosting behind look-01 is the worst case. The fix is a **per-band handoff**: the outgoing band switches off as the incoming band switches on, so exactly one layer owns each band at any moment and there is nothing to ghost through.

A four-way study (shipped dissolve, chromatic cut, slice tear, strobe cut) was built on the real mattes at real cadence and reviewed live. The slice tear won, and it answers the objection that a glitch on five identical poses would read as a rendering fault: the band-by-band handoff is legible *as a costume change* in a way a whole-frame effect is not.

## What Changes

- **Replace the wardrobe cross-dissolve with a slice tear.** `.look`'s `transition: opacity 1.26s var(--ease-out-quart) 270ms` gives way to a seven-band horizontal displacement lasting 270 ms, in three discrete 90 ms steps.
- **Keep the 270 ms lead and the 2600 ms cadence.** The word still leads and the wardrobe still answers; only what the wardrobe *does* changes. `ROTATOR_INTERVAL` is untouched.
- **Keep the headline word exactly as it is** — 1950 ms, `--ease-out-expo`. The contrast between a silky word and a hard-cutting llama is intended, not incidental.
- **Decompose the tear into bands built from `background-image`, while the resting layer stays an `<img>`.** The fourteen tear bands share one decoded bitmap per look because they share a URL. The layer visible at rest — the LCP candidate — must remain a real `<img>` carrying today's `preload` and `fetchPriority`, because a CSS background is discovered only after CSSOM and style resolution, not by the HTML preload scanner. Band backgrounds are not assigned until the first transition fires, so nothing competes with look-01 during load.
- **Drive the tear from CSS keyframes, not JS timers.** Per-band `--dx-a/--dx-b/--dx-c` custom properties feed one shared `@keyframes` stepped with `steps(1)`, so a transition is a single class toggle and the compositor runs the rest — the same main-thread profile as today's dissolve.
- **Join bands on integer pixel rows.** Both sides of every boundary round to the same integer, so bands butt exactly — no gap to antialias and, critically, no overlap. The mattes are only ~98.8% opaque through the body (alpha 250–254, not 255), so any overlap composites into a visible ridge.
- **Retire the bands to a single un-banded resting layer** once the tear settles, so the ~90% of the cycle spent at rest has no band structure at all.
- **Apply on both breakpoints.** Desktop and mobile get the same treatment.
- **Reword three requirements that the dissolve wrote.** `Choreographed wardrobe transition`, `Asymmetric easing` and `Compositor-only motion` all encode the dissolve's mechanism and must change. In particular `Compositor-only motion` bans `clip-path` as a *property*, which over-blocks: the ban belongs on animating it.

## Capabilities

### Modified Capabilities

- `hero-wardrobe`: the transition mechanism changes from cross-dissolve to slice tear, adding per-band handoff and seamless band joins, and relaxing the compositor rule from a property ban to an animation ban.

## Impact

- **Modified**: `app/(frontend)/(home)/sections/hero/outfit-stack.tsx` (band decomposition, handoff, tear schedule) and `app/(frontend)/(home)/sections/hero/hero.module.css` (`.look` retired, `.band` added).
- **Not modified**: `lib/hooks/use-rotator.ts`, `index.tsx`, every image asset, and the headline word's timing.
- **Blast radius is hero-only.** `JoinCta` shares the rotator hook but not the transition; it is untouched.
- **DOM grows on the LCP element.** Twenty-one elements per breakpoint instance — five resting stills, seven outgoing bands, seven incoming, and two layer wrappers — where five `<img>` sit today, so about 42 total across both breakpoints. Nineteen of the twenty-one actually draw; the wrappers only carry opacity. Accepted deliberately; see `design.md`. (This figure was first written as "fifteen … one resting layer", which mis-assumed the stack could collapse to a single still. It cannot: `Loading characteristics are unchanged by choreography` requires looks 2–5 to load eagerly, and the eager `<img>` per look is what does that.)
- **Compositor cost is flat.** Only `transform` and `opacity` animate. `clip-path` is set once per band per resize, never per frame. No filters, no masks, no View Transitions, no scroll-driven animation.
- **LCP must be re-verified, not assumed.** The band rework touches how look-01 first paints. The `look-01` preload, the five eager fetches and the LCP element must all come out unchanged. This is the single most likely way this change regresses something.
- **CLS contribution is zero.** Bands are `position: absolute; inset: 0` within `.llamaBox` and never participate in layout; `transform` and `clip-path` are both layout-neutral; the media box is unchanged.
- **INP is protected by construction.** Driving the tear from CSS keyframes keeps it a single class toggle per transition. A JS-timer implementation was measured at up to ~10 ms of scripting per transition on a page already running Lenis in rAF, and is rejected on that basis — see `design.md`.
- **iOS Safari carries the residual risk.** `will-change: transform` SHALL NOT be set on the bands: fourteen promoted layers per instance, twenty-eight across both breakpoints, on an 820×1080 element at dpr 3 is a memory hazard on exactly the weakest platform. Real-device verification is a gating task, not an assumption.
- **Reduced motion is unaffected.** The rotator already freezes at index 0, so no tear ever fires.

## Non-goals

- **Chromatic cut and strobe cut.** Both were built and reviewed; both were set aside. See `design.md` for why.
- **Clamping the matte alpha.** The mattes' bodies sit at alpha 250–254 rather than 255, so ~1.2% of the plum ground reads through the llama. This is a real asset-hygiene issue that predates this change and affects the shipped fade equally, but the per-band handoff means nothing composites over anything, so this change does not depend on it. Flagged, deliberately separate.
- **Varying the tear per look.** One fixed offset table is reused for all five transitions. Watch item, recorded in `tasks.md`.
- **Correcting the stale `hero-scroll-scrub` and `homepage` hero requirements.** Still stale, still out of scope, as at the previous change.
