## 1. Worktree & canonical list

- [x] 1.1 `bun run worktree:new sl-branze 3002 --change add-branze-pages` from main (shared DB — no schema change) → verify :3002 serves
- [x] 1.2 Create `lib/content/branze.ts` + `branze.en.ts`: canonical 12-industry list (D1 order/labels/slugs) + per-industry page-content shape, `Localized`-typed → typecheck green
- [x] 1.3 Rewire `home.ts`/`home.en.ts` menu BRANŻE and footer OFERTA to derive from the canonical module (labels, order, live hrefs) → menu + footer verified against D1 table in both locales (Playwright)

## 2. Page template — two variants

- [x] 2.1 Route scaffolding: `app/(frontend)/branze/[slug]/page.tsx` + `app/(frontend-en)/en/industries/[slug]/page.tsx`, `generateStaticParams` from the canonical list, unknown slug → notFound
- [x] 2.2 Shared sections: CTA band, marquee, stat chips, logo strip (house reveal/animation patterns, lucide icons only)
- [x] 2.3 Editorial variant (mock B): outline-wordmark hero + duotone collage + manifesto — verify against `branze-mock-b.jpeg` (collage awaits O1 imagery; logos await O2)
- [x] 2.4 Proof variant (mock C): hero band + creatives wall + numbers + quote/case-study card — verify against `branze-mock-c.jpeg`
- [x] 2.5 Variant switch on `caseStudy` presence → Automotive/Elektronika render proof, others editorial

## 3. Copy (PL + EN, batched review)

- [ ] 3.1 Draft batch 1 (Automotive, Elektronika i AGD, Beauty, Health) — proof stats verbatim from case studies → user review
- [ ] 3.2 Draft batch 2 (Finanse, Petcare, Alkohole, Fashion) → user review
- [ ] 3.3 Draft batch 3 (Horeca, Hotele, Nieruchomości, Rozrywka) → user review
- [ ] 3.4 Resolve O2 (client-logo attributions) and O3 (proof-page quote wording) with the user during batch reviews

## 4. Imagery (editorial pages)

- [x] 4.1 Resolve O1 with the user (recommended: free-license stock + duotone) before sourcing → confirmed: free-license stock + duotone (2026-07-23)
- [x] 4.2 Curate 2–3 images per editorial industry, record source/license, optimize to `/public/branze/<slug>/` → user approves picks (3 photos × 10 industries sourced from Pexels free-license, IDs recorded in-code; awaiting final user sign-off)
- [x] 4.3 Verify duotone treatment renders on-brand across all editorial heroes (screenshot sampling)

## 5. SEO surface

- [x] 5.1 `generateMetadata` per page, both locales (title/description/OG)
- [x] 5.2 Hreflang alternates per canonical slug mapping, `x-default` → PL
- [x] 5.3 Add all 24 URLs to `app/sitemap.ts` → verify sitemap output

## 6. Verification & ship

- [x] 6.1 Biome + typecheck green (`--diagnostic-level=error` for the known panics)
- [x] 6.2 Playwright sweep: all 24 routes 200, menu/footer navigation works, both variants render correctly, mobile + desktop
- [ ] 6.3 Visual sign-off from the user on one proof page and two editorial pages before ship
