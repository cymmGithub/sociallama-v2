## Why

The site has brand tokens but no visual system: `lib/styles` defines nine colours, three chapter themes and seven Satus-default type styles, while the 62 CSS modules built on top of them carry 442 raw `font-size` declarations (178 distinct values), 531 distinct spacing values, nine radii, ~25 shadows and eight transition durations, with the type-scale classes used exactly once. Every new surface is therefore designed from scratch by whichever session builds it, and drift is invisible. Two months in, the same drift already reached the spec layer: `brand-theme` records `plum-hero` as `#892f53` and Exo 2 as 400/800, while the shipped code is `#913155` and 300/400/700/800.

## What Changes

- **Measure the shipped site.** A re-runnable inventory script under `lib/styles/scripts/` lists every value used per visual property across the CSS modules (font-size, spacing, radius, shadow, duration, hex colours) with occurrence counts, so the extraction is verifiable and future drift is measurable.
- **Extract canonical scales from what is shipped.** Radius, elevation and motion-duration scales become named `@theme` tokens in a hand-authored `lib/styles/css/tokens.css` (the pattern `easings.css` already uses). The Satus-default type styles in `typography.ts` are replaced by the roles the site actually renders. Values come from the site; the brand book is the palette's origin only, and where they disagree the shipped value stands and the origin is noted.
- **Write the design context for agent sessions.** A root `DESIGN.md` holds the extracted system: palette and roles, chapter themes, type roles, spacing rhythm, radius and elevation tiers, motion, layout grid, iconography and imagery rules, component vocabulary, and the standing visual rules currently scattered across memory and CLAUDE.md. Project `CLAUDE.md` gains the `## Design Context` section the impeccable skills look for, holding the essentials and pointing at `DESIGN.md`.
- **Correct the `brand-theme` spec** to the shipped palette and font weights.
- **No migration.** No existing CSS module, component or page is edited. Tokens are additive; nothing consumes them until a later change chooses to. Shipped pages render byte-identically.

## Capabilities

### New Capabilities
- `design-system`: the shipped site's visual system as machine-readable tokens (radius, elevation, duration, type roles), an agent-facing design context (`DESIGN.md` + `CLAUDE.md` section), and a re-runnable token inventory; shipped-site precedence over the brand book.

### Modified Capabilities
- `brand-theme`: palette and typography requirements corrected to the shipped values (`plum-hero` = `#913155`, `ink-deep` added, Exo 2 300/400/700/800, Manrope 400/600/700).

## Impact

- `lib/styles/typography.ts` (roles rewritten; regenerates `css/tailwind.css` utilities that have a single consumer, to be checked), new `lib/styles/css/tokens.css` imported from `css/index.css`, new `lib/styles/scripts/audit-tokens.ts`, `lib/styles/README.md` pointer.
- New `DESIGN.md`; `CLAUDE.md` `## Design Context` section; `AGENTS.md` Documentation Map row.
- `openspec/specs/brand-theme/spec.md` corrected.
- Zero runtime or visual impact on shipped pages; verified by `bun run check` and a before/after screenshot comparison of the home, a case study and a blog post at mobile and desktop widths.
