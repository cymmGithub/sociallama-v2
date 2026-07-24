#!/usr/bin/env bash
# Shared helpers for the case-study extraction pipeline.
# Source decks live in /mem/claude-cs/<Brand>/ (git-excluded, one deck each).
# Several brand folders have TRAILING SPACES — always quote paths literally.

set -euo pipefail

# Root of the source deck mirror.
DECKS_ROOT="${DECKS_ROOT:-/mem/claude-cs}"
# Staging output root (git-ignored, see .gitignore).
STAGE_ROOT="${STAGE_ROOT:-content/case-studies}"

# slugify <brand name> -> kebab-case ASCII slug.
# Transliterates Polish diacritics, drops apostrophes, collapses spaces.
slugify() {
  printf '%s' "$1" \
    | iconv -f UTF-8 -t ASCII//TRANSLIT 2>/dev/null \
    | tr '[:upper:]' '[:lower:]' \
    | sed -E "s/'//g; s/[^a-z0-9]+/-/g; s/^-+//; s/-+$//"
}

# deck_path <brand folder name> -> the single .pptx/.pdf inside it.
deck_path() {
  local dir="$DECKS_ROOT/$1"
  find "$dir" -maxdepth 2 -type f \( -iname '*.pptx' -o -iname '*.pdf' \) 2>/dev/null | head -1
}

# deck_format <deck path> -> pptx|pdf
deck_format() {
  case "${1,,}" in
    *.pptx) echo pptx ;;
    *.pdf)  echo pdf ;;
    *)      echo unknown ;;
  esac
}

# Iterate brand folder names (one per line, trailing spaces preserved).
each_brand() {
  find "$DECKS_ROOT" -mindepth 1 -maxdepth 1 -type d -printf '%f\n' | sort
}
