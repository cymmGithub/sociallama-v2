# Design — retarget-wp-redirects

## Context

`lib/wp-redirects.ts` is a generated, committed artifact consumed by `next.config.ts` `redirects()`. Its source of truth is the `PAGE_DISPOSITIONS` table in `lib/scripts/generate-wp-redirects.ts`, which fetches the live Yoast tag + page sitemaps and regenerates the module. Eight dispositions were recorded on 2026-07-17, before `/uslugi` and `/o-nas` existed as routes, so they target homepage anchors. The full old-site inventory was re-verified on 2026-08-04: 249 sitemap URLs; 88 resolve by URL parity (all 79 post slugs confirmed 1:1 against the prod Payload DB), 161 are covered by the 11 redirect rules. Reference doc for the user-facing map: `wp-redirect-map.xlsx` (repo root, untracked).

## Goals / Non-Goals

**Goals:**
- Retarget the eight anchor-destination rules to dedicated routes: `/oferta`, `/oferta/{facebook,instagram,linkedin,tiktok,twitter,pinterest}`, `/500-zl-na-reklame` → `/uslugi`; `/z-lama-warto` → `/o-nas`.
- Keep the generator as the single source of truth — edit dispositions, regenerate, commit both files.
- Encode "no fragment targets" at spec level so future dispositions can't regress.

**Non-Goals:**
- No new redirect sources (feed/author/wp-content decisions are explicitly deferred — see Open Questions).
- No route, content, or schema changes; no per-platform deep links (`/uslugi/content#facebook` was considered and rejected: no platform anchors exist on service pages, the platform→discipline mapping is editorially arbitrary, and Google ignores fragments in redirect targets anyway).
- No change to the `/tag/:slug → /blog` blanket rule or `/cookie-policy → /polityka-prywatnosci`.

## Decisions

- **Edit dispositions, not the generated file.** `lib/wp-redirects.ts` says "GENERATED FILE, do not edit by hand" — honoring that keeps the decision record (`PAGE_DISPOSITIONS` notes) authoritative. Update each retargeted entry's `note` to record the 2026-08-04 decision and why (dedicated pages now exist; fragments invisible to crawlers).
- **Regenerate by running the script live.** The WP host is still up (pre-cutover), so `bun ./lib/scripts/generate-wp-redirects.ts` re-fetches sitemaps and re-emits the module — this also re-validates that the old sitemap hasn't drifted since July. If the script's disposition-report path (`openspec/changes/migrate-wp-content/page-disposition.md`) points into an archived change, redirect the report artifact rather than resurrecting the old change dir — smallest edit wins.
- **Keep `statusCode: 301`** (not `permanent: true`/308) — required by the seo-url-parity spec.
- **Collapse the six platform rules?** No — keep one explicit rule per URL. The generator emits per-URL rules from per-URL dispositions; collapsing to `/oferta/:slug` would need special-casing in the generator for zero behavioral gain, and per-URL rules keep the decision record 1:1 with the page sitemap.

## Risks / Trade-offs

- [Old WP sitemap drifted since July] → the generator re-fetches live sitemaps; any new/removed URL surfaces as a diff in the regenerated module or a pending disposition that fails the run.
- [Redirect regression on paths that used to work] → verify each of the 11 sources with curl against the dev server (301 + expected Location), and confirm `/uslugi` and `/o-nas` return 200.
- [Anchor targets referenced elsewhere] → grep for `/#uslugi` and `/#o-nas` outside `lib/wp-redirects.ts`; homepage anchors themselves stay (nav may use them) — only redirect destinations change.

## Open Questions

- Feed endpoints (`/feed`, `/category/:slug/feed`, `/comments/feed`): add blanket 301s to `/blog` / `/category/:slug`, or accept 404? Leaning add-them (cheap, readers land sensibly) but this is a user call recorded as out of scope here — raise at review, don't implement unasked.
