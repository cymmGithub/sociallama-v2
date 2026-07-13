# Proposal: services-autoplay-tabs

## Why

The current Services section (three static cards with hover-gated generic clips, design D5) undersells the agency's strongest proof — real published work with real engagement numbers. The Webflow homepage "Build / Manage / Optimize" autoplay-tabs pattern (verified in their DOM on 2026-07-13) presents one large animated stage with per-tab content and a self-advancing loop, which fits our three services ("Content", "Sprzedaż", "Kreacje i Wideo") and lets authentic screenshots/footage carry the section.

## What Changes

- **BREAKING (visual/topology)**: Replace the three-card Services grid with a Webflow-style autoplay-tabs component: one shared 16:9 stage above three clickable tab columns, each with an auto-advancing progress bar (~6s per tab), crossfading stage content.
- New live animated stage background: brand grain-gradient (plum `#913155` → orange `#f09b39` gradient with SVG `feTurbulence` grain via `soft-light`, per the gggrain.svg recipe) rendered in CSS/SVG — no WebGL, no baked images.
- Stage media is DOM-composed per tab from real assets:
  - **Content**: three floating platform panels (Instagram grid, TikTok profile, LinkedIn page screenshots of Social Lama's own channels).
  - **Kreacje i Wideo**: phone-framed vertical (9:16) BTS video from the Burger King shoot, playing only while its tab is active (existing `Video` primitive, `autoPlay` gating).
  - **Sprzedaż**: placeholder stage (gradient only + copy) until real results assets are provided.
- The existing generic `service-*.mp4` hover clips and their posters are removed (user decision, 2026-07-13: "current clips do not survive").
- Asset pipeline: transcode the 42 MB HEVC `.mov` (1080×1920, 18.4s) to a web-ready H.264 MP4 (~720×1280, target ≤3 MB) plus poster frame; move screenshots into `public/`.
- Polish body copy for the three services is trimmed to ~1 short sentence each in `lib/content/home.ts` (long versions remain for future `/uslugi/*` pages).
- Behaviors: click-to-switch restarts the loop; IntersectionObserver pauses autoplay off-screen; mobile (<800px) stacks all three tabs open with no autoplay; `prefers-reduced-motion` swaps instantly with a static gradient.

## Capabilities

### New Capabilities

- `services-autoplay-tabs`: The Services section's autoplay-tabs component — shared stage with live grain-gradient background, per-tab DOM-composed media (panels / framed video / placeholder), tab loop timing, progress bars, pause/resume, mobile and reduced-motion fallbacks.

### Modified Capabilities

- `homepage`: The "Content sections from typed data" requirement pins service descriptions to the verified content export verbatim — the trimmed one-sentence bodies change that contract. The "Section motion behaviors" requirement's services-reveal mention is superseded by the tabs component's own motion.
- `video-playback`: The seamless-composite convention currently binds "every clip placed on a themed section" to a flat token-colored background. Scope it to bare-composited clips; panel-framed clips (visible intentional edges, e.g. the phone-framed BTS video) are exempt.

## Impact

- `app/(home)/sections/services/` — component and styles fully rewritten.
- `lib/content/home.ts` — services item shape changes (per-tab media descriptors replace `poster`/`clip`; trimmed bodies).
- `public/clips/service-*.mp4` + posters — deleted; new assets added under `public/` (3 screenshots, 1 transcoded MP4 + poster).
- Existing primitives reused, not modified: `Video` (autoPlay gating), `Image`, `useReveal`.
- No new dependencies (GSAP already in the project for hero; tab loop can use it or plain rAF/CSS).
- Source assets live outside the repo (`/mem/*.png`, `~/Downloads/*.mov`) and must be copied/transcoded in during implementation.
