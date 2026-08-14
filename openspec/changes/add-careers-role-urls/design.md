# Design — add-careers-role-urls

## Context

Open positions are static content: `careersRoles` in `lib/content/zostan-lama.ts:50-113` (EN twin in `.en.ts`), shape `{ id, title, blocks[] }`, currently 2 roles. The `id` is already the form-submission contract — stable, slug-shaped, and repeated verbatim across locales (module-header contract at `zostan-lama.ts:10-12`), with the accepted enum derived from it in `careers-schema.ts`. The renderer is ARIA tabs (`careers-roles.tsx`, `useState(0)`, all panels server-rendered but `hidden`). The EN page (`app/(frontend-en)/en/become-a-lama/page.tsx`) reuses the PL components with EN content props. There is no dynamic segment under either careers route. OG images are static site-wide; per-page metadata for static pairs goes through `pairMetadata` + `alternatesForPath` (`lib/utils/metadata.ts:229-247`). The blog's `post-share.tsx` already implements LinkedIn/Facebook intents + clipboard copy with a 2s "copied" state.

## Goals / Non-Goals

**Goals:**
- A shareable, crawlable URL per open position in both locales, unfurling with that position's title/description.
- The careers page experience unchanged for direct `/zostan-lama` visitors — tabs stay client-side tabs.
- A share button per position that hands recruiters the right absolute URL (copy + LinkedIn/FB intents).
- Full i18n/SEO compliance: hreflang pairs, locale toggle resolution, sitemap entries, no moved Polish URLs.

**Non-Goals:**
- No standalone position-detail template — 3 bullet blocks per role is too thin to carry its own page design.
- No CMS migration for positions; they stay static content (2 roles; revisit if the list grows).
- No dynamic OG images (site has none; the static brand OG image is inherited — only title/description vary).
- No URL syncing while the visitor clicks tabs on `/zostan-lama` (see D2).

## Decisions

**D1 — A position URL renders the existing careers page with that tab active ("SPA look, real URLs").**
`app/(frontend)/zostan-lama/[role]/page.tsx` (and the EN twin) reuse the exact page composition, passing `initialRoleId` down to `CareersRoles` (initial `useState` index) and to the form's role select. `generateStaticParams` from `careersRoles`; unknown ids → `notFound()`. This answers the "can't be an SPA?" concern: the tabs interaction is untouched — the URL only chooses the initial tab. Since every panel is already server-rendered (just `hidden`), crawlers see the position content on its URL.
*Alternative rejected:* dedicated position-detail template — thin content, a third page design to maintain, and the apply form would need duplicating or linking back.
*Alternative rejected:* `?role=` query or `#anchor` deep links — no per-URL OG metadata (crawlers ignore client state; query params are excluded from clean static metadata and look untrustworthy in a social post).

**D2 — Tab clicks do not navigate or rewrite the URL.**
The share button, not the address bar, is the sharing mechanism: each panel's share row builds the absolute URL for *its own* role from content, so what the recruiter shares is always correct even after switching tabs on `/zostan-lama`. Skipping URL sync avoids router-navigation side effects (Lenis scroll reset on pathname change, Activity/cache double-mount hazards) for zero lost functionality.

**D3 — On entry via a position URL, the page scrolls to the roles section (instant, not animated).**
A recruiter's link should land on the job, not the generic hero. After hydration, when `initialRoleId` is set, jump (`lenis.scrollTo(target, { immediate: true })` or equivalent) to the roles section. Instant jump sidesteps reduced-motion concerns and the Lenis first-paint races.
*Alternative considered:* no scroll — rejected; the hero + marquee push the actual position below the fold, diluting the shared link's promise.

**D4 — Position ids are the URL segments in both locales (no translated slugs).**
EN convention prefers translated slugs, but the ids are already English-flavored (`social-media-specialist`), already the cross-locale contract, and already type-derived into the form's Zod enum. Introducing a separate `pairSlug` would add a second identifier to keep in sync for zero reader-visible gain. The slug-map gets per-role pair entries (PL `/zostan-lama/{id}` ↔ EN `/en/become-a-lama/{id}`) built from `careersRoles` ids as literals — satisfying the "static literal table" locale-toggle rule, following the existing SECTIONS detail-URL precedent.

**D5 — Metadata via per-role `generateMetadata` on both routes, `pairMetadata`-style.**
Per-role SEO title/description live in the content files (new keys per role or a template + role title), so the locale-parity test guards both locales. Each URL self-canonicalizes with hreflang alternates to its counterpart and `x-default` → PL, per site-i18n. Near-duplicate page content across 3 URLs is accepted at this scale — distinct titles/descriptions, 2 roles. Sitemap: role entries emitted from `careersRoles` with `languagesFor` alternates (going beyond the SECTIONS precedent, which omits sitemap alternates — cheap to do right here).

**D6 — Extract the blog share row into `components/ui/share/` and reuse it.**
`post-share.tsx` already has the exact behavior wanted (LinkedIn intent, Facebook sharer, clipboard copy with `Check`/`Link2` state, `SocialGlyph` brand marks). The careers-page spec forbids importing `post.module.css` across routes, so reuse means extraction: shared component owns behavior + markup, takes className hooks; blog keeps its `post.module.css` classes via the hooks (mechanical swap, no visual change), careers styles a compact dark-stage variant in `zostan-lama.module.css`. Share labels for careers get their own content keys (the blog's are post-specific templates).
*Alternative rejected:* hand-rolled careers-only button — forks the copy-state/intent logic the simplify passes exist to deduplicate.

## Risks / Trade-offs

- [Blog touched by the D6 extraction] → import swap with className passthrough only; verify the post share row is pixel-identical (both themes) before calling it done. Fallback if the extraction fights the route-scoped styles: leave blog untouched, build the careers share row against the shared logic only (a hook), and note it.
- [3 URLs serving near-identical content] → accepted: 2 roles, distinct metadata, self-canonical. If positions ever grow into rich descriptions, revisit dedicated templates (and possibly CMS) then.
- [Role list changes orphan shared URLs] → removing a role from content 404s its URL (correct — the job is gone), and `generateStaticParams` + sitemap both derive from the same array so nothing needs manual sync. A stale-but-shared link 404ing is acceptable; a redirect-to-hub for unknown roles was considered and rejected as masking (a recruiter should see the position is closed, not silently land on the list).
- [Entry scroll (D3) races hydration/Lenis] → use the established pattern for post-mount scrolls (rAF after Lenis init, immediate jump); e2e asserts the roles section is in view on a role URL.
- [Legacy `/zostan-lama/` 301 and root `[slug]` route] → nested `[role]` segment collides with neither (blog slugs are root-level; the 301 targets the exact base path) — assert both in e2e anyway.

## Open Questions

None blocking. Per-role SEO descriptions need copywriting at implementation time (PL + EN); user reviews copy then.
