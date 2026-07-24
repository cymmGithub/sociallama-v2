#!/usr/bin/env bash
# Task 1.1 — inventory every deck: brand -> slug, format, page/slide count,
# embedded-media count. Emits a TSV to stdout (and a Markdown table with --md).
#
# Usage: scripts/case-studies/triage.sh [--md]

source "$(dirname "$0")/lib.sh"

md=false
[[ "${1:-}" == "--md" ]] && md=true

pptx_slides() { unzip -l "$1" 2>/dev/null | grep -cE 'ppt/slides/slide[0-9]+\.xml'; }
pptx_media()  { unzip -l "$1" 2>/dev/null | grep -cE 'ppt/media/'; }
pdf_pages()   { pdfinfo "$1" 2>/dev/null | awk '/^Pages:/ {print $2}'; }
pdf_images()  { pdfimages -list "$1" 2>/dev/null | tail -n +3 | grep -c .; }

rows=()
while IFS= read -r brand; do
  deck="$(deck_path "$brand")"
  [[ -z "$deck" ]] && { rows+=("$brand	$(slugify "$brand")	NONE	0	0"); continue; }
  fmt="$(deck_format "$deck")"
  if [[ "$fmt" == pptx ]]; then
    pages="$(pptx_slides "$deck")"; media="$(pptx_media "$deck")"
  else
    pages="$(pdf_pages "$deck")"; media="$(pdf_images "$deck")"
  fi
  rows+=("$brand	$(slugify "$brand")	$fmt	${pages:-0}	${media:-0}")
done < <(each_brand)

if $md; then
  echo "| Brand | Slug | Format | Pages/Slides | Media |"
  echo "|---|---|---|---|---|"
  for r in "${rows[@]}"; do
    IFS=$'\t' read -r b s f p m <<<"$r"
    printf '| %s | %s | %s | %s | %s |\n' "${b%"${b##*[![:space:]]}"}" "$s" "$f" "$p" "$m"
  done
else
  printf 'brand\tslug\tformat\tpages\tmedia\n'
  printf '%s\n' "${rows[@]}"
fi
