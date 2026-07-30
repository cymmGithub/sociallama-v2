## 1. Social icon order

- [ ] 1.1 Reorder `socials` in `lib/content/home.ts` to Facebook, Instagram, LinkedIn, TikTok, X, YouTube, Pinterest, keeping every existing href and icon path; update the ordering comment above the array so it states the new order and does not still say "Meta-first"
- [ ] 1.2 Verify the new order appears in the header overlay, footer sign-off band, homepage hero and `/o-nas` hero without touching those components — if any surface disagrees, it holds its own copy of the order and that is a defect to fix here
- [ ] 1.3 Verify the seven icons still fit a 390px viewport in the hero and the footer without overflow or unintended wrapping

## 2. Client belt de-clustering

- [ ] 2.1 Add an `industry` field to `ClientBrand` in `lib/content/clients.ts` and tag all 31 roster entries
- [ ] 2.2 Move `ed-invest` to directly after `polomarket` and `mercator` to directly after `riviera`; leave the other 29 entries where they are
- [ ] 2.3 Add a test to `lib/content/clients.test.ts` asserting that no two cyclically adjacent roster entries share an `industry` (treating the last entry as adjacent to the first), and that every entry is tagged
- [ ] 2.4 Run `bun test lib/content/clients.test.ts` and confirm the new test passes and the existing roster tests still pass
- [ ] 2.5 Confirm `CLIENT_ROSTER[0]` is still `a1-karting` so `e2e/kontakt.e2e.ts` keeps holding, and check the belt visually for the two former collisions

## 3. Knockout logo counters

- [ ] 3.1 In `scripts/client-logos/pipeline.py`, make plate clearing global for marks declared `plate_ink` — clear plate-coloured pixels wherever they occur, not only where connected to the border — keeping the existing border-connected behaviour for every other mark
- [ ] 3.2 Confirm the change is reachable only via the `plate_ink` option, so the case-study pass (which does not inherit it, `CS_INHERIT_OPTS = {"tol"}`) is untouched
- [ ] 3.3 Run `python3 scripts/client-logos/pipeline.py --belt` and inspect the emitted contact sheet: POLOmarket's `p`/`o`/`o` and Mercator's `R`/`A`/`O` counters must read as holes at belt size under the resting grayscale treatment
- [ ] 3.4 Confirm POLOmarket's yellow sun survives and is still yellow
- [ ] 3.5 Diff every file in `public/assets/clients/` — only `polomarket.png` and `mercator.png` may change. Any other PNG moving means the optical-mass median shifted; investigate before committing
- [ ] 3.6 Confirm `public/case-studies/polomarket/polomarket-logo-mono.png` and `.../mercator/mercator-logo-mono.png` are unchanged

## 4. Case-study body justification

- [ ] 4.1 Add `text-align: justify` and `hyphens: auto` to `.prose` and `.pillarBody` in `app/(frontend)/case-studies/[slug]/case-study.module.css`, leaving `.lead`, headings, tags and metric tiles ragged-right
- [ ] 4.2 Verify on a long case study that the narrow approach-pillar column shows no whitespace river spanning three or more lines, at 768px and 1280px
- [ ] 4.3 Verify hyphenation is actually engaging on the Polish page and on the English page — if `hyphens: auto` silently no-ops there will be rivers rather than an error
- [ ] 4.4 Confirm no blog post body picked up justification (the `.prose` rule is local to the case-study module despite its comment)

## 5. Closing CTA copy

- [ ] 5.1 In `lib/content/case-studies.ts` and `case-studies.en.ts`, remove the `eyebrow` and `secondary` CTA fields and set `primary` to the header CTA's wording ("Porozmawiajmy o Twoim biznesie" / "Let's talk about your business")
- [ ] 5.2 In `lib/content/uslugi.ts` / `.en.ts` and `lib/content/branze.ts` / `.en.ts`, remove `ctaEyebrow` and set `ctaButton` to the same wording
- [ ] 5.3 In `app/(frontend)/case-studies/[slug]/case-study-article.tsx`, drop the eyebrow paragraph and the secondary `Link`, leaving one primary action
- [ ] 5.4 Remove the now-orphaned `.ctaEyebrow` and `.ctaSecondary` rules from `case-study.module.css`, and the equivalent orphans in the services and industries modules — and only those
- [ ] 5.5 Remove the eyebrow render sites in the services and industries CTA components
- [ ] 5.6 Verify a case-study page, a service page and an industry page in both locales: one action each, wording matching the header, no eyebrow, no listing link inside the block

