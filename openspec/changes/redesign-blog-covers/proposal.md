# Proposal — redesign-blog-covers

## Why

22 of the blog's 79 covers are broken by design: 15 bake the Polish headline into the
artwork (plus 2 series-brand cards), 3 LAMÓWKA roundup cards carry Polish news headlines
found nowhere else on the page, and 2 are full-screen Polish Instagram dialogs. These fail
twice over. On English pages the pixels stay Polish — `localize-blog-image-text` audited
all of them and left its 5 `replace`/`recreate` cover verdicts **blocked**, because the
`cover` field is shared across locales and an English file would land on the Polish page
too. And in *both* locales the post page crops the cover to 4/3 in its header column,
amputating text that was composed for ~16:9 — the title cards render badly even in Polish.

Honestly stated: the 15 title cards were `accept`ed by that audit (the English H1 sits
directly above them), so the motivation here is only partly the EN defect. The larger
motivation is that text-bearing covers are structurally wrong for how this site uses them —
one image is cropped to 16/9, 16/10 and 4/3 across five surfaces — and the fix for that
(language-agnostic art, Webflow-blog style) happens to dissolve the localization blocker
as a side effect: a cover with no text in it is *correct* to share across locales, turning
the non-localized `cover` field from a defect (design D5 of the audit change proposed
localizing it) into the intended design.

## What Changes

- **Build a small cover-art library (~11 pieces) instead of 22 bespoke covers**: playful
  llama artwork in the brand plum palette, no text, one style anchor so the pieces read as
  siblings. Category-coded: 3 variants each for `marketing` and `social-media`, 2 each for
  `reklama` and `seo`, plus **one dedicated LAMÓWKA series cover** (the wordmark "LAMÓWKA"
  is the one word allowed in artwork — it is a brand name the English titles keep).
- **Generate via Higgsfield in one approved batch**, anchored on the repo's existing
  hero-llama assets as style reference. No generation without explicit per-batch user OK.
- **Repoint the 22 posts' `cover` relations to new media rows.** No file replacement on
  existing rows — old artwork stays in the media library, and the one media id that serves
  as both cover and in-body image is untouched by construction.
- **Compose for multi-crop survival**: every piece must hold up under all three live crops
  (16/9 hub lead, 16/10 cards, 4/3 post header). The post page layout itself does not change.
- **Resolve the 5 blocked cover verdicts** in `content/media/image-audit.json` (ids 28, 29,
  31, 179, 180) and update the artifact for all 22 repointed covers.
- **NOT in scope**: the remaining 57 covers (photos/campaign creatives, already
  language-agnostic), the blog hub card redesign (compact titles-only cards — its own
  change), in-body images (22 English captures still wait on a human in
  `localize-blog-image-text`), and any schema change — `cover` stays non-localized on purpose.

## Capabilities

### New Capabilities

- `blog-cover-art`: what a blog cover is allowed to contain (language-agnostic artwork, no
  text except series wordmarks), how the library is structured (category variants + series
  cover), how covers are assigned to posts, and what every cover guarantees under the
  site's three crop ratios.

### Modified Capabilities

<!-- None. `blog-hub` and `blog-post-page` govern rendering and are untouched — this
     change alters which image files the cover relations point at, not the rendering
     contract. `payload-cms` is untouched: no schema change, and keeping `cover`
     non-localized is an explicit decision of this change. `blog-image-localization`
     is still owned by the in-flight localize-blog-image-text change, not yet an
     archived spec, so its verdict resolution is recorded there and in Impact below. -->

## Impact

- **Content, not code.** New media rows (uploads) + 22 `cover` relation repoints + audit
  artifact updates. No schema change, no migration, no rendering component touched.
- **`content/media/image-audit.json`**: 22 entries change — the 5 `blockedBy:
  "cover-relation-not-localized"` verdicts resolve, and the 17 accepted title/series cards
  get their covers superseded; the artifact must record the new media ids.
- **`localize-blog-image-text`**: this change supersedes its blocked phase-3 cover work and
  its deferred design D5 (localize the `cover` relation — now explicitly rejected). After
  this ships, that change's only open work is the human-dependent in-body captures, making
  it archivable.
- **Covers are the most-reused image on the site**: hub lead, popular cards, grid cards,
  related rail, post header, and the OG fallback all change for these 22 posts, in both
  locales at once. Social previews for these posts lose their baked-in headline; `og:title`
  carries it. Cache revalidation must cover the hub, category pages and both locales.
- **Higgsfield credits**: one generation batch (~11 pieces + retries), fired only with
  explicit user approval at apply time.
- **Alt text in both locales** for every new media row (`media.alt` is localized), plus the
  `alts.en.json` bookkeeping the alt-gate treats as source of truth.
