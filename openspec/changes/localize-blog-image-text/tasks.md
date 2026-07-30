# Tasks — localize-blog-image-text

The audit is the bulk of this change, not the fixes. Metadata cannot identify
affected images (design Context), so phase 2 is a visual pass and everything
after it is small.

Non-goal, restated because it is the easiest boundary to erode: **case-study and
services images are not touched**, even when they carry Polish text.

## 1. Build the inventory

- [x] 1.1 Enumerate every media id reachable from a published English post: the post `cover`, every `upload` node in the body, and `seo.ogImage`. Expect ~261 ids over 79 posts. **The field is `cover`, not `coverImage`** — an earlier scoping pass used the wrong name and silently missed all 79 covers, reporting a scope of 183 instead of 261.
- [x] 1.2 Record for each id: filename, the posts that use it, and its role (`cover` / `body` / `og`). An id used by several posts is inspected once.
- [x] 1.3 Write the inventory to `content/media/image-audit.json` with every verdict initialised to `unreviewed`, and commit it. The file is the artifact the spec requires; it is keyed by media id so a later run only inspects unseen ids.
- [x] 1.4 Split the inventory into covers (79) and in-body images, so phase 2 can take covers first (design D3).

> **The audit must run against `DATABASE_URL_PROD`** (`bun run payload:audit:blog-images --prod`).
> The worktree's local Postgres holds 15 posts and zero published English ones, so a
> default run reports a clean, complete, entirely empty audit — the same silent-success
> failure as the `coverImage` mistake, by a different route.
>
> Result: **79 English posts → 261 distinct media ids (79 covers, 182 in-body/og)**, matching
> the predicted scope. One id serves as both a cover and an in-body image.
>
> File order cannot express D3: media ids are integer-like keys, which JavaScript always
> emits in ascending numeric order. Covers-first is an ordering of the review, applied by
> filtering on `roles`.

## 2. Audit — look at the images

- [x] 2.1 Download the covers to a scratch directory at a size where on-image text is legible.
- [x] 2.2 Review every cover and assign `accept` / `crop` / `replace` / `recreate`, with a one-line reason. The test is **"would a reader who speaks no Polish misunderstand the point this image illustrates?"** — not "is there Polish in it".
- [x] 2.3 Repeat for in-body images.
- [x] 2.4 Fill the verdicts into `content/media/image-audit.json` and commit. **No id may remain `unreviewed`.**
- [x] 2.5 Report the distribution. If `accept` is not the large majority, stop and re-read the test in 2.2 before doing any image work — the likely error is flagging the presence of Polish rather than a failure of comprehension.
- [x] 2.6 Confirm the known case is caught: `instagram-cenzuruje-zdjecia-ze-zwierzetami`'s cover is a full-screen Polish Instagram dialog (heading, body, and both buttons "Anuluj" / "Wyświetl posty"). If the audit marks it `accept`, the test is being applied wrongly.

