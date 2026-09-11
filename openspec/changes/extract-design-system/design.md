## Context

`lib/styles` is the Satus token skeleton: `colors.ts` (brand palette + three chapter themes, adapted for Social Lama), `typography.ts` (seven Satus-default roles, untouched), `layout.mjs` (4/12 columns, 16px gap and safe, 800px breakpoint), `css/easings.css` (hand-authored `@theme`), and `setup:styles` generating `root.css` + `tailwind.css`. The site was built past this skeleton: measured on 2026-09-11, the 62 CSS modules carry 442 raw `font-size` declarations (178 distinct), 531 distinct spacing values, radii 2/4/10/12/16/18/20/22/28px plus `999px`/`50%`, ~25 distinct `box-shadow`s, durations 150/180/200/270/300/420/540/620ms, and ~25 hardcoded hex colours including near-misses of brand orange and plum (`#d9812a`, `#a83c65`, `#8d2f53`). The type-scale classes are used once.

The only visual rules that held are the ones a document names: the three chapter themes (spec `brand-theme`), the `.shot` 18px radius (project `CLAUDE.md`), Lucide-only icons and Exo 2 + Manrope only (memory). The consumer of this change is Claude sessions; the impeccable skills read a `## Design Context` section in the project `CLAUDE.md`.

Decisions fixed in explore (2026-09-11): extract only, shipped site wins over the brand book, agent sessions are the reader.

## Goals / Non-Goals

**Goals:**
- One place a session reads before touching any surface, short enough to actually be loaded.
- Named tokens for the scales that have a clear canonical value on the site, so new work can say `var(--radius-card)` instead of guessing `18px` vs `20px`.
- A measurement that can be re-run, so "did this change drift" has a number.
- Spec layer brought back in line with the code.

**Non-Goals:**
- Migrating any existing CSS module onto the tokens. No shipped page changes.
- A rendered style guide, Storybook stories for site sections, or a Figma library.
- CI enforcement (a lint that rejects raw values). Deferred to a later change once the tokens have consumers.
- Reconciling the site with the brand book. Where they differ, the site is recorded as-is.

## Decisions

**D1. `DESIGN.md` at the repo root is the system; `CLAUDE.md` carries a short `## Design Context` section pointing at it.**
The impeccable skills look for `## Design Context` in `CLAUDE.md`, so that section must exist there. But the parent guide keeps project `CLAUDE.md` to project facts, and a full system there would bloat every session's context. So `CLAUDE.md` gets ~15 lines (palette, faces, chapter themes, the two hard rules, "read DESIGN.md before styling") and `DESIGN.md` holds the rest, capped at roughly 300 lines so it stays loadable in one read. Alternative rejected: `docs/design/` set of files, which is the architecture-doc shape and drifts unread.

**D2. Tokens live in a hand-authored `lib/styles/css/tokens.css` `@theme` block, not in the generated pipeline.**
`easings.css` already establishes hand-authored `@theme` next to generated `root.css`/`tailwind.css`. Radius, shadow and duration have no slot in the Satus config, and teaching `setup:styles` a new family is more machinery than three static blocks deserve. Tailwind v4 compiles `@theme` into `:root` custom properties, so both `var(--radius-card)` and `rounded-(--radius-card)` work. Alternative rejected: extending `config.ts` + generators.

**D3. Type roles replace the Satus defaults in `typography.ts`.**
The seven existing roles (h1 at 120px desktop, "mono" body) describe Satus, not this site, and have one consumer. Rewriting them to the observed roles regenerates `tailwind.css` utilities nobody else uses, so it is additive in effect. The single existing consumer is located first and either confirmed unaffected or left on an equivalent explicit value. Role names describe use (`display`, `title`, `lead`, `body`, `small`, `caption`, `label`), not HTML elements, because the site's `h2` sizes vary by chapter.

**D4. Canonical value selection is by cluster mode, with prominence as the tiebreak.**
For each property, values are clustered (e.g. font sizes within ~0.05rem; radii by role: pill/circle/card/chip/hairline), and the most-used member of a cluster is the canonical token. When a cluster splits evenly, the value on the more prominent surface (home hero and chapters, case-study page, blog post) wins. Every non-canonical member is listed in `DESIGN.md` under "existing variants, do not reuse" rather than silently dropped, so a later migration change has the map. Near-miss hex colours are checked for intent (hover state, gradient stop) before being listed as variants.

**D5. The inventory is a committed script, not a one-off.**
`lib/styles/scripts/audit-tokens.ts` walks `app/`, `components/`, `lib/` for `*.module.css` and prints per-property value counts (plus hex colours). The numbers in `DESIGN.md` are quoted from its output with the date. It is not wired into CI; it is the tool a future session runs to answer "is this new surface on the system".

**D6. Shipped site wins; the brand book is provenance.**
`DESIGN.md` records every palette entry with an origin column: brand book, or site decision with date (sand as chapter-two ground 2026-07-13, `ink-deep` for footer and kontakt, `plum-hero` collapsed onto brand plum). The `brand-theme` spec is corrected to the code, not the reverse.

**D7. Standing visual rules move in, they are not rewritten.**
Rules already enforced elsewhere (`.shot` 18px and the baked mockup radii in `CLAUDE.md`; Lucide only; the two faces; reduced-motion neutralizer in `global.css`) are restated in `DESIGN.md` with a pointer to where they are enforced. `CLAUDE.md` keeps its case-study radius section verbatim; `DESIGN.md` links to it rather than duplicating the reasoning.

## Risks / Trade-offs

- [Rewriting `typography.ts` changes a generated file with one consumer] → locate the consumer in task 1, confirm the rendered value, snapshot before/after.
- [A second source of truth: `DESIGN.md` vs the CSS] → `DESIGN.md` is explicitly a record of the shipped site as of a date, quotes the inventory script, and the script is the tiebreak. Enforcement is deferred by decision, not forgotten.
- [Clusters chosen wrong, canonical value not the one the eye prefers] → variants are recorded, nothing is migrated, so a wrong pick costs a token rename later, not a visual regression.
- [`CLAUDE.md` section grows and bloats context] → hard cap of ~15 lines; anything longer goes to `DESIGN.md`.
- [Token names collide with Tailwind defaults (`--radius-*`, `--shadow-*`)] → the `@theme` block resets the namespace the same way `easings.css` does with `--ease-*: initial`, which also drops Tailwind's unused default utilities from the build. Confirm no existing class uses a Tailwind `rounded-*`/`shadow-*` default before resetting; if any does, namespace as `--radius-sl-*` instead.

## Migration Plan

None for shipped pages. Deploy is a normal ff-merge; the only CSS delta in the built output is additive custom properties. Rollback is `git revert` of one commit.

## Open Questions

- Whether the near-miss hexes (`#d9812a`, `#a83c65`, `#8d2f53`) are deliberate hover/gradient shades or drift. Resolved during extraction by reading their context; both outcomes are recorded, neither is changed.
