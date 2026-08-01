# Proposal: add-partner-cover-lockup

## Why

The partner covers on `/uslugi/kampanie-reklamowe` (SEOFly), `/uslugi/kreacje-wideo` (DIEA) and `/uslugi/influencer-marketing` (Folks) show only the sibling agency's logo, which reads as "their service", not "our joint offer". The boss wants the covers to emphasise that Social Lama works TOGETHER with the sibling agency: a smaller partner logo paired with the Social Lama logo as a `PARTNER × SOCIAL LAMA` lockup. Decisions were made on a live mock (2026-08-01): 40 px partner logo height, Social Lama at 1.2× that height with an upward optical nudge (~13% of partner height), the × in cream, and a new duotone Social Lama logo variant with "social" in brand orange.

## What Changes

- The `PartnerCover` component renders a joint logo lockup — partner logo, an `×` separator, then the Social Lama logo — instead of the partner logo alone.
- Logo sizing flips from width-based (`clamp(150px, 24vw, 240px)` wide) to height-based: partner logos at 40 px desktop height (scaled down responsively), so all three partners share one optical line despite different aspect ratios (SEOFly 3.9:1, DIEA 3.1:1, Folks 3.2:1). Net effect: every partner logo gets smaller than today.
- Social Lama's stacked lockup renders at 1.2× the partner height (stacked lockups need extra height to match the optical weight of wide wordmarks) with a ~13% upward nudge for optical vertical centring.
- The `×` separator renders in cream, matching the logos rather than the per-partner accent.
- New asset `public/assets/sociallama-logo-light.svg`: the existing cream `logo.svg` with the "social" path recoloured to brand orange `#f09b39` (mirrors the colour logo's orange/plum duotone). Already generated and verified on the mock.
- The lockup is one accessible unit ("SEOFly × Social Lama"), not two separate images with a decorative glyph between them.
- The wordmark fallback (no partner logo asset) keeps its current behaviour; partner taglines and copy are untouched.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `services-pages`: the partner cover's logo requirement changes — a partner-only logo becomes a partner × Social Lama lockup with defined relative sizing, accent-coloured separator, and joint accessible name.

## Impact

- `app/(frontend)/uslugi/[slug]/service-page.tsx` — `PartnerCover` lockup markup.
- `app/(frontend)/uslugi/[slug]/service.module.css` — `.partnerLogo` replaced by height-based lockup rules.
- `public/assets/sociallama-logo-light.svg` — new asset; the verified file ships with this change at `openspec/changes/add-partner-cover-lockup/assets/sociallama-logo-light.svg`.
- No data changes: `lib/content/uslugi.ts` / `uslugi.en.ts` stay as-is (the Social Lama logo is constant, so it lives in the component); both locales inherit the change.
- Reference mock: https://claude.ai/code/artifact/a0109453-2075-4b5d-9e0a-067b2a032c2a
