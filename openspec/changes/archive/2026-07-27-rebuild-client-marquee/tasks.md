## 1. Source acquisition

- [x] 1.1 Download the 32 loose logo files from gDrive folder ID `1i3hOxAAUdlrh3zx-G-dgRXKR4pgrCRWZ` into a working directory, using `--drive-root-folder-id` (path-based rclone fails on the trailing spaces in the folder names)
- [x] 1.2 Record the per-brand source map from design D4 as data in the pipeline script, with `film skrzat.webp` explicitly blacklisted
- [x] 1.3 Confirm each chosen repository source exists at `public/case-studies/<slug>/<slug>-logo.png` and each chosen gDrive file downloaded

## 2. Logo pipeline

- [x] 2.1 Add the pipeline script under `scripts/` with a documented one-line invocation, porting the probe from the session scratchpad (`pipeline.py`, `mock.py`)
- [x] 2.2 Implement source resolution, including SVG rasterizing for `rabkoland.svg`
- [x] 2.3 Implement edge-connected flood de-matting with feathered alpha, preserving enclosed glyph counters
- [x] 2.4 Implement trim-to-alpha-bbox
- [x] 2.5 Implement per-brand crop-to-primary-mark for KCPU, Medicover, Dolina Charlotty, Rabkoland and the Volvo lockup
- [x] 2.6 Implement optical-mass normalization against the roster median, clamped to `[0.5, 1.0]` of contain-fit
- [x] 2.7 Implement the contrast floor, darkening only marks above the luminance threshold and preserving hue
- [x] 2.8 Emit all 31 logos to `public/assets/clients/<brand>.png` at ~2x the `140×44` box
- [x] 2.9 Emit the verification contact sheet rendering every logo grayscaled at resting opacity on `#e0ddd3`

## 3. Asset review and correction

- [x] 3.1 Review the contact sheet and confirm no logo shows a background plate
- [x] 3.2 Hand-correct the gradient/watermark residue on `imid`, `vistula` and `polomarket`, then re-run the pipeline — fixed in the pipeline instead of by hand: the alpha ramp now has a floor (`CLEAR_TOL`) separate from the connectivity tolerance, so IMiD's watermark arc at distance ~35 clears fully rather than surviving at ~60% alpha
- [x] 3.3 Resolve `oryginalny-sok` (light ink plus leftover box outline) — re-source or drop from the roster — **kept**: re-sourced from gDrive `logo-oryginalny-sok.png`, a clean single-line lockup with no box outline (D4 had chosen the weaker `public/assets/clients` copy)
- [x] 3.4 Resolve `manufaktura-czekolady` (script wordmark illegible at 44px) — re-source a simplified mark or drop from the roster — **kept**: cropped to the cocoa-bean roundel + `chocolate story` script, dropping the illegible underlined line (user decision 2026-07-27)
- [x] 3.5 Confirm `irobot.svg`, `stag.svg`, `uniphar.png`, `funtronic.png`, `aquael.png` and `intrum.png` are still present, since the testimonial slider references them

## 4. Content model

- [x] 4.1 Introduce the locale-invariant roster array (brand key, display name, logo path, optional `caseStudySlug`) per design D6
- [x] 4.2 Reduce `clients` in `lib/content/home.ts` to per-locale copy only, and delete every lorem-ipsum quote and its TODO marker
- [x] 4.3 Mirror the same reduction in `lib/content/home.en.ts`
- [x] 4.4 Remove `clientCardCta.tip` from both locale files
- [x] 4.5 Update the `Client` / `LocalizedHome` types to match the split, keeping locale parity enforced
- [x] 4.6 Confirm the `testimonials` array is untouched and still carries all six slider entries

## 5. Numbers-card copy

- [x] 5.1 For each of the 21 brands with a case study but no testimonial, pick the most striking figure from that study's `results[]` rows
- [x] 5.2 Author the Polish sentence for each of the 21 brands
- [x] 5.3 Author the English sentence for each, reviewed against the established EN locale voice rather than translated literally
- [x] 5.4 Resolve the open question on whether sentences name the platform, and apply the answer uniformly — **named**: a figure with a channel reads as reporting rather than rounding (user decision 2026-07-27). ASUS is the one study with no reach metrics, so its sentence is built on production volume (44 pieces in 6 weeks) instead

## 6. Component

- [x] 6.1 Replace the `testimonial`-only card gate with the three-state branch: testimonial → quote card, else `caseStudySlug` → numbers card, else no card
- [x] 6.2 Render the numbers card body from the brand's figure sentence, with no author footer
- [x] 6.3 Replace the tooltip CTA with a real `Link` to `/case-studies/<slug>` in the current locale, rendered only when `caseStudySlug` exists
- [x] 6.4 Delete the tip state, its ~2s timer, and the now-unused tooltip markup and styles
- [x] 6.5 Raise resting logo opacity from `0.55` to `0.75` in `client-logos.module.css`

