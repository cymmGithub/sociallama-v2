# Tasks — retarget-wp-redirects

Scope note: revised twice. 2026-08-04 — the board dropped the dedicated
platform-pages idea the same day it was raised; the built page revision was
removed from the branch. 2026-08-14 — `seo-uslugi-branze` shipped first and took
the six `/oferta/{platform}` URLs with it, pointing them at the
`prowadzenie-social-media` landing (fragment-free, and a closer content
successor than the hub). What is left here is the three anchor targets it did
not touch, plus the report-path fix.

## 1. Source capture

- [x] 1.1 Scrape the six live WP pages (`/oferta/facebook` … `/oferta/pinterest`) into `copy-sources/<platform>.md` — the WP host disappears at cutover; kept as the only surviving copy of the source text

## 2. Retarget the remaining anchor destinations

- [x] 2.1 In `lib/scripts/generate-wp-redirects.ts` `PAGE_DISPOSITIONS`: `/oferta` and `/500-zl-na-reklame` → `/uslugi`; `/z-lama-warto` → `/o-nas`; each `note` carries the 2026-08-04 board decision
- [x] 2.2 Apply the same three destinations to the committed `lib/wp-redirects.ts` and record the amendment in its header — the generator reads the decommissioned WP host and can no longer be re-run
- [x] 2.3 Repoint the script's report path from the archived `migrate-wp-content` change dir to `docs/wp-page-disposition.md`, so it cannot rot into an archived directory again
- [x] 2.4 Leave the six `/oferta/{platform}` rules exactly as `seo-uslugi-branze` shipped them

## 3. Verify

- [x] 3.1 No rule in `lib/wp-redirects.ts` has a `#` in its destination; rule count stays 11 and `statusCode: 301` throughout
- [x] 3.2 Every destination resolves — `/uslugi`, `/o-nas`, `/uslugi/prowadzenie-social-media`, `/blog`, `/polityka-prywatnosci` — checked against the production build's `routes-manifest.json` and its prerendered pages
- [x] 3.3 `bun run check` and `next build` green

## 4. Housekeeping

- [x] 4.1 `.gitignore` the board-facing `wp-redirect-map.xlsx` and the LibreOffice lock files — the xlsx sits untracked in the main worktree root
