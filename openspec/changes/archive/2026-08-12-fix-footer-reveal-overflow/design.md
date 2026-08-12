# fix-footer-reveal-overflow — design

## Context

The footer's desktop reveal (`footer.module.css`) pins the footer with `position: sticky; bottom: 0; min-height: 100dvh` so the page scrolls up to uncover it. The design carries an unstated invariant: **footer content must fit one viewport**. A sticky-bottom element taller than the viewport necessarily extends above the viewport top — there is no partial failure mode, the wordmark just slides under the fixed header.

The invariant breaks because the OFERTA sub-column flow never engages on laptops. `.links[data-cols="2"]` is `repeat(auto-fill, minmax(11rem, 1fr))` with a 2rem gap: two tracks need 384px, but OFERTA's `1.5fr` share of the 5.6fr body row only reaches 384px above a ~1663px viewport. Measured on :3003 (Chromium and WebKit agree to the pixel):

| viewport | OFERTA cell | sub-columns | footer height | overlap |
|---|---|---|---|---|
| 1280×715 | 281px | 1 | 785px | **yes** (wordmark y=34, header ends y=81) |
| 1440×760 | 331px | 1 | 815px | **yes** (wordmark y=49) |
| 1440×815 | 331px | 1 | 815px | no — exactly fits |
| 1728×1085 | 420px | 2 | 1085px | no |

1440×760 is a *default Safari window on a 1440×900 MacBook* — this is the common case, not an edge.

The existing `site-footer` spec explicitly blessed the single column at mid-range widths ("Forcing two sub-columns … is explicitly NOT required") on the grounds that two *non-wrapping* tracks need 478px. That reasoning conflated "no truncation" with "no wrapping"; the consequence (footer taller than the viewport → reveal overlap) was not seen.

## Goals / Non-Goals

**Goals:**

- OFERTA renders two sub-columns at every width in the five-track band (≥1200px), so the footer fits a 760px-tall viewport.
- The reveal degrades to normal flow instead of overlapping the header whenever footer content still cannot fit the viewport height.
- Verified in both Chromium and WebKit at the four viewports in the table above.

**Non-Goals:**

- No markup or content changes; `index.tsx` and the chrome content modules stay untouched.
- No change to the mobile (<800px) or two-column (800–1199px) bands — both already behave.
- No redesign of the reveal itself; the brightscout-style uncover stays the desktop default.

## Decisions

### D1 — Force two sub-columns at ≥1200px; allow long labels to wrap

Replace the auto-fill flow with an explicit `repeat(2, minmax(0, 1fr))` for `.links[data-cols="2"]` inside the five-track band, and let labels wrap (`text-wrap: balance` or plain wrapping on the link). Rationale: auto-fill with a rem floor makes the column count a function of viewport width × font size — that indirection is what silently produced one column on every laptop. An explicit 2 is predictable and matches what the 800–1199px band already does. The two long labels („Hotele i Miejsca Wypoczynkowe", „Nieruchomości i Deweloperzy", 220–223px at 0.95rem mono) wrap to two lines in a ~150–190px track; every other label fits on one line.

*Alternative considered:* rebalance the body tracks so OFERTA reaches 478px and nothing wraps. Rejected: at 1280px viewport the whole body row is ~1080px, so OFERTA would need ~44% of the row — the other four cells (including the invite with its CTA button) can't give that up. Wrapping two labels is the cheaper cost.

*Complement:* still nudge the split (e.g. `1.2fr 0.9fr 0.9fr 1.5fr 1.1fr` → giving OFERTA ~1.7fr at NAWIGACJA/USŁUGI's expense) if visual QA shows excessive wrapping at 1200–1300px; exact numbers are an implementation detail tuned against the live grid.

### D2 — Height-gated fallback as the safety net

Wrap the reveal block (`position: sticky; bottom: 0; z-index: 0; min-height: 100dvh`) in a height media query so short windows get normal in-flow rendering: `@media (--desktop) and (height >= <threshold>)`. Threshold = measured post-D1 footer content height plus margin (expected ≈ 700–720px; fix the number from the live probe during implementation, not from this estimate). Below it the footer scrolls normally — no reveal, no overlap, nothing hidden.

*Alternative considered:* JS measurement toggling a class when `footer.scrollHeight > innerHeight`. Exact, but adds a resize listener and a hydration dependency to solve what a static gate covers; the failure it guards (content taller than viewport) is now geometry we control.

*Note:* the reduced-motion module-order rule applies — the fallback block must sit below the rules it cancels, since media queries add no specificity.

### D3 — Retune the wordmark height cap to the new content height

`.wordmark { max-height: calc(100dvh - 32rem) }` encodes the old "rest of footer ≈ 27rem" assumption. After D1 the rest shrinks (~5 fewer link rows); recompute the constant so the wordmark keeps claiming the leftover height on tall viewports instead of undershooting. Same measured-not-estimated discipline as the existing comment block demands.

## Risks / Trade-offs

- [Wrapped labels change OFERTA's rhythm — two entries become two-liners] → wrap with a hanging visual (balanced wrap on a `width: fit-content` link), and QA both locales; EN labels are shorter and mostly unaffected.
- [Height threshold in D2 is static; zoom or font settings shift real content height] → choose the threshold with ~10% headroom above measured content height; the failure mode past the gate is the *old default behavior* (in-flow footer), which is safe.
- [The five-track proportions at 1200–1300px get tight if OFERTA grows] → tune `fr` values against the live grid; the invite block's `max-width: 34ch` already stops it hogging its track.
- [`e2e` sitemap crawl or visual baselines may assert current footer geometry] → run the e2e suite from the worktree (config reads `.worktree-meta.json`) before close-out.

## Open Questions

None — both mechanisms are reproduced and the fixes are CSS-local.
