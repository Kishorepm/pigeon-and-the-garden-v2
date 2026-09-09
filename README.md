## Current preview: the connected kingdom (10 September 2026)

The complete Stop 02 journey continues the approved Phaser slice. Open `http://localhost:8124/slice.html` or the built home page. Author `slice.html`, `slice.css`, `slice-world.js`, `chapter-world.js`, `chapter-story.js`, `chapter-cinema.js` and `chapter-model.js`. Run `python build.py` to publish that entry into this worktree's `index.html`.

Pigeon invitation → knight arrival → crossroads → lookout day/time → inn food ideas → home → knight departure → pigeon reply. Optional visits include the pets, Ambury memories and kingdom overview. The inherited throne is already earned; the crown arrives only after the real second date.

See [chapter operation and verification](docs/CONNECTED-KINGDOM.md) for updating the same invitation with actual itinerary details and the later memory. Local previews save drafts and never notify anyone. The live endpoint must have notification configuration; failures offer retry or copying the plan.

Tests: `node --test tests/chapter-model.test.js tests/chapter-response.test.js`. `python assets/verify_slice_assets.py` verifies directional character frames and source hashes. The main Stop 01 checkout outside this worktree is unchanged.

The notes below describe earlier iterations; their entry points are preserved for reference.

---

## Current preview: the pixel sequel (9 September 2026)

The active build is **The Missing Meal**, continuing from Stop 01 in the original pixel-game style. It includes travel and date choices, the inherited throne, a new courtyard, animated character sprites and the future castle/dragon story. See [the current implementation notes](docs/PIXEL-SEQUEL.md).

Author `pixel.html`, `pixel.css`, `pixel.js`, `pixel-world.js` and `pixel-model.js`. Run `python build.py`, then `python devserver.py 8124`. Test the choice model with `node --test tests/pixel-model.test.cjs`. Local previews never send notifications. The existing response endpoint accepts the new journey details.

`python build.py --legacy` restores the earlier game build; `--illustrated` builds the rejected illustration experiment. The older notes below document those earlier iterations and do not describe the active flow.

---

# The Pigeon and the Garden

A pixel-art invitation micro-game. A pigeon carries a note. She says yes. She walks a
road through a garden choosing the shape of the date, and the road ends at a castle.

Twenty-three screens, one tap each, no typing, no third-party requests.

**This build is stop 02.** Stop 01 happened — Ambury, a Saturday — so the road now opens
on that stop stamped and the mist pulled back one step. See "Stop 02" below for what
moved and why.

```
Pigeon Garden Invite v2.dc.html   the design canvas — the source of truth for layout
build.py                          converts the canvas into index.html + style.css
index.html                        generated, do not hand-edit
style.css                         generated, do not hand-edit
script.js                         hand-written: state machine, dodge, notify
api/respond.js                    POST -> webhook or Resend
fonts/                            vendored Pixelify Sans (see "The font")
og.png                            1200x630 link preview
assets/                           palette, the font fetcher, the pixelate pipeline,
                                  and make_regalia.py (throne + seal)
vercel.json                       pins the output directory to the repo root
.vercelignore                     what must NOT be served — read it before deploying
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

The Stop 02 visual refresh is authored in `garden.css`. `visual_refresh.py` adds
semantic presentation hooks after the canvas transforms; `build.py` includes both
automatically. Edit these source files rather than the generated CSS or HTML.
The reading surfaces derive their stable paper colours from the canvas palette.

For local visual review, run `python preview_screens.py` after building, then open
`http://localhost:8123/.local-review/`. This generates all 23 individual screens
with notifications disabled. These previews and their tooling are excluded from
deployment. The normal invitation retains its original response behavior.

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

### Check what you actually published

`vercel.json` pins the output directory to the repo root, so **without `.vercelignore`
every file here is served at a public URL** — `docs/`, `README.md`, `build.py`, the
design canvas and `.env.example` all answer `200`.

`docs/` is the one that matters. The spec is a dossier on the recipient, and it contains
the line *"for a reader who is explicitly wary of how much men know about her"*. Sitting
it at a guessable path on the same domain as the invitation is the single thing most
likely to undo the invitation. `README.md` is second: it explains the No button, the
notification wiring and every joke, before she has met any of them.

