# Proposal — add-media-ops-library

## Why

Batch image updates against the production database fail in the same ways
every time. Three days of work (2026-08-19 → 08-21) produced five documented
incidents, and they reduce to five mechanisms — every one of them written down
in memory, and **every one of them hit again after being written down**:

| # | mechanism | hit | why the note did not prevent it |
| --- | --- | --- | --- |
| 1 | Payload's `getSafeFileName` checks the local `media/` directory for collisions **even when the bytes go to Vercel Blob** (`generateFileData.js` passes `staticPath` unconditionally). A dev run leaves `<name>` on disk; the prod run minutes later bumps every filename by one. | 08-19, **08-21 again — all 27 covers** | The note said "the log gives no hint". The log was fixed; the rename still happened. |
| 2 | Collection hooks revalidate through `revalidateTag`, which throws outside a Next request and is swallowed. A CLI script changes data and invalidates **nothing**; prerendered pages serve stale HTML for `cacheLife('days')`. | 08-19, 08-21 (listing showed 48 cards for an hour after the delete) | Every script *prints* "redeploy or revalidate". A printed reminder is an instruction to a human who forgets. |
| 3 | `/_next/image` keeps variants built from stale upstream for a year; a deploy does not purge them. | 08-19 twice | Same — printed. |
| 4 | Dev and prod can reference **different rows** for one field (`produkty-cukiernicze-brzesc`: `-cover-3.jpg` vs `image_crop_…jpg`). Filename keying protects against id drift, not against this. | 08-20 | Probed by hand each time; nothing enforces the probe. |
| 5 | Verification lies: bare `curl` hits a different `Accept`-negotiated cache entry than a browser; `naturalWidth` counts lazy images below the fold as broken; the 60 req/60 s limiter surfaces as 400 through the optimizer and looks like a regression. | every pass | No shared verifier; each script re-invents a worse one. |

Underneath all five is one structural cause: **20 one-off scripts, 6,347 lines**
under `lib/payload/`, each re-implementing upload-if-missing, blob clearing,
`idOf`, locale-pair alt writes, and the report/apply switch from scratch — and
each free to forget a step. Documentation cannot fix a problem whose root is
"every new script starts from zero".

## What Changes

- **New `lib/payload/media-ops.ts`**, a single module every media-writing script
  imports. Its guarantees are *enforced*, not advised:
  - `uploadMedia` passes `overwriteExistingFiles: true` (skips `getSafeFileName`
    entirely — the requested name is the stored name) and **throws** if the
    stored filename still differs. Mechanism 1 becomes impossible.
  - Before any `--prod` write it refuses to start if the working copy's `media/`
    directory holds files, naming the directory and the one-line fix. The dev
    artefacts that caused the rename can no longer be present for a prod run.
  - `repointRelation` takes `from: string[]`, reads the **target** database's
    current value, and skips with a named reason on a third value. Mechanism 4
    becomes structural.
  - `finish()` POSTs the touched tags to `/api/revalidate` and purges the CDN
    when media bytes changed. `REVALIDATE_SECRET` missing is an error raised
    **before the first write**, not discovered after. Mechanisms 2 and 3 stop
    depending on a human reading the log.
  - `verifyLive()` fetches with a browser `Accept` header, scrolls past the lazy
    fold before counting, paces under the rate limiter, and reports 429/500
    separately from "broken". Mechanism 5 gets one correct implementation.
- **`apply-cover-refresh.ts` is ported onto it** as the proof — the one script
  in this set that will run again (the deferred dolina-charlotty / power-elements
  / ed-invest covers go through it). Behaviour and output must match.
- **A unit test that fails the build** when any `lib/payload/*.ts` other than
  the module calls `payload.create({ collection: 'media' …` or `payload.update`
  on `media` directly. New offenders cannot merge.
- The remaining 19 scripts are **not** ported. They are one-offs that already
  ran; porting them buys safety only if they run again. The lint test is what
  stops recurrence — it guards the next script, which is the one that matters.

## Capabilities

### Modified Capabilities
- `case-studies`: the existing "Imagery changes to published studies are
  reviewed before they are written" requirement gains the mechanics that
  process assumed but never stated: stored filename equals requested filename
  or the write fails; a production write starts by refusing a polluted working
  copy; every production write ends by revalidating the pages it changed and
  verifying them the way a browser sees them.

## Impact

- New: `lib/payload/media-ops.ts`, `lib/payload/media-ops.test.ts`.
- Rewritten on the module: `lib/payload/apply-cover-refresh.ts` (behaviour
  preserved; `stored` field becomes unnecessary for future ops but stays for the
  27 already-renamed rows).
- No schema, no migration, no content write. Verification is a dev-DB report
  run of the ported script producing output identical to the current one, plus
  `--prod` report-only showing `pending=0 already-done=27`.
- Risk: `overwriteExistingFiles: true` means a genuinely colliding name
  **overwrites** instead of bumping. That is the intended contract — a plan
  names its files deliberately — but the module checks Blob for an existing
  object first and refuses unless the caller passed `replace: true`.
