## 0. Preconditions

- [ ] 0.1 Confirm `polish-homepage` + `good-one-orbit` have merged and their worktrees/tabs are closed (shared dev DB no longer contended) before starting
- [ ] 0.2 Create the `sl-case-studies` worktree off updated `main` (bun install, copy `.env.local`, PORT 3003)

## 1. Collection + schema

- [ ] 1.1 Add `lib/payload/collections/case-studies.ts` mirroring `posts` (title, slug, client{name,logo}, tags[], period, excerpt, cover, challenge richText, approach richText, results[]{platform,metric,value}, gallery[], seo group, publishedAt, draft/published)
- [ ] 1.2 Register the collection in `payload.config.ts`; generate the Payload migration
- [ ] 1.3 Add case-study queries to `lib/payload/queries.ts` (list, by-slug, for-sitemap — `_status` constrained), wrapped in React `cache()`

## 2. Content extraction (from PDFs)

- [ ] 2.1 Extract text per study via `pdftotext` (client intro, Wyzwanie, approach, PODSUMOWANIE LICZBOWE metrics per platform, period)
- [ ] 2.2 Render selected deck slides via `pdftoppm` → optimized web images (cover + gallery); write descriptive alt text
- [ ] 2.3 Seed the three studies (iRobot, Pracuj.pl, Volvo) as published records

## 3. Listing page

- [ ] 3.1 Build `app/(frontend)/case-studies/page.tsx` + card, blog-style, published only; add `/case-studies` to `lib/static-routes.ts`

## 4. Detail page

- [ ] 4.1 Build `app/(frontend)/case-studies/[slug]/page.tsx` + template: hero (h1, client+logo, tags, period), Wyzwanie, Podejście, Wyniki (per-platform metric tiles), Galeria (alt text), CTA; 404 on unknown slug

## 5. SEO

- [ ] 5.1 `generateMetadata` per study (title, description, canonical `/case-studies/<slug>`, OG)
- [ ] 5.2 Emit JSON-LD `Article` (client as `about`) + `BreadcrumbList` on the detail page
- [ ] 5.3 Extend `app/sitemap.ts` with the listing + published case studies (drafts excluded)
- [ ] 5.4 Run `/seo-audit` on a detail page + the listing; fix findings

## 6. Deferred follow-up (after polish-homepage merges)

- [ ] 6.1 In `lib/content/home.ts`, map clients with a study to their slug; CTA links through when a study exists, keeps the tooltip otherwise

## 7. Verify + ship

- [ ] 7.1 Playwright: listing renders cards; each detail page renders all sections; unknown slug 404s; drafts hidden
- [ ] 7.2 Confirm JSON-LD validates and canonical/sitemap are correct
- [ ] 7.3 Biome + TypeScript clean; run migration `--prod` at merge
