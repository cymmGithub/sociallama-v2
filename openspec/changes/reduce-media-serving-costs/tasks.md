# Tasks — reduce media serving costs

## 1. Serve media straight from Blob

- [ ] 1.1 `payload.config.ts`: add `disablePayloadAccessControl: true` to `vercelBlobStorage`
- [ ] 1.2 `next.config.ts`: add `*.public.blob.vercel-storage.com` (store host: `cqipbump8rt7fbr0.public.blob.vercel-storage.com`) to `images.remotePatterns`
- [ ] 1.3 `next.config.ts`: permanent redirect `/api/media/file/:file*` → `https://cqipbump8rt7fbr0.public.blob.vercel-storage.com/:file*`; store host confirmed live: `cqipbump8rt7fbr0.public.blob.vercel-storage.com` — hardcode it (public URL, not a secret); no token parsing needed
- [ ] 1.4 `app/robots.ts`: update the `/api/media/` allow + comment (route retired, images on blob host)
- [ ] 1.5 Verify locally with token: `media.url` in API responses is a blob URL; `bun run check` and build pass

## 2. Optimizer opt-out for old posts

- [ ] 2.1 `lib/payload/queries.ts`: helper returning the newest-15 published slug set (reuse `getPublishedPostSlugs()`, cached, tag `posts`)
- [ ] 2.2 Thread `unoptimized` through the article path: post page → `PostArticle` → rich-text upload converter (`rich-text.tsx:202`) → `components/ui/image`
- [ ] 2.3 Same flag on blog listing/hub/category cards (e.g. `hub-popular.tsx` cover images) — without this ~⅔ of transformations remain
- [ ] 2.4 Verify: old-post HTML contains direct blob `<img src>` (no `/_next/image`), top-15 post still uses `/_next/image`

## 3. Cache lifetimes

- [ ] 3.1 `next.config.ts`: `minimumCacheTTL` → `60*60*24*365`
- [ ] 3.2 `lib/payload/queries.ts`: `cacheLife('days')` → `cacheLife('weeks')` (leave the explicit `{stale…}` override at line ~153 as is)
- [ ] 3.3 Confirm publish-time revalidation still refreshes a post (CMS hook → tag `posts`)

## 4. Ship and verify

- [ ] 4.1 Build + e2e smoke; merge via standard flow
- [ ] 4.2 Post-deploy: `curl -I` an old `/api/media/file/…` URL → 308 to blob; blob URL serves with long cache-control
- [ ] 4.3 After 48 h: Vercel usage (transformations + cache writes trending to ~0 for old corpus), Neon wakes on sociallama-v2 roughly halved; night-window function events mostly page renders only
