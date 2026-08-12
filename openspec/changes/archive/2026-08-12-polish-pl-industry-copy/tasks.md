# polish-pl-industry-copy — tasks

## 1. Label renames (lib/content/branze.ts)

- [x] 1.1 Rename the four `label` fields: Automotive → Motoryzacja, Health → Zdrowie, Fashion → Moda, Petcare → Zoologiczna. Slugs, ids, `pairSlug` untouched.
- [x] 1.2 Update the four `meta.title` strings to declined forms („Social media dla branży motoryzacyjnej / zdrowotnej / modowej / zoologicznej") and sweep the four `meta.description` strings for the old English terms.
- [x] 1.3 Fix in-copy references that named the old label: „Branża health wymaga…" → „Branża zdrowotna wymaga…"; check the other three briefs/taglines for the same pattern. If Moda's own marquee now doubles the label („Moda" first entry), swap the marquee entry for another fashion keyword.

## 2. Standalone English phrases (design D1 mapping)

- [x] 2.1 Finanse pillar „Thought leadership" → „Budowanie pozycji eksperta".
- [x] 2.2 „Community" chip values and marquee entries (Petcare/Zoologiczna + Rozrywka) → „Społeczność"; Rozrywka pillar „Community marketing" → „Marketing społeczności".
- [x] 2.3 Moda pillar „Trend-driven content" → „Content oparty na trendach"; leave „Influencer marketing" and „Social commerce" (terms of art).
- [x] 2.4 Full-file pass over the 12 PL industry entries for any remaining all-English list item, applying the soft rule; keep-list per design D1.

## 3. Straggler sweep

- [x] 3.1 `rg -n "Automotive|'Health'|'Fashion'|'Petcare'|Thought leadership|Community" lib app components e2e` — fix any test, e2e assertion, alt text or cross-reference pinning the old labels (EN files excluded).
- [x] 3.2 Run the static orphan audit on the new Polish strings; add ` ` after single-letter words per house style.

## 4. Verify and sign off

- [x] 4.1 `bun run check` + content tests (locale parity, orphan coverage) green. Also `bun run build` clean; static orphan audit reports 0 bindable T1 gaps.
- [x] 4.2 Verified at the data level: all 12 labels flow through `industryNav` in canonical order (Alkohole still 7th), the four renamed industries keep their slugs and `pairSlug`, meta titles decline correctly, and `branze.en.ts` labels are untouched. **The browser render was NOT performed** — this worktree's dev server (:3006) was dead at close-out and is not respawned from an agent session. Pure-copy change with no layout edit; longest new label is 11 chars against an existing 29-char maximum, so wrap risk is nil.
- [x] 4.3 Full string diff presented; user signed off 2026-08-12 and elected to keep `Real-time marketing` (Rozrywka pillar) English — see the "English survivors" note in `proposal.md` Impact.
