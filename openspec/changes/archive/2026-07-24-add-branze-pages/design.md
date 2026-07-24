## Context

The overlay menu and footer list 12 industries whose routes have never existed (accepted interim 404s, noted in `home.ts`). Mocks for the page design were built and reviewed 2026-07-23 (`branze-mock-{a,b,c}.jpeg`); the user chose a **conditional hybrid**: proof-wall layout (mock C) where a real case study fits the industry, editorial duotone layout (mock B) otherwise. Ordering (proof-first) and naming (bare nouns) were decided in the same session. No CMS involvement — static typed content like `o-nas.ts`. The existing `site-nav` spec's BRANŻE list predates the current menu and has drifted; this change re-baselines it.

## Goals / Non-Goals

**Goals:**
- 12 live industry pages × 2 locales, statically generated, variant chosen by data.
- Menu + footer reordered/renamed consistently in both locales; footer links go live.
- Every page has real, industry-specific copy (drafted → user-reviewed) and a working SEO surface (metadata, hreflang, sitemap).
- CI green: Biome, TypeScript, `Localized` parity types.

**Non-Goals:**
- No CMS/Payload collection for industries (explicit user decision).
- No `/uslugi/*` pages (separate future change, but this template should inform them).
- No llama-mascot hero variant (mock A dropped from scope by the user's hybrid rule).
- No new case studies — proof pages reuse existing Volvo/iRobot material.

## Decisions

**D1 — Canonical list (order, labels, slugs).** Single source of truth for both locales; same order everywhere (menu, footer, sitemap):

| # | PL label | PL slug | EN label | EN slug | Variant | Proof |
|---|---|---|---|---|---|---|
| 1 | Automotive | `automotive` | Automotive | `automotive` | **proof** | Volvo case study |
| 2 | Elektronika i AGD | `elektronika-i-agd` | Electronics & Appliances | `electronics` | **proof** | iRobot case study |
| 3 | Beauty | `beauty` | Beauty | `beauty` | editorial | Kontigo (logo) |
| 4 | Health | `health` | Health | `health` | editorial | Aflofarm, Medicover Sport (logos) |
| 5 | Finanse | `finanse` | Finance | `finance` | editorial | Worldline, Intrum (logos) |
| 6 | Petcare | `petcare` | Pet Industry | `pet` | editorial | Aquael (logo) |
| 7 | Alkohole | `alkohole` | Alcohol | `alcohol` | editorial | — |
| 8 | Fashion | `fashion` | Fashion | `fashion` | editorial | — |
| 9 | Horeca | `horeca` | Horeca | `horeca` | editorial | — |
| 10 | Hotele i Miejsca Wypoczynkowe | `hotele-i-miejsca-wypoczynkowe` | Hotels & Resorts | `hospitality` | editorial | — |
| 11 | Nieruchomości i Deweloperzy | `nieruchomosci-i-deweloperzy` | Real Estate & Developers | `real-estate` | editorial | — |
| 12 | Rozrywka | `rozrywka` | Entertainment | `entertainment` | editorial | — |

Rule: 1–6 are proof-first (case studies, then client-logo strength); 7–12 alphabetical (PL). Rows 1–2 render the proof variant; logo-only proof stays editorial (a proof wall needs real creatives, which exist only for Volvo/iRobot). PL slug changes (`automotiv`→`automotive`, `branza-zoologiczna`→`petcare`, `branza-rozrywkowa`→`rozrywka`) need no redirects — the old routes never resolved. Client-logo attributions for editorial pages (rows 3–6) are provisional pending user confirmation during copy review.

**D2 — One route, one content map, variant by data.** `app/(frontend)/branze/[slug]/page.tsx` + EN twin, `generateStaticParams` over the canonical list. Each industry entry in `lib/content/branze.ts` optionally carries a `caseStudy` block (slug, stats, quote, creative paths); its presence selects the proof layout, absence selects editorial. Alternative (12 static route folders) rejected: 24 near-identical files. A future case study upgrades a page by adding data, no layout work.

**D3 — Content architecture mirrors `o-nas.ts`.** `branze.ts` / `branze.en.ts` export the canonical list + per-industry page content, typed with `Localized` so PL/EN shapes are compile-locked. Menu and footer read their industry items from this module (one list, three surfaces) instead of duplicating labels in `home.ts` — eliminates the current menu/footer duplication drift risk. `home.en.ts` likewise.

**D4 — Editorial imagery: licensed stock, unified by duotone.** ~10 editorial pages need 2–3 photos each. The plum/orange duotone treatment (CSS multiply, per the mock) is the equalizer that makes heterogeneous stock read on-brand. Sourcing preference: free-license stock (Pexels/Unsplash) curated per industry, user approves the picks alongside copy review. Alternatives: client-provided (none exist for 10 industries), AI-generated (cost + uncanny risk for realistic industry scenes). Open question O1 confirms this with the user.

**D5 — Copy: assistant drafts, user reviews in batches.** PL first (brand voice), EN translated per the established EN locale voice. Review in 3 batches of 4 industries to avoid a 24-page review wall. Each page's copy is industry-specific (hero claim, manifesto, marquee keywords, 3 stat/value chips) — not a find-and-replace template, both for credibility and to avoid thin-content/near-duplicate SEO risk.

**D6 — SEO surface extends existing patterns.** Per-page `generateMetadata` (title "Social media dla branży X | Social Lama" pattern, PL + EN), hreflang alternates both directions with `x-default` → PL, sitemap entries for all 24 URLs. Follows the site-i18n localized-SEO requirement mechanics already in place for case studies.

## Risks / Trade-offs

- **[Near-duplicate editorial pages]** 10 pages sharing one layout can read as templated filler to users and to search engines. → Copy is genuinely per-industry (D5); marquee keywords, stats, and imagery differ per page; if an industry's copy can't stand alone, flag it to the user rather than pad it.
- **[Stock imagery licensing/quality]** Free stock varies in quality and license terms. → Duotone treatment hides most quality variance; record source/license per image in the content module comment; user approves picks (O1).
- **[Proof pages overpromising]** Volvo/iRobot numbers must match the published case studies exactly. → Pull stats verbatim from the case-study content, no re-derivation.
- **[Menu regression]** Reordering/renaming touches the most-used navigation surface. → Overlay menu + footer verified by Playwright in both locales against the D1 table.
- **[Spec drift re-baseline]** The site-nav spec's BRANŻE list was already stale; this delta replaces it wholesale. → The delta copies the full requirement block and rewrites only the BRANŻE line, per MODIFIED workflow.

## Open Questions

- **O1 — Imagery sourcing sign-off**: licensed free stock + duotone (recommended) vs user-provided vs AI-generated, per D4. Needed before editorial pages fill their collages (blocking only for the visual layer, not copy/structure).
- **O2 — Client-logo attribution on editorial pages**: confirm which client logos may appear industry-labeled (rows 3–6 of D1) — provisional mapping inferred from the client roster, not yet user-confirmed.
- **O3 — Proof-page quote copy**: mock C used a paraphrase as the pull-quote; confirm whether to quote the case study verbatim or commission a client testimonial.