## 6. `/o-nas` team slider — names

- [ ] 6.1 Rename `.surname` → `.nameSmall` and `.given` → `.nameBig` in `team.module.css`, and swap the colours: `.nameSmall` orange, `.nameBig` `--color-secondary`
- [ ] 6.2 In `app/(frontend)/o-nas/sections/team/index.tsx`, render `member.given` in the small slot and `member.surname` in the large one, updating the component comment that describes the treatment
- [ ] 6.3 Change `given: 'ANIA'` to `'ANNA'` in `lib/content/o-nas.ts` and `o-nas.en.ts`
- [ ] 6.4 Change `name: 'Ania Ozga'` to `'Anna Ozga'` in the `TEAM` array in `app/(frontend)/(home)/sections/why-that-works/index.tsx` so the two surfaces agree
- [ ] 6.5 Verify the small slot's computed font size never falls below 18.66px (it is bold), so orange-on-plum at 3.41:1 stays inside the WCAG large-text allowance
- [ ] 6.6 Step the slider through all 12 members at 390px, 768px, 1280px, 1920px and above 1700px, confirming MARCINOWSKA — now the longest string in the display slot — never clips or overflows

## 7. `/o-nas` team slider — certificate chips

- [ ] 7.1 Add an optional `certs` field to the member shape in `lib/content/o-nas.ts`, plus the chip's accessible-name labels, and declare DIMAQ for Anna Ozga and Magda Rokicka in both locales
- [ ] 7.2 Render the chip row between `.role` and `.bio` in the team component: light chip ground, mark at `objectFit: contain` and its own aspect ratio, no recolour or crop, accessible name from content
- [ ] 7.3 Remove the "Posiadaczka certyfikatu DIMAQ Professional." sentence from Anna Ozga's and Magda Rokicka's bios, and the equivalent from the English bios
- [ ] 7.4 Verify members without certificates render no chip row and their role line still runs cleanly into the bio

## 8. `/o-nas` team slider — bios

- [ ] 8.1 Draft the 11 Polish bios from the client document into a consistent ~450–600 character band, third person throughout, converting Agnieszka Klajbert's first-person source text
- [ ] 8.2 Keep the site's role labels where the document disagrees ("Head of Social Media", "Wideo Content Creator"), per the existing spec
- [ ] 8.3 Leave Przemysław Świercz's bio as it is — he is not in the source document
- [ ] 8.4 Re-translate the English bios to the same substance and length band in `o-nas.en.ts`
- [ ] 8.5 Step the slider from the shortest to the longest bio in both locales and confirm the text column does not jump or reflow mid-crossfade
- [ ] 8.6 Confirm every bio measures inside the band, with no member several times another's length

## 9. Homepage certificate caption

- [ ] 9.1 Rewrite `certsLabel` in `lib/content/home.ts` and `home.en.ts` from the bare word to one short sentence saying what the two certificates cover
- [ ] 9.2 Render it under the certificate cards in `app/(frontend)/(home)/sections/why-that-works/index.tsx`, with a style rule in the module CSS
- [ ] 9.3 Verify the caption reads correctly in both locales and does not disturb the grid's row heights on mobile

## 10. Join-CTA `⋯` dropdown

- [ ] 10.1 Replace the modal sheet with a non-modal dropdown anchored to the `⋯` trigger: `aria-expanded` / `aria-controls` on the button, no `aria-modal`, no scrim, no Tab trap
- [ ] 10.2 Make each option a disclosure that reveals its answer beneath itself with the option list still mounted, instead of swapping the list for the answer
- [ ] 10.3 Delete the focus-restoration effect and its `biome-ignore`, and the `onSheetKeyDown` Tab trap — both exist only to compensate for the unmount this removes
- [ ] 10.4 Keep Escape-to-close, outside-pointer-to-close, focus return to the trigger, and the `/kontakt` link inside the panel
- [ ] 10.5 Retire `menuTitle` and `menuClose` from `joinCta.post` in both locales if the dropdown no longer needs them, and remove the orphaned `.sheet*` rules from `join-cta.module.css`
- [ ] 10.6 Rewrite the three option labels and answers in a warmer, more human voice in both locales, keeping one option that admits the section is a page section rather than an ad
- [ ] 10.7 Keyboard pass: open with Enter, Tab through the options, expand one, confirm focus is still on the activated control, Escape, confirm focus is back on `⋯`
- [ ] 10.8 Confirm the reduced-motion path suppresses the dropdown reveal in favour of its end state
- [ ] 10.9 Test on real Safari (macOS) and iOS Safari — the reported flakiness was not reproduced in this environment, so the fix cannot be called done from the code change alone