## 7. Data fix

- [x] 7.1 Correct `client_name` for case study `volvo` from `"Volvo Car Warszawa & Dom VolvoS"` to drop the trailing `S`, on dev
- [x] 7.2 Apply the same correction to prod — verified 2026-07-27: prod reads `"Volvo Car Warszawa & Dom Volvo"`. The scripted run was denied by the sandbox classifier, and the value was corrected directly in the meantime; the guarded script stays on main in case it regresses

## 8. Verification

- [x] 8.1 Add a test asserting every `caseStudySlug` in the roster resolves to a published case study — split by what each layer can know: `lib/content/clients.test.ts` covers the pure invariants (unique keys, logo files exist, locale parity, no placeholder copy, every case-study brand has card copy in both locales) and `e2e/client-belt.e2e.ts` fetches every slug in both locales, since only the running app knows what is published
- [x] 8.2 Verify the PL homepage belt: all 31 logos render, weights read evenly, nothing washed out or plated
- [x] 8.3 Verify the EN homepage belt and that CTAs navigate to the EN case-study routes
- [x] 8.4 Verify each card state on a representative brand: quote card (`irobot`), numbers card (e.g. `skrzat`), bare logo (e.g. `dpd`)
- [x] 8.5 Verify both contact pages, whose `brand-belt` inherits the new roster — **found and fixed a regression**: the dark belt's `brightness(0) invert(1)` flattens every opaque pixel to white, so Burger King, pracuj.pl and Rabkoland (whose inner text is painted, not knocked out) became solid blobs and POLOmarket read as "polb". The old 12-brand roster happened to contain no such mark. Filter changed to `grayscale(1) invert(1)`, which keeps internal contrast at the cost of a tonally varied rather than uniformly white belt (user decision 2026-07-27)
- [x] 8.6 Verify the homepage testimonial slider still renders all six entries with their logos
- [x] 8.7 Confirm no lorem-ipsum text remains anywhere in the homepage content files
- [x] 8.8 Run lint, typecheck and build

## Deviations from the design

Recorded because each departs from an artifact, and the reasoning belongs with the change rather than in a commit message.

