#!/usr/bin/env python3
"""Generate solid-colour placeholder product images (pure stdlib).

These stand in for real product photography (issue 003). One distinct colour
per category, two shades per category. Written as valid PNG bytes under the
.jpg filenames the seed references; browsers content-sniff images, so they
render regardless of the extension.
"""
import os
import struct
import zlib

OUT = os.path.join(
    os.path.dirname(os.path.abspath(__file__)),
    "..", "frontend", "public", "images",
)

# prefix -> base RGB; the seed uses <prefix>-1.jpg and <prefix>-2.jpg.
CATEGORIES = {
    "hoodie": (54, 57, 64),
    "tee": (203, 207, 214),
    "cargo": (120, 108, 82),
    "sneaker": (43, 94, 122),
    "cap": (158, 64, 64),
    "bag": (92, 74, 120),
}


def write_png(path, rgb, w=400, h=400):
    def chunk(typ, data):
        body = typ + data
        return struct.pack(">I", len(data)) + body + struct.pack(">I", zlib.crc32(body) & 0xFFFFFFFF)

    sig = b"\x89PNG\r\n\x1a\n"
    ihdr = struct.pack(">IIBBBBB", w, h, 8, 2, 0, 0, 0)  # 8-bit RGB
    row = b"\x00" + bytes(rgb) * w
    idat = zlib.compress(row * h, 9)
    with open(path, "wb") as f:
        f.write(sig + chunk(b"IHDR", ihdr) + chunk(b"IDAT", idat) + chunk(b"IEND", b""))


def main():
    os.makedirs(OUT, exist_ok=True)
    for prefix, (r, g, b) in CATEGORIES.items():
        for n in (1, 2):
            # second variant a touch lighter so the two differ
            shift = 0 if n == 1 else 22
            rgb = (min(r + shift, 255), min(g + shift, 255), min(b + shift, 255))
            write_png(os.path.join(OUT, f"{prefix}-{n}.jpg"), rgb)
    print("wrote", 2 * len(CATEGORIES), "images to", os.path.normpath(OUT))


if __name__ == "__main__":
    main()
