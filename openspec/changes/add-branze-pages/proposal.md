## Why

All 12 "Branże" links in the mega-menu (and the footer OFERTA column) point at routes that don't exist — every industry click lands on the 404 page. These are the site's highest-intent SEO landing pages ("social media dla branży X") and the first subpage template of its kind, which will also set the pattern for the future `/uslugi/*` pages. Additionally the current list has inconsistent labels (only two carry the "Branża" prefix), a typo ("Automotiv"), and an ordering that puts the polarizing alcohol industry first in both locales.

## What Changes

- **Reorder + rename the industry list** (menu + footer, PL and EN, same order in both locales) per the proof-first rule: case-study/client-backed industries lead (Automotive, Elektronika i AGD, Beauty, Health, Finanse, Petcare), the rest follow alphabetically — alcohol lands naturally mid-pack. Labels unify to bare nouns: `Branża Zoologiczna` → **Petcare**, `Branża Rozrywkowa` → **Rozrywka**, `Automotiv` → **Automotive**, `Developerzy` → **Deweloperzy**. PL slugs follow the new labels (`/branze/automotive`, `/branze/petcare`, `/branze/rozrywka`); safe — the routes never existed, nothing to redirect. EN labels/slugs are already clean and stay.
- **Create all 12 industry pages** in both locales (`/branze/<slug>` + `/en/industries/<slug>`), static content, no CMS. Two page variants under one template system (user decision, from mocks):
  - **Proof variant** (mock C) when a real case study fits the industry — hero band → wall of real feed creatives → numbers band → quote + case-study card → CTA. Today: **Automotive (Volvo)** and **Elektronika i AGD (iRobot)**.
  - **Editorial variant** (mock B) for the other 10 — outline-wordmark hero with duotone photo collage → keyword marquee → manifesto + stat chips → client logos (where available) → CTA.
  - The variant is data-driven (an industry with a `caseStudy` reference renders proof; otherwise editorial), so a future case study upgrades its page automatically.
- **Footer OFERTA column** links swap from `/` placeholders to the real routes, same order/labels as the menu.
- **Per-industry copy drafted by the assistant, reviewed by the user** (PL + EN), per the established EN locale voice.
- **SEO surface**: per-page metadata in both locales, hreflang pairs, sitemap entries — extending the existing localized-SEO pattern.

## Capabilities

### New Capabilities
- `branze-pages`: The 12 industry landing pages — canonical list/order/labels/slugs, the two-variant template rule (proof vs editorial), per-variant section anatomy, locale parity, and SEO surface.

### Modified Capabilities
- `site-nav`: The "Menu overlay" requirement's BRANŻE column changes — new canonical 12-item list, proof-first order, unified bare-noun labels, updated slugs.
- `site-i18n`: The "Localized SEO surface" requirement extends to the new industry pages (hreflang pairs + sitemap coverage for `/branze/*` ↔ `/en/industries/*`).

## Impact

- **Content**: `lib/content/home.ts` + `home.en.ts` (menu + footer lists); new `lib/content/branze.ts` + `branze.en.ts` (per-industry page data, typed with the `Localized` parity pattern).
- **Routes/components**: new `app/(frontend)/branze/[slug]/` and `app/(frontend-en)/en/industries/[slug]/` with `generateStaticParams` over the 12 slugs; shared section components for the two variants.
- **Assets**: proof pages reuse existing `/public/case-studies/{volvo,irobot}/` creatives; editorial pages need 2–3 duotone-treated photos per industry (~10 industries) — sourcing decided in design (open question).
- **SEO**: `app/sitemap.ts` + hreflang alternates; new high-intent landing pages in both locales.
- **Specs**: `site-nav` delta (menu list), `site-i18n` delta (SEO surface scope).
- **Ops**: feature worktree via `bun run worktree:new sl-branze <port> --change add-branze-pages` (shared DB — no schema change).
