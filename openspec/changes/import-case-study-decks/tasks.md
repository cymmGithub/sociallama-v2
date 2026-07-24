# Tasks — import-case-study-decks

## 1. Triage & pilot selection
- [x] 1.1 Inventory all 46 decks: brand → slug, format (PPTX/PDF), page/slide count, embedded-media count. Note trailing-space folder names.
- [x] 1.2 Skim each for what's present: pillars? metrics? creatives? logo? → tag as `strong` / `partial` / `thin`.
- [x] 1.3 Lock the 5 pilot decks across the D3 axes (media-rich PPTX, long PDF, marquee brand, metrics-forward, structurally atypical). Record the picks + why. _(recorded in content/case-studies/PILOT.md; lock pending 1.4)_
- [x] 1.4 Confirm with the user which brands are (or are likely) cleared for public display, so pilot picks aren't wasted on blocked clients. _(user confirmed all 5 pilots are fine to author, 2026-07-24)_

## 2. Extraction tooling
- [x] 2.1 Script PPTX extraction: `unzip` creatives from `ppt/media/`; pull slide text (slide XML `<a:t>` runs, or `soffice`→pdf→`pdftotext` fallback). No `python-pptx` dependency.
- [x] 2.2 Script PDF extraction: `pdftotext` for text, `pdfimages -all` for creatives.
- [x] 2.3 Emit a per-brand staging dir: `content/case-studies/<slug>/{raw-text.md, media/*, draft.json}`. `draft.json` is a `StudySeed`-shaped skeleton with confidently-extractable fields auto-filled and prose fields left as TODO stubs.
- [x] 2.4 Add ignore rules so `/mem/claude-cs` mirrors and `content/case-studies/**` staging stay out of git.
- [x] 2.5 Run extraction over the 5 pilot decks → verify text + creatives land for both PPTX and PDF paths.

## 3. Import step (Payload drafts)
- [x] 3.1 Add a sibling to `lib/payload/seed-case-studies.ts` that reads a `draft.json`, reuses `richText`/`para`/`orderedList` + media upload, and `create`/`update`s a `case-studies` doc — **locale `pl`, `_status: 'draft'`, idempotent by `slug`**.
- [x] 3.2 Rasterize each client logo to PNG (SVG rejected by the media collection); place creatives in `public/case-studies/<slug>/`. _(riviera: logo PNG + 8 creatives + cover placed; convention proven, repeats per-study in phase 6)_
- [x] 3.3 Import one pilot study → confirm it appears in the Payload admin as a Polish draft, absent from `/case-studies` and the sitemap. _(riviera id 5, `_status=draft`; absent from listing + sitemap; anon detail route renders not-found)_
- [x] 3.4 Re-run import for the same slug → confirm no duplicate doc (idempotency). _(re-run UPDATED id 5; still 1 row, 10 media, no dupes)_

## 4. Author the pilot to the gold-standard bar
- [x] 4.1 For each pilot study: write PL `client.about`, `challenge` (intro + ordered objectives), pillar `headings` + `body`, `excerpt`, `tags`, `period` — matching the iRobot voice. _(all 5: riviera, skrzat, asus, ed-invest, n-energia)_
- [x] 4.2 Pick + crop the strongest creatives per pillar; write Polish alt text; set `cover` + logo. _(all 5; native-res assets, weak/upscaled ones flagged per study)_
- [x] 4.3 Transcribe real `results` metrics (platform/metric/value) from the deck. _(riviera 6, skrzat 7, asus 5 [deliverable counts], ed-invest 14, n-energia 3 [page-level] — no invented numbers)_
- [ ] 4.4 Preview each pilot detail page in the worktree dev app; verify it reads as strong as the existing three (layout, creatives at natural aspect, metric tiles). _(needs THIS worktree's dev server + admin preview — user step; :3000 is the main worktree and can't serve the fresh media)_
- [x] 4.5 Fix any schema strain surfaced (e.g. a deck with no pillars or no metrics) — decide graceful-degradation handling, don't hack the schema. _(surfaced & handled without schema changes: n-energia no-hashtag pillars + page-as-platform metrics; ed-invest text-only #MODERACJA pillar (empty media allowed); asus carousel spans FB+IG (single platform field + note); skrzat 9→5 pillar consolidation. Recurring theme for the collection backlog: results.platform="entity not network", and no per-tile period/subtitle field.)_

## 5. Recipe writeup (gate before scaling)
- [x] 5.1 Write `content/case-studies/RECIPE.md`: exact extraction commands, the deck→schema mapping, per-format gotchas, authoring checklist, and the publish/permission gate.
- [x] 5.2 Record real per-study effort from the pilot → confirm with the user whether to proceed to all ~41 or a curated subset. _(user chose "batch all ~41"; switched authors to Sonnet 5 once the recipe + examples were established. Effort: ~6–14 min agent-time/study, ~4–8 parallel per wave.)_

## 6. Scale (post-pilot, per confirmed scope)
- [x] 6.1 Batch-extract the remaining decks. _(41 extracted before /mem/claude-cs unmounted; one source, medicover, was a corrupted deck = Vistula's content)_
- [x] 6.2 Author each to the bar (PL), import as drafts. Skip/park `thin` decks that can't reach the bar; note which and why. _(45/46 imported as PL drafts. PARKED/thin: kbp, luisse, mmhygienic (imported but below bar). BLOCKED: medicover (contaminated source deck — needs the real Medicover .pptx; /mem gone). No dupes.)_
- [x] 6.3 Track a status table (brand → draft ready? / permission cleared? / published?). _(content/case-studies/STATUS.md)_

## 7. Publish (gated)
- [x] 7.1 For each cleared study, publish and re-verify the live detail page, listing card, and sitemap entry. _(LOCAL publish per user: 45 drafts → published, `publishedAt` stamped, via lib/payload/publish-case-studies.ts. Verified on :3000 — listing + sitemap carry all 48; detail pages render authored titles + covers. Real-prod publish still gated on the client-permission check. medicover excluded (blocked).)_
- [x] 7.2 `/seo-audit` pass over a sample of newly published studies. _(audited listing + 3 detail pages across all 7 pillars. Fundamentals strong (unique metric-led titles/descs, single H1, 100% alt coverage, rich Article+Breadcrumb JSON-LD, full hreflang/OG). Applied fixes: robots `Allow: /api/media/` (was blocking cover images + Article rich-result image), listing CollectionPage/ItemList JSON-LD, detail og:image:alt, broadened listing meta desc (PL+EN). Deferred (design choice): brand not prepended to detail H1 — entity already in title/breadcrumb/eyebrow/JSON-LD. CWV not measurable on localhost — run PSI post-deploy.)_

## Out of scope (tracked, not done here)
- [ ] EN authoring for imported studies (separate follow-up change).
- [ ] Wiring individual ZAUFALI NAM hover-cards to their case-study slugs.
