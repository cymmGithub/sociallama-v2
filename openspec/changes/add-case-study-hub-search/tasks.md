## 1. Copy

- [ ] 1.1 Add `caseStudySearch` (label, placeholder, clear, results(count), emptyTitle, emptyText) to `lib/content/case-studies.ts` with a Polish three-form plural for "case study", and a structural `CaseStudySearchCopy` interface outside `Localized<>`
- [ ] 1.2 Add the English `caseStudySearch` to `lib/content/case-studies.en.ts`; run the locale-parity test

## 2. Search component

- [ ] 2.1 Create `app/(frontend)/case-studies/hub-search.tsx` (client): `CaseStudySearch` provider taking `entries: {slug, haystack}[]`, `locale`, `children`; computes `searching` and a `matches` Set via `foldDiacritics` whole-phrase substring
- [ ] 2.2 Add `CaseStudySearchInput` (label, `type="search"`, lucide `Search` icon, clear button with lucide `X`) reading the context
- [ ] 2.3 Add `Filtered` veil: wraps one card, applies the hidden class when `searching && !matches.has(slug)`
- [ ] 2.4 Add `CaseStudySearchStatus`: `aria-live="polite"` sr-only count, plus the empty state rendered after the grid when `searching && matches.size === 0`

## 3. Listing integration

- [ ] 3.1 In `listing-view.tsx`, build `entries` on the server from `client.name`, `title`, `tags`, `excerpt`; wrap the section in `CaseStudySearch`, render the input under the subhead, wrap each `CaseStudyCard` in `Filtered`, add the status block
- [ ] 3.2 Thread `locale` from both pages (`/case-studies` → `pl`, `/en/case-studies` → `en`); `listing-view` already derives locale from `basePath` for JSON-LD, reuse that
- [ ] 3.3 Port `.search`, `.searchIcon`, `.searchInput`, `.searchClear` from `blog.module.css` into `case-studies.module.css`; add the `.cardHidden { display: none }` class; confirm no `nth-child` rules depend on card count

## 4. Verification

- [ ] 4.1 Unit test for the haystack builder and match logic (missing tags/excerpt, whitespace query, diacritics)
- [ ] 4.2 New `e2e/case-studies.e2e.ts`: type a client name → one card visible; type a tag → subset; nonsense → empty state; clear → 48 cards, no new image requests; same on `/en/case-studies` with English copy
- [ ] 4.3 Render PL and EN in Chromium and WebKit, check the input against the header at 360/768/1440
- [ ] 4.4 `bun run check` (lint, types, unit, build)
