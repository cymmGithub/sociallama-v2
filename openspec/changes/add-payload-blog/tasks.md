## 1. App restructure (isolated, no behavior change)

- [x] 1.1 Move root layout and all frontend routes under `app/(frontend)/` (root layout → `(frontend)/layout.tsx`, `(home)` nests inside; `sitemap.ts`, `robots.ts`, `manifest.ts`, icons stay at `app/`); fix imports
- [x] 1.2 Verify no behavior change: `bun run check` passes, homepage renders identically (screenshot-sample against dev server), commit as its own commit

## 2. Payload platform

- [x] 2.1 Provision infrastructure: Neon Postgres (Vercel Marketplace) and Vercel Blob; set `DATABASE_URL`, `PAYLOAD_SECRET`, `BLOB_READ_WRITE_TOKEN` locally and on Vercel
- [x] 2.2 Install Payload deps (`payload`, `@payloadcms/next`, `@payloadcms/db-postgres`, `@payloadcms/storage-vercel-blob`, `@payloadcms/richtext-lexical`, `@payloadcms/translations`); scaffold `app/(payload)/` route group and `payload.config.ts`; verify early that Payload's type generation coexists with the repo's TS7 + Biome setup (exclude generated files from Biome)
- [x] 2.3 Add Zod env validation for the new vars following the repo's integration env pattern (loud failure with setup instructions)
- [x] 2.4 Define collections: `users` (auth), `media` (Blob storage, alt text), `categories` (title, slug), `posts` (title, unique slug with reserved-slug validation from an exported constant, excerpt, cover, Lexical content, required category relation, publishedAt, SEO group; drafts+versions enabled; Polish labels)
- [x] 2.5 Configure Polish admin i18n; verify `/admin` loads in Polish and login gates it
- [x] 2.6 Seed script: four live-site categories (`marketing`, `reklama`, `seo`, `social-media`) + one seed post ("LinkedIn Premium — czy warto?" with existing cover/copy from `lib/content/home.ts`)
- [x] 2.7 Verify end-to-end in admin: create/edit/upload/publish a post; draft invisible publicly

## 3. Post page

- [x] 3.1 Add `app/(frontend)/[slug]/page.tsx`: Local API lookup by slug, `generateStaticParams` over published posts, `notFound()` for unknown/draft slugs; confirm static routes win over the segment
- [x] 3.2 Build the Lexical renderer with custom converters (uploads → `Image`, links → `Link`, headings/lists/quotes → template CSS module); graceful default for unmapped nodes
- [x] 3.3 Design and style the bespoke post template with brand tokens (category, `pl-PL` date, title, cover, body) — visual pass reviewed with mocks/screenshots before sign-off
- [x] 3.4 `generateMetadata`: title/description/OG with fallbacks (metaTitle→title, metaDescription→excerpt, ogImage→cover), canonical at root-level path
- [x] 3.5 Wire draft preview: Payload preview button → authenticated preview route → Next `draftMode()` rendering the draft in the real template; verify visitors still get 404

## 4. Blog hub and categories

- [x] 4.1 Build `/blog` hub: newest-first paginated card list (cover, category, date, title, excerpt, read link to `/{slug}`), design-system styling, intentional empty state
- [x] 4.2 Pagination at crawlable URLs; `/blog` canonical for page 1; out-of-range pages 404
- [x] 4.3 Category pages at `/category/{slug}` reusing hub cards + pagination; unknown category 404s; hub links to categories
- [x] 4.4 Extend `app/sitemap.ts` with published posts (lastModified), `/blog`, and category pages; drafts excluded

## 5. Revalidation and NewsLAMA

- [x] 5.1 Payload `afterChange`/`afterDelete` hooks on posts/categories revalidating post page, `/blog`, category pages, and homepage; verify publish → live within seconds, no redeploy
- [x] 5.2 Homepage fetches latest published post via Local API in the Server Component and passes typed props to `NewsLama`; keep `useReveal` client behavior; omit section when no posts; retire the hardcoded post object from `lib/content/home.ts` (labels stay)
- [x] 5.3 Verify homepage spec scenarios: latest-post card, no-posts omission, chapter layout intact

## 6. Sanity removal and final verification

- [x] 6.1 Remove `lib/integrations/sanity/`, `@sanity/*`/`next-sanity`/`@portabletext/react` deps, `sanity:*` scripts, Sanity env validation and registry entries
- [x] 6.2 Full verification: `bun run check` green, Playwright smoke over `/`, `/blog`, `/category/*`, seed post URL, `/admin`; seed post reachable at `/linkedin-premium-czy-warto` with correct metadata
