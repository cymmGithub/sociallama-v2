"""Recover alpha from (original, subject-over-black) video frame pair.

nobg = fg*a            (premultiplied over black)
orig = fg*a + bg*(1-a) -> orig - nobg = bg*(1-a) -> a = 1 - (orig-nobg)/bg

bg is the original's smooth gray backdrop; estimate it by inpainting the
subject region from the visible background (large blur extension).
"""

import sys

import cv2
import numpy as np

orig_p, nobg_p, out_p = sys.argv[1], sys.argv[2], sys.argv[3]

orig = cv2.imread(orig_p).astype(np.float64)
nobg = cv2.imread(nobg_p).astype(np.float64)

# rough subject mask: anything the remover kept (luminance over black)
kept = nobg.max(axis=2) > 8

# estimate bg: take orig where subject absent, inpaint the subject hole
bg = orig.copy()
mask = (kept * 255).astype(np.uint8)
mask = cv2.dilate(mask, np.ones((15, 15), np.uint8))
bg = cv2.inpaint(orig.astype(np.uint8), mask, 25, cv2.INPAINT_TELEA).astype(
    np.float64
)
bg = cv2.GaussianBlur(bg, (0, 0), 21)

diff = (orig - nobg).clip(0)
denom = bg.clip(1)
a = 1.0 - (diff / denom)
a = np.median(a, axis=2)  # combine channels robustly
a = a.clip(0, 1)

# solid interior / solid exterior cleanup: keep soft values only near edges
hard_fg = (a > 0.985) & kept
hard_bg = ~kept & (a < 1.0)  # remover said background -> force 0 unless soft edge
a[hard_fg] = 1.0
edge_zone = cv2.dilate(mask, np.ones((9, 9), np.uint8)) > 0
a[~edge_zone] = 0.0

# un-premultiply color from the black-composited plate
a3 = a[..., None]
fg = np.where(a3 > 0.02, nobg / a3.clip(0.02), nobg).clip(0, 255)

out = np.dstack([fg, a * 255]).astype(np.uint8)
cv2.imwrite(out_p, out)
print(out_p)
