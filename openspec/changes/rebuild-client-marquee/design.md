## Context

The belt (`app/(frontend)/(home)/sections/client-logos/`) renders a hand-curated list of 12 clients from `lib/content/home.ts`, duplicated into `lib/content/home.en.ts`. A card only opens when the entry has a `testimonial`, so 8 entries carry lorem-ipsum quotes purely to make the card appear. The CTA never navigates — it pops a `"waiting for case study :)"` bubble — because the belt predates the case-study collection. That collection now holds 48 published studies.

The approved homepage client set lives in gDrive at `TOP MARKI na strone główną` (folder ID `1i3hOxAAUdlrh3zx-G-dgRXKR4pgrCRWZ`, shared-with-me; trailing spaces in the folder names break path-based rclone, so `--drive-root-folder-id` is required). It contains two unrelated payloads: 32 loose logo files at root, and 22 brand subfolders holding case-study decks. Only the loose logos are in scope here.

The approved set and the current belt barely overlap — 4 brands in common. 22 of the approved brands already have a published case study.

Constraints discovered while probing, which drive most of the decisions below:

- Belt CSS renders logos in a `140×44` box with `object-fit: contain`, `filter: grayscale(1)`, `opacity: 0.55`, on `--color-sand` `#e0ddd3`.
- 16 of the 32 gDrive files are opaque — they render as grey or white rectangles on the sand band. So do 8 of the 22 repository case-study logos.
- `object-fit: contain` equalizes bounding boxes, not visual mass. Rendered side by side, `pracuj.pl` and `ASUS` dominate while `Julius Meinl` and `Brześć` shrink to specks. At 12 logos this passed; at 31 it reads as broken.
- Four marks (Mercator, POLOmarket, Rabkoland, Burger King) are drawn in white or near-white on a coloured plate. Removing the plate leaves ink that is invisible on sand.
- gDrive's `film skrzat.webp` is the Skrzat *movie poster*, not the client's logo.
- The `clients` array also feeds `components/ui/brand-belt`, used on both contact pages.

A working pipeline probe exists in the session scratchpad (`pipeline.py`, `mock.py`, `viewport.py`) using PIL + `scipy.ndimage` for edge-connected flood de-matting and Inkscape for SVG rasterizing. It has already produced and visually verified the full 31-logo roster.

## Goals / Non-Goals

**Goals:**

- Belt roster equals the approved client set, with no brand outside it.
- Zero placeholder quote content in production.
- Every belt logo legible at rest, at comparable optical weight, with a transparent background.
- Every brand with a published case study links to it.
- The pipeline is re-runnable, so adding a client later is a scripted step rather than manual Photoshop work.

**Non-Goals:**

