## 1. Measure

- [ ] 1.1 Write `lib/styles/scripts/audit-tokens.ts`: walk `app/`, `components/`, `lib/` for `*.module.css`; print per-property distinct values with counts (font-size, padding/gap/margin, border-radius, box-shadow, transition/animation durations, hex colours); add a `styles:audit` script to `package.json`. Verify: output reproduces the 2026-09-11 baseline (442 font-size declarations, 178 distinct; 531 distinct spacing; ~25 shadows; 8 durations).
- [ ] 1.2 Locate the single consumer of the existing type-scale classes (`h1`/`h2`/`p`/`p-big`/`caption`/`cta`/`link`) and record its computed font-size, weight and line-height at 375px and 1440px.
- [ ] 1.3 Check whether any existing class uses a Tailwind default `rounded-*` or `shadow-*` utility; decide between resetting the namespace and prefixing tokens `--radius-sl-*` (design D2/risks).
- [ ] 1.4 Capture before-screenshots of `/`, one case study, one blog post at 375px and 1440px (headless Chromium, `ignoreCache`), stored in the scratchpad.

## 2. Extract

- [ ] 2.1 Cluster font sizes by role and pick canonicals per design D4; write the roles (`display`, `title`, `lead`, `body`, `small`, `caption`, `label` at minimum) into `lib/styles/typography.ts`, removing the Satus defaults. Run `bun setup:styles`.
- [ ] 2.2 Cluster radii, shadows and durations; write `lib/styles/css/tokens.css` as a hand-authored `@theme` block (`--radius-*`, `--shadow-*`, `--duration-*`) and import it from `css/index.css`.
- [ ] 2.3 Read the context of the near-miss hexes (`#d9812a`, `#a83c65`, `#8d2f53`) and the other non-brand literals; classify each as social-brand colour, deliberate shade, or drift. Record, change nothing.
- [ ] 2.4 Derive the spacing rhythm from the inventory (which steps dominate, section paddings by chapter, gap conventions). Document only; no spacing tokens unless a clear scale emerges.

## 3. Document

- [ ] 3.1 Write `DESIGN.md` (under ~300 lines): palette with role + origin table; chapter themes; type roles; spacing rhythm; radius/elevation tiers with tokens; motion (durations, easings, reduced-motion rule); layout grid (4/12 columns, 16px gap and safe, 800px breakpoint, header heights); iconography (Lucide only) and imagery rules (`.shot` 18px, baked mockup radii, pointer to `CLAUDE.md`); component vocabulary (button, pill, chip, card, band); standing rules with enforcement pointers; "existing variants, do not reuse" list; inventory date.
- [ ] 3.2 Add `## Design Context` (≤ ~15 lines) to project `CLAUDE.md`: palette, faces, chapter themes, the two hard rules, "read `DESIGN.md` before styling".
- [ ] 3.3 Add a `DESIGN.md` row to `AGENTS.md` Documentation Map and a pointer in `lib/styles/README.md` (tokens.css alongside easings.css; `styles:audit`).
- [ ] 3.4 Apply the `brand-theme` spec delta (the change's `specs/brand-theme/spec.md` is folded in at archive).

## 4. Verify

- [ ] 4.1 `bun run check` passes (Biome, TypeScript, styles setup); `bun run build` passes; revert the Blob-stripping `importMap.js` side effect before staging.
- [ ] 4.2 Compare after-screenshots against 1.4 for the three pages at both widths: pixel-identical. Confirm the 1.2 consumer's computed values are unchanged.
- [ ] 4.3 `bun run styles:audit` output matches the counts quoted in `DESIGN.md`.
