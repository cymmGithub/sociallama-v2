## MODIFIED Requirements

### Requirement: Brand palette as Satus theme tokens
The styling system SHALL define the Social Lama palette per the brand book "Social Lama nowe wytyczne stylistyczne" (plum `#913155`, orange `#f09b39`, ink `#2b1f24`, cream `#faf9f5`, sand `#e0ddd3`), plus three derived tokens outside the book — plum-hero `#913155` (equal to brand plum since the 2026-07 brand book; kept as its own token because the hero and team grounds and the chapter-1 theme consume it by name, and the baked hero assets are graded to it), plum-dark `#722341` (chapter-3 ground) and ink-deep `#161216` (the footer sign-off and `/kontakt` ground) — in `lib/styles/colors.ts`, and expose three named themes — `plum`, `cream`, `plum-deep` — through the existing `primary/secondary/contrast` slot system. The `cream` theme's `primary` SHALL be sand, not cream (site decision 2026-07-13).

#### Scenario: Theme tokens available to components
- **WHEN** a section component references a theme slot (e.g., `contrast`) inside a chapter wrapper with theme `plum`
- **THEN** it resolves to the brand value defined for that theme (orange) without any component-level hex literals

#### Scenario: Styles pipeline passes
- **WHEN** `bun run check` runs after the palette replacement
- **THEN** Biome, TypeScript, and the styles setup script complete without errors

#### Scenario: Spec matches the shipped palette
- **WHEN** the hex values in this requirement are compared with `lib/styles/colors.ts`
- **THEN** every token named here exists with the same value, and no token in `colors.ts` is missing from this requirement

### Requirement: Brand typography
The system SHALL load Exo 2 (weights 300, 400, 700, 800) and Manrope (weights 400, 600, 700) via `next/font/google` with both `latin` and `latin-ext` subsets, exposed through `lib/styles/fonts.ts` as `--next-font-display` and `--next-font-mono` respectively. No other font family SHALL be loaded or referenced.

#### Scenario: Polish diacritics render in display face
- **WHEN** a headline containing Polish characters (e.g., "SPRZEDAŻ", "Usługi") renders
- **THEN** it displays in Exo 2 with no fallback-font substitution for the diacritic glyphs

#### Scenario: Bold body copy uses a loaded weight
- **WHEN** body copy is set at weight 700
- **THEN** Manrope 700 renders, with no synthetic bold or silent substitution to 600
