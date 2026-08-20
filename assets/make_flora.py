"""Draw the foliage sprites directly, in the site palette.

    python assets/make_flora.py

A round tree and a hedge are simple geometry. Diffusion kept putting brown swooshes
and cream speckles through the canopies, because it has no notion of "these four
greens and nothing else". Drawing them is smaller, deterministic, exactly on
palette, and it costs nothing to re-run when the palette changes.

Also trims the generated horizon strip down to its canopy, so the dark filler
above the treetops never shows.
"""
import pathlib
import sys

from PIL import Image, ImageDraw

from sitepalette import colours, rgb

ROOT = pathlib.Path(__file__).parent.parent
HORIZON_SRC = ROOT / "art-horizon.png"


def tone(pal, name, fallback):
    return rgb(pal.get(name, fallback))


def draw_tree(pal, w=72, h=88):
    ink = tone(pal, "ink", "#241a10")
    dark = tone(pal, "forest", "#26492f")
    mid = tone(pal, "moss", "#4f8040")
    light = tone(pal, "leaf", "#7cb14f")
    bark = tone(pal, "wood", "#7a4a26")
    barkhi = tone(pal, "woodHi", "#96603a")

    im = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)

    trunk_w, trunk_h = 12, 26
    tx = (w - trunk_w) // 2
    d.rectangle([tx, h - trunk_h, tx + trunk_w - 1, h - 1], fill=bark, outline=ink, width=2)
    d.rectangle([tx + 3, h - trunk_h + 3, tx + 5, h - 4], fill=barkhi)

    pad = 3
    cy_bottom = h - trunk_h + 6
    d.ellipse([pad, pad, w - pad - 1, cy_bottom], fill=dark, outline=ink, width=2)
    # Light falls from the upper left, so the highlights stack that way.
    d.ellipse([pad + 6, pad + 5, w - pad - 12, cy_bottom - 12], fill=mid)
    d.ellipse([pad + 10, pad + 8, w // 2 + 4, cy_bottom - 26], fill=light)
    return im


def draw_hedge(pal, w=72, h=52):
    ink = tone(pal, "ink", "#241a10")
    dark = tone(pal, "forest", "#26492f")
    mid = tone(pal, "moss", "#4f8040")
    light = tone(pal, "leaf", "#7cb14f")

    im = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)

    # A mound: one wide ellipse, flat-bottomed so it sits on the ground.
    d.ellipse([1, 4, w - 2, h * 2 - 6], fill=dark, outline=ink, width=2)
    d.rectangle([1, h - 8, w - 2, h - 1], fill=dark, outline=ink, width=2)
    d.ellipse([7, 9, w - 14, h - 6], fill=mid)
    d.ellipse([12, 12, w // 2 + 6, h - 20], fill=light)
    return im.crop((0, 0, w, h))


def trim_horizon():
    """Keep the canopy, drop the dark filler above it.

    The generator fills everything above the treetops with the darkest green. Left
    in, that reads as a dark band hanging over the horizon instead of trees.
    """
    if not HORIZON_SRC.exists():
        print("  (no art-horizon.png yet — skipped)")
        return
    im = Image.open(HORIZON_SRC).convert("RGB")
    px = im.load()
    # The filler is whatever colour the top-left corner is — not the darkest colour
    # in the image, which is usually the outline ink and appears everywhere.
    filler_colour = px[0, 0]

    # First row from the top where the image stops being (almost) all filler.
    first = 0
    for y in range(im.height):
        filler = sum(1 for x in range(im.width) if px[x, y] == filler_colour)
        if filler < im.width * 0.72:
            first = y
            break
    first = max(0, first - 2)
    out = im.crop((0, first, im.width, im.height)).convert("RGBA")

    # The filler between the treetops has to go transparent, not stay dark — the
    # strip is a silhouette against the sky, and opaque gaps read as blobs
    # hanging over the horizon.
    px2 = out.load()
    cleared = 0
    for y in range(out.height):
        for x in range(out.width):
            if px2[x, y][:3] == filler_colour:
                px2[x, y] = (0, 0, 0, 0)
                cleared += 1
    out.save(HORIZON_SRC)
    print(f"  horizon trimmed {first}px, cleared {cleared} filler px "
          f"-> {out.width}x{out.height}")


def main():
    pal = colours()
    tree = draw_tree(pal)
    hedge = draw_hedge(pal)
    tree.save(ROOT / "art-tree.png")
    hedge.save(ROOT / "art-hedge.png")

    allowed = {rgb(v) for v in pal.values()}
    for name, im in (("tree", tree), ("hedge", hedge)):
        used = {p[:3] for p in im.get_flattened_data() if p[3] > 0}
        stray = used - allowed
        assert not stray, f"{name} used colours outside the palette: {stray}"
        print(f"  {name:6} {im.size[0]}x{im.size[1]}  {len(used)} palette colours")

    trim_horizon()


if __name__ == "__main__":
    main()
