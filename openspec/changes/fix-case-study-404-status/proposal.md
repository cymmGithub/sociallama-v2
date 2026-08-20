# Proposal — fix-case-study-404-status

## Why

`/case-studies/<anything>` answers **HTTP 200 with a not-found body**. Only the
body is right; the status is wrong, for every unknown slug, not just withdrawn
ones. `/blog/<unknown>` and `/branze/<unknown>` both answer 404 correctly, so
the case-study route is the outlier.

Measured on 2026-08-20, dev server restarted clean:

| route | status |
| --- | --- |
| `/case-studies/definitely-not-a-study-12345` | **200** |
| `/case-studies/adamed` (withdrawn) | **200** |
| `/blog/nope-not-real` | 404 |
| `/branze/nonsense` | 404 |

**Cause, confirmed by experiment rather than inspection.**
`app/(frontend)/case-studies/[slug]/loading.tsx` opens a Suspense boundary, so
Next commits the response and starts streaming *before* `loadCaseStudy()`
resolves; by the time `notFound()` runs the status line has already been sent.
`/branze/[slug]` has no `loading.tsx`, which is exactly why it behaves. With
`loading.tsx` temporarily renamed, the unknown slug returned 404 and a real
study still returned 200 — then it was restored.

**The obvious fix is unavailable.** `export const dynamicParams = false` is
rejected outright by this project's config: *"Route segment config
`dynamicParams` is not compatible with `nextConfig.cacheComponents`"* — a hard
500 on every route in the segment, not a tradeoff.

Why it matters: a 200 on a missing page is indexable. Search engines are told
the URL is a real page, so withdrawn and mistyped case-study URLs can be crawled
and retained instead of dropped.

## What Changes

Restore a 404 status for unknown case-study slugs **without** losing the
streaming placeholder on the 47 real detail pages. Candidate approaches, to be
weighed in design — none is yet chosen:

- Resolve the study above the Suspense boundary (a layout or a parent segment)
  so `notFound()` runs before the response commits, leaving `loading.tsx` to
  cover only the parts that are genuinely slow.
- Drop `loading.tsx` and replace the placeholder with a Suspense boundary placed
  *inside* the page, below the lookup.
- Keep the 200 deliberately and stop search engines another way (`noindex` on
  the not-found render). Cheapest, and the weakest — it treats the symptom.

Whichever wins must keep `/case-studies/<real-slug>` at 200 and must not
reintroduce the no-JS hidden-shell regression that `loading.tsx` was involved in
(see the archived `no-js-hidden-shell` work).

## Capabilities

### Modified Capabilities
- `case-studies`: a request for a slug with no published study SHALL answer 404,
  not 200, while a published study still streams its shell.

## Impact

- `app/(frontend)/case-studies/[slug]/page.tsx`, `loading.tsx`, possibly a new
  `layout.tsx`; the English twin under `app/(frontend-en)/en/case-studies/`.
- Worth checking whether any other route pairs `loading.tsx` with `notFound()`.
- Found while withdrawing Adamed in `refresh-case-study-covers`, which narrowed
  its own scenario to the not-found *render* and pointed here for the status.
