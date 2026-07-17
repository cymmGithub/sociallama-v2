## 1. Site metadata

- [x] 1.1 Replace Satus branding in `app/(frontend)/layout.tsx`: literal Social Lama name/description constants (drop the `package.json`-derived values), `title.default`/`title.template`, `applicationName`, OG `siteName` + `locale: 'pl_PL'`, remove `en-US` alternates, set `html lang="pl"`; check `lib/utils/metadata.ts` defaults for the same starter strings
- [x] 1.2 Verify: homepage + a blog post render "… — Social Lama" titles, `lang="pl"`, `og:locale pl_PL`, and `grep -r "Satūs" app lib` in rendered surfaces comes back empty; `bun run check` green
- [x] 1.3 Replace starter favicons with the sociallama.pl llama mark (`app/icon.png` ← 192px, `app/apple-icon.png` ← 180px) and re-brand `app/manifest.ts` (Social Lama name/description, icon sizes matching the actual assets); verify rendered icon links and `/manifest.webmanifest`

## 2. Resting contrast pass

- [x] 2.1 Classify each flagged element per design D2 (readable-at-rest vs decorative ghost): `why-that-works` progress-text, `services` eyebrow/columns, `how-it-works` subhead + heading lines, `join-cta` sponsored-card identity
- [x] 2.2 Raise resting colors of the readable-at-rest class to AA in their CSS modules (keep the scrub brighten effect); screenshot-compare each section against the pre-change look for visual sign-off
- [x] 2.3 Verify with a targeted axe scan that only the documented decorative selector still reports contrast at rest

## 3. Deterministic a11y gate

- [x] 3.1 Update `e2e/home.e2e.ts`: reduced-motion emulation, instant scroll through the document to settle reveals/scrubs, then axe scan excluding only the decorative progress-text selector (with a comment pointing at the design rationale)
- [x] 3.2 Verify `bun run test:e2e` passes three consecutive runs; introduce a deliberate low-contrast element locally to confirm the gate still fails on real regressions, then revert it
