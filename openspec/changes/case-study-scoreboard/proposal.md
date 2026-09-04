## Why

The case-study pages are structurally flat: the detail page buries its proof under two prose sections and renders every metric as the same orange tile, so 432 616 views weigh the same as 30 comments, and the hub is 47 identical cards, 11 000 px tall, with a text search as the only way in. Mock A ("Scoreboard", artifact `Case Study Trzy Kierunki`, 2026-09-04) was picked to fix both: proof first, one lead numeral per platform, a sticky rail, and a hub whose cards are small boards.

## What Changes

Detail page (`/case-studies/[slug]`, `/en/case-studies/[slug]`):

- The hero becomes two columns: title, lead, meta rail (platforms, tags, pillar tags) on the left; a **scoreboard** on the right — the cover under a plum gradient carrying the lead result per result group (the first group's first metric large, up to two more groups' first metrics small).
- The lead (`excerpt`) is no longer expected to carry the numbers; content stays as-is, the layout stops duplicating it.
- The body gains a **sticky section rail** in the left margin (Klient / Wyzwanie / Wyniki / Podejście), driven by the section ids that already exist. The prose column keeps its 66–70ch measure; the empty right margin is gone because the rail claims the left one.
- **Results render as a ledger**: per result group, the first metric as a large numeral with an orange rule, the rest as small numerals in a four-track row. The orange tiles go. **BREAKING** for the visual contract only; no data changes.
- A metric value that ends in a parenthetical (`432 616 (+1 380%)`) renders the parenthetical as a secondary line instead of wrapping mid-value.

Hub (`/case-studies`, `/en/case-studies`):

- Each card becomes a **board**: cover under the plum gradient, the first result's value as the card's one numeral with its group label; logo, title and tags below. The excerpt leaves the card.
- A **sticky industry rail** on the left lists the branże the portfolio actually covers, with counts, and filters the grid client-side, combining with the existing search. Below the desktop breakpoint the rail becomes a chip row above the grid.
- A **grid / ledger view toggle**: the ledger view is one row per study — logo, title + tags, lead numeral, the other groups' lead numerals, platform marks. Client state only, no route or query parameter.
- Header, subhead and search stay exactly as they are.

Content model:

- The card and board read `results[0]`; `results[].platform` normalizes to the five platform keys `brand-icons.tsx` already knows, which label metrics and nothing else. The `platform` and `results` admin descriptions are rewritten to say that array order decides the face of the card and the board.
- **One schema addition: `industry`.** A non-localized `select` on `case-studies`, keyed on the `id` of the site's own branże. The hub filters by it.

  The filter was specified as a platform rail and changed to industries during implementation (user decision): a visitor arriving at the portfolio is looking for their own sector, not for a channel, and the site already publishes twelve branża pages with their own names in both locales. Reusing that taxonomy means the hub and those pages cannot disagree.

  The existing `tags` cannot carry it — 115 distinct tags across 47 studies, only 15 used more than once, and the most common are channels (`Social media` 8, `TikTok` 4). They are also localized, so a filter keyed on them would give the two hubs different categories. `tags` stays what it is: three free labels on the card.

  Seven categories the portfolio needs have no branża page yet (`retail`, `energetyka`, `zywnosc`, `edukacja-i-hr`, `logistyka`, `rolnictwo`, `b2b-i-uslugi`). They ship as `PENDING_INDUSTRIES` so the filter covers 47 of 47 from day one; writing their pages is separate work, and moving one into `INDUSTRIES` is what publishes it — the `id` never changes, so nothing is re-filed.

## Capabilities

### New Capabilities

- `case-study-scoreboard`: the proof-first surfaces — detail scoreboard hero, section rail, results ledger, hub board cards, platform rail and ledger view — and the read-side rules they depend on (lead metric = first result, platform normalization, parenthetical split).

### Modified Capabilities

- `case-studies`: "Case studies listing" (card shows a lead metric, drops the excerpt) and "Case study detail page" (hero carries the scoreboard and meta rail; results render as a ledger, not tiles). "Searching the case-study listing" is unchanged; the platform filter composes with it and is specified in the new capability.

## Impact

- `app/(frontend)/case-studies/[slug]/case-study-article.tsx` + `case-study.module.css`: hero, rail, results.
- `app/(frontend)/case-studies/case-study-card.tsx`, `listing-view.tsx`, `hub-search.tsx`, `search.ts`, `case-studies.module.css`: board card, platform rail, view toggle, filter state.
- New `lib/payload/case-study-scoreboard.ts` (pure helpers: lead metrics per group, platform normalization, parenthetical split) with unit tests; `normalizePlatform` moves out of the article into it.
- `lib/content/branze.ts` + `.en.ts`: `PENDING_INDUSTRIES`, `INDUSTRY_OPTIONS`, `INDUSTRY_KEYS` — the closed vocabulary, names and routes, one per locale.
- `lib/payload/collections/case-studies.ts`: the `industry` select, plus one additive nullable migration.
- New `lib/payload/assign-case-study-industries.ts`: the backfill, whose slug->industry table is a reviewable list rather than a heuristic; 31 assignments come straight from the branża pages' own `relatedCaseStudies`.
- `lib/content/case-studies.ts` + `.en.ts`: rail labels, view labels, meta labels; the locale-parity test covers them.
- `lib/payload/collections/case-studies.ts`: admin descriptions only.
- `e2e/case-studies.e2e.ts`, `e2e/case-study.e2e.ts`: extended for the rail, the toggle and the ledger.
- Dependencies: none new. Both routes stay static; all filtering is client-side over data already on the page.
- Out of scope, tracked separately: the "next case study" row at the end of the detail page (Mock B's fix for the dead end), the 48 stock covers, any change to how metric values are authored, and the seven `/branze` landing pages the new categories are waiting for — each needs researched copy, real statistics with sources, a client quote and imagery, none of which can be generated.
