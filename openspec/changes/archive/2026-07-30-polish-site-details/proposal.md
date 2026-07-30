## Why

Ten unrelated polish items reported off a client review of the live site. They batch into one change because five of them contradict requirements that existing specs already state normatively — shipping the code without the spec deltas would leave the specs lying about the site.

Four are defects rather than preferences:

- **`polomarket.png` and `mercator.png` violate `client-logo-assets` spec (Requirement: transparent backgrounds)**, which requires that "enclosed counters and interior negative space inside glyphs survive". Both marks render with the counters of `p`/`o`/`o` and `R`/`A`/`O` filled in solid brand colour, so the wordmarks read as blobs on the belt.
- **The client belt puts two property developers side by side** (`dynamic-development`, `ed-invest`) and two medical brands side by side (`medicover`, `mercator`), because the roster is ordered alphabetically by key and industry was never a consideration.
- **The join-CTA heading overruns the post card at laptop widths.** Measured against the running site: `.tokenMask` is `overflow-x: visible` and its width equals the *widest* token, not the active one, so the token line exceeds the copy column. `NA X (TWITTERZE)?` crosses into the card's column at every width from 1024 to 1680 px (worst +54 px at 1366–1440), and its `)` and `?` render on top of the card's media well. `NA INSTAGRAMIE?` crosses too, marginally, from 1024 to 1512 px (+6 to +11 px). `NA PINTEREŚCIE?` clears by as little as 22 px. `NA YOUTUBIE?` is not close at any width (−111 to −230 px).
- **The `⋯` menu on the join-CTA post mock is unreliable on Safari / iOS.** It is a modal `aria-modal` sheet with a scrim, a Tab trap, a document-level Escape handler, and a body that swaps the option list for an answer — which unmounts the focused button and needs a focus-restoration effect to stop focus landing on `<body>`. That much machinery for a decorative mock is what makes it fragile.

The rest are content and typographic corrections: the social icon order, justification of case-study body text, the closing CTA on case-study/service/industry pages, the `/o-nas` team slider name treatment and bios, and an unexplained pair of certificate cards on the homepage.

## What Changes

1. **Social icon order** — the canonical `socials` set is reordered to **Facebook, Instagram, LinkedIn, TikTok, X, YouTube, Pinterest**. One array in `lib/content/home.ts`, consumed by the header overlay, footer, hero and `/o-nas` hero, so the change propagates to every surface at once (intended).

2. **Client belt de-clustered by industry** — the roster gains an internal `industry` tag and a rule: no two brands that are cyclically adjacent on the belt may share an industry. The belt repeats, so the last→first seam counts. Achieved with two relocations off the alphabetical base (`ed-invest` after `polomarket`, `mercator` after `riviera`); the remaining 29 entries keep their positions.

3. **Knockout logo counters restored** — `ink_from_plate()` in `scripts/client-logos/pipeline.py` repaints near-white pixels in the plate colour, but on a knockout mark the enclosed counters *are* the plate colour and survive `dematte()` opaque, so repainting the glyphs merges them into one shape. For `plate_ink` marks the plate must be keyed globally rather than only inward from the border. Re-emits `polomarket.png` and `mercator.png`.

4. **Case-study body text justified** — the rich-text prose and the approach-pillar bodies are set flush on both edges with automatic hyphenation. Hyphenation is not optional here: Polish has long words and the pillar body sits in a narrow column, so justification without it opens rivers of whitespace. The lead paragraph and headings stay ragged-right, where justification of large type reads as a defect.

5. **Closing CTA on case-study, service and industry pages** — the `Twój ruch` eyebrow is dropped, the primary button is renamed from `Bezpłatna konsultacja` to `Porozmawiajmy o Twoim biznesie` so it matches the header CTA, and the `Zobacz inne case studies` secondary button is removed from case-study pages (services and industries have no secondary button). Both locales.

6. **`/o-nas` team slider** — given name and surname swap places **and the colours travel with the words**: a small orange given name over a large cream surname, inverting today's small cream surname over large orange given name. `ANIA` becomes `ANNA`. A DIMAQ certificate chip is added for the two members who hold it (Anna Ozga, Magda Rokicka) and the now-redundant "Posiadaczka certyfikatu DIMAQ Professional." sentence comes out of their bios. All eleven bios covered by the client bio document are lengthened toward that document's fuller text, with Agnieszka Klajbert's first-person copy normalised to the third person the rest of the roster uses. Mirrored in `o-nas.en.ts`.

7. **Homepage certificate caption** — one short sentence under the two certificate cards saying what they cover, so the marks are not presented without explanation. Reuses `certsLabel`, which has been dead since the team grid was redesigned and currently renders nowhere.

8. **Join-CTA `⋯` menu simplified to a dropdown** — the modal sheet becomes a plain dropdown anchored to the `⋯` button: no `aria-modal`, no scrim, no Tab trap. Each option reveals its answer inline beneath itself instead of replacing the list, which removes the unmount-under-focus problem at its root rather than patching around it. Escape, outside-click dismissal, focus return to the trigger and the closing route to `/kontakt` are all kept — those are what the capability is for, and only the modal packaging is what broke. The three option texts are rewritten in a warmer, more human voice.

