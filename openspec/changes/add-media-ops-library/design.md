# Design — add-media-ops-library

## Context

`refresh-case-study-covers` shipped on 2026-08-21 with every one of its 27
production uploads renamed (`-cover-2` → `-cover-3`), and its listing stale for
an hour after the Adamed delete until `/api/revalidate` was called by hand.
Both were known mechanisms with memory notes. The proposal catalogues five such
mechanisms; this design makes each one structurally impossible in a shared
module, and ports one real script onto it.

Facts established by reading the source, not assumed:

- `node_modules/payload/dist/uploads/generateFileData.js:195` passes `staticPath`
  to `getSafeFileName` unconditionally. `disableLocalStorage` never reaches it.
  `getSafeFileName` loops while `docWithFilenameExists || fileExists(staticPath/name)`.
- `generateFileData` skips `getSafeFileName` entirely when
  `overwriteExistingFiles` is true (`:188`). It is a documented option on
  `payload.create` (`local/create.d.ts:62`).
- `app/api/revalidate/route.ts` exists, takes `?tag=` repeated, auths on
  `x-revalidate-secret`, rejects unknown tags with 400 (listing them). Known
  global tags: `posts categories case-studies social-platforms blog-hub`; scoped:
  `post:<slug>`, `case-study:<slug>`.
- `lib/payload/revalidate.ts` hooks call `revalidateTag` inside try/catch; from
  the CLI the throw is swallowed. `findCaseStudies` is `'use cache'` +
  `cacheTag('case-studies')` + `cacheLife('days')`, then CDN-cached with
  `max-age=86400`.
- Media rate limit is Payload's default, 60 req / 60 s, surfaced through
  `/_next/image` as 400.

## Goals / Non-Goals

**Goals:** one module whose API cannot be used to reproduce mechanisms 1–5; the
cover script on it with identical behaviour; a test that blocks new direct
media writes.
**Non-Goals:** porting the other 19 scripts; changing the Payload media
collection, the revalidate route, or the rate limiter; fixing the 404-status
defect (own change).

## Decisions

1. **`overwriteExistingFiles: true`, then assert.** The option skips the rename.
   But "skips the rename" is not the guarantee — the guarantee is "stored name
   equals requested name", and that is asserted after `create` by reading
   `doc.filename` back and throwing on mismatch. The option is the mechanism;
   the assertion is the contract. Rejected: patching `getSafeFileName` or
   setting `staticDir` to a tmp dir — both fight the framework and rot on upgrade.

2. **Overwrite needs an opt-in.** `overwriteExistingFiles` also means a real
   collision silently replaces bytes. The module lists the Blob store (when the
   plugin is active) or the local dir (when not) for the exact key first and
   refuses unless the op passed `replace: true`. A plan names its files on
   purpose; an accidental overwrite is the worse failure.

3. **Preflight, not a warning.** `assertCleanWorkingCopy()` runs before the
   first write on `--prod`: if `<cwd>/media/` contains any file, throw with the
   directory and `rm -rf media/` in the message. Rejected: auto-deleting — the
   dev server may be serving those files, and a script should not reach into
   another process's state. Rejected: running prod from a different cwd — that
   is the rule that was forgotten every time.

4. **`finish()` is the only way to end a run, and it cannot be skipped.** The
   module tracks touched tags and whether bytes changed; `finish({ prod })`
   POSTs them to `/api/revalidate` and runs the CDN purge when bytes changed.
   `REVALIDATE_SECRET` and `BLOB_READ_WRITE_TOKEN_PROD` are checked in
   `begin()`, before any write — a script that cannot finish must not start.
   Dev runs skip the network calls but still print what prod would call.

5. **`repointRelation` with `from: string[]`.** Reads the target DB at depth 1,
   compares `field.filename` against the list, classifies into `already-done |
   pending | stale`. `stale` is printed with the unexpected value and never
   written. This is the cover script's existing guard, promoted to the module.

6. **`verifyLive()` is the verifier every script uses.** Playwright, browser
   `Accept` on image requests, scroll-to-bottom before counting, 1.1 s pacing on
   direct media fetches, response listener splitting `429` / `5xx` / decode
   failure. Returns a structured result; the script decides pass/fail.

7. **The guard test greps, deliberately.** `media-ops.test.ts` reads every
   `lib/payload/*.ts` except the module and fails on
   `/payload\.(create|update)\(\s*\{\s*collection:\s*['"]media['"]/`. A
   grep is crude and that is the point: it has no runtime, no mocks, and no way
   to be accidentally bypassed by a refactor. Existing offenders are listed in
   an allow-list inside the test with the date, so the count can only go down.

8. **Port, don't rewrite.** `apply-cover-refresh.ts` keeps its `OPS` table,
   output format, and `stored` field (27 prod rows carry bumped names; the
   module does not rename them). What changes is that every write goes through
   the module and the script ends with `finish()`.

## Risks / Trade-offs

- [`overwriteExistingFiles` semantics differ across Payload versions] → the
  post-create assertion catches a regression regardless of what the option does.
- [`/api/revalidate` rate-limited at `rateLimiters.standard`] → one POST with all
  tags, not one per tag.
- [Blob `list()` is eventually consistent] → reuse `clearBlobs`' poll loop for
  the existence check; accept one false "exists" over one silent overwrite.
- [Guard-test allow-list rots] → it names files, not counts; deleting a one-off
  script deletes its line, and a stale line fails the test.

## Migration Plan

1. Module + test, test red against the 19 current offenders → allow-list them.
2. Port the cover script; dev report output diffed against the pre-port output.
3. `--prod` report-only: `pending=0 already-done=27 skipped=0`.
4. Memory note updated to point at the module instead of the gotchas.

## Open Questions

- Whether `delete-case-study.ts` should move too — it deletes media and would
  benefit from `finish()`. Leaning yes, as a second port in the same change,
  since its revalidation gap is exactly what bit today. Decided at task 3.
