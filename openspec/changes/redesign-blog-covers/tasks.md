# Tasks — redesign-blog-covers

Content-production change: the gate that matters is the user's contact-sheet approval of
the library (phase 3) — nothing touches the database before it. All database work runs
against `DATABASE_URL_PROD` (the local dev DB holds 1 of the 22 posts and produces silent
empty runs). Higgsfield generation requires explicit per-batch user OK.

## 1. Pin down the assignment map

- [x] 1.1 Resolve the categories of the 3 posts the exploration probe missed
      (`czy-warto-zaczynac-od-zera…`, `employee-advocacy…`, `jak-skonfigurowac-profil…`)
      against prod, and confirm LAMÓWKA series membership for all 22 posts (slug prefix
      `lamowka-` + title check — expect ~5, including the series announcement).
      **Result:** all 22 resolved (`social-media` 6, `marketing` 5, `seo` 4, `reklama` 3,
      plus 4 LAMÓWKA). Series membership is **4**, not ~5 — design.md counted the
      Halloween post separately, but it is one of the 3 roundups. `259` is
      "OKIEM SOCIAL LAMY", a different series brand with no `lamowka` slug/title marker,
      so it stays a category post. Prod `blog-hub` curation is empty, so the hub lead
      falls back to newest = `google-polaczylo-social-media-z-seo` (cover 227) — a target,
      so the 16/9 lead crop is live.
- [x] 1.2 Write the full assignment map — 22 posts → library piece (category variant or
      series cover) — avoiding identical adjacent artwork in the default hub ordering.
      Commit it alongside the change (it is also the repoint script's input).
      → `content/media/cover-assignments.json`, keyed by old cover media id (= audit key).
- [x] 1.3 Assert the map covers exactly the 22 audit ids (15 title + 2 series-brand +
      3 roundup + 2 screenshot) and nothing else. **PASS** — 22/22, every piece used,
      every piece matches its post's category, all ids `cover`-role in the audit. The only
      adjacent-identical pairs are hub ranks 18/19 and 21/22, both LAMÓWKA: mandated by the
      spec's series requirement, which outranks the adjacency preference.

## 2. Generate the library (Higgsfield — user OK required)

- [x] 2.1 Pick the style-anchor reference asset(s) from the repo's hero-llama /
      o-nas artwork and write the per-piece briefs: ~11 pieces (3 × marketing,
      3 × social-media, 2 × reklama, 2 × seo, 1 LAMÓWKA series), playful llama, plum
      #913155 family, category accent per design D1/D2, no text (wordmark only in the
      series piece), 16:10 master ≥2048px, focal subject inside the central 4/3.
      → `content/media/cover-library-brief.md`. Anchors: `content-llama-3f48b5.png`
      (identity) + `o-nas/hero-llama.png` (wardrobe/pose) — the photoreal language, not
      the legacy painted mascot. Safe box computed as central **83% × 84%** (the 4/3,
      16/9 and 1200×630 centre crops intersected), not just the central 4/3. Grounds stay
      plum-family because the hub renders on sand `#e0ddd3`. The LAMÓWKA wordmark is
      composited in post, not generated (garbled-glyph risk on the Ó).
- [x] 2.2 Get the user's explicit OK for the batch, then generate via nano_banana_pro
      framed as an image edit against the fixed reference. One session, no chain-accepts.
      Four batches, each separately approved: a 3-piece photoreal pilot and a 1-piece
      retry (both **discarded** — wrong style anchor, see design D2 correction), then a
      2-piece painted test, then the remaining 9. **42 credits total.**
- [x] 2.3 Verify each output against its brief: no stray text, ears/subject unobstructed,
      style consistent with siblings. Regenerate outliers individually (each retry batch
      gets its own OK). **Zero text across all 11.** Ears clear on all 11. Grounds measured
      `#903154`–`#982B55` against brand plum `#913155`. One regeneration: `rek-b` v1 had a
      dissolving lower body and rabbit-shaped ears. Two lessons, both recorded in the brief:
      the model ignores named hex values but copies colour from reference pixels, and it
      ignores composition-scale instructions entirely (fixed in post with an
      edge-replicating downscale, not with more credits).

