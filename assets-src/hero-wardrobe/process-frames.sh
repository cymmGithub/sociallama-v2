#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"
PY=/home/linuxbrew/.linuxbrew/opt/python@3.11/bin/python3.11

echo "[1/3] extract 60 frames from test7 (10fps x 6s)"
rm -f frame-*.png
ffmpeg -y -loglevel error -i test7.mp4 -vf fps=10 -frames:v 60 frame-%03d.png
echo "  extracted: $(ls frame-0*.png | grep -vc matte)"

echo "[2/3] matte all 60 (u2net)"
REMBG_MODEL=u2net $PY ../matte.py frame-0*.png >/dev/null 2>&1
echo "  matted: $(ls frame-*.matte.png | wc -l)"

echo "[3/3] composite -> 1370x1080 webp, right/bottom anchored"
mkdir -p build; rm -f build/*.webp
i=0
for m in $(ls frame-*.matte.png | sort); do
  i=$((i+1)); n=$(printf "%03d" $i)
  convert "$m" -trim +repage -resize x1036 -background none -gravity SouthEast -extent 1370x1080 -define webp:lossless=false -quality 92 "build/$n.webp"
done
echo "DONE: $(ls build/*.webp | wc -l) webp frames in build/"
