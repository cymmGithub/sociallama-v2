> **Phase ordering is load-bearing.** Groups 1–4 (mechanical) MUST fully complete
> before group 6 (editorial) begins — both write `posts.content`, and a concurrent
> admin save during a migration silently loses one side (design D5). Do not interleave.

## 1. Verifier

- [x] 1.1 Create `lib/payload/audit-post-formatting.ts` — walks `posts.content` Lexical trees via the Local API, covering drafts as well as published posts; supports `--prod` the same way `repair-wp-embed-links.ts` does
- [x] 1.2 Implement the defect predicates, each reported separately with per-post detail: `justify` format nodes, spacer paragraphs, word-space non-breaking spaces, headings over 85 characters, headings duplicating the post excerpt, posts with no `h2`, `h3`-before-`h2`, bold-paragraph pseudo-headings, and `h4`–`h6` usage
- [x] 1.3 Report the count of deliberate `center` nodes as a preservation baseline, not as a defect — **amended (D9):** the baseline counts centred nodes that carry content (9), not all centred nodes (10); the tenth is an empty paragraph carrying a `center` format, i.e. a spacer
- [x] 1.4 Export the predicates so the repair script imports them rather than restating them (design D2 — fixer and verifier cannot disagree about what a defect is) — they live in `lib/payload/post-formatting-rules.ts`, since both scripts open a database connection at module load and could not import each other
- [x] 1.5 Register `payload:audit:post-formatting` in `package.json`
- [x] 1.6 Run against dev and record the baseline **including drafts**; confirm whether the true totals exceed the published-only audit figures (justify 1204, spacers 748, nbsp 2186, bloated headings 22, no-`h2` 38, TOC coverage 35/79) — **see the baseline table below.** No drafts exist; the corpus is 79 published posts

## 2. Repair script

- [x] 2.1 Create `lib/payload/repair-post-formatting.ts` on the `repair-wp-embed-links.ts` pattern: dry-run by default, `--apply` to write, `--prod` for `DATABASE_URL_PROD`, prints the target DB host, idempotent, skip-and-report rather than guess
- [x] 2.2 Implement `--justify`: clear a `justify` alignment format wherever it appears, on every node type; leave `center` untouched
- [x] 2.3 Implement `--spacers`: remove paragraphs whose entire content, after stripping inline wrappers, is empty, line breaks, or non-breaking spaces — skip and report anything carrying a single visible character
- [x] 2.4 Implement `--nbsp` — **amended (D3 revised):** resolved per block, not per text node, and covering padding runs as well as word spaces. Preserves one- and two-character tokens and grouped numbers
- [x] 2.5 Default to all three classes with no flag; fetch, mutate, and write each post once
- [x] 2.6 Register `payload:repair:post-formatting` in `package.json`
- [x] 2.7 Add unit tests for the three predicates against fixtures drawn from real defect samples, including the preserve cases — `lib/payload/post-formatting-rules.test.ts`, 27 cases

## 3. Apply the mechanical repair

> **Amended (D8):** there is no dev database holding the corpus — the local dev
> DB carries 15 fixture posts and the 79 imported posts exist only in the
> database `DATABASE_URL_PROD` points at. The rehearsal therefore runs against
> `sociallama_wpcopy`, a `pg_dump` restore of that database into the local
> Postgres container, with `DATABASE_URL` overridden per command.

- [x] 3.1 Dry-run against the rehearsal copy; read every reported node, confirming no real content is in the removal set — the removal set is exactly 751 paragraphs: 475 empty, 276 holding a single non-breaking space. None carries a visible character; nothing was skipped
- [x] 3.2 Apply against the rehearsal copy
- [x] 3.3 Re-run the verifier: justify, spacer, word-space and padding nbsp counts are zero; centred content nodes hold at 9 and deliberate non-breaking spaces at 51
- [x] 3.4 Spot-check the worst offenders in the browser — all three render with `text-align: justify` on zero blocks, no empty paragraphs and no stray non-breaking spaces (checked via computed style, not markup). **This is what turned up the `.body` gap bug:** vertical rhythm was *not* even afterwards, because the template's paragraph spacing had never worked — see the Impact note in `proposal.md`. Re-checked after the CSS fix: paragraph gap 0px → 12px
- [x] 3.5 Re-run the repair unchanged to prove idempotency: zero posts modified on the second pass

