## Context

`add-english-blog` shipped an English blog against a Polish corpus. Everything textual was localized: 79 post bodies, 668 `media.alt` values, four categories, the author. What it could not reach is text rendered into image pixels — a screenshot of a Polish app, a creative with a Polish slogan.

The known instance is the cover of `instagram-cenzuruje-zdjecia-ze-zwierzetami`, a full-screen Instagram warning whose heading, body and both buttons are Polish.

Two constraints shape everything below.

**The alt text already covers the accessibility half.** `media.alt` is localized and English, and under the R1 ruling from `add-english-blog` any image whose on-screen text carries meaning has that text quoted in Polish with a parenthetical English gloss:

```
A1 Karting stories creative with the slogan "W A1Karting zorganizujesz najlepszy
event!" ("At A1Karting you'll run the best event!")
```

A screen-reader user is therefore already told what the image says. This change is about the **sighted English reader**, who sees the pixels and not the alt.

**Metadata cannot find these images.** This is measured, not assumed. Three heuristics were tried against the corpus and all three failed on the one image known to be affected:

| heuristic | result |
|---|---|
| EN alt contains a glossed quote (the R1 marker) | 0 blog images matched; the known cover has no gloss |
| alt mentions screenshot / creative / graphic / post | 6 matched, of which the known cover was **not** one, and most were stock photos whose alt merely used the word "creative" |
| PL alt carries Polish diacritics *and* a screen-ish word | 0 matched |

The reason is structural: alt text describes an image's **subject**. The known cover's alt is `"Instagram cenzuruje zdjęcia ze zwierzętami!"` — a faithful description that says nothing about the picture being a Polish-language screenshot. No amount of cleverness recovers a fact the metadata never recorded.

## Goals / Non-Goals

**Goals:**
- A per-image verdict for all 261 images reachable from the 79 English posts, produced by looking at them.
- Replacement artwork only where a Polish image genuinely misleads an English reader.
- The audit committed as a durable artifact, so a third locale inherits the verdicts instead of re-running the inspection.
- Post covers resolved before in-body images.

**Non-Goals:**
- **Case-study and services creatives.** Most images carrying Polish text on this site are client campaign work — a Vobis ad, an Adamed creative, a Pracuj.pl AR filter. There the Polish text *is* the artefact being presented; replacing it would misrepresent the work. Out of scope by decision, not by oversight.
- **Re-shooting or re-designing anything for aesthetics.** The only question is whether an English reader is misled.
- **Any schema or migration work.** `media.alt` is already localized. This change swaps files and edits alt strings.
- **Localizing images that Polish posts alone use.** Only the English reachability set matters.

## Decisions

### D1 — The audit is visual, and it is the deliverable

Because metadata cannot identify affected images (see Context), the audit is a human or vision-model pass over 261 files, not a query. This inverts the usual shape: the *inventory* is the expensive part and the fixes are cheap and few.

Consequence: the change is valuable even if zero images are replaced. A committed verdict list turns an open-ended worry into a closed question.

*Alternative considered:* OCR every image and flag Polish text. Rejected as the primary method — it answers "does this contain Polish words" but not "does this mislead an English reader", which is the actual question. A screenshot in a post *about* that Polish screen is fine; the same screenshot illustrating a general point is not. OCR may still be useful to **order** the queue, and is listed as an open question rather than a requirement.

### D2 — Four verdicts, and `accept` is a real answer

- **`accept`** — the Polish text is the subject under discussion, or is incidental (a background sign, a UI chrome fragment). Nothing to do. Expected to be the majority.
- **`crop`** — the Polish text is peripheral and the image survives losing it.
- **`replace`** — an equivalent English-language screenshot exists or can be captured (the same Instagram dialog on an English-locale account).
- **`recreate`** — new artwork is required. The most expensive verdict; reserve it for covers.

Writing `accept` down is as valuable as fixing something: it records that the image was examined and judged, which is precisely what is missing today.

### D3 — Covers before in-body images

A post cover is reused by the hub grid, the post cards, the related-posts rail and the OG image used in social previews. An in-body screenshot appears once, in context, with surrounding English prose to explain it. Covers therefore carry more weight per image and are also the smaller set (79 of 261).

### D4 — English-locale capture beats translation-in-Photoshop

Where a screenshot must be replaced, capture the same screen from an English-locale account rather than editing Polish text out of the existing PNG. A retouched screenshot is a fabricated interface: it can silently misrepresent what the product actually says in English, and it ages badly. If genuine capture is impossible, prefer `crop` or `accept` with a clear alt gloss over a doctored image.

### D4a — `content` is localized; `cover` is not (found during the audit)

`lib/payload/collections/posts.ts`: `content` carries `localized: true`; `cover` and
`seo.ogImage` do not. This was not known when D4/D5 were written, and it splits the fix
work along a line the plan did not anticipate.

- **In-body images are per-locale already.** The English body is an independent Lexical
  tree, so its `upload` nodes can point at a different media row than the Polish body's.
  An English capture is uploaded as a **new** row and only the English tree is repointed;
  the Polish post keeps its Polish screenshot, which is correct for its reader. No schema
  change, and `lib/payload/repoint-en-images.ts` does it.
