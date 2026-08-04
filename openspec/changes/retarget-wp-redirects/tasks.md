# Tasks — retarget-wp-redirects

Scope note: revised 2026-08-04 — the board dropped the dedicated platform-pages
idea the same day it was raised. The built page revision was removed from the
branch; this change is the redirect retarget only.

## 1. Source capture

- [x] 1.1 Scrape the six live WP pages (`/oferta/facebook` … `/oferta/pinterest`) into `copy-sources/<platform>.md` — the WP host disappears at cutover; kept as the only surviving copy of the source text

## 2. Retarget redirects

- [x] 2.1 In `lib/scripts/generate-wp-redirects.ts` `PAGE_DISPOSITIONS`: `/oferta`, `/oferta/{platform}`, `/500-zl-na-reklame` → `/uslugi`; `/z-lama-warto` → `/o-nas`; each `note` carries the 2026-08-04 board decision
- [x] 2.2 Repoint the script's report path from the archived `migrate-wp-content` change dir to this change's dir
- [x] 2.3 Run `bun ./lib/scripts/generate-wp-redirects.ts`; diff `lib/wp-redirects.ts` — 9 destinations change, rule count stays 11, `statusCode: 301` throughout, no fragments

## 3. Verify end-to-end

- [x] 3.1 curl each of the 11 redirect sources on the worktree dev server (restart required — `next.config.ts` reads the module at boot): 301 with the exact expected Location; every destination (`/uslugi`, `/o-nas`, `/blog`, `/polityka-prywatnosci`) returns 200 — verified 2026-08-04
- [x] 3.2 `bun run check` passes (647 tests green); `wp-redirect-map.xlsx` refresh declined-pending — user call
