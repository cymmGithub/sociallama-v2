## 1. Curation data model

- [x] 1.1 Create the `blog-hub` Payload global (`lib/payload/globals/blog-hub.ts`): `featured` (relationship → posts, single), `picks` (relationship → posts, hasMany, max 4), `popular` (relationship → posts, single), and a `video` group — `title`, `url`, `description`, `duration` (optional), `poster` (upload → media). All slots optional; Polish labels and admin descriptions explaining where each appears.
- [x] 1.2 Validate the `video` group so a destination URL cannot be saved without a poster, and vice versa — an incomplete spotlight must not reach the front end.
- [x] 1.3 Register the global in the Payload config, push the schema, and regenerate `payload-types.ts`. (Also authored `migrations/20260726_220833_add_blog_hub.ts` — the dev DB is push-maintained, but `build:vercel` runs `payload migrate`, so the change is undeployable without it.)
- [x] 1.4 Add revalidation hooks for the global so editing curation refreshes `/blog`, following the existing collection revalidation pattern.

## 2. Hub query and fallbacks

- [x] 2.1 Add a hub query that reads the global and resolves each slot, applying the fallbacks: featured → newest published; picks → next four newest excluding the featured; popular → omit the block; video → omit the section.
- [x] 2.2 Treat a slot referencing an unpublished post as empty, so the hub never links to an unavailable post.
- [x] 2.3 Wrap the query in React `cache()`, matching the project's Payload Local API pattern that avoids the `use cache` deadlock.

## 3. Route restructure

- [x] 3.1 Reduce `app/(frontend)/blog/listing.tsx` to the plain grid listing — heading, category filters, `PostCard` grid, pagination — keeping it as the component used by `/category/{slug}` and `/blog/page/{n}`.
- [x] 3.2 Compose the hub in `app/(frontend)/blog/page.tsx` from the curated sections plus the grid listing.
- [x] 3.3 Confirm `/blog/page/{n}` and `/category/{slug}` render the plain grid with no curated sections.
- [x] 3.4 Remove the `Promise.all` in `app/(frontend)/blog/page.tsx` and serialize all Payload reads on this route, per the project's build-time DB concurrency constraint.

## 4. Hub sections

- [x] 4.1 Statement header: eyebrow, headline, sub-line, category pills, search field.
- [x] 4.2 Featured block: large cover, category, title, excerpt, author byline with avatar, date and reading time; the whole card is one link.
- [x] 4.3 Editors' picks list: hairline-separated rows of category eyebrow plus title.
- [x] 4.4 Promo strip on the plum grain stage, linking to `/case-studies` with hardcoded copy (resolved 2026-07-27 — see `design.md`).
- [x] 4.5 Short list beside the most-read block: compact rows with small thumbnails; the most-read block widens the short list when omitted.
- [x] 4.6 Newsletter slab on the plum grain stage, wired to `mailchimpSubscriptionAction`, with success and error states.
- [x] 4.7 Archive grid: existing card language plus author byline, with pagination.

## 5. Video spotlight

- [x] 5.1 Build the spotlight section: poster in a 16:9 frame with a bottom scrim so the play badge stays legible on any poster, play badge, category pill, title, description, outbound action with an external-link icon, and duration when set.
- [x] 5.2 Link with `target="_blank" rel="noopener"`; give the poster link an accessible name naming the video, not just "Obejrzyj".
- [x] 5.3 Omit the entire section when no video is configured — no heading, no empty frame.

## 6. Search

- [x] 6.1 Ship a search index of `{ slug, title, excerpt, category }` for all published posts to the hub.
- [x] 6.2 Build the client filter: fold diacritics on both query and content (NFD-normalize, strip combining marks, map `ł` explicitly), match case-insensitively against title and excerpt.
- [x] 6.3 While a query is active, render all matches and hide pagination; clearing the query restores page 1.
- [x] 6.4 Add a no-matches empty state that keeps the query editable.
- [x] 6.5 Give the search input a real label, and announce the result count to assistive technology when it changes.

## 7. Verify

- [x] 7.1 `bunx biome check --write` on changed files and `bunx tsc --noEmit`; both clean (filter Biome's known `module_resolver` panic with `--diagnostic-level=error`).
- [x] 7.2 With the global completely empty, confirm the hub renders with newest-first fallbacks, no most-read block, no video section, and no empty regions.
- [x] 7.3 With every slot filled, screenshot-verify against the agreed mock (`listing-curated.html`).
- [x] 7.4 Unpublish a curated post and confirm the hub falls back instead of linking to it.
- [x] 7.5 Confirm `/blog/page/2` and `/category/social-media` show the plain grid, and that pagination and 404 behaviour are unchanged. (Out-of-range/unknown routes render the not-found page but flush HTTP 200 in dev — Next 16 PPR sends the static shell before the dynamic `notFound()` runs. Pre-existing: untouched `/category/nonexistent` behaves identically.)
- [x] 7.6 Search: check a diacritic-free query matches diacritic content, that pagination hides while filtering and returns on clear, and that the no-matches state appears.
- [x] 7.7 Load the hub with a video spotlight configured and confirm from the network panel that no request reaches a video host before the link is activated.
- [x] 7.8 Verify the hub at mobile widths, and check keyboard focus order through the search field, curated links, and the spotlight action.
