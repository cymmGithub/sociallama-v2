## Context

The FAQ is a numbered hairline ledger built on native `<details>`/`<summary>` (SEO-first: answers ship in served HTML; see archive/2026-07-28-add-homepage-faq design). Today `.summary` is a grid (`--num-col` | question | sign) and the answer `<p>` renders below at a 74ch measure, indented to the numeral column. At 1728px an open row is ~40% content, ~60% empty. A live-build mock (CSS injection, screenshots at 1728px) settled the direction and the question size: two-column open ledger, question at 2.25rem.

## Goals / Non-Goals

**Goals:**
- Desktop open rows read as a full-width composition: question left, answer right, toggle far right.
- Question display size 2.25rem at the desktop end of the clamp.
- Preserve every existing guarantee: answers in served HTML, independent open, height animation with clean fallback, reduced motion, no settled-reveal clipping, focus ring inside the hairline.

**Non-Goals:**
- No accordion auto-close (`name` grouping) — Decision 4 of the original change stands; the yank cost is documented in the component.
- No answer type inflation and no measure-cap removal — the width is filled by position.
- No mobile changes; no content rewrites beyond the "in-house" no-break fix.
- No change to FAQPage structured data (content source untouched).

## Decisions

- **Grid on the `<details>` element itself**: `display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.25fr)` with the summary in column one and `::details-content` placed `grid-column: 2; grid-row: 1`. `::details-content` is an element-backed pseudo and participates as a grid item — this is what the mock injection did, verified rendering in Chromium. Column gap ~64px.
- **Sign leaves the summary flow**: absolutely positioned at the row's right edge (the details is the positioning context), so the summary's inner grid reduces to numeral | question. Keeps the toggle affordance where it's always been while the summary shrinks to the left column. The whole summary stays the click target — unchanged.
- **Question clamp becomes `clamp(1.15rem, <slope>vw, 2.25rem)`**: floor and mobile behavior untouched; tune the slope so common desktop widths (1440–1920) actually reach or approach the 2.25rem cap rather than only hitting it above 1700px (today's 2.1vw slope reaches 1.75rem only at ~1330px; a steeper slope is needed for the new cap — pick it against real screenshots at 1280/1440/1728/1920).
- **Answer alignment**: answer's first baseline aligns to the question's first baseline (mock used a rough margin-top; implementation should derive it from the summary's padding-block + cap-height offset so the two columns read as one row).
- **Desktop switch via the house `@media (--desktop)` custom media** (or `--mobile` inversion, matching the file's existing usage) — not a bespoke pixel breakpoint.
- **"in-house" break**: prefer a content-level no-break (word-joiner / NBSP-hyphen policy consistent with the repo's existing ` ` single-letter-word convention in PL copy); component markup change only if content-level proves awkward.

## Risks / Trade-offs

- [Closed rows get taller — questions wrap in the left column] → accepted explicitly in the mock review; `text-wrap: balance` already on the question keeps the wraps even.
- [`::details-content` grid placement × block-size transition] → the open/close animation now runs inside a grid column; verify open, close, rapid toggling, and the no-JS/unsupported-`interpolate-size` fallback (row must snap open fully laid out, per the existing spec scenario).
- [EN questions are longer] → check every EN question at the new size in the narrower column; if one wraps to 4+ lines, that's a copy conversation, not a layout revert.
- [Focus ring] → `.summary:focus-visible` uses `outline-offset: -4px` against a full-bleed row; the summary is now a half-width column — confirm the ring hugs the summary without the sign (absolute, outside the summary box at the far right) escaping it visually.
- [Settled reveal clipping] → the section deliberately uses the translate/fade reveal, not the wipe; the grid change doesn't touch this, but re-run the expand-after-reveal check anyway (spec scenario exists).
