## 1. Logo asset pipeline

**Revised after rebasing onto `5a727c4` (`rebuild-client-marquee`)**, which landed
`scripts/client-logos/pipeline.py` and a `client-logo-assets` spec covering
de-matting, crop-to-primary-mark and optical-mass normalisation. §1 was
originally written to add a second, parallel pipeline at
`assets-src/case-study-logos/monochrome.py`; that would have duplicated merged,
already-spec'd machinery. The pipeline is extended instead. See design.md
Decision 6.

- [x] 1.1 Extend `scripts/client-logos/pipeline.py` with a `--case-studies` pass emitting `public/case-studies/<slug>/<slug>-logo-mono.png` for all 48 studies. Reuse `dematte`, `trim`, `ink_area` and `load` unchanged; add only the two things the contract actually differs on — `mono_ink` (flat black) and `place_left` (left-aligned canvas). `--belt` output must stay byte-identical.
- [x] 1.2 Key ink by **distance from the background colour** — not darkness, not `max(darkness, chroma)`; carry the rationale for all three into `mono_ink`. `dematte`'s border-connected flood supplies the plate colour, so the same measure that cleared the border also clears knockouts inside the glyphs, which is what keeps ozgasl's car and mmhygienic's bottle from filling in.
- [x] 1.3 For sources with real transparency, measure distance on the raw RGB and multiply by alpha — do not flatten first, or soft-alpha marks wash to mid-grey and key out as half-ink.
- [x] 1.4 ~~`FORCE_BAKED` override~~ — **not needed.** It existed to rescue three sources from a ring-uniformity gate this pipeline does not have; `dematte`'s border-connected flood handles `mercator` and `mazurska` natively. `adamed` is unrecoverable either way (see 1.7).
- [x] 1.5 ~~Emit per-logo metadata for §3~~ — **superseded.** Optical mass is baked into a fixed canvas by the merged pipeline's own normalisation pass, so the card carries no per-logo data dependency at all. The CSS box must match the canvas aspect ratio or `object-fit: contain` re-fits the mark and undoes it.
- [x] 1.6 Stage the ski-booking vector at `assets-src/client-logos/raw/skibooking.svg` (committed, so the pipeline is re-runnable) and let the existing `load()` rasterise it via `inkscape`. Note why SVG cannot be uploaded directly (Payload sniffs it as `application/xml`).
- [x] 1.7 Inherit `BRANDS`' per-brand **source** decisions where a slug is covered, but not its `gap`/`band`/`keep` crops — those drop secondary lines because they are unreadable at the belt's 44px height, and the card slot is taller. Ten studies gain a better source this way, which **fixes `imid-cmv`** (its repo asset is a crop out of a larger layout carrying a watermark arc).
- [x] 1.8 Run `--case-studies` and **review all 48 outputs on a white contact sheet**. Result: `imid-cmv` fixed; `adamed` and `vobis` remain as predicted; `kbp` is a fourth low-contrast case (dark green on black — faithful to the source, not a threshold artefact). Confirm `--belt` assets are unchanged in `git status`.

## 2. Upload

- [x] 2.1 Extend `lib/payload/refresh-case-study-logos.ts` to prefer `<slug>-logo-mono.png` when present, falling back to `<slug>-logo.png`. Keep the colour originals in the repo — for several clients they are the only copy held. Resolve the media row through the study's own `client.logo` relation rather than a filename guess: `pracuj-pl`'s row is named `pracuj.png` and the stem match misses it entirely.
- [x] 2.2 Run against the dev DB and verify no filename matches `/-\d+\.png$/`. **"Run it twice" turned out to be unsound** — the bump parity is per row, so the 46 rows keeping their name and the 2 rows changing it can never both be clean after a fixed number of passes. The script now re-uploads only the rows that came back bumped; one run converges and a second is a no-op. Both verified.
- [x] 2.3 Confirm `skibooking` now resolves a `client.logo` and no longer takes the text-fallback branch. It had no media row at all, so the script creates one and attaches it. All 48 studies now resolve a `-logo-mono.png`.

## 3. Logo presentation (Phase 1)

- [x] 3.1 In `case-studies.module.css`, replace `.cardLogo`'s height-lock with a fixed box + `object-fit: contain`, left-aligned, matching the `components/ui/brand-belt` pattern. The box **must** carry the emitted canvas's aspect ratio (`CS_BOX_W / CS_BOX_H`), or `contain` re-fits the mark and undoes the baked optical mass.
- [x] 3.2 ~~Per-logo optical scale factor clamped to `[0.72, 1.35]`~~ — **dropped, as the task itself permits.** The merged pipeline normalises optical mass into the asset (scale `sqrt(median / own mass)`, clamped `[0.5, 1.0]` against contain-fit), so there is no per-logo data for the card to carry and nothing to clamp in CSS.
- [x] 3.3 Switch the card surface to white via a **token**, not a literal — `--surface-2` is `color-mix`-derived and a hardcoded `#fff` breaks under any other `data-theme`. Re-check `--line` / `--line-strong` contrast against the new surface.
- [x] 3.4 Apply the same slot treatment to the detail page (`case-study.module.css` `.clientLogo`) and **remove the `border-radius` / `overflow: hidden` tile-rounding hack** at lines ~52-62 along with its comment — it exists solely to disguise baked backgrounds that no longer exist.
- [x] 3.5 Confirm the visually-hidden client name and the text fallback branch both still work; neither is affected by the asset change but both are load-bearing for a11y/SEO. Both untouched. Note the fallback is now unreachable with real data — all 48 studies resolve a logo — but it stays for a future study without one.

