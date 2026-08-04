# Design — retarget-wp-redirects

## Context

`lib/wp-redirects.ts` is a generated artifact; its source of truth is `PAGE_DISPOSITIONS` in `lib/scripts/generate-wp-redirects.ts`, which fetches the live Yoast sitemaps and regenerates the module consumed by `next.config.ts`. The 2026-08-04 inventory: 249 old sitemap URLs, 88 resolve by parity, the rest are covered by 11 rules — 8 of which targeted homepage anchors. Crawlers ignore fragments in redirect targets, so an anchor destination consolidates equity into `/` instead of the intended section.

## Goals / Non-Goals

**Goals:**
- Fragment-free targets, spec-encoded: `/oferta` + the six `/oferta/{platform}` pages + `/500-zl-na-reklame` → `/uslugi`; `/z-lama-warto` → `/o-nas`.
- Keep the disposition table authoritative; keep per-URL rules (1:1 with the page-sitemap decision record).

**Non-Goals:**
- No dedicated platform pages (board decision 2026-08-04, reversing the same morning's idea — the built revision was discarded from this branch; the adapted-copy pattern survives only in git history and `copy-sources/`).
- No feed/author/wp-content redirects (still deferred — Open Questions).
- No content, routing, menu, or sitemap changes.

## Decisions

- **Redirect mechanics unchanged:** edit `PAGE_DISPOSITIONS`, re-run the generator against the still-live WP host, commit both files; keep `statusCode: 301`; keep per-URL rules.
- **Report path** moved from the archived `openspec/changes/migrate-wp-content/` to this change's dir — regenerating must not resurrect an archived change dir.
- **Source capture kept:** `copy-sources/<platform>.md` snapshots of the six live `/oferta/*` pages stay in the change dir. The WP host is decommissioned at cutover; if the board ever revisits platform pages, this is the only surviving copy of the source text.

## Risks / Trade-offs

- [Seven URLs collapse into one hub — per-platform query relevance ("obsługa facebooka") lands on a generic services page] → accepted by the board 2026-08-04; the hub links every service, and revisiting dedicated pages remains possible from the captured sources.
- [Old WP sitemap drifted since July] → the generator re-fetches live sitemaps; drift surfaces as a diff or a pending disposition that fails the run.

## Open Questions

- Feed endpoints (`/feed`, `/category/:slug/feed`): blanket 301s or accepted 404s? Still a user call; out of scope here.
