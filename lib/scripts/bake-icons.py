#!/usr/bin/env python3
"""Composite social-motif icons onto a cover-art master.

    python3 lib/scripts/bake-icons.py content/media/cover-art/t-227.jpg share star

Every library piece carries one or two of the icons cut from the green-key sheet
(`content/media/cover-art/icons/`), so a piece redrawn without them reads as the
odd one out in the hub grid.

Placement is computed, never hand-tuned. Build a mask of "is this pixel the flat
ground", then accept only a slot whose whole footprint PLUS a margin is ground —
an icon therefore cannot land on the llama, a prop or a panel. Slots are scored
by proximity to the subject centroid: scoring by distance from centre instead
pins every icon to a safe-box corner and reads as UI chrome bolted on. Where a
busy composition leaves no room the icon shrinks rather than the ground
tolerance loosening, because loosening it is exactly what would let an icon land
on a pale part of the llama.
"""

import sys
from pathlib import Path

import numpy as np
from PIL import Image

ICON_DIR = Path("content/media/cover-art/icons")
SIZES = (168, 142, 118)  # longest side, in master pixels; shrink before loosening
GROUND_TOL = 30.0  # RGB distance still counted as ground
MARGIN = 0.18  # clear ground required around the footprint, as a fraction
SAFE_W, SAFE_H = 0.83, 0.84  # keep icons inside every live crop
STEP = 16


def ground_mask(a: np.ndarray) -> tuple[np.ndarray, np.ndarray]:
    ring = np.concatenate([a[:60].reshape(-1, 3), a[-60:].reshape(-1, 3)])
    src = np.median(ring, axis=0)
    dist = np.sqrt(((a - src) ** 2).sum(axis=2))
    return dist < GROUND_TOL, src


def place(free: np.ndarray, centroid: tuple[float, float], w: int, h: int):
    """Best (x, y) whose footprint+margin is entirely free, nearest the subject."""
    H, W = free.shape
    mx, my = int(w * MARGIN), int(h * MARGIN)
    bw, bh = w + 2 * mx, h + 2 * my
    if bw >= W or bh >= H:
        return None

    # Integral image of "blocked", so a box is testable in O(1).
    blocked = np.cumsum(np.cumsum((~free).astype(np.int32), axis=0), axis=1)
    blocked = np.pad(blocked, ((1, 0), (1, 0)))

    x0, x1 = int(W * (1 - SAFE_W) / 2), int(W - W * (1 - SAFE_W) / 2 - bw)
    y0, y1 = int(H * (1 - SAFE_H) / 2), int(H - H * (1 - SAFE_H) / 2 - bh)
    cy, cx = centroid

    best, best_d = None, None
    for y in range(y0, max(y0 + 1, y1), STEP):
        for x in range(x0, max(x0 + 1, x1), STEP):
            total = (
                blocked[y + bh, x + bw]
                - blocked[y, x + bw]
                - blocked[y + bh, x]
                + blocked[y, x]
            )
            if total:
                continue
            d = ((y + bh / 2) - cy) ** 2 + ((x + bw / 2) - cx) ** 2
            if best_d is None or d < best_d:
                best, best_d = (x + mx, y + my), d
    return best


def main(master: str, names: list[str]) -> None:
    base = Image.open(master).convert("RGB")
    a = np.asarray(base).astype(np.float64)
    free, _ = ground_mask(a)

    ys, xs = np.nonzero(~free)
    centroid = (ys.mean(), xs.mean())

    out = base.copy()
    for name in names:
        icon = Image.open(ICON_DIR / f"{name}.png").convert("RGBA")
        for size in SIZES:
            scale = size / max(icon.size)
            w, h = max(1, round(icon.width * scale)), max(1, round(icon.height * scale))
            spot = place(free, centroid, w, h)
            if spot is None:
                continue
            x, y = spot
            out.paste(icon.resize((w, h), Image.LANCZOS), (x, y), icon.resize((w, h), Image.LANCZOS))
            # An icon is not ground for whatever is placed next.
            free[y : y + h, x : x + w] = False
            print(f"  {name}: {w}x{h} at ({x}, {y})")
            break
        else:
            print(f"  {name}: no slot with clear ground — skipped")

    out.save(master, quality=92, subsampling=0)
    print(f"{master}: {len(names)} icon(s) baked")


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2:])
