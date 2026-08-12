# fix-footer-reveal-overflow — tasks

## 1. Reproduce and baseline

- [x] 1.1 Run a Playwright probe (Chromium + WebKit, playwright-core against this worktree's dev server) at 1280×715, 1440×760, 1440×815, 1728×1085 capturing: OFERTA sub-column count, footer height, wordmark top vs header bottom. Save the script under `e2e/` or scratch — it is the before/after harness for every later task.

## 2. OFERTA two-column split (design D1)

- [x] 2.1 In `footer.module.css`, replace the `.links[data-cols="2"]` auto-fill flow with an explicit two-track grid (`repeat(2, minmax(0, 1fr))`) for the ≥1200px band; keep the 800–1199px band's existing two sub-columns.
- [x] 2.2 Allow link labels to wrap without clipping (drop any nowrap inheritance; check `width: fit-content` on `.link` against wrapped lines) and QA the two long PL labels wrap cleanly.
      *No CSS change needed: the list links compute to `display: inline`, so `width: fit-content` is inert on them and text simply wraps. Probe (1200/1280/1440) shows zero clipping — every label's line boxes end inside its cell — and the global `text-wrap: pretty` breaks both long PL labels evenly (111/114px, 113/93px).*
- [x] 2.3 If 1200–1300px shows excessive wrapping, rebalance the five-track split (give OFERTA ~1.7fr at NAWIGACJA/USŁUGI's expense) and re-QA both locales.
      *Not triggered — at 1200 and 1280 exactly the two long PL labels wrap to two lines, the ten others stay on one. That is the wrapping D1 budgeted for, so the five-track split stays as it is.*

## 3. Reveal safety (design D2 + D3)

- [x] 3.1 Measure the post-split footer content height at laptop widths (probe from 1.1), then gate the desktop reveal block behind `@media (height >= <measured + headroom>)` so shorter windows render the footer in normal flow. Keep the gated block below the rules it overrides (media queries add no specificity).
      *Gate is split out of the desktop block (padding/gap stay ungated) and placed after it. It carries one threshold per band, comma-ORed, because the bands are two height regimes: the five-track row (≥1200px wide) measures 609px at 1200px and 754px at 1920px, so `height >= 700px`; the two-column block (800–1199px) runs 1052px at 800px wide to 1133px at 1199px — nearly double — so `height >= 1200px`. A single 700px threshold, which is what this task first shipped, left the whole 800–1199px band revealing with the wordmark ~240px above the viewport top, fully off-screen. Probed at both boundaries in both engines: 1280×699 static / 1280×700 sticky, 1199×1199 static / 1199×1200 sticky. The fallback was confirmed usable rather than assumed — at 800, 1024 and 1199px wide, scrolling up puts the whole wordmark clear of the header inside the viewport.*
- [x] 3.2 Retune `.wordmark` `max-height: calc(100dvh - 32rem)` — recompute the constant from the measured post-split "rest of footer" height and update the comment with the new numbers.
      *The flat constant was the wrong shape, not just the wrong number: "rest of footer" is 464px at 1200px wide but 655px at 3440px, because the whole pad/gap chain derives from `--safe`, itself a vw. Measured fit `rest ≈ 22.5rem + 8.6vw`, so the cap is now `calc(100dvh - 24rem - 8.75vw)`. Also retuned the desktop `padding-top` to `calc(var(--safe) * 2 + 4.5rem)`: the header is `padding: var(--safe)` around ~53px, so it outgrew the flat 6.5rem above ~2295px and clipped the wordmark at 2560×720 — the same requirement, one width band out.*

## 4. Verify

- [x] 4.1 Re-run the 1.1 probe: two OFERTA sub-columns at 1280/1440/1512 widths, wordmark below header bottom at all four viewports, in both engines.
      *Harness landed as `lib/scripts/audit-footer-geometry.ts` (repo audit-script convention, not the loose `scripts/` file the task suggested). 12 viewports × 2 engines, all clear. Two harness corrections worth noting: the clip check reads the text's own line boxes, because the links are inline `<a>` and `scrollWidth` is always 0 on those — the first version reported zero clipping trivially; and the overlap check is conditioned on the reveal being engaged, since in normal flow a wordmark above the viewport top at the page bottom is just content already scrolled past. It also asserts the underlying invariant directly — content height ≤ window height whenever sticky.*
- [x] 4.2 Visually screenshot the settled footer at 1440×760 and 1728×1085 in both locales (PL + EN) and confirm rhythm/wrapping looks intentional.
      *Sheet published at https://claude.ai/code/artifact/bc97cd8a-0269-4825-bff9-e1018a5751b3. Wrapping is confined to the two long PL labels; EN wraps nothing at 1728. The one visible cost is rhythm — a wrapped label makes its whole grid row taller, so OFERTA's last two rows sit below the six-row beat of the columns beside it. Left as designed; an optional `1.5fr → 1.7fr` rebalance would unwrap both from ~1700px up but not at 1440.*
- [x] 4.3 Run `bun run check` and the e2e suite from the worktree; confirm no footer-geometry assertions regressed.
      *`bun run check` green (Biome, tsc, 648 unit tests, manifest — exit 0). E2E: 75 passed, 4 skipped, 1 failed — `sitemap-crawl` on `/api/media` 400s under load, the standing pre-existing flake, with no footer assertion among the failures. An earlier run showed 18 failures, all navigation timeouts: the worktree dev server on :3004 died mid-suite (log ends mid-request, no trace) and Playwright had reused it. The clean re-run booted its own server.*
