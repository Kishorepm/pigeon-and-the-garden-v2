"""Turn generated 'pixel-art-ish' images into actual pixel art on the site palette.

Generators produce high-resolution pictures that merely look pixelated: soft edges,
drifting colour counts, no consistent grid. This fixes all three.

    python assets/pixelate.py in.png out.png --width 96
    python assets/pixelate.py sprite.png duck.png --width 32 --key
    python assets/pixelate.py --demo

--key removes the flat magenta backdrop used to isolate sprites.
"""
import argparse
import pathlib
import sys

from PIL import Image, ImageChops

from sitepalette import colours, palette_image, rgb

KEY_COLOUR = (255, 0, 255)  # magenta backdrop on generated sprites
KEY_TOLERANCE = 60          # generators never return exactly #ff00ff


def _key_mask(img, tolerance=KEY_TOLERANCE):
    """Alpha mask: 0 where the pixel is near the key colour, 255 elsewhere.

    Channel ops rather than a Python pixel loop — this runs on 1024x1024 sources.
    """
    kr, kg, kb = KEY_COLOUR
    r, g, b = img.convert("RGB").split()
    near = ImageChops.multiply(
        ImageChops.multiply(
            r.point(lambda v: 255 if abs(v - kr) < tolerance else 0),
            g.point(lambda v: 255 if abs(v - kg) < tolerance else 0),
        ),
        b.point(lambda v: 255 if abs(v - kb) < tolerance else 0),
    )
    return ImageChops.invert(near)


def pixelate(src, width, key=False):
    """Downsample to `width` px, then snap every colour to the site palette.

    When keying, the subject is cropped to its own bounds FIRST. Generators centre
    a small object in a large frame; downsampling that whole frame spends the
    pixel budget on empty background and leaves a six-pixel smudge.
    """
    img = Image.open(src).convert("RGB")

    if key:
        full = _key_mask(img)
        box = full.getbbox()
        if box:
            pad = 2
            box = (max(0, box[0] - pad), max(0, box[1] - pad),
                   min(img.width, box[2] + pad), min(img.height, box[3] + pad))
            img = img.crop(box)

    height = max(1, round(img.height * width / img.width))
    # BOX averages before snapping — NEAREST here just picks noisy single pixels.
    small = img.resize((width, height), Image.Resampling.BOX)

    mask = _key_mask(small) if key else None
    if mask is not None:
        # Averaging blends subject and backdrop at the edges; anything still
        # leaning toward the key colour is backdrop, not outline.
        mask = mask.point(lambda v: 255 if v > 128 else 0)

    snapped = small.quantize(
        palette=palette_image(), dither=Image.Dither.NONE
    ).convert("RGB")

    if mask is None:
        return snapped
    out = snapped.convert("RGBA")
    out.putalpha(mask)
    return out


def demo():
    pal = list(colours().values())
    assert len(pal) >= 16

    # A gradient plus a magenta corner: exercises snapping and keying together.
    probe = Image.new("RGB", (64, 64))
    px = probe.load()
    for y in range(64):
        for x in range(64):
            px[x, y] = KEY_COLOUR if (x < 16 and y < 16) else (x * 4, y * 4, 128)

    tmp = pathlib.Path(__file__).with_name("_probe.png")
    probe.save(tmp)
    try:
        out = pixelate(tmp, width=16, key=True)
        assert out.size == (16, 16), out.size
        assert out.mode == "RGBA"

        allowed = {rgb(h) for h in pal}
        opaque = [p for p in out.getdata() if p[3] > 0]
        stray = {p[:3] for p in opaque} - allowed
        assert not stray, f"colours escaped the palette: {stray}"
        assert any(p[3] == 0 for p in out.getdata()), "magenta was not keyed out"

        flat = pixelate(tmp, width=16)
        assert flat.mode == "RGB", "no --key means no alpha channel"
    finally:
        tmp.unlink(missing_ok=True)
    print("ok")


if __name__ == "__main__":
    if "--demo" in sys.argv:
        demo()
        raise SystemExit

    ap = argparse.ArgumentParser()
    ap.add_argument("src")
    ap.add_argument("dst")
    ap.add_argument("--width", type=int, required=True, help="target width in real pixels")
    ap.add_argument("--key", action="store_true", help="knock out the magenta backdrop")
    a = ap.parse_args()

    result = pixelate(a.src, a.width, a.key)
    result.save(a.dst)
    print(f"{a.src} -> {a.dst}  {result.size[0]}x{result.size[1]}  {result.mode}")
