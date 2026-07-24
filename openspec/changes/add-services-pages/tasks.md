## 1. Worktree, content model & routes

- [ ] 1.1 `bun run worktree:new sl-uslugi 3004 --change add-services-pages` from main (shared DB — no schema change) → verify the port serves
- [ ] 1.2 Create `lib/content/uslugi.ts` + `uslugi.en.ts`: canonical 6-service list (slugs per the D2 table) + typed `sections` discriminated union, `Localized`-typed → typecheck green
- [ ] 1.3 Route scaffolding: `app/(frontend)/uslugi/[slug]/` + `app/(frontend-en)/en/services/[slug]/`, `generateStaticParams`, unknown slug → notFound
- [ ] 1.4 Point footer OFERTA links at the live routes (PL + EN) → no `/` placeholders remain

## 2. Shared chrome & section primitives

- [ ] 2.1 Extract the multi-armed llama hero render from Figma as an optimized transparent PNG (shared by all six pages)
- [ ] 2.2 `Hero` primitive — shipped header, flat plum (no gradient), llama, title, intro
- [ ] 2.3 `Triptych` primitive — brand-native numbered cards + lucide icons (o-nas card language)
- [ ] 2.4 `PartnerBlock` primitive — partner logo/image/copy, parameterized for diea / folks / tymkor
- [ ] 2.5 `Proof` primitive — case-study cards reusing existing case-study assets
- [ ] 2.6 `Showreel` primitive — reuses the existing `Video` primitive; omits itself when no clips

## 3. Platform cubes & the CONTENT page

- [ ] 3.1 Generate YouTube, Instagram, and TikTok cubes matching the existing four (iterate against side-by-side comparison on the page background — not one-shot)
- [ ] 3.2 Optimize all seven cubes for web → verify none ships at the ~600 KB–1 MB source weight
- [ ] 3.3 `PlatformSection` primitive — cube, name, copy, alternating media side
- [ ] 3.4 Related-posts query (read-only Payload, wrapped in React `cache()`), auto-match by platform, omit block entirely on zero matches
- [ ] 3.5 Resolve D7: point the worktree at the prod DB read-only or seed posts locally so related posts can be verified visually
- [ ] 3.6 Assemble `/uslugi/content` → verify against `figma-content-*.jpeg` (allowing the D3 hero/footer/marquee deviations)

## 4. KREACJE & WIDEO page

- [ ] 4.1 Assemble hero + triptych + DIEA partner + showreel → verify against `figma-kreacje-*.jpeg`
- [ ] 4.2 Wire user-supplied showreel clips + DIEA showcase image; omit the showreel if they haven't landed

## 5. Extrapolated pages & index

- [ ] 5.1 Strategia — hero · triptych (Audyt→Strategia→Wdrożenie) · proof
- [ ] 5.2 Sprzedaż — hero · triptych · dashboards · proof (resolve O1: reuse homepage's six panels or produce variants)
- [ ] 5.3 Audyt i konsultacje — hero · triptych · proof
- [ ] 5.4 Influencer marketing — hero · triptych · partner(Folks) · proof
- [ ] 5.5 `/uslugi` index — hero + six service cards (resolve O3: simple grid vs added pitch)

## 6. Copy (PL + EN, batched review)

- [ ] 6.1 Draft CONTENT copy — intro + 7 platform blurbs → user review
- [ ] 6.2 Draft KREACJE & WIDEO + Strategia copy → user review
- [ ] 6.3 Draft Sprzedaż + Audyt + Influencer + index copy → user review
- [ ] 6.4 Translate all approved copy to EN (established EN locale voice) → `Localized` parity compiles
- [ ] 6.5 Resolve O2 (case-study → service mapping) during review

## 7. SEO & verification

- [ ] 7.1 `generateMetadata` per page both locales; hreflang alternates; add all 14 URLs to `app/sitemap.ts`
- [ ] 7.2 Biome + typecheck green (`--diagnostic-level=error` for the known panics)
- [ ] 7.3 Playwright sweep: all 14 routes 200, menu/footer/homepage-CTA navigation works, related-posts blocks omit correctly, mobile + desktop
- [ ] 7.4 Visual sign-off from the user on CONTENT, KREACJE, and one extrapolated page before ship
