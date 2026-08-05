# Proposal: add-uslugi-poster-morph

## Why

The `/uslugi` hub is the last flat-text index on the site: seven summary cards on cream, while `/branze` ships poster cards whose artwork morphs into the destination hero — the interaction the user singled out as the bar ("look how beautifully we did it for /branze"). The services hub should reach that bar without inheriting branze's asset model: four of the seven service pages already carry a full-bleed ambient video within one section of the hero, so photographic hero clips would stack two moving layers a scroll apart. The chosen answer — approved on the 2026-08-05 mock (direction A, "Kreska", all seven motifs signed off) — is hand-authored line-art SVG posters: brand-exact, license-clean, a few KB each, animatable with CSS micro-motion instead of video.

## What Changes

- **Seven line-art SVG posters** (direction A from the approved mock), one per service, authored as inline React components in brand tokens: Strategia (route with waypoints), Content (post cascade with badge), Sprzedaż (ascending bars + trend line), Kampanie reklamowe (search field + click ripple), Kreacje & Wideo (play on filmstrip), Audyt i konsultacje (magnifier over data grid), Influencer marketing (creator ring radiating signals). Plum ground, cream strokes, one orange accent per poster.
- **`/uslugi` hub rebuilt as poster cards** in a 1+3+3 grid: Strategia as a full-width feature card (its own copy calls it the starting point of every engagement), the remaining six in two rows of three. The EN twin `/en/services` gets the identical treatment. Plain-text summary cards are retired on this hub (the `SectionIndex` text variant remains for any future caller).
- **Service-page heroes gain the poster as a background layer** — the same artwork the card shows — with a scrim keeping title/lead legible and the transparent-header treatment used by branze media heroes. Poster only: **no hero videos**, now or as a follow-up on pages that carry partner/backdrop clips.
- **Card→hero morph** via the shared view-transition machinery: the poster is the only named pair (`usluga-<id>`), scrims/labels/copy crossfade, unsupported browsers and reduced-motion get today's instant navigation. The `branza-poster` view-transition-class is generalized (renamed to a shared class) since branze stops being the only live pair.
- **Micro-motion, disciplined**: one ambient loop per poster (dash-travel, ping, lens scan, film advance, signal, ripple — as approved on the mock), 8–22s cycles, compositor-cheap properties only; draw-on accents fire once on viewport entry via the existing reveal system (not hover); ambient loops pause off-screen; `prefers-reduced-motion` disables everything.
- **The dead `HERO_LLAMA` scaffold is removed** from the service page — the poster layer supersedes the never-delivered shared llama render as the hero visual.

## Capabilities

### New Capabilities

- `services-hub`: the `/uslugi` + `/en/services` index presentation — poster cards from the canonical service list, the 1+3+3 feature grid, label/CTA legibility over artwork, and the micro-motion discipline (ambient loops, entrance draw-on, reduced-motion and off-screen behavior).
- `uslugi-morph-transition`: the card→hero shared-element morph for services, mirroring `branze-morph-transition` — poster-only pair, scroll-zero arrival, instant-navigation degradation.

### Modified Capabilities

- `services-pages`: the "Hero follows the shipped homepage treatment" requirement changes — the hero ground goes from flat plum (with a planned shared llama render) to the service's own poster artwork behind a scrim, with the transparent-header treatment; the llama render is dropped from the requirement. A new requirement pins heroes to poster-only media (no video layer), given the ambient clips already present further down four of the pages.

## Impact

- **Components**: `components/sections/section-index` (poster-card variant accepts inline SVG artwork + feature-card grid slot), new poster components (7 artworks + shared animation CSS), `app/(frontend)/uslugi/[slug]/service-page.tsx` hero (+ `service.module.css`), `app/(frontend)/uslugi/page.tsx`, `app/(frontend-en)/en/services/page.tsx`.
- **Content modules**: `lib/content/uslugi.ts` / `uslugi.en.ts` — no copy changes; hub cards keep deriving from `SERVICES` (summaries stay for SEO/other surfaces).
- **Shared machinery**: `global.css` view-transition-class rename (`branza-poster` → shared name) touches the two branze surfaces — regression-check the branze morph.
- **Perf**: hub LCP flips from preloaded JPEG posters (branze pattern) to inline SVG — no image requests; service-page LCP remains text or becomes the inline poster; no new video or image bytes anywhere.
- **Tests**: locale-parity test unaffected (no content-shape change); e2e — existing uslugi/branze journeys must stay green; visual verification of morph + reduced-motion fallback via Playwright.
- **Not in scope**: hero videos on any service page, copy expansion (separate discussion), `/branze` behavior changes beyond the class rename.
