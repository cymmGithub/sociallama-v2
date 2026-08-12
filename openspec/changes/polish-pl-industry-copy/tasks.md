# polish-pl-industry-copy — tasks

## 1. Label renames (lib/content/branze.ts)

- [ ] 1.1 Rename the four `label` fields: Automotive → Motoryzacja, Health → Zdrowie, Fashion → Moda, Petcare → Zoologiczna. Slugs, ids, `pairSlug` untouched.
- [ ] 1.2 Update the four `meta.title` strings to declined forms („Social media dla branży motoryzacyjnej / zdrowotnej / modowej / zoologicznej") and sweep the four `meta.description` strings for the old English terms.
- [ ] 1.3 Fix in-copy references that named the old label: „Branża health wymaga…" → „Branża zdrowotna wymaga…"; check the other three briefs/taglines for the same pattern. If Moda's own marquee now doubles the label („Moda" first entry), swap the marquee entry for another fashion keyword.

## 2. Standalone English phrases (design D1 mapping)

- [ ] 2.1 Finanse pillar „Thought leadership" → „Budowanie pozycji eksperta".
- [ ] 2.2 „Community" chip values and marquee entries (Petcare/Zoologiczna + Rozrywka) → „Społeczność"; Rozrywka pillar „Community marketing" → „Marketing społeczności".
- [ ] 2.3 Moda pillar „Trend-driven content" → „Content oparty na trendach"; leave „Influencer marketing" and „Social commerce" (terms of art).
- [ ] 2.4 Full-file pass over the 12 PL industry entries for any remaining all-English list item, applying the soft rule; keep-list per design D1.

## 3. Straggler sweep

- [ ] 3.1 `rg -n "Automotive|'Health'|'Fashion'|'Petcare'|Thought leadership|Community" lib app components e2e` — fix any test, e2e assertion, alt text or cross-reference pinning the old labels (EN files excluded).
- [ ] 3.2 Run the static orphan audit on the new Polish strings; add ` ` after single-letter words per house style.

## 4. Verify and sign off

- [ ] 4.1 `bun run check` + content tests (locale parity, orphan coverage) green.
- [ ] 4.2 Render PL menu overlay, footer, `/branze` hub and the four renamed industry pages; confirm labels, headings and meta titles; spot-check EN equivalents are unchanged.
- [ ] 4.3 Present the full string diff (old → new, every changed line) to the user for wording sign-off before merge — copy is client voice; do not merge on green checks alone.
