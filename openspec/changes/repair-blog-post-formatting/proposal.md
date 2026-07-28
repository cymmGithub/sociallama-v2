## Why

An audit of all 79 live posts found the blog carrying roughly 4,100 formatting defects inherited from the WordPress import, plus a structural heading problem that predates it. Three are visible to any reader: **1,204 justified nodes** across 57 posts produce severe word-spacing rivers in Polish at the 680px measure; **22 posts open with an oversized `h2` that duplicates the excerpt already shown in the page header** (the worst is 778 characters and renders as an 11-line, 405px-tall wall that becomes the entire first table-of-contents entry); and **748 spacer paragraphs** across 64 posts fight the body's `gap` rhythm.

Underneath that, the heading hierarchy is broken badly enough to disable a shipped feature: **38 of 79 posts contain no `h2` at all**, using `<p><strong>Label</strong></p>` as fake headings. Since `lib/blog/toc.ts` only tracks `h2`/`h3` and `MIN_TOC_ENTRIES` is 3, **only 35 of 79 posts render a table of contents** — the rail built in `refine-blog-post-page` is dark on more than half the blog.

`lib/scripts/wp-html-prepass.ts` handles no alignment or whitespace, so re-running the importer would reintroduce the mechanical defects. Repairing the data without hardening the converter would leave a regression waiting.

## What Changes

- **A repair script** (`lib/payload/repair-post-formatting.ts`, run as `payload:repair:post-formatting`) strips presentational debris from `posts.content`: `format: 'justify'` on every node type, spacer paragraphs whose entire content is `<br>`/`&nbsp;`/empty `<strong>`, and non-breaking spaces used as ordinary word spaces. Follows the established `repair-wp-embed-links.ts` pattern exactly — dry-run by default, `--apply` to write, `--prod` to target `DATABASE_URL_PROD`, skip-and-report rather than guess, idempotent.
- **The 10 legitimate `text-align:center` nodes are preserved.** This is why the fix is a data migration rather than the `disableTextAlign` prop on `RichText`, which is all-or-nothing per node type and would also leave the admin editor showing justified text to the next person who opens it.
- **The WP converter is hardened** so `migrate-wp.ts` can no longer emit alignment formats, spacer paragraphs, or `&nbsp;` runs.
- **The 22 duplicated intro headings are repaired editorially**, in three cases: the heading is a strict subset of the lead (delete the block outright — the reader already read it); the heading is longer than the lead (drop the duplicated prefix, demote the remaining tail to a paragraph, write a real heading for the section it opens); or the heading is genuine but verbose (shorten). **All replacement Polish copy is drafted into a single review document and approved before anything is applied** — no headline ships unreviewed.
- **Heading hierarchy is restored across all 38 posts with no `h2`**, promoting bold-paragraph pseudo-headings to real headings, fixing the 3 posts that open at `h3`, and re-levelling the 15 posts using `h4`–`h6` (including `h6` as image captions). Table-of-contents coverage rises from 35/79 to most of the blog as a consequence.
- **A formatting verifier** (`lib/payload/audit-post-formatting.ts`) reads the Payload content directly and reports every defect class with counts. It is the change's done-definition and a standing regression check — unlike the throwaway HTTP-scraping script used for the audit, it sees drafts and reads the source of truth.

## Capabilities

### New Capabilities
- `blog-content-integrity`: the editorial invariants a post body must satisfy regardless of how it got into the CMS — no heading duplicating the post's own excerpt, a heading hierarchy that starts at `h2` and skips no level, section labels marked up as headings rather than bold paragraphs, and a verifier script that enforces all of it.

### Modified Capabilities
- `wp-import`: the HTML→Lexical converter gains requirements that migrated bodies carry no presentational alignment, no spacer paragraphs, and no `&nbsp;` used as a word space — plus repaired-content scenarios covering posts imported before this change.

## Impact

- **Payload data**: `posts.content` rewritten across ~70 posts. No schema change, no migration file. Both the script and the editorial work write the same field, so they must not run concurrently.
- **New code**: `lib/payload/repair-post-formatting.ts`, `lib/payload/audit-post-formatting.ts`, two `package.json` scripts.
- **Modified**: `lib/scripts/wp-html-prepass.ts` (+ its existing test file), possibly `lib/scripts/migrate-wp.ts`.
- **Content, hand-edited**: 22 posts for intro headings, 38 for hierarchy (overlap is small; roughly 50 distinct posts).
- **Anchor-ID churn is accepted, not mitigated.** Heading text becomes the anchor `id`, so today's longest `#fragment` is 758 characters and every repaired heading changes its anchor. Nothing external links to these — WordPress slugified differently and the site is pre-launch.
- **Not touched**: page width and layout. Measured chars-per-line is already 75–83, above the readable ceiling, so widening `--post-measure` would make the prose worse. The separate composition question — the 1360px header stage stepping down to a 1008px article — is handled as its own mock-first CSS change.
- **Scope**: Polish only; the blog is not in the EN tree. Case studies render through the same `PostRichText` but are out of scope.
- **Risk surface**: a repair that mis-identifies a spacer paragraph could delete real content (mitigated by dry-run-first and conservative matching), and concurrent admin editing during the migration could be clobbered (mitigated by task ordering).
