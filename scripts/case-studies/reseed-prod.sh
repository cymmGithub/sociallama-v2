#!/usr/bin/env bash
# Reseed prod: import + publish every authored case study against
# DATABASE_URL_PROD. Run from a machine/environment with real network access
# to prod (this loops the existing import/publish scripts, it doesn't add
# new logic).
#
# Skips any staging dir whose draft.json still has an un-authored "TODO"
# stub (currently just medicover) — the importer refuses those anyway, this
# just avoids the noisy failure and logs why.
#
# REQUIRES `BLOB_READ_WRITE_TOKEN` in .env.local (pull it with
# `vercel env pull <tmpfile> --environment=development` and copy just that key —
# a plain `vercel env pull .env.local` CLOBBERS DATABASE_URL/DATABASE_URL_PROD).
# Without it the Blob plugin is disabled and media bytes land on local disk
# while prod DB rows point at files that don't exist -> every image 404s.
#
# GOTCHA this script handles: Payload checks the collection's LOCAL staticDir
# (./media) for filename collisions even when the Blob adapter is active. Any
# leftovers from a dev-DB import make every prod upload get renamed
# (riviera-cover.jpg -> riviera-cover-1.jpg), which also breaks the importer's
# filename-based dedup, so re-runs duplicate media instead of reusing it.
# We move ./media aside for the duration and restore it on exit.
#
# Usage:
#   scripts/case-studies/reseed-prod.sh            # import + publish all, --prod
#   scripts/case-studies/reseed-prod.sh --import-only   # skip the publish step
#   PUBLISH_EXCEPT="kbp luisse mmhygienic" scripts/case-studies/reseed-prod.sh
#     ^ import all, but publish everything except the listed slugs (keep them draft)

set -euo pipefail
cd "$(dirname "$0")/../.."

if ! grep -qE '^BLOB_READ_WRITE_TOKEN=".+"' .env.local 2>/dev/null; then
  echo "ERROR: BLOB_READ_WRITE_TOKEN not set in .env.local — media would be" >&2
  echo "written to local disk and every prod image would 404. Aborting." >&2
  exit 1
fi

import_only=false
[[ "${1:-}" == "--import-only" ]] && import_only=true

# Park the dev-DB media artifacts so prod uploads keep their intended filenames.
MEDIA_BAK="../.media-devbak-$(basename "$PWD")"
restore_media() {
  if [[ -d "$MEDIA_BAK" ]]; then
    rmdir media 2>/dev/null || true
    [[ -d media ]] || mv "$MEDIA_BAK" media
    echo "restored local ./media ($(ls media | wc -l) files)"
  fi
}
trap restore_media EXIT
if [[ -d media && -n "$(ls -A media 2>/dev/null)" ]]; then
  rm -rf "$MEDIA_BAK"
  mv media "$MEDIA_BAK"
  mkdir -p media
  echo "parked local ./media -> $MEDIA_BAK for the duration"
fi

echo "== importing authored studies into prod =="
for f in content/case-studies/*/draft.json; do
  slug="$(basename "$(dirname "$f")")"
  if grep -q '"TODO"' "$f"; then
    echo "skip: $slug (still has un-authored TODO stub)"
    continue
  fi
  echo "-- $slug"
  bun ./lib/payload/import-case-study.ts "$slug" --prod
done

if $import_only; then
  echo "Import-only run complete. Nothing published."
  exit 0
fi

echo
echo "== publishing =="
if [[ -n "${PUBLISH_EXCEPT:-}" ]]; then
  # shellcheck disable=SC2086
  bun ./lib/payload/publish-case-studies.ts --prod --except $PUBLISH_EXCEPT
else
  bun ./lib/payload/publish-case-studies.ts --prod
fi

echo
echo "Done. Writes bypass the deployed app's cache — redeploy or revalidate"
echo "for the changes to surface on the live site."
