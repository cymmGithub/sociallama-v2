# Design — retarget-wp-redirects

## Context

`lib/wp-redirects.ts` is a generated artifact; its source of truth is `PAGE_DISPOSITIONS` in `lib/scripts/generate-wp-redirects.ts`, which fetches the live Yoast sitemaps and regenerates the module consumed by `next.config.ts`. The 2026-08-04 inventory: 249 old sitemap URLs, 88 resolve by parity, the rest are covered by 11 rules — 8 of which targeted homepage anchors. Crawlers ignore fragments in redirect targets, so an anchor destination consolidates equity into `/` instead of the intended section.

## Goals / Non-Goals

**Goals:**
- Fragment-free targets, spec-encoded: `/oferta` and `/500-zl-na-reklame` → `/uslugi`; `/z-lama-warto` → `/o-nas`.
- Keep the disposition table authoritative; keep per-URL rules (1:1 with the page-sitemap decision record).

**Non-Goals:**
- No dedicated platform pages (board decision 2026-08-04, reversing the same morning's idea — the built revision was discarded from this branch; the adapted-copy pattern survives only in git history and `copy-sources/`).
- The six `/oferta/{platform}` rules: `seo-uslugi-branze` shipped them first, pointing at the `prowadzenie-social-media` landing. Re-specifying them here would put two contradictory targets in one capability.
- No feed/author/wp-content redirects (still deferred — Open Questions).
- No content, routing, menu, or sitemap changes.

## Decisions

- **Redirect mechanics unchanged:** keep `statusCode: 301`, keep per-URL rules. The generator can no longer be re-run — it reads the decommissioned WP host — so the disposition table and the committed module are amended together by hand, the pattern `seo-uslugi-branze` established and the module header records.
- **Report path** moved from the archived `openspec/changes/migrate-wp-content/` to `docs/wp-page-disposition.md`. Pointing it at whichever change currently owns the dispositions is what created the bug: that directory is archived the moment the change lands. The report is the tool's output, not a change's paperwork, so it belongs somewhere that does not move.
- **Source capture kept:** `copy-sources/<platform>.md` snapshots of the six live `/oferta/*` pages stay in the change dir. The WP host is decommissioned at cutover; if the board ever revisits platform pages, this is the only surviving copy of the source text.

## Risks / Trade-offs

- [~~Seven URLs collapse into one hub — per-platform query relevance ("obsługa facebooka") lands on a generic services page~~] → no longer taken: `seo-uslugi-branze` sends the six platform URLs to the `prowadzenie-social-media` landing, which carries that exact cluster. Only `/oferta` itself now lands on the hub, which is what it always was — an offer index.
- [Old WP sitemap drifted since July] → the generator re-fetches live sitemaps; drift surfaces as a diff or a pending disposition that fails the run.

## Open Questions

- Feed endpoints (`/feed`, `/category/:slug/feed`): blanket 301s or accepted 404s? Still a user call; out of scope here.