> **Cover distribution: 74 `accept` · 3 `recreate` · 2 `replace` · 0 unreviewed.** `accept` is 94%,
> so the 2.5 check passes. Canary 2.6: id 180 = `replace`, not `accept`. ✔
>
> Blob bytes are not at `media.url` (that is Payload's `/api/media/file/…` route). The audit
> reads real pixels via the Vercel Blob listing — `@vercel/blob` `list()` with
> `BLOB_READ_WRITE_TOKEN`; all 261 filenames resolve.
>
> **Dominant class the proposal did not anticipate:** 15 of 79 covers are branded title cards
> that bake the post's Polish headline into the artwork. They are accepted — the English H1
> renders directly above them, so no meaning is lost — but they are the reason `accept` is so
> high, and a reviewer could reasonably reverse that call (see 6.3).

> **Full distribution (261): 234 `accept` · 22 `replace` · 5 `recreate` · 0 unreviewed.** `accept` is 90%.
> 61 of the accepts are flagged `glossRequired` — real Polish content quoted as source material, where
> D4 forbids fabricating an English version and R3 therefore requires an alt gloss instead.
>
> ### The `cover` relation is not localized. `content` is.
>
> `lib/payload/collections/posts.ts` — `cover` and `seo.ogImage` have no `localized: true`; `content` does.
> This splits the fix work in two, and the plan below assumes the wrong half:
>
> - **The 22 in-body `replace` items are NOT blocked.** The English body is an independent Lexical tree,
>   so its `upload` nodes can point at a *different* media row than the Polish body's. Upload the English
>   capture as a **new** row and repoint only the EN tree. The Polish post keeps its Polish screenshots,
>   which is correct for a Polish reader. **This contradicts task 3.4**, whose "replace the file on the
>   existing row" instruction is right for covers and wrong for in-body images.
> - **The 5 cover items ARE blocked.** A cover is shared across locales, so an English capture would land
>   on the Polish post too. Per design D5 that needs a localized `cover` relation — explicitly deferred to
>   its own change.
>
> The highest-value fixes are in the unblocked half: 20 of the 22 in-body replaces are step-by-step
> walkthrough screenshots (Facebook support ×10, ad invoices ×5, Pixel setup ×2, plus GSC, Instagram's
> reel composer and Twitter's menu) where an English reader cannot execute a single documented step.

## 3. Fix the covers

**BLOCKED — all five, by schema, not by capture availability.** `cover` is shared across
locales, so any English cover also lands on the Polish post. Recorded as
`blockedBy: "cover-relation-not-localized"` with the verdicts left honest; see design D4a/D4b.
Task 3.1's "downgrade and record why" escape hatch is deliberately **not** used: it is scoped
to *no genuine capture possible*, and here capture is possible while application is not.
Downgrading would make the artifact claim these pages are fine when they are not.

- [ ] 3.1 ~~For each cover marked `replace`, obtain a genuine English-locale capture.~~ Blocked (ids 179, 180).
- [x] 3.2 No cover was marked `crop`. Nothing to do.
- [ ] 3.3 ~~For each cover marked `recreate`, brief and produce new artwork.~~ Blocked (ids 28, 29, 31). Design D4b argues the durable fix is un-baking the text, not new Polish-shaped artwork.
- [ ] 3.4 ~~Upload replacements, replacing the file on the existing row.~~ Blocked, and **the instruction is wrong for phase 4** — see D4a.
- [ ] 3.5 ~~Re-check `alt` in BOTH locales for every replaced row.~~ Nothing replaced yet.

## 4. Fix the in-body images

- [ ] 4.1 Apply 3.1–3.5 to in-body images marked `replace` / `crop` / `recreate`.
      **Tooling ready, awaiting captures.** `content/media/en-capture-brief.md` lists all 20
      shots (screen, what must be legible, framing) and `bun run payload:repoint:en-images`
      uploads each capture as a new row and repoints only the EN Lexical tree, refusing any
      cover or `ogImage` id. Captures need English-locale Facebook / GSC / Instagram / Twitter
      accounts, so they come from a human. Ids 132/133 are *not* in the capture list: they are
      2019 Polish analytics that cannot be re-captured and must not be recreated, so they sit
      at `accept` + `glossRequired`.
- [x] 4.2 For every image left at `accept` whose Polish text carries meaning, verify its English alt quotes the Polish and follows it with a parenthetical English gloss, per the `add-english-blog` R1 convention. Add the gloss where it is missing — this is what makes `accept` legitimate rather than neglect.

      **60 written and applied to production; spec R3 is now satisfied.** Authored in
      `content/media/en-alt-glosses.json`, applied with `bun run payload:apply:en-alt --prod --apply`,
      which writes `locale: 'en'` only. Verified: the Polish `alt` on all 261 rows is byte-identical
      before and after.

      Started from 61. Id 186 was **de-flagged**: its filename is Polish
      (`…facebook_kolorowe_komentarze…`) but the mock-up in the image is entirely English, so there
      is nothing to gloss. The flag had been set from the filename rather than the picture — the
      exact inference the spec forbids.

      Nearly all of these arrived from the WordPress import with a filename as their alt (`Zdj 1`,
      `aaaa`, `3a 1`, `AdobeStock 1307231344`), so there was no description to attach a gloss *to*;
      each alt is written from scratch against the image.

      **Not fixed, out of scope:** the *Polish* alt on many of the same rows is equally junk
      (`altPl` for id 19 is "Screenshot 20250320 163845"). That harms Polish screen-reader users and
      predates this change, which is about English readers. Worth its own change.

## 5. Verify

**Scope of what shipped: alt strings only.** No image file was added, replaced or deleted, and no
post body changed, so the rendering surface is untouched by construction.

- [x] 5.1 Rebuild and confirm every affected post still renders its images, in both locales.
      Checked live rather than by rebuilding, since nothing that affects rendering changed:
      `/prowadzenie-social-media` and `/en/blog/social-media-management` both serve 9 `<img>` tags.
- [x] 5.2 Check the blog hub, post cards and related rail for any cover that changed — a cover appears in more places than its own post.
      **No cover changed** — all five cover verdicts are blocked, and phase 4 touched in-body alt only.
      Nothing reaches the hub, the cards or the related rail.
- [x] 5.3 Confirm no case-study or services image was modified. `git diff` over the media artifact and any uploaded files should touch blog surfaces only.
      `git status` touches `content/media/*`, `content/posts/glossary.json`, `lib/payload/*` and
      `package.json`. No `public/` asset, no case-study or services file.
- [x] 5.4 Revalidate the affected posts on the deployment, then re-check the live pages. **A single request after revalidation proves nothing** — the first read serves stale and triggers the regeneration; check again after.
      `POST /api/revalidate?tag=posts&tag=blog-hub` on `sociallama-v2.vercel.app`. The warning was
      exactly right: read 1 still served the old alt, read 4 served the gloss. The Polish page still
      serves its Polish alt, confirming the write was locale-scoped.
- [x] 5.5 Re-run the alt-text gate (`payload:translate:alt`) so any alt edited in 3.5 or 4.2 is re-checked against the glossary and the gloss convention.
      First run: **0 skipped, 4 warnings.** All four were mine, and all were real convention breaches
      rather than false positives — ids 132/133 put one combined gloss after a run of separate quotes
      (the gate needs each quote followed by its own parenthetical), and id 141 nested Polish „…”
      quotes inside the outer quote, which the pattern cannot see through. Rewritten and re-applied.
      Id 196 needed `Niby-Prasówka` added to `content/posts/glossary.json`, which is what that
      allowlist is for — it already holds LAMÓWKA, Brześć and Pracuj.pl.
      Second run: **668 rows, 0 skipped, 0 warnings.**

      **Hazard worth recording:** the gate treats `content/media/alts.en.json` as the source of truth
      and the database as a projection of it. Writing alt straight to the database leaves that file
      stale, so the next `payload:translate:alt --apply` would quietly revert all 60. `alts.en.json`
      is updated in step here; any future direct alt write must do the same.

## 6. Close out

- [x] 6.1 Commit `content/media/image-audit.json` with all verdicts final.
      All 261 verdicts recorded, plus `glossRequired` (60) and `blockedBy` (5).

      **Bug found and fixed while verifying:** `audit-blog-images.ts` rebuilt each entry field by
      field, carrying over only `verdict` and `reason`. Its docstring promised a merge that "never
      overwrites a verdict a human already recorded" — and verdicts did survive — but the first
      re-run silently dropped all 60 `glossRequired` flags and all 5 `blockedBy` markers, because
      those fields were added to the artifact after the script was written. It now spreads the prior
      entry first and overlays only what it re-derives from the database, so fields added later
      survive by construction rather than by someone remembering to list them. Verified by a full
      re-run: 60 and 5 both intact.
- [x] 6.2 Record the count of images accepted, cropped, replaced and recreated, so the next locale knows what it is inheriting.

      **261 images over 79 English posts: 234 `accept` · 22 `replace` · 5 `recreate` · 0 `crop` · 0 unreviewed.**
      Of the accepts, 61 need an alt gloss. Of the non-accepts, 22 are actionable in-body images
      (awaiting English captures) and 5 are covers blocked on the `cover` relation not being localized.
      A third locale inherits all 261 verdicts and needs to inspect only ids it has not seen.

- [x] 6.3 Note any image whose verdict depended on a judgement someone might reasonably reverse, so it can be revisited without re-auditing everything.

      1. **The 15 branded title cards** (9, 21, 23, 25, 128, 227, 231, 233, 235, 237, 239, 241, 250, 252, 256)
         — accepted because the English `h1` renders directly above the card, so no meaning is lost.
         A reviewer who reads the rule as "no untranslated words on an English page" would call these
         `recreate`, and that alone would move `accept` from 90% to 84%. They are the single largest
         judgement call in the audit.
      2. **The 2 series-brand cards** (259, 265) — same reasoning, weaker case, since "OKIEM SOCIAL LAMY"
         and "NOWA SERIA NA BLOGU!" are closer to content than to a label.
      3. **132/133** (Brześć reach statistics) — accepted because the numbers carry the point and the
         Polish is only the metric labels. Reversible to `recreate` if someone would rather author an
         English chart from the same figures.
      4. **Client campaign creatives** (33, 129–131, 134, 136–146, and covers 135, 147, 157) — accepted as
         "the Polish text is the work being presented", borrowing the case-study reasoning. Defensible,
         but these sit on *blog* posts, and the Non-Goal was written about case-study pages.
      5. **176** (Facebook feed mock-up) — accepted as filler wording inside a layout demo; someone could
         reasonably read the Polish posts as content.
