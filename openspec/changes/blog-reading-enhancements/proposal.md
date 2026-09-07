## Why

Long guides (the new `social-selling-index-linkedin` post runs ~2,800 words) render as an undifferentiated column of paragraphs: the reader has no sense of progress, the article's own numbers and structures (four pillars worth 25 points each, "45% more opportunities") are buried in prose, and the FAQ that closes several posts reads as one more wall. The mock reviewed on 2026-09-07 (Artifact `6209ef34`) settled on seven enhancements; two were cut (checklists, SSI slider) and the viewport-edge progress bar was dropped in favour of progress in the rail.

## What Changes

- **Reading progress in the rail.** The sticky rail shows "zostało ~X min" beside the table-of-contents label, the table-of-contents guide line fills to the current entry, and entries already passed are marked as read. No viewport-edge bar; the site header hides on scroll-down and must not gain an exception.
- **Heading anchors.** Each `h2` gains a copy-link affordance shown on hover/focus (desktop), copying the heading's existing anchor URL.
- **Pull-stat block** (new Lexical block `stat`): a figure plus a short caption, rendered as an aside on the orange rule. Editor-authored; the SSI post uses two (45%, 51%).
- **Pillars block** (new Lexical block `pillars`): an ordered set of 2–6 titled items rendered as a numbered card grid, each card optionally carrying a chip (the SSI post: "maks. 25 pkt"). Editor-authored. Blocks are stored inside the post's Lexical JSON, so no SQL migration.
- **FAQ accordion by convention.** When an `h2` whose text starts with "FAQ" is followed by nothing but `h3`+paragraph pairs to the end of the body, that section renders as a disclosure list (`details`/`summary`) and the page emits `FAQPage` JSON-LD. Any other shape renders as today. Applies automatically to three existing posts (`reklama-na-facebooku`, `najlepsze-hasztagi-insta`, `linkedin-premium-czy-warto`) and the new one; the loose match that would have caught `jak-angazowac-na-facebooku` is excluded by the strict-shape rule.
- **Quote sharing.** Selecting body text on a pointer device shows a floating toolbar to share the selection on LinkedIn or X, or copy it as a quote with the post URL.
- **Import and translation pipelines learn blocks.** `import-post.ts` accepts the two blocks in `source.pl.md` through Lexical's JSX block syntax; `translate-post` / `verify-post-en` project block text fields so an English body keeps its blocks.
- The lead-paragraph enlargement shown in the mock is **not** shipped: 23 posts open with an `h2` and 5 with a one-line intro such as "W tym artykule dowiesz się:".

## Capabilities

### New Capabilities
- `blog-content-blocks`: editor-authored Lexical blocks inside post bodies (`stat`, `pillars`): admin availability, storage, rendering, markdown import syntax, and translation round-trip.

### Modified Capabilities
- `blog-post-page`: table of contents gains progress state (remaining time, fill to current, passed entries); `h2` headings gain a copy-link affordance; FAQ sections of the strict shape render as disclosures and table-of-contents jumps open the target disclosure; body text selection offers quote sharing.
- `blog-structured-data`: post pages whose body carries a strict-shape FAQ section emit `FAQPage` JSON-LD alongside `BlogPosting`.
- `blog-content-integrity`: "a translation preserves the original's structure exactly" extends to block nodes and their text fields.
- `payload-cms`: the Posts collection's rich-text editor offers the `stat` and `pillars` blocks.

## Impact

- `lib/payload/collections/posts.ts` (BlocksFeature on `content`), `payload-types.ts`, admin importMap regeneration (revert the Blob-stripping side effect before staging, see `local-build-strips-blob-importmap`).
- `app/(frontend)/[slug]/`: `rich-text.tsx` (block converters, FAQ convention), `toc.tsx` (progress, open-details-before-jump), `post-article.tsx` (remaining time, selection toolbar mount), `json-ld.tsx` (FAQPage), `post.module.css`.
- `lib/blog/`: FAQ-shape detection and remaining-time derivation next to `toc.ts` / `reading-time.ts`.
- `lib/payload/import-post.ts`, `translate-post.ts`, `verify-post-en.ts`, `post-projection.ts`.
- `content/posts/social-selling-index-linkedin/source.pl.md` gains the four block instances once the change lands; the post itself ships independently from the `quick-fixes` lane first, plain.
- Affects all 81 published posts only where their existing structure matches: progress/anchors/quote sharing everywhere the rail or headings already exist; FAQ disclosures on the three posts named above; blocks nowhere until an editor inserts one.
