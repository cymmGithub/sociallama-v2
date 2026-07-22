#!/usr/bin/env bash
# Composite each model's matte on plum, crop the same edge region, label, tile.
set -e
cd "$(dirname "$0")"

# crop regions chosen per frame (head/ear edges where the halo shows)
declare -A CROP=( [010]="500x400+700+50" [035]="500x400+620+30" [055]="500x400+620+30" )

for n in 010 035 055; do
  row=()
  for model in u2net isnet-general-use bria-rmbg birefnet-general; do
    if [ "$model" = "u2net" ]; then
      src="../frame-$n.matte.png"   # existing u2net matte
    else
      src="frame-$n.$model.png"
    fi
    [ -f "$src" ] || continue
    convert "$src" -background '#892f53' -flatten \
      -crop "${CROP[$n]}" +repage -resize 200% \
      -gravity North -background black -splice 0x40 \
      -fill white -pointsize 28 -annotate +0+8 "$model" \
      "tile-$n-$model.png"
    row+=("tile-$n-$model.png")
  done
  montage "${row[@]}" -tile "${#row[@]}"x1 -geometry +4+4 -background '#111' "compare-$n.png"
done
echo DONE
ls compare-*.png
