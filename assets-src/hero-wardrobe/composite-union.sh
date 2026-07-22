#!/usr/bin/env bash
# Composite all mattes with ONE union bounding box so the llama's scale/position
# never breathes between frames. SouthEast-anchored into 1370x1080 webp.
set -e
cd "$(dirname "$0")"

echo "[1/2] union bbox over all mattes"
minx=99999; miny=99999; maxx=0; maxy=0
for m in $(ls frame-*.matte.png | sort); do
  read w h x y <<<"$(convert "$m" -format "%@" info: | tr 'x+' '  ')"
  x2=$((x + w)); y2=$((y + h))
  [ "$x" -lt "$minx" ] && minx=$x
  [ "$y" -lt "$miny" ] && miny=$y
  [ "$x2" -gt "$maxx" ] && maxx=$x2
  [ "$y2" -gt "$maxy" ] && maxy=$y2
done
uw=$((maxx - minx)); uh=$((maxy - miny))
echo "  union: ${uw}x${uh}+${minx}+${miny}"

echo "[2/2] crop union box, resize x1036, SouthEast into 1370x1080"
mkdir -p build-union; rm -f build-union/*.webp
i=0
for m in $(ls frame-*.matte.png | sort); do
  i=$((i+1)); n=$(printf "%03d" $i)
  convert "$m" -crop "${uw}x${uh}+${minx}+${miny}" +repage \
    -resize x1036 -background none -gravity SouthEast -extent 1370x1080 \
    -define webp:lossless=false -quality 92 "build-union/$n.webp"
done
echo "DONE: $(ls build-union/*.webp | wc -l) frames in build-union/"
