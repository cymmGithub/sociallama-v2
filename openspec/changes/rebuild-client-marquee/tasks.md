## 1. Source acquisition

- [ ] 1.1 Download the 32 loose logo files from gDrive folder ID `1i3hOxAAUdlrh3zx-G-dgRXKR4pgrCRWZ` into a working directory, using `--drive-root-folder-id` (path-based rclone fails on the trailing spaces in the folder names)
- [ ] 1.2 Record the per-brand source map from design D4 as data in the pipeline script, with `film skrzat.webp` explicitly blacklisted
- [ ] 1.3 Confirm each chosen repository source exists at `public/case-studies/<slug>/<slug>-logo.png` and each chosen gDrive file downloaded

## 2. Logo pipeline

- [ ] 2.1 Add the pipeline script under `scripts/` with a documented one-line invocation, porting the probe from the session scratchpad (`pipeline.py`, `mock.py`)
- [ ] 2.2 Implement source resolution, including SVG rasterizing for `rabkoland.svg`
- [ ] 2.3 Implement edge-connected flood de-matting with feathered alpha, preserving enclosed glyph counters
- [ ] 2.4 Implement trim-to-alpha-bbox
- [ ] 2.5 Implement per-brand crop-to-primary-mark for KCPU, Medicover, Dolina Charlotty, Rabkoland and the Volvo lockup
- [ ] 2.6 Implement optical-mass normalization against the roster median, clamped to `[0.5, 1.0]` of contain-fit
- [ ] 2.7 Implement the contrast floor, darkening only marks above the luminance threshold and preserving hue
- [ ] 2.8 Emit all 31 logos to `public/assets/clients/<brand>.png` at ~2x the `140×44` box
- [ ] 2.9 Emit the verification contact sheet rendering every logo grayscaled at resting opacity on `#e0ddd3`

## 3. Asset review and correction

- [ ] 3.1 Review the contact sheet and confirm no logo shows a background plate
- [ ] 3.2 Hand-correct the gradient/watermark residue on `imid`, `vistula` and `polomarket`, then re-run the pipeline
- [ ] 3.3 Resolve `oryginalny-sok` (light ink plus leftover box outline) — re-source or drop from the roster
- [ ] 3.4 Resolve `manufaktura-czekolady` (script wordmark illegible at 44px) — re-source a simplified mark or drop from the roster
- [ ] 3.5 Confirm `irobot.svg`, `stag.svg`, `uniphar.png`, `funtronic.png`, `aquael.png` and `intrum.png` are still present, since the testimonial slider references them

## 4. Content model

- [ ] 4.1 Introduce the locale-invariant roster array (brand key, display name, logo path, optional `caseStudySlug`) per design D6
- [ ] 4.2 Reduce `clients` in `lib/content/home.ts` to per-locale copy only, and delete every lorem-ipsum quote and its TODO marker
- [ ] 4.3 Mirror the same reduction in `lib/content/home.en.ts`
- [ ] 4.4 Remove `clientCardCta.tip` from both locale files
- [ ] 4.5 Update the `Client` / `LocalizedHome` types to match the split, keeping locale parity enforced
- [ ] 4.6 Confirm the `testimonials` array is untouched and still carries all six slider entries

## 5. Numbers-card copy

- [ ] 5.1 For each of the 21 brands with a case study but no testimonial, pick the most striking figure from that study's `results[]` rows
- [ ] 5.2 Author the Polish sentence for each of the 21 brands
- [ ] 5.3 Author the English sentence for each, reviewed against the established EN locale voice rather than translated literally
- [ ] 5.4 Resolve the open question on whether sentences name the platform, and apply the answer uniformly

## 6. Component

- [ ] 6.1 Replace the `testimonial`-only card gate with the three-state branch: testimonial → quote card, else `caseStudySlug` → numbers card, else no card
- [ ] 6.2 Render the numbers card body from the brand's figure sentence, with no author footer
- [ ] 6.3 Replace the tooltip CTA with a real `Link` to `/case-studies/<slug>` in the current locale, rendered only when `caseStudySlug` exists
- [ ] 6.4 Delete the tip state, its ~2s timer, and the now-unused tooltip markup and styles
- [ ] 6.5 Raise resting logo opacity from `0.55` to `0.75` in `client-logos.module.css`

## 7. Data fix

- [ ] 7.1 Correct `client_name` for case study `volvo` from `"Volvo Car Warszawa & Dom VolvoS"` to drop the trailing `S`, on dev
- [ ] 7.2 Apply the same correction to prod

## 8. Verification

- [ ] 8.1 Add a test asserting every `caseStudySlug` in the roster resolves to a published case study
- [ ] 8.2 Verify the PL homepage belt: all 31 logos render, weights read evenly, nothing washed out or plated
- [ ] 8.3 Verify the EN homepage belt and that CTAs navigate to the EN case-study routes
- [ ] 8.4 Verify each card state on a representative brand: quote card (`irobot`), numbers card (e.g. `skrzat`), bare logo (e.g. `dpd`)
- [ ] 8.5 Verify both contact pages, whose `brand-belt` inherits the new roster
- [ ] 8.6 Verify the homepage testimonial slider still renders all six entries with their logos
- [ ] 8.7 Confirm no lorem-ipsum text remains anywhere in the homepage content files
- [ ] 8.8 Run lint, typecheck and build
