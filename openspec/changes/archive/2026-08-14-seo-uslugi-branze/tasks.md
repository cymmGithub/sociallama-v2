# Tasks: seo-uslugi-branze

## 1. Content model & shared price

- [x] 1.1 Extract the starting-price figure from the homepage FAQ answer into a shared content constant and interpolate it back into the FAQ answer (PL + EN), asserting the rendered answer is unchanged
- [x] 1.2 Add a `seoLandings` export to `lib/content/uslugi.ts` and `uslugi.en.ts` (slug `prowadzenie-social-media` / `social-media-management`, `id` = PL slug, `pairSlug` wiring) reusing existing section-primitive types
- [x] 1.3 Draft landing copy PL + EN (scope section, pricing section using the shared constant, page FAQ covering "ile kosztuje…" and "co obejmuje…") and mark it for content-team approval

## 2. Landing page

- [x] 2.1 Resolve the landing in the `[slug]` routes of both locales (roster ∪ landings) with `generateStaticParams`, `pairMetadata` (title leading with "Prowadzenie social media"), and hreflang pair
- [x] 2.2 Render the landing body from its section descriptors; H1 begins with "Prowadzenie social media"
- [x] 2.3 Emit FAQPage JSON-LD via `FaqJsonLd` from the same FAQ array the page renders
- [x] 2.4 Add both landing URLs to the sitemap
- [x] 2.5 Verify the mega-menu, homepage services section, hero rotator, and morph transition still enumerate exactly seven services (no landing leak)

## 3. Internal links

- [x] 3.1 List the landing on the `/uslugi` and `/en/services` index pages
- [x] 3.2 Link the landing from the homepage FAQ pricing answer in both locales

## 4. Metadata sharpening

- [x] 4.1 `audyt-i-konsultacje`: PL title begins with "Audyt social media"; description updated; EN twin kept in parity
- [x] 4.2 `kampanie-reklamowe`: PL title leads with "Kampanie reklamowe w social media"; SEO and Google Ads still named in title or description
- [x] 4.3 `influencer-marketing`: PL title contains "Agencja influencer marketingu"
- [x] 4.4 `branze/hotele-i-miejsca-wypoczynkowe`: PL title leads with "Marketing hotelu" ("social media dla hoteli" in title or description) + intent lead paragraph (flag copy for approval)
- [x] 4.5 `branze/nieruchomosci-i-deweloperzy`: PL title leads with "Marketing nieruchomości" + intent lead paragraph (flag copy for approval)

## 5. Redirects

- [x] 5.1 Retarget the six `/oferta/<platform>` entries in `lib/wp-redirects.ts` to `/uslugi/prowadzenie-social-media`; leave bare `/oferta` unchanged
- [x] 5.2 Verify each retargeted redirect returns 301 whose target resolves 200 (parity-gate style check or e2e)

## 6. Verification

- [x] 6.1 Extend/adjust `locale-parity` and `orphan-coverage` tests to cover the landing without relaxing the seven-service roster assertions
- [x] 6.2 `bun run test`, Biome, typecheck, `next build` all green
- [x] 6.3 Manually verify rendered titles/H1s of the landing, 3 service pages, 2 industry pages, and both FAQ JSON-LD payloads (home + landing)

## 7. Landing poster (added 2026-08-14, after the copy sign-off)

- [x] 7.1 Draw the `prowadzenie-social-media` line-art poster (motif A "Kalendarz", user-approved from the 2026-08-14 mock) in both card and hero compositions, reusing the existing `dashTravel` + `ping` loops
- [x] 7.2 Register the id in `POSTER_IDS` / `ARTWORKS` so the hub card, the hero ground and the `usluga-<id>` morph all light up in both locales
- [x] 7.3 Make the landing the hub's closing feature card (grid 1 + 3 + 3 + 1) and drop the now-unused text-card `feature` support
- [x] 7.4 Extend the `services-hub` and `uslugi-morph-transition` deltas to cover eight cards
