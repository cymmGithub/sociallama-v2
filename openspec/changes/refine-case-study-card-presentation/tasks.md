## 1. Logo asset pipeline

- [ ] 1.1 Add `assets-src/case-study-logos/monochrome.py`: for each `public/case-studies/<slug>/<slug>-logo.png`, key the mark out by **distance from the sampled background colour**, paint it black, trim to the ink bbox, and write `<slug>-logo-mono.png` alongside the colour original. Carry the rationale comments from `design.md` — the darkness-only and darkness-or-chroma formulations both fail in ways that look correct on a subset.
- [ ] 1.2 Gate the background subtraction on a **ring-uniformity** test rather than ring alpha, so tightly-cropped marks that bleed to the frame edge (`asus`, `pracuj-pl`, `irobot`) are not eaten by their own antialiasing.
- [ ] 1.3 For sources with real transparency, measure distance on the raw RGB and multiply by alpha — do not flatten first, or soft-alpha marks wash to mid-grey and key out as half-ink.
- [ ] 1.4 Add the `FORCE_BAKED` override for `mazurska-manufaktura-alkoholi`, `mercator`, `adamed`, with a comment stating why a sixth heuristic was rejected.
- [ ] 1.5 Emit a per-logo metadata file (dimensions, aspect ratio, inked-area fraction) for the optical normalisation in §3.
- [ ] 1.6 Rasterise `/mem/logo-ski-booking.svg` via `inkscape` at high resolution, blacken, trim, and write `public/case-studies/skibooking/skibooking-logo-mono.png`. Note in the script why SVG cannot be uploaded directly (Payload rejects `application/xml`).
- [ ] 1.7 Run the pipeline and **review all 48 outputs on a white contact sheet**. Confirm only the three known defects (`adamed`, `imid-cmv`, `vobis`) remain; any fourth regression means a threshold moved and must be investigated, not accepted.

## 2. Upload

- [ ] 2.1 Extend `lib/payload/refresh-case-study-logos.ts` to prefer `<slug>-logo-mono.png` when present, falling back to `<slug>-logo.png`. Keep the colour originals in the repo — for several clients they are the only copy held.
- [ ] 2.2 Run against the dev DB, **twice**, per the script's own header comment. Verify no filename matches `/-\d+\.png$/`.
- [ ] 2.3 Confirm `skibooking` now resolves a `client.logo` and no longer takes the text-fallback branch.

## 3. Logo presentation (Phase 1)

- [ ] 3.1 In `case-studies.module.css`, replace `.cardLogo`'s height-lock with a fixed box + `object-fit: contain`, left-aligned, matching the `components/ui/brand-belt` pattern.
- [ ] 3.2 Apply the per-logo optical scale factor from §1.5, clamped to `[0.72, 1.35]`. If this is judged not worth its data dependency at review, drop it — the fixed box alone is still a large improvement and nothing else depends on the factor.
- [ ] 3.3 Switch the card surface to white via a **token**, not a literal — `--surface-2` is `color-mix`-derived and a hardcoded `#fff` breaks under any other `data-theme`. Re-check `--line` / `--line-strong` contrast against the new surface.
- [ ] 3.4 Apply the same slot treatment to the detail page (`case-study.module.css` `.clientLogo`) and **remove the `border-radius` / `overflow: hidden` tile-rounding hack** at lines ~52-62 along with its comment — it exists solely to disguise baked backgrounds that no longer exist.
- [ ] 3.5 Confirm the visually-hidden client name and the text fallback branch both still work; neither is affected by the asset change but both are load-bearing for a11y/SEO.

## 4. Header treatment (Phase 2)

- [ ] 4.1 In `case-studies.module.css`, add the stage backdrop to the card media slot, ported verbatim from `why-that-works.module.css:74-125`: `linear-gradient(160deg, var(--color-plum-dark), var(--color-plum) 65%)`, the orange glow blob `::before`, and the 700px `feTurbulence` grain `::after` at `opacity: .38` / `mix-blend-mode: soft-light`.
- [ ] 4.2 Carry across the comment explaining that `background-size: 700px 700px` is fixed **on purpose** — it is what keeps noise density identical across differently-sized panels. Setting it to `cover` silently breaks the match with the homepage.
- [ ] 4.3 Add `> * { position: relative; z-index: 1 }` so the artefact and metric paint above the grain `::after`, as the homepage module does.
- [ ] 4.4 In `case-study-card.tsx`, render the cover as a framed artefact on the stage with the study's headline metric. Confirm where the metric comes from — if no suitable field exists on the collection, either omit it or raise it before inventing one, since the proposal commits to no schema change.
- [ ] 4.5 Add a fourth "keep in sync by hand" cross-reference to the three existing stage modules, per house convention — unless the extraction question in the proposal's Non-Goals is decided the other way first.

## 5. Verification

- [ ] 5.1 Typecheck + Biome clean (filter with `--diagnostic-level=error`; `module_resolver` panics are pre-existing and non-fatal).
- [ ] 5.2 **Inspect all 48 cards, not a sample.** The predecessor change shipped this exact regression because a three-logo spot-check stood in for a full-set check. Every logo must read as a clean black mark on white with no plate, and no mark may be clipped by its slot.
- [ ] 5.3 Verify the same 48 on the detail pages, confirming the removed corner-rounding did not expose anything.
- [ ] 5.4 Compare a card's stage backdrop against a homepage stage section side by side — gradient, glow placement and grain density must match. Confirm the grain did not scale with the panel.
- [ ] 5.5 Check `/en/case-studies` and one English detail page; both inherit the shared card, so confirm rather than assume.
- [ ] 5.6 Check mobile (single column) and the 2-column breakpoint: the artefact composition and logo slot must hold at card widths well below desktop.
- [ ] 5.7 Confirm the three known defects are the *only* remaining ones and file the follow-up to request vectors for `adamed`, `imid-cmv`, `vobis`.