`.vercelignore` excludes all of it. Confirm after every deploy — anything but `404` means
it is not working:

```bash
curl -s -o /dev/null -w '%{http_code}\n' https://YOUR-DOMAIN/README.md
```

## The font

Pixelify Sans is **vendored**, not linked. The Google Fonts stylesheet is render-blocking
and third-party: a DNS lookup, a TLS handshake and a round trip before the first paint of
a page whose whole job is a first impression — and it hands Google the IP and user-agent
of the one person this was built for, which does not square with "nothing is tracked".

`build.py` inlines `fonts/pixelify.css` into the stylesheet the page already loads, so
the faces cost no extra request at all. Only the weights the design uses (400, 600, 700)
and only the latin subsets are fetched.

```bash
python assets/fetch_font.py     # re-run only if the design starts using a new weight
```

The build fails if `fonts/pixelify.css` is missing rather than silently falling back.

## Env vars

Set **one** of these in Vercel → Project → Settings → Environment Variables.
`WEBHOOK_URL` wins if both are present. There is no response database or analytics;
notification attempts are recorded in the hosting function logs.

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

Leaving **after** a seal sends nothing — `tell()`'s `notified` guard swallows it. That is
deliberate: she has already committed, so a later exit is far more likely to be a closed
tab than a change of heart, and a "she left" message arriving after "Sealed." would read
as a withdrawal she never made.

## Leaving

The `leave` pill asks once before it acts. Opening the question sends nothing; `stay` and
`Escape` both dismiss it.

It used to fire immediately: one tap, no confirm, the decline notification sent, and she
landed on a screen with no buttons and no way back. The No button gets three dodges *and*
a confirm precisely because an accidental decline is unrecoverable — this button did the
same thing with no guard at all, 44px from where a thumb goes when you regrip a phone.

She can still leave at any moment. She just cannot do it by accident.

## Going back

A `back` pill mirrors `leave` on the other corner, from screen 4 to the decree.

Choosing *is* advancing on every question screen, so without it a mis-tap was
uncorrectable until the end — where "change something" costs ten screens to fix one
answer. Her picks are kept, so returning to a screen shows what she chose and lets her
choose again.

`go()` also pushes a history entry, so the phone's own back gesture steps back through
the garden. Before that the whole thing was one entry: a back swipe left the site, and
since picks live in memory and nothing is stored, returning restarted her from zero.

## Landscape

Nothing on this site scrolls — `html`, `body` and `#app` are all `overflow:hidden` — so on
a short screen anything below the fold is not merely off-screen, it is **unreachable**. At
360px tall the seal sat at 527px: she could rotate her phone on the final screen and have
no way to finish.

The design is one screen per beat and should stay that way, so the honest move is to ask
for the phone back. `#rotate` covers the page under
`(orientation:landscape) and (max-height:520px)` — short phones only, never a desktop.

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
added `skin`, `hair`, `escA`, `escB` — a hand-copy would have repainted the site in last
week's palette on the very first screen.

## assets/

Not used by the running site, which draws everything in CSS. Kept because it builds
`og.png`, and because character sprites will need it.

```bash
python assets/sitepalette.py                 # self-check: reads the canvas palette
python assets/pixelate.py --demo             # self-check
python assets/pixelate.py in.png out.png --width 96 --key
python assets/make_flora.py                  # draw tree + hedge, trim the horizon
python assets/make_vendor.py                 # derive sprites from vendor/ asset packs
python assets/make_regalia.py                # draw the throne and the wax seal
python assets/make_regalia.py --demo         # self-check: every pixel on palette
python assets/make_og.py                     # rebuild the link preview
```

`make_regalia.py` draws the throne and the seal for the same reason, and asserts that
every pixel it emits is one of the canvas's own colours — the check that would have caught
the murky green before she had to point it out in person.

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

## The opening

The first thing she sees is a note, not a landscape: a scroll unrolls against a
pre-dawn sky, addressed **FOR PEANUT**, carrying the line that used to live only in the
`<title>` — now *"The pigeon is back."* Tapping it lifts the note, the palette comes up
into morning, and the pigeon sets off. The world wakes up as she arrives.

