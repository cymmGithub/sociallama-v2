## Why

`add-english-blog` translated every word the database holds — 79 post bodies, 668 media alt texts, categories, the author. It could not touch the words rendered *into the pixels* of the images themselves, and those are still Polish on English pages.

The confirmed case is the cover of `instagram-cenzuruje-zdjecia-ze-zwierzetami`: a full-screen Instagram warning dialog in which the heading, the body copy and both buttons ("Anuluj" / "Wyświetl posty") are Polish. An English reader gets a screenshot they cannot read, illustrating a paragraph they can.

Two things make this worth a change of its own rather than a loose end on the last one:

- **It is image production, not data localization.** Nothing here is a database write. Each image needs a human decision and, for some, new artwork.
- **It cannot be found from metadata.** This was tested, not assumed (see Design). Alt text describes an image's *subject*; it does not record whether Polish words appear inside it. So the audit is the bulk of the work, and it needs eyes on images.

The urgency is low and should stay low: `add-english-blog` already localized `media.alt`, and images whose on-screen text carries meaning got a parenthetical English gloss. A screen-reader user is therefore already told what the Polish says. **The remaining harm is to sighted English readers**, which is real but narrower than it first appears.

## What Changes

- **Audit every image reachable from an English post** — 261 media rows: 79 post covers plus 182 in-body images — by looking at them, and record a per-image verdict.
- **Classify each as `replace` / `recreate` / `crop` / `accept`.** `accept` is a legitimate outcome and expected to be the most common: where a post *discusses* a Polish interface, a Polish screenshot is the subject under discussion, not a defect.
- **Act only on the images that mislead an English reader**, in priority order: post covers first (they appear on the hub, in cards, and in social previews), in-body screenshots second.
- **Record the audit as a committed artifact**, so the verdicts survive the change and a later locale does not repeat the inspection from scratch.
- **NOT in scope: case-study and services creatives.** Most images carrying Polish text on this site are client campaign work, where the Polish text is the deliverable being shown. Deliberately excluded — see Design.

## Capabilities

### New Capabilities
- `blog-image-localization`: which images on English blog surfaces may carry non-English text, what the per-image verdicts mean, and what the English reader is guaranteed when an image is accepted as-is.

### Modified Capabilities
<!-- None. `blog-post-page` and `blog-hub` govern how images are rendered; this
     change alters which image files are used, not the rendering contract.
     `payload-cms` already covers `media.alt` localization via add-english-blog. -->

## Impact

- **Content, not code.** The expected change is replacement image files in the `media` collection plus updated `alt` text for any image that changes. No schema change, no migration.
- **`content/media/`** gains a committed audit artifact alongside `alts.en.json`.
- **Post covers are the sensitive surface**: a cover is reused by the hub, the post cards, the related-posts rail and the OG image, so replacing one is visible in more places than the post itself.
- **Depends on `add-english-blog`** being archived or at least applied: the English posts, their slugs and the localized alt text are the thing being audited.
- **No production database risk.** Uploading or swapping a media file is an ordinary CMS operation, unlike the localization migrations that preceded it.
