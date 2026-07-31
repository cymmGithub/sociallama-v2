# Tasks — redesign-blog-covers

Content-production change: the gate that matters is the user's contact-sheet approval of
the library (phase 3) — nothing touches the database before it. All database work runs
against `DATABASE_URL_PROD` (the local dev DB holds 1 of the 22 posts and produces silent
empty runs). Higgsfield generation requires explicit per-batch user OK.

## 1. Pin down the assignment map

- [ ] 1.1 Resolve the categories of the 3 posts the exploration probe missed
      (`czy-warto-zaczynac-od-zera…`, `employee-advocacy…`, `jak-skonfigurowac-profil…`)
      against prod, and confirm LAMÓWKA series membership for all 22 posts (slug prefix
      `lamowka-` + title check — expect ~5, including the series announcement).
- [ ] 1.2 Write the full assignment map — 22 posts → library piece (category variant or
      series cover) — avoiding identical adjacent artwork in the default hub ordering.
      Commit it alongside the change (it is also the repoint script's input).
- [ ] 1.3 Assert the map covers exactly the 22 audit ids (15 title + 2 series-brand +
      3 roundup + 2 screenshot) and nothing else.

## 2. Generate the library (Higgsfield — user OK required)

- [ ] 2.1 Pick the style-anchor reference asset(s) from the repo's hero-llama /
      o-nas artwork and write the per-piece briefs: ~11 pieces (3 × marketing,
      3 × social-media, 2 × reklama, 2 × seo, 1 LAMÓWKA series), playful llama, plum
      #913155 family, category accent per design D1/D2, no text (wordmark only in the
      series piece), 16:10 master ≥2048px, focal subject inside the central 4/3.
- [ ] 2.2 Get the user's explicit OK for the batch, then generate via nano_banana_pro
      framed as an image edit against the fixed reference. One session, no chain-accepts.
- [ ] 2.3 Verify each output against its brief: no stray text, ears/subject unobstructed,
      style consistent with siblings. Regenerate outliers individually (each retry batch
      gets its own OK).

## 3. Contact-sheet review (user gate)

- [ ] 3.1 Build a contact sheet showing every piece at all three live crops (16/9, 16/10,
      central 4/3) on the brand plum background, plus the assignment map.
- [ ] 3.2 User reviews and approves the library and the assignment, including the open
      call on whether posts 179/180 get category art or a platform-news motif. No upload
      before approval; regenerate rejected pieces via 2.3.

## 4. Apply to production content

- [ ] 4.1 Upload the ~11 approved pieces as new media rows with library-level alt in BOTH
      locales (design D6), and update `content/media/alts.en.json` in the same step.
- [ ] 4.2 Write the repoint script (mirroring `repoint-en-images.ts`): dry-run by default,
      `--apply` to write, hard-requires prod, asserts it matches exactly the 22 expected
      posts before writing, repoints only the `cover` relation — never file contents,
      never `seo.ogImage`.
- [ ] 4.3 Dry-run, review the plan output, then run with `--apply`. Record old→new media
      id pairs.
- [ ] 4.4 Update `content/media/image-audit.json`: supersession record on all 22 entries,
      clear the 5 `blockedBy` markers (ids 28, 29, 31, 179, 180), and commit.
- [ ] 4.5 Re-run `payload:audit:blog-images --prod` and confirm the supersession records
      survive the merge with zero entries reverting to actionable verdicts.
- [ ] 4.6 Run `payload:translate:alt` and confirm zero unexplained diffs on the new rows.

## 5. Verify on the rendered site

- [ ] 5.1 Revalidate `posts` + `blog-hub` tags on the deployment; verify with the
      read-twice rule (first read serves stale and only triggers regeneration).
- [ ] 5.2 Check the repointed covers on every surface, both locales: hub lead (if any of
      the 22 is the lead), popular, grid cards, a category page, related rail, and the
      4/3 post header — the crop-survival check from the spec, on real pages.
- [ ] 5.3 Spot-check OG: fetch `og:image` for 2–3 repointed posts in both locales and
      confirm the new artwork resolves (posts with an explicit `seo.ogImage` are expected
      to be unchanged).
- [ ] 5.4 Confirm both locales serve identical cover media ids for a sample of the 22,
      and that the old shared cover/in-body media id still renders in its in-body context.

## 6. Close out

- [ ] 6.1 Note in `localize-blog-image-text` that its blocked phase-3 cover work and
      design D5 are superseded by this change, leaving only the human-dependent in-body
      captures — making it archivable.
- [ ] 6.2 Record library provenance (briefs, reference assets, generation settings,
      credit spend) alongside the assignment map, so extending the library to more of the
      remaining 57 covers is repeatable.
