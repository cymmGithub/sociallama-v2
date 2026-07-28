## Context

All 79 published posts were audited by fetching them from production and parsing the rendered `.payload-richtext` bodies. The defect counts below are measured, not estimated:

| defect | nodes | posts |
| --- | --- | --- |
| `format: 'justify'` | 1,204 | 57 |
| spacer paragraphs (`<br>` / `&nbsp;` only) | 748 | 64 |
| `&nbsp;` occurrences | 2,186 | 70 |
| headings > 85 chars | 22 first-headings | 22 |
| posts with no `h2` at all | — | 38 |
| bold-paragraph pseudo-headings | 78 | 22 |
| posts rendering a table of contents | — | 35 / 79 |

Three of the four mechanical classes are WordPress artifacts that `lib/scripts/wp-html-prepass.ts` does not currently handle, so they are reproducible by re-running `lib/scripts/migrate-wp.ts`. The heading problems are **not** importer bugs — the importer faithfully reproduced what WordPress held, and the intro-as-`h2` pattern was authored that way. That split is why the requirements land in two capabilities rather than one.

The repo already has the right precedent for the mechanical half: `lib/payload/repair-wp-embed-links.ts`, a one-off WP-import repair with dry-run-by-default, `--apply`, `--prod`, conservative matching that skips and reports rather than guesses, and idempotency by construction.

## Goals / Non-Goals

**Goals:**
- Remove every presentational-debris node from `posts.content` without touching authored intent.
- Stop `migrate-wp.ts` from reintroducing that debris on a re-run.
- Give the 22 duplicated intro headings a reviewed editorial fix, and restore a working heading hierarchy across all 38 posts that lack one.
- Leave behind a verifier that makes "the blog is clean" a machine-checkable claim rather than a judgement.

**Non-Goals:**
- Page width and layout. Measured chars-per-line is 75–83, already above the readable ceiling; widening the measure would make prose worse. The separate question — the 1360px header stage stepping down to a 1008px article — is a mock-first CSS change of its own.
- Rewriting post prose. Only headings are authored here; body copy is untouched.
- Case studies, which render through the same `PostRichText` but are out of scope.
- The EN tree, which has no blog.
- Preserving anchor `id` stability (see Risks).

## Decisions

### D1 — Repair the data, not the renderer

`RichText` accepts a `disableTextAlign` prop, which would kill all 1,204 justified nodes in one line. Rejected on two counts: it is all-or-nothing **per node type**, so suppressing `justify` on paragraphs would also suppress the 10 deliberate `center` nodes; and it leaves the stored content dirty, so the next person to open a post in the admin still sees justified text and has no signal it is unwanted. A CSS override (`text-align: start !important`) has the same second problem plus specificity fragility.

The data fix costs a script we largely already have the shape of, and it is the only option that makes the CMS state and the rendered state agree.

*Retained as an option:* if production needs to stop looking broken before the migration is ready, `disableTextAlign` is a legitimate same-day stopgap, reverted when the repair lands. Not planned, but cheap.

### D2 — The verifier reads Payload, not HTTP

The audit that produced this change scraped rendered pages, which was right for discovery — it measured what a reader actually sees, with no CMS access needed. It is wrong as a durable check: it cannot see drafts, it depends on a deploy being current, it re-derives structure from hashed CSS-module class names, and it is slow.

`lib/payload/audit-post-formatting.ts` walks the Lexical trees directly via the Local API. It sees drafts, reports against the source of truth, and shares its node predicates with the repair script — so the thing that fixes and the thing that verifies cannot disagree about what a defect is.

### D3 — `&nbsp;` is classified by context, never stripped blanket

This is the decision most likely to cause quiet damage if got wrong. In Polish typography a non-breaking space after a single-letter preposition (`w`, `i`, `z`, `o`, `a`, `u`) is **correct** and deliberate — it stops an orphaned one-letter word at a line end. Stripping all 2,186 would degrade typography while claiming to improve it.

**Revised during implementation.** The breakdown below was originally measured
by scraping rendered HTML, which concatenates text across block boundaries and
so credited hundreds of block-edge non-breaking spaces with a preceding word
they do not have. Re-measured against the Lexical trees:

| bucket | scraped | actual | treatment |
| --- | --- | --- | --- |
| inside a spacer paragraph | 1,521 | 276 | leaves with the paragraph |
| padding: run adjacent to other whitespace | — | 1,111 | **collapse** |
| padding: trailing run at a block's end | — | 441 | **drop** |
| padding: leading indent run | — | 16 | **drop** |
| word space after a 3+ character token | 591 | 69 | **convert** |
| after a one-character preposition | 56 | 38 | preserve |
| after a two-character token | 18 | 14 | preserve |

Three consequences:

**The rule is per block, not per text node.** A gap routinely straddles a node
boundary — a bold word followed by a plain node opening with the non-breaking
space. Judging each node alone reads the token before the gap as empty and
preserves the debris, which is what the original per-node rule would have done.

**Padding is its own class, and it is the large one.** 1,568 non-breaking
spaces neither stand alone in a spacer paragraph nor separate two words: they
pad. A non-breaking space sitting next to an ordinary space was never holding
anything together, so collapsing the run is safe by construction — and unlike
an ordinary space, a non-breaking one does not collapse at render, so these
are visible (`postów?` followed by twenty of them). Restricting the change to
word spaces would have cleared 345 of 2,186 and left the visible ones in place.

