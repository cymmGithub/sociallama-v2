## 1. Blocks in Payload

- [x] 1.1 Define `stat` (`value`, `caption`) and `pillars` (`items[2..6]{title, description?}`, `chip?`) block configs with Polish admin labels, each with Lexical `jsx.import`/`jsx.export`; enable `BlocksFeature` on the posts `content` editor
- [x] 1.2 Regenerate `payload-types.ts` and the admin importMap; revert the Blob entries the local generation strips before staging
- [x] 1.3 Prove no schema change: run `payload migrate:create` under a PTY and confirm it produces nothing, then delete any empty migration
- [x] 1.4 Round-trip test (`bun test`): markdown with one `Stat` and one `Pillars` → Lexical → markdown is unchanged; an unparseable `Pillars` line throws naming the line

## 2. Rendering the blocks

- [x] 2.1 Add `blocks.stat` and `blocks.pillars` converters to `rich-text.tsx`; styles in `post.module.css` (stat: accent rule, value and caption on one axis; pillars: numbered cards, 2 columns from tablet, chip only when set)
- [x] 2.2 Render test for both converters (existing `rich-text-upload.test.tsx` pattern), including a `pillars` block without chip

## 3. FAQ convention

- [x] 3.1 `lib/blog/faq.ts`: strict-shape detection (last `h2` starts with `FAQ`, then only `h3`+paragraph pairs to the end) returning the section index and question/answer pairs; unit tests covering the three matching prod posts' shapes and the `jak-angazowac` loose match
- [x] 3.2 Renderer: from the detected index render `details`/`summary` pairs, question `id` on the `details`, all closed; reuse the homepage FAQ ledger styling and its `::details-content` support gate
- [x] 3.3 `json-ld.tsx`: emit `FAQPage` from the same detection, plain-text answers, rendering locale
- [x] 3.4 `toc.tsx`: open the target's enclosing `details` before `lenis.scrollTo`; on mount open the `details` containing `location.hash`

## 4. Rail progress and heading anchors

- [x] 4.1 Remaining-time derivation (reading time × unread fraction from the body's bounding box, 60% viewport line) in the rail's Lenis subscription; label reads `zostało ~X min` / `przeczytane`; add the strings to `lib/content/blog.ts` (PL) and `blog.en.ts`
- [x] 4.2 `toc.tsx`: `data-passed` on entries before current and `--toc-fill` set to the current entry's bottom; CSS fill on the list's left rule; reduced-motion drops the transition
- [x] 4.3 Heading converter: wrap `h2` + copy-link button in a row so the heading name is unchanged; copy `origin+pathname+#id`, copied state ~1s; hidden below desktop; localized `aria-label`

## 5. Quote sharing

- [x] 5.1 `quote-share.tsx` client component mounted in `post-article.tsx`: `selectionchange` → toolbar when selection is ≥12 chars, non-collapsed, inside the body, and `(pointer: fine)`; X with text+URL, LinkedIn with URL, copy `„text” — title url`; closes on collapse
- [x] 5.2 Strings in `lib/content/blog.ts` / `blog.en.ts`; keyboard reachable buttons with accessible names

## 6. Translation pipeline

- [x] 6.1 `post-projection.ts`: project `block` nodes' string fields (including `items[]`) as runs with stable path keys; unit test with a fixture body carrying both blocks
- [x] 6.2 `translate-post.ts --extract/--apply`: block runs flow through extraction and are written back into the EN node
- [x] 6.3 `verify-post-en.ts`: compare block slug, field keys, and item count per position; test that a dropped item is reported

## 7. Verification

- [x] 7.1 `bun run check` (lint + types + tests) green
- [x] 7.2 Screenshots, both locales, desktop and mobile: `linkedin-premium-czy-warto`, `reklama-na-facebooku`, `najlepsze-hasztagi-insta` (FAQ), `jak-angazowac-na-facebooku…` (must be unchanged), a rail post for progress, a no-rail post for absence
- [x] 7.3 Playwright WebKit pass on the FAQ post: disclosures open/close, TOC jump into a closed question, anchor landing
- [x] 7.4 Confirm the three FAQ posts' EN headings still match the strict rule, or record that they render plain in EN
- [x] 7.5 e2e (`e2e-coverage`): FAQ disclosure + TOC jump on `linkedin-premium-czy-warto`; quote toolbar appears on selection in a desktop context

## 8. Follow-up for the SSI post (after merge, separate lane)

- [ ] 8.1 Add the two `Stat` and one `Pillars` instances to `content/posts/social-selling-index-linkedin/source.pl.md`, replacing the prose list the pillars block lifts; re-import on dev and review
- [ ] 8.2 Hand the user the `--prod` re-import block (media stash included) and, after it lands, run the EN chain and `verify:post-en`
