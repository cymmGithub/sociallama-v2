"""Edge color decontamination for mattes: keep alpha, replace semi-transparent
edge pixels' RGB with the color of the nearest fully-opaque pixel, so the
gray-studio blend in the edge can't halo on the plum ground.

Usage: decontam.py in.matte.png out.png [erode_px]
"""

import sys

import cv2
import numpy as np

inp, outp = sys.argv[1], sys.argv[2]
erode_px = int(sys.argv[3]) if len(sys.argv) > 3 else 0

img = cv2.imread(inp, cv2.IMREAD_UNCHANGED)
bgr, a = img[..., :3], img[..., 3]

opaque = (a > 242).astype(np.uint8)  # ~0.95
# nearest-opaque lookup via distance transform labels
dist, labels = cv2.distanceTransformWithLabels(
    1 - opaque, cv2.DIST_L2, 5, labelType=cv2.DIST_LABEL_PIXEL
)
# label -> coordinates of that opaque pixel
idx = np.zeros(labels.max() + 1, dtype=np.int64)
flat_labels = labels[opaque.astype(bool)]
flat_pos = np.flatnonzero(opaque.ravel())
idx[flat_labels] = flat_pos
nearest = idx[labels].ravel()
donor = bgr.reshape(-1, 3)[nearest].reshape(bgr.shape)

edge = (a > 0) & (a <= 242)
out_bgr = bgr.copy()
out_bgr[edge] = donor[edge]

out_a = a.copy()
if erode_px > 0:
    k = np.ones((2 * erode_px + 1, 2 * erode_px + 1), np.uint8)
    out_a = cv2.erode(a, k)

cv2.imwrite(outp, np.dstack([out_bgr, out_a]))
print(outp)
