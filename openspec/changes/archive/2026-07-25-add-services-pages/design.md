## Context

The `USŁUGI` section is entirely unbuilt while being linked from the overlay menu, the footer's NAWIGACJA and OFERTA columns, and every homepage services-tab CTA. Figma (`Social_Lama (Copy)`, page `Strona główna`) holds finished designs for two services — CONTENT (`2446:18`) and KREACJE & WIDEO (`2447:405`), both in frames misnamed `SOCIAL_LAMA_O NAS` from duplication. The other four services have no design. Renders reviewed with the user 2026-07-23 (`figma-content-*.jpeg`, `figma-kreacje-*.jpeg` at the repo root).

Existing material to build on: `home.ts` `services[]` already carries `body` + `bodyLong` for content/sprzedaz/kreacje (the `bodyLong` paragraphs read as if written for these very pages), plus produced stage media — 10 content panels, 6 sales dashboards, 2 video clips. Four platform cubes (`cube-facebook`, `cube-linkedin`, `cube-pinterest`, `cube-x`) have been in `public/assets/` unused since 9 July.

## Goals / Non-Goals

**Goals:**
- 7 routes × 2 locales live, statically generated, no dead links left in the USŁUGI section.
- A composition model that fits genuinely different page bodies without forcing a false template.
- Real per-service copy (PL + EN), user-reviewed.
- Related posts that degrade gracefully rather than showing empty slots.
- CI green: Biome, TypeScript, `Localized` parity.

**Non-Goals:**
- No Payload collection or schema change for services (static content, like `o-nas.ts`).
- No `/szkolenia` page — separate route outside `/uslugi`, its own future change.
- No redesign of the homepage services tabs (`services-autoplay-tabs` stays as-is).
- No new illustration commissions for the extrapolated pages (D4).

## Decisions

**D1 — Composition over template.** The two designed pages share only chrome; their bodies have nothing structurally in common (7 repeating platform blocks vs. triptych + partner + showreel). Forcing one parameterized template would fight the design. Instead each service entry declares an ordered `sections` array of discriminated-union descriptors, and the page renders them in order — the same pattern `home.ts` already uses for service `stage` kinds (`panels | video | placeholder`). Adding a section type later is additive.

```
services[slug].sections = [
  { kind: 'hero',      title, intro }
  { kind: 'platforms', items: [{ platform, cube, copy }] }
  { kind: 'triptych',  items: [{ icon, title, body }] }
  { kind: 'partner',   partner: 'diea' | 'folks' | 'tymkor', image, copy }
  { kind: 'showreel',  clips: [...] }
  { kind: 'proof',     caseStudies: [...] }
]
```

**D2 — Per-page section sequences.**

| Service | Sections |
|---|---|
| Content | hero · platforms(7) |
| Kreacje & Wideo | hero · triptych · partner(diea) · showreel |
| Strategia | hero · triptych(Audyt→Strategia→Wdrożenie) · proof |
| Sprzedaż | hero · triptych · platforms-as-dashboards *(reuse homepage's 6 panels)* · proof |
| Audyt i konsultacje | hero · triptych(co dostajesz) · proof |
| Influencer marketing | hero · triptych · partner(folks) · proof |
| `/uslugi` index | hero · 6 service cards |

**D3 — Hero deviates from Figma, per user decision.** Figma's hero uses a plum→dark gradient and the old multi-link header. The shipped homepage treatment wins: existing minimal header (logo · CTA · Menu), flat brand plum `#913155`, no gradient. The multi-armed llama render is shared by all six pages — only the title changes — and is extracted once from Figma as a transparent PNG. Figma's footer and marquee are likewise stale; the shipped components are used.

**D4 — Extrapolated triptychs use brand-native cards, not new illustrations.** Matching Figma's line-art style across four more services would mean sourcing 12 illustrations in a consistent style — real cost and style-matching risk, for pages that have no design to be faithful to anyway. Instead the extrapolated triptychs use the numbered-card language already established on `/o-nas` (values grid, project cards) with lucide icons — repo rule is lucide-only, never raw glyph characters. CONTENT and KREACJE keep their designed artwork.

**D5 — Related posts: auto-match, hide when empty.** The blog taxonomy is topical (`SEO`, `Marketing`, `Reklama`, `Social media`); platform relevance appears only in post titles. A platform section queries posts matching its platform name, takes up to three, and **omits the whole block when there are zero matches** — so Pinterest/X don't render an empty "PRZECZYTAJ RÓWNIEŻ" heading. Rejected: hand-curated slugs (needs ~21 suitable posts, manual upkeep), and a platform field on posts (schema change + migration + isolated DB, which the user wanted to avoid). The query is read-only and wrapped in React `cache()` per the established Payload use-cache rule.

**D6 — Cubes: generate 3, optimize 7.** YouTube, Instagram, and TikTok cubes are generated to match the existing four (3D levitating cube, platform-branded, transparent, with floating UI accessories). TikTok was absent from the Figma design but is a core platform for the agency — the Pracuj.pl case study is TikTok-led — so the set is seven, not six. All seven are optimized; at 600 KB–1 MB each the current four would put ~5 MB of PNG on one page.

**D7 — Blog data lives in prod.** The ~70 imported posts are in the prod database; the local dev DB has one seeded post. Related-posts blocks therefore look empty in a normal worktree. For visual verification, point the worktree at `DATABASE_URL_PROD` read-only or seed posts locally — decided during apply, but flagged so the section isn't wrongly judged broken.

## Risks / Trade-offs

- **[Scale]** 14 routes, 7 section primitives, 3 generated assets, and full PL+EN copy is a large change. → Tasks are phased so the two designed pages ship first and the extrapolated four follow; each phase is independently verifiable.
- **[Cube style-matching]** The existing four came from a Firefly/Gemini pipeline whose exact prompts aren't recorded — new cubes may not match. → Use the existing PNGs as visual references, generate and compare side-by-side on the page background before accepting; treat as an iterate-until-matched loop, not one-shot.
- **[Extrapolated pages read as filler]** Four pages with no design could feel thin next to the two designed ones. → Each gets genuinely service-specific copy and a proof section tied to real case studies; if a service can't fill a page credibly, say so rather than padding.
- **[Showreel dependency]** Kreacje's showreel and DIEA image are user-supplied. → Build the slots; if assets don't land, the showreel section is omitted (same graceful-omission mechanic as related posts) rather than shipping an empty orange band.
- **[Placeholder copy in Figma]** Both designs repeat the same two paragraphs everywhere — there is effectively no real copy in the design. → All copy is written fresh and user-reviewed; nothing is lifted from the mock.

## Open Questions

- **O1 — Sprzedaż dashboards**: reuse the homepage's six dashboard panels verbatim, or produce page-specific variants?
- **O2 — Proof sections**: which case studies map to which service (Volvo→Kreacje/Content? Pracuj.pl→Content/Influencer? iRobot→Content/Sprzedaż?) — confirm during copy review.
- **O3 — `/uslugi` index depth**: simple six-card grid, or does it also carry the "why Social Lama" pitch? Leaning simple.
