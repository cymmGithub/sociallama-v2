# Tasks: add-uslugi-poster-morph

## 1. Poster components (the approved artwork)

- [x] 1.1 Create `components/sections/service-posters/` with a `ServicePoster({ id, variant })` dispatcher and shared CSS module (keyframes: dash-travel, ping, lens-scan, film-advance, signal, ripple, route-draw, bar-up; all gated by `prefers-reduced-motion`)
- [x] 1.2 Transplant the four mock card artworks — Strategia (route), Content (post cascade), Audyt (magnifier over grid), Kreacje (play on filmstrip) — from `uslugi-poster-mocks.html` into card-variant components (600×400 viewBox, brand tokens, one orange accent each)
- [x] 1.3 Transplant the three approved new card artworks — Sprzedaż (bars + trend), Influencer (creator signal), Kampanie (search + click ripple)
- [x] 1.4 Author the seven hero-variant compositions (1440×540): Strategia exists on the mock; recompose the other six with the motif in the right two-thirds and a calm copy side, per design D2
- [x] 1.5 Wire ambient-loop pause: one IntersectionObserver per poster toggling `data-animating` (o-nas orbit pattern; rAF/IO only — no MutationObserver, per happy-dom constraint)
- [x] 1.6 Bind draw-on accents (Strategia route, Sprzedaż bars) to the reveal system so they run once on viewport entry, not on hover

## 2. Hub grids (PL + EN)

- [x] 2.1 Extend `SectionIndexItem` with `artwork?: ReactNode` and `feature?: boolean`; render `artwork` in the posterCard slot with existing scrim/label/CTA chrome; span feature cards full-row (1+3+3 closes the grid, stacked/2-col below desktop with feature first)
- [x] 2.2 Update `app/(frontend)/uslugi/page.tsx` to map `SERVICES` to poster cards (Strategia `feature`, morph name `usluga-<id>`), dropping summaries from cards
- [x] 2.3 Mirror on `app/(frontend-en)/en/services/page.tsx` with the EN module
- [x] 2.4 Verify: hub shows 7 cards in canonical order, labels AA-legible over artwork, links resolve in both locales

## 3. Service-page hero

- [x] 3.1 Add the poster layer to `Hero` in `service-page.tsx`: hero-variant `ServicePoster`, scrim, `data-transparent-header`; remove the `HERO_LLAMA` scaffold and its `data-has-llama` CSS
- [x] 3.2 Style the layer in `service.module.css` (branze `heroMedia`/`heroScrim` pattern, no video element)
- [x] 3.3 Verify: all 7 heroes in both locales — copy AA contrast over artwork, transparent header, no `video` in any hero, CTA (Audyt) renders above scrim

## 4. Morph wiring

- [x] 4.1 Rename view-transition-class `branza-poster` → `poster-morph` in `global.css`, `section-index/index.tsx`, `industry-page.tsx`; keep names section-prefixed (`branza-*`, `usluga-*`)
- [x] 4.2 Pair the posters: `ViewTransition name="usluga-<id>"` around the card artwork (hub) and the hero artwork (service page), share class `poster-morph`, `default="none"`
- [x] 4.3 Ensure hero ambient loops start only after the transition settles (activeViewTransition gate, as with reveal entrances)
- [x] 4.4 Verify with Playwright on a capable browser: uslugi card→hero morph runs, arrival at scroll zero; reduced-motion run gets instant navigation, no partial animation
- [x] 4.5 Regression: branze card→hero morph still runs after the class rename (normal + reduced-motion)

## 5. Close-out

- [x] 5.1 `bun run check` green; existing e2e (uslugi, branze journeys) green from the worktree
- [x] 5.2 Measure hub LCP vs the text-card baseline (dev tools is fine); confirm no regression from inline SVG
- [x] 5.3 Visual sign-off with the user on the dev server: both hubs, all seven heroes, morph, micro-motion density — and decide O1 (hub ambient loops on/off) and confirm O2 (feature-card artwork uses hero composition)
- [x] 5.4 Update `COMPONENTS.md` if the poster module warrants an entry; note the `poster-morph` class rename wherever `branza-poster` is documented
