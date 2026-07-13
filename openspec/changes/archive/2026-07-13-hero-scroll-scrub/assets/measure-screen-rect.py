"""Locate the screen rect by flood-filling from the screen center."""
import pathlib
from collections import deque
from PIL import Image

d = pathlib.Path(__file__).parent
SCALE = 4

for name in ("tv-trim-1.png", "tv-trim-2.png"):
    im = Image.open(d / name).convert("RGBA")
    W, H = im.size
    small = im.resize((W // SCALE, H // SCALE))
    w, h = small.size
    px = small.load()

    # Seed at the visual center of the glass (screen sits left-of-center,
    # below the antenna).
    sx, sy = int(w * 0.34), int(h * 0.58)
    seed = px[sx, sy]

    def close(c, tol=42):
        return (abs(c[0] - seed[0]) < tol and abs(c[1] - seed[1]) < tol
                and abs(c[2] - seed[2]) < tol and c[3] > 200)

    seen = {(sx, sy)}
    q = deque([(sx, sy)])
    xs, ys = [sx], [sy]
    while q:
        x, y = q.popleft()
        for nx, ny in ((x+1, y), (x-1, y), (x, y+1), (x, y-1)):
            if 0 <= nx < w and 0 <= ny < h and (nx, ny) not in seen:
                seen.add((nx, ny))
                if close(px[nx, ny]):
                    xs.append(nx)
                    ys.append(ny)
                    q.append((nx, ny))

    x0, x1 = min(xs) * SCALE, max(xs) * SCALE
    y0, y1 = min(ys) * SCALE, max(ys) * SCALE
    print(f"{name}: {W}x{H}  seed rgba {seed}")
    print(f"  screen px: x {x0}-{x1}, y {y0}-{y1}  ({x1-x0}x{y1-y0})")
    print(f"  css %: left {x0/W*100:.2f}%  top {y0/H*100:.2f}%  "
          f"width {(x1-x0)/W*100:.2f}%  height {(y1-y0)/H*100:.2f}%")
    print(f"  screen aspect: {(x1-x0)/(y1-y0):.3f}")
