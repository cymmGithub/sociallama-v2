# Tasks — add-careers-role-urls

## 1. Shared share component (extraction first — both routes depend on it)

- [x] 1.1 Extract the share row from `app/(frontend)/[slug]/post-share.tsx` into `components/ui/share/` — behavior (LinkedIn intent, Facebook sharer, clipboard copy with 2s `Check`/`Link2` state) and markup, parametrized by className hooks; keep the absolute-URL requirement documented on the `url` prop
- [x] 1.2 Swap the blog post share row to the shared component, keeping its `post.module.css` classes via the hooks; verify the post page share row is visually unchanged (light + dark)

## 2. Content & copy

- [x] 2.1 Add per-role SEO copy (title/description carrying the role title) and careers share labels (copy/LinkedIn/Facebook aria + copied confirmation) to `lib/content/zostan-lama.ts` and `.en.ts`; run the locale-parity test
- [x] 2.2 Draft the PL + EN per-role descriptions for user review (flag in the PR/summary — copy sign-off happens here)

## 3. Routes & page wiring

- [x] 3.1 Add `app/(frontend)/zostan-lama/[role]/page.tsx`: `generateStaticParams` from `careersRoles`, `notFound()` on unknown id, reuse the existing page composition with `initialRoleId`
- [x] 3.2 Add `app/(frontend-en)/en/become-a-lama/[role]/page.tsx` mirroring the EN base page (PL components + EN content + `locale="en"`), same params/404 logic
- [x] 3.3 Thread `initialRoleId` through `CareersRoles` (initial `useState` index from role id, fall back to 0) and through `CareersApply` → `careers-form.tsx` role `SelectField` `defaultValue`
- [x] 3.4 Entry scroll: when `initialRoleId` is present, jump instantly to the roles section after mount (rAF after Lenis init, `immediate: true`); base pages must not auto-scroll
- [x] 3.5 Render the shared share row in each role panel (`careers-roles.tsx`), building each panel's absolute role URL from content + locale base path; style the compact dark-stage variant in `zostan-lama.module.css` (no cross-route CSS imports)

## 4. SEO wiring

- [x] 4.1 Add per-role pair resolution to `lib/i18n/slug-map.ts` (PL `/zostan-lama/{id}` ↔ EN `/en/become-a-lama/{id}`, ids as static literals) so `alternatesForPath`, `counterpartPath`, and the locale toggle resolve role URLs
- [x] 4.2 `generateMetadata` on both role routes: per-role title/description from content, OG website type, hreflang alternates with `x-default` → PL (follow `pairMetadata`'s shape in `lib/utils/metadata.ts:229-247`)
- [x] 4.3 Emit role URLs in `app/sitemap.ts` for both locales with `languagesFor` alternates, derived from `careersRoles`
- [x] 4.4 Check `lib/static-routes.ts` / `lib/payload/reserved-slugs.ts` / `app/llms.txt/route.ts` for whether role URLs need entries (nested segment — likely only llms.txt is a judgment call); confirm the legacy `/zostan-lama/` 301 still resolves

## 5. Tests & verification

- [x] 5.1 Extend `e2e/zostan-lama.e2e.ts`: role URL renders with the correct tab active and roles section in view, role select preselected, unknown id 404s, base page unchanged (first tab, top of page)
- [x] 5.2 e2e or integration check for share URLs: each panel's copy/intent buttons carry that panel's absolute role URL after switching tabs
- [x] 5.3 Verify OG unfurl locally: `curl` a role URL and confirm the served HTML carries the role's OG title/description without JS; check both locales
- [x] 5.4 Full check: `bun run check`, e2e from the worktree, sitemap crawl green; visual pass on the share row in WebKit as well as Chromium (Safari is not optional)
