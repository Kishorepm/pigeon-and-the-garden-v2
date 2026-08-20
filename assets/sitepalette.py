"""The site's colours, read from the design canvas.

The canvas is the single source of truth. It rewrites every colour between
revisions and adds slots (skin, hair, escA, escB appeared in v2), so anything that
hard-codes a copy drifts silently and produces art that does not match the page.

    from sitepalette import colours, palette_image
"""
import pathlib
import re
import sys

from PIL import Image

CANVAS = pathlib.Path(__file__).parent.parent / "Pigeon Garden Invite v2.dc.html"


def colours():
    """{'ink': '#241a10', ...} in the order the canvas declares them."""
    text = CANVAS.read_text(encoding="utf-8")
    root = re.search(r":root\{(.*?)\}", text, re.S)
    if not root:
        sys.exit(f"could not find :root in {CANVAS.name}")
    found = re.findall(r"--(\w+):(#[0-9a-fA-F]{6})", root.group(1))
    if not found:
        sys.exit("no colours found in :root")
    return dict(found)


def rgb(hex_colour):
    h = hex_colour.lstrip("#")
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


def palette_image(pal=None):
    """A 256-entry P-mode image for Image.quantize().

    The unused slots repeat the darkest real colour rather than being padded with
    black. Padding with (0,0,0) puts pure black in the palette, and the quantiser
    will happily snap dark outlines onto it, letting a colour that is not in the
    palette out the other side.
    """
    pal = pal or colours()
    flat = []
    for v in pal.values():
        flat += list(rgb(v))
    darkest = min(pal.values(), key=lambda v: sum(rgb(v)))
    img = Image.new("P", (1, 1))
    img.putpalette(flat + list(rgb(darkest)) * (256 - len(pal)))
    return img


def demo():
    pal = colours()
    assert len(pal) >= 16, f"suspiciously small palette: {len(pal)}"
    assert all(re.fullmatch(r"#[0-9a-f]{6}", v) for v in pal.values())
    # Slots may legitimately share a colour — the canvas points escA at terra.
    # What matters is the distinct count the quantiser actually gets.
    assert len(set(pal.values())) >= 12, "too few distinct colours to draw with"
    for expected in ("ink", "sky", "cream"):
        assert expected in pal, f"missing core slot {expected}"
    assert palette_image(pal).mode == "P"
    print(f"ok — {len(pal)} slots: {', '.join(list(pal)[:6])}…")


if __name__ == "__main__":
    demo()
