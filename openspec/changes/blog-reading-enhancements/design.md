## Context

The post page (`app/(frontend)/[slug]/`) renders a Lexical body through `rich-text.tsx` with custom `heading`/`upload`/`link` converters, a sticky rail with a scroll-spy table of contents (`toc.tsx`, `lib/blog/toc.ts`), a reading-time estimate (`lib/blog/reading-time.ts`), and an in-article CTA placed by structure (`lib/blog/split-content.ts` cuts before the third `h2`). Posts use the bare `lexicalEditor()`; no block feature is enabled. Bodies are localized as a whole (`content` per locale) and the English body is produced by `translate-post.ts` through `post-projection.ts`, which flattens the tree into text "runs" and is the only thing that decides what text reaches the translator and what `verify-post-en.ts` compares.

The site header is `position: fixed` and hides on scroll-down via Lenis's `direction`; that is deliberate reading space and stays untouched.

Survey of the 81 published posts (prod REST, 2026-09-07): 62 have a rail (≥3 headings), 71 have headings, 3 close with an `h2` "FAQ…" followed only by `h3`+paragraph pairs, 0 contain a bold-led ordered list, 13 mention a percentage figure in prose.

## Goals / Non-Goals

**Goals:**
- Give the reader progress and orientation inside the existing rail, without a second progress surface.
- Let editors lift a figure or an enumerated set out of prose on purpose, with the text stored once, in the body, in both locales.
- Turn the strict-shape FAQ closer into disclosures plus `FAQPage` data, automatically and safely.
- Keep `source.pl.md` the single authored source for a post: blocks must survive `import-post` and the EN chain.

**Non-Goals:**
- A viewport-edge progress bar, or a header exception on post pages.
- Checklists, sliders, or any state the page remembers for the reader.
- Retrofitting blocks into the 81 existing posts. Nothing changes in their bodies.
- Rich-result guarantees for `FAQPage`.
- The lead-paragraph enlargement from the mock.

## Decisions

### D1. Blocks live in the Lexical JSON (`BlocksFeature`), not in a layout field and not in render-time heuristics
`stat` and `pillars` are added through `BlocksFeature({ blocks })` on the posts `content` editor. Block data is stored inside the rich-text JSON node (`type: "block"`, `fields`), so there is **no SQL migration**; existing rows are untouched and the admin gains an "insert block" entry in the editor.

Alternatives: a separate `blocks` layout field (own tables, migration, and the block would sit outside the reading flow instead of at the paragraph the editor chose); render-time conventions (a "bold-led `ol` becomes cards" rule matches zero existing posts today and would match the wrong list eventually, and no textual pattern identifies a pull-stat at all). The FAQ is the one place a convention is safe, because its shape is unambiguous — see D4.

### D2. Block shapes are minimal and text-only
- `stat`: `value` (text, e.g. `45%`), `caption` (text, one sentence). Rendered as an aside on the orange rule, value and caption centred on one axis, after the paragraph the editor places it under.
- `pillars`: `items` (array, 2–6, of `title` + optional `description`), `chip` (optional text shown on every card, e.g. `maks. 25 pkt`). Rendered as a numbered card grid, two columns from the tablet breakpoint, one below.

No rich text inside blocks: keeps the projection (D5) a flat list of text fields and keeps the JSX import (D3) parseable. Card numbering comes from array order; the ordinal is structure, not decoration, because the article refers to the items as "Filar 1…4".

### D3. Markdown import uses Lexical's JSX block syntax
`import-post.ts` already converts `source.pl.md` with `convertMarkdownToLexical` and the project editor config. Each block declares `jsx.import`/`jsx.export`, so the source can carry:

```md
<Stat value="45%">więcej szans sprzedażowych generują osoby z wysokim SSI</Stat>

<Pillars chip="maks. 25 pkt">
1. **Establish your professional brand** (Budowanie profesjonalnej marki osobistej).
2. **Find the right people** (Znajdowanie odpowiednich osób).
</Pillars>
```

`Pillars.import` parses the child lines as `N. **title** description`; a child that does not parse aborts the import, mirroring the body-image guard. A round-trip test (markdown → Lexical → markdown) pins the syntax.

