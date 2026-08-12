# fix-blog-cover-focal-point — design

## Context

The post header (`app/(frontend)/[slug]/post-article.tsx` + `post.module.css` `.cover`) crops every cover into a 4:3 `object-fit: cover` box with the default `object-position` (50% 50%). Hub surfaces (featured lead, cards, popular rail) crop the same covers at other ratios, also centered. Payload's media collection has focal-point support on (payload-types carries `focalX`/`focalY`; the admin shows the picker), but no render site reads it — editor intent goes nowhere.

The `Image` wrapper (`components/ui/image/index.tsx`) merges a caller `style` after its own `objectFit`, so `style={{ objectPosition }}` flows to the underlying `<img>` with no component change.

## Goals / Non-Goals

**Goals:**

- An editor-set focal point steers the crop on every blog cover surface, both locales.
- Covers with no explicit focal point render exactly as today (50/50).
- The currently miscropped post headers are fixed by setting focal points in the admin, and the adjustments are recorded in the image audit artifact.

**Non-Goals:**

- No change to the 4:3 header box or any surface's aspect ratio — the geometry stays; only the crop window moves.
- No `Image` component API change and no new helper abstraction beyond a small shared mapper if more than two call sites want it.
- No focal-point support for non-blog imagery (case studies, static content) — their imagery is art-directed per slot already.
- No re-upload or recomposition of cover masters.

## Decisions

### D1 — Pass focal point as `object-position` at the call sites

`objectPosition: `${focalX}% ${focalY}%`` computed from the resolved media, guarded so null/undefined focal values fall back to omitting the style (browser default = 50% 50%). Four call sites: post header, hub featured, post card, popular rail. A one-line `focalPosition(media)` helper in `lib/payload/queries.ts` (next to `resolveMedia`) keeps the null-guard in one place.

*Alternative considered:* teach the `Image` component a `media` prop that derives both `src`/`alt`/`objectPosition`. Rejected — bigger API surface than the problem, and `Image` deliberately knows nothing about Payload shapes.

### D2 — Fix the offending covers with focal points, not new masters

The `blog-cover-art` spec's existing rule (compose masters to survive the central 4:3 crop) remains the standard for *new* library covers; the focal point is the repair tool for existing art whose subject sits off-center. The editorial pass audits rendered headers (screenshot sweep over published posts), sets focal points in the admin for offenders only, and logs each adjustment in the image audit artifact — that log is the rollback record, since media rows have no git history.

*Alternative considered:* changing the header box aspect to match typical cover aspect (16:10). Rejected — it reflows the whole header grid for every post to fix a subset of covers, and the hub crops would still miscrop.

## Risks / Trade-offs

- [Focal point change regenerates Payload's cropped `og` size for that row] → spot-check one adjusted post's OG image; the og crop follows the focal point too, which is the desired direction.
- [Hub crops and header crops share one focal point per image; a point tuned for 4:3 may be imperfect at 16/9] → the focal point moves the crop window on every surface toward the subject — strictly better than center for off-center art; verify the hub lead for any adjusted cover that is also the lead.
- [Admin writes are unversioned] → the image audit artifact records every adjustment (existing bookkeeping requirement), and focal values are trivially re-settable.

## Open Questions

None.
