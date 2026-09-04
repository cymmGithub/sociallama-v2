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
- A **sticky platform rail** on the left lists the five known platforms with counts (Facebook 30, Instagram 24, TikTok 14, LinkedIn 6, YouTube 3 today) and filters the grid client-side, combining with the existing search. Below the desktop breakpoint the rail becomes a chip row above the grid.
- A **grid / ledger view toggle**: the ledger view is one row per study — logo, title + tags, lead numeral, the other groups' lead numerals, platform marks. Client state only, no route or query parameter.
- Header, subhead and search stay exactly as they are.

Content model:

- **No schema change.** The card and board read `results[0]`; the rail normalizes `results[].platform` to the five platform keys `brand-icons.tsx` already knows and ignores everything else. The `platform` and `results` admin descriptions are rewritten to say that array order decides the face of the card and the board.

## Capabilities

### New Capabilities

- `case-study-scoreboard`: the proof-first surfaces — detail scoreboard hero, section rail, results ledger, hub board cards, platform rail and ledger view — and the read-side rules they depend on (lead metric = first result, platform normalization, parenthetical split).

### Modified Capabilities

- `case-studies`: "Case studies listing" (card shows a lead metric, drops the excerpt) and "Case study detail page" (hero carries the scoreboard and meta rail; results render as a ledger, not tiles). "Searching the case-study listing" is unchanged; the platform filter composes with it and is specified in the new capability.

## Impact

- `app/(frontend)/case-studies/[slug]/case-study-article.tsx` + `case-study.module.css`: hero, rail, results.
- `app/(frontend)/case-studies/case-study-card.tsx`, `listing-view.tsx`, `hub-search.tsx`, `search.ts`, `case-studies.module.css`: board card, platform rail, view toggle, filter state.
- New `lib/payload/case-study-scoreboard.ts` (pure helpers: lead metrics per group, platform normalization, parenthetical split) with unit tests; `normalizePlatform` moves out of the article into it.
- `lib/content/case-studies.ts` + `.en.ts`: rail labels, view labels, meta labels; the locale-parity test covers them.
- `lib/payload/collections/case-studies.ts`: admin descriptions only.
- `e2e/case-studies.e2e.ts`, `e2e/case-study.e2e.ts`: extended for the rail, the toggle and the ledger.
- Dependencies: none new. Both routes stay static; all filtering is client-side over data already on the page.
- Out of scope, tracked separately: the "next case study" row at the end of the detail page (Mock B's fix for the dead end), the 48 stock covers, and any change to how metric values are authored.
