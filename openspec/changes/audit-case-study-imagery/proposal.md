## Why

Case studies are the site's proof surface, and some of them carry images that undercut the proof.

Two confirmed examples, both on the FM Logistic study:

- `fm-logistics-gallery-4.jpg` is a **garment steamer pressing a suit** — it belongs to the Laurastar study, which is also on the site. Nothing about it says logistics.
- `fm-logistics-gallery-5.jpg` is a portrait wearing LinkedIn's green **#OPENTOWORK** frame. On a client's case study that reads as "this person is looking for work", which is worse than merely off-topic.

The cause was traced, and it changes what the fix has to be. Both images **are present in the client's own deck** (`Case study FM Logistic.pptx`, as `image12.jpg` and `image30.png`). The decks are built by copying a previous client's deck and overwriting slides, so leftovers survive: the Medicover deck opens on a slide reading `# BEAUTY # KOSMETYKI # KONTIGOCLUB`, which is Kontigo's. The import faithfully copied what it was given, because it had no way to judge subject matter.

So **re-importing from the source decks would reintroduce the same images.** What the decks are actually good for is supplying replacements: 1748 embedded images across 46 presentations, against 350 images currently on the site.

## What Changes

- **Every image on all 48 published case studies is reviewed** against a single rule: an image on a study must depict *that client* — its brand, product, people, premises, or its own social-media communication. Images that fail come off. That covers cross-client leftovers, generic stock or Pexels filler standing in for real work, and template decoration.
- **Gaps are filled from the same client's deck** rather than from stock, so a section that loses an image does not end up thinner than the work it describes.
- **A per-image removal and replacement list is produced and approved before anything is written.** Case-study content lives only in the Payload database — the Polish `draft.json` files are gitignored (`.gitignore` lines 98–101), so there is no repository copy to revert to. Approval is the safety net that a revert would otherwise be.
- **Deck-to-study mapping is derived from deck content, not folder names.** The Drive folders are unreliable: `Dynamic Development/` contains ED Invest's deck, `Kontigo/` contains Produkty Cukiernicze Brześć's, `Finanse/` holds three different brands, `N Energia/` holds only a generic "CREDENTIALS 2026" deck, and there are two ED Invest folders differing by a trailing space.
- **A spec requirement is added** so the rule outlives this pass: gallery and pillar imagery must depict the study's own client.

Not in scope: rewriting case-study text, re-cutting client logos, changing the case-study page layout, or the eight repository-side polish items, which are the separate `polish-site-details` change.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `case-studies`: new requirement that gallery and approach-pillar imagery SHALL depict the study's own client, with stock filler and cross-client material excluded.

## Impact

**Data, not code.** The change edits `case-studies` documents in Payload — `gallery` arrays and `approach[].media` arrays — plus the `media` documents and alt text (`content/media/alts.en.json` for the English side). No schema, no migrations, no component changes.

**Two databases.** Applied to the development database first and verified, then to `DATABASE_URL_PROD`. Per house convention "prod" here is still pre-launch, which lowers the stakes but not the discipline.

**Files.** `public/case-studies/<slug>/` holds the source images that were uploaded. Removed images leave their files in place unless the approved list says otherwise; new replacements are added there first, then uploaded, so the directory stays the record of what was used.

**Scale.** 48 studies, 350 images on the site now, 1748 images available across the decks. 17 of the Drive folders are PDF-only, so their replacement pool needs extracting with `pdfimages` rather than by unzipping a `.pptx`.

**Long-running scripts.** A `--prod --apply` pass keeps writing after the shell returns, so completion is confirmed by re-running until it reports zero changes, never by inspecting immediately after the first run.
