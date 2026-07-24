# Tasks — import-case-study-decks

## 1. Triage & pilot selection
- [ ] 1.1 Inventory all 46 decks: brand → slug, format (PPTX/PDF), page/slide count, embedded-media count. Note trailing-space folder names.
- [ ] 1.2 Skim each for what's present: pillars? metrics? creatives? logo? → tag as `strong` / `partial` / `thin`.
- [ ] 1.3 Lock the 5 pilot decks across the D3 axes (media-rich PPTX, long PDF, marquee brand, metrics-forward, structurally atypical). Record the picks + why.
- [ ] 1.4 Confirm with the user which brands are (or are likely) cleared for public display, so pilot picks aren't wasted on blocked clients.

## 2. Extraction tooling
- [ ] 2.1 Script PPTX extraction: `unzip` creatives from `ppt/media/`; pull slide text (slide XML `<a:t>` runs, or `soffice`→pdf→`pdftotext` fallback). No `python-pptx` dependency.
- [ ] 2.2 Script PDF extraction: `pdftotext` for text, `pdfimages -all` for creatives.
- [ ] 2.3 Emit a per-brand staging dir: `content/case-studies/<slug>/{raw-text.md, media/*, draft.json}`. `draft.json` is a `StudySeed`-shaped skeleton with confidently-extractable fields auto-filled and prose fields left as TODO stubs.
- [ ] 2.4 Add ignore rules so `/mem/claude-cs` mirrors and `content/case-studies/**` staging stay out of git.
- [ ] 2.5 Run extraction over the 5 pilot decks → verify text + creatives land for both PPTX and PDF paths.

## 3. Import step (Payload drafts)
- [ ] 3.1 Add a sibling to `lib/payload/seed-case-studies.ts` that reads a `draft.json`, reuses `richText`/`para`/`orderedList` + media upload, and `create`/`update`s a `case-studies` doc — **locale `pl`, `_status: 'draft'`, idempotent by `slug`**.
- [ ] 3.2 Rasterize each client logo to PNG (SVG rejected by the media collection); place creatives in `public/case-studies/<slug>/`.
- [ ] 3.3 Import one pilot study → confirm it appears in the Payload admin as a Polish draft, absent from `/case-studies` and the sitemap.
- [ ] 3.4 Re-run import for the same slug → confirm no duplicate doc (idempotency).

## 4. Author the pilot to the gold-standard bar
- [ ] 4.1 For each pilot study: write PL `client.about`, `challenge` (intro + ordered objectives), pillar `headings` + `body`, `excerpt`, `tags`, `period` — matching the iRobot voice.
- [ ] 4.2 Pick + crop the strongest creatives per pillar; write Polish alt text; set `cover` + logo.
- [ ] 4.3 Transcribe real `results` metrics (platform/metric/value) from the deck.
- [ ] 4.4 Preview each pilot detail page in the worktree dev app; verify it reads as strong as the existing three (layout, creatives at natural aspect, metric tiles).
- [ ] 4.5 Fix any schema strain surfaced (e.g. a deck with no pillars or no metrics) — decide graceful-degradation handling, don't hack the schema.

## 5. Recipe writeup (gate before scaling)
- [ ] 5.1 Write `content/case-studies/RECIPE.md`: exact extraction commands, the deck→schema mapping, per-format gotchas, authoring checklist, and the publish/permission gate.
- [ ] 5.2 Record real per-study effort from the pilot → confirm with the user whether to proceed to all ~41 or a curated subset.

## 6. Scale (post-pilot, per confirmed scope)
- [ ] 6.1 Batch-extract the remaining decks.
- [ ] 6.2 Author each to the bar (PL), import as drafts. Skip/park `thin` decks that can't reach the bar; note which and why.
- [ ] 6.3 Track a status table (brand → draft ready? / permission cleared? / published?).

## 7. Publish (gated)
- [ ] 7.1 For each cleared study, publish and re-verify the live detail page, listing card, and sitemap entry.
- [ ] 7.2 `/seo-audit` pass over a sample of newly published studies.

## Out of scope (tracked, not done here)
- [ ] EN authoring for imported studies (separate follow-up change).
- [ ] Wiring individual ZAUFALI NAM hover-cards to their case-study slugs.