## 3. Contact-sheet review (user gate)

- [x] 3.1 Build a contact sheet showing every piece at all three live crops (16/9, 16/10,
      central 4/3) on the brand plum background, plus the assignment map.
      → published as artifacts: the crop/safe-box review, the on-surface mock (hub lead,
      grid cards, post header, 1200×630 preview) and the full 11-piece library with
      per-piece post assignments. Shown on sand `#e0ddd3`, the hub's real ground.
- [x] 3.2 User reviews and approves the library and the assignment, including the open
      call on whether posts 179/180 get category art or a platform-news motif. No upload
      before approval; regenerate rejected pieces via 2.3. **Approved 2026-07-31.**
      179/180 keep category art (`sm-b` / `sm-c`) — no platform-news motif was needed once
      the cast carried the category. Three motifs changed during the phase, all because an
      empty container reads as a missing asset: `rek-a` neon frame → spotlight, `rek-b`
      blank placard → paper planes, `sm-b` empty speech bubbles → solid hearts and
      sparkles; `sm-a`'s phone also turned back-to-camera so no blank screen exists.

## 4. Apply to production content

- [x] 4.1 Upload the ~11 approved pieces as new media rows with library-level alt in BOTH
      locales (design D6), and update `content/media/alts.en.json` in the same step.
      → `lib/payload/upload-cover-art.ts` (`payload:upload:cover-art`). **Media 794–804**
      created on prod, 2560×1600, `og` size 1200×630 generated. Both locales verified by
      reading back with `fallbackLocale: false` — the shape the blog actually queries.
      `alts.en.json` appended 697 → 708. Idempotent by `mediaId`, so a re-run reports
      "0 to create" — which is also how the run was confirmed complete (a `--prod --apply`
      script can keep writing after the shell returns).
- [x] 4.2 Write the repoint script (mirroring `repoint-en-images.ts`): dry-run by default,
      `--apply` to write, hard-requires prod, asserts it matches exactly the 22 expected
      posts before writing, repoints only the `cover` relation — never file contents,
      never `seo.ogImage`. → `lib/payload/repoint-covers.ts` (`payload:repoint:covers`).
      Guards verified to fire: refuses without `--prod`, and refused all 22 while the
      library had no `mediaId`s. Also asserts each post's *current* cover matches the id
      the map expects, so a cover that moved since the audit stops the run instead of
      being silently discarded. Writes are read back in both locales.
- [x] 4.3 Dry-run, review the plan output, then run with `--apply`. Record old→new media
      id pairs. Applied in two passes: the original repoint moved all 22 onto media
      **794–804**, then `payload:relink:cover-art` moved them onto the final art at
      **805–820** (motifs baked in, the author's bespoke pieces, and the hybrid
      reassignment). Verified independently: **22/22 covers correct in BOTH locales,
      16/16 live rows carry alt in both, all 22 original rows still intact.**
- [x] 4.4 Update `content/media/image-audit.json`: supersession record on all 22 entries,
      clear the 5 `blockedBy` markers (ids 28, 29, 31, 179, 180), and commit.
      Supersession ids refreshed to the final rows after the relink.
- [x] 4.5 Re-run `payload:audit:blog-images --prod` and confirm the supersession records
      survive the merge with zero entries reverting to actionable verdicts.
      **22/22 records survived, 0 reverted.** The re-run flagged the 16 new library rows
      as `unreviewed` (it flags every id it has not seen); they are now recorded `accept`
      with the reason that they are language-agnostic by construction. **0 unreviewed.**
- [ ] 4.6 Run `payload:translate:alt` and confirm zero unexplained diffs on the new rows.
      **Not applied.** The dry run reports **724 rows would be written** — essentially the
      whole media library. That is pre-existing drift between `alts.en.json` and the
      production database, not caused by this change, and applying it would rewrite far
      beyond these 16 rows. Our rows are verified correct in both locales directly against
      the database and on the rendered pages, so the gate was left untouched. Resolving
      the 724-row drift belongs to its own change.
