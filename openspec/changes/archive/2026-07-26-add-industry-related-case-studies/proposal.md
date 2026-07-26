## Why

`import-case-study-decks` just landed 45 new case studies, but the 12 industry pages still link to only two of them: Automotive → Volvo and Elektronika i AGD → iRobot. Every other industry page is a dead end for a visitor who wants proof, and the studies get no internal links from the topical pages that should feed them — a direct miss for the segment's SEO goal.

The obvious move — adding a `caseStudy` block to the other industries — is wrong. That block is not a link; its presence **switches the entire page layout** (`ProofLayout` vs `EditorialLayout`). All ten unwired industries carry `manifesto` + `marquee` + `collage` content that *only* the editorial layout renders, so wiring them that way would silently delete that content from ten live pages. The block is also single-valued (one study per industry) and requires a real, attributed client `quote` — and we hold real testimonials for only four clients, of which just one (Aquael) has a case study.

## What Changes

- **New additive content field** `relatedCaseStudies?: readonly IndustryRelatedStudy[]` on `Industry`, holding `{ slug, title }` entries. Additive only — it does not participate in variant selection.
- **Rendered in both layouts** as a compact card row ("powiązane case studies"), so proof pages and editorial pages both gain the links. Existing Volvo/iRobot proof treatment is untouched; their new field carries only *additional* studies beyond the one already featured.
- **No client quote required**, so the row can ship now rather than waiting on testimonial collection.
- **Supports N studies per industry**, which the single-valued `caseStudy` block cannot.
- **Mapping applied to 10 of 12 industries.** Finanse and Fashion stay unwired — no case study honestly fits either (notably, `vistula` is the *Vistula university*, not the menswear brand).
- **PL/EN parity**: the field is populated in both `lib/content/branze.ts` and `lib/content/branze.en.ts`, enforced by the existing `LocalizedBranze` contract; links resolve through the existing `caseStudyBase` prop so `/en/...` routes stay correct.
- **No change to** the `caseStudy` block, variant selection, routes, or the case-studies collection.

## Scope revision (2026-07-25, mid-implementation)

The additive row shipped, then the split it left behind — two proof pages and eight
editorial ones — read as arbitrary. Rather than keep that, the layouts converged:
**every industry with a matching study now features its strongest one as a proof
page** (ten of twelve). Two changes made that safe:

- **Blocks render from data, not from variant.** `collage`, `marquee` and
  `manifesto` now render on proof pages too, so promotion never drops editorial
  copy — the objection that motivated the additive approach in the first place.
- **`caseStudy.quote` became optional.** Only Aquael has a collected testimonial;
  a proof page without one shows creatives, numbers and the case card rather than
  an invented quote.

`numbers` (case-study metrics) was split from `chips` (manifesto value words),
which previously shared one field and would have collided on a converged page.
Finanse and Fashion stay editorial — still no honest match.

## Capabilities

### New Capabilities
<!-- none — no new capability -->

### Modified Capabilities
- `branze-pages`: gains a requirement that an industry page renders links to its related case studies in **both** layout variants, without affecting which variant is selected.

## Impact

- **Content**: `lib/content/branze.ts` + `lib/content/branze.en.ts` — new field on 10 industry entries (titles authored per locale).
- **Component**: `app/(frontend)/branze/[slug]/industry-page.tsx` — one new section component, invoked from both `ProofLayout` and `EditorialLayout`; plus chrome strings for the row heading/CTA in both locales.
- **Styles**: `industry-page.module.css` (or the module in use) — card-row styles.
- **No schema, route, migration, or SEO-surface change.** No new assets: cards reuse the committed `public/case-studies/<slug>/<slug>-logo.png` files, all of which exist for the mapped studies.

## Gates & Non-Goals

- **Publish dependency (blocking real value, not implementation):** the 45 imported studies are currently **drafts** on prod. A related-study card pointing at an unpublished slug resolves to a not-found page. The row is correct to build now, but the links only work once those studies are published (gated on the client-permission check from `import-case-study-decks`).
- **Non-goal:** promoting any industry to the Proof layout, collecting client testimonials, adding a `retail/handel` industry (four studies — `polomarket`, `riviera`, `galeria-rondo-wiatraczna`, `vobis` — suggest one is missing, tracked separately), and mapping the 14 studies that fit no current industry.
