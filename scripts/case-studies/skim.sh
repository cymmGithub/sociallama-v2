#!/usr/bin/env bash
# Task 1.2 — lightweight text-only skim to tag each deck strong/partial/thin.
# Signals: hashtag pillars (#WORD), metric tokens (%, tys., mln, zł, zasięg,
# wyświetle, obserw, followers, reach, engagement). Media count from triage.
# No media dump — this only reads text to gauge how authorable each deck is.

source "$(dirname "$0")/lib.sh"
set +e +o pipefail  # grep-with-zero-matches (exit 1) must not abort the skim loop

# text_of <deck> <fmt> -> plain text to stdout
text_of() {
  local deck="$1" fmt="$2" tmp
  if [[ "$fmt" == pptx ]]; then
    tmp="$(mktemp -d)"
    unzip -qq -o "$deck" 'ppt/slides/slide*.xml' -d "$tmp" 2>/dev/null || true
    find "$tmp/ppt/slides" -name 'slide*.xml' 2>/dev/null -exec cat {} + \
      | grep -oP '<a:t>.*?</a:t>' | sed -E 's/<[^>]+>//g'
    rm -rf "$tmp"
  else
    pdftotext -layout "$deck" - 2>/dev/null
  fi
}

printf 'slug\tformat\thashtags\tmetric_hits\tchars\ttag\n'
while IFS= read -r brand; do
  deck="$(deck_path "$brand")"; [[ -z "$deck" ]] && continue
  fmt="$(deck_format "$deck")"; slug="$(slugify "$brand")"
  txt="$(text_of "$deck" "$fmt")"
  chars="${#txt}"
  hashtags="$(printf '%s' "$txt" | grep -oE '#[[:alnum:]ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]+' | sort -u | wc -l)"
  metrics="$(printf '%s' "$txt" | grep -oiE '[0-9][0-9 .,]*(%|k |tys|mln|zł|pln)|zasięg|wyświetle|obserwuj|obserwato|followers|reach|engagement|zaangażow|konwers|kliknię' | wc -l)"
  # heuristic tag
  if   (( hashtags >= 3 && metrics >= 5 )); then tag=strong
  elif (( hashtags >= 1 || metrics >= 3 )); then tag=partial
  else tag=thin; fi
  printf '%s\t%s\t%s\t%s\t%s\t%s\n' "$slug" "$fmt" "$hashtags" "$metrics" "$chars" "$tag"
done < <(each_brand)
