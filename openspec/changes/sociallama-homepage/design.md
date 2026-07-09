# Design: sociallama-homepage

## Context

Satus ships the motion stack (Lenis smooth scroll, GSAP via `components/effects/gsap`, `<Marquee>`, `<Fold>` with hamo `useScrollTrigger`, `<ProgressText>`, `useReveal`) and a typed theme system (`lib/styles/colors.ts`: named themes exposing `primary/secondary/contrast` slots). The approved mock (artifact `scroll-story-v1`) defines a three-chapter scroll narrative. Real content is verified in the content export; one production-ready hero video exists (1370×1080, 3s loop, flat plum background `#892f53`).

Constraints from Satus conventions (AGENTS.md): images through `@/components/ui/image`, links through `@/components/ui/link`, CSS Modules imported as `s`, Biome + strict TS in CI.

## Goals / Non-Goals

**Goals:**
- Homepage that reproduces the mock's scroll story with production quality (Lighthouse budget: no regression below Satus baseline; video lazy-loaded).
- Brand theme expressed through Satus's existing theme system, not a parallel one.
- Asset system rule made explicit and enforced: every clip composites seamlessly onto its section background.
- All five clips (1 existing + 4 generated) share one recognizable llama character.

**Non-Goals:**
- Subpages, CMS wiring, FAQ, blog. No content management — typed data module only.
- WebGL. The mock proved the story works with DOM + GSAP; flowmap distortion is a possible v2 flourish, not v1 scope.
- English/i18n beyond the brand's English display headlines.

## Decisions

**D1 — Chapters are Satus themes.** Replace the starter palette in `lib/styles/colors.ts` with brand colors (`plum #923156`, `plumHero #892f53`, `plumDark #722341`, `orange #ed8c1b`, `ink #2b1f24`, `cream #fbfaf6`, `sand #f0ece3`) and define themes `plum` (hero chapter), `cream` (middle), `plum-deep` (closing). Chapter wrappers set the active theme; the background morph is a CSS `background-color` transition on the page wrapper driven by an IntersectionObserver (as validated in the mock), animating between theme backgrounds. *Alternative considered:* GSAP ScrollTrigger color scrub — rejected for v1; the observer + CSS transition approach is simpler, already validated, and reduced-motion-safe.

**D2 — `<Video>` is a new UI primitive in `components/ui/video/`.** Props: `src`, `mobileSrc?`, `poster`, `posterMobile?`. Behavior: `muted playsInline loop preload="none"`; IntersectionObserver starts/stops playback; `prefers-reduced-motion` renders the poster via `@/components/ui/image` instead of the video element; source selection via `matchMedia` at mount (not `<source media>`, for predictable behavior). Gets a Storybook story per Satus convention.

**D3 — Seamless-composite convention.** Every clip is authored on a flat background exactly matching its host section's theme background. The hero video defines the rule (`#892f53`). Section CSS uses the theme token, and the token value must equal the clip background. Verification: sample the clip's corner pixels (ffmpeg) and assert they match the token within a small tolerance; if generation lands slightly off, color-correct the clip (ffmpeg `colorbalance`/`eq`) rather than hacking CSS.

**D4 — Hero choreography over regeneration (default path).** The existing hero clip's leftward turn is treated as a directional cue: llama (right column) turns toward the headline (left column). A GSAP timeline staggers the three headline lines in sync with the turn (timeline starts on the video's first `timeupdate`, tuned to the 3s loop's first pass; subsequent loops play without re-triggering text). Acceptance is subjective — reviewed on the running site. **Fallback (pre-authorized):** if the turn reads as awkward, regenerate the hero via Higgsfield with a self-contained action (sunglasses-drop beat), same character, same plum background, ~3s seamless loop.

**D5 — Clip generation is an implementation task with a fixed recipe.** Upload `hero-poster.jpg` as the character reference (`media_upload`), then per clip: `models_explore(action:'recommend')` → `generate_video` with reference + prompt specifying flat `#892f53` background, ~3s loopable action, no camera move; verify composite rule (D3); `reframe` to 16:10 for service cards if needed. Clips: `service-content` (llama at laptop/strategy board), `service-sprzedaz` (deal-closing/chart-up), `service-kreacje` (behind camera/clapper), `cta-llama` (on the phone). Budget guard: confirm credit cost via `show_plans_and_credits`/`balance` before the batch; if credits are short, ship v1 with static poster frames in service cards (component API is identical — swap `<Image>` for `<Video>` later).

**D6 — Content module.** `lib/content/home.ts` exports typed constants mirroring the content export (nav, hero, services, steps, clients, featured testimonial, post card, footer). Polish copy verbatim from export; the 8 lorem testimonials and empty FAQ are excluded. Single source for all sections — no strings in components.

**D7 — Section components live in `app/(home)/sections/`** (colocated with the page, since they are page-specific, not reusable primitives; reusable pieces — `<Video>` — go to `components/ui`). Each section = one folder with `index.tsx` + CSS Module. How-It-Works uses `<Fold>` + hamo `useScrollTrigger` progress to drive step highlighting (mock's 320vh pin validated the pacing).

**D8 — Fonts via `next/font/google` in `lib/styles/fonts.ts`**: Exo 2 (400/800, `latin` + `latin-ext`) as display/body-heading face, Manrope (400/600, `latin` + `latin-ext`) as body/utility face. Polish diacritics require `latin-ext` (verified during mock build — missing subset produces visible fallback).

**D9 — Minimal header + overlay menu (brightscout pattern).** The header bar is reduced to logo + CTA pill + Menu pill at every breakpoint; the v1 inline desktop links and hover submenu are removed. The Menu toggle opens a full-viewport overlay on a fixed `cream` theme (it does not inherit the scroll-chapter theme; the closed bar still tints per chapter): two columns — BRANŻE (six industries, content-export order/spelling) and USŁUGI (Content, Sprzedaż, Kreacje & Wideo, Szkolenia i kursy) — plus a utility row with O NAS, contact email, and socials. KONTAKT is dropped as a link since the CTA pill is the contact action. Menu links ship *before* their pages exist (subpages arrive in a near-future change); until then they resolve to the themed not-found page — accepted interim state. Industry routes are provisionally `/branze/<kebab-slug>` (e.g. `/branze/nieruchomosci-budownictwo`) — adjust when the subpages change defines them. Nav content in `lib/content/home.ts` restructures from flat `nav.links` to `menu: { branze, uslugi, utility }`.

## Risks / Trade-offs

- [Hero choreography doesn't land] → D4 fallback: regenerate hero clip; layout and timeline code unchanged.
- [Higgsfield can't hold character consistency across 4 clips] → generate all from the same poster reference in one session; accept-reject per clip; worst case ship service cards with stills (D5 degradation path preserves the design).
- [Generated clip backgrounds off-plum] → D3 verification + ffmpeg color-correct; never adjust the theme token to match a clip (it would desync the other sections).
- [3s hero mp4 (3.2MB) on slow connections] → poster paints first (`preload="none"`), video fades in when ready; mobile gets the 2MB 1.7s variant.
- [Replacing starter themes breaks Satus debug/theming utilities] → keep theme names additive where feasible; run `bun run check` (Biome + tsc + tests) after theme swap.
- [Marquee with text-only logos underwhelms vs. real logo files] → logo images exist only on the live site's media API; task includes downloading the 13 logo files from the export URLs — if unavailable, text marquee (validated in mock) is the accepted fallback.

## Open Questions

- Hero regeneration decision (D4) — resolved during implementation review, not before.
- Logo file availability from the live media API — resolved by attempting download in the asset task.