## 4. Harden the importer

- [x] 4.1 In `lib/scripts/wp-html-prepass.ts`, drop `text-align: justify` (inline and via WP alignment classes) while preserving `center`
- [x] 4.2 Drop WordPress spacer paragraphs during the prepass
- [x] 4.3 Convert word-space non-breaking spaces using the same rule as task 2.4, sharing the predicate rather than duplicating it — the prepass calls `planNbsp` with DOM text nodes as leaves; the rule exists once
- [x] 4.4 Extend `lib/scripts/wp-html-prepass.test.ts` with cases for all three, including the `center` and single-letter-preposition preserve cases — 13 new cases, 45 passing across both files
- [x] 4.5 Confirm a re-import over already-repaired content produces bodies with none of the three debris classes — a body carrying every defect shape was run through the real `prePass` → `convertHTMLToLexical` pipeline and the verifier's predicates applied to the resulting tree: 0 justify, 0 spacers, 0 word-space nbsp, 0 padding nbsp, centring intact, 4 deliberate non-breaking spaces preserved

## 5. Prod migration

- [x] 5.1 Dry-run against prod — counts identical to the rehearsal (993 justify, 762 blank blocks, 69 word-space + 1790 padding nbsp across 77 posts); no difference to explain
- [x] 5.2 Apply against prod — mechanical then editorial, 2026-07-28. **Note:** a long `--apply` run can outlive its shell; an audit taken immediately after read a mid-write state and looked untouched. Idempotency made the overlap harmless, but verify by re-running the script, not by timing
- [x] 5.3 Verifier against prod matches the rehearsal exactly, and a second pass of each script changes nothing
- [x] 5.4 Revalidate — the scripts write from their own process, so the `revalidateTag` in `revalidatePostAfterChange` is swallowed (no Next request scope). The deploy that follows rebuilds the pages, which is what picks the new content up; a script run alone never will

## 6. Heading review document

- [x] 6.1 Extend the verifier with a `--review` mode that emits one markdown document covering every affected post — `heading-review.md`, 992 lines, 88 posts across four sections
- [x] 6.2 Classify the duplicated intros — **32, not 22** (the verifier counts every post, the original audit only first headings). Split into **7 restatement** (delete), **19 extended** (intro prose marked up as a heading), **6 likely genuine** (short section labels). The mechanical proposal called all 32 "subsumed"; reading them showed why that was wrong — see the amendment below
- [x] 6.3 Draft the replacement Polish headings — **almost none are needed.** In 19 of 19 extended cases the section already carries a label immediately after the giant heading, so the fix promotes existing copy rather than authoring new. Each entry lists what follows it under **What follows it**
- [x] 6.4 For the 38 posts with no `h2`, identify which bold paragraphs are section labels and propose the level for each; flag any post whose content genuinely has no sections — section 2, one table per post; posts with no candidates carry an explicit "may genuinely have no sections" note
- [x] 6.5 Propose re-levelling for the `h3`-first posts and those using `h4`–`h6` — section 3
- [x] 6.6 Submit the document for approval — approved wholesale on 2026-07-28; the proposals stood except where reading them changed the call (see D10)

> **Amended (D10):** the excerpts were auto-generated from each post's opening,
> so almost every intro heading is a verbatim prefix of its excerpt. Containment
> therefore proves nothing on its own — a genuine short section label at the top
> of the body is a prefix too. The split turns on how much of the excerpt the
> heading accounts for: ≥80% is a restatement, longer than the excerpt is intro
> prose, a short label with a long excerpt is genuine. `media-spolecznosciowe-jako-pomoc-w-sprzedazy`
> ("Budowanie Marki", 15 chars) and `jak-stworzyc-biogram-na-instagramie`
> ("Czym jest bio na Instagramie?") are real headings the original rule would
> have deleted.

## 7. Apply the editorial repair

