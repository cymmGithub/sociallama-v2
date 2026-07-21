import sys, os
from rembg import remove, new_session
from PIL import Image

# isnet-general-use gives cleaner edges on fur than u2net
session = new_session(os.environ.get("REMBG_MODEL", "isnet-general-use"))

for path in sys.argv[1:]:
    img = Image.open(path).convert("RGBA")
    out = remove(img, session=session)
    base, _ = os.path.splitext(path)
    outp = base + ".matte.png"
    out.save(outp)
    print(outp)
