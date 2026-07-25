## Why

The Good One group's SEO and performance offer, delivered with the sibling agency SEOFly, has no page on the site. The client supplied copy and a wireframe for it on 2026-07-25. It is the only one of the four delivered documents that describes a page which does not exist — the other three reshape pages that shipped with `add-services-pages`.

It also completes a story the site already tells in two other places: `/o-nas` explains the Grupa Good One structure, and the Influencer marketing page presents Folks as a sibling agency. SEOFly is the third, and currently the only one without a surface.

## What Changes

- **A seventh service page**: `/uslugi/kampanie-reklamowe` ↔ `/en/services/ad-campaigns`. Because the canonical `SERVICES` list drives the `/uslugi` index grid, `generateStaticParams`, the sitemap, and hreflang alternates, all of those follow from one list entry.
- **Six capability tiles** — SEO, ADS, Content marketing, Audyty SEO, Strony WWW, Analityka i raportowanie — each with a short blurb, per the client's two-rows-of-three wireframe.
- **A SEOFly partner block** reusing the existing `partner` primitive, carrying the Grupa Good One framing and the group line "Jeden partner. Wiele kompetencji. BETTER WORKS.", as on the Folks block.
- **A channel-ownership boundary, and this is a deliberate deviation from the client document.** The document lists Google Ads, Meta Ads, and TikTok Ads under SEOFly's ADS tile. But `/uslugi/sprzedaz` already sells Meta Ads and TikTok with six dashboard panels as proof, so shipping the document as written puts two menu-adjacent pages in competition for the same enquiry. This change draws the line by channel: **SEOFly owns search and the website; Social Lama keeps paid social.** The ADS tile becomes Google Ads. **This must be raised with the client** — it edits their copy, and should not be discovered later as an unexplained change.
- **The seam is made navigational rather than silent**: a cross-link on each of the two pages, so a visitor who lands on the wrong one is routed instead of bouncing.
- **Both `/uslugi` index summaries are sharpened to contrast.** Sprzedaż's current summary never says *social*. Since the mega-menu is label-only and structurally cannot disambiguate two adjacent services, the index grid is the only surface where the two can be compared — so its summaries have to do that work.
- **The page title carries the SEO terms the label drops.** "Kampanie reklamowe" contains no searchable SEO term, yet four of the six tiles are search-side. The metadata title names SEO and Google Ads even though the navigation label does not.
- **Navigation**: the mega-menu USŁUGI column gains one entry directly after Sprzedaż, marked `mobileHidden` — desktop grows seven to eight, mobile is unchanged, since that column already shows a curated three plus a "Wszystkie usługi" link. Mirrored in the English menu. **No footer change** — the footer OFERTA column lists industries, not services.
- **Partner case studies are omitted.** The document asks for SEOFly case studies; none were supplied, and `proof` links only into our own collection. Left out rather than stubbed.

## Capabilities

### New Capabilities

None. This extends the existing services section rather than introducing a capability.

### Modified Capabilities

- `services-pages`: the canonical service list grows from six to seven, with the routes, index, and SEO surface that follow; the tile grid adds an unnumbered variant of an existing section kind; two service pages gain cross-links defining their boundary.
- `site-i18n`: the localized SEO surface requirement names the six service pages explicitly and must account for the seventh.

## Impact

- **Content**: `lib/content/uslugi.ts` + `uslugi.en.ts` — one new service entry with its sections, plus a sharpened `summary` on Sprzedaż. `lib/content/home.ts` + `home.en.ts` — one menu entry each; also clears a now-false comment there claiming Strategia, Audyt, and Influencer "don't exist yet — accepted interim 404s".
- **Components**: `app/(frontend)/uslugi/[slug]/service-page.tsx` — an unnumbered tile variant; `service.module.css` for its grid.
- **Assets**: a SEOFly logo for the partner block. The `partner` primitive's `logo` is optional and falls back to a wordmark, so the page ships without it.
- **Derived automatically**: `/uslugi` index card, `generateStaticParams`, sitemap entries, hreflang alternates — all read the canonical list.
- **Specs**: deltas to `services-pages` and `site-i18n`.
- **Ops**: runs **after** `align-existing-services` in the same worktree. Both edit `uslugi.ts`, `uslugi.en.ts`, `service-page.tsx`, and `service.module.css`; parallel worktrees would conflict on the core of each.

## Risks / Trade-offs

- **The label promises more than the page delivers.** "Kampanie reklamowe" reads as *all* advertising while Meta and TikTok live on Sprzedaż. The label is the user's decision; the mitigation is that the cross-links, the index summaries, and the tile copy carry the distinction instead. This makes those three items load-bearing rather than decorative.
- **Deviating from the client's copy carries approval risk** → surfaced explicitly rather than absorbed, as a task before ship.
- **An eight-item desktop menu column is untested** → low risk, but worth a look rather than an assumption.