Before this the opening was a wide establishing shot with both figures at 52×74 on an
812px screen — about 6% of the height — a dead centre of empty grass, and 1.1 seconds
where nothing moved at all.

How it is put together:

- `CURTAIN_SCREEN` in `build.py`, injected last so it paints over the screens beneath it
  without an argument about z-index. It is a real `<button>`, so tap and keyboard both
  work with no extra code.
- The sunrise is a **palette swap**, not a scrim — the same mechanism the weather ramps
  use, so every sprite is repainted rather than dimmed behind grey. `applyDawn()` in
  `script.js` derives the night values from `SUNNY` rather than hard-coding them, and
  steps through them discretely, because pixel art does day/night as palette swaps.
- **The note keeps the pristine palette**, scoped to `#curtain`. It is the one lit thing
  in the frame; a dimmed parchment reads as dirty concrete rather than paper.
- The treeline and the path are generated (`dawn_treeline()`, `dawn_road()`) from
  stacked rectangles. A `clip-path` diagonal anti-aliases its edge, and one soft edge in
  a scene of hard pixels reads as a rendering fault.
- The delivery is **held** until she taps — `animation-play-state:paused!important`. The
  `!important` is load-bearing: the delivery's animation is an inline shorthand, which
  resets play-state to running and beats a stylesheet longhand. Without it the pigeon
  flies, lands and is finished while she is still reading the note.

`theme-color` starts at the night sky and `script.js` swaps it to daylight on open, so
the phone's own chrome comes up with the garden.

## Stop 02

The site already promised this. Screen 18 ended on a `STOP 02?` silhouette and the closing
screen said *"Stop 02 unlocks once stop 01 has actually happened."* It has, so the same URL
was rebuilt rather than a second one published — she may still have the link, and the
payoff of that silhouette is that it resolves in the place it was drawn.

**The first attempt at this failed, and the reason is worth keeping.** It rewrote all
twenty-three screens but kept asking the same questions, so it played as a photocopy of
stop 01 with new words. A sequel does not get to re-ask what the first one settled. Every
change below comes from that: the sky, the outfit and the throne are *decided*, and the
screens they used to occupy now go to things that are genuinely open.

**The spine is the meal.** Stop 01's decree printed a `food` row and the day never reached
it: the walk ran long and she wanted to go early. So stop 02 is not a fresh invitation, it
is an unfinished one — a much better reason for a sequel than "again?".

**The engine is the broken promise.** Stop 01's terms said *"The builder will be early."*
and the petitioner said *"He will be early. You will not be kept waiting."* He was ten
minutes late. Both now print struck through with the correction underneath, because a
quietly deleted promise is exactly the half truth she named as her dealbreaker. It also
does something the copy never has to say out loud: she has said she is rusty at this, and a
builder who is visibly, printedly fallible leaves her room to be too. **Her line about
being rusty is deliberately nowhere on screen** — quoting a private worry back at her would
read as a ledger, not as warmth. His fault carries it instead.

**The one thing she said is quoted once**, on the decree, in the plain unornamented line
that every build gets exactly one of: *"you said I handled Saturday just fine."*

### The sky runs itself

The weather screen is gone. Picking the sky bought one repaint and then a static world for
twenty screens, which is a poor return on a whole screen of her attention. `applyLight()`
in `script.js` runs it instead: late afternoon, through golden hour, into evening, advanced
by `go()` on every move. The road visibly gets later as she walks it.

It is the same mechanism as the dawn — a palette swap derived from `SUNNY`, never a scrim,
so every sprite is repainted rather than dimmed behind grey. `RAMPS` (overcast, light rain)
is still lifted from the canvas and still unused; a later stop can walk in the rain.

### The green

She dressed him green at stop 01. In person she said it did not look green.

**She was right, and it was a bug.** The canvas swatch was `--forest` (`#26492f`) — the
colour this project's own spec calls "dark and murky" three lines after rejecting it for
her dress. The site painted him mud and printed the word "green" underneath.

