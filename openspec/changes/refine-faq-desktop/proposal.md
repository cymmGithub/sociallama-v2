## Why

A reviewer flagged the homepage FAQ as disproportioned on desktop: an open answer wraps at its 74ch reading measure and hugs the left edge, so the right ~60% of every open row is empty plum. The type is fine; the answer's *position* wastes the width.

## What Changes

- On desktop, each FAQ row becomes a **two-column open ledger**: the question keeps the left column, the answer opens into the right column beside it (instead of underneath), and the +/− toggle stays at the far right edge. CSS-only restructure of the existing `<details>` rows — `display: grid` on the row, summary in column one, `::details-content` in column two.
- The question's type scale rises to **2.25rem at the desktop end of its clamp** (mobile floor unchanged) so questions own their column. User-approved from a three-size mock (1.75 / 2 / 2.25) rendered on the live build — 2.25 chosen accepting that short questions wrap and rows get taller.
- The answer keeps its current size and 74ch measure; the width fills with position, not inflated body type.
- Mobile keeps today's stacked rows untouched. Rows keep opening independently — auto-close (accordion `name` grouping) stays rejected per the original change's Decision 4 (page yank under the cursor).
- Content fix riding along: "in-house" in question 02 breaks across lines in the new narrower question column — prevent the break rather than change the layout.
- Decision mock: https://claude.ai/code/artifact/b2cc569f-1e5b-441b-bf43-9bde041c00d8

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `homepage-faq`: adds a desktop presentation requirement — answers open beside their questions in a second column, question display size 2.25rem at desktop, toggle at the row's right edge; stacked presentation remains the small-screen behavior. All existing requirements (served-in-HTML answers, structured data, independent disclosure, no clipping, localisation) are unchanged and must survive the restructure.

## Impact

- `app/(frontend)/(home)/sections/faq/faq.module.css` — row grid, question clamp max, sign positioning, answer margins/alignment; the bulk of the change.
- `app/(frontend)/(home)/sections/faq/index.tsx` — likely untouched; only if the no-break fix needs markup.
- `lib/content/home.ts` / `home.en.ts` — question 02 no-break treatment if done at the content level.
- EN homepage shares the component — its (longer, English) questions must be checked in the narrower question column.
- The `::details-content` block-size animation and the settled-reveal no-clipping guarantee must be re-verified inside the grid layout.