- **Covers are not.** A cover is shared, so the D5 risk is unavoidable there. The five
  cover verdicts carry `blockedBy: "cover-relation-not-localized"`.

This inverts the priority in D3. Covers reach more surfaces, but they are the half that
cannot be fixed here; in-body images reach one page each and are fixable today — and they
hold the worst failures, twenty step-by-step walkthrough screenshots in Polish UI.

*Consequence for task 3.4:* "replace the file on the existing row" is correct for a shared
cover and exactly backwards for an in-body image, where sharing the row is the thing to
avoid.

### D4b — The durable fix for authored covers is not to bake text in

Three of the five blocked covers (28, 29, 31) are LAMÓWKA roundup cards: agency-authored
artwork whose three Polish news headlines exist nowhere else on the page. Fifteen more
covers are title cards that bake the post headline into the pixels — accepted here only
because the English `h1` renders directly above them.

For that whole class, localizing the `cover` relation is the *weaker* fix. Rendering the
text from the already-translated fields — an HTML overlay for on-page use, `next/og`
`ImageResponse` for the 1200×630 social preview — removes the problem for every future
locale at once and lets an editor ship a post without a designer cutting a card.

It does **not** help ids 179/180, which are genuine captures of a Polish Instagram dialog;
only a localized `cover` reaches those. The two deferred changes are complementary.

Cost, so this is not mistaken for a cheap win: no dynamic OG generation exists today
(`lib/utils/metadata.ts:66` falls back to a static `/opengraph-image.jpg`, and covers
render as a plain `<Image>` in `app/(frontend)/blog/post-card.tsx:39`); ~20 covers need
clean background plates cut, since text cannot be overlaid on a card that already has
text; and the overlay must survive four aspect ratios in two languages.

> **Resolved 2026-07-31 by `redesign-blog-covers` — and by neither option above.**
>
> D4a deferred a localized `cover` relation; D4b proposed rendering the headline from the
> translated fields. The change that shipped did a third thing: it removed the text from
> the artwork entirely. All 22 text-bearing covers — the 5 blocked here plus the 17 this
> audit `accept`ed — now carry language-agnostic llama art with no written language in it,
> the sole exception being the LAMÓWKA wordmark on the series cover, which localized titles
> keep verbatim.
>
> That resolves both halves at once. The three roundups (28, 29, 31) no longer bake Polish
> news headlines into pixels, and ids 179/180 — which D4b correctly noted *only* a localized
> relation could reach — are simply no longer Polish screenshots. **Localizing `cover` is
> explicitly rejected:** an image containing no language is correct to share across locales,
> so the unlocalized field is the intended design rather than a debt.
>
> D4b's cost analysis still stands for any future headline-in-image work, and none of it was
> paid: no OG template system was built, no background plates were cut. See
> `openspec/changes/redesign-blog-covers/` and the `blog-cover-art` spec.

### D5 — Any replaced image needs its `alt` re-checked

`media.alt` is localized per-locale. Replacing the file makes both locales' alt text potentially wrong — the Polish alt now describes an English screenshot on the Polish page, since the media row is shared. Every `replace` or `recreate` therefore carries an alt review for **both** locales, not just English.

## Risks / Trade-offs

- **A replaced cover changes the Polish page too** → media rows are shared across locales; only `alt` is localized. Swapping a file changes what Polish readers see. Mitigation: prefer `accept`/`crop` for covers whose Polish text is legible and relevant, and treat `replace` on a shared cover as a decision affecting both locales. If a genuinely locale-specific cover is ever needed, that is a schema change (localizing the `cover` relation) and belongs to its own change.
- **The audit is subjective** → two reviewers may disagree on `accept` vs `replace`. Mitigation: the test is written down and narrow — *would a reader who speaks no Polish misunderstand the point this image illustrates?* Not "is there Polish in it".
- **Scope creep into case studies** → the excluded set is larger and more visible than the included one. Mitigation: the boundary is stated in Non-Goals and in the spec; case-study creatives are a separate decision with a different answer.
- **The audit rots** → new posts add new images. Mitigation: the committed artifact is keyed by media id, so a later run only has to inspect ids it has not seen.

## Migration Plan

No migration. Each fix is a CMS media replacement plus an alt edit, applied the same way any content edit is. Rollback is re-uploading the previous file, and the pre-change files remain in blob storage.

Ordering: audit → verdicts committed → covers fixed → in-body fixed → alt re-checked for anything replaced → revalidate the affected posts.

## Open Questions

- **Should OCR pre-sort the queue?** It cannot decide the verdicts (D1) but could order 261 images by likelihood of containing text, making the visual pass cheaper. Worth trying if the manual pass proves slow.
- **Is there an English-locale account available** for recapturing Instagram/Facebook dialogs? D4 depends on it; without it, more images fall to `accept`.
- **Do any affected images predate the current brand?** Several posts are from 2017–18. A cover that is both Polish-only and visually dated may be better retired than translated — but that is an editorial call about the post, not about the image.
