# Morph: homepage team grid → /o-nas team slider

## Why

Clicking a teammate tile on the homepage grid lands on `/o-nas#zespol` as a hard jump: the page streams behind its loading shell, Lenis snaps to the anchor whenever the section appears, and the featured member swaps in one-to-two effect ticks after mount. The user experience is a blunt cut where the design promises continuity ("the person you clicked travels to their profile"). The View Transitions API — now first-class in Next 16 via React's `<ViewTransition>` — exists for exactly this shared-element case, and the blockers are all local: one page-root `await` keeps `/o-nas` from prerendering, and the arrival state (scroll position + featured member) settles after paint instead of with the navigation commit.

## What Changes

- **Spike first**: a throwaway branch proves the load-bearing sequencing — that a Lenis/anchor scroll landed during the navigation commit (pre-paint) is captured by the browser's new-state snapshot, so the morph targets the on-screen featured slot rather than flying off-viewport. The spike has an explicit kill criterion; if it fails, the change stops at the standalone fixes below.
- `/o-nas` becomes fully prerenderable: `getLatestPost()` moves out of the page root into an async news child behind `Suspense` (the exact `HomeNews` pattern home already ships), so the Team section is in the DOM at navigation commit and the loading shell disappears from this path.
- Deep-link arrival becomes render-synchronous: the slider's initial featured member derives from `?lama=` during the first client render (replacing the two-effect-tick swap), and the `#zespol` landing happens before first paint when the target exists at commit. This kills the wrong-member flash and most of the perceived jank regardless of the morph.
- The clicked tile's cutout morphs into the slider's featured slot via matching `ViewTransition` names (`team-<slug>`), with a page crossfade as the default transition. The slider's wipe-reveal entrance is suppressed on morphing arrivals; the fixed header is pinned with its own transition name.
- Fallbacks: unsupported browsers and `prefers-reduced-motion` users get today's behavior (instant swap — improved by the arrival fixes above); a crossfade without the element morph is the accepted degraded mode wherever the shared element can't participate.
- Both locales: the same wiring applies to `/en` → `/en/about-us`.

## Capabilities

### New Capabilities

- `onas-page-shell`: the `/o-nas` (and `/en/about-us`) rendering class — fully prerendered static shell with the CMS-dependent news section isolated behind `Suspense`, so client navigation never shows a loading shell and the team anchor exists at commit.
- `team-morph-transition`: the view-transition behavior between the homepage team grid and the `/o-nas` team slider — shared-element morph on supported browsers, crossfade default, suppression of competing entrance animations, reduced-motion and unsupported-browser fallbacks, reverse morph on back-navigation.

### Modified Capabilities

- `onas-team`: the "slider honors a `lama` deep-link param" requirement changes from an effect-driven instant swap to a render-synchronous one — the deep-linked member is featured in the first painted frame, and the anchor landing is pre-paint on prerendered arrivals (the streaming-tolerant polling path remains as fallback).

## Impact

- **Pages**: `app/(frontend)/o-nas/page.tsx`, `app/(frontend-en)/en/about-us/page.tsx` (Suspense/news split, morph wiring), plus a news skeleton for the o-nas band.
- **Components**: `o-nas/sections/team/index.tsx` (synchronous `?lama=` init, `ViewTransition` on the featured slot, wipe suppression on morph arrival), `(home)/sections/why-that-works/index.tsx` (`ViewTransition` per tile), `components/layout/scroll-reset/` (pre-paint landing path), `components/layout/header/` (pinned transition name), possibly `components/ui/link` / `components/ui/image` prop passthrough.
- **Config**: `next.config.ts` if Next 16 still gates view transitions behind an experimental flag (verified during the spike).
- **Risk surface**: interacts with the Next 16 Activity cache (both pages stay mounted across navs), Lenis scroll ownership, and the settled wipe `clip-path` — all previously bitten areas; the spike and fallback criteria exist to contain this.
- **No schema/DB impact**; content modules untouched.
