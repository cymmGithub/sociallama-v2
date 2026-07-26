## Why

The WordPress import left 13 dead links across 7 published posts. WordPress renders an internal post embed as **two** elements — a `<blockquote class="wp-embedded-content">` carrying the titled permalink, plus an `<iframe src="…/embed/#?secret=…">` that hydrates into a card. `migrate-wp.ts` converts the blockquote correctly, then its catch-all "iframe → link" rule turns the iframe's src into a second, redundant paragraph. The result on every affected post is a good titled link immediately followed by a raw URL:

```
┃ TOP 6 branż dla influencer marketingu          ← href="/top-6-branz-dla-influencer-marketingu", works
https://sociallama.pl/top-6-branz-…/embed/#?secret=coiSnrg1T1#?secret=wNbhKpXHRn   ← dead duplicate
```

Those duplicate paragraphs are not merely ugly. Their `href` was percent-encoded by the converter (`%2Ftop-6-branz…%2Fembed%2F…`, some double-encoded) and carries no leading slash, so each resolves relative to the current post and lands on a page that does not exist. They are live on the deployed site today.

## What Changes

- Fix the converter: an `<iframe>` that is a WordPress **internal post embed** (`class="wp-embedded-content"`, or a src matching `…/embed/#?secret=…`) SHALL be dropped rather than degraded to a link, because its sibling blockquote already carries the permalink. All other iframes keep today's degrade-to-link behaviour.
- Repair the already-imported data: remove the 13 orphaned raw-URL paragraphs (and the blank spacer paragraph each sits beside) from the 7 affected posts, leaving every blockquote link untouched.
- Both halves are needed: the import is specified as re-runnable as a final pre-cutover refresh, so a data-only fix would be reintroduced by the next run.

## Capabilities

### New Capabilities
<!-- none — this repairs an existing capability's output rather than adding one -->

### Modified Capabilities
- `wp-import`: adds a requirement that a WordPress internal post embed converts to exactly one link (the blockquote permalink), with no duplicate raw-URL paragraph. Tightens the existing "Media re-hosted, no WP references" and content-fidelity requirements, which cover images and dropped nodes but say nothing about oEmbed placeholders.

## Impact

- **Code**: `lib/scripts/migrate-wp.ts` — narrow the iframe rule so internal post embeds are stripped before the catch-all applies.
- **Content migration**: a one-off, idempotent script that strips the orphaned paragraphs from posts `#2, #47, #48, #49, #50, #54, #55` in the (pre-launch) production database. Payload versioning keeps the pre-cleanup bodies recoverable.
- **Deploy**: the affected pages are cached (`'use cache'`, `cacheLife('days')`); a redeploy or tag revalidation is required for the fix to appear on the deployed site.
- **Scope**: Polish blog posts only. No schema change, no new collection, no rendering-code change. The 5 SEOFLY author embeds were already removed by `add-blog-post-schema` and are out of scope here.
- **Explicitly not in scope**: the pre-existing soft-404 (a nonexistent `/{slug}` returns HTTP 200 with the 404 page, so these dead links are currently indexable as valid pages). Worth its own change.
