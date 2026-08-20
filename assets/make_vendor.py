"""Derive the sprites we use from the third-party asset packs in vendor/.

    python assets/make_vendor.py

The packs themselves are gitignored: their licences permit use in a project but
not redistribution of the assets, so only the small derived sprites this page
actually shows get committed. This script records exactly which source file each
one came from, so the provenance is not folklore.

Everything is cropped to its subject and snapped to the site palette, so a
borrowed sprite sits in the same colour world as the drawn ones.
"""
import pathlib
import sys

from PIL import Image

from sitepalette import colours, palette_image, rgb

ROOT = pathlib.Path(__file__).parent.parent
VENDOR = ROOT / "vendor"

# (output name, source path inside vendor/, target width)
#
# On viewpoint: the garden screens are side-on, so a sprite drawn from above
# reads as a mistake there. The journey map is not side-on though. It is a road
# receding up the screen, which is the same three-quarter view these ruins are
# drawn in, so they sit on the map correctly even though they would look wrong
# in the garden.
SPRITES = [
    ("art-dragon.png",
     "dragonspack1_sd/SD/crimson_dragon.png",
     72),
    ("art-ruin-tree.png",
     "craftpix-net-934618-free-top-down-ruins-pixel-art/PNG/Assets/Blue-gray_ruins1.png",
     62),
    ("art-crystal.png",
     "craftpix-net-106469-top-down-crystals-pixel-art/PNG/Assets/Green_crystal1.png",
     44),
    ("art-boulder.png",
     "craftpix-net-934618-free-top-down-ruins-pixel-art/PNG/Assets/Brown_ruins5.png",
     52),
    ("art-ruin-stones.png",
     "craftpix-net-934618-free-top-down-ruins-pixel-art/PNG/Assets/Brown_ruins4.png",
     46),
    # No characters from the vendor packs. The knight and the elf were both tried
    # and both pulled: they are combat sprites carrying shields, swords and staves,
    # and they read busier than the flat world they stand in. Both figures are
    # drawn. Scenery only from here.
]


def convert(src, width):
    im = Image.open(src).convert("RGBA")
    box = im.getchannel("A").getbbox()          # crop to the subject
    if box:
        im = im.crop(box)
    height = max(1, round(im.height * width / im.width))
    small = im.resize((width, height), Image.Resampling.BOX)

    out = small.convert("RGB").quantize(
        palette=palette_image(), dither=Image.Dither.NONE
    ).convert("RGBA")
    # Averaging softens the edge; anything half-transparent is background.
    out.putalpha(small.getchannel("A").point(lambda v: 255 if v > 128 else 0))
    return out


def main():
    if not VENDOR.exists():
        sys.exit("vendor/ is missing. Unzip the asset packs into it first.")

    allowed = {rgb(v) for v in colours().values()}
    for name, rel, width in SPRITES:
        src = VENDOR / rel
        if not src.exists():
            sys.exit(f"missing source: {src}")
        out = convert(src, width)
        out.save(ROOT / name)

        used = {p[:3] for p in out.get_flattened_data() if p[3] > 0}
        stray = used - allowed
        assert not stray, f"{name} escaped the palette: {stray}"
        solid = sum(1 for p in out.get_flattened_data() if p[3] > 0)
        print(f"  {name:16} {out.size[0]}x{out.size[1]:<4} {len(used):>2} colours  "
              f"{100 * solid / (out.width * out.height):3.0f}% solid   <- {rel}")


if __name__ == "__main__":
    main()
