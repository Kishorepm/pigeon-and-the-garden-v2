"""Draw the throne and the wax seal directly, in the site palette.

    python assets/make_regalia.py

Same reasoning as make_flora.py: these are simple geometry, and a generator has
no notion of "these four colours and nothing else". Drawn, they are deterministic,
exactly on palette, and free to re-run whenever the canvas rewrites a colour.

The seal is the last thing she touches and the throne is the last thing she sees,
so they were the two sprites least able to afford being approximate.
"""
import pathlib
import sys

from PIL import Image, ImageDraw

from sitepalette import colours, rgb

ROOT = pathlib.Path(__file__).parent.parent


def tone(pal, name, fallback):
    return rgb(pal.get(name, fallback))


def draw_throne(pal, w=84, h=116):
    """The gilded one. Gold frame, terracotta upholstery, a crest on top.

    The old sprite was a flat slab: the back, seat and legs were one silhouette,
    so at the size it actually renders it read as a wardrobe. This separates the
    three so the shape survives being 168px wide behind a dog.
    """
    ink = tone(pal, "ink", "#241a10")
    gold = tone(pal, "honey", "#eeb63c")
    deep = tone(pal, "wood", "#7a4a26")
    cloth = tone(pal, "terra", "#c25f2e")
    shade = tone(pal, "stoneDark", "#5f5340")
    lit = tone(pal, "cream", "#f6e7c4")

    im = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)

    # Backrest: gold frame, cloth panel, stepped shoulders instead of a flat top
    # so the silhouette is not a rectangle.
    d.rectangle([18, 10, 65, 74], fill=gold, outline=ink, width=3)
    d.rectangle([26, 4, 57, 12], fill=gold, outline=ink, width=3)
    d.rectangle([24, 18, 59, 62], fill=cloth, outline=ink, width=2)
    # Ornament: three lozenges down the panel. This started as a vertical band
    # with a crossbar, which at 168px wide read unmistakably as a crucifix — not
    # the association a date invitation wants, and not in the brief.
    cx = 41
    for cy, r in ((28, 7), (40, 9), (52, 7)):
        d.polygon([(cx, cy - r), (cx + r, cy), (cx, cy + r), (cx - r, cy)], fill=gold)
    # Crest.
    d.rectangle([37, 0, 46, 6], fill=gold, outline=ink, width=2)

    # Armrests, set forward of the back so the chair has depth.
    for x in (8, 62):
        d.rectangle([x, 56, x + 13, 66], fill=gold, outline=ink, width=2)
        d.rectangle([x + 3, 66, x + 10, 78], fill=deep, outline=ink, width=2)

    # Seat.
    d.rectangle([12, 72, 71, 88], fill=gold, outline=ink, width=3)
    d.rectangle([18, 76, 65, 84], fill=cloth)
    d.rectangle([12, 86, 71, 89], fill=shade)

    # Legs and the shadow they stand in.
    for x in (17, 57):
        d.rectangle([x, 88, x + 10, 108], fill=deep, outline=ink, width=2)
        d.rectangle([x - 2, 106, x + 12, 113], fill=gold, outline=ink, width=2)
    d.rectangle([10, 112, 73, 115], fill=shade)

    # One highlight, top left, so the gold reads as metal rather than paint.
    # Kept to the frame's own width — a full-height cream bar read as a plank
    # leaning against the chair.
    d.rectangle([21, 14, 22, 44], fill=lit)
    return im


def draw_seal(pal, size=72):
    """Wax, pressed. Round, uneven at the rim, with drips at the bottom.

    It carries "PRESS" / "SEALED" in ink on top of it, so the middle stays flat
    and light — an emblem in the centre would fight the only word on the screen.
    """
    ink = tone(pal, "ink", "#241a10")
    wax = tone(pal, "terra", "#c25f2e")
    dark = tone(pal, "rust", "#8c3030") if "rust" in pal else tone(pal, "wood", "#7a4a26")
    lit = tone(pal, "rose", "#dc8f79")

    im = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)

    pad = 4
    d.ellipse([pad, pad, size - pad - 1, size - pad - 9], fill=wax, outline=ink, width=3)
    # Drips. Wax that stopped where it stopped, not a circle with feet.
    for cx, r, drop in ((22, 5, 8), (37, 7, 12), (52, 4, 6)):
        d.ellipse([cx - r, size - 20, cx + r, size - 20 + drop], fill=wax, outline=ink, width=2)
    # Re-seat the body over the drip outlines so they read as one poured blob.
    d.ellipse([pad + 2, pad + 2, size - pad - 3, size - pad - 11], fill=wax)

    # A pressed rim: darker just inside the edge, lighter at the top left.
    d.ellipse([pad + 5, pad + 5, size - pad - 6, size - pad - 14], outline=dark, width=2)
    d.arc([pad + 3, pad + 3, size - pad - 4, size - pad - 12], 190, 260, fill=lit, width=3)
    # Notches, so the rim is not a perfect machine circle.
    for x, y in ((14, 18), (56, 24), (20, 48), (50, 46)):
        d.rectangle([x, y, x + 2, y + 2], fill=dark)
    return im


TARGETS = [("art-throne-gilded.png", draw_throne), ("art-seal.png", draw_seal)]


def demo():
    """Self-check: every pixel drawn must come from the canvas palette."""
    pal = colours()
    allowed = {rgb(v) for v in pal.values()}
    for name, fn in TARGETS:
        im = fn(pal)
        used = {px[:3] for _, px in im.getcolors(1 << 24) if px[3] > 0}
        stray = used - allowed
        assert not stray, f"{name} used {len(stray)} colours not in the palette: {sorted(stray)[:4]}"
        assert im.size[0] > 32 and im.size[1] > 32, f"{name} is suspiciously small"
    print(f"ok — {len(TARGETS)} sprites, every pixel on palette")


def main():
    if "--demo" in sys.argv:
        demo()
        return
    pal = colours()
    for name, fn in TARGETS:
        out = ROOT / name
        fn(pal).save(out, optimize=True)
        print(f"  wrote {name}")
    demo()


if __name__ == "__main__":
    main()
