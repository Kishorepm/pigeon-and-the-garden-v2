# The Pigeon and the Garden

A pixel-art invitation micro-game. A pigeon carries a note. She says yes. She walks a
road through a garden choosing the shape of the date, and the road ends at a castle.

Twenty-one screens, one tap each, no typing, 82 KB total.

```
Pigeon Garden Invite v2.dc.html   the design canvas — the source of truth for layout
build.py                          converts the canvas into index.html + style.css
index.html                        generated, do not hand-edit
style.css                         generated, do not hand-edit
script.js                         hand-written: state machine, dodge, notify
api/respond.js                    POST -> webhook or Resend
og.png                            1200x630 link preview
assets/                           palette + the pixelate pipeline (see below)
vercel.json                       pins the output directory to the repo root
support.js                        Claude Design's editor runtime — needed to open the
                                  canvas, never shipped and never referenced by the site
.env.example                      the notification env vars
docs/superpowers/specs/           the design spec and the brief sent to Claude Design
```

## Previewing locally

```bash
python devserver.py
```

Serves the repo on http://localhost:8123 with caching switched off. Use this rather
than `python -m http.server`, which answers If-Modified-Since with 304 so the browser
keeps a stale index.html and a rebuild looks like it did nothing.

## Editing

Layout changes go in the **design canvas**, then:

```bash
python build.py
```

`index.html` and `style.css` are generated. Hand-edits to them are lost on the next
build. Behaviour changes go in `script.js`, which the build does not touch.

The build content-hashes the asset URLs, so a redeploy never serves a stale
`script.js` from someone's cache.

## Deploy

```bash
npx vercel --prod
```

No build step at deploy time, no dependencies, no `package.json`. `build.py` is a local
transform you run yourself.

**Before sending, set `SITE` at the top of `build.py`** to the real domain and rebuild —
it is baked into the Open Graph tags, and the link preview is the first thing she sees.

## Env vars

Set **one** of these in Vercel → Project → Settings → Environment Variables.
`WEBHOOK_URL` wins if both are present. Nothing is stored, nothing is tracked.

| Var | Needed when | What |
|---|---|---|
| `WEBHOOK_URL` | Option A | Any endpoint taking `POST { text, choice }` — Slack, Discord, ntfy |
| `RESEND_API_KEY` | Option B | Resend API key |
| `NOTIFY_FROM` | Option B | Verified Resend sender |
| `NOTIFY_TO` | Option B | Your inbox |

With neither set the page still works perfectly — you just do not hear about it.

## What it sends

On the seal: `{ choice: "sealed", picks: {...} }` with every choice she made.
On leaving: `{ choice: "left" }` and nothing else. **Her partial choices are never
transmitted**, and once she has left nothing further is sent.

She can go back from the closing screen and change something, so sealing can happen
more than once. A second seal carries `updated: true` and arrives titled **Updated.**
with "She changed something. The decree now:". Suppressing it would leave him acting
on choices she had already replaced.

## The No button

Three dodges on `pointerdown` (hover does not exist on a phone), then it slumps, stops
moving, and becomes a normal button. Pressing it then asks once, and then it works.

Offsets are clamped to the safe area at runtime. The canvas's fixed offsets assumed a
390px artboard and threw the button 62px off-screen on a 375px phone.

Keyboard and screen-reader users reach a working No on the first press, with no dodging
at all. The joke is for thumbs; it must never become a trap.

## The palette

**The design canvas owns it.** `build.py` lifts `SUNNY` and `RAMPS` out of the canvas
and injects them into `index.html`; `script.js` reads them from `window.__PALETTE__`.
Nothing hand-copies a colour. The canvas rewrote all 23 slots between v1 and v2 and
added `skin`, `hair`, `escA`, `escB` — a hand-copy would have repainted the site in the
old palette the moment she picked the weather.

## assets/

Not used by the running site, which draws everything in CSS. Kept because it builds
`og.png`, and because character sprites will need it.

```bash
python assets/sitepalette.py                 # self-check: reads the canvas palette
python assets/pixelate.py --demo             # self-check
python assets/pixelate.py in.png out.png --width 96 --key
python assets/make_flora.py                  # draw tree + hedge, trim the horizon
python assets/make_vendor.py                 # derive sprites from vendor/ asset packs
python assets/make_og.py                     # rebuild the link preview
```

`make_flora.py` draws the tree and hedge rather than generating them. They are simple
geometry, and diffusion kept putting brown swooshes and cream speckles through the
canopies because it has no notion of "these four greens and nothing else". It also
trims the horizon strip to its treetops and keys the gaps transparent, so the band
silhouettes against the sky instead of hanging over it as a dark slab.

`pixelate.py` turns generated "pixel-art-ish" images into real pixel art: downsample,
snap every colour to the site palette, knock out the magenta sprite backdrop. Re-run
`make_og.py` after any palette change, or the preview and the page disagree.

## Third-party asset packs

`vendor/` and `*.zip` are gitignored. Those licences allow use in a project but not
redistribution of the assets, so the packs stay local and only the small derived
sprites this page actually shows are committed. `assets/make_vendor.py` records which
source file each one came from, and snaps it to the site palette so a borrowed sprite
sits in the same colour world as the drawn ones.

Currently derived: `art-dragon.png`, `art-ruin-tree.png`, `art-ruin-stones.png`,
`art-boulder.png`, `art-crystal.png`.

Scenery is placed by shape, not by hand-picked coordinates, and every build is swept
for scenery landing on top of a figure. That check exists because the rock arch was
once planted squarely on her head.

**Scenery only from the vendor packs. No characters.** Both figures are drawn in CSS,
by choice. The knight and the elf queen were each tried and each pulled: they are
combat sprites carrying shields, swords and staves, they are chibi-proportioned, and
they read far busier than the flat world they stand in. Two drawn figures that match
each other beat one borrowed sprite that matches nothing.

The Dress screen is deliberately NOT swapped to the king sprite. Its whole point is
recolouring his outfit, and a fixed sprite cannot recolour, so that screen keeps the
drawn figure and the mechanic still works.

**On viewpoint.** The garden screens are drawn side-on, so a sprite drawn from above
reads as a mistake there: you would be looking at the top of a sheep's head while
standing beside a hedge. The journey map is different. It is a road receding up the
screen, which is the same three-quarter view most "top-down" packs are drawn in, so
those assets sit correctly on the map even though they would look wrong in the garden.
That is the test to apply before reaching for any new pack.

## Still to do

- Both figures are drawn in CSS. A matched non-combat sprite pair could replace
  them, but only if both arrive together and neither is armed.
- Real copy for the three dates and three hour slots.
- The venue behind each "kind of place" answer.
- Set `SITE` in `build.py` and regenerate.
