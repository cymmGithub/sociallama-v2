> **Phase ordering is load-bearing.** Groups 1–4 (mechanical) MUST fully complete
> before group 6 (editorial) begins — both write `posts.content`, and a concurrent
> admin save during a migration silently loses one side (design D5). Do not interleave.

## 1. Verifier

- [ ] 1.1 Create `lib/payload/audit-post-formatting.ts` — walks `posts.content` Lexical trees via the Local API, covering drafts as well as published posts; supports `--prod` the same way `repair-wp-embed-links.ts` does
- [ ] 1.2 Implement the defect predicates, each reported separately with per-post detail: `justify` format nodes, spacer paragraphs, word-space non-breaking spaces, headings over 85 characters, headings duplicating the post excerpt, posts with no `h2`, `h3`-before-`h2`, bold-paragraph pseudo-headings, and `h4`–`h6` usage
- [ ] 1.3 Report the count of deliberate `center` nodes as a preservation baseline, not as a defect
- [ ] 1.4 Export the predicates so the repair script imports them rather than restating them (design D2 — fixer and verifier cannot disagree about what a defect is)
- [ ] 1.5 Register `payload:audit:post-formatting` in `package.json`
- [ ] 1.6 Run against dev and record the baseline **including drafts**; confirm whether the true totals exceed the published-only audit figures (justify 1204, spacers 748, nbsp 2186, bloated headings 22, no-`h2` 38, TOC coverage 35/79)

## 2. Repair script

- [ ] 2.1 Create `lib/payload/repair-post-formatting.ts` on the `repair-wp-embed-links.ts` pattern: dry-run by default, `--apply` to write, `--prod` for `DATABASE_URL_PROD`, prints the target DB host, idempotent, skip-and-report rather than guess
- [ ] 2.2 Implement `--justify`: clear a `justify` alignment format wherever it appears, on every node type; leave `center` untouched
- [ ] 2.3 Implement `--spacers`: remove paragraphs whose entire content, after stripping inline wrappers, is empty, line breaks, or non-breaking spaces — skip and report anything carrying a single visible character
- [ ] 2.4 Implement `--nbsp`: convert a non-breaking space to an ordinary space **only when the preceding token is longer than one character** (design D3 — preserves the 56 deliberate Polish single-letter-preposition cases and the 18 ambiguous two-letter ones)
- [ ] 2.5 Default to all three classes with no flag; fetch, mutate, and write each post once
- [ ] 2.6 Register `payload:repair:post-formatting` in `package.json`
- [ ] 2.7 Add unit tests for the three predicates against fixtures drawn from real defect samples, including the preserve cases

## 3. Apply the mechanical repair

- [ ] 3.1 Dry-run against dev; read every reported node, confirming no real content is in the removal set
- [ ] 3.2 Apply against dev
- [ ] 3.3 Re-run the verifier against dev: justify, spacer, and word-space nbsp counts are zero, and the `center` node count is unchanged from the 1.3 baseline
- [ ] 3.4 Spot-check the worst offenders in the browser — `lejek-marketingowy-w-social-media-jak-tworzyc-by-sprzedawac-wiecej` (148 justified, 62 spacers), `najlepsze-hasztagi-insta`, `wizeruneksportowca` (285 nbsp) — confirming word-spacing rivers are gone and vertical rhythm is even
- [ ] 3.5 Re-run the repair against dev unchanged to prove idempotency: zero posts modified on the second pass

## 4. Harden the importer

- [ ] 4.1 In `lib/scripts/wp-html-prepass.ts`, drop `text-align: justify` (inline and via WP alignment classes) while preserving `center`
- [ ] 4.2 Drop WordPress spacer paragraphs during the prepass
- [ ] 4.3 Convert word-space non-breaking spaces using the same rule as task 2.4, sharing the predicate rather than duplicating it
- [ ] 4.4 Extend `lib/scripts/wp-html-prepass.test.ts` with cases for all three, including the `center` and single-letter-preposition preserve cases
- [ ] 4.5 Confirm a re-import over already-repaired content produces bodies with none of the three debris classes

## 5. Prod migration

- [ ] 5.1 Dry-run against prod with `--prod`; diff the reported counts against the dev run and explain any difference before proceeding
- [ ] 5.2 Apply against prod
- [ ] 5.3 Re-run the verifier against prod and confirm the same zeroes
- [ ] 5.4 Revalidate the affected post pages so the static renders pick up the new content

## 6. Heading review document

- [ ] 6.1 Extend the verifier with a `--review` mode that emits one markdown document covering every affected post: current heading text, its length, similarity to the excerpt, proposed classification, proposed action, and a slot for the new headline
- [ ] 6.2 For each of the 22 duplicated intros, classify as subsumed (delete the block), extended (drop the duplicated prefix, demote the tail to a paragraph, author a heading for the section), or genuine-but-overlong (shorten) — confirming each classification by reading the post rather than trusting the similarity score (design D7)
- [ ] 6.3 Draft the replacement Polish headings, matching the existing editorial voice
- [ ] 6.4 For the 38 posts with no `h2`, identify which bold paragraphs are section labels and propose the level for each; flag any post whose content genuinely has no sections
- [ ] 6.5 Propose re-levelling for the 3 `h3`-first posts and the 15 posts using `h4`–`h6`, including the `h6`-as-image-caption cases in `5-aplikacji-dzieki-ktorym-stworzysz-estetyczne-instastory`
- [ ] 6.6 Submit the document for approval — **no post content is written until it comes back approved**

## 7. Apply the editorial repair

- [ ] 7.1 Apply the approved intro-heading fixes to all 22 posts
- [ ] 7.2 Apply the approved heading-hierarchy fixes to all 38 posts
- [ ] 7.3 Re-run the verifier: zero headings over 85 characters, zero excerpt-duplicating headings, zero posts without an `h2`, zero `h3`-before-`h2`
- [ ] 7.4 Confirm the table of contents now renders on every post with three or more sections, and check the rail on the post that prompted this change (`google-polaczylo-social-media-z-seo`) reads as a flat list of real sections
- [ ] 7.5 Confirm no anchor `id` exceeds a sane length now that no heading is a paragraph

## 8. Close out

- [ ] 8.1 Run `bun run check` (Biome, TypeScript, tests, manifest) — filtering Biome's known non-fatal `module_resolver` panics with `--diagnostic-level=error`
- [ ] 8.2 Final verifier run against prod, with the before/after table recorded in the change
- [ ] 8.3 Visual pass over a sample spanning recent posts and 2017–2021 legacy imports
