# fix-footer-reveal-overflow — tasks

## 1. Reproduce and baseline

- [ ] 1.1 Run a Playwright probe (Chromium + WebKit, playwright-core against this worktree's dev server) at 1280×715, 1440×760, 1440×815, 1728×1085 capturing: OFERTA sub-column count, footer height, wordmark top vs header bottom. Save the script under `e2e/` or scratch — it is the before/after harness for every later task.

## 2. OFERTA two-column split (design D1)

- [ ] 2.1 In `footer.module.css`, replace the `.links[data-cols="2"]` auto-fill flow with an explicit two-track grid (`repeat(2, minmax(0, 1fr))`) for the ≥1200px band; keep the 800–1199px band's existing two sub-columns.
- [ ] 2.2 Allow link labels to wrap without clipping (drop any nowrap inheritance; check `width: fit-content` on `.link` against wrapped lines) and QA the two long PL labels wrap cleanly.
- [ ] 2.3 If 1200–1300px shows excessive wrapping, rebalance the five-track split (give OFERTA ~1.7fr at NAWIGACJA/USŁUGI's expense) and re-QA both locales.

## 3. Reveal safety (design D2 + D3)

- [ ] 3.1 Measure the post-split footer content height at laptop widths (probe from 1.1), then gate the desktop reveal block behind `@media (height >= <measured + headroom>)` so shorter windows render the footer in normal flow. Keep the gated block below the rules it overrides (media queries add no specificity).
- [ ] 3.2 Retune `.wordmark` `max-height: calc(100dvh - 32rem)` — recompute the constant from the measured post-split "rest of footer" height and update the comment with the new numbers.

## 4. Verify

- [ ] 4.1 Re-run the 1.1 probe: two OFERTA sub-columns at 1280/1440/1512 widths, wordmark below header bottom at all four viewports, in both engines.
- [ ] 4.2 Visually screenshot the settled footer at 1440×760 and 1728×1085 in both locales (PL + EN) and confirm rhythm/wrapping looks intentional.
- [ ] 4.3 Run `bun run check` and the e2e suite from the worktree; confirm no footer-geometry assertions regressed.
