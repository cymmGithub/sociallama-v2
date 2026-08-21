# Design: fix-case-study-404-status

## What the measurements changed

The proposal framed this as a case-study bug and cited `/blog/nope-not-real` →
404 as the control. That URL is not the blog post route. Polish posts live at
root `/{slug}`, and that segment has a `loading.tsx` too. Re-measured against
dev on :3006, 2026-08-21:

| route | before |
| --- | --- |
| `/case-studies/definitely-not-a-study-12345` | 200 |
| `/en/case-studies/nope-12345` | 200 |
| `/nope-not-real-12345` (PL post) | 200 |
| `/en/blog/nope-12345` | 200 |
| `/category/nonsense` | 200 |
| `/category/nonsense/page/2` | 200 |
| `/en/blog/category/nonsense` | 200 |
| `/blog/page/999` | 200 |
| `/en/blog/page/999` | 200 |
| `/branze/nonsense`, `/uslugi/nonsense`, `/en/services/nonsense`, `/zostan-lama/nonsense` | 404 |

The correlation with `loading.tsx` is exact and has no counter-example in
either direction: all 8 `loading.tsx` files sit above a `notFound()`, and every
route under one answers 200. So the proposal's mechanism is right and its scope
is wrong. This change covers all nine URL families.

**It is not only the status.** `/blog/page/1` and `/category/{slug}/page/1`
answer **200 with the non-canonical title rendered**, carrying a `NEXT_REDIRECT`
marker in the flight payload instead of a 308. `permanentRedirect()` is
swallowed by the same committed response as `notFound()`. The soft-nav router
follows it; a crawler indexes a duplicate. Fixing the boundary fixes both.

## Decision 1: the gate goes above the Suspense boundary, not inside it

Within one segment the App Router nests `layout.tsx` **above**
`loading.tsx`, which sits above `page.tsx`. Work done in the layout runs before
the status line is sent; work in the page runs after. That single level of
nesting is the whole fix.

Verified by spike (`case-studies/[slug]/layout.tsx` awaiting
`getPublishedCaseStudySlugs()` then `notFound()`):

- `/case-studies/definitely-not-a-study-12345` → **404**
- `/case-studies/engie` → **200**, `role="status"` still present in the streamed
  HTML, `<article>` at byte offset 46943, byte-identical to baseline, and the
  hidden-segment count stayed at 1 (the pre-existing `TempusPatch` leaf).

So the spec's third scenario is not in tension with the fix, as it first looked.
Holding the response for the existence check costs nothing visible because every
read in `lib/payload/queries.ts` is a `'use cache'` function. The gate is a
cache hit, and the heavy article body still streams behind the boundary.

## Decision 2: two shapes, chosen per route by whether the route needs a boundary at all

`loading.tsx` is load-bearing on the detail routes for a reason that does not
apply to the listings: `page.tsx` awaits `draftMode()`, and under
`cacheComponents: true` a dynamic read outside Suspense is a build error. The
listing routes read nothing dynamic. Their `loading.tsx` is soft-nav polish.

**Detail routes: add a `layout.tsx` gate, keep `loading.tsx`.**
`(frontend)/case-studies/[slug]`, `(frontend-en)/en/case-studies/[slug]`,
`(frontend)/[slug]`, `(frontend-en)/en/blog/[slug]`.

**Listing routes: delete `loading.tsx`, change nothing else.**
`(frontend)/category`, `(frontend-en)/en/blog/category`,
`(frontend)/blog/page/[number]`, `(frontend-en)/en/blog/page/[number]`. With no
boundary above them, the `notFound()` and `permanentRedirect()` calls already in
those pages start working. Zero new code.

Deleting rather than relocating matters for the category tree. A boundary at
`category/[category]` would wrap `category/[category]/page/[number]`, so a gate
for the paginated child could never sit above it. Within one subtree you can
keep the shell at `[category]` or gate the paginated leaf, never both. The
correct status wins: these are listing pages whose data is entirely cached, so
they have nothing slow to hide behind a shell.

### Correction from the build, 2026-08-21

Decision 2 did not survive contact with a production build. Two rounds of it:

**Round one.** `/category/[category]/page/[number]` and its English twin have no
`generateStaticParams`, and under Cache Components an un-enumerated `params` is
itself uncached data, so deleting their boundary failed the build with
*"Uncached data was accessed outside of <Suspense>"*. The old `loading.tsx` had
been holding those routes up, not decorating them.

