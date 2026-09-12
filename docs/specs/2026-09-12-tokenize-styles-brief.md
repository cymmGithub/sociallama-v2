# tokenize-styles — Tier A token substitution (brief, 2026-09-12)

Approved scope, decided with the user on 2026-09-12 after `bun run styles:audit`
on main `29a1fd22`. No OpenSpec change for this work; branch `tokenize-styles`,
ff-merge into main when done.

## The one rule

**Identity substitution only.** Replace a literal with the token whose value is
*exactly* the same rendered value. Nothing on any page may render differently.
Tier B (snapping variants such as 150ms → 200ms, 22px → 20px, the near-miss
hexes, the label font cluster, spacing) is explicitly OUT — it is design work
that will be done per surface with mocks later. If a substitution would change a
rendered value, skip it and leave the literal.

Read `DESIGN.md` and `lib/styles/css/tokens.css` first. Tokens are `@theme static`
custom properties, usable as `var(--radius-card)` from CSS modules.

## Substitution map (from the audit on 29a1fd22)

| Literal in `*.module.css` | Token | Occurrences |
|---|---|---|
| `border-radius: 999px` | `var(--radius-pill)` | 51 |
| `border-radius: 50%` and `100%` | `var(--radius-circle)` | 30 + 3 |
| `border-radius: 18px` | `var(--radius-card)` | 14 |
| `border-radius: 12px` | `var(--radius-chip)` | 7 |
| `border-radius: 20px` | `var(--radius-panel)` | 7 |
| `box-shadow: 0 6px 18px -10px rgb(43 31 36 / 35%)` | `var(--shadow-card)` | 2 |
| `box-shadow: 0 18px 40px -24px rgb(43 31 36 / 45%)` | `var(--shadow-raised)` | 6 |
| `box-shadow: 0 26px 50px -22px rgb(43 31 36 / 55%)` | `var(--shadow-overlay)` | 4 |
| `200ms` in transition/animation | `var(--duration-fast)` | 34 |
| `400ms` | `var(--duration)` | 3 |
| `800ms` | `var(--duration-slow)` | 1 |
| `#ffffff` / `#000000` (and `#fff` / `#000`) | `var(--color-white)` / `var(--color-black)` | 13 + 11 |

Caveats to check per site, not assume:
- `50%` vs `100%` radius render the same only on a square box; on a non-square
  box `100%` is not a circle. Only substitute `100%` where the box is square, or
  leave it.
- Shorthand `border-radius: 16px 16px 0 0` and multi-value forms: leave.
- A `200ms` inside a longer shorthand with several durations (`transition: a 200ms, b 150ms`):
  substitute only the 200ms part; verify the shorthand still parses.
- Durations inside `@keyframes` percentages or `animation-delay`: substituting
  is still identity, but confirm the property accepts a `var()` there.
- Hex inside `rgb()`/`color-mix()`/gradients: substitute only where a plain
  colour value is expected; `color-mix(in srgb, var(--color-white) 20%, transparent)`
  is fine, but a hex embedded in an SVG data URI is not.
- `#ffffff`/`#000000` in a `.tsx` (inline style, SVG fill) are out of scope; CSS modules only.
- Do NOT touch `lib/styles/css/*` generated files, `public/`, or the Satus
  `components/ui/*` modules that use `mobile-vw()`/`desktop-vw()` radii.

## Verification gate (hard)

Pixels are not the gate — the repo learned that home and o-nas differ by
thousands of pixels between two identical runs. The gate is a per-element
computed-style dump, diffed before and after, plus a positive control:

1. Before touching CSS, on the running dev (:3004), dump computed styles for every
   element on: `/`, `/o-nas`, `/uslugi`, one `/uslugi/<slug>`, `/branze`, one
   branża page, `/case-studies`, one case study, `/blog`, one post, `/kontakt`,
   `/zostan-lama`, and the `/en` mirrors of home + one case study + one post —
   at 375 and 1440 px. Capture `border-radius`, `box-shadow`, `transition-duration`,
   `animation-duration`, `color`, `background-color`, `border-color` keyed by a
   stable element path. Headless Chromium via playwright-core (the MCP browser
   may be locked; see memory `playwright-mcp-lock-fallback`). Store in the
   scratchpad.
2. Positive control: temporarily change one token value, confirm the diff
   catches it, revert.
3. Apply the substitutions.
4. Re-dump, diff: must be EMPTY. Any difference is a skipped substitution, not a
   tolerance.
5. `bun run styles:audit`: distinct counts for radius / shadow / duration / hex
   must drop; declaration counts must not change. Paste before/after into the
   commit message.
6. `bun run check` and `bun run build` pass; revert the Blob-stripping
   `app/(payload)/admin/importMap.js` side effect before staging.

## Delivery

One commit on `tokenize-styles` (a second one is fine if the dump script is
worth keeping under `lib/styles/scripts/`). Update the inventory table in
`DESIGN.md` with the new counts and date. Then report; the user merges.
