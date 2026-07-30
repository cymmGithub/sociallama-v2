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
- [ ] 4.2 For every image left at `accept` whose Polish text carries meaning, verify its English alt quotes the Polish and follows it with a parenthetical English gloss, per the `add-english-blog` R1 convention. Add the gloss where it is missing — this is what makes `accept` legitimate rather than neglect.
      **61 images flagged `glossRequired` in the audit. NOT started — spec requirement R3 is
      unsatisfied until this is done.** This is the one piece of reader-facing value that needs
      no captures and no schema change. Note that many of these carry junk alt inherited from the
      WordPress import (`Zdj 1`, `aaaa`, `Untitled design 8`, `AdobeStock 1307231344`), so there is
      often no description to attach a gloss *to* — the alt has to be written from scratch.

## 5. Verify

- [ ] 5.1 Rebuild and confirm every affected post still renders its images, in both locales.
- [ ] 5.2 Check the blog hub, post cards and related rail for any cover that changed — a cover appears in more places than its own post.
- [ ] 5.3 Confirm no case-study or services image was modified. `git diff` over the media artifact and any uploaded files should touch blog surfaces only.
- [ ] 5.4 Revalidate the affected posts on the deployment, then re-check the live pages. **A single request after revalidation proves nothing** — the first read serves stale and triggers the regeneration; check again after.
- [ ] 5.5 Re-run the alt-text gate (`payload:translate:alt`) so any alt edited in 3.5 or 4.2 is re-checked against the glossary and the gloss convention.

## 6. Close out

- [ ] 6.1 Commit `content/media/image-audit.json` with all verdicts final.
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