9. **Join-CTA heading kept clear of the post card** — the `NA X (TWITTERZE)?` token is shortened to `NA X (TWITTER)?` (user decision), matching the un-inflected form the English copy already uses (`ON X (TWITTER)?`). Measured against the running site, this removes X as the binding constraint entirely: the next-widest token, `NA INSTAGRAMIE?`, becomes the one that governs, and it needs the heading's display scale reduced by ~5.4% across 1024–1600px to clear the card's column with a gutter — half the ~10.7% reduction the unshortened token would have forced. The exact clamp is set from measurement, not by eye.

10. **Proof-card titles stop repeating the brand** — the case-study cards in service-page `proof` sections show a large full-colour client logo directly under the title, and two of the three titles open by naming that same brand again (`iRobot — …`, `Pracuj.pl — …`); the third weaves it into the sentence (`Budowa marek Volvo na …`). The brand name comes out of all three titles in both locales. **This requires an accessibility fix in the same edit:** the logo currently renders `alt=""`, so the whole card is one link whose accessible name is built from the visible text alone — verified on `/uslugi/influencer-marketing`, the link reads *"CASE STUDY Pracuj.pl — humor, twórcy i filtr AR na TikToku ZOBACZ CASE STUDY"*. Removing the brand from the title without giving the logo a real `alt` would strip the brand from that name entirely. The logo therefore takes the brand name as its `alt`, which is what it depicts.

Not in scope: the case-study image audit, which is its own change (`audit-case-study-imagery`) because it operates on Payload data rather than the repository and needs a per-image approval gate.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `site-nav`: the canonical social-link order requirement changes from Instagram-first to Facebook-first.
- `client-logos-marquee`: new requirement — belt order SHALL NOT place two brands of the same industry cyclically adjacent.
- `client-logo-assets`: the transparent-background requirement is clarified for knockout marks, where enclosed counters carry the plate colour rather than the ink colour and so are not protected by border-connected keying alone.
- `case-studies`: new requirements fixing what the closing CTA offers (and that its primary action shares the header CTA's wording), and that body prose is justified with hyphenation while the lead stays ragged-right.
- `onas-team`: the name treatment becomes normative (which slot carries the display size and which carries orange), members may carry certificate chips, the bio requirement gains a length expectation, and the roster naming is corrected to Anna Ozga on both surfaces.
- `join-cta-rotator`: the `⋯` menu stops being a modal dialog and becomes a dismissible dropdown, keeping Escape, focus return and the closing route to `/kontakt`; the pinned X token shortens from `NA X (TWITTERZE)?` to `NA X (TWITTER)?`; and a new requirement forbids any rotator token from overlapping the post card at any viewport.
- `services-pages`: new requirement fixing what a proof card shows — the brand is carried by the logo, not repeated in the title, and the card's accessible name still identifies it.

## Impact

**Code**
- `lib/content/home.ts` / `home.en.ts` — `socials` order; `certsLabel` repurposed as the certificate caption; `joinCta.post` menu copy rewritten and `menuTitle`/`menuClose` retired with the sheet.
- `app/(frontend)/(home)/sections/join-cta/index.tsx` + `join-cta.module.css` — sheet replaced by a dropdown; the focus-restoration effect and its `biome-ignore`, the Tab trap and the scrim all come out.
- `lib/content/clients.ts` — roster order, new `industry` field on `ClientBrand`; `lib/content/clients.test.ts` — new cyclic-adjacency test.
- `scripts/client-logos/pipeline.py` — `dematte()`/`ink_from_plate()` handling for `plate_ink` marks.
- `public/assets/clients/polomarket.png`, `public/assets/clients/mercator.png` — regenerated.
- `lib/content/case-studies.ts` / `.en.ts`, `lib/content/uslugi.ts` / `.en.ts`, `lib/content/branze.ts` / `.en.ts` — CTA copy.
- `lib/content/uslugi.ts` / `.en.ts` — `ProofCase` gains a `brand` field; the three proof titles drop the brand name in both locales.
- `app/(frontend)/uslugi/[slug]/service-page.tsx` — the proof card's logo takes `alt={item.brand}` instead of `alt=""`.
- `app/(frontend)/case-studies/[slug]/case-study-article.tsx` + `case-study.module.css` — drop the eyebrow and secondary action; justify `.prose` and `.pillarBody`.
- `lib/content/o-nas.ts` / `o-nas.en.ts` — name fields, bios, cert chips.
- `app/(frontend)/(home)/sections/why-that-works/index.tsx` — the `TEAM` array hardcodes `name: 'Ania Ozga'`; renamed to `Anna Ozga` so the homepage grid and the slider do not disagree about her name.
- `lib/content/home.ts` — the `joinCta.rotator` token `NA X (TWITTERZE)?` shortens to `NA X (TWITTER)?`, matching the un-inflected form `home.en.ts` already uses (`ON X (TWITTER)?`); the heading clamp in `join-cta.module.css` is reduced so `NA INSTAGRAMIE?`, now the widest token, clears the post card.
- `app/(frontend)/o-nas/sections/team/index.tsx` + `team.module.css` — name slot swap, colour swap, chip rendering.
- `app/(frontend)/(home)/sections/why-that-works/index.tsx` + module CSS — certificate caption.

**Shared surfaces** — `socials` and `CLIENT_ROSTER` are site-wide. Both contact pages (`/kontakt`, `/en/contact`) render the roster as a logo band and inherit the new order; `e2e/client-belt.e2e.ts` and `e2e/kontakt.e2e.ts` read `CLIENT_ROSTER` and must keep passing.

**Not affected** — no Payload schema, no migrations, no case-study data. The `mercator` belt logo is regenerated, but its case-study card logo (`-logo-mono.png`) is produced by a separate pass and is unchanged.