**Two preserve cases the original rule would have broken.** The threshold is
"longer than *two* characters", following this decision's stated intent rather
than its original formula, which contradicted it. And a non-breaking space
between two digits is preserved whatever the token length: the corpus has five
grouped numbers (`106 800`, `550 000`), and converting one lets the number wrap
in half.

### D8 — The rehearsal runs against a restored copy, because there is no dev corpus

`tasks.md` assumed a dev database holding the blog. There isn't one: the local
development database carries 15 fixture posts, and the 79 imported posts exist
only in the database `DATABASE_URL_PROD` names (which, pre-launch, is not a
live production database either).

Rather than collapse phases 3 and 5 into a single write, the rehearsal runs
against `sociallama_wpcopy` — a `pg_dump` of that database restored into the
local Postgres container, with `DATABASE_URL` overridden per command. The
verifier reports identical counts against the copy and the original, so the
rehearsal is faithful, and the first write to the shared database happens only
after apply, verify and idempotency have all passed somewhere disposable.

The dump needs a `pg_dump` at least as new as the server (18); the host's is
16, so it runs via `docker run --rm postgres:18`.

### D9 — The preservation baseline is centred nodes that carry content

The proposal counted 10 deliberate `center` nodes. One of them, in
`logo-wizerunek-firmy`, is a paragraph with a `center` format and no children
at all — a spacer that centres nothing. It matches the spacer rule and leaves
with the other 750.

So "the centred count is unchanged" is the wrong invariant; it would have
failed for a correct repair. The verifier counts centred nodes that carry
content, which is 9 before the repair and 9 after.

### D4 — One repair script, one defect class per flag

A single `lib/payload/repair-post-formatting.ts` handles all three mechanical classes, each behind its own flag (`--justify`, `--spacers`, `--nbsp`, default all), rather than three scripts. Each class is a small predicate over the same Lexical walk, and each post is fetched, mutated, and written once instead of three times — which matters because every write is a Payload `update` that bumps versions.

Per-class flags keep the dry runs readable and let a class be re-run alone if one needs a rule adjustment.

### D5 — Mechanical first, editorial second, strictly ordered

Both the repair script and the human editing in Payload admin write `posts.content`. A concurrent admin save during a migration silently loses one side. The phases in `tasks.md` are therefore ordered and must not interleave: migrate and verify, *then* draft and approve headings, *then* apply them.

### D6 — Heading copy is drafted into one review document, not written straight to the CMS

All 22 intro repairs and the heading promotions for the 38 hierarchy posts are proposed in a single markdown review document — per post: the current heading, its classification (subsumed / extended / genuine-overlong), the proposed action, and any new Polish headline. Nothing is applied until the user approves or rewrites.

One document rather than 50 admin sessions makes the copy reviewable as a body of work — tone drift across 50 headlines is visible in a list and invisible post-by-post.

### D7 — Classification is proposed by measurement, decided by a human

The subsumed/extended/genuine split is computed from the similarity between heading text and excerpt, and from which string contains which. That is a good sorting heuristic and a bad decision-maker: `jak-przygotowac-swiateczna-kampanie` scores 0.25 similarity yet is the one genuine heading in the set, and would be misfiled by a threshold. The script proposes; the review document is where a human confirms.

## Risks / Trade-offs

- **A spacer-paragraph rule that is too loose deletes real content.** → The predicate matches only paragraphs whose entire content, after stripping inline wrappers, is empty, line breaks, or non-breaking spaces. Anything with a single visible character is skipped and reported, never guessed at. Dry run first, and the dry run prints every node it would remove.

- **Concurrent admin editing during the migration is silently lost.** → D5's ordering, plus the repair runs against dev first and the counts are re-verified before touching prod.

- **Every repaired heading changes its anchor `id`.** Accepted, not mitigated. Today's longest `#fragment` is 758 characters; nothing external targets these, WordPress slugified differently, and the site is pre-launch. The in-page table of contents derives anchors at render, so it cannot drift.

- **50 posts of heading work is the schedule risk, not the technical one.** → The mechanical phase is independently shippable and carries most of the visible improvement; if editorial work stalls, the blog is still materially better.

- **The nbsp rule preserves 18 ambiguous cases.** Accepted: a stray non-breaking space between two short words is invisible; removing a deliberate one is a typographic regression.

- **Hardening the converter has no live test corpus** — the import already ran. → `lib/scripts/wp-html-prepass.test.ts` exists; new cases are added there against fixtures drawn from the real defect samples the audit collected.

## Migration Plan

1. Land the verifier and the repair script. Run the verifier against dev to establish the true baseline **including drafts** — the numbers above count published posts only, so the real totals will be equal or higher.
2. Dry-run the repair against dev, read every reported node, then `--apply`. Re-run the verifier: justify, spacer, and word-space nbsp counts go to zero; the 10 `center` nodes remain.
3. Harden `wp-html-prepass.ts`, extend its tests, confirm a re-import produces clean bodies.
4. Repeat step 2 against prod with `--prod`.
5. Draft the heading review document; get approval; apply in the admin.
6. Final verifier run against prod, plus a visual check of the previously worst pages.

**Rollback:** Payload versions are enabled on `posts`, so any individual post can be restored from its version history. There is no schema change to reverse.

## Open Questions

- Do drafts exist that the sitemap-based audit could not see, and do they change the editorial batch size? The step-1 verifier run answers this before any editorial estimate is committed to.
- Should the verifier eventually run in CI against the dev database, or stay a manual check? Deferred — it needs a stable baseline of zero first.
