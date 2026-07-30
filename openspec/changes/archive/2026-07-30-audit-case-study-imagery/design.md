## Context

48 published case studies, 350 non-logo images, all living in Payload rather than in the repository. The Polish source drafts are gitignored, so the database is the only copy of what each study currently shows.

The replacement pool is the clients' own case-study decks, already downloaded from Drive: 52 folders, 99 files, 674 MB — 46 `.pptx` carrying 1748 embedded images between them, and 38 PDFs. Seventeen folders are PDF-only, so those studies' pools need `pdfimages` rather than a zip listing.

Two facts established by inspection drive the whole approach:

1. **The offending images are in the source decks.** `Case study FM Logistic.pptx` contains both the garment steamer (`image12.jpg`) and the #OPENTOWORK portrait (`image30.png`). Re-importing cannot fix this.
2. **Folder names do not identify the client.** The Medicover deck's first slide reads `# BEAUTY # KOSMETYKI # KONTIGOCLUB`. `Dynamic Development/` holds `ED Invest - case study.pptx`. `Ed Invest /` holds `A1 draft.pptx`. `Kontigo/` holds Brześć's deck. `Finanse/` holds Mazurska, Las Vegans and a generic finance deck. `N Energia/` holds only `Social Lama - CREDENTIALS 2026.pptx`. There are two ED Invest folders differing by a trailing space.

## Goals / Non-Goals

**Goals:**

- No image on any case study depicts anything other than that client.
- Where an image is removed, the section is refilled from that client's own material rather than left thin or padded with stock.
- The decision for every one of the 350 images is written down and approved before any write happens.
- The rule survives as a spec requirement, so the next import is judged against it.

**Non-Goals:**

- Re-importing the studies. The decks are the source of the defect; they are used here only as a replacement pool.
- Text, metrics, logos, layout, metadata or JSON-LD.
- Fixing the Drive folder structure. It is someone else's filing; this change reads it defensively and reports what it found.
- Auditing the blog's imagery.
- Judging image *quality* (resolution, crop, colour). The rule is subject matter. A low-resolution but genuine client creative stays; a beautiful stock photo goes.

## Decisions

### D1 — The rule is subject matter, and it is one sentence

An image may appear on a study if it depicts **that client**: its brand or mark, its products, its people or premises, or its own social-media communication (post screenshots, creatives, campaign stills). Everything else comes off.

Three failure classes fall out of that, and naming them keeps the review consistent:

- **Cross-client leftovers** — another client's product or creative, surviving from the deck this one was copied from. The Laurastar steamer on FM Logistic.
- **Stock or Pexels filler** — a generic photo standing in for work that was never shown. It reads as proof and is not.
- **Template decoration and interface furniture** — icons, "CLICK HERE" buttons, black placeholder rectangles, agency contact slides. The FM Logistic deck alone carries two `CLICK HERE` badges and several solid black frames.

The #OPENTOWORK portrait is its own case: it depicts a real person connected to the client, so it passes the subject-matter rule and still has to go. It is called out explicitly rather than left to judgement — a client's case study may not carry a job-seeking badge.

*Why not a broader quality bar:* "does this image look good" produces 350 arguments. "Is this that client's own material" produces 350 answers.

### D2 — Map decks to studies by content, then verify against the roster

For each deck, extract the text of its first slides and match the client named there against the case-study roster. Folder name is a hint, never the identifier. Every deck that cannot be confidently mapped, and every study that ends up with no deck, is reported rather than guessed at.

This step also surfaces the leftover slides — a deck whose opening slide names a different client than the rest of it is precisely the Medicover pattern, and it means that deck's pool must be filtered before use, not just borrowed from.

### D3 — Review from contact sheets, one study at a time, site beside deck

For each study, build two sheets: what the site shows now, and what that client's deck offers. Reviewing them side by side is what makes a replacement decision possible instead of only a removal decision.

*Why per-study rather than one giant sheet:* the rule is "does this belong to *this* client", which cannot be judged without knowing which client is in question.

### D4 — Approval gate before any write

The audit produces a table — study, image, verdict, reason, and for removals a proposed replacement from that client's deck. Nothing is written to any database until that table is approved.

*Why this is structural and not caution:* the Polish drafts are gitignored, so a wrong deletion is not recoverable by `git checkout`. The gate is the rollback.

### D5 — Apply with an idempotent script, dev first

One script, `--apply` off by default, run against the development database first and verified in the browser, then against `DATABASE_URL_PROD`. Re-running it must be a no-op — that is what makes "did it finish" answerable, given that a long `--prod` pass keeps writing after the shell returns.

Removals detach the image from the study's `gallery` or `approach[].media`. Whether the underlying `media` document is deleted is a separate decision recorded per image, because a media document may be referenced by more than one study — and given that cross-client leakage is the defect being fixed, that is not hypothetical here.

### D6 — Replacements carry real alt text in both locales

A new image needs a Polish alt and an English one; the media collection makes `alt` required and localized. Uploading with a placeholder alt would trade an image defect for an accessibility one.

## Risks / Trade-offs

- **[A wrong removal cannot be reverted from the repository]** — the database is the only copy. → The approval gate (D4), and the script records what it detached so the list itself is the restore instruction.
- **[A media document shared by two studies]** — deleting it to clean one study blanks an image on another. → Count references before deleting any media document; detaching is always safe, deleting is not.
- **[Stock and genuine client photography are not always distinguishable]** — a professional brand shoot looks like stock. → When it is genuinely ambiguous, keep it and mark it as such in the list. The rule targets images that are clearly not the client's; it is not a licence to strip every photograph.
- **[Replacement pools are polluted by the same leftovers]** — the Medicover deck contains Kontigo slides, so borrowing from a deck can reintroduce the defect. → D2's content mapping filters each pool before it is offered, and every proposed replacement is reviewed in the same table as the removals.
- **[17 studies have PDF-only sources]** — `pdfimages` output is page-embedded objects, often split or recompressed, so the pool is lower quality than a `.pptx`'s. → Extract them, but expect fewer usable replacements and prefer removal-only for those studies rather than shipping a degraded image.
- **[350 images is a long review]** — attention drops, and a skipped sheet looks identical to an approved one. → The output table has a row per image, so a missing row is visible; no study is marked reviewed without one.
- **[Removing images could leave a section visibly sparse]** — a gallery of two looks like an omission. → The list records the resulting count per section, and where no replacement exists the section is flagged for a decision rather than silently shrunk.

## Migration Plan

1. Extract media from all 52 deck folders (unzip for `.pptx`, `pdfimages` for PDF-only).
2. Map decks to studies by content; report unmapped decks and studies with no deck.
3. Dump each study's current images from the development database.
4. Build per-study contact sheets, site beside deck, and review.
5. Produce the removal/replacement table — **approval gate.**
6. Apply to the development database, verify in the browser.
7. Apply to `DATABASE_URL_PROD`; re-run until it reports zero changes.

Rollback is the approved table read backwards: it names every detached image and every study it came off. There is no `git revert` for this change.

## Open Questions

- Whether media documents should be deleted or only detached, per image. Defaults to detach; deletion needs a reference count that says it is safe.
- What to do with studies whose deck is PDF-only and whose extracted pool yields nothing usable — remove and accept a shorter section, or leave the weaker image in place. Decided per study during review rather than by a blanket rule.
- Three Drive folders have no corresponding published study (`Gaspol`, `Finanse`, `Medicover`). They are ignored here, but `Medicover` is on the client belt without a case study, which may be worth its own conversation.