- **D4 source map corrected for two brands.** `oryginalny-sok` and `medicover` were assigned to the existing `public/assets/clients/` copies. Both were the weakest assets in the set — the Oryginalny Sok copy carries a leftover box outline and a "100%" chip, and the Medicover copy is 136x84 against a 280x88 output. gDrive has a clean single-line lockup for the first and a 514x98 horizontal lockup for the second. Both switched to gDrive, which also resolved open questions 3.3 and 3.4 without dropping either brand.
- **Crop-to-primary-mark is satisfied by source choice for Medicover and Volvo.** The spec requires both to be cropped. The chosen gDrive Medicover has no "SPORT" line and the repository Volvo asset is already the bare wordmark, so no crop step is needed to meet the requirement.
- **Manufaktura Czekolady is cropped to the script alone.** It is the roster's one hairline mark — 5% ink coverage against a 26% median — and optical-mass normalisation cannot lift it, because scale-up is clamped at contain-fit by D2. Keeping the cocoa roundel also made the lockup height-bound, so it filled half its slot and read as a gap between LG Electronics and Medicover. The script alone is width-bound, fills the slot, and roughly doubles its stroke weight. Stroke dilation was tried first and rejected: it turns the roundel into a blob and the script blotchy.
- **Rabkoland is cropped by fraction, not by seam.** The other three crops cut at a blank row band the image itself reports, which cannot land mid-glyph — the first attempt used hand-picked height fractions and sliced through Dolina Charlotty's descenders. Rabkoland's badge outline inks every row, so it has no seam; its cut is set by eye and verified at belt size. Keeping the badge whole was tested and rejected — RABKOLAND shrinks and the ribbon is unreadable.
- **D3 reversed: the contrast floor moved out of the asset and into the belt's resting CSS filter.** Baking it into the PNGs is the wrong layer — at rest the belt is `grayscale(1)`, so resting legibility is a luminance problem and colour is discarded, but hover is the *only* state where colour matters. Darkening the asset therefore paid for a resting problem with a hover cost, and Burger King's orange read as mud. D3 rejected a CSS filter because it "would need a per-logo hook"; it does not — precisely because grayscale has already flattened everything, one uniform `brightness(0.8)` on `.logo` is safe for all 31, and hover clears the whole filter rather than just its grayscale. Measured against a 220 band at 0.75 opacity, that filter covers every mark up to ~190 luminance, which is 28 of 31.
- **The three marks beyond the filter's reach are handled by repainting, not darkening.** Mercator (229), POLOmarket (216) and Rabkoland (203) are near-white ink. For the first two the white is a knockout lifted off a solid plate — red `#fe0000` and navy `#00468c` — and *the plate colour is the brand colour*, so the pipeline now repaints the ink in it. That reconstructs the logo those brands use everywhere else (red `polo`, navy `MERCATOR`) instead of a grey one, drops their luminance to 80 and 64 so no darkening is needed at all, and removes the coloured fringe along the glyph edges, which now matches the ink. Rabkoland is a full-colour badge with no plate to sample, so it remains the roster's only darkened asset — and only to 150, not 105, since darkening is what hover reveals.
- **Emitted marks are inset from the canvas edge by 4px.** The belt halves the 280x88 canvas into its 140x44 box, so a glyph on the outermost row maps onto a half pixel and loses most of its weight — Dolina Charlotty, Rondo Wiatraczna and IMiD rendered as though clipped while the ink was present in the file. Scale is now solved against a 272x80 inset box, which keeps normalisation relative to contain-fit while guaranteeing a margin.
- **IMiD re-sourced to gDrive.** The repository asset is a crop out of a larger layout: besides the watermark arc it carries the tops of a maroon heading bleeding in along the bottom edge. That is real ink, not plate, so de-matting keeps it — it rendered as a row of grey dashes under the logo. The Drive copy is the bare lockup. This is the third D4 correction, and all three were cases where the design's chosen source carried an avoidable defect.
- **Residue fixed in the pipeline rather than by hand (task 3.2).** The probe's single tolerance served as both the connectivity test and the alpha ramp, so IMiD's watermark arc at colour distance ~35 survived at ~60% alpha. Separating the ramp floor from the connectivity tolerance clears it, and keeps the fix re-runnable.
- **The roster is a keyed object, not an array.** `Localized<T>` maps over `keyof T`, so an array only ever enforced "both locales have the same shape"; a wrong `caseStudySlug` in one locale type-checked. Keying the copy by brand makes a missing English sentence a build error.
- **Both contact pages now read `CLIENT_ROSTER` directly** instead of `clients` from the locale modules. They only ever used `name` and `logo`, which are locale-invariant, so this removes an accidental locale dependency rather than duplicating it.
- **Pipeline lives at `scripts/client-logos/` per task 2.1, with its sources at `assets-src/client-logos/`**, following the existing `assets-src/hero-wardrobe` convention for committed source material. `assets-src` is now excluded from Biome, which was otherwise linting the raw Rabkoland SVG.

## Scope added after review

The user reviewed the belt and asked for two changes beyond the original artifacts. Both are reflected in the specs above.

- **Numbers cards carry supporting figures, not just a sentence.** One line read as too thin for a hover card. Each of the 21 brands now shows up to three additional figures from its case study beneath the sentence — value plus a label naming the metric and channel — deliberately excluding the figure the sentence already names. Thin studies show fewer rows rather than padding: `jw-construction` and `rabkoland` have one, `pracuj-pl`, `produkty-cukiernicze-brzesc` and `volvo` have two. That is 63 more authored rows per locale, 126 in total.
- **The card widened from 400px to 480px.** At 400 each of the three metric columns got ~105px and every label wrapped to three lines. The figures are laid out as a stat strip rather than label/value rows, because the labels run 20-30 characters and a two-column row either wrapped them mid-phrase or squeezed the value.

## Noted, not changed

- `public/assets/clients/aflofarm.png`, `kontigo.png`, `press-service.png` and `worldline.png` are unreferenced now that their brands left the roster. Left in place: they are approved-client artwork, and deleting brand assets is a separate call.
- The belt's `<Image>` declares `sizes="100vw"` for a 140px box, so the browser requests the 1920w/3840w optimizer variant of every logo. Pre-existing, and Next never upscales past the 280px source, so the payload stays small — but the hint is wrong and now applies to 31 logos instead of 12.
- **Medicover has no case study, so it is a bare logo.** Its deck is in gDrive (`Medicover /Medicover - case study.pptx`) and importing it would make Medicover a 23rd linked brand, but design Non-Goals explicitly defer that as a case-study change rather than a marquee one.
- Only `irobot`, `pracuj-pl` and `volvo` have English case-study content; the other 19 fall back to Polish. Pre-existing, and the EN routes resolve for all of them.
- `bun run check` has 2 pre-existing failures in `lib/scripts/satus.e2e.test.ts` (lean-template typecheck, missing `@/lib/integrations/mailchimp/action`) and pre-existing Biome `module_resolver` panics. Both reproduce on a clean tree.
