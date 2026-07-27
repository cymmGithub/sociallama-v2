## Why

`/blog` is a chronological archive: a heading, category pills, a three-column grid ordered by `publishedAt`, and pagination (`app/(frontend)/blog/listing.tsx`). Every post is presented at identical weight, because nothing in the data model lets anyone say one post matters more than another. With 79 posts, that flattens the whole catalogue — a visitor's first screen carries no signal about where to start.

The benchmark the user chose works because an editor makes choices: what is featured, what the editors recommend, what is most read. Those are editorial concepts, and none of them exist in the CMS today.

Design direction was settled from mocks reviewed with the user (2026-07-26); the chosen hub is `listing-curated.html` in the session mock set.

## What Changes

- **A `blog-hub` Payload global** holding the hub's editorial slots: a featured post, up to four editors' picks, one most-read post, and an optional video spotlight. Curation lives in one admin screen instead of flags scattered across 79 post records.
- **`/blog` becomes a composed hub**: statement header with category filters and search, featured post beside the editors' picks list, a promo strip, a short list beside the most-read post, a newsletter slab, the video spotlight, then the full grid with pagination.
- **Video spotlight** — a single editor-chosen video presented with poster, title, description, optional duration, and an outbound link to YouTube. No embedded player: nothing third-party loads, so the hub keeps its current weight and sets no YouTube cookies. The section is omitted entirely when no video is set.
- **Client-side search** over published post titles and excerpts, diacritic-insensitive, with no new route or backend.
- **`BlogListing` splits.** The magazine furniture belongs to `/blog` page 1 only; `/category/{slug}` and `/blog/page/{n}` keep the existing grid, heading, and pagination.
- **The hub's Payload reads are serialized.** `app/(frontend)/blog/page.tsx` currently `Promise.all`s two queries during static generation, which the project's build-time DB constraint forbids; the hub adds more reads, so this is fixed as part of the work.

## Capabilities

### New Capabilities
- `blog-hub-curation`: the `blog-hub` global — featured post, editors' picks, most-read post, and video spotlight — with the fallback behaviour that keeps the hub correct when slots are empty.

### Modified Capabilities
- `blog-hub`: `/blog` gains the composed magazine layout, search, and the video spotlight; category and paginated listings are explicitly scoped to the plain grid.

## Impact

- **Payload**: one new global (`blog-hub`) with relationship fields to `posts` and an optional video group including a media upload. Schema push + `payload-types.ts` regeneration. No post data migration.
- **New code**: the global definition, a hub composition component and its sections (featured, picks, promo strip, most-read, video spotlight), a client search component, and a hub query that resolves the global with fallbacks.
- **Modified**: `app/(frontend)/blog/page.tsx` (composed hub, serialized reads), `app/(frontend)/blog/listing.tsx` (reduced to the shared grid listing), `app/(frontend)/blog/blog.module.css`, `lib/payload/queries.ts`.
- **Unchanged**: `/category/{slug}` and `/blog/page/{n}` behaviour, post URLs, pagination rules, and the sitemap.
- **Scope**: Polish only. No analytics — "most read" is an editorial pick, not a measurement. No embedded video player. No cover art direction; the grid will show the existing inconsistent cover photography until that is addressed separately.
- **Risk surface**: an editor leaving slots empty, the featured post also appearing in the grid, and search interacting with pagination.
