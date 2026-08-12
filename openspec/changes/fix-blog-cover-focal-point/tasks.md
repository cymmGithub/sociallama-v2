# fix-blog-cover-focal-point — tasks

## 1. Focal point pass-through

- [ ] 1.1 Add a `focalPosition(media)` helper next to `resolveMedia` in `lib/payload/queries.ts`: returns `{ objectPosition: "X% Y%" }` when the row carries explicit focal values, `undefined` otherwise (null/undefined → no style, browser default 50/50).
- [ ] 1.2 Post header: pass the helper's result as `style` on the cover `Image` in `app/(frontend)/[slug]/post-article.tsx`.
- [ ] 1.3 Hub surfaces: same pass-through in `hub-featured.tsx`, `post-card.tsx`, and `hub-popular.tsx` (check `hub-video.tsx` for a cover crop while there).
- [ ] 1.4 Verify no-regression: a cover with default/null focal renders byte-identical styles to today (no `object-position` emitted).

## 2. Editorial audit and repair

- [ ] 2.1 Sweep the published posts' headers (Playwright screenshot loop over `/blog` slugs from the local dev DB, both locales for one spot-check) and list covers whose subject is cut by the 4:3 crop.
- [ ] 2.2 Set focal points in the Payload admin for each offender; re-screenshot to confirm the header, and check the hub card + featured lead for any adjusted cover.
- [ ] 2.3 Record every adjustment (media id, filename, old→new focal) in the image audit artifact, per the blog-cover-art bookkeeping requirement.
- [ ] 2.4 Spot-check one adjusted post's OG image (Payload regenerates the cropped `og` size on focal change).

## 3. Verify

- [ ] 3.1 `bun run check` and the blog-related e2e specs from the worktree.
- [ ] 3.2 Repeat the 2.1 sweep after repairs: no published post header cuts its cover's subject.
