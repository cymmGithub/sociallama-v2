# Proposal: sociallama-homepage

## Why

Social Lama needs a new agency homepage that competes visually with awwwards-tier agency sites (reference: brightscout.com's scroll storytelling), replacing the current WordPress-era presentation. The Satus template already ships the required motion primitives (Lenis, GSAP, Marquee, Fold, ProgressText, useReveal) — this change assembles them into the Social Lama brand world using verified real content and the existing hero video asset. An approved HTML mock of the scroll narrative exists (artifact `scroll-story-v1`).

## What Changes

- Replace the Satus manual homepage (`app/page.tsx`) with the Social Lama homepage: a three-chapter scroll narrative (plum → cream → plum-dark) with animated background morphs between chapters.
- Add Social Lama brand theme to the Satus styling system: plum/orange/cream/sand palette tokens and Exo 2 + Manrope fonts (via `next/font`).
- Add a reusable `<Video>` UI component (Satus has none): poster support, lazy autoplay loop, `prefers-reduced-motion` fallback to poster, mobile/desktop source switching.
- Build homepage sections mapped to Satus primitives: Hero (video choreographed with GSAP headline stagger), client logo `<Marquee>`, Why-That-Works (`ProgressText` scroll-scrub fill), Services (3 cards with hover video previews), How-It-Works (pinned `<Fold>` 5-step scrub), big "THAT WORKS" marquee, featured Testimonial, CTA, single NewsLAMA card, Footer.
- Generate 4 new video clips via Higgsfield MCP matching the established asset system (same llama character from hero poster reference, flat plum `#892f53` background, ~3s loops): `service-content`, `service-sprzedaz`, `service-kreacje`, `cta-llama`.
- Copy existing hero assets (`hero.mp4`, `hero-mobile.mp4`, posters) into `public/clips/`.
- Content is hardcoded as typed data (`content.ts`) from the verified content export — no CMS in this change (explicitly deferred).
- Header reduced to logo + CTA + Menu at all breakpoints, with a full-viewport overlay menu (BRANŻE / USŁUGI columns + utility row) replacing inline links — brightscout pattern (D9). Menu links precede their subpages, which arrive in a near-future change.
- Cut from v1 (content-starved): FAQ section (0 real FAQs), NewsLAMA grid (only 1 real post → single large card instead).

## Capabilities

### New Capabilities

- `brand-theme`: Social Lama design tokens (palette, typography, gutter scale) integrated into Satus Tailwind v4 / CSS custom property system.
- `video-playback`: Reusable video component with poster, lazy loop autoplay, reduced-motion and responsive-source behavior; seamless background-blend convention for plum-backed clips.
- `homepage`: The Social Lama homepage — section structure, content, scroll narrative, chapter background morph, and per-section motion behaviors.
- `site-nav`: Minimal header bar (logo + CTA + Menu at all breakpoints) and the full-viewport overlay menu with BRANŻE/USŁUGI columns and utility row.

### Modified Capabilities

<!-- none — greenfield template, no existing specs in openspec/specs/ -->

## Impact

- **Replaced**: `app/page.tsx` (Satus onboarding manual — its content lives in README anyway), default Satus theme tokens.
- **New code**: `components/ui/video/`, homepage section components, `lib/content/` (typed content data), font setup in root layout.
- **Assets**: `public/clips/` grows by ~5 videos + posters (hero exists; 4 clips generated via Higgsfield during implementation — requires character-consistent generation using the hero poster as reference).
- **No new npm dependencies**: GSAP, Lenis, and all motion primitives already ship with Satus. Fonts loaded via built-in `next/font`.
- **Out of scope**: subpages (`/branze`, `/uslugi/*`), CMS integration, FAQ, blog listing/detail pages, i18n (site is Polish-only with English display headlines, matching brand voice).
- **Risk**: hero clip's leftward turn may read as unmotivated; default plan choreographs headline reveal to the turn (llama looks at the copy). Fallback: regenerate hero with a self-contained action (sunglasses drop). Decision point captured in design.
