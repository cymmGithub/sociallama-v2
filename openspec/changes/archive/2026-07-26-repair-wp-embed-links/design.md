## Context

`lib/scripts/migrate-wp.ts` converts WP HTML to Lexical. Its iframe rule (around line 347) is a catch-all:

```js
html = html.replace(/<iframe[^>]*\ssrc="([^"]+)"[\s\S]*?(?:<\/iframe>|\/>)/gi, (_, src) => {
  notes.push(`iframe → link: ${url}`)
  return `<p><a href="${url}">${url}</a></p>`
})
```

That rule is right for third-party players, where nothing else preserves the URL. It is wrong for WP's internal post embeds, which ship a `<blockquote class="wp-embedded-content">` carrying the titled permalink *and* an iframe pointing at `…/embed/#?secret=…`. Both survive, so the body gets the link twice — once well-formed, once as a raw URL.

The raw one is also broken. Its href reaches the database percent-encoded and without a leading slash (`%2Ftop-6-branz…%2Fembed%2F%23%3Fsecret%3D…`, some double-encoded `%252F`), so it resolves relative to the current post and 404s. Verified live on the deployed site.

**13 occurrences across 7 published posts** (`#2, #47, #48, #49, #50, #54, #55`). Every one has its partner blockquote exactly two nodes above, linking to the same target. The 5 SEOFLY author embeds of the same shape were already removed by `add-blog-post-schema`.

Constraint that shapes this change: `wp-import` specifies the import as re-runnable "as a final pre-cutover refresh while the WP site is still publishing," and sociallama.pl is still WordPress. A data-only fix would be undone by the next import.

## Goals / Non-Goals

**Goals:**
- Stop the converter emitting the duplicate paragraph, so a re-import stays clean.
- Remove the 13 already-imported paragraphs from the production database.
- Leave every blockquote permalink intact — they are the surviving internal links.

**Non-Goals:**
- No change to third-party iframe handling (YouTube, Facebook).
- No re-run of the full import to fix the data (see Decision 2).
- No rendering-code change; the rich-text renderer is behaving correctly on bad input.
- Not fixing the soft-404 (`/{slug}` returns HTTP 200 with the 404 page). Real, adjacent, separate.

## Decisions

**1. Detect internal embeds by iframe class, falling back to the src shape.** Strip iframes matching `class="wp-embedded-content"`; also strip any iframe whose src matches `/embed/#?secret=`. *Why both:* the class is WP's own marker and is the honest signal, but the secret-suffixed src is the pattern actually observed in this corpus, so matching it as well means the rule cannot miss. Ordering matters — the strip must run **before** the catch-all iframe rule, or the catch-all consumes the node first. *Alternative:* drop only the paragraph whose text equals its href — rejected, it treats the symptom in the wrong layer and would still fire for legitimate bare-URL links.

**2. Repair the data with a targeted script, not a re-import.** A re-import would rewrite all 79 posts to fix 13 paragraphs, discarding hand edits and re-uploading media against the shared Blob store (a known collision hazard). The script instead deletes the specific nodes in place. *Why safe:* Payload versioning retains the pre-cleanup body.

**3. Delete the orphan; do not rewrite it into a link.** The blockquote two nodes above already links to the same target with its real title, so rewriting would produce a visible duplicate. *This reverses an earlier working assumption* that the raw URLs were the only link to those posts — inspecting the rendered page disproved it. Same treatment the author embeds got.

**4. Match the node the same way the author backfill did.** Find the paragraph by walking the Lexical tree for the `embed/#?secret=` substring, then require that (a) it contains no text beyond that URL and (b) a node within the preceding 3 carries a non-embed link to the same slug. Refuse to delete anything failing either test. *Why the second test:* it is what makes deletion provably lossless, per post, at run time rather than by trusting this analysis. Note that searching `fields.url` alone finds **nothing** — the needle lives in the text node while the href holds the encoded variant.

**5. Idempotent, dry-run by default.** Same shape as `backfill-guest-authors.ts`: prints the plan, writes only with `--apply`, targets prod with `--prod` (which also forces `NODE_ENV=production` so no dev push fires).

## Risks / Trade-offs

- **The deletion removes wanted text** → Mitigation: the paired-link precondition in Decision 4; dry run reviewed before applying; Payload versioning makes it reversible.
- **The converter regex strips a legitimate iframe** → Mitigation: both patterns are specific to WP's own embed markup; the existing `notes` mechanism records every strip in the import report, so a re-import surfaces what was dropped.
- **A future re-import reintroduces the paragraphs** → Mitigation: that is exactly what Decision 1 prevents; the converter fix is not optional.
- **The fix is invisible after applying** → the affected pages are cached (`'use cache'`, `cacheLife('days')`) and the write happens outside Next, so `revalidateTag` is swallowed. A redeploy or an in-admin re-save is required.
- **Trailing-slash hrefs** — the surviving blockquote links are stored as `/slug/` but render without the trailing slash. They resolve today; this change does not touch them.

## Migration Plan

1. Land the converter fix; confirm the iframe rule still degrades a third-party iframe to a link.
2. Dry-run the repair against production and confirm 13 nodes across the 7 known posts, each reporting its partner link.
3. Apply, then re-verify that no published post contains `embed/#?secret=` and that the blockquote count is unchanged.
4. Redeploy so the cached pages pick it up; spot-check one repaired post on the deployment.

Rollback: revert the converter commit; restore any post body from its Payload version history.

## Open Questions

- None blocking. One judgement call already made: the `/oferta` occurrence in post `#54` is treated like the rest — its partner blockquote links to `/oferta/`, a dead WP page that `lib/wp-redirects.ts` maps to `/#uslugi`. Deleting the orphan leaves that redirect-backed link in place, which is correct; repointing the blockquote itself is a separate content decision.