## 4. Header treatment (Phase 2)

- [x] 4.1 In `case-studies.module.css`, add the stage backdrop to the card media slot, ported verbatim from `why-that-works.module.css:74-125`: `linear-gradient(160deg, var(--color-plum-dark), var(--color-plum) 65%)`, the orange glow blob `::before`, and the 700px `feTurbulence` grain `::after` at `opacity: .38` / `mix-blend-mode: soft-light`.
- [x] 4.2 Carry across the comment explaining that `background-size: 700px 700px` is fixed **on purpose** — it is what keeps noise density identical across differently-sized panels. Setting it to `cover` silently breaks the match with the homepage.
- [x] 4.3 Add `> * { position: relative; z-index: 1 }` so the artefact and metric paint above the grain `::after`, as the homepage module does.
- [x] 4.4 In `case-study-card.tsx`, render the cover as a framed artefact on the stage with the study's headline metric. The metric is `results[0]` — the collection already has a `results` array (`platform`/`metric`/`value`) fetched at `depth: 2`, so no schema or query change. There is no "featured" flag, so first stands in for most prominent; 47 of 48 studies carry one and the row is omitted for `luisse`, which has none.
- [x] 4.5 Add a fourth "keep in sync by hand" cross-reference to the three existing stage modules, per house convention — unless the extraction question in the proposal's Non-Goals is decided the other way first. Updated `why-that-works` (carries the explicit list) and `how-it-works` (names its siblings); `services.module.css` never cross-referenced anything, so it was left alone rather than given a convention it does not follow.

## 4b. Follow-on request (added 2026-07-27, outside the original scope)

- [x] 4b.1 Add a Lucide `ArrowRight` beside the card's "Zobacz case study" label, nudging on card hover — matching the related-study CTA on the industry pages. User request mid-implementation.

## 5. Verification

- [x] 5.1 Typecheck + Biome clean (filter with `--diagnostic-level=error`; `module_resolver` panics are pre-existing and non-fatal).
- [x] 5.2 **All 48 inspected, not a sample** — every rendered logo slot cropped out of a 1440px full-page capture into one sheet. 96 images on the page, 0 broken, 0 console errors. Every mark reads as a clean black mark on white with no plate; every slot measures exactly 140x36 with the image filling it, so `contain` is not re-fitting anything and nothing is clipped. Needed a dev-server restart first: `listCaseStudies` is `'use cache'`/`cacheLife('days')` and the refresh ran out-of-process, so its `revalidateTag` never reached the running server.
- [x] 5.3 All 48 detail pages verified to render `<slug>-logo-mono.png`; the slot computes `border-radius: 0px` / `overflow: visible`, so the tile-rounding hack is gone. Checked every mark composited on the detail page's sand ground (`#e0ddd3`), where a light residual plate shows far more than on the white card: only `adamed` exposes one, and it is already the tracked defect. Nothing else was uncovered.
- [x] 5.4 All 48 card stages compute `700px 700px` / `0.38` / `soft-light` / `linear-gradient(160deg, rgb(114,35,65), rgb(145,49,85) 65%)` — identical to both homepage stages (`why-that-works` at 672x629 and `how-it-works` at 1408x297) despite the card being 457x285. **The grain did not scale with the panel**, which is the whole point of the fixed `background-size`.
- [x] 5.5 `/en/case-studies` inherits everything — 48 cards, 48 mono logos, 0 broken, same stage values, same 140x36 slot, arrow present, "VIEW CASE STUDY". Note the metric renders in Polish: `results` is localized and `fallback: true` serves the PL value. Not a regression — the EN detail pages are entirely Polish today for the same reason, and the in-flight `add-case-study-en-translations` change will fix all of it at once.
- [x] 5.6 There is no 2-column breakpoint — the grid is 1 column below `--breakpoint-dt: 800px` and 3 above — so the tightest case is just above 800px. At 390px: single column, 357px cards, no horizontal scroll, nothing clipped. At 810px: 258px cards, artefact 232x95, logo slot intact, no overflow. 10 of 48 metric labels ellipsise there, which is the `text-overflow` doing its job; wrapping them instead would vary the artefact height card-to-card, which the flex column exists to prevent.
- [x] 5.7 Confirmed against the full set. `imid-cmv` is **fixed** by re-sourcing. Three remain, all information-loss in the source rather than algorithm problems:
  - `adamed` — soft alpha *over* a mid-tone plate, so `dematte` returns it untouched as "already transparent". Most visible on the sand detail page.
  - `vobis` — two-tone source; the V keys mid-grey against a black OBIS.
  - `kbp` — dark green on black, so the whole mark keys mid-grey. New to the list; faithful to the source, verified not a threshold artefact.

  **Follow-up to file with the client: request vector (SVG/EPS) originals for `adamed`, `vobis` and `kbp`.** Any of the three drops in by adding it to `BRANDS`/`CS_EXTRA_SOURCES` in `scripts/client-logos/pipeline.py` and re-running `--case-studies`; no code change. Recorded in proposal.md's residual-defects table.
