"""Rebuild og.png from the generated pigeon, quantised to the CURRENT site palette.

    python assets/make_og.py

The palette is read out of the design canvas, not hard-coded — the canvas rewrites
every colour between revisions, and a preview in last week's palette looks like a
different site than the one the link opens.
"""
import pathlib
import sys

from PIL import Image

from sitepalette import colours, palette_image, rgb

ROOT = pathlib.Path(__file__).parent.parent
CANVAS = ROOT / "Pigeon Garden Invite v2.dc.html"
SRC = ROOT / "assets" / "raw" / "og.png"
OUT = ROOT / "og.png"

W, H = 1200, 630          # the Open Graph standard
BLOCKS = 150              # real pixel columns before upscaling


def main():
    if not SRC.exists():
        sys.exit(f"missing {SRC} — the generated pigeon")

    pal = colours()
    pal_img = palette_image(pal)

    im = Image.open(SRC).convert("RGB")
    small = im.resize((BLOCKS, round(BLOCKS * im.height / im.width)), Image.Resampling.BOX)
    small = small.quantize(palette=pal_img, dither=Image.Dither.NONE).convert("RGB")
    big = small.resize((W, round(W * small.height / small.width)), Image.Resampling.NEAREST)

    canvas = Image.new("RGB", (W, H), pal.get("sky", "#a8d8e0"))
    canvas.paste(big, (0, (H - big.height) // 2))
    canvas.save(OUT, optimize=True)

    used = {p[1] for p in canvas.getcolors(maxcolors=99999)}
    allowed = {rgb(v) for v in pal.values()}
    stray = used - allowed
    assert not stray, f"colours escaped the site palette: {stray}"
    print(f"og.png  {W}x{H}  {len(used)} colours from {len(pal)}-slot site palette  "
          f"{OUT.stat().st_size / 1024:.1f} KB")


if __name__ == "__main__":
    main()
