## Context

`CaseStudiesListingView` is a server component shared by `/case-studies` and `/en/case-studies`. It renders `CaseStudyCard` (server, uses `resolveMedia` + `Image`) for every study returned by `getCaseStudies(locale)`, all 48 on one page, in manual `_order`.

The blog hub's search (`app/(frontend)/blog/hub-search.tsx`) is a client context whose provider takes server-rendered sections as `children` and never re-renders them. It ships a separate `SearchEntry[]` index because its page 1 only holds 9 of 79 posts. Here every study is already on the page, so the cards themselves are the index.

Constraints: `Localized<T>` in `lib/i18n/parity.ts` maps over object types, which strips the callability of a `results: (count) => string` function; the blog keeps `hubSearch` outside `Localized` and types it structurally. The locale-parity test enforces key parity between PL and EN content modules. Blog search has no e2e coverage.

## Goals / Non-Goals

**Goals:**
- Filter the live card grid by text in both locales, no new route, no URL state.
- Keep `CaseStudyCard` a server component; no client re-implementation of the card.
- Match on client name, title, tags, excerpt; case- and diacritic-insensitive.
- Announce the match count; show an empty state on zero matches.

**Non-Goals:**
- Pagination (rejected in explore; see proposal).
- Tag pills or any faceted filter. Revisited during implementation: `tags` is a free-text `hasMany` field, and across the 47 published studies it holds 115 distinct values of which 100 appear exactly once — a pill row built from it would be an index, not a filter. The only real taxonomy on site is the 12 industries curated in `lib/content/branze.ts`, which reach 32 of the 47. Filtering by industry is a separate change and wants the industry on the case-study document, not in a content file (see the follow-up note below).
- Searching rich text (`challenge`, `approach`, `client.about`).
- Persisting the query in the URL or across navigations.
- Sharing a component with the blog hub. The two differ in what they filter (an index vs rendered children); a shared abstraction would need both modes.

## Decisions

**1. Veil the server-rendered cards instead of rendering cards on the client.**
The page computes, per study, `{ slug, haystack }` where `haystack = foldDiacritics([client.name, title, ...tags, excerpt].join(' '))`, ~50 bytes each. `CaseStudySearch` (client provider) receives that list and the server-rendered grid as children. Each card is wrapped in `<Filtered slug>` (client), which reads the provider's match set and toggles a CSS class. Cards never re-render; the 48 consumers flip a class.
Alternative rejected: a `'use client'` grid fed a slim projection of each study. That duplicates the `CaseStudy → card props` mapping (`resolveMedia`, `caseStudyHeadline`, card sizes) and turns `CaseStudyCard` into a client component, pulling `Image` config into the bundle.

**2. Hide with a class that sets `display: none`, not the `hidden` attribute.**
`case-studies.module.css` has no `nth-child` rules today, so `hidden` would work, but a class keeps the hook in the module where a future `nth-child` author will see it. The grid's `gap` ignores `display: none` children either way.

**3. Empty state and count live in the provider, not in the veils.**
The provider owns `matches: Set<string>` and `searching: boolean`, so it knows `matches.size` for the `aria-live` region and whether to render the empty state. The grid `<div>` stays mounted (its children are just all hidden) and the empty block renders after it; this avoids unmounting 48 images and refetching them on clear.

**4. Copy as a separate `caseStudySearch` export, typed structurally.**
Because `Localized<>` strips the `results(count)` function, the copy goes in a new `export const caseStudySearch` in `lib/content/case-studies.ts` and `.en.ts` with an explicit `CaseStudySearchCopy` interface, exactly as `hubSearch` does for the blog. The client provider imports both locale modules and picks by a `locale` prop, for the same reason the blog does: a function cannot cross the server/client boundary as a prop. Polish plural uses the existing three-form helper pattern from `lib/content/blog.ts` (`postsPlural`) with case-study nouns; English is authored independently.

**5. Input in the header, on the title's row from 1100px and under the subhead below it.**
Results appear directly below either way, so there is no "three screens away" problem that forced the blog to hide curated sections. The split row (revised during implementation, at the owner's call) puts the field at the far end of the header with its rule landing on the subhead's last line and its right edge on the grid's, which keeps the title block from being pushed down by a control. It cannot hang on `--desktop` (800px): the text column carries a 76ch measure, ~684px at this body size and ~742px in WebKit, so an 800px viewport would leave the field about 80px. 1100px is the first width where the measure, a two-gap gutter and a 22rem field all fit. Styles for `.search`, `.searchIcon`, `.searchInput`, `.searchClear` are copied from `blog.module.css` rather than extracted: two consumers, ~50 lines, and the blog's rules are tuned to its own header.

**6. Match semantics identical to blog.**
Whole-phrase substring on the folded haystack. An all-whitespace query is "not searching". `filterPosts` is not reused (it is typed to `SearchEntry`); only `foldDiacritics` is.

## Risks / Trade-offs

- [JSON-LD `ItemList` still lists all 48 while a filter is active] → Acceptable; structured data describes the page as served, and search is not a crawlable state.
- [`foldDiacritics` imported from `lib/blog/search.ts` into a case-study file] → Cosmetic coupling. Move it to `lib/i18n/fold.ts` if a third consumer appears; not in this change.
- [Haystack computed on the server leaks nothing new] → It is built from fields already rendered on the card.
- [Typing on a slow device re-filters 48 strings per keystroke] → Trivial cost; no debounce.
- [EN tags may be empty for untranslated studies] → Haystack tolerates missing fields; `getCaseStudies('en')` already returns the EN-resolved doc.
- [Grid-level layout assumptions, e.g. a future `nth-child` stripe] → Decision 2 keeps the hook visible in the CSS module.

## Migration Plan

No schema, no data, no routes. Ship on a feature branch, ff-merge. Rollback is a revert.

## Open Questions

- Whether `results(count)` should mention the noun ("3 case studies") or just the number. Default: noun, matching blog. Resolved: noun, and in Polish that noun is `realizacja` — `case study` is an indeclinable loan and "Znaleziono 3 case study" reads as a bug.

## Follow-up: filtering by industry

Raised by the owner during implementation and deliberately not folded into this change.

The data does not support it yet. `tags` is free text (`type: 'text', hasMany: true`): 141 tag instances over 47 published studies, 115 distinct, 100 used exactly once, 4 used three times or more. `lib/content/branze.ts` does hold a real 12-industry taxonomy, but it is a hand-maintained mapping in a content file, it reaches only 32 of the 47 studies, and two of its industries (`finanse`, `fashion`) link none at all. Pills built from it today would hide 15 studies behind a control that looks exhaustive, `pracuj-pl`, `polomarket`, `riviera` and `vistula` among them, and would go stale the next time a study is imported without anyone editing `branze.ts`.

The shape worth proposing separately: an `industry` select on the case-study document (schema change, migration, editorial backfill of 47 rows), with `branze.ts` reading it instead of restating it. Then a pill row is exhaustive by construction and the industry pages and the hub cannot disagree.
