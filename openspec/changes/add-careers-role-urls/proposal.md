# add-careers-role-urls

## Why

Open positions on `/zostan-lama` live only as client-side tabs — there is no URL that points at a specific position, so SociaLlama recruiters cannot share a link to one job on social media, and a shared `/zostan-lama` link unfurls with the generic careers metadata. Deep-linkable per-position URLs with their own OG title/description require real server-rendered routes (social crawlers never execute the tab JS), but they do **not** require abandoning the current single-page tabs experience: a nested route can render the same page with the right tab active.

## What Changes

- **Per-position URLs**: each open position gets a real route — PL `/zostan-lama/{role-id}`, EN `/en/become-a-lama/{role-id}` — rendering the existing careers page with that position's tab preselected and the application form's role select defaulted to it. The position ids in `lib/content/zostan-lama.ts` are already stable, slug-shaped, and locale-independent by contract (the form submits them), so they become the URL segments in both locales. Unknown ids 404.
- **Per-position SEO surface**: each position URL emits its own title/description/OG (so a shared link unfurls with the job title), hreflang alternates to its locale counterpart per the site-i18n rules (slug-map wiring so the locale toggle resolves), and sitemap entries. Existing Polish URLs do not move; the legacy `/zostan-lama/` 301 keeps working.
- **Per-position share button**: a small share affordance in each position's panel — copy-link plus LinkedIn/Facebook share intents, following the blog `PostShare` pattern — that always prepares the absolute URL of *that* position, regardless of which URL the page was loaded from. The share machinery is extracted from the blog route into a shared component (careers-page spec forbids cross-route CSS imports), with the blog swapping to the shared import mechanically.

## Capabilities

### New Capabilities

(none)

### Modified Capabilities
- `careers-page`: new requirements — per-position URLs rendering the tabs page with the position active, per-position metadata/hreflang/sitemap entries, and a per-position share affordance.
- `careers-application-form`: new requirement — when the page is entered via a position URL, the role select defaults to that position instead of the first role.

## Impact

- New route segments: `app/(frontend)/zostan-lama/[role]/page.tsx` and `app/(frontend-en)/en/become-a-lama/[role]/page.tsx` (thin wrappers over the existing page composition; `generateStaticParams` from `careersRoles`).
- `app/(frontend)/zostan-lama/careers-roles.tsx` — accept an initial active role; `careers-apply.tsx`/`careers-form.tsx` — accept a default role id for the select.
- Shared share component extracted from `app/(frontend)/[slug]/post-share.tsx` into `components/ui/` with className hooks; blog restyles via existing `post.module.css` classes, careers styles it in `zostan-lama.module.css` (dark stage).
- SEO wiring: `lib/i18n/slug-map.ts` (pair resolution for the locale toggle + `alternatesForPath`), `lib/utils/metadata.ts` usage (`pairMetadata`-style per role), `app/sitemap.ts` (role entries with `languagesFor` alternates), `lib/static-routes.ts` if the pair table needs entries.
- Copy: per-role SEO title/description + share labels in `lib/content/zostan-lama.ts` / `.en.ts` (locale-parity test covers both).
- Tests: `e2e/zostan-lama.e2e.ts` (role URL renders with correct tab + preselected role, 404 for unknown), sitemap crawl picks up new URLs automatically.
- No Payload/schema changes, no new dependencies, no breaking changes; content remains static (2 positions today).
