# Reduce media serving costs

## Why

Media serving is the dominant cost driver on both bills, measured 2026-08-29/30:

- **Vercel — image optimization is the top line item** (>$5 this month:
  transformations + optimization cache writes, per dashboard). A 24 h log
  sample shows 726 distinct media files served; `minimumCacheTTL` is 30 days,
  so the whole variant corpus (726 files × up to 16 configured widths) expires
  and is re-transformed monthly by crawler traffic — for images unchanged
  since their 2020 WordPress export (`*-1024x640.jpg` names — already sized).
- **Neon — the media proxy is ~half of all compute wakes.** `/api/media/file/*`
  is Payload's proxy route; without `disablePayloadAccessControl` every edge
  cache miss runs `payload.find()` by filename (getFilePrefix) — a DB query to
  serve a public immutable file. 8,815 of ~17 k function log events in 24 h
  are this route; sociallama-v2 is $3.94 of the org's $5.25 August compute,
  awake 17.7% of the month with 498 wake events spread across all 24 hours.
- **Page revalidation is the other half of wakes.** `cacheLife('days')`
  expires ~338 sitemap URLs daily; night crawler traffic re-renders them
  (00:00–06:00 UTC sample: 1,438 media-route + ~1,600 page events).

## What Changes

- **Media URLs point straight at Vercel Blob.** `vercelBlobStorage` gets
  `disablePayloadAccessControl: true` — sound because the collection is
  explicitly public (`read: () => true` in `lib/payload/collections/media.ts`).
  `media.url` becomes `https://<store>.public.blob.vercel-storage.com/…`; the
  proxy route stops being registered. Blob's CDN serves bytes; no function,
  no DB.
- **Old URLs keep working.** Permanent redirect `/api/media/file/:file` →
  blob host (indexed by Google — `app/robots.ts` explicitly allows the route —
  and baked into cached HTML/OG tags). Static rule, no DB involved.
- **Optimizer allowlist** gains the blob hostname in `images.remotePatterns`
  (today only `cdn.shopify.com`).
- **Posts outside the newest 15 render images `unoptimized`** — article body
  (rich-text upload converter) and listing/hub cards. Pre-sized WP exports
  gain nothing from resize; this removes their transformations and cache
  writes. The window derives from the already-cached `getPublishedPostSlugs()`
  (tag `posts`), so it moves automatically on publish, no cron, no migration.
- **`minimumCacheTTL` 30 d → 1 year.** In-place file replacement already
  requires a `?v=N` bump per the existing convention documented in
  `next.config.ts`, so the only thing the short TTL bought was monthly
  re-billing.
- **`cacheLife('days')` → `cacheLife('weeks')`** in `lib/payload/queries.ts`.
  Publish-time tag revalidation (CMS hooks + `app/api/revalidate`) remains
  the freshness mechanism; the time TTL is a safety net and does not need to
  burn a nightly re-render per URL.

## Capabilities

### New Capabilities

- `media-serving-policy`: where media bytes are served from (Blob CDN,
  directly), which images pass through the Next optimizer (newest 15 posts +
  local marketing assets), and the cache lifetimes that bound recurring
  optimization cost.

### Modified Capabilities

- `payload-cms`: media documents expose public blob URLs; the
  `/api/media/file/*` proxy route is retired (redirect preserves inbound
  links).

## Impact

- `payload.config.ts` — plugin flag.
- `next.config.ts` — remotePatterns, `minimumCacheTTL`, redirect entry
  (blob host derived from `BLOB_READ_WRITE_TOKEN` store id at config time).
- `app/robots.ts` — the `/api/media/` allow entry becomes moot; update the
  comment (blob host serves images now).
- `lib/payload/queries.ts` — `cacheLife` values + a `isRecentPost`-style
  helper for the top-15 window.
- `app/(frontend)/[slug]/rich-text.tsx` (upload converter), post article
  wiring, and blog listing/hub card components — thread the
  `optimized`/`unoptimized` flag.
- **Risks / accepted trade-offs:**
  - Old posts serve original JPG/PNG (no webp, no srcset): ~20–30% heavier
    for human visitors. Accepted — their traffic is overwhelmingly bots.
  - Image URLs move hosts → Google Images re-crawl churn; the permanent
    redirect mitigates.
  - Local dev without `BLOB_READ_WRITE_TOKEN` falls back to local storage
    exactly as today (flag sits inside the token-gated plugin block).
- **Rollback:** revert the plugin flag and redirect — the proxy route
  re-registers and old URLs resolve again; cache TTL changes are
  independent and revert cleanly.
