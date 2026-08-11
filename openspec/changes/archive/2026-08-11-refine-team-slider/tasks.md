# Tasks — refine-team-slider

## 1. Portrait generation (this session, 2026-08-11)

- [x] 1.1 Verify the six cuts are baked into the PNGs, not CSS (alpha edge scan; boxes match image aspect exactly)
- [x] 1.2 Confirm no raw sources exist in repo/git; confirm 4/6 homepage avatars are complete cutouts
- [x] 1.3 Fire the approved batch: 4× `nano_banana_pro` 2:3 (avatar route) + 2× `outpaint_image` 1:1 (reconstruction route)
- [x] 1.4 Collect results; present a current-vs-expanded side-by-side artifact for user review
- [x] 1.5 Retake any generation the user rejects — Katarzyna pose-pinned retake generated 2026-08-11 (job `94673df6`), awaiting user verdict. Route change: raws surfaced in `~/Downloads` for Emilia, Paulina, Agnieszka — their batch-1 generations discarded; Emilia + Agnieszka shipped from raws, Katarzyna has no raw

## 2. Cutout pipeline

- [x] 2.1 Run bria-rmbg + decontam on each approved source (pipeline script: session scratchpad `team-fix/pipeline.py`)
- [x] 2.2 Frame to 422×600: head-width anchor solved down from 0.42 until all rows above the hip line fit with ~6 px margin; head-top ≈0.06·H; subject reaches row 599
- [x] 2.3 Verify alpha edges per portrait: no contact above elbow height, no mid-frame terminations, `alpha[-1]` coverage present
- [x] 2.4 Contact sheet on plum #913155 (new three + untouched Anna/Piotr) published in the review artifact
- [x] 2.5 SHIPPED 2026-08-11: `aleksander-dyminski.png`, `emilia-metryka.png`, `agnieszka-klajbert.png` (Next image cache cleared; user hard-refreshes `/o-nas`)
- [x] 2.6 Przemysław + Paulina: downward outpaints approved and fired 2026-08-11 (jobs `9f3ddf89`, `c62b257b`, ~4 credits); pipelined (Paulina +5 px x-shift to clear a 4 px hem taper at the left edge) and SHIPPED — all six portraits now replaced
- [x] 2.8 Przemysław width-squeeze retake (user-caught): auto-sized outpaint `9f3ddf89` had compressed his face to ~91% width (template-correlation anisotropy 0.912 vs the approved 1:1); re-fired with explicit dims (job `96bf2850`, ~2 credits) → anisotropy 0.993, re-pipelined and SHIPPED. Chain verified: first outpaint vs git original = 1.000
- [x] 2.7 Katarzyna: retake approved 2026-08-11; mirrored to face left per direction call, pipelined and SHIPPED (frac 0.40, grounded, edges clear)

## 3. Peer-wash fix (code)

- [x] 3.1 Add the inline SVG `feColorMatrix` filter def (flat wash colour, alpha preserved; id outside any `'use client'` barrel; matrix constants commented as derived from the plum tokens)
- [x] 3.2 In `Trio`, replace the `--peer-src` style with a stacked wash `<Image>` per peer — identical `src`/`fill`/`sizes` props to the photo layer
- [x] 3.3 Replace `.peer::after` mask rules with wash-layer rules (`opacity: 0.66`; photo layer keeps `saturate(0.6)`/`opacity: 0.9`)
- [x] 3.4 Delete the now-unused `--peer-src` plumbing

## 4. Verification

- [x] 4.1 Cold-cache deep link (home team grid → `/o-nas?lama=…#zespol`): peers paint washed on their first frame — throttled network, Chromium. 40-frame burst; every frame with the peer visible measures within 2/255 of the settled wash, against a 37/255 gap to the wash-suppressed baseline
- [x] 4.2 Same check in WebKit (`filter: url(#…)` support; Safari-is-not-optional rule) — filter resolves, peer washed on its first painted frame, settled colour within 0.6/255 of Chromium. The def `<svg>` is zero-sized rather than `display: none`, which WebKit will not resolve into
- [x] 4.3 Step the slider through all 15: 30/30 peer layer pairs share one `currentSrc`; zero raw `/o-nas/slider/*.png` requests in either engine (1 stray request across 15 Chromium steps — the warmers hold the variant)
- [x] 4.4 Screenshot both surfaces (slider + homepage grid) for the six replaced portraits; re-measured alpha edges on the shipped files — all six pass bottom-bleed / no-high-side-cut / no-mid-frame-termination. Published: https://claude.ai/code/artifact/34e2a6cf-7903-450a-b394-a72320fe090d
- [x] 4.5 `bun run check` green (exit 0 — 648 unit tests, typecheck, manifest; the Biome
      panics are the five known pre-existing ones). e2e: 75 passed, 4 skipped, 1 failed —
      `sitemap-crawl.e2e.ts` on 400s from case-study media
      (`/case-studies/{kbp,luisse,mmhygienic,fundacja-saventic,imid-cmv}` + their `/en`
      twins). **Accepted by the user as the known standing local-only failure.** No
      `/o-nas` route failed and case-study pages do not render the team section; it does
      not reproduce on demand once the dev image cache is warm, so it was not isolated
      with a before/after run.
