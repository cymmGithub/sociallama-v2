# brand-theme

## ADDED Requirements

### Requirement: Brand palette as Satus theme tokens
The styling system SHALL define the Social Lama palette (plum `#923156`, plum-hero `#892f53`, plum-dark `#722341`, orange `#ed8c1b`, ink `#2b1f24`, cream `#fbfaf6`, sand `#f0ece3`) in `lib/styles/colors.ts` and expose three named themes — `plum`, `cream`, `plum-deep` — through the existing `primary/secondary/contrast` slot system.

#### Scenario: Theme tokens available to components
- **WHEN** a section component references a theme slot (e.g., `contrast`) inside a chapter wrapper with theme `plum`
- **THEN** it resolves to the brand value defined for that theme (orange) without any component-level hex literals

#### Scenario: Styles pipeline passes
- **WHEN** `bun run check` runs after the palette replacement
- **THEN** Biome, TypeScript, and the styles setup script complete without errors

### Requirement: Brand typography
The system SHALL load Exo 2 (weights 400, 800) and Manrope (weights 400, 600) via `next/font/google` with both `latin` and `latin-ext` subsets, exposed through `lib/styles/fonts.ts`.

#### Scenario: Polish diacritics render in display face
- **WHEN** a headline containing Polish characters (e.g., "SPRZEDAŻ", "Usługi") renders
- **THEN** it displays in Exo 2 with no fallback-font substitution for the diacritic glyphs