## 11. Join-CTA heading overlap

- [ ] 11.1 Change the rotator token in `lib/content/home.ts` from `NA X (TWITTERZE)?` to `NA X (TWITTER)?` (English copy already reads `ON X (TWITTER)?`)
- [ ] 11.2 Re-measure every token's text extent against the media column at 1024, 1152, 1280, 1366, 1440, 1512, 1600, 1680 and 1920px with the shortened token in place, and confirm `NA INSTAGRAMIE?` is now the widest
- [ ] 11.3 Reduce the heading's display clamp so `maskLeft + widestTokenWidth + gutter ≤ mediaLeft` for that new widest token, starting from the measured ~5.5% and taking the largest clamp that still clears every token
- [ ] 11.4 Re-measure every token's text extent again after the clamp change and confirm all values are negative with a real gutter
- [ ] 11.5 Confirm the token mask's own box now lies entirely inside the copy column, so it cannot overhang before a word animates
- [ ] 11.6 Screenshot the section with `NA X (TWITTER)?` and `NA INSTAGRAMIE?` forced active at 1280 and 1440 and confirm no glyph is drawn over the card
- [ ] 11.7 Check the heading still reads with enough presence at 1440 after the reduction
- [ ] 11.8 Confirm mobile and ≥1920px layouts are unchanged by the clamp edit

## 12. Proof-card titles and logo alt

- [ ] 12.1 Add a required `brand` field to the `ProofCase` interface in `lib/content/uslugi.ts`
- [ ] 12.2 Set `brand` on all three cases in `uslugi.ts` and `uslugi.en.ts` (`iRobot`, `Volvo`, `Pracuj.pl`)
- [ ] 12.3 Strip the brand prefix from the iRobot and Pracuj.pl titles in both locales
- [ ] 12.4 Rewrite the Volvo titles so they read correctly without the brand — PL `Budowa marek na LinkedInie, Facebooku i Instagramie`, EN `Building the brands on LinkedIn, Facebook, and Instagram`; this one is an edit, not a deletion, so read it rather than skim it
- [ ] 12.5 In `app/(frontend)/uslugi/[slug]/service-page.tsx`, change the proof card logo from `alt=""` to `alt={item.brand}`
- [ ] 12.6 Verify on `/uslugi/influencer-marketing`, `/uslugi/kreacje-wideo` and `/uslugi/audyt-i-konsultacje` that each card shows the brand once (logo only) and that the link's accessible name still contains it
- [ ] 12.7 Confirm the three proof cards still render correctly in both locales with the shorter titles — no orphaned dash, no odd line break
- [ ] 12.8 Raise separately: the same `<Image>` requests `w=3840&q=90` for a 140×44 box because it has no `mobileSize`/`desktopSize`. Do not fold this in without a decision

## 13. Verification and close-out

- [ ] 13.1 `bun run check` clean (note: five files are known to trip a Biome internal panic on `main` — confirm the failure set is unchanged rather than assuming green)
- [ ] 13.2 `bun test` clean
- [ ] 13.3 `bun run e2e` for `client-belt.e2e.ts` and `kontakt.e2e.ts`, run from the repo root so Playwright's hardcoded `:3000` hits this code and not another worktree's
- [ ] 13.4 Visual pass on `/`, `/o-nas`, one case study, one service page and one industry page, in both locales
- [ ] 13.5 Revert the `home.ts` copyright-year hunk if `bun run build` restamped it — it is not part of this change
- [ ] 13.6 Confirm the diff contains no changes to Payload schema, migrations or case-study data