- Importing the Medicover deck. It exists in gDrive and would unblock that case study, turning Medicover from a bare logo into a 23rd linked brand — but that is a case-study change, not a marquee change.
- Auditing the published case studies against their gDrive decks (`dynamic-development` / `ed-invest` possible cross-contamination, `pracuj.pl`'s newer April 2026 deck, the Rondo Wiatraczna event decks, the extra iRobot report).
- Changing the marquee's motion, pause-on-hover, edge-fade, or accessibility behaviour.
- Redesigning the card's visual shell. Only its content states change.

## Decisions

### D1 — The pipeline is an offline script emitting committed PNGs

A committed script under `scripts/` that reads chosen sources and writes `public/assets/clients/*.png`, run by hand and its output reviewed in the diff.

*Alternatives considered.* Runtime normalization (a Next.js loader or Payload hook) was rejected: the belt is above the fold on every homepage render, the inputs never change between deploys, and per-request image processing would be pure cost. Doing it manually in an image editor was rejected because it is unrepeatable and unreviewable — adding a 32nd client would mean redoing the judgement by hand.

The de-matting, normalization, and contrast work is all deterministic given a fixed source set, so a script that can be re-run and diffed is the right shape.

### D2 — Normalize optical mass in the asset, not in CSS

Each emitted logo is pre-scaled and padded so that its inked area is comparable to the roster median. The component keeps a single `140×44` box and stays unaware that normalization happened.

*Alternatives considered.* A per-logo `scale` field on the `Client` type would have to be duplicated across `home.ts` and `home.en.ts` for all 31 entries and tuned by trial-and-error against the rendered page. Per-logo CSS classes would be worse still. Putting the judgement in the asset keeps both locale files free of presentation tuning and means the contact-page `brand-belt` inherits the correct weighting for free.

Scale is derived from alpha-weighted ink area against the roster median, clamped to `[0.5, 1.0]` of contain-fit so nothing overflows the box or collapses.

### D3 — Bake the contrast floor into the asset

Marks whose mean ink luminance exceeds the readability threshold are darkened toward a floor, preserving hue, before emission.

*Alternatives considered.* A CSS `brightness()` filter on specific logos would need a per-logo hook in the component and would fight the existing `grayscale(1)` / hover `grayscale(0)` transition. A per-logo `--logo-brightness` custom property has the same duplication problem as D2.

The trade-off is real and worth stating: darkening changes the brand colour revealed on hover for the four affected marks. Mercator's white wordmark cannot be shown truthfully on a sand band at any opacity — the alternative is a coloured chip behind it, which the existing spec explicitly rejected ("no chip — colors are legible on sand"). Darkening is the lesser compromise, and it affects 4 of 31 logos.

### D4 — Source precedence: repository first, gDrive as fallback

Counter to the framing of "pull the logos from Drive", the repository asset is better for 14 of the 22 brands that have one — already de-matted and tightly cropped, because they were curated during the case-study import. Drive wins only where the repository copy is a dark plate or too low-resolution, and is the sole source for the 8 brands with no case study.

Treating Drive as authoritative would have downgraded 14 brands and put a movie poster in the belt.

| Brand | Source | Why |
|---|---|---|
| asus, dolina-charlotty, dynamic-development, ed-invest, fm-logistics, galeria-rondo-wiatraczna, imid, irobot, jw-construction, motointegrator, produkty-cukiernicze-brzesc, riviera, skrzat, volvo | repo `public/case-studies/<slug>/<slug>-logo.png` | already transparent and tightly cropped |
| a1-karting, engie, julius-meinl, polomarket | gDrive | repo copy is an opaque plate |
| mercator, pracuj-pl | gDrive | repo copy too low-resolution (197×54, 176×45) |
| vistula | gDrive | higher resolution |
| rabkoland | gDrive `rabkoland.svg` | vector source |
| medicover, oryginalny-sok | existing `public/assets/clients/` | already transparent |
| burger-king, dpd, home-invest, kcpu, lg-electronics, manufaktura-czekolady, toms | gDrive | no case study, only source |

`film skrzat.webp` is explicitly blacklisted.

### D5 — Card state is derived from content shape, not a flag

The component branches on what the entry actually has: `testimonial` → quote card; else `caseStudySlug` → numbers card; else no card. No `cardType` discriminator is introduced.

*Alternatives considered.* An explicit `cardType: 'quote' | 'numbers' | 'none'` field would let the two states drift out of sync with the data backing them — an entry could claim `'quote'` with no quote. Deriving makes the invalid states unrepresentable.

This inverts the current gate: today `testimonial` is the precondition for a card existing at all. After this change it selects *which* card.

### D6 — Split the roster into a locale-invariant list plus locale copy

`logo`, `caseStudySlug`, and the brand key are identical across locales, yet today all 12 entries are typed out twice. At 31 entries that is 31 duplicated logo paths and 22 duplicated slugs, each an opportunity for silent drift — and a wrong `caseStudySlug` fails as a 404, not a type error.

The roster moves to a single shared array of locale-invariant fields; `home.ts` and `home.en.ts` supply only the per-locale copy (the numbers sentence, and the one testimonial).

*Alternatives considered.* Deriving `caseStudySlug` from the brand key was rejected — the keys and slugs genuinely differ (`imid` → `imid-cmv`, `volvo` covers two marks), so a derivation would need an exception map, which is the thing it was meant to remove. Keeping the full duplication was rejected because the existing `LocalizedHome` type only enforces that both arrays have the same *shape*, not the same slugs.

A test asserting every `caseStudySlug` resolves to a published study closes the remaining gap.

### D7 — The numbers sentences ship in this change

21 brands need a numbers card (22 with a case study, minus `irobot` which has a testimonial), in two locales — 42 short authored sentences.

Shipping the mechanism without the copy would leave 21 empty cards on the homepage, so it cannot be deferred. This is the largest single effort in the change and the one most likely to need review. Each sentence is drawn from that study's `results[]` rows, picking the most striking figure editorially rather than taking the first row.

### D8 — Replace the roster rather than extend it

The approved set is a statement about which clients belong on the homepage, so brands absent from it are removed rather than kept alongside. This drops Aquael, Funtronic, Intrum Justitia and Uniphar — the only four brands with verified quotes — from the belt.

That is safe only because all four already appear independently in the homepage testimonial slider (`testimonials` in `home.ts`), which is untouched. Their logo files must therefore survive the cleanup even though their marquee entries do not.

## Risks / Trade-offs

**Deleting a logo file still referenced by the testimonial slider** → `irobot.svg`, `stag.svg`, `uniphar.png`, `funtronic.png`, `aquael.png`, `intrum.png` are used by `testimonials`, not `clients`. Removing a brand from the roster must not delete its asset. Verify the slider renders all six after the roster swap.

**The contact-page belt changes silently** → `components/ui/brand-belt` consumes the same `clients` array, so both contact pages get the new roster without any edit to them. This is intended, but it is an unreviewed surface; check both pages.

**Automated de-matting leaves residue on non-flat backgrounds** → `imid`, `vistula` and `polomarket` have gradient or watermark backgrounds and retain a faint circular ghost after the flood pass. These need hand correction; the contact-sheet verification step is what catches them.

**Two assets may be unsalvageable** → `oryginalny-sok` has light ink plus a leftover box outline, and `manufaktura-czekolady` is a fine script wordmark that is illegible at 44px under any treatment. Both may need re-sourcing from the client. Neither has a case study, so worst case they are dropped from the roster without affecting any CTA.

**Darkening alters hover brand colour** → accepted for 4 of 31 logos (D3). If it reads badly in review, the fallback is to drop those brands' hover colour reveal rather than reintroduce chips.

**31 logos lengthen the marquee loop** → at 1440px only ~8 are visible at once and the belt reads fine, so a single row is kept. If the loop feels slow in review, `speed` is a one-line adjustment; splitting into two rows would double the band height and push the hero up, so it is a last resort.

**Numbers-card copy quality** → 42 authored sentences is a lot of surface for tone drift, especially in English. The EN set should be reviewed against the established EN locale voice rather than translated literally.

## Migration Plan

1. Run the pipeline, review the contact sheet, hand-correct the residue cases, re-run.
2. Land assets and the roster/component change together — a roster referencing logos that do not exist yet would 404 across the belt.
3. Verify the homepage (PL + EN), both contact pages, and the testimonial slider before merging.
4. Apply the `volvo` `client_name` fix to dev and prod.

Rollback is a straight revert: the change is additive in `public/assets/clients/` and confined to content, one component, and one stylesheet. No schema or data migration is involved beyond the single `client_name` string correction.

## Open Questions

- `oryginalny-sok` and `manufaktura-czekolady` may need re-sourced artwork from the client. Ship them degraded, or drop them from the roster until better files arrive?
- Should the numbers sentence name the platform (`"35 mln wyświetleń na TikToku"`) or stay platform-agnostic (`"35 mln wyświetleń"`)? Naming the platform is more concrete but makes the sentences longer and less uniform.
