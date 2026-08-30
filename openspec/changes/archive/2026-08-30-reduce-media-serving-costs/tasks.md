# Tasks — reduce media serving costs

## 1. Serve media straight from Blob

- [x] 1.1 `lib/payload/collections/media.ts`: `afterRead` hook rewriting `url`/`thumbnailURL`/`sizes[*].url` to the Blob origin (the `vercelBlobStorage` `disablePayloadAccessControl` flag in the original plan does not exist in 3.88.0 — see the hook's comment)
- [x] 1.2 `next.config.ts`: add `*.public.blob.vercel-storage.com` (store host: `cqipbump8rt7fbr0.public.blob.vercel-storage.com`) to `images.remotePatterns`
- [x] 1.3 `next.config.ts`: permanent redirect `/api/media/file/:file*` → `https://cqipbump8rt7fbr0.public.blob.vercel-storage.com/:file*`; store host confirmed live: `cqipbump8rt7fbr0.public.blob.vercel-storage.com` — hardcode it (public URL, not a secret); no token parsing needed
- [x] 1.4 `app/robots.ts`: update the `/api/media/` allow + comment (route retired, images on blob host)
- [x] 1.5 Verify locally with token: `media.url` in API responses is a blob URL; `bun run check` and build pass

## 2. Optimizer opt-out for old posts

- [x] 2.1 `lib/payload/queries.ts`: helper returning the newest-15 published slug set (reuse `getPublishedPostSlugs()`, cached, tag `posts`)
- [x] 2.2 Thread `unoptimized` through the article path: post page → `PostArticle` → rich-text upload converter (`rich-text.tsx:202`) → `components/ui/image`
- [x] 2.3 Same flag on blog listing/hub/category cards (e.g. `hub-popular.tsx` cover images) — without this ~⅔ of transformations remain
- [x] 2.4 Verified on :3001 — the one out-of-window post (`linkedin-premium-czy-warto`) serves its cover as a direct `<img src>` while its in-window related cards keep `/_next/image`; the body path has no dev content, so it is covered by `rich-text-upload.test.tsx` instead (both directions, mutation-checked)

## 3. Cache lifetimes

- [x] 3.1 `next.config.ts`: `minimumCacheTTL` → `60*60*24*365`
- [x] 3.2 `lib/payload/queries.ts`: `cacheLife('days')` → `cacheLife('weeks')` (leave the explicit `{stale…}` override at line ~153 as is)
- [x] 3.3 Confirmed live on :3001 — a title written straight to the DB stayed invisible (the week-long cache holding), then `POST /api/revalidate?tag=posts&tag=post:test-wpis-7` flipped the page immediately; the admin hook calls the same `revalidateTag(tag, 'max')` on the same tags (lib/payload/revalidate.ts)

## 4. Ship and verify

- [ ] 4.1 Build + e2e smoke; merge via standard flow
  - `bun run check` (737 tests) and `bun run build` green; blog e2e 15/16.
  - The one failure (`en-blog` category rows) is a dev-seed gap, not this
    change: the dev DB's 4 categories carry no EN translation at all
    (`slug` and `title` NULL), while production serves all four.
  - Merge not done — awaiting the close flow.
- [ ] 4.2 Post-deploy: `curl -I` an old `/api/media/file/…` URL → 308 to blob; blob URL serves with long cache-control
  - Pre-verified against the local production build on :3009:
    `/api/media/file/fb-ads.jpg` and `…/fb-ads-1024x640.jpg` both 308 to the
    blob host, and those blob URLs answer 200 with
    `cache-control: public, max-age=31536000`. Still to repeat on the
    deployment.
- [ ] 4.3 Verify against the baseline. Measured 2026-08-29/30 and quoted in the
      proposal: image optimization >$5 for the month; 726 distinct media files
      served in 24 h; **8,815 of ~17 k function events in 24 h were
      `/api/media/file/*`**; Neon `sociallama-v2` $3.94 of the org's $5.25
      August compute, **awake 17.7% of the month over 498 wake events**; and a
      00:00–06:00 UTC sample of 1,438 media-route + ~1,600 page events.

      | when | where | expect |
      | --- | --- | --- |
      | at once | `curl -I` an old `/api/media/file/…` | 308 to the blob host |
      | at once | an old post's HTML | body + cards direct off blob with `?v=`; the cover on `/_next/image` |
      | 1–2 days | Vercel → Observability, route `/api/media/file` | → ~0 invocations |
      | 1–2 days | Vercel → Usage → Functions | invocations down by roughly the 8,815 |
      | 1–2 days | Vercel → Observability, the redirect path | confirm the 308 bills **no** proxy invocation — `next.config` redirects are evaluated before middleware, but `proxy.ts` matches `/api/:path*`, so this is worth reading rather than assuming |
      | ~1 week | night window 00:00–06:00 UTC | mostly page renders; the media half gone |
      | ~1 week | Neon → Monitoring | **active time** down from 17.7% — the better metric than wake count |
      | ~30 days | Vercel → Usage → Image Optimization | the *absence* of the monthly re-transformation spike. This is the only proof `minimumCacheTTL` worked, and it cannot arrive sooner |
      | ongoing | Vercel → Usage → **Blob** | data transfer **up**. Cost moves here; it does not vanish |

      Three things that will look like failures and are not:

      - **The first week looks worse.** Every media URL changed host *and*
        gained `?v=`, so Google re-crawls the whole image corpus once.
      - **Neon wake count may not halve** even though media invocations go to
        zero. Wakes are driven by idle-gap boundaries, not request volume: if
        page renders already wake the instance in the same windows, removing
        media removes invocations without removing wakes. Read active time.
      - **Blob bandwidth rises.** Body images and cards on old posts now ship
        unoptimized. The saving is real on compute and transformations; it is
        partly spent on transfer.

      And three that are real failures, with what to check:

      - Function events on `/api/media/file/*` persist → the `afterRead` hook
        is not applying. Check `https://sociallama.pl/api/media?limit=1` and
        look at `url`: it must be a blob URL carrying `?v=`.
      - Transformations flat → the opt-out is not reaching the cards. Fetch a
        listing page holding an out-of-window post and look for a direct
        `…-1024x640.jpg` src.
      - Neon active time flat → the wakes were page renders all along, not
        media. Then the lever is `cacheLife`, and the night window is where to
        look.

## 5. Byte replacement after the move (folded in 2026-08-30)

Moving media onto the Blob CDN silently retires the repair procedure: bytes are
replaced under an unchanged filename, and `vercel cache purge` only ever
reached this project's CDN, never the Blob store's.

- [x] 5.1 Establish the facts rather than assume them: Vercel's docs give a
      unique query parameter as the answer for updated blob content and offer no
      blob purge; the store returns 200 for an unknown query param; Next's
      `matchRemotePattern` only compares `search` when the pattern defines one,
      and ours does not
- [x] 5.2 `lib/payload/collections/media.ts`: stamp `?v=<filesize>` on `url`,
      `thumbnailURL` and each `sizes[*].url` — per-variant filesize, so a re-cut
      changes every URL it touched; filesize rather than `updatedAt` so an alt
      edit does not churn the whole library
- [x] 5.3 `lib/payload/media-ops.ts`: drop the CDN purge from `finish()` (it
      would now only discard this project's warm page cache for nothing) and
      rewrite failure mode 3 in the module header
- [x] 5.4 `CLAUDE.md`: rewrite "Replacing media bytes on prod" — no purge for
      media, verify by reading `?v=` in the rendered `src`; `public/` assets
      keep the old `?v=N` + purge contract
- [x] 5.5 `e2e/case-studies.e2e.ts`: teach `trackImageRequests` the blob host,
      and assert the tracked list is non-empty — otherwise the refetch
      assertion passes on nothing once images leave the two hosts it knew
- [x] 5.6 Tests for the version: a byte replacement under the same filename
      produces a different URL; a missing filesize degrades to a bare URL

## 6. The opt-out must stop serving originals (found by review, 2026-08-30)

`unoptimized` makes `next/image` serve `src` verbatim, and three sites pass the
**original upload**: the post hero (`post-article.tsx`, `cover.url`), the hub
lead (`hub-featured.tsx`, `cover.url`) and body images (`rich-text.tsx`,
`media.url`). The listing cards are already fine — they ask for
`sizes.card ?? cover.url`.

The archive originals are unprocessed stock at DSLR resolution. Measured on
production, over the 60 distinct covers of the 65 out-of-window posts:
**61.8 MiB total, 13 covers wider than 2000px, 5 over 1 MiB.** The worst, with
the `card` variant Payload already generated beside it:

| post | original | `card` (1024w) | ratio |
|---|---|---|---|
| `/social-lama-podsumowanie-2021-roku` | 20.7 MiB, 6240px | 128 KiB | 165× |
| `/bialy-mis-zaprasza-do-reklamowania-sie-w-social-mediach` | 11.6 MiB, 8256px | 73 KiB | 163× |
| `/tiktok-zmienil-zasady-marketingowej-gry-ale-co-dalej` | 11.4 MiB, 8256px | 45 KiB | 259× |
| `/jak-zorganizowac-legalny-konkurs-na-facebooku` | 2.8 MiB, 7360px | 35 KiB | 82× |

The hero also carries `preload` + `fetchPriority: high`, so this is the LCP
element. The proposal's accepted trade-off ("~20–30% heavier for human
visitors") priced the JPEG listing variants, not the originals, and is wrong by
two orders of magnitude for these posts.

**6.1 is not follow-up work — the change makes these posts dramatically worse
than they are today, and should not merge without it.**

- [x] 6.1 `mediaSource()` in `lib/payload/media-refs.ts` picks the file: the
      original for an optimized render (that is the optimizer's job), the
      `card` variant for an unoptimized one, falling back to the original only
      where the source was too small to generate one. Wired at the post hero,
      the hub lead and the rich-text upload converter; `og` is deliberately not
      a candidate, it is cropped to 1200×630. Verified on :3001 — the
      out-of-window post's hero now serves `…-1024x640.jpg`. Covered by
      `media-refs.test.ts`, the render test, and a call-site guard in
      `image-optimizer-optout.test.ts` (all mutation-checked)
- [x] 6.2 Decided: **the cover stays on the optimizer whatever the post's
      age**; the opt-out keeps body images and listing cards. Chosen over
      capping the hero at the 1024w `card`, because the arithmetic changed
      under §3 — a cover is one image per page over 65 pages, and with
      `minimumCacheTTL` at a year that is a few hundred transformations a
      year, not the cost this change exists to remove (the whole 726-file
      corpus re-expiring *monthly* across 16 widths). Capping it would have
      traded the LCP element down to roughly half the pixels a 2× display
      wants, to save a rounding error. Rejected with it: a wider Payload
      `imageSize` plus backfill — a migration that re-inflates the bytes 6.1
      removed.

      Wired at `post-article.tsx` and `hub-featured.tsx` (`mediaSource(cover,
      false)`, `unoptimized={false}`); `HubFeatured` lost the `unoptimized`
      prop it only fed. Verified on :3001 — an out-of-window post's hero is
      back on `/_next/image` with the original, while the same post's listing
      card on `/blog/page/2` still serves `…-1024x640.jpg` directly.

- [x] 6.3 Re-checked on production after 6.1. The hero corpus over the 60
      out-of-window covers goes **60.3 MiB → 9.7 MiB**. What is left is one
      shape: **11 covers over 200 KiB, every one of them a PNG**, together
      ~6.2 MiB of the remaining 9.7 — Payload keeps the source format when it
      resizes, so a 1024w `card` cut from a PNG is still a PNG
      (`2023-06-smsupportsales.png` 970 KiB, `2018-01-Lama-na-blog.png`
      952 KiB, …). 23 of the 60 sources were under 1024px and have no `card`
      at all; those serve whole and are small, except where they are PNG. The
      remaining problem is therefore exactly what 6.4 targets, and nothing
      else is

### Durable follow-up — needs explicit per-run production approval

- [ ] 6.4 Re-encode the archive originals in place through `replaceMediaBytes`:
      cap the long edge at a sane maximum and re-encode. Safe to do in place
      now that the media hook stamps `?v=<filesize>` — the URL changes with the
      bytes, which is exactly what section 5 built. Wins the bytes permanently,
      for the optimizer path and the direct path alike, and cuts Blob storage
- [ ] 6.5 Dry-run on dev first, diff the reported savings, then one `--prod`
      run with approval — an approved plan is not approval to fire `--prod`
