## Why

The `/case-studies` hub lists all 48 published studies as one flat grid with no way to jump to a brand. A visitor who remembers "the Breville one" or "the #OPENTOWORK campaign" scrolls. The blog hub already solved this with a client-side, diacritic-insensitive filter; the case-study hub gets the same affordance, in both locales.

Pagination was considered and rejected: the portfolio is manually ordered by editors, every page boundary would drop client logos off the landing view, and at 48 items the whole grid is the point. Search alone covers the findability problem without splitting the portfolio.

## What Changes

- A search field in the `/case-studies` and `/en/case-studies` header, under the subhead.
- Typing filters the existing card grid in place: cards whose client name, title, tags or excerpt contain the query stay visible, the rest hide. Matching is case- and diacritic-insensitive, reusing `foldDiacritics` from `lib/blog/search.ts`.
- A visually-hidden live region announces the match count; a no-match empty state replaces the grid when nothing matches.
- Search copy (label, placeholder, clear, result count, empty state) added to the PL and EN case-study content modules.
- No new route, no URL state, no search index payload beyond a per-card haystack string. No pagination.

## Capabilities

### New Capabilities

_None._

### Modified Capabilities

- `case-studies`: the listing requirement gains a search behaviour (filter the grid by text, locale-aware, diacritic-insensitive, announced count, empty state) and the English listing inherits it.

## Impact

- `app/(frontend)/case-studies/listing-view.tsx`: header gains the input; the grid wraps each card in a client veil.
- New `app/(frontend)/case-studies/hub-search.tsx` (client): context provider, input, per-card veil, empty state.
- `app/(frontend)/case-studies/case-studies.module.css`: search field styles (ported from `blog.module.css`) and a hidden-card class.
- `lib/content/case-studies.ts` / `case-studies.en.ts`: new `caseStudySearch` copy export.
- `app/(frontend-en)/en/case-studies/page.tsx`: passes locale so the provider picks EN copy.
- `e2e/`: a new case-studies spec covering the filter. Blog search has no e2e today, so this is new coverage, not a mirror.
- `lib/blog/search.ts`: `foldDiacritics` gains a second consumer; consider moving it to `lib/i18n/` or leave the import as is.
