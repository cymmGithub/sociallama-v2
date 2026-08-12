# fix-blog-cover-focal-point

## Why

Blog post header covers render in a fixed 4:3 box with `object-fit: cover` and a dead-center crop, so covers whose subject sits off-center lose the important content out the sides of the box. Payload already stores a per-image focal point (`focalX`/`focalY`, with an admin picker), but the frontend ignores it — every crop is 50/50 regardless of what an editor sets.

Auditing the 73 covers behind the 79 published posts turned up a second, larger cause. The damage is overwhelmingly **horizontal** — captions and logo sequences running the full width of a master — and the 4:3 header is the only live surface that crops horizontally on almost everything: it narrows **62 of 73** covers, against 14 at 16:10 and 6 at 16:9. The hub's own 16:10 and 16:9 boxes were already fine. The library's median master is 1.50:1, so a 4:3 box is simply narrower than the art it holds, and a focal point can only choose which end of a too-narrow window to lose.

## What Changes

- The post header cover box moves from 4:3 to **16:10**, matching the ratio the `blog-cover-art` spec already requires of every master and the ratio the hub card already uses. 16:10 rather than 16:9: it retains the most image overall (91% vs 84%), and it takes less height off the square-ish masters, where subjects sit. Hub ratios are unchanged.
- Blog cover render surfaces (post header, hub featured lead, hub cards, popular rail) pass the stored focal point through as CSS `object-position`, so an editor-set focal point actually steers every live crop. Images without an explicit focal point keep today's centered crop (Payload defaults to 50/50).
- No change to the `Image` component itself — it already forwards a caller `style`, so this is a per-call-site `objectPosition` computed from the resolved media.
- Editorial pass: audit the published posts' rendered headers, set focal points in the Payload admin for the miscropped covers, and record the adjustments in the image audit artifact (existing `blog-cover-art` bookkeeping requirement). This is DB content — no git rollback — so the audit list is the record.

The two fixes address different axes and neither replaces the other: the wider box saves the horizontal casualties, the focal point saves the square masters that a wider box costs height. With both, the audit closes with three focal-point adjustments and **no recomposed masters** — at 4:3, three covers had no focal point that saved them.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `blog-cover-art`: adds a requirement that rendered cover crops honor the stored focal point on every cover surface; the existing "covers survive every live crop" verification changes the header's crop from 4/3 to 16/10 and gains focal-point adjustment as its repair tool (previously the only lever was recomposing the master).

## Impact

- `app/(frontend)/[slug]/post.module.css` — `.cover` aspect ratio 4/3 → 16/10. The cover is a self-contained block that bleeds past the stage's bottom edge, so only its own height changes; the header's column grid is untouched.
- `app/(frontend)/[slug]/post-article.tsx` (header cover), `app/(frontend)/blog/hub-featured.tsx`, `app/(frontend)/blog/post-card.tsx`, `app/(frontend)/blog/hub-popular.tsx` — pass `objectPosition` from `focalX`/`focalY`; EN routes share these components.
- Payload media rows: focal-point values set by editors during the content pass (production DB writes through the admin — low-stakes pre-launch, per project convention).
- Note: the stored focal point steers the *live* surfaces (they read it as CSS `object-position`) but does **not** re-cut the derived `og` file on a Local API write. Measured on media 297: after setting 20/50 the row's `sizes.og` kept its byte-identical centered crop. Payload only re-runs the resizer when an upload carries `uploadEdits` — `payload.update({ data: { focalX } })` has no file, so the whole resize block is skipped. Of the three adjusted rows only 297 has an `og` size at all (the other two masters are smaller than every cropped target, so Payload omitted those sizes), and its share image keeps the old crop until it is regenerated deliberately.
