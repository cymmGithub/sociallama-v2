## 1. Build the replacement pool

- [ ] 1.1 Extract embedded media from all 46 `.pptx` decks (`ppt/media/`) into a per-deck pool directory
- [ ] 1.2 Extract images from the 17 PDF-only deck folders with `pdfimages`, and note that these pools are page-embedded objects and therefore lower quality than the `.pptx` ones
- [ ] 1.3 Discard obvious non-content from every pool up front — solid-colour rectangles, sub-100px icons, the agency's own logomark and contact-slide artwork — and record how many were dropped per deck so the filter is auditable
- [ ] 1.4 Report the total usable pool size per deck

## 2. Map decks to studies by content

- [ ] 2.1 Extract the text of each deck's opening slides and identify the client named there
- [ ] 2.2 Match each deck to a published case-study slug by that name, never by folder name
- [ ] 2.3 Report every deck that cannot be confidently mapped, and every published study with no deck
- [ ] 2.4 Flag decks whose opening slides name a different client than the body — the Medicover/Kontigo pattern — so their pools are treated as contaminated
- [ ] 2.5 Resolve the known folder problems explicitly: two `ED Invest` folders differing by a trailing space, `Dynamic Development/` holding ED Invest's deck, `Kontigo/` holding Brześć's, `Finanse/` holding three brands, `N Energia/` holding only a generic credentials deck

## 3. Dump the current state

- [ ] 3.1 Write a read-only Payload script that dumps, per published study, every cover / gallery / pillar image with its media id, filename, alt text and which field it sits in
- [ ] 3.2 Run it against the development database and confirm the total matches the 350 images on disk under `public/case-studies/`
- [ ] 3.3 Count references per media document so it is known which images are used by more than one study

## 4. Review

- [ ] 4.1 Build, per study, a contact sheet of what the site currently shows
- [ ] 4.2 Build, per study, a contact sheet of that client's filtered deck pool
- [ ] 4.3 Review the pairs study by study and assign every image a verdict — keep, remove, or replace — with a one-line reason
- [ ] 4.4 For each removal, propose a replacement from the same client's pool, or record that none exists
- [ ] 4.5 Record the resulting image count per section, and flag any section that would drop below a sensible minimum with no replacement available
- [ ] 4.6 Confirm the FM Logistic steamer and the #OPENTOWORK portrait are both on the removal list
- [ ] 4.7 Mark genuinely ambiguous images (professional brand shoots that resemble stock) as keep-with-note rather than guessing

## 5. Approval gate

- [ ] 5.1 Produce the full per-image table — study, image, verdict, reason, proposed replacement
- [ ] 5.2 Confirm the table has a row for every one of the 350 images, so no image was silently skipped
- [ ] 5.3 Present it for approval and **write nothing until it is approved**

## 6. Apply to the development database

- [ ] 6.1 Add replacement images to `public/case-studies/<slug>/` so the directory stays the record of what was used
- [ ] 6.2 Write the applying script: reporting by default, `--apply` to write, idempotent on re-run
- [ ] 6.3 Detach removed images from `gallery` and `approach[].media`; delete a media document only where its reference count is 1
- [ ] 6.4 Upload replacements with real Polish alt text, and add the English alt to `content/media/alts.en.json`
- [ ] 6.5 Run with `--apply` against the development database
- [ ] 6.6 Re-run and confirm it reports zero changes
- [ ] 6.7 Verify the affected studies in the browser in both locales — no broken images, no empty gallery grid, pillar media still laid out correctly

## 7. Apply to production

- [ ] 7.1 Run the script against `DATABASE_URL_PROD` with `--apply`
- [ ] 7.2 Re-run until it reports zero changes — do not confirm completion from the first run's output, since a long production pass keeps writing after the shell returns
- [ ] 7.3 Spot-check the affected studies on the deployed site in both locales
- [ ] 7.4 Confirm no case-study text, metric, logo or metadata changed — imagery only

## 8. Close-out

- [ ] 8.1 Keep the approved table as the record of what was detached from where; it is the only rollback instruction, since the Polish drafts are gitignored
- [ ] 8.2 Confirm the diff touches no schema, no migrations and no components
- [ ] 8.3 Report the counts: images reviewed, removed, replaced, and studies left with a shorter section
