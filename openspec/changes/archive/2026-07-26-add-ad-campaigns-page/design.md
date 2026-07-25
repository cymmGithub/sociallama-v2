## Context

The services section is driven by a single canonical `SERVICES` list in `lib/content/uslugi.ts`. Adding a service is mostly a data edit: the `/uslugi` index grid, `generateStaticParams`, the sitemap, and hreflang alternates all derive from that list. The mega-menu does not — it hand-maintains its own copy in `home.ts`, because it also carries `/szkolenia`, which is not a service page.

The client's document for this page arrived alongside three others on 2026-07-25 and is the only one describing a page that does not exist. Its wireframe is unusually specific: two rows of three tiles, a partner section about SEOFly and Grupa Good One, partner case studies, and the standard closing CTA.

The complication is not structural. It is that the page as specified overlaps a page that already ships.

## Goals / Non-Goals

**Goals:**

- A seventh service page that reads as a distinct offer rather than a second sales page.
- A boundary against `/uslugi/sprzedaz` that a visitor can act on, not merely one that exists in our heads.
- Navigation, index, sitemap, and hreflang coverage equal to the other six.

**Non-Goals:**

- No partner case-study mechanism. `proof` continues to link only into our own collection.
- No new section kind if an existing one can be extended (D2).
- No footer change — that column lists industries.
- No renaming of `/uslugi/sprzedaz`, whose scope narrows only in copy, not in slug or position.

## Decisions

**D1 — Split by channel ownership, not by ad platform brand.** The client document places Google Ads, Meta Ads, and TikTok Ads under SEOFly. Shipping that puts two menu-adjacent pages selling Meta Ads, one of which already has six dashboard panels proving it. The line drawn instead: Social Lama owns social platforms, SEOFly owns search and the website. The ADS tile becomes Google Ads.

The two apparent secondary collisions dissolve without intervention. The document's CONTENT MARKETING tile is content *for pozycjonowanie* and its AUDYTY SEO tile analyses *strony internetowe* — both already distinct from `/uslugi/content` and `/uslugi/audyt-i-konsultacje` in the client's own wording. They need that qualifier kept, not added; the risk is losing it while compressing.

Rejected: shipping the document verbatim (two pages competing for one enquiry), and merging the two pages (they are delivered by different agencies and the group story is the point).

**D2 — Reuse `triptych` with numbering suppressed rather than adding a tile kind.** After `align-existing-services`, `triptych` renders an N-column grid, so six items already lay out as the client's two rows of three. The only mismatch is the `01 / 02 / 03` numbering, which implies sequence — correct for a process, wrong for a list of six parallel capabilities. An optional flag suppressing the number is a smaller change than a twelfth section kind that would differ only in that detail. Rejected: a dedicated `tiles` kind (duplicate layout, duplicate CSS) and keeping the numbering (states something false about the offer).

**D3 — The boundary lives in copy and links, because the menu cannot hold it.** `MenuItem` is `{ label, href, mobileHidden? }` — there is no description field, so the mega-menu can only ever show two labels side by side. Given "Kampanie reklamowe" next to "Sprzedaż", the labels alone will not let a visitor choose correctly. Three surfaces therefore carry the distinction: reciprocal cross-links on the two pages, contrasting `summary` lines on the `/uslugi` index (the one place the two are seen together with descriptions), and the tile copy itself. This is why those are treated as requirements rather than polish.

**D4 — Menu position: directly after Sprzedaż.** Adjacency is deliberate. Separating them means a visitor finds one and never learns the other exists; placing them together at least presents the choice, and the index grid — reached by the same column's "Wszystkie usługi" link — is where it becomes legible. It also keeps the menu consistent with `SERVICES` order, which drives the index grid.

**D5 — The metadata title carries what the label cannot.** Four of six tiles are search-side, and "Kampanie reklamowe" contains no term anyone searches for that offer with. The navigation label stays as decided; the title element names SEO and Google Ads so the page is findable for what it is mostly about.

## Risks / Trade-offs

- **The client's copy is being edited** → Raised with them as an explicit task before ship, not folded in silently. If they insist on the document as written, D1 reverses and the overlap becomes theirs to own — but that should be their decision made knowingly.
- **The label/scope mismatch persists regardless** → Mitigated by D3, which is why those three surfaces are specified rather than left to taste. If the cross-links are dropped later as clutter, the mismatch returns.
- **An eight-item desktop menu column is unverified** → Checked visually rather than assumed; the column is a simple list, so the expected outcome is that nothing happens.
- **A SEOFly logo has not been sourced** → Resolved during implementation: their horizontal SVG was reversed for dark ground (`#333333` wordmark → cream, brand green untouched), and the block ships as a full-bleed cover matching DIEA and Folks. SEOFly publish no official light-on-dark variant, so the reversed lockup needs their sign-off; the wordmark fallback remains the graceful path if they decline.
- **Running second in a shared worktree means rebasing on `align-existing-services`** → Accepted deliberately: both changes edit the same four files, and D2 depends on that change's N-column grid already existing.

## Migration Plan

Runs after `align-existing-services` in the same worktree. Order:

1. Content entry and routes, so the page exists and the derived surfaces (index, sitemap, hreflang) pick it up.
2. Sections, including the `triptych` numbering flag.
3. Navigation and the boundary surfaces — cross-links, index summaries — last, since they reference the finished page.

Rollback is one list entry plus one menu entry; nothing else holds a reference to the new service.

## Open Questions

- **Client approval of the ADS boundary.** The one item that could change the page's content rather than its presentation.
- **Cross-link wording**, which has to state the boundary without reading as an apology for it.
- **Whether `/uslugi/sprzedaz` should say anything about Google Ads at all**, or simply stay silent on search and let the cross-link carry it.
