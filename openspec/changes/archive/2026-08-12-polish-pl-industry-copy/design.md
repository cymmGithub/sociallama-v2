# polish-pl-industry-copy — design

## Context

All PL industry surfaces derive from one typed module, `lib/content/branze.ts` (design D3 of the original branze change): `industryNav` feeds the overlay menu, footer OFERTA and hub cards; `INDUSTRIES` entries feed the detail pages and meta. So the rename itself is a handful of string edits in one file — the work is in the judgment calls (which terms translate) and the sweep (finding every English phrase and every stale cross-reference).

Approved mapping (user, 2026-08-12):

| PL label today | becomes | note |
|---|---|---|
| Automotive | Motoryzacja | |
| Health | Zdrowie | in-copy „branża health" follows („branża zdrowotna") |
| Fashion | Moda | Fashion's own marquee already says „Moda" — dedupe if it reads doubled |
| Petcare | Zoologiczna | user's pick over „Petcare"; reads as elliptical „branża zoologiczna" |
| Beauty, Horeca | keep | entrenched trade terms with no natural Polish equivalent |

## Goals / Non-Goals

**Goals:**

- PL menu, footer, hub and industry pages read as Polish throughout, under the soft rule.
- Meta titles/descriptions of the four renamed industries match their new names, declined naturally („dla branży motoryzacyjnej", not „dla branży Motoryzacja").
- The three specs that enumerate the canonical labels stay truthful.

**Non-Goals:**

- No slug, route, redirect or `pairSlug` changes — labels only.
- No EN-side changes (`branze.en.ts` verified clean).
- No homepage changes of any kind — deliberate English there („Strategy that works", hero lines) is brand voice by explicit user decision.
- No service renames: „Content" and „Influencer marketing" stay — entrenched terms that double as page names.
- No blanket de-anglicization of running Polish prose: loanwords woven into Polish sentences (storytelling, content, fintech, B2B) stay.

## Decisions

### D1 — Soft translation rule, applied per term

Standalone list-item copy (a pillar, chip value, or marquee entry) written entirely in English gets translated; entrenched loanwords and terms of art stay, whether standalone or in prose. Concretely: „Thought leadership" → „Budowanie pozycji eksperta"; „Community" → „Społeczność"; „Community marketing" → „Marketing społeczności"; „Trend-driven content" → „Content oparty na trendach" (the loanword survives, the raw English syntax doesn't). Kept: „Social commerce", „Influencer marketing", „UGC", „Lookbook", „Drop", „Wellbeing", „B2B & B2C", „Fintech". Rationale: these are what Polish marketing clients search and say; translating them would make the copy stiffer, not more Polish.

*Alternative considered:* hard rule (translate everything, Horeca included). Rejected by user — and it would produce terms nobody uses („branża hotelarsko-gastronomiczna").

### D2 — Declined adjectival meta titles

The existing PL meta titles already decline where natural („branży alkoholowej", „branży rozrywkowej"). The four renames follow that pattern: motoryzacyjnej / zdrowotnej / modowej / zoologicznej. Meta descriptions keep their current claims, with only the industry term swapped; the Zoologiczna description already says „marek zoologicznych i petcare" — „petcare" survives there as prose-level trade vocabulary (soft rule), unless the full-diff review reads it as noise.

### D3 — Rename first, then sweep by grep and by eye

After the label/meta edits, `rg -n "Automotive|Health|Fashion|Petcare|Thought leadership|Community"` over `lib app components content` catches stragglers (case-study copy, alts, tests that assert labels). The final gate is a human-readable diff of every changed string presented for user sign-off before merge — copy is a client-voice surface, and the user reviews wording, not mechanics.

## Risks / Trade-offs

- [„Zoologiczna" is an adjective standing alone in a noun list] → user's explicit pick; it reads as elliptical „branża zoologiczna" in context, consistent with the bare-noun/no-„Branża"-prefix rule.
- [Title-tag wording changes have SEO surface] → pre-launch domain, URLs unchanged; the declined forms are the higher-volume Polish queries anyway.
- [New copy can introduce single-letter orphans] → run the static orphan audit; ` ` after single-letter words per house style.
- [Some test or e2e assertion may pin the old labels] → the D3 grep covers `e2e/` too; fix assertions in the same commit.

## Open Questions

None — the mapping is approved; the full-diff review before merge is the remaining user touchpoint.
