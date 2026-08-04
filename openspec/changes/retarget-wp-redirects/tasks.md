# Tasks — retarget-wp-redirects

## 1. Retarget dispositions

- [ ] 1.1 In `lib/scripts/generate-wp-redirects.ts` `PAGE_DISPOSITIONS`, change `to` for `/oferta`, `/oferta/facebook`, `/oferta/instagram`, `/oferta/linkedin`, `/oferta/tiktok`, `/oferta/twitter`, `/oferta/pinterest`, `/500-zl-na-reklame` from `/#uslugi` to `/uslugi`, and `/z-lama-warto` from `/#o-nas` to `/o-nas`; update each entry's `note` to record the 2026-08-04 decision (dedicated pages exist; fragments are invisible to crawlers)
- [ ] 1.2 Check the script's disposition-report output path (`openspec/changes/migrate-wp-content/page-disposition.md`) — if that change is archived, point the report somewhere that doesn't resurrect the old change dir

## 2. Regenerate the committed artifact

- [ ] 2.1 Run `bun ./lib/scripts/generate-wp-redirects.ts` (WP host is still live pre-cutover); confirm it exits zero with no pending dispositions
- [ ] 2.2 Diff `lib/wp-redirects.ts`: exactly the 9 destinations change, rule count stays 11, `statusCode: 301` throughout, no fragment appears in any `destination`; update the module's header comment if it still says "the WP host is gone after cutover" contradicts a re-run note

## 3. Verify

- [ ] 3.1 Against the worktree dev server: each of `/oferta`, the six `/oferta/{platform}` paths, `/500-zl-na-reklame` returns 301 → `/uslugi`; `/z-lama-warto` returns 301 → `/o-nas`; `/tag/anything` → `/blog` and `/cookie-policy` → `/polityka-prywatnosci` unchanged; `/uslugi` and `/o-nas` return 200
- [ ] 3.2 Grep the repo for remaining `/#uslugi` / `/#o-nas` redirect destinations (nav/menu anchors are fine — only redirect targets must be fragment-free)
- [ ] 3.3 `bun run check` passes
