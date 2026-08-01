# Tasks: add-partner-cover-lockup

## 1. Asset

- [x] 1.1 Copy `openspec/changes/add-partner-cover-lockup/assets/sociallama-logo-light.svg` to `public/assets/sociallama-logo-light.svg` (do not regenerate; do not touch `logo.svg`)

## 2. Lockup implementation

- [x] 2.1 In `PartnerCover` (`app/(frontend)/uslugi/[slug]/service-page.tsx`), replace the single-logo branch with the lockup: container with `role="img"` and `aria-label={`${data.name} × Social Lama`}`, containing the partner logo (empty alt), an `aria-hidden` `×` glyph (U+00D7), and the Social Lama logo (empty alt); keep the container as the single `data-reveal-item` so the reveal stagger fires once
- [x] 2.2 In `service.module.css`, replace `.partnerLogo` width-based sizing with height-based lockup rules: `--ph: clamp(32px, 4.5vw, 40px)`; partner img `height: var(--ph); width: auto`; Social Lama img `height: calc(var(--ph) * 1.2)` with `transform: translateY(calc(var(--ph) * -0.13))`; × in cream at `font-size: calc(var(--ph) * 0.52)`; `flex` row, centred, `nowrap`, gap ~`clamp(0.8rem, 1.8vw, 1.4rem)`
- [x] 2.3 Keep the no-logo wordmark fallback branch rendering the partner wordmark alone (no lockup, no empty frame)

## 3. Verification

- [x] 3.1 `bun run check` passes
- [x] 3.2 Playwright screenshots of all three covers (`/uslugi/kampanie-reklamowe`, `/uslugi/kreacje-wideo`, `/uslugi/influencer-marketing`) match the mock: same partner-logo height on all three, Social Lama taller (1.2×) and nudged up, cream ×, orange "social" legible over the video/poster
- [x] 3.3 Screenshot at 360 px width — the lockup holds one line on the SEOFly cover (widest logo)
- [x] 3.4 Spot-check one EN counterpart page (e.g. `/en/services/ad-campaigns`) shows the same lockup
- [x] 3.5 Accessibility check: the lockup exposes a single accessible name "<Partner> × Social Lama" (inspect the a11y tree in Playwright)