### D4. FAQ disclosures by strict shape, detected server-side once
`lib/blog/faq.ts` walks the root children like `toc.ts` does and returns the FAQ section only when: an `h2` whose text starts with `FAQ` (case-insensitive) is followed by one or more `h3`+paragraph pairs **and nothing else** to the end of the body. Any other shape returns null and the body renders as today. The same result feeds three consumers: the renderer (nodes from that index render as `details`/`summary` with the `h3` inside the summary and its existing `id` on the `details`), `json-ld.tsx` (`FAQPage` with plain-text answers), and `toc.tsx` (D6). Disclosures reuse the homepage FAQ ledger's styling contract, including its `::details-content` support gate (see `details-content-safari-184-gate`).

All disclosures start closed. Opening is explicit (D6), never left to the browser's ancestor-reveal behaviour, which Lenis-driven scrolling bypasses.

### D5. Translation projection learns block nodes
`post-projection.ts` gains a case for `type: "block"`: every string field of `fields` (and of each `items[]` entry) becomes a run with a stable path key (`fields.caption`, `fields.items.2.title`). `translate-post --extract` therefore includes block text, `--apply` writes it back into the EN copy of the node, and `verify-post-en` compares block structure (block slug, item count, field keys) as it compares heading levels today. A `stat.value` such as `45%` is a run like any other; the reviewer keeps it unchanged.

### D6. Progress and jumps stay in the rail and in `toc.tsx`
- Remaining minutes: `readingTimeMinutes × (1 − fraction)`, where fraction is the article body's read portion from its bounding box against the viewport (60% line), computed in the same Lenis scroll subscription the scroll-spy uses. Shown as `zostało ~X min`, or `przeczytane` at the end; never below the existing estimate at the top.
- Guide line fill: the list sets `--toc-fill` (px) to the bottom of the current entry; CSS draws the fill on the list's left rule. Entries before the current one get `data-passed`.
- Jump into a disclosure: `handleClick` opens the target `details` (or the `details` containing the target) before `lenis.scrollTo`. Direct `#anchor` landings run the same open step once on mount.
- Selection toolbar, anchors, and progress all honour `prefers-reduced-motion` by dropping transitions only; nothing depends on motion.

### D7. Heading copy-link is a sibling control, not heading content
The heading converter wraps `h2` and a `button` in a `div` row so the heading's accessible name stays the heading text. The button copies `origin + pathname + '#' + id` and confirms with a temporary label change; hidden below the desktop breakpoint where there is no gutter for it.

### D8. Quote sharing is a single client component over the body
Mounted once in `post-article.tsx`; listens to `selectionchange`, acts only when the selection is non-collapsed, ≥ 12 characters, inside the article body, and the device has a fine pointer. Actions reuse `postShare` URLs: X gets the quote text and URL; LinkedIn's share endpoint takes only the URL (documented limitation, the button still opens the share); copy writes `„quote” — title URL`. The toolbar is positioned from the range's bounding rect and closed on collapse.

## Risks / Trade-offs

- [Lexical JSX import mis-parses a block] → round-trip test per block; import aborts on an unparsed child instead of dropping it silently, like the body-image guard.
- [`payload generate:importmap` strips the Blob entries locally] → known; revert the stripped lines before staging (`local-build-strips-blob-importmap`).
- [FAQ detection also runs on the EN body, where the heading may not start with "FAQ"] → verify the three existing posts' EN headings in the change; the rule is per rendered locale, so a mismatch degrades to today's plain rendering, never to a broken page.
- [Two existing posts' FAQ sections change appearance without an editor touching them] → the three posts are named in the proposal; screenshot them in the change's verification, both locales.
- [Blocks in `content` mean the EN body is stale until re-applied] → already true for body images; `verify-post-en` reports the divergence, and the SSI post's EN chain runs after the block re-import.
- [Selection toolbar fights native selection UI on touch] → fine-pointer gate; no toolbar on touch devices.
- [`details` styling regressions on Safari] → reuse the gated homepage ledger styles; Playwright WebKit pass in verification.

## Migration Plan

1. Merge and deploy: no DB migration; `payload-types.ts` and the admin importMap regenerated in the change.
2. Existing posts re-render on the new deployment; nothing to revalidate by hand.
3. SSI post: after the change is on `main`, add the four block instances to `content/posts/social-selling-index-linkedin/source.pl.md`, re-import (`--prod` by the user via `!`, idempotent by slug), then re-run the EN chain (`translate:post --extract` → review → `--apply --prod --revalidate`) and `verify:post-en`.
4. Rollback: revert the deploy. Bodies that already contain block nodes render through the library's unknown-node fallback (spec: unknown node types never crash the page) until re-imported without blocks.

## Open Questions

- None blocking. Whether LinkedIn's share endpoint will ever accept quote text is outside our control; the button's copy must not promise it.
