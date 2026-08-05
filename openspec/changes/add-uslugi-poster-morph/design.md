# Design: add-uslugi-poster-morph

## Context

`/branze` established the pattern: `SectionIndex` renders poster cards whose `Image` carries a `ViewTransition` name (`branza-<id>`), the industry hero's poster carries the identical name, and `global.css` cover-fits both snapshots through the `branza-poster` view-transition-class. The machinery was deliberately kept after the team-grid pair was removed (2026-08-05) — branze is today's only live pair.

`/uslugi` still uses `SectionIndex`'s plain-text card branch, and service heroes are flat plum bands with a `HERO_LLAMA` scaffold that never received its asset. Four of the seven service pages (Strategia, Kampanie, Kreacje, Influencer) carry a full-bleed ambient video within one section of the hero — the reason this change is poster-only.

The artwork is decided: direction A ("Kreska") from the 2026-08-05 mock, all seven motifs user-approved, including their micro-motion (mock artifact `uslugi-poster-mocks.html`, label `A-animated-full-set`). The mock is the visual contract — geometry, stroke logic, one-orange-accent rule, and per-poster motion are to be transplanted, not redesigned.

## Goals / Non-Goals

**Goals:**
- The `/uslugi` and `/en/services` hubs present the seven approved posters as cards in a 1+3+3 grid and morph card→hero exactly as branze does.
- Service heroes carry their poster behind the existing copy with no legibility regression.
- Micro-motion ships with the discipline approved on the mock: one ambient loop per poster, entrance draw-on via the reveal system, off-screen pause, full reduced-motion opt-out.
- The branze morph keeps working unchanged.

**Non-Goals:**
- No hero videos on service pages — explicitly rejected, not deferred.
- No copy or content-module changes (summaries stay; the copy-expansion discussion is separate).
- No redesign of the branze hub or its photographic posters.
- No new section kinds in the `ServiceSection` union — the hero poster is page chrome, not a content section.

## Decisions

**D1 — Posters are inline SVG React components, not files in `public/`.**
Ambient loops need `IntersectionObserver` pause, draw-on needs the `data-reveal-item` hook, and both sides of the morph need identical markup — none of which reaches inside an `<img src="*.svg">`. Seven components (~15–25 elements each) plus one shared CSS module for keyframes; total well under the weight of a single branze JPEG. Rejected: `public/` SVG via `next/image` (no animation control, and the optimizer does nothing for SVG anyway); a single parameterized poster component (the seven motifs share stroke discipline but not structure — forcing one component makes each motif worse).

**D2 — One poster module, keyed by service id.**
`components/sections/service-posters/` exports `ServicePoster({ id, variant })` dispatching to the seven artworks, with `variant: 'card' | 'hero'` selecting the viewBox/composition (600×400 vs 1440×540, per the mock — the hero recomposes rather than crops, e.g. Strategia's route stretches and its copy-side stays calm). The morph pairs the two variants by transition name; view transitions snapshot pixels, so paired elements need not be identical markup — the class-based cover-fit already handles differing crops for branze.

**D3 — `SectionIndex` gains an `artwork` slot instead of a third card branch.**
`SectionIndexItem` gets optional `artwork?: ReactNode` rendered where the poster `Image` goes today, reusing the existing posterCard chrome (scrim, label, CTA, morph wiring). `image` keeps working for branze. A `feature?: boolean` flag spans the card across the grid row for the 1+3+3 layout. Rejected: a separate `ServicesHub` component (duplicates the card chrome the two hubs must keep in sync).

**D4 — Transition names are `usluga-<id>`; the shared class is renamed once.**
The `branza-poster` view-transition-class in `global.css` and both components becomes `poster-morph` (one class, both sections — the cover-fit rule is identical). Names stay per-section-prefixed (`branza-*`, `usluga-*`) so ids can never collide across sections. This is the only branze-touching edit; the branze morph must be regression-checked after it.

**D5 — Hero poster is a layer in the existing `Hero`, mirroring branze's `HeroMedia` minus the video.**
The hero section gains the poster component (absolutely positioned, `aria-hidden`), a scrim, and `data-transparent-header` — the same header behavior as branze media heroes. The `HERO_LLAMA` scaffold and its dead branch are removed (the poster supersedes the planned llama render; `data-has-llama` CSS goes with it). The hero copy block and optional CTA render unchanged above the scrim.

**D6 — Micro-motion is CSS-only with two triggers, transplanted from the mock.**
Ambient keyframes (dash-travel, ping, lens scan, film advance, signal, ripple) live in the poster module's CSS, animate only `stroke-dashoffset`, `transform`, `opacity`. A single `IntersectionObserver` in `ServicePoster` toggles `data-animating` to pause loops off-screen (the `/o-nas` orbit pattern). Draw-on accents (Strategia route, Sprzedaż bars) bind to the reveal system's settled state and run once on viewport entry — hover was mock affordance only. `prefers-reduced-motion` disables both via media query; no JS branch needed beyond skipping the observer (also the orbit pattern). Note the happy-dom constraint: any DOM-watching stays rAF/IO-based, no MutationObserver.

**D7 — Hub cards drop `Image` preloading logic for `/uslugi`.**
Inline SVG needs no preload/LCP hints; the branze-only `preload={i < 3}` logic stays keyed to the `image` branch. The hub's LCP becomes the feature card's inline artwork — measured after implementation, expected to beat the JPEG hub.

## Risks / Trade-offs

- **[Class rename could break the branze morph]** → The rename is mechanical (three files), but the morph is invisible to unit tests. Mitigation: Playwright pass over a branze card→hero navigation before and after, plus the reduced-motion fallback.
- **[Hero recomposition per poster doubles the SVG authoring]** → Accepted: the hero variants for the mock's Strategia already exist; the remaining six follow the same recomposition rules (motif shifts toward the right two-thirds, copy side stays calm). The mock is the reference for density.
- **[Legibility of hero copy over artwork]** → Line art is high-contrast by construction; the scrim from branze (left gradient + bottom fade) is kept anyway, and the one-orange-accent rule keeps accents away from the copy column in hero variants. Verify AA contrast on all seven heroes in both locales.
- **[Ambient loops on seven cards simultaneously on the hub]** → All compositor-cheap properties, but seven loops is more than the mock showed at once. Mitigation: the off-screen pause covers below-fold cards; if the hub still feels busy, ambient loops can be hub-disabled (cards static, heroes animated) without touching the components' API — decide at visual sign-off.
- **[EN hub parity]** → `/en/services` reuses the same components with the EN content module; morph names derive from locale-neutral `id`, so pairs work within each locale by construction.

## Migration Plan

Single deploy, no data or schema involvement. Rollback = revert the commit; the branze class rename reverts with it. Visual sign-off on the dev server (both hubs, all seven heroes, morph on a capable browser, reduced-motion run) before merge, per house rules.

## Open Questions

- **O1 — Hub ambient motion on vs off** (see risk above): ship with loops on and decide at visual sign-off whether the hub keeps them or only heroes animate.
- **O2 — Feature-card hero variant**: the Strategia feature card is wider than 3:2 (roughly 6.4:2 per the mock's grid sketch); its artwork likely reuses the hero composition rather than the card one. Confirm during implementation against the mock's proportions.
