# design-system Specification

## Purpose
TBD - created by archiving change extract-design-system. Update Purpose after archive.
## Requirements
### Requirement: Token inventory is re-runnable
A script under `lib/styles/scripts/` SHALL walk every `*.module.css` under `app/`, `components/` and `lib/` and print, per visual property (`font-size`, `padding`/`gap`/`margin`, `border-radius`, `box-shadow`, transition and animation durations) and for hex colour literals, every distinct value with its occurrence count, sorted by count. It SHALL be runnable through a `package.json` script and SHALL NOT modify any file.

#### Scenario: Inventory reproduces the extraction baseline
- **WHEN** the script is run on the tree the extraction was made from
- **THEN** it prints the counts quoted in `DESIGN.md` for that date, and exits 0

#### Scenario: Inventory reflects new surfaces
- **WHEN** a new CSS module introduces a `border-radius` value not previously present
- **THEN** the next run lists that value with count 1

### Requirement: Extracted scales exist as tokens
Radius, elevation and motion-duration scales SHALL be defined as custom properties in a hand-authored `@theme static` block in `lib/styles/css/tokens.css`, imported by `lib/styles/css/index.css`. The block SHALL be `static` because Tailwind omits theme variables it sees no use of and compiles CSS modules separately, so a plain `@theme` would leave the tokens undefined at runtime. The motion tokens SHALL be the three the site already consumes — `--duration-fast`, `--duration`, `--duration-slow` — defined in this file and nowhere else. Each token's value SHALL be one the shipped site already uses, chosen as the most-used member of its cluster, and token names SHALL describe role (for example `--radius-pill`, `--radius-card`, `--radius-chip`, `--shadow-card`, `--duration-fast`, `--duration-base`, `--duration-slow`), not the value.

#### Scenario: Token resolves in CSS and Tailwind
- **WHEN** a stylesheet references `var(--radius-card)` or a class uses `rounded-(--radius-card)`
- **THEN** both resolve to the same shipped value defined in `tokens.css`

#### Scenario: Tokens are additive
- **WHEN** `bun run build` runs with `tokens.css` present
- **THEN** no existing CSS module has been edited, and the computed styles of the home page, one case-study page and one blog post are identical to the pre-change build at 375px and 1440px

### Requirement: Type roles describe the shipped site
`lib/styles/typography.ts` SHALL define the type roles the site renders (display, title, lead, body, small, caption, label at minimum), each generating a `type-`-prefixed utility — an unprefixed role name would emit a utility that styles any element carrying that word as a class, because Tailwind generates a custom utility for any candidate string found in any scanned file, each with the family, weight, mobile and desktop size, line-height and letter-spacing observed as canonical on the shipped surfaces. The Satus-default roles that describe no shipped surface SHALL be removed.

#### Scenario: Styles pipeline regenerates cleanly
- **WHEN** `bun setup:styles` and `bun run check` run after the roles are rewritten
- **THEN** both complete without errors and `css/tailwind.css` carries one utility per role

#### Scenario: Existing consumer unaffected
- **WHEN** the one existing consumer of a type-scale class renders after the change
- **THEN** its computed font-size, weight and line-height equal the values it rendered before

### Requirement: Design context for agent sessions
A root `DESIGN.md` SHALL record the shipped visual system: palette with role and origin, the three chapter themes, type roles, spacing rhythm, radius and elevation tiers with their tokens, motion durations and easings with the reduced-motion rule, the layout grid, iconography and imagery rules, the component vocabulary in use (button, pill, chip, card, band), and the standing visual rules with a pointer to where each is enforced. It SHALL list every non-canonical value found by the inventory under a heading that marks it as an existing variant not to reuse. It SHALL state the inventory date and SHALL stay under roughly 300 lines. The project `CLAUDE.md` SHALL carry a `## Design Context` section of at most ~15 lines holding the palette, faces, chapter themes, the two hard rules and an instruction to read `DESIGN.md` before styling.

#### Scenario: Session finds the system before styling
- **WHEN** a Claude session loads the project `CLAUDE.md`
- **THEN** it sees the `## Design Context` section and the pointer to `DESIGN.md`, and `AGENTS.md`'s Documentation Map lists `DESIGN.md`

#### Scenario: Variant is not promoted
- **WHEN** a session looks up the card radius in `DESIGN.md`
- **THEN** it finds one canonical token and the other observed radii listed as variants not to reuse

### Requirement: Shipped site takes precedence over the brand book
Where the brand book and the shipped site disagree, `DESIGN.md`, the tokens and the `brand-theme` spec SHALL record the shipped value, and `DESIGN.md` SHALL note the brand-book value as origin. No shipped value SHALL be changed toward the brand book by this capability.

#### Scenario: Site decision recorded with provenance
- **WHEN** `DESIGN.md` lists the chapter-two ground
- **THEN** it records sand `#e0ddd3` as the shipped value with the 2026-07-13 decision, not the brand book's cream

