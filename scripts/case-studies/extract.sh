#!/usr/bin/env bash
# Tasks 2.1–2.3 — deterministic, re-runnable extraction of one or more decks.
# For each brand it stages:
#   content/case-studies/<slug>/raw-text.md   slide/page text dump
#   content/case-studies/<slug>/media/*       every embedded/rendered image
#   content/case-studies/<slug>/draft.json    StudySeed-shaped skeleton (stubs)
#
# Usage:
#   scripts/case-studies/extract.sh "Rabkoland " "Skrzat"   # specific brands
#   scripts/case-studies/extract.sh --all                    # every deck
#
# Output is disposable staging (git-ignored). No python-pptx dependency:
# PPTX media via `unzip`, PPTX text by parsing <a:t> runs in slide XML;
# PDF text via `pdftotext`, PDF media via `pdfimages -all`.

source "$(dirname "$0")/lib.sh"

# —— PPTX slide text: emit each slide's <a:t> runs in numeric slide order ——
pptx_text() {
  local deck="$1" tmp
  tmp="$(mktemp -d)"
  unzip -qq -o "$deck" 'ppt/slides/slide*.xml' -d "$tmp" 2>/dev/null || true
  # sort slideN.xml numerically, not lexically (slide2 before slide10)
  find "$tmp/ppt/slides" -name 'slide*.xml' 2>/dev/null \
    | sort -V \
    | while IFS= read -r xml; do
        local n; n="$(basename "$xml" .xml | tr -dc '0-9')"
        printf '\n## Slide %s\n\n' "$n"
        # <a:t>text</a:t> runs -> one line each; decode common XML entities.
        grep -oP '<a:t>.*?</a:t>' "$xml" 2>/dev/null \
          | sed -E 's/<[^>]+>//g' \
          | sed -E 's/&amp;/\&/g; s/&lt;/</g; s/&gt;/>/g; s/&quot;/"/g; s/&#39;/'"'"'/g; s/&apos;/'"'"'/g' \
          | grep -v '^[[:space:]]*$' || true
      done
  rm -rf "$tmp"
}

# —— extract one brand ——
extract_brand() {
  local brand="$1"
  local deck; deck="$(deck_path "$brand")"
  if [[ -z "$deck" ]]; then echo "  ! no deck in '$brand', skipping" >&2; return; fi
  local fmt; fmt="$(deck_format "$deck")"
  local slug; slug="$(slugify "$brand")"
  local out="$STAGE_ROOT/$slug"
  local client; client="${brand%"${brand##*[![:space:]]}"}"  # trim trailing space

  echo "→ $client  [$fmt]  -> $out"
  rm -rf "$out"; mkdir -p "$out/media"

  if [[ "$fmt" == pptx ]]; then
    unzip -qq -j -o "$deck" 'ppt/media/*' -d "$out/media" 2>/dev/null || true
    { echo "# $client — raw deck text"; echo; echo "> source: $(basename "$deck") (pptx)"; pptx_text "$deck"; } > "$out/raw-text.md"
  else
    pdftotext -layout "$deck" - 2>/dev/null \
      | { echo "# $client — raw deck text"; echo; echo "> source: $(basename "$deck") (pdf)"; echo; cat; } > "$out/raw-text.md"
    ( cd "$out/media" && pdfimages -all "$deck" img >/dev/null 2>&1 ) || true
  fi

  # media manifest (sorted, natural order)
  local media_json
  media_json="$(find "$out/media" -maxdepth 1 -type f -printf '%f\n' | sort -V \
    | jq -R . | jq -s 'map({file: ., alt: "TODO"})')"

  # StudySeed-shaped skeleton — prose fields are explicit TODO stubs the
  # authoring pass (phase 4) fills; the import step (3.1) reads the filled file.
  jq -n \
    --arg slug "$slug" \
    --arg client "$client" \
    --arg fmt "$fmt" \
    --arg source "$(basename "$deck")" \
    --argjson media "$media_json" \
    '{
      slug: $slug,
      clientName: $client,
      provenance: { sourceDeck: $source, format: $fmt },
      title: "TODO",
      excerpt: "TODO",
      coverAlt: "TODO",
      tags: [],
      period: "TODO",
      logo: { file: "TODO", alt: "TODO" },
      cover: { file: "TODO", alt: "TODO" },
      clientAbout: ["TODO"],
      challenge: { intro: "TODO", objectives: [] },
      pillars: [],
      results: [],
      gallery: [],
      extractedMedia: $media
    }' > "$out/draft.json"

  local nmedia; nmedia="$(echo "$media_json" | jq length)"
  echo "  text: $(wc -l < "$out/raw-text.md") lines | media: $nmedia files"
}

if [[ "${1:-}" == "--all" ]]; then
  while IFS= read -r brand; do extract_brand "$brand"; done < <(each_brand)
else
  [[ $# -eq 0 ]] && { echo "usage: extract.sh <brand>... | --all" >&2; exit 1; }
  for brand in "$@"; do extract_brand "$brand"; done
fi