- [ ] 4.4 Update `content/media/image-audit.json`: supersession record on all 22 entries,
      clear the 5 `blockedBy` markers (ids 28, 29, 31, 179, 180), and commit.
- [ ] 4.5 Re-run `payload:audit:blog-images --prod` and confirm the supersession records
      survive the merge with zero entries reverting to actionable verdicts.
- [ ] 4.6 Run `payload:translate:alt` and confirm zero unexplained diffs on the new rows.

## 5. Verify on the rendered site

- [x] 5.1 Revalidate `posts` + `blog-hub` tags on the deployment; verify with the
      read-twice rule (first read serves stale and only triggers regeneration).
      `POST /api/revalidate?tag=…` with the `x-revalidate-secret` header against
      `sociallama-v2.vercel.app` — `posts`, `blog-hub`, `categories` all 200. Before
      revalidating, the deployment was still serving the **first** upload (794–804), so
      this step was load-bearing rather than a formality.
- [x] 5.2 Check the repointed covers on every surface, both locales: hub lead (if any of
      the 22 is the lead), popular, grid cards, a category page, related rail, and the
      4/3 post header — the crop-survival check from the spec, on real pages.
      PL and EN hubs both serve the 8 bespoke pieces (hub ranks 1–8), post pages serve the
      4/3 header plus the related rail.
- [x] 5.3 Spot-check OG: fetch `og:image` for 2–3 repointed posts in both locales and
      confirm the new artwork resolves (posts with an explicit `seo.ogImage` are expected
      to be unchanged). Each post's `og:image` resolves to **its own** piece at 1200×630.
      None of the 22 set `seo.ogImage`, so all 22 social previews now come from the cover.
- [x] 5.4 Confirm both locales serve identical cover media ids for a sample of the 22,
      and that the old shared cover/in-body media id still renders in its in-body context.
      Identical files on PL and EN, with per-locale alt off the same row — the shared
      unlocalized `cover` behaving exactly as design D5 intended. On the shared
      cover/in-body id: it does exist (`localize-blog-image-text` task 1.2 found one), but
      it is **not among these 22** — no target id carries a non-cover role. So the repoint
      could not have touched it, which is what design D5 meant by "safe by construction".

## 6. Close out

- [x] 6.1 Note in `localize-blog-image-text` that its blocked phase-3 cover work and
      design D5 are superseded by this change, leaving only the human-dependent in-body
      captures — making it archivable. Its phase 3 is marked resolved and a supersession
      note added under **D4a/D4b**, which is where the cover-localization deferral actually
      lives — this change's proposal mis-attributed it to D5, which is about alt re-checks.
      Recorded that the blocker was dissolved rather than paid: neither a localized `cover`
      relation nor D4b's OG-template system was built.
- [x] 6.2 Record library provenance (briefs, reference assets, generation settings,
      credit spend) alongside the assignment map, so extending the library to more of the
      remaining 57 covers is repeatable. → `content/media/cover-library-brief.md`: anchors
      and reference media ids, the working generation recipe, the icon-cutting and
      compositing method, the full 76-credit spend log including the 20 that bought
      nothing, and a **post-processing "what NOT to do"** section recording both reverted
      fit attempts.

## 7. Follow-ups this change created

- [ ] 7.1 `alts.en.json` has drifted from production by **724 rows** — pre-existing, not
      caused here, and deliberately not applied (task 4.6). Needs its own change.
- [ ] 7.2 The white blog-hub card (`app/(frontend)/blog/blog.module.css`) was requested
      mid-change and is unrelated to covers. Commit it separately or move it to the
      quick-fixes lane. It also creates a hand-sync obligation with the case-study card.
- [ ] 7.3 Consider whether bespoke art should follow an **author** rather than a post. Today
      a new post by Łukasz Płociński gets library art; the spec now says so explicitly, but
      it is a product decision worth revisiting.