- [x] 7.1 Apply the approved intro-heading fixes — **31 posts, not 22**: 7 restatements deleted, 19 intro-prose headings demoted (the duplicated prefix dropped), 6 genuine labels deliberately kept. Applied by `payload:apply:heading-fixes`, not by hand — 51 posts of admin editing would not have been reviewable
- [x] 7.2 Apply the approved heading-hierarchy fixes — 78 bold paragraphs promoted, 5 image credits demoted, 8 oversized headings resolved, 120 headings re-levelled across 50 posts
- [x] 7.3 Re-run the verifier: zero over 85 characters, zero excerpt-duplicating, zero `h3`-before-`h2`. Posts without an `h2` land at 10, not zero — 37-213-word news items from 2017-2018 about features since discontinued, read individually and deliberately left flat (see the note under group 7)
- [x] 7.4 Table of contents renders on 60 of 79 posts, up from 35; the 19 without one have fewer than three sections. `google-polaczylo-social-media-z-seo` reads as a flat list of real sections with its 419-character intro heading demoted
- [x] 7.5 Confirm no anchor `id` exceeds a sane length now that no heading is a paragraph — longest on the worst post is 45 characters, against 758 before

## Baseline (task 1.6) — verifier against the corpus, 79 posts, no drafts

| defect | proposal's figure | verifier | after repair (rehearsal) |
| --- | --- | --- | --- |
| `justify` nodes | 1,204 | 1,204 | **0** |
| spacer paragraphs | 748 | 751 + 11 empty headings | **0** |
| word-space nbsp | — | 69 | **0** |
| padding nbsp | — | 1,790 | **0** |
| nbsp deliberately kept | 74 | 51 | 51 (unchanged) |
| nbsp inside removed spacers | — | 276 | — |
| centred nodes with content | 10 | 9 | 9 (unchanged) |
| headings > 85 chars | 22 | 31 in 26 posts | 31 (editorial) |
| headings duplicating the excerpt | 22 | 32 | 32 (editorial) |
| posts with no `h2` | 38 | 38 | 38 (editorial) |
| posts opening at `h3` | 3 | 7 | 7 (editorial) |
| bold pseudo-headings | 78 | 80 in 23 posts | 80 (editorial) |
| `h4`–`h6` headings | — | 63 in 15 posts | 63 (editorial) |
| posts rendering a TOC | 35 / 79 | 35 / 79 | 35 / 79 (editorial) |

Where the verifier and the proposal disagree, the verifier is right — the
proposal's numbers came from scraping rendered HTML, which cannot see node
boundaries. The nbsp total reconciles exactly: 69 + 1,790 + 51 + 276 = 2,186.

The structural counts are higher because the verifier counts every heading
rather than each post's first, and reads `h3`-before-any-`h2` rather than only
posts that also have an `h2`. Both are supersets of what the proposal
measured, so no editorial work goes missing.

## Final state (task 8.2) — verifier against prod, 79 posts

| defect | before | after |
| --- | --- | --- |
| `justify` nodes | 1,204 | **0** |
| blank blocks (spacers + empty headings) | 762 | **0** |
| word-space nbsp | 69 | **0** |
| padding nbsp | 1,790 | **0** |
| headings > 85 chars | 31 | **0** |
| headings duplicating the excerpt | 32 | **0** |
| bold pseudo-headings | 80 | **0** |
| `h4`-`h6` headings | 63 | **0** |
| posts opening at `h3` | 7 | **0** |
| lead paragraphs repeating the excerpt | 41 | **0** |
| posts with no `h2` | 38 | 10 (deliberate) |
| posts rendering a table of contents | 35 / 79 | **60 / 79** |
| nbsp deliberately kept | 51 | 51 (unchanged) |
| centred nodes with content | 9 | 9 (unchanged) |

Both scripts are idempotent: a second pass of either against prod reports zero
changes.

## 8. Close out

- [x] 8.1 Run `bun run check` — 467 tests pass, TypeScript clean, manifest current. Biome reports only the pre-existing `module_resolver` panics and nursery warnings that predate this change
- [x] 8.2 Final verifier run against prod — see the table below
- [ ] 8.3 Visual pass over a sample spanning recent posts and 2017–2021 legacy imports
