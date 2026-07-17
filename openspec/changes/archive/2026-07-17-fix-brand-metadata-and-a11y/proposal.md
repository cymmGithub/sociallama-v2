## Why

Verification of `add-payload-blog` surfaced two pre-existing polish gaps: every page on this Polish agency site still ships Satus starter branding (`%s - Satūs` title template, `Satūs` default title, starter description, `html lang="en"`, `og:locale en_US`, `en-US` alternates), and the homepage Playwright a11y gate (`e2e/home.e2e.ts`) fails on serious color-contrast violations because axe samples scroll-scrubbed text in its dim resting state — so the gate cannot gate and CI-level a11y regressions go unnoticed.

## What Changes

- Replace the root-layout Satus branding with Social Lama metadata: default title and title template, site description, `applicationName`, OG `siteName`/locale `pl_PL`, Polish canonical alternates, and `html lang="pl"`.
- Replace the Satus starter favicons (`app/icon.png`, `app/apple-icon.png`) with the Social Lama llama mark served by the live site (sociallama.pl 192px/180px PNGs), and re-brand the PWA manifest (`app/manifest.ts`) name/description/icon sizes.
- Design pass on scroll-dimmed homepage text so anything meant to be readable at rest meets WCAG AA contrast at rest: `why-that-works` progress-text ghost words, `services` eyebrow/column text, `how-it-works` subhead and heading lines, `join-cta` sponsored-card identity line.
- Make the a11y e2e deterministic for scrub-driven transient states (scroll reveal states into their settled form before scanning, or explicitly exclude elements whose dimness is a transient animation frame) — then the zero-serious-violations assertion becomes a reliable gate again.
- No URL, routing, or content changes.

## Capabilities

### New Capabilities
- `site-metadata`: the site-wide document metadata baseline — Polish language and locale, Social Lama titles/description/OG identity, and where per-page metadata may override it.

### Modified Capabilities
- `homepage`: scroll-animated text gains a resting-state contrast requirement, and the homepage a11y smoke (zero serious/critical axe violations) becomes a passing, deterministic gate.

## Impact

- **Affected code**: `app/(frontend)/layout.tsx` (metadata + `html lang`), `app/icon.png`, `app/apple-icon.png`, `app/manifest.ts`, CSS modules of `why-that-works`, `services`, `how-it-works`, `join-cta` (+ their progress-text tokens), `e2e/home.e2e.ts`.
- **SEO**: titles change site-wide (Satūs suffix disappears); `lang`/locale corrections improve language targeting for a Polish audience. Coordinate with `migrate-wp-content` launch-day checks.
- **No dependencies added or removed.**