**Round two, the one that settles it.** Enumerating those params moved the
failure rather than fixing it. A `--debug-prerender` build (which reports every
failing page instead of exiting at the first) showed the same
`TypeError: Cannot read properties of undefined` on five pages, including
`/en/blog/placeholder-no-content`, a route whose `loading.tsx` was never
touched and which had only gained a gate.

The real constraint is narrower and sharper than "listings don't need a
boundary":

> A `notFound()` reached **during prerendering** with no Suspense boundary above
> it crashes this build. It does not degrade to a 404 page.

`staticParamsOrPlaceholder` walks straight into it. When a collection is empty
it invents a `placeholder-*` param purely to satisfy Cache Components'
non-empty requirement, and the build prerenders that param, which 404s by
design. Harmless below the boundary, fatal above it. The English blog is empty
in the dev database, so `/en/blog/[slug]` and `/en/blog/category/[category]`
both hit it; the paginated blog routes hit the same thing through their own
"prerender page 2 as its out-of-range 404" fallback.

Two consequences:

1. The gate falls through when the published list is empty. Nothing published
   means nothing to gate on, and the page still 404s the placeholder from
   inside the boundary exactly as before.
2. **The four listing routes are out of scope for this mechanism.** Their
   `notFound()` cases are precisely the ones `generateStaticParams` prerenders,
   so any gate above the boundary re-creates the crash. They keep their
   `loading.tsx` and their swallowed status. Fixing them needs a different
   approach than this change carries.



Deleting `loading.tsx` was not sufficient for two of the four listing routes.
`/category/[category]/page/[number]` and its English twin have no
`generateStaticParams`, and under Cache Components an un-enumerated `params` is
itself uncached data, so the first build failed with *"Uncached data was
accessed outside of <Suspense>"*. The old `loading.tsx` had been holding that
route up, not just decorating it.

Both routes now enumerate their params, matching the sibling
`/blog/page/[number]` that already did. That is why the other six routes were
unaffected: every one of them already enumerated its slugs. The general rule is
narrower than Decision 2 first stated. **A route may drop its boundary only if
`generateStaticParams` covers its params.**

## Decision 3: the gate reads `draftMode()`, and the build decides whether it may

`/api/preview?path=…` is a live editor workflow, so an unpublished draft must
still render. A gate that checks published slugs alone would 404 it.

The risk is documented in `components/layout/root-document/index.tsx`: awaiting
`draftMode()` in a layout body once suspended the entire page tree and made
every route stream as one hidden late segment, the top mobile-LCP offender in
the 2026-07-29 audit. That is the regression the proposal warns against.

A spike with `draftMode()` in the segment layout produced a byte-identical
response to baseline in dev (same hidden-segment count, same `<article>`
offset), which suggests the hazard is specific to the *root* layout. Dev is
lenient about `cacheComponents` though, and a warm cache can resolve a promise
without suspending at all. **This is settled by a production build, not by
dev.**

So the gate is written once and validated in that order:

- **Preferred:** short-circuit on `draftMode()`, then check cached published
  slugs. Preserves preview.
- **Fallback, only if the build rejects it:** published slugs alone, and the
  preview limitation gets recorded in the project guide.

Task 1 runs the build spike before any of the other routes are touched, because
its outcome decides the shape of all four gates.

The fallback is genuinely a fallback, not an equal option: `blog-post-page`'s
existing **Draft preview** requirement says an editor's preview action renders
the draft at its future URL. A published-only gate would violate it. If the
build rejects `draftMode()` in the layout, that is a design problem to bring
back, not something to ship quietly.

## Decision 4: withdrawn studies rule out an "exists at all" gate

Gating on "a document with this slug exists, published or draft" would preserve
preview for free. It also breaks the spec's second scenario: a withdrawn study
is still a row in the database, so it would keep answering 200, which is the
Adamed case that started this change. The gate checks *published*, and draft
preview is handled by Decision 3's short-circuit.

## Verification

Dev status probes are necessary but not sufficient. Every claim here must be
re-measured against `bun run build && bun run start`, because PPR, prerendering
and the `cacheComponents` boundary rules only fully apply in a production build.
The 13-URL table above is the regression check, plus:

- `/blog/page/1` and `/category/{slug}/page/1` answer **308**, not 200.
- `/case-studies/engie` keeps `role="status"` in its streamed HTML and does not
  gain a hidden late segment.
- `/api/preview` on an unpublished draft still renders.
