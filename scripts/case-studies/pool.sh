#!/usr/bin/env bash
# Tasks 1.1–1.4, 2.1 — build the replacement-image pool from the client decks.
#
# Extracts per DECK FILE, not per folder, because the Drive folders do not hold
# one deck each: `Finanse/` carries three different brands and several folders
# carry both a .pptx and its exported .pdf. A per-folder pool would silently
# merge three clients' imagery into one bucket, which is the exact defect this
# change exists to fix.
#
# For every deck it stages, under $POOL_ROOT/<folder>__<deck>/ :
#   media/*      every embedded (pptx) or page-embedded (pdf) image
#   text.md      slide/page text, for the content-based deck→study mapping (2.1)
#   meta.tsv     folder, deck, format, slides/pages, raw media count
#
# Usage:
#   scripts/case-studies/pool.sh              # every deck
#   scripts/case-studies/pool.sh "FM Logistics "   # one folder
#
# Reads DECKS_ROOT (default /mnt/work/goodone/.cs-decks) and writes POOL_ROOT
# (default /mnt/work/goodone/.cs-pool). Both live outside the repository: the
# pool is ~700 MB of someone else's source material, not a build artefact.

set -euo pipefail

DECKS_ROOT="${DECKS_ROOT:-/mnt/work/goodone/.cs-decks}"
POOL_ROOT="${POOL_ROOT:-/mnt/work/goodone/.cs-pool}"

slugify() {
  printf '%s' "$1" \
    | iconv -f UTF-8 -t ASCII//TRANSLIT 2>/dev/null \
    | tr '[:upper:]' '[:lower:]' \
    | sed -E "s/'//g; s/[^a-z0-9]+/-/g; s/^-+//; s/-+$//"
}

# Emit each slide's <a:t> runs in numeric slide order (slide2 before slide10).
pptx_text() {
  local deck="$1" tmp
  tmp="$(mktemp -d)"
  unzip -qq -o "$deck" 'ppt/slides/slide*.xml' -d "$tmp" 2>/dev/null || true
  find "$tmp/ppt/slides" -name 'slide*.xml' 2>/dev/null | sort -V \
    | while IFS= read -r xml; do
        printf '\n## Slide %s\n\n' "$(basename "$xml" .xml | tr -dc '0-9')"
        grep -oP '<a:t>.*?</a:t>' "$xml" 2>/dev/null \
          | sed -E 's/<[^>]+>//g' \
          | sed -E 's/&amp;/\&/g; s/&lt;/</g; s/&gt;/>/g; s/&quot;/"/g; s/&#39;/'"'"'/g; s/&apos;/'"'"'/g' \
          | grep -v '^[[:space:]]*$' || true
      done
  rm -rf "$tmp"
}

extract_deck() {
  local deck="$1"
  local rel="${deck#"$DECKS_ROOT"/}"
  local folder="${rel%%/*}"
  local base; base="$(basename "$deck")"
  local fmt; case "${base,,}" in *.pptx) fmt=pptx ;; *.pdf) fmt=pdf ;; *) return ;; esac
  # Format is part of the directory name: several folders hold both a .pptx and
  # its exported .pdf under the same stem, and without it the second extraction
  # silently overwrites the first.
  local out="$POOL_ROOT/$(slugify "$folder")__$(slugify "${base%.*}")__$fmt"

  rm -rf "$out"; mkdir -p "$out/media"

  local pages=0
  if [[ "$fmt" == pptx ]]; then
    # -j flattens ppt/media/* into media/; names are image1.png, image2.jpg, …
    unzip -qq -j -o "$deck" 'ppt/media/*' -d "$out/media" 2>/dev/null || true
    pages="$(unzip -l "$deck" 2>/dev/null | grep -cE 'ppt/slides/slide[0-9]+\.xml' || true)"
    { printf '# %s\n\n> folder: %s\n> deck: %s (pptx)\n' "$folder" "$folder" "$base"
      pptx_text "$deck"; } > "$out/text.md"
  else
    pages="$(pdfinfo "$deck" 2>/dev/null | awk '/^Pages:/ {print $2}')"
    { printf '# %s\n\n> folder: %s\n> deck: %s (pdf)\n\n' "$folder" "$folder" "$base"
      pdftotext -layout "$deck" - 2>/dev/null || true; } > "$out/text.md"
    ( cd "$out/media" && pdfimages -all "$deck" img >/dev/null 2>&1 ) || true
  fi

  local n; n="$(find "$out/media" -maxdepth 1 -type f | wc -l)"
  printf '%s\t%s\t%s\t%s\t%s\n' "$folder" "$base" "$fmt" "${pages:-0}" "$n" > "$out/meta.tsv"
  printf '%-46s %-5s %3s slides/pages %4s images\n' "$(basename "$out")" "$fmt" "${pages:-0}" "$n"
}

mkdir -p "$POOL_ROOT"

if [[ $# -gt 0 ]]; then
  for folder in "$@"; do
    while IFS= read -r deck; do extract_deck "$deck"; done \
      < <(find "$DECKS_ROOT/$folder" -type f \( -iname '*.pptx' -o -iname '*.pdf' \) | sort)
  done
else
  while IFS= read -r deck; do extract_deck "$deck"; done \
    < <(find "$DECKS_ROOT" -type f \( -iname '*.pptx' -o -iname '*.pdf' \) | sort)
fi
