"""Download Pixelify Sans from Google Fonts and vendor it into fonts/.

    python assets/fetch_font.py

Why self-host at all: the Google Fonts stylesheet is a RENDER-BLOCKING request to
a third party. It costs a DNS lookup, a TLS handshake and a round trip before the
first paint of a page whose whole job is a first impression — and it tells Google
the IP and user-agent of the one person this site was built for, which sits badly
next to "nothing is stored, nothing is tracked".

Vendored, the font is two files served from the same origin as the page.

Only the weights the site actually uses are fetched (see WEIGHTS), and only the
latin subsets — the copy is English. Re-run this if the design ever starts using
a weight that is not listed here; build.py fails the build if a face is missing.
"""
import pathlib
import re
import sys
import urllib.request

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "fonts"

FAMILY = "Pixelify Sans"
# 400 is every unweighted run of text, 600 is the buttons and headings, 700 is
# the one bold line. 500 is in the family and used nowhere, so it is not fetched.
WEIGHTS = [400, 600, 700]
SUBSETS = ["latin", "latin-ext"]

# Google serves a different stylesheet per user-agent. Ask as a modern browser or
# it answers with the TTF fallback sheet instead of woff2.
UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36")


def get(url, binary=False):
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=30) as r:
        data = r.read()
    return data if binary else data.decode("utf-8")


def main():
    api = ("https://fonts.googleapis.com/css2?family="
           + FAMILY.replace(" ", "+")
           + ":wght@" + ";".join(str(w) for w in WEIGHTS)
           + "&display=swap")
    css = get(api)

    # Each @font-face block is preceded by a /* subset */ comment.
    blocks = re.findall(
        r"/\*\s*([\w-]+)\s*\*/\s*@font-face\s*\{(.*?)\}", css, re.S)
    if not blocks:
        sys.exit("could not parse the Google Fonts stylesheet — format changed?")

    OUT.mkdir(exist_ok=True)
    faces, seen = [], set()

    for subset, body in blocks:
        if subset not in SUBSETS:
            continue
        weight = re.search(r"font-weight:\s*(\d+)", body)
        src = re.search(r"url\((https://[^)]+\.woff2)\)", body)
        rng = re.search(r"unicode-range:\s*([^;]+);", body)
        if not (weight and src and rng):
            continue
        weight = int(weight.group(1))
        if weight not in WEIGHTS:
            continue

        name = f"pixelify-{weight}-{subset}.woff2"
        path = OUT / name
        if name not in seen:
            path.write_bytes(get(src.group(1), binary=True))
            seen.add(name)
            print(f"  {name}  {path.stat().st_size / 1024:.1f} KB")

        faces.append(
            "@font-face{font-family:'Pixelify Sans';font-style:normal;"
            f"font-weight:{weight};font-display:swap;"
            f"src:url(/fonts/{name}) format('woff2');"
            f"unicode-range:{rng.group(1).strip()}}}"
        )

    missing = set(WEIGHTS) - {int(re.search(r"font-weight:(\d+)", f).group(1)) for f in faces}
    if missing:
        sys.exit(f"weights not returned by Google Fonts: {sorted(missing)}")

    (OUT / "pixelify.css").write_text("\n".join(faces) + "\n", encoding="utf-8")
    total = sum(p.stat().st_size for p in OUT.glob("*.woff2"))
    print(f"wrote fonts/pixelify.css and {len(seen)} woff2 files ({total / 1024:.1f} KB total)")


if __name__ == "__main__":
    main()
