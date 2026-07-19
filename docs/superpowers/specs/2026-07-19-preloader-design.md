# Preloader — "Plum Curtain" first-paint intro

**Date:** 2026-07-19
**Status:** Approved design, pre-implementation
**Mock:** direction A of a 3-way `public/preloader-mock.html` chooser (since removed)

## Goal

A branded, animated `sociallama` wordmark that plays on **every full page load /
hard refresh** of the frontend, then lifts away to reveal the page. Inspired by
brightscout.com's intro reveal.

Because the curtain is a full-screen fixed overlay above everything, it also **covers
the `app/(frontend)/loading.tsx` "Cooking…" Suspense fallback** on hard loads — so a
refresh reads as one consistent branded reveal instead of a raw "Cooking…" flash. The
curtain does not replay on client-side (SPA) navigation, where "Cooking…" still shows;
`loading.tsx` is left untouched.

> Design note: an earlier iteration gated the curtain to once-per-session. That was
> dropped because it produced an inconsistent experience — branded curtain on the first
> visit, raw "Cooking…" on every subsequent refresh. Every-load is consistent and, since
> it masks the already-present "Cooking…" moment, is not purely additive delay.

## Behaviour

- **Trigger:** plays on every full document load / hard refresh of a frontend page.
  Mounts once per document load (the frontend layout persists across SPA navigations, so
  it does not replay on in-app route changes).
- **Sequence (fixed ~2.1s timeline):**
  | t (s) | event |
  |-------|-------|
  | 0.00  | cream letters clip-reveal from a baseline mask, staggered ~45ms each |
  | 0.55  | orange hairline (`--color-orange`) draws left→right under the word |
  | ~0.9  | brief hold |
  | 1.22  | front plum curtain (`--color-plum`) lifts up |
  | 1.35  | back curtain (`--color-plum-dark`) lifts up → page revealed |
  | ~2.1  | overlay removed from DOM |
- **Reduced motion:** `prefers-reduced-motion: reduce` skips the choreography and
  removes the curtain immediately (session flag still set).

## Visual spec

- Ground: `--color-plum` (#913155) front curtain, `--color-plum-dark` (#722341) back layer.
- Wordmark: `sociallama`, lowercase, **Exo 2** (`--font-display`) 700, cream (#faf9f5),
  tracking −0.02em, size `clamp(34px, 9vw, 86px)`.
- Accent: 2px `--color-orange` (#f09b39) hairline under the word.
- Easings: reveal `cubic-bezier(0.16,1,0.3,1)`; curtain lift `cubic-bezier(0.76,0,0.24,1)`.

## Architecture

- **Component:** `components/layout/preloader/` — client component, mounted as the
  **first child of `<body>`** in `app/(frontend)/layout.tsx` so its markup is in the
  server-rendered HTML and paints as a full plum curtain with zero flash (the `<html>`
  is already `data-theme="plum"`).
- **Animation:** pure **CSS keyframes** (ported from the mock), auto-playing at first
  paint. No GSAP — the curtain must animate before the GSAP bundle parses, and this avoids
  the known `revert()` / Next 16 Activity-cache pitfalls. Panels finish lifted via
  `animation-fill-mode: forwards`, and `.root` retires itself with a `retire` keyframe, so
  the curtain clears even if JS never runs (progressive enhancement).
- **Controller (client JS):** the component only (a) holds page scroll via an
  `html.sl-intro-lock` class while the curtain is up, and (b) unmounts the node after
  `DURATION_MS` (2150ms). Reduced-motion → unmount immediately (CSS already hid it).
- **No session gate.** Plays every document load (see Behaviour).

## Scope / non-goals

- Frontend document loads only; the layout persists across SPA nav so it does not replay.
- `app/(frontend)/loading.tsx` is **untouched** (still the in-app / SPA-nav fallback).
- No admin/Payload routes.
- No user setting to disable it (YAGNI).
- Font-swap guard (waiting on `document.fonts.ready`) not implemented — Exo 2 is a
  next/font face requested in the layout, so it is warm early; swap risk is low.

## SEO & LCP (measured, 2026-07-19)

Concern raised during design: does an opaque first-paint curtain hurt SEO or LCP?

- **SEO — no impact.** The curtain is a decorative `position:fixed` overlay over fully
  server-rendered content; `children` render in the real DOM underneath. Bots index all
  content; no cloaking. `loading.tsx` untouched.
- **LCP — no regression (empirically confirmed).** Baseline homepage LCP on a prod build
  is ~556ms (warm/local), LCP element = the hero poster `IMG`. A synthetic test placed an
  opaque overlay over the same image from first paint and measured LCP **with vs without**
  the overlay: **76ms in both cases.** Chrome records the image's paint time regardless of
  an opaque element covering it — occlusion does **not** delay LCP. So the Core Web Vital
  stays green.
- **Honest caveat:** LCP measures *paint time*, not *visibility*. The metric won't regress,
  but the user genuinely can't *see* the hero until the curtain lifts (~1.2s+). That
  perceived delay is the real, intentional cost — and with every-load it applies to every
  refresh, though it replaces (not adds to) the "Cooking…" moment that was already there.
- **Implementation constraint:** the preloader must NOT defer the hero's load/render. The
  hero stays eager with `fetchpriority=high` (already the case); the curtain is a parallel
  overlay only. Because LCP is not a constraint, the 1.4s vs 2.1s timeline choice is a pure
  UX/brand call, not a metrics one.

## Success criteria

1. Every frontend document load / hard refresh plays the full sequence, then reveals the
   page; the curtain covers the "Cooking…" fallback (no raw fallback flash on hard loads).
2. Client-side (SPA) navigation does not replay the curtain.
3. `prefers-reduced-motion` users get an immediate reveal, no animation.
4. No layout shift or font-swap pop in the wordmark; no horizontal scroll; page scroll
   held only while the curtain is up.
5. LCP not regressed for the underlying hero (curtain is an overlay, retired after reveal).
