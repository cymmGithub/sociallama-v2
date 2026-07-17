## Context

v2 is a Satus-based Next 16.2.10 / React 19.2 app with a single homepage; all copy lives in `lib/content/home.ts`. The NewsLAMA section renders one hardcoded post card linking to a dead URL. The live production site is WordPress with 79 root-level post URLs indexed since 2017. The starter ships an unused Sanity integration; the user chose Payload 3 instead (self-hosted, client-owned data). Payload 3.85 peer-depends on Next `>=16.2.6 <17` — compatible. Content migration itself is a separate change (`migrate-wp-content`); this change must leave the platform ready for it (collections shaped to receive WP content, URL scheme already parity-correct).

## Goals / Non-Goals

**Goals:**
- Payload 3 admin (`/admin`, Polish UI) editing posts/categories/media, backed by Neon Postgres + Vercel Blob
- Root-level `/{slug}` post pages with a single bespoke, design-system-native template
- `/blog` paginated hub + `/category/{slug}` pages matching live-site URL shapes
- NewsLAMA renders the latest published post automatically
- Editors can draft, preview, and publish without a deploy; published changes appear without a rebuild

**Non-Goals:**
- WP content import, media re-hosting, `/tag/*` redirects, launch-day parity checks (all in `migrate-wp-content`)
- Content localization (site is Polish-only; only the admin UI is localized)
- Tag taxonomy pages, search, comments, RSS, related-posts logic
- Sanity feature replacement (visual editing, live preview overlays) — plain drafts + preview URL suffice

## Decisions

**D1 — Payload mounted in-app via route groups.** Standard Payload 3 install: current `app/layout.tsx` (html/body, fonts, providers) moves to `app/(frontend)/layout.tsx`; existing `(home)` group nests under it; Payload's generated `(payload)` group owns `/admin` and its API routes. Root-level metadata files (`sitemap.ts`, `robots.ts`, `manifest.ts`, icons) stay at `app/`. Alternative — separate Payload deployment — rejected: loses the Local API (zero-HTTP data access from Server Components) and doubles hosting.

**D2 — `@payloadcms/db-postgres` with a Neon connection string,** not `@payloadcms/db-vercel-postgres`. The plain postgres adapter is product-agnostic (works with Neon today, any Postgres later); the vercel-postgres adapter targets a discontinued product line. Push-mode dev migrations locally; committed migrations for production.

**D3 — Root catch-all route `app/(frontend)/[slug]/page.tsx` for posts** (user decision, 2026-07-17: URL parity over `/blog/{slug}`). Next static routes (`/blog`, `/category/*`, future pages) always win over the dynamic segment, so collisions resolve safely at the router level; additionally the posts collection validates slugs against a reserved list (`blog`, `category`, `admin`, `api`, plus existing homepage anchors) so an editor can't create a post that shadows — or is shadowed by — an app route.

**D4 — ISR + on-demand revalidation, not per-request rendering.** Post pages and `/blog` use `generateStaticParams`/static rendering with `revalidateTag`-based invalidation triggered from Payload `afterChange`/`afterDelete` hooks. Editors see published changes within seconds without rebuilds; visitors get static-speed pages. Drafts: Payload versions+drafts on posts, previewed via Next `draftMode()` and a preview route wired to Payload's admin preview button.

**D5 — Lexical rich text rendered through `@payloadcms/richtext-lexical/react` `RichText` with custom converters** mapping node types to the design system: uploads → `components/ui/image`, links → `components/ui/link` (internal/external aware), headings/lists/quotes → post-template CSS-module styles. One renderer, one template, all posts. The "eye-pleasant" visual design of the template is its own styling pass within this change, executed with the existing brand tokens (plum/cream chapters, display type, grain-gradient accents).

**D6 — Posts collection shaped for the WP import.** Fields: `title`, `slug` (required, unique, validated), `excerpt`, `cover` (media relation), `content` (Lexical), `category` (relation, required), `publishedAt`, SEO group (`metaTitle`, `metaDescription`, `ogImage` fallback to cover). Drafts enabled. Categories seeded via Payload seed script with the live site's four (`marketing`, `reklama`, `seo`, `social-media`) so `migrate-wp-content` can map WP category IDs directly.

**D7 — NewsLAMA becomes a server-fetched section.** The `(home)` page (Server Component) queries Payload Local API for the newest published post and passes typed props into the existing client `NewsLama` component (which keeps `useReveal`). The `news` export in `lib/content/home.ts` shrinks to static labels (heading, read-label); the hardcoded post object is removed. If no published post exists, the section renders nothing (rather than a broken card).

**D8 — Sanity removal is complete, not partial.** Delete `lib/integrations/sanity/`, drop all `@sanity/*`/`next-sanity`/`@portabletext/react` deps and `sanity:*` scripts, remove Sanity from env validation and the integration registry. Leaving it would mean two CMS scaffolds and a misleading integration registry.

## Risks / Trade-offs

- [Payload's generated `(payload)` files and `bun run check` (Biome + strict tsc on `typescript7`) may conflict — generated code isn't house-style] → Exclude `app/(payload)/` and `payload-types.ts` from Biome; verify Payload runs against the repo's TS7 pre-release early (first task), fall back to a pinned TS override for Payload's type generation if needed.
- [Root layout move touches every existing route/import] → Mechanical move, verified by `bun run check` + Playwright smoke; do it as an isolated commit before Payload lands.
- [Root catch-all makes every unknown path hit the posts lookup] → `generateStaticParams` + `dynamicParams` with a cheap indexed slug query and proper `notFound()`; 404s stay fast.
- [Neon/Blob not yet provisioned; local dev needs a database] → Local dev uses a Docker/local Postgres or Neon dev branch via `DATABASE_URL`; integration follows the repo's `isConfigured()` env-validation pattern so a missing DB fails loudly with instructions, not cryptically.
- [Slug uniqueness across posts vs. future static pages is only enforced by the reserved list] → Keep the list in one exported constant next to the collection; extend when new top-level routes are added (documented in AGENTS.md conventions).
- [ISR + `revalidateTag` interacts with Next 16 Cache Components semantics] → Keep the blog routes on classic ISR (no `use cache` experiments) in this change.

## Migration Plan

1. Land the `app/(frontend)` restructure alone (no behavior change) → verify homepage identical.
2. Add Payload + collections + admin, pointing at Neon; seed categories + the one seed post.
3. Build post template, `/blog` hub, category pages, sitemap extension.
4. Switch NewsLAMA to Local API; retire the hardcoded post export.
5. Remove Sanity last (keeps the tree green throughout).
Rollback: each step is an independent commit; reverting the Payload commits restores the static site (content lives in Neon, unaffected by rollback).

## Open Questions

- None blocking. Post-template art direction happens within D5's styling pass and will be reviewed visually (per the user's mock-based workflow) before being called done.
