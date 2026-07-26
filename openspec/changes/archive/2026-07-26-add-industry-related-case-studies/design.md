# Design — add-industry-related-case-studies

## Context

Industry pages render one of two variants, selected purely by the presence of a `caseStudy` block:

```ts
IndustryPage = industry.caseStudy ? <ProofLayout/> : <EditorialLayout/>
```

`ProofLayout` renders the creatives wall, numbers band, attributed quote and case-study card. `EditorialLayout` renders `collage`, `marquee` and `manifesto`. The two sets of content fields are disjoint in practice: the ten non-proof industries all carry `manifesto` + `marquee` + `collage`, none of which `ProofLayout` reads.

`IndustryCaseStudy` requires `slug`, `cardKicker`, `cardTitle`, `creatives[]` and `quote { text, attribution }`, with an explicit comment that the quote "must be something the client actually said."

### Verified facts (probed 2026-07-25)
- Exactly 2 of 12 industries have a `caseStudy` block: `automotive` (volvo), `elektronika-i-agd` (irobot).
- The other 10 all have `manifesto`, `marquee` **and** `collage`.
- `<slug>-logo.png` exists under `public/case-studies/` for every mapped study.
- All 45 imported studies are `_status: draft` on prod; only irobot/pracuj-pl/volvo are published.
- `industry-page.tsx` already receives `caseStudyBase` (`/case-studies` or `/en/case-studies`), so locale-correct links need no new plumbing.

## Goals / Non-Goals

**Goals:** give every mapped industry outbound links to its relevant case studies, in whichever layout it already uses; support multiple studies per industry; require no client quote; preserve all existing editorial content and both existing proof pages byte-for-byte.

**Non-Goals:** changing variant selection, promoting industries to Proof, sourcing testimonials, adding industries, or touching the case-studies collection/routes.

## Decisions

### D1 — A new additive field, not a reuse of `caseStudy`. **(recommended)**
Add `relatedCaseStudies?: readonly IndustryRelatedStudy[]` to `Industry`. It is deliberately *not* consulted by the variant switch, so adding it to an editorial industry keeps that page editorial.
*Alternative rejected:* populating `caseStudy` on the other ten industries — it flips them to Proof, silently dropping their `manifesto`/`marquee`/`collage`, caps them at one study, and demands a quote we don't have.
*Alternative rejected:* making `quote` optional and promoting all ten to Proof — same content loss, plus it changes two shipped pages' contract for no gain.

### D2 — Minimal entry shape: `{ slug, title }`.
`slug` drives the link (`${caseStudyBase}/${slug}`) and the logo path (`/case-studies/<slug>/<slug>-logo.png`, a locale-independent public asset — the same convention the existing case card uses). `title` is short locale-authored prose. No `creatives`, no `quote`, no stats: this is a navigational row, not a second proof block.

### D3 — Rendered by one component, called from both layouts.
A single `RelatedCaseStudies` section component invoked near the end of both `ProofLayout` and `EditorialLayout` (before the CTA band). Renders nothing when the field is absent or empty, so the ten-vs-two split needs no conditional at the call site beyond the component's own guard.

### D4 — Volvo/iRobot carry only *additional* studies.
Their featured study already appears in the proof card; repeating it in the row would be redundant. `automotive` gets `motointegrator`, `ozgasl`, `a1-karting`; `elektronika-i-agd` gets `vobis`, `asus`, `breville`, `kohersen`, `stadler-form`, `laurastar`, `foodsaver`.

### D5 — Titles are authored per locale; slugs are not localized.
`branze.ts` holds Polish titles, `branze.en.ts` English ones, enforced by the existing `LocalizedBranze` parity type. Slugs are shared because `case-studies.slug` is not a localized field. Note the imported studies have no EN translation yet (`add-case-study-en-translations` is queued), so an EN visitor following a link lands on Polish-fallback content — pre-existing, accepted behaviour, not introduced here.

### D6 — Ship the row even though the targets are drafts.
The links are correct and will resolve the moment the studies are published; building now avoids a second pass. The publish gate is external (client permission) and tracked in `import-case-study-decks`.

## Risks / Trade-offs

- **Links 404 until the studies are published** → the single highest-impact caveat. Mitigation: publish is one command per the other change; verification tasks below explicitly check a published slug (e.g. `volvo` on `automotive`) so the row itself is provably correct independent of draft status.
- **Row could read as a second-class proof block on Proof pages** → mitigated by keeping it visually compact and clearly separate from the featured case card (D2/D3).
- **Mapping is editorial judgement** → the user reviewed and approved the mapping, including the two deliberate gaps and the `vistula` / `belvedere` brand-identity traps.
- **EN titles drift from PL** → the `LocalizedBranze` `satisfies` contract fails the build on a missing or mis-shaped entry, which catches omissions though not translation quality.

## Migration Plan

No migration. Purely additive content + one component. Rollback = delete the field from the two content modules (the component's guard then renders nothing) or revert the commit.

## Open Questions

- Should the row also appear on `finanse` / `fashion` once a fitting study exists, or do those pages want a bespoke treatment? Deferred — both stay unwired for now.
- Is a `retail/handel` industry warranted for `polomarket`, `riviera`, `galeria-rondo-wiatraczna`, `vobis`? Out of scope here; worth a separate proposal.
