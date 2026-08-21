# Tasks — add-media-ops-library

## 1. Module

- [ ] 1.1 `lib/payload/media-ops.ts`: `begin({ prod, script })` — env checks (`REVALIDATE_SECRET`, and via `targetProdEnv` the prod DB + Blob token), `assertCleanWorkingCopy()` on prod, returns a context that tracks touched tags and byte changes
- [ ] 1.2 `uploadMedia(ctx, { file, fromPath, altPl, altEn, replace? })`: existence check (Blob or local), `overwriteExistingFiles: true`, stored-name assertion, EN alt write, returns the doc
- [ ] 1.3 `repointRelation(ctx, { collection, slug, field, from, toMediaId })`: probe at depth 1, classify `already-done | pending | stale`, write only `pending`
- [ ] 1.4 `finish(ctx)`: POST `/api/revalidate` with the tracked tags (single call), CDN purge when bytes changed, print the rollback lines; dev runs print the calls they would make
- [ ] 1.5 `verifyLive({ base, pages })`: Playwright, browser Accept, scroll before count, paced media fetches, split 429 / 5xx / decode; structured result

## 2. Guard

- [ ] 2.1 `lib/payload/media-ops.test.ts`: grep every `lib/payload/*.ts` except the module for direct `media` create/update; allow-list the current offenders by filename with date; test fails on an unlisted file AND on a listed file that no longer matches (so the list can only shrink)
- [ ] 2.2 `bun test` green with the allow-list; remove one entry to prove it goes red, restore

## 3. Port

- [ ] 3.1 `apply-cover-refresh.ts` on the module; `OPS` and `stored` untouched; dev report output identical to the pre-port run (diff the two logs)
- [ ] 3.2 `--prod` report-only → `pending=0 already-done=27 skipped=0`; the `stale` path exercised by a temporary wrong `from` on dev, then reverted
- [ ] 3.3 Decide and record whether `delete-case-study.ts` ports too (design open question); if yes, port it the same way

## 4. Close

- [ ] 4.1 `bun run check`; memory note `media-batch-update-pitfalls` written to point at the module; commit; ff-merge; push
