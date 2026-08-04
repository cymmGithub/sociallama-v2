# Morph: /branze hub poster cards → industry hero

## Why

The `/branze` hub cards are text-only while every one of the 12 industry pages opens with a full-bleed hero poster (`/branze/<id>/hero.jpg`) — the hub sells the industries without showing them. Putting each page's own poster on its card makes the hub a visual index, and because the card and the destination hero then share the exact same asset (cover-crop on both sides, hero at scroll top, fully static target page), the card → hero navigation is the ideal shared-element view transition: the poster the visitor clicks expands into the page they land on. The user reviewed an A/B mock on 2026-08-04 and chose **Variant A** — full-bleed poster, label + CTA only, no tagline on the card — with **"Więcej"** as the card CTA.

## What Changes

- `/branze` and `/en/industries` cards become full-bleed poster cards (3:2): the industry's `hero.jpg` under a light bottom scrim, the label in display type with the orange dot, and a "Więcej" / "More" CTA. The tagline leaves the card — it waits on the destination page.
- `SectionIndex` grows an optional per-item image slot; the services hubs (`/uslugi`, `/en/services`) pass nothing and keep today's text cards unchanged — accepted asymmetry, decided 2026-08-04.
- The card CTA copy moves from "Zobacz branżę" to "Więcej" (PL) / "More" (EN) in the branze content modules' `chrome.index.cardCta`.
- On view-transition-capable browsers, the clicked card's poster morphs into the industry page's hero poster (`branza-<id>` names on both sides), with the page crossfade as default; unsupported browsers and reduced-motion get today's instant navigation. Reuses the machinery landed by `morph-team-grid-transition` (config, header pin, pre-paint scroll path) — this change extends the pre-paint landing to the no-hash `scrollTo(0)` case, since the hub is always scrolled down at click time.
- No prerender work needed: `/branze/[slug]` is already fully static (`generateStaticParams`, content modules only).

## Capabilities

### New Capabilities

- `branze-morph-transition`: the view-transition behavior between hub poster cards and industry-page heroes — shared-element morph, crossfade default, pre-paint scroll-to-top landing, fallbacks, and non-interference with the hero's video layer.

### Modified Capabilities

- `industries-hub`: the card requirement changes — cards present the industry's hero poster with label + CTA (no tagline body), CTA copy becomes "Więcej"/"More", and legibility over arbitrary photography becomes normative. Other consumers of the shared hub layout are explicitly unaffected.

## Impact

- **Components**: `components/sections/section-index/` (optional image slot, poster card presentation), `app/(frontend)/branze/[slug]/industry-page.tsx` (transition name on the hero poster), `components/layout/scroll-reset/` (pre-paint path generalized to no-hash navigations).
- **Content**: `lib/content/branze.ts` / `branze.en.ts` (`chrome.index.cardCta`).
- **Pages**: `/branze`, `/en/industries` pass poster paths; `/uslugi`, `/en/services` untouched.
- **Weight**: 12 posters land on the hub — card-sized `sizes` discipline required (homepage lesson: oversized `sizes`, not image count, is what bleeds points); hub LCP becomes an image.
- **Dependency**: the morph tasks consume the view-transition machinery and spike verdict from `morph-team-grid-transition` (worktree live on :3004). If that spike kills the morph, the poster-card redesign still ships; only the transition tasks are struck.
