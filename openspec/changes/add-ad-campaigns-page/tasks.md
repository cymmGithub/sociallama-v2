## 1. Client approval (start early — it can change the page's content)

- [ ] 1.1 Raise the ADS boundary with the client: their document places Google Ads, Meta Ads and TikTok Ads under SEOFly, while `/uslugi/sprzedaz` already sells Meta Ads and TikTok with dashboard proof. Present the channel split (D1) and get a decision → if they reject it, D1 reverses and the tile copy changes

## 2. Service entry & routes

- [x] 2.1 Rebase the shared worktree on a merged `align-existing-services` → the N-column `triptych` grid this change depends on (D2) is present
- [x] 2.2 Add the seventh entry to `SERVICES` in `lib/content/uslugi.ts`: `kampanie-reklamowe` / `ad-campaigns`, label "Kampanie reklamowe", positioned after `sprzedaz`
- [x] 2.3 Mirror in `uslugi.en.ts` → `Localized` parity compiles, `tsc --noEmit` green
- [x] 2.4 Verify the derived surfaces pick it up without further edits: `/uslugi` index card, `generateStaticParams`, sitemap (16 URLs), hreflang pair on `/uslugi/kampanie-reklamowe` ↔ `/en/services/ad-campaigns`

## 3. Page sections

- [x] 3.1 Extend `triptych` with an optional flag suppressing the ordinal number (D2) → existing numbered triptychs on other services render unchanged
- [x] 3.2 Six capability tiles — SEO, ADS, Content marketing, Audyty SEO, Strony WWW, Analityka i raportowanie — compressed from the client doc, keeping the qualifiers that distinguish them from `/uslugi/content` and `/uslugi/audyt-i-konsultacje` ("pod pozycjonowanie", "stron internetowych")
- [x] 3.3 ADS tile written to the approved boundary from 1.1 → does not present Meta or TikTok advertising as this page's offer
- [x] 3.4 SEOFly partner block reusing the `partner` primitive, with the Grupa Good One framing and the "Jeden partner. Wiele kompetencji. BETTER WORKS." line → shipped as a full-bleed cover (like DIEA/Folks) with a reversed SEOFly lockup, not the wordmark fallback: their horizontal SVG has its `#333333` wordmark recoloured to cream, brand green untouched. **Confirm the reversed lockup with SEOFly — they publish no light-on-dark variant.**
- [x] 3.5 Metadata: title naming SEO and Google Ads (D5), plus description → the page is findable for the terms its label omits
- [x] 3.6 Translate the page to EN → parity compiles

## 4. The boundary surfaces (D3 — load-bearing, not polish)

- [x] 4.1 Cross-link on `/uslugi/kampanie-reklamowe` pointing at `/uslugi/sprzedaz` for paid social
- [x] 4.2 Reciprocal cross-link on `/uslugi/sprzedaz` → agree the wording so it states the split without reading as an apology (open question)
- [x] 4.3 Sharpen both `summary` lines so the `/uslugi` index distinguishes them — Sprzedaż names social platforms, Kampanie reklamowe names search. Both locales.

## 5. Navigation

- [x] 5.1 Add the menu entry to the USŁUGI column in `home.ts` directly after Sprzedaż, `mobileHidden: true` → desktop 7 → 8 entries, mobile unchanged
- [x] 5.2 Mirror in `home.en.ts`
- [x] 5.3 Remove the now-false comment in `home.ts` claiming Strategia, Audyt and Influencer "don't exist yet — accepted interim 404s"
- [x] 5.4 Confirm no footer change is needed → the OFERTA column is `industryNav`, industries not services

## 6. Verification

- [x] 6.1 Biome (`--diagnostic-level=error`) + `tsc --noEmit` green
- [x] 6.2 Playwright: all 16 services routes return 200 in both locales; the new page renders six unnumbered tiles and the partner block; cross-links resolve both ways
- [x] 6.3 Visual check of the eight-item desktop menu column, and of the mobile column being unchanged
- [x] 6.4 Confirm the other six service pages render unchanged after the `triptych` flag lands
- [x] 6.5 Visual sign-off from the user before merge

## 7. Strategia ZAKRES backdrop (added mid-implementation, user request)

- [x] 7.1 Extend `checklist` with an optional decorative `backdrop` loop → the sand band is replaced by the video under a flat scrim, copy inverts to cream, ticks go solid orange
- [x] 7.2 Source and encode the clip (Pexels 6558324), both locales wired, delta amended under "Optional sections degrade rather than render empty"
- [x] 7.3 Verify legibility of the full copy block over the loop at desktop and mobile, and that the section still reads with the video blocked
