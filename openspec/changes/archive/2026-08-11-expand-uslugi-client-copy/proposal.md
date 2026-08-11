# expand-uslugi-client-copy

## Why

The client's copy documents for three service pages (delivered 2026-07-25) were compressed to the SZKIELET wireframe during the initial build. A verification pass against the source documents (2026-08-11) found the compression cut the strongest part of the client's copy — the multi-paragraph Grupa Good One collaboration pitch in both partner blocks (reduced 3–4 paragraphs → 1) — and dropped the client's headline voice on the Audyt page. Separately, the ad-campaigns page never shipped its half of the reciprocal cross-link the spec already requires. The user reviewed the deltas and decided which cuts to restore.

## What Changes

- **Partner copy restored to full structure** on `/uslugi/kampanie-reklamowe` (SEOFly) and `/uslugi/influencer-marketing` (Folks): multi-paragraph copy carrying the documents' argument structure — who does what, why the group model benefits the client, closing group line — edited in our voice, not imported verbatim.
- **`partner.copy` widens to `string | readonly string[]`**; the renderer emits one paragraph element per entry instead of a single `<p>`.
- **Invented Folks tagline removed**: `from creators to results` is not a tagline Folks publishes (the SEOFly block's comments already name it a mistake).
- **Ad-campaigns cross-link added**: the page gains its missing link to `/uslugi/sprzedaz` for Meta/TikTok advertising, satisfying the existing "Reciprocal cross-links" scenario. The ADS tile itself stays Google-only (design D1 holds).
- **Audyt headline voice restored**: the checklist section takes the client's heading "Zobacz swoją markę z nowej perspektywy"; the hero picks up the "świeże spojrzenie" framing.
- **Audyt gains a SEOFly partner cover** reusing the existing `/clips/seofly-cover*` assets, with *complementary* copy: Social Lama audits social media profiles, SEOFly audits websites/SEO — not a duplicate of the ad-campaigns block.
- **EN locale twins** for every change above (`uslugi.en.ts`, enforced by the parity gate).

Out of scope (deliberate): a second Audyt CTA after the checklist; the document's requested graphics (llama detective, stats visual, team carousel with specialist picker); Folks/SEOFly case-study showcases (no client assets exist); Meta/TikTok Ads on the ADS tile (pending client sign-off, unchanged).

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `services-pages`: the Audyt composition gains a partner cover (its "no partner" composition scenario changes); partner covers now render multi-paragraph copy; partner covers must not show taglines the partner does not publish; the Audyt page joins the partner-lockup page list; the ad-campaigns page's reciprocal cross-link becomes real.

## Impact

- `lib/content/uslugi.ts` — copy and section-list changes on three services; `partner.copy` type.
- `lib/content/uslugi.en.ts` — EN twins (parity gate fails the build without them).
- `app/(frontend)/uslugi/[slug]/service-page.tsx` — partner copy rendering (both the cinematic cover branch and the copy+image branch render `data.copy`).
- `app/(frontend)/uslugi/[slug]/service.module.css` — paragraph spacing in partner blocks if needed.
- No schema, DB, route, or asset changes; `/clips/seofly-cover*` files are reused as-is.
