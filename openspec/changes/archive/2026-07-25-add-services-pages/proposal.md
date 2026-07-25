## Why

`USŁUGI` is the agency's core commercial section, and none of it exists. All six service links in the mega-menu, all six in the footer OFERTA column, the `/uslugi` index the footer NAWIGACJA links to, and the "DOWIEDZ SIĘ WIĘCEJ" CTAs on the homepage services tabs all resolve to the themed 404 page. Figma now has finished designs for two of the six (CONTENT and KREACJE & WIDEO), the homepage already carries long-form copy for three services, and four platform-cube assets have been sitting unused in `public/assets/` since 9 July — produced for exactly this page. This change grounds the whole section.

## What Changes

- **Seven new routes per locale** (14 total): `/uslugi` index + six service pages (`strategia`, `content`, `sprzedaz`, `kreacje-wideo`, `audyt-i-konsultacje`, `influencer-marketing`), mirrored at `/en/services/*` using the slugs already in the EN menu. Static content, no CMS collection.
- **A section-primitive library rather than one template.** The two designed pages share only chrome (hero, marquee, footer) and compose different bodies, so each service page declares its own section sequence from shared primitives: `Hero`, `PlatformSection`, `Triptych`, `PartnerBlock`, `Showreel`, `Proof`.
- **CONTENT page** (designed): hero + seven platform sections (Facebook, Instagram, TikTok, X, LinkedIn, Pinterest, YouTube), each a levitating cube, platform copy, and a related-posts block.
- **KREACJE & WIDEO page** (designed): hero + triptych (Obsługa graficzna / Realizacje wideo / Animacje) + DIEA partner block + video showreel.
- **Four extrapolated pages** built from the same primitives: Strategia, Sprzedaż (reusing the six homepage dashboard panels), Audyt i konsultacje, Influencer marketing (Folks partner block). Their triptychs use brand-native numbered cards with lucide icons — no new illustration sourcing.
- **`PartnerBlock` generalizes the DIEA section** to the Good One siblings: Diea → Kreacje, Folks → Influencer marketing, TymKor media → Sprzedaż. Reinforces the "część grupy Good One" story already on `/o-nas`.
- **Three new platform cubes** — YouTube, Instagram, TikTok — generated to match the four existing ones; all seven optimized for web (current four are 600 KB–1 MB each).
- **Related posts auto-match with graceful omission**: a platform section shows up to three blog posts matching that platform and hides the block entirely when there are none (the blog taxonomy is topical — `SEO / Marketing / Reklama / Social media` — with platform relevance only in titles).
- **Figma deviations, per user decision**: hero follows the homepage treatment (existing minimal header, flat plum, no gradient); Figma's footer and marquee are stale, so the shipped components are used.
- **Copy drafted by the assistant, reviewed by the user**, PL + EN.

## Capabilities

### New Capabilities
- `services-pages`: The `/uslugi` index and six service pages — canonical service list, the section-primitive composition model, per-page section sequences, related-posts behavior, locale parity, and SEO surface.

### Modified Capabilities
- `site-i18n`: The "Localized SEO surface" requirement extends to the new service routes (hreflang pairs + sitemap coverage for `/uslugi/*` ↔ `/en/services/*`).

## Impact

- **Content**: new `lib/content/uslugi.ts` + `uslugi.en.ts` (canonical service list + per-page section data, `Localized`-typed); `home.ts`/`home.en.ts` footer OFERTA links go live.
- **Routes/components**: `app/(frontend)/uslugi/` (index + `[slug]`) and `app/(frontend-en)/en/services/`; new section primitives under the services route group; reuses the existing `Video` primitive for the showreel.
- **Data**: read-only Payload query for related posts (no schema change, no new collection). Note the ~70 real posts live in the **prod** database — local dev sees only the seeded post, so visual verification needs the prod DB or a local seed.
- **Assets**: 3 cubes to generate + 7 to optimize; hero llama extracted from Figma (shared by all six pages); DIEA showcase image and 3 showreel clips supplied by the user.
- **Specs**: new `services-pages`, delta to `site-i18n`.
- **Ops**: worktree via `bun run worktree:new sl-uslugi <port> --change add-services-pages` (shared DB — no schema change).
