# Proposal: fix-listing-route-404-status

## Why

`fix-case-study-404-status` fixed the four content **detail** routes by moving
`notFound()` into a `layout.tsx` above the segment's Suspense boundary. The four
**listing** routes could not take the same fix, and still answer the wrong
status. Measured on a production build, 2026-08-21:

| route | status | should be |
| --- | --- | --- |
| `/category/nonsense` | 200 | 404 |
| `/category/nonsense/page/2` | 200 | 404 |
| `/en/blog/category/nonsense` | 200 | 404 |
| `/blog/page/999` | 200 | 404 |
| `/en/blog/page/999` | 200 | 404 |
| `/blog/page/abc` | 200 | 404 |
| `/blog/page/1` | 200 | 308 to `/blog` |
| `/category/marketing/page/1` | 200 | 308 to `/category/marketing` |

The last two are the sharper problem. `permanentRedirect()` is swallowed by the
same committed response as `notFound()`, so `/blog/page/1` renders the blog
listing at a non-canonical URL with a `NEXT_REDIRECT` marker in the flight
payload. The soft-nav router follows it. A crawler indexes a duplicate.

## Why the detail-route fix does not transfer

Two constraints, both established by build, both written up in `AGENTS.md`
under *Route status vs `loading.tsx`*:

1. A route may only drop its `loading.tsx` if `generateStaticParams` enumerates
   its params. An un-enumerated `params` is uncached data under Cache
   Components, and awaiting it outside a boundary fails the build.
2. Nothing the build prerenders may reach `notFound()`. A `notFound()` during
   prerendering with no boundary above it crashes the build with a bare
   `TypeError`; it does not degrade to a 404 page.

Together they close the door. For these routes the params
`generateStaticParams` prerenders are *exactly* the ones that 404: the
out-of-range page number that `/blog/page/[number]` deliberately emits when
there is only one page, and the `placeholder-*` slug that
`staticParamsOrPlaceholder` invents when a collection is empty. Hoisting the
decision above the boundary crashes the build on the very params the build
generates.

Adding `generateStaticParams` to the paginated category routes was tried and
rejected: it satisfies constraint 1 and then fails constraint 2.

## What Changes

Unknown categories, out-of-range page numbers and malformed page numbers SHALL
answer 404, and page 1 SHALL answer 308, on all four listing routes. The
approach is open. Candidates, none yet chosen:

- Stop the build from prerendering params that 404. Rework
  `staticParamsOrPlaceholder` so the empty-collection case yields a param the
  page renders rather than one it rejects, and drop
  `/blog/page/[number]`'s deliberate out-of-range entry. Then the detail-route
  gate transfers unchanged. Touches every route using that helper, which is the
  main risk.
- Decide the status in `proxy.ts`, before the App Router sees the request.
  Framework-agnostic and immune to boundary placement, but it puts content
  knowledge (which categories exist, how many pages each has) into the request
  path and needs its own cache and invalidation.
- Find out whether the prerender crash is a Next bug worth reporting upstream.
  `TypeError: Cannot read properties of undefined` from a `notFound()` during
  prerendering is not a diagnostic anyone can act on, and a fix there would
  remove constraint 2 entirely.

Whichever wins must keep the listing pages' soft-navigation shell, or make an
explicit case for dropping it.

## Capabilities

### Modified Capabilities
- `seo-url-parity`: the blog and category listing routes SHALL send their
  `notFound()` and `permanentRedirect()` on the response line.

## Impact

- `app/(frontend)/category/`, `app/(frontend)/blog/page/[number]/` and their
  English twins under `app/(frontend-en)/en/blog/`.
- `staticParamsOrPlaceholder` in `lib/payload/queries.ts`, if the first
  candidate wins. It is used by six routes.
- Possibly `proxy.ts`, if the second does.
- Split out of `fix-case-study-404-status` on 2026-08-21 after the mechanism
  was proven not to transfer. That change's `design.md` carries the full
  measurement trail.
