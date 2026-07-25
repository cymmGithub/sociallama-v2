# Tasks — add-industry-related-case-studies

## 1. Content model
- [x] 1.1 Add an `IndustryRelatedStudy` interface (`{ slug: string; title: string }`) and an optional `relatedCaseStudies?: readonly IndustryRelatedStudy[]` field on `Industry` in `lib/content/branze.ts`, documented as additive and explicitly NOT part of variant selection.
- [x] 1.2 Add the row's chrome strings (section kicker/heading + card CTA) to the PL `chrome` block, alongside the existing `proof`/`editorial` groups so both layouts can use them.

## 2. Populate the mapping (PL)
- [x] 2.1 `automotive` → `motointegrator`, `ozgasl`, `a1-karting` (Volvo stays the featured proof card, not repeated in the row).
- [x] 2.2 `elektronika-i-agd` → `vobis`, `asus`, `breville`, `kohersen`, `stadler-form`, `laurastar`, `foodsaver` (iRobot not repeated).
- [x] 2.3 `beauty` → `kontigo`, `luisse`; `health` → `adamed`, `imid-cmv`, `fundacja-saventic`, `mercator`, `power-elements`, `mmhygienic`; `petcare` → `aquael`.
- [x] 2.4 `alkohole` → `faktoria-win`, `mazurska-manufaktura-alkoholi`; `horeca` → `julius-meinl`, `belvedere`; `hotele-i-miejsca-wypoczynkowe` → `dolina-charlotty`, `skibooking`, `getaway`.
- [x] 2.5 `nieruchomosci-i-deweloperzy` → `ed-invest`, `jw-construction`, `dynamic-development`; `rozrywka` → `skrzat`, `rabkoland`.
- [x] 2.6 Leave `finanse` and `fashion` without the field (no honest match). Verify no other industry was touched.

## 3. EN parity
- [x] 3.1 Mirror every entry in `lib/content/branze.en.ts` with English titles and the same slugs, plus the EN chrome strings — `satisfies LocalizedBranze` must pass.

## 4. Rendering
- [x] 4.1 Add a `RelatedCaseStudies` section component in `app/(frontend)/branze/[slug]/industry-page.tsx` that takes the list + `caseStudyBase` + chrome, renders nothing when the list is absent/empty, and links each card to `${caseStudyBase}/${slug}` with the study logo from `/case-studies/<slug>/<slug>-logo.png`.
- [x] 4.2 Invoke it from **both** `ProofLayout` and `EditorialLayout` (before the CTA band). Confirm the variant switch (`industry.caseStudy ? ...`) is untouched.
- [x] 4.3 Add card-row styles to the industry page's CSS module, matching existing card/link conventions.

## 5. Verify
- [x] 5.1 `bun run typecheck` + biome clean; `bun test` passes.
- [~] 5.2 Editorial page regression: an editorial industry (e.g. `/branze/health`) still renders collage + marquee + manifesto AND now shows the related row.
- [~] 5.3 Proof page regression: `/branze/automotive` renders its Volvo proof layout unchanged plus the related row.
- [~] 5.4 `finanse` and `fashion` render exactly as before, with no row and no empty placeholder.
- [~] 5.5 Locale check: the EN industry page links to `/en/case-studies/<slug>`.
- [~] 5.6 Follow one link to a **published** study (e.g. `automotive` → any published slug) to prove the row's links resolve; note that links to still-draft studies 404 until the `import-case-study-decks` publish gate clears.

## 6. Converge the layouts (scope revision — see proposal)
- [x] 6.1 Make `caseStudy.quote` optional; guard the blockquote so a proof page without a testimonial omits it.
- [x] 6.2 Split `numbers` (case-study metrics, numbers band) from `chips` (manifesto value words); migrate Volvo/iRobot `chips` → `numbers`.
- [x] 6.3 Extract `IndustryMarquee` + `IndustryManifesto` and render them from BOTH layouts, so promotion never drops editorial copy.
- [x] 6.4 Render `collage` in the proof layout; add Pexels collages for `automotive` (IDs 5864155, 10800215, 8349487 — brand-neutral, no competitor marques) and `elektronika-i-agd` (844874, 7533923, 29292011).
- [x] 6.5 Promote 8 industries to proof pages with their strongest study: beauty→kontigo, health→adamed, petcare→aquael, alkohole→faktoria-win, horeca→julius-meinl, hotele→dolina-charlotty, nieruchomości→ed-invest, rozrywka→skrzat. Creatives + numbers sourced from each study; featured slug removed from its own related row.
- [x] 6.6 Aquael carries its real client testimonial (Beata Nartowska), verbatim from the ZAUFALI NAM card — the only collected quote among the mapped studies.
- [x] 6.7 EN parity for all of the above; `satisfies LocalizedBranze` passes.

## Out of scope (tracked, not done here)
- [ ] Publishing the 45 imported studies (client-permission gate, `import-case-study-decks`).
- [ ] A `retail/handel` industry for `polomarket`, `riviera`, `galeria-rondo-wiatraczna`, `vobis`.
- [ ] Mapping the 14 studies that fit no current industry.
- [ ] Collecting client testimonials for the 7 proof pages that currently render without a quote.


_Note: 5.2–5.6 are visual/browser checks — verified statically (typecheck, PL/EN parity counts, both layouts wired, variant switch untouched, all 31 slugs resolve to a study + logo). Awaiting a running worktree dev server for the browser pass; the server was down during implementation._
