# Tasks: fix-case-study-404-status

## 1. Settle the gate shape with a production build

- [x] 1.1 Record the baseline: run the 13-URL status table from `design.md`
  against dev on :3006 and save it, so every later claim has a before.
- [x] 1.2 Add `app/(frontend)/case-studies/[slug]/layout.tsx` in the preferred
  shape: short-circuit on `draftMode()`, then `notFound()` when the slug is
  absent from the cached published-slug list.
- [x] 1.3 Run `bun run build`. If it rejects the dynamic read in the layout,
  stop and report: the published-only fallback breaks `blog-post-page`'s
  Draft preview requirement, so that is a decision to bring back, not to make
  alone.
- [x] 1.4 With `bun run start`, confirm on the built app: unknown slug 404,
  `/case-studies/engie` 200, `role="status"` still in the streamed HTML, and no
  new `<div hidden id="S:` segment wrapping the page body.

## 2. Gate the three remaining detail routes

- [x] 2.1 `app/(frontend-en)/en/case-studies/[slug]/layout.tsx`, same shape as
  1.2 against the English locale.
- [x] 2.2 `app/(frontend)/[slug]/layout.tsx` for Polish posts, gating on the
  cached published post slugs.
- [x] 2.3 `app/(frontend-en)/en/blog/[slug]/layout.tsx`, the English twin.
- [x] 2.4 Keep every `loading.tsx` in these four segments untouched; the
  `draftMode()` read in each `page.tsx` still needs its boundary.

## 3. Drop the boundary from the four listing routes

- [x] 3.1 Delete `app/(frontend)/category/loading.tsx` and
  `app/(frontend-en)/en/blog/category/loading.tsx`.
- [x] 3.2 Delete `app/(frontend)/blog/page/[number]/loading.tsx` and
  `app/(frontend-en)/en/blog/page/[number]/loading.tsx`.
- [x] 3.3 Confirm no page under these segments reads a dynamic API, which is
  what made the boundary optional here. If one does, the build will say so.
- [x] 3.4 Change nothing else in these routes: the `notFound()` and
  `permanentRedirect()` calls already there are what starts working.
- [x] 3.5 The build said so: `/category/[category]/page/[number]` and its
  English twin have no `generateStaticParams`, so their `params` counted as
  uncached data and the route could not prerender without the boundary. Both now
  enumerate their params, matching `/blog/page/[number]`.

## 4. Verify against a production build

- [x] 4.1 `bun run build && bun run start`, then re-run the full status table.
  Build green. `/case-studies/{unknown}`, `/en/case-studies/{unknown}` and
  `/{unknown}` now answer 404; the four already-correct routes stay 404.
- [x] 4.2 `/en/blog/{unknown}` still answers 200, and correctly so: the English
  post collection is empty in this dev database, so the gate takes its
  empty-collection fall-through. `/en/case-studies/{unknown}` exercises the same
  code path in the same route group against a non-empty list and answers 404.
- [ ] 4.3 BLOCKED, not deferred. `/blog/page/1` and `/category/{slug}/page/1`
  still answer 200 instead of 308, and the four listing routes still answer 200
  on a miss. See the design's second build correction: their
  `generateStaticParams` prerenders exactly the params that call `notFound()`,
  so any gate above the boundary crashes the build.
- [x] 4.4 A published case study and a published post render in both locales at
  200, with `role="status"` still in the streamed HTML and `<article>` inline
  rather than inside a hidden late segment. Byte offsets match the pre-change
  baseline.
- [x] 4.5 Draft preview: covered by unit test rather than end to end.
  `/api/preview` needs a logged-in Payload user and this session has no
  credentials, so `lib/payload/slug-gate.test.ts` pins the draft-mode
  short-circuit (and asserts the published-slug query never runs in draft mode).
  The live check is still worth doing from the admin panel.
- [x] 4.6 `bun run check` exits 0 (681 tests, biome and tsc clean).
- [x] 4.7 `bun run test:e2e`: 81 passed, 6 failed, all pre-existing and
  unrelated. Four are local media 500s on `/api/media/file/*` surfacing as 400
  in the optimizer (the documented Blob-token-rename breakage), which the
  case-study and sitemap-crawl suites assert on via `consoleErrors`. Two are
  `/branze` navigation timeouts on mobile. The case-study suite's render
  assertions (article, non-empty h1, section count) all passed.

## 5. Record what future routes must not repeat

- [x] 5.1 Add a short note to the project guide: a `loading.tsx` above a
  `notFound()` or `permanentRedirect()` silently downgrades it to a rendered
  200, and the gate belongs in a sibling `layout.tsx`.
- [x] 5.2 Widen `proposal.md`'s scope section to the nine families actually
  fixed, so the archived record does not keep asserting that blog routes were
  already correct.
