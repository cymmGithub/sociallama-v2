# Tasks — localize-blog-image-text

The audit is the bulk of this change, not the fixes. Metadata cannot identify
affected images (design Context), so phase 2 is a visual pass and everything
after it is small.

Non-goal, restated because it is the easiest boundary to erode: **case-study and
services images are not touched**, even when they carry Polish text.

## 1. Build the inventory

- [ ] 1.1 Enumerate every media id reachable from a published English post: the post `cover`, every `upload` node in the body, and `seo.ogImage`. Expect ~261 ids over 79 posts. **The field is `cover`, not `coverImage`** — an earlier scoping pass used the wrong name and silently missed all 79 covers, reporting a scope of 183 instead of 261.
- [ ] 1.2 Record for each id: filename, the posts that use it, and its role (`cover` / `body` / `og`). An id used by several posts is inspected once.
- [ ] 1.3 Write the inventory to `content/media/image-audit.json` with every verdict initialised to `unreviewed`, and commit it. The file is the artifact the spec requires; it is keyed by media id so a later run only inspects unseen ids.
- [ ] 1.4 Split the inventory into covers (79) and in-body images, so phase 2 can take covers first (design D3).

## 2. Audit — look at the images

- [ ] 2.1 Download the covers to a scratch directory at a size where on-image text is legible.
- [ ] 2.2 Review every cover and assign `accept` / `crop` / `replace` / `recreate`, with a one-line reason. The test is **"would a reader who speaks no Polish misunderstand the point this image illustrates?"** — not "is there Polish in it".
- [ ] 2.3 Repeat for in-body images.
- [ ] 2.4 Fill the verdicts into `content/media/image-audit.json` and commit. **No id may remain `unreviewed`.**
- [ ] 2.5 Report the distribution. If `accept` is not the large majority, stop and re-read the test in 2.2 before doing any image work — the likely error is flagging the presence of Polish rather than a failure of comprehension.
- [ ] 2.6 Confirm the known case is caught: `instagram-cenzuruje-zdjecia-ze-zwierzetami`'s cover is a full-screen Polish Instagram dialog (heading, body, and both buttons "Anuluj" / "Wyświetl posty"). If the audit marks it `accept`, the test is being applied wrongly.

## 3. Fix the covers

- [ ] 3.1 For each cover marked `replace`, obtain a genuine English-locale capture. **Do not retouch Polish text out of an existing screenshot** (design D4) — a doctored screenshot asserts an interface that may never have existed. If no genuine capture is possible, downgrade the verdict to `crop` or `accept` and record why.
- [ ] 3.2 For each cover marked `crop`, produce the cropped asset and check it still works at the aspect ratios the cover is used in — the hub grid, the post card, the related rail and the 1200×630 OG image.
- [ ] 3.3 For each cover marked `recreate`, brief and produce new artwork. This is the only expensive verdict; confirm it is warranted before starting.
- [ ] 3.4 Upload replacements to the `media` collection, replacing the file on the existing row rather than creating a new row, so every post referencing it updates together.
- [ ] 3.5 **Re-check `alt` in BOTH locales** for every replaced row (design D5). The existing Polish and English alt describe the file that was swapped out; a shared media row means the Polish page is affected too.

## 4. Fix the in-body images

- [ ] 4.1 Apply 3.1–3.5 to in-body images marked `replace` / `crop` / `recreate`.
- [ ] 4.2 For every image left at `accept` whose Polish text carries meaning, verify its English alt quotes the Polish and follows it with a parenthetical English gloss, per the `add-english-blog` R1 convention. Add the gloss where it is missing — this is what makes `accept` legitimate rather than neglect.

## 5. Verify

- [ ] 5.1 Rebuild and confirm every affected post still renders its images, in both locales.
- [ ] 5.2 Check the blog hub, post cards and related rail for any cover that changed — a cover appears in more places than its own post.
- [ ] 5.3 Confirm no case-study or services image was modified. `git diff` over the media artifact and any uploaded files should touch blog surfaces only.
- [ ] 5.4 Revalidate the affected posts on the deployment, then re-check the live pages. **A single request after revalidation proves nothing** — the first read serves stale and triggers the regeneration; check again after.
- [ ] 5.5 Re-run the alt-text gate (`payload:translate:alt`) so any alt edited in 3.5 or 4.2 is re-checked against the glossary and the gloss convention.

## 6. Close out

- [ ] 6.1 Commit `content/media/image-audit.json` with all verdicts final.
- [ ] 6.2 Record the count of images accepted, cropped, replaced and recreated, so the next locale knows what it is inheriting.
- [ ] 6.3 Note any image whose verdict depended on a judgement someone might reasonably reverse, so it can be revisited without re-auditing everything.
