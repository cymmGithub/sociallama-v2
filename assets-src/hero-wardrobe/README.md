# Hero wardrobe-scrub — source assets & pipeline

Working files behind `public/clips/hero-frames/` and the hero posters
(`hero-service-wardrobe-scrub` OpenSpec change). Kept in-repo so the
generation history and pipeline survive scratchpad cleanup.

## The approved take

- `take14.mp4` — **the approved take** (Seedance 2.0 std, 27cr): neck-only
  left turn, five word-themed outfits each with its own sunglasses, admiring
  profile settle. Start still: `still-kreacje.png` (nano-banana redress of
  `ref-2k-front.png`).
- `take14-final/take14-2k.mp4` — ByteDance 2K upscale (aigc preset) of take 14;
  the actual frame source.
- `take14-final/build/*.webp` — the 60 deployed frames (union-bbox composite,
  1370×1080, SouthEast-anchored). Same content as `public/clips/hero-frames/`.
- Outfit cuts land between frames 15/16, 29/30, 42/43, 48/49
  → `WORD_BOUNDS = [0.246, 0.483, 0.703, 0.805]` in `hero/index.tsx`.

## Rejected takes (iteration history)

`test7` (previous approved clip), `take8` (zoom drift), `take9`/`take11`
(rushed turn), `take10` (body sway, same glasses everywhere — its full
pipeline output is in `take10-final/`), `take12` (middling turn), `take13`
(fast-mode neck-only test). `take*-sheet.png` / `take*-tail.png` /
`take14-glasses.png` are the per-take review contact sheets.

## Matting decision

`modeltest/` holds the tool comparison on frame 010: u2net (gray halo —
rejected), isnet-general-use (halo), diff-matte from Higgsfield's video
remover (breaks on dark clothing), Higgsfield image remover (reference,
1 credit/frame), **bria-rmbg / RMBG 2.0 (matches the reference, free —
chosen)**. See `cmp-bria-010.png`, `cmp3-010.png`.

## Regenerating the frames

Intermediates (extracted PNGs, mattes) are gitignored; rebuild them:

```sh
ffmpeg -i take14-final/take14-2k.mp4 -vf fps=10 -frames:v 60 frame-%03d.png
REMBG_MODEL=bria-rmbg python3.11 matte.py frame-0*.png   # needs rembg + ~1GB model
python3.11 decontam.py frame-NNN.matte.png out.png 1     # per frame: edge color
                                                         # decontam + 1px erode
                                                         # (kills the gray halo)
./composite-union.sh                                      # union bbox -> 1370x1080 webp
```

Posters: frame 001 flattened on the brand plum `#913155` (desktop 1370×1080;
mobile = llama-centered 780×820 crop). `hero.mp4` fallback: frames on
`#913155`, 24 fps, smpte170m-tagged (see `lib/scripts/verify-clip-bg.ts`).