So the outfit picker is gone (it was settled, and asking again wastes the beat), the colour
is fixed to `--moss` in the stylesheet, and its screen now says so plainly. He stands on a
**cream swatch panel** there rather than in the garden: `--moss` is a real green from the
24, but so is the hedge behind him, and the one screen whose entire point is "this is
green" cannot have him disappearing into a bush.

### The crown

She has had the throne since stop 01, so the throne screen is a continuity error — you do
not re-pick a chair you already own. The crown was the other half of that conversation and
never got built, so it takes the slot: gold, small, or made of flowers, and `setCrown()`
repoints `--crownA` so the one on the castle plinth is the one she chose.

### Where she is standing

She starts the map **on stop 01**, not back at the trailhead, with her escort beside her.
The stamped stop and the lit `STOP 02` both moved two stones down the road first: with the
stamp third from the top she was most of the way to the castle on her second visit, which
is the opposite of the joke. The mist went back to covering the far end.

Her offsets are derived from the stones' own spacing (`calc(40% - 12px)`), not measured off
one phone. The stones are a `space-between` column, so stone *k* sits at `10 + k*(26 +
(H-170)/5)`; a hard-coded `top` drifts on every other screen height.

### The escort

Still a question, because **she came to Ambury alone**. "Bring someone this time?" is a new
ask rather than a repeat, and "just me, again" is right there and costs nothing.

### The castle

`Progress: 12%`, and screen 14 now lists what was actually added — a table that seats two,
a door that closes, the throne that was already hers. The throne room shows both: the
crown on its plinth, and the table, laid for two. A promised amenity the room never showed
would have been the emptiest joke in the build.

The throne and the wax seal are **redrawn** — see `assets/make_regalia.py`. The old throne
was a single silhouette that read as a wardrobe at the size it actually renders.

### What did not move, and must not

The leave screen, the No button's three dodges and its single confirm, the back pill,
`prefers-reduced-motion`, and every entry on the "Never" list in the design spec. The
one-tap decline is still the kindest element here — she has said declining is labour for
her — and it stays unsoftened and un-re-prompted.

**For stop 03:** the road on already draws the silhouette. `LAST` in `script.js`, the
`VERDICTS` keys, `LIGHT_TO`, and the decree rows are the four places a new stop has to
agree with itself.

## Her name

She is called **Peanut** on the note. That is the one place it appears, and it is
deliberately the *first* thing on screen: a letter is addressed, and being addressed is
what separates a thing made for someone from a thing sent to someone.

It is **not** in the Open Graph tags or the `<title>`. Those are public — they show in
every link preview and are fetchable by anyone with the URL — and a private name does not
belong in metadata on a site whose spec is built around her being wary of how much is
known about her. If you want it in the link preview, that is your call to make, not a
default to fall into.

## The decree headline

It reads off the place she picked (`VERDICTS` in `script.js`, keyed by the `data-set`
values on the "Where are we eating?" screen — change one there and it must change here).

It used to be the literal word "Coffee" no matter what she chose, at 29px, directly above
eleven rows that said something else: she could pick a garden, savoury and iced and still
be told "Coffee, then." Stop 01 was the coffee and stop 02 is the meal it never reached,
so the defer path now reads "Food, then." — same joke, still the honest answer on the one
path where she hands the choice back to him.

## The refused "hot"

"Iced or hot?" offers only iced, on purpose. It was signalled by a dashed border and
`cursor:not-allowed` — and a phone has no cursor, so the only thing a tap produced was
nothing at all, which reads as a broken site rather than a joke.

It now carries the same line-through the "white chocolate" gag on the food screen already
uses, and it answers when tapped. The escalating lines in `vals()` are two beats, not
three jokes: *that button has never worked* / *and it is not going to start now.*

## Still to do

- Both figures are drawn in CSS. A matched non-combat sprite pair could replace
  them, but only if both arrive together and neither is armed.
- The venue behind each "where are we eating" answer. Stop 01's lookup table is in the
  design spec; it needs a sit-down column now, and it must still be a place she can leave
  easily.
- Set `SITE` in `build.py` and regenerate.
- Test on a real phone, in portrait and landscape, before sending.
