# Design: add-partner-cover-lockup

## Context

All three partner covers render through one component, `PartnerCover` in `app/(frontend)/uslugi/[slug]/service-page.tsx` (~line 431), styled by the `.partnerCover*` block in `service.module.css`. Today the logo branch renders a single `<Image>` inside `.partnerLogo`, sized by width (`clamp(150px, 24vw, 240px)`), which already makes SEOFly (3.9:1) render optically smaller than DIEA (3.1:1). Per-partner accent colours exist as `--accent` on `.partnerCover[data-partner=…]`.

All visual decisions were made on a live mock with the real assets (40 px / 1.2× / cream ×, orange "social", -13% nudge): https://claude.ai/code/artifact/a0109453-2075-4b5d-9e0a-067b2a032c2a — treat the mock as the visual reference for implementation.

## Goals / Non-Goals

**Goals:**

- Replace the partner-only logo with a `partner × Social Lama` lockup on all three covers, both locales.
- Height-based sizing so the pair holds one optical line on every page.
- Ship the duotone Social Lama asset (orange "social", cream "lama" + llama).

**Non-Goals:**

- No changes to the non-video `Partner` variant (currently unused — no service data omits `video`).
- No changes to taglines, copy, kicker, scrim, or the video/poster pipeline.
- No data-model changes in `lib/content/uslugi*.ts`.
- Not touching the wordmark fallback branch beyond leaving it functional.

## Decisions

1. **Social Lama logo is hardcoded in the component, not added to `PartnerData`.** It is the same constant on every cover; putting it in data would force duplicate entries in both locale files for zero flexibility gain.

2. **New asset `public/assets/sociallama-logo-light.svg`** — copy of `public/assets/logo.svg` with the first `#FBFAF6` path (the word "social") recoloured to `#F09B39`. The verified file ships with this change at `openspec/changes/add-partner-cover-lockup/assets/sociallama-logo-light.svg`; copy it into `public/assets/` rather than regenerating. Keep `logo.svg` untouched (used by `join-cta` CSS and home content).

3. **Height-based sizing via CSS custom property.** `.partnerLockup { --ph: <height> }`, partner `img` gets `height: var(--ph)`, Social Lama `img` gets `height: calc(var(--ph) * 1.2)`. Desktop `--ph` = 40 px, scaled with a clamp for mobile (e.g. `clamp(32px, 4.5vw, 40px)` — verify at 390 px viewport that SEOFly + × + Social Lama still fit one line; the mock measured ~240 px total at 40 px height, so it fits with room).

4. **Optical nudge:** Social Lama `img` gets `transform: translateY(calc(var(--ph) * -0.13))`. The stacked lockup's visual mass sits low against wide wordmarks when geometrically centred; -13% of partner height levelled it on the mock (user pushed it up from an initial -7%).

5. **× separator is a text glyph (U+00D7), not an asset.** `font-size: calc(var(--ph) * 0.52)`, Manrope regular, `color: var(--color-cream)`. Cream was chosen over the per-partner accent on the mock — the accent × read too quiet and the cream glyph sits neutrally between the two marks.

6. **Accessibility: one labelled unit.** The lockup container carries `role="img"` + `aria-label="${data.name} × Social Lama"`; both inner images get empty `alt` and the × glyph `aria-hidden`. Two labelled images with a decorative glyph between them would read as three fragments in a screen reader.

7. **Next `<Image>` vs plain `img` for the SVG:** use the same `Image` primitive as the current logo for the partner PNGs (keeps optimizer behaviour), and pass the SVG through it too if the primitive accepts SVG cleanly; SVGs are served as-is by the optimizer. Match whatever the primitive's API needs (`width`/`height` from the SVG's 105×73 viewBox).

## Risks / Trade-offs

- [Reveal animation] The lockup replaces one `data-reveal-item` element; keeping the container as the single reveal item preserves the stagger order. Do not put reveal attributes on both inner images or the pair fades in twice.
- [Mobile wrap] If the pair ever wraps at very narrow widths, `flex-wrap: nowrap` plus the height clamp keeps it on one line; verify at 360 px.
- [Optimizer + SVG] If `next/image` balks at the SVG (repo memory: media collection rejects SVG, but that is Payload uploads, not `public/`), fall back to a plain `<img>` inside the lockup — it is `aria-hidden` anyway and needs no responsive variants.
- [e2e] `e2e` content guards may assert on the partner section; check `tests/` for selectors touching `.partnerLogo` and update them to the lockup container.

## Open Questions

None — all visual decisions were closed on the mock (40 px, 1.2×, cream ×, orange "social", -13% nudge).
