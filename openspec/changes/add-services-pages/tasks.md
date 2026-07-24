## 1. Worktree, content model & routes

- [x] 1.1 `bun run worktree:new sl-uslugi 3004 --change add-services-pages` from main (shared DB — no schema change) → verify the port serves
- [x] 1.2 Create `lib/content/uslugi.ts` + `uslugi.en.ts`: canonical 6-service list (slugs per the D2 table) + typed `sections` discriminated union, `Localized`-typed → typecheck green
- [x] 1.3 Route scaffolding: `app/(frontend)/uslugi/[slug]/` + `app/(frontend-en)/en/services/[slug]/` (+ index in both), `generateStaticParams`, unknown slug → notFound
- [x] 1.4 Verify USŁUGI/SERVICES nav resolves (PL + EN) → menu + footer + homepage CTAs all hit live routes; no `/` or `#` placeholders remain (OFERTA column is `industryNav`, not services)

## 2. Shared chrome & section primitives

- [ ] 2.1 Extract the multi-armed llama hero render from Figma as an optimized transparent PNG (shared by all six pages)
- [ ] 2.2 `Hero` primitive — shipped header, flat plum (no gradient), llama, title, intro
- [x] 2.3 `Triptych` primitive — brand-native numbered cards + lucide icons (o-nas card language)
- [x] 2.4 `PartnerBlock` primitive — partner name/copy/CTA, parameterized for diea / folks / tymkor; image omitted until user-supplied
- [x] 2.5 `Proof` primitive — case-study cards reusing existing case-study assets/logos
- [x] 2.6 `Showreel` primitive — reuses the existing `Video` primitive; omits itself when no clips

## 3. Platform cubes & the CONTENT page

- [x] 3.1 Generate YouTube, Instagram, and TikTok cubes matching the existing four (openai_hazel with the Facebook cube as style reference → recolor + glyph/accessory swap; verified cohesive on plum + cream contact sheets)
- [x] 3.2 Optimize all seven cubes for web (sharp: trim + 720px + palette) → 85–114 KB each, down from 596 KB–1 MB
- [x] 3.3 `PlatformSection` primitive — cube, name, copy, alternating media side (copy-only fallback until the 3 cubes land)
- [x] 3.4 Related-posts query (read-only Payload `getPostsForPlatform`, wrapped in React `cache()`), auto-match by title, omit block entirely on zero matches; X skipped (single-letter match too noisy); PL-only (blog is PL-only)
- [x] 3.5 Resolve D7: verified read-only against `DATABASE_URL_PROD` (79 posts) — FB/IG/TikTok 3 each, LinkedIn/Pinterest/YT 1 each all RENDER, X OMITS; no dev-server repoint (avoids the restart schema-clobber risk)
- [ ] 3.6 Assemble `/uslugi/content` → verify against `figma-content-*.jpeg` (allowing the D3 hero/footer/marquee deviations)

## 4. KREACJE & WIDEO page

- [x] 4.1 Assemble Kreacje — hero · triptych · DIEA cover. Deviates from the figma showreel-grid per user direction: the DIEA reel is folded into the partner block as a full-bleed cinematic cover (DIEA gold identity from diea.pl).
- [x] 4.2 Wire the DIEA 2025 showreel (user-supplied): optimized to 720p/480p + poster (29 MB → 12.3/5.0 MB, bt709-tagged), presented as the full-bleed partner cover. Folks partner stays copy-only (graceful) until its imagery lands.

## 5. Extrapolated pages & index

- [x] 5.1 Strategia — hero · triptych (Audyt→Strategia→Wdrożenie) · proof
- [x] 5.2 Sprzedaż — hero · triptych · dashboards · proof (O1 resolved: reuse homepage's six panels, as `platforms` items with `dashboard` media)
- [x] 5.3 Audyt i konsultacje — hero · triptych · proof
- [x] 5.4 Influencer marketing — hero · triptych · partner(Folks) · proof
- [x] 5.5 `/uslugi` index — hero + six service cards (O3 resolved: simple grid)

## 6. Copy (PL + EN, batched review)

- [ ] 6.1 Draft CONTENT copy — intro + 7 platform blurbs → user review
- [ ] 6.2 Draft KREACJE & WIDEO + Strategia copy → user review
- [ ] 6.3 Draft Sprzedaż + Audyt + Influencer + index copy → user review
- [ ] 6.4 Translate all approved copy to EN (established EN locale voice) → `Localized` parity compiles
- [ ] 6.5 Resolve O2 (case-study → service mapping) during review

## 7. SEO & verification

- [x] 7.1 `generateMetadata` per page both locales; hreflang alternates (verified pl/en/x-default on `/uslugi/kreacje-wideo` ↔ `/en/services/creative-video`); all 14 URLs in `app/sitemap.ts`
- [x] 7.2 Biome (`--diagnostic-level=error`) + `tsc --noEmit` green
- [ ] 7.3 Playwright sweep: all 14 routes 200, menu/footer/homepage-CTA navigation works, related-posts blocks omit correctly, mobile + desktop
- [ ] 7.4 Visual sign-off from the user on CONTENT, KREACJE, and one extrapolated page before ship
