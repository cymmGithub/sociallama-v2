# expand-uslugi-client-copy — tasks

## 1. Renderer: multi-paragraph partner copy

- [x] 1.1 Widen `partner.copy` to `string | readonly string[]` in `lib/content/uslugi.ts`'s section types; confirm the `Localized` parity mapping still compiles.
- [x] 1.2 In `service-page.tsx`, render array copy as one paragraph element per entry in **both** partner branches (cinematic cover and copy+image); a plain string renders as today. Add paragraph spacing in `service.module.css` if the stacked `<p>`s need it.

## 2. Kampanie reklamowe (PL + EN)

- [x] 2.1 Expand the SEOFly partner `copy` to a multi-paragraph array in our editing voice, carrying the document's argument structure: who does what (Social Lama = strategia/content/social, SEOFly = search/performance) → why the group model pays off for the client → closing "Jeden partner. Wiele kompetencji. BETTER WORKS." Mirror in `uslugi.en.ts`.
- [x] 2.2 Append a `banner` cross-link after the partner cover, mirroring Sprzedaż's existing banner in the opposite direction: Meta/TikTok campaigns live on `/uslugi/sprzedaz` (D2). Mirror in EN (`/en/services/sales`).

## 3. Influencer marketing (PL + EN)

- [x] 3.1 Expand the Folks partner `copy` to a multi-paragraph array, same structure as 2.1, our voice. Mirror in `uslugi.en.ts`.
- [x] 3.2 Remove the invented `tagline: 'from creators to results'` from the Folks block (PL + EN); verify the cover renders cleanly without a tagline (SEOFly's already does).

## 4. Audyt i konsultacje (PL + EN)

- [x] 4.1 Rework the hero intro to open with the client's "świeże spojrzenie" framing (title stays "Audyt i konsultacje"). Mirror in EN.
- [x] 4.2 Checklist: heading becomes "Zobacz swoją markę z nowej perspektywy"; fold the former "Co obejmuje usługa?" into the intro as the lead-in to the ticked list (D5). Mirror in EN.
- [x] 4.3 Append a SEOFly `partner` cover after `proof` (D3), reusing `/clips/seofly-cover.mp4`, `-mobile.mp4`, and `-poster.jpg` verbatim, with the light SEOFly logo. Copy per D4: ~2 paragraphs — social-profile audits are Social Lama's, website/SEO audits are SEOFly's, group framing, closing group line. Mirror in EN.

## 6. Division of responsibilities (design D7, added in review)

- [x] 6.1 Add `PartnerSplit` to the section types and `split?` to the `partner` descriptor; render it in the brief panel as two labelled lists hinged on the lockup's `×`.
- [x] 6.2 Replace the "who does what" paragraph with a `split` on SEOFly (kampanie), Folks, and SEOFly (audyt); rewrite the Audyt lead so it hooks rather than repeats the split. Mirror all three in `uslugi.en.ts`.
- [x] 6.3 Partner accent moves onto the brief panel too; Social Lama's side stays cream; the closing group line takes the display face and the brand orange.

## 5. Verification

- [x] 5.1 `bun run check` passes — the parity gate proves both locales carry every change.
- [x] 5.2 Playwright screenshots of all three PL pages plus their EN twins at mobile (~390px) and desktop widths, Chromium **and** WebKit: multi-paragraph copy legible over the scrimmed covers (AA contrast), no layout breakage, Audyt cover sits after proof.
- [x] 5.3 Confirm DIEA's cover on `/uslugi/kreacje-wideo` is pixel-unchanged (single-string path untouched).
- [x] 5.4 e2e suite (`bun run test:e2e`) green from the worktree.
