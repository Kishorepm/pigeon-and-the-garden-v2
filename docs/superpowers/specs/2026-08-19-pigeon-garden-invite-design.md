# The Pigeon and the Garden — design

**Date:** 2026-08-19
**Status:** approved concept, not yet planned
**Supersedes:** the `mostly-locked` three-card build at the repo root

---

## 1. What this is

A single-page, static, no-build invitation that plays as a pixel-art micro-game. A pigeon
carries a note from him to her. She is asked on a date, in a garden, by a character. She
says yes. Then she walks a winding road, choosing the shape of the date as she goes —
never the details, only the shape — and the road ends at a castle with her chosen throne
on it, already occupied by whichever animal she brought along.

She presses a wax seal, and that is the whole interaction.

It is **not an ask.** She already proposed the meeting herself:

> "I have a veterinary thing in Auckland in a couple weeks, could be a good excuse to
> meet afterwards perhaps?"

That single fact governs the entire design. An elaborate invitation to someone who has
not agreed reads as pressure. An elaborate *confirmation* of something she proposed
reads as a gift. Every line of copy must sit on the confirmation side of that line.

## 2. Who it is for

One reader. Twenty-six, vet nurse, South Auckland. A month of conversation, never met
in person. There is an established running joke that the author over-engineers things
and is building her a castle. The over-engineering is therefore the punchline, not a
risk — she is already in on it.

## 3. Non-negotiables

Drawn from her own stated words. These are constraints, not preferences.

**Copy**

- Every word spelled out. No abbreviations. She has said she will not decipher messages.
- Terse. Her median message is six words. No screen carries a paragraph.
- One line, at the end, entirely without ornament. Her strongest stated value is
  "I hate half truths." The joke must break once for something plainly true.

**Never**

- Any joke about her height. A previous match "play bullied" her for being 5'3.
  That ground is burnt and only she gets to walk on it.
- Alcohol, anywhere, in any venue or copy. Lifetime non-drinker.
- Spice. Zero tolerance.
- "Baby" as an endearment.
- Crystals or metaphysics. She likes coloured rocks as objects, and has said so.
- Anything implying knowledge of where she lives. She is explicit and serious about this.
- Any reference to her ex, to children, or to travel that requires her to fly casually.

**Always** (these govern stop 01, the first meeting; later stops may relax the daytime
rule but never the rest)

- Public place, daytime, her choice of hour, easy exit.
- Practical certainty: exact place, map link, known duration. She is an anxious person
  attached to Google Maps and needs to know she will get there.
- A visible way out on every screen.

## 4. The thesis

Every screen offers her a real choice. **One does not.** The drink screen asks "iced or
hot?" with hot already greyed out — a question with exactly one answer available.

Everything else in the build exists to set that beat up. It is the only place the
author's homework is visible, and it must stay the only place — the order is never
recited, the two-thirds chocolate is never spelled out, the fact of remembering is never
announced. The rigged question does all of it without a word of explanation.

Knowing her order is for the counter. Not for the screen.

## 5. Flow

Five acts. A journey along a road, not a grid of gates.

```
ACT 1 — THE ASK
[0]  Delivery      two pixel characters; pigeon flies from him to her
[1]  The note      "Will you go on a date with me?"  Yes / No
[2]  Correct       Yes confirmation

ACT 2 — THE MAP
[3]  Escort        which animal comes with her; follows her for the rest
[4]  Weather       sets the palette for everything after it
[5]  Journey map   winding road, castle on the horizon, road ahead under mist

ACT 3 — STOP 01
[6]  Terms         absurd scroll, three real lines, one tap to agree
[7]  Kind of place what sort of surroundings, not which venue
[8]  When          three specific dates
[9]  What hour     three slots
[10] How long      she sets the length, and therefore the exit
[11] Food          sweet / savoury / both; white chocolate struck through
[12] The drink     rigged question; hot is disabled
[13] Ban a topic   her one decree, added to the card
[14] Construction  castle progress 4%; Approve / Concerns noted
[15] Throne        three thrones, one already occupied by a cat
[16] Dress         casual / formal, then colour — LOW PRIORITY, cuttable

ACT 4 — THE DECREE
[17] Decree        everything assembled; she presses the wax seal

ACT 5 — THE ROAD ON
[18] The road on   stop 01 stamped; avatar advances one segment; mist pulls
                   back exactly one step to a silhouette of the next stop
[19] Castle        the throne she chose, her escort animal already on it

ANY TIME
[20] Left          the decline screen, terminal
```

Budget: **zero typing, one tap per screen, no screen that scrolls.** A game she plays is
princess treatment. A form she fills in is admin. The tap count is the only thing
separating them.

**Twenty-one screens is a lot for someone whose median message is six words.** That is a
deliberate choice, not an oversight, and it is survivable only if the pace never sags.
Transitions must be fast and immediate — no loading states, no confirmation beats, no
screen that waits. She should never be looking at a screen she has already finished
with. If a transition takes long enough to notice, it is too long.

**Cut order if it runs long:** dress, then construction, then throne. Escort, weather,
the rigged drink, and the mist are load-bearing and stay.

**Deliberately left out:** the greeting (handshake / hug / wave / decide on the day).
Worth keeping in the back pocket — it defuses the most awkward two seconds of meeting
someone from the internet — but it is not in this build.

### The division of labour

She picks **the shape**. He handles **the details**. She chooses what kind of place, not
which venue; how long, not which table; what sort of food, not the order.

This is the correct split for one specific reason. Choosing a category is a preference
and costs her nothing. Choosing a venue in a part of the city she does not live in is
research, evaluation, and planning — it is her organising her own date. She has said
"feeling taken care of is definitely something I'm looking for," and the difference
between those two experiences is exactly that.

Every choice screen must stay on the preference side of that line.

## 6. Screens in detail

### 0 — Delivery

Two pixel characters: him on the left, her on the right, garden between. The pigeon
flies from him to her carrying a rolled note, lands, drops it. No text at all. One tap
to unroll. Honours `prefers-reduced-motion` by showing the landed state immediately.

Keep both avatars simple and flattering. Pixel portraits that chase likeness get uncanny
fast; a readable silhouette and the right hair colour is the whole job.

### 1 — The note

> Will you go on a date with me?

`Yes` · `No`

**The No button dodges.** On `pointerdown` — never hover, which does not exist on a
phone — it jumps clear of her thumb before the tap registers. On a touchscreen this
reads as the button physically flinching away from her finger, which plays better than
the hover version ever did.

**It must surrender.** Exactly three dodges, then it slumps, stops moving, and becomes
genuinely pressable. Pressing it asks "are you sure?" once, and then it *works*, into
screen 20.

This is a hard requirement, not a nicety. She has previously drafted a rejection message
in Notes to get the tone right; declining is labour for her, and a No that cannot be
clicked is not a joke to someone with that history. The surrender also makes the gag
funnier — a button that visibly gives up beats a button that never stops running.

The bit is safe here for one specific reason: she proposed meeting up herself, so the
yes is already banked. Teasing someone about a thing they have already said is play. If
that ever stops being true, this screen comes out.

### 2 — Correct

Deadpan, not enthusiastic. Her register is dry — "Riiiight", "Suuuure", "Uhuh" — and a
single word outperforms a sentence.

> ## CORRECT.
> *The pigeon is relieved. It has been waiting a month.*

Petals, one beat, continue.

### 3 — Escort

She chooses which animal comes with her: ginger cat, dog, duck, chicken, or all of them.
**The chosen sprite then follows her avatar one step behind for the entire rest of the
journey**, and reappears in the final frame.

Cheap to build and it does more work than anything else on the list — it converts a
sequence of screens into her journey rather than his slideshow.

### 4 — Weather

Sunny, overcast, or light rain. Her choice **sets the palette for every screen after
it** — the map, the stops, the castle.

Placed here on purpose. A weather choice made at the end changes nothing she can see; a
weather choice made before the journey repaints the whole journey. Same principle as the
escort and the dress: a choice with a visible consequence is a choice, and a choice with
none is a form field wearing a costume.

Footnote under the options, small: *this is not binding.*

### 5 — Journey map

A winding road through the garden, in the weather she just chose. Her avatar at the
start, escort one step behind. **The castle on the horizon, always visible, always
distant.** Stop 01 glows. Everything past it is under mist.

The mist is the mechanism that replaces ten visible gates: she can see there is a
destination and she cannot count the stops. It also means no ten dates ever have to be
invented.

### 6–16 — Stop 01

One question per screen, three options each, plus a **"you choose"** option on every
one. The escape valve matters more than it looks: for an anxious reader, a screen she
cannot get stuck on is a kindness, and "surprise me" is the most princess-treatment
answer available anyway.

- **Terms** — a scroll unrolls, and unrolls, absurdly far, then resolves to three lines:
  *you may leave at any time, you may veto the plan, the builder will be early.* One tap
  to agree. The over-engineering joke doing genuine reassurance work under cover of being
  a bit.
- **Kind of place** — *one with a garden · one with animals nearby · one that is quiet
  and indoors · you choose.* All of them are still coffee, because coffee was her idea.
  Only the surroundings change. She is never asked to name a venue.
- **When / What hour** — the real logistics, as picks. Mondays weighted; it is her day
  off.
- **How long** — *forty-five minutes · an hour or two · until one of us has to go.*
  Hands her the exit before she needs it. For someone anxious about a first meeting,
  knowing the end is pre-agreed makes the beginning much easier — and the third option
  is there if she wants to reach for it. Control, disguised as romance.
- **Food** — *something sweet · something savoury · both, obviously · you choose.*
  Everything offered is pescatarian and unspiced by construction, so no option can go
  wrong. **White chocolate appears in the list greyed out and struck through, labelled
  *(not chocolate)*.** Her own stated position, quoted back without comment.
- **The drink** — a rigged question. "Iced or hot?" with **hot disabled**. She taps iced
  because it is the only thing she can tap. The joke is that it was asked at all, and it
  beats simply displaying the glass because it keeps the rhythm of every other screen
  being a genuine choice.
- **Ban a topic** — *work · exes · the weather · nothing is off limits.* Her one decree,
  printed on the final card. It hands her veto power over the conversation, and having
  "exes" sit there as a bannable option quietly says he will not be raising it without
  him having to say so.
- **Construction** — pixel scene of him building the castle badly. Wonky turret, hammer
  held wrong. `Progress: 4%`. `Approve` / `Concerns noted`.
- **Throne** — three thrones: gilded, beanbag, and one that already has a cat on it. Her
  pick appears in the final frame.
- **Dress** — casual or formal, then black / red / blue / green, from what he actually
  owns. Her choice renders onto his avatar and **he wears it for the rest of the
  journey**. That consequence is the only thing that justifies building it; without it
  this is a colour picker that changes nothing. Lowest priority, cut first.

Progress shown as stepping stones along the path, filling as she goes.

**The two greyed-out options — hot coffee and white chocolate — are a deliberate pair.**
*The things that were never options.* Two makes a motif; a third would make it a tic.
These are the only two in the build.

**Nothing about transport, driving, or lifts appears anywhere.** A previous match
expected her to drive him around and the whole area is quietly loaded. The plan assumes
each arrives under their own steam and never raises it.

### 17 — Decree

Everything she chose, assembled on one card: place, date, hour, the colour she has put
the author in. Card is screenshot-able by design; she will want to keep it, and it
doubles as the reminder on the morning.

Final action is **pressing a wax seal** — one satisfying tap, on theme, unambiguous.

Directly beneath the seal, in plain type with no royal or garden voice:

> Underneath all of this: you suggested meeting after your Auckland thing. I would like
> that, very much. The rest is decoration.

### 18 — The road on

Back to the map. Stop 01 stamped done. Her avatar walks one segment, escort following.
**The mist pulls back exactly one step**, revealing a silhouette of stop 02 — unlabelled,
unreadable, just a shape. The castle is fractionally closer.

> The road continues. It is not shown in full, on purpose.

Also carries the practical part: address, map link, and that the hour gets fixed by text
rather than by app.

### 19 — Castle

The end of the road. The throne she chose, on the dais. **Her escort animal is already
sitting on it.**

> The throne is occupied. It was always going to be.

She has said her own ranking out loud — "my dog, then everyone else." This frame is only
that, drawn. It is the one gag in the build that is funny *because* it is true, which is
the only kind that survives a second viewing.

### 20 — Left

Reached by the quiet link on any screen. Terminal. Carries the same promise as the
current build's defer screen: no appeal, no second attempt, no version of this that
returns in three weeks wearing a different font. The garden stays; it was fun to build.

She once drafted a rejection message in Notes to get the tone right. Declining is
*labour* for her. One tap that requires no composition is the single kindest element in
this design — it must never be softened, delayed, or re-prompted.

## 7. Places

Filtered against her: no alcohol, no heights, no spice, pescatarian, and nothing remote
for a first meeting.

**Stop 01 — the coffee, after her veterinary thing.** Her idea, so it stays coffee.

**She never sees this table.** She picks a *kind* of place; he picks the place. This is
the lookup he runs against her answer:

| She picked | He books | Why |
|---|---|---|
| One with a garden | Wintergarden Pavilion, Auckland Domain | Glasshouses, fernery, flowers. Central, free, no second journey. |
| | Eden Garden, Mt Eden | Small private garden, quiet, if the Domain is busy. |
| One with animals nearby | Cornwall Park Bistro | Sheep, cows, enormous trees. Stardome shares the park, which sets up a later stop. |
| | Auckland Botanic Gardens cafe, Manurewa | Her side of the city, free gardens, shortest drive home. |
| Quiet and indoors | A good central cafe with soft seating and low noise | Scout it. The requirement is that a conversation is easy, not that the room is pretty. |
| You choose | Wintergarden Pavilion | The safest default: plants, free, central, and it needs no explanation. |

**Scout the iced mocha in person before committing any of these.** A weak one fails the
only promise the app actually makes. The scouting trip is the princess treatment; the app
merely announces it.

**The map link on the decree names the actual venue.** She chooses the shape blind, but
she must never arrive uncertain — she is an anxious person attached to Google Maps, and
the surprise ends the moment the seal is pressed.

**Later stops — themes held in reserve.** None of these are shown to her. They exist so
that the silhouette revealed at the end of the journey has something real behind it, and
so the road can keep going without anything being invented under pressure later.

1. Turtles — Kelly Tarlton's. She keeps turtles. Indoor, rain-proof.
2. Ducks and chickens — Ambury Regional Park, Māngere, or Western Springs.
3. Stars — Stardome, Cornwall Park. Seated, evening, gives you both something to discuss
   afterwards.
4. The occasion — a show at the Civic, or Greek food. This is the stop that earns a
   dress, and answers "cute dresses I have nowhere to wear" directly. Hold it back longest.
5. Paper — Gordon Harris art supplies, or Time Out Bookstore, Mt Eden. Stationery
   obsession plus a poet who says she is currently uninspired.
6. Coloured rocks — Auckland Museum natural history floor, or a jeweller. Rocks as
   objects. Never crystals.
7. Food she actually eats — butter prawns, garlic cheese naan, mild only. Or dessert
   first.
8. Butterfly Creek — solely so one stop can be labelled *butterflies are bad in dating,
   silly goose.*
9. Rarotonga. Sealed hardest, one palm frond visible. The place she has always wanted to
   go and never been. Flying genuinely hurts her, so it stays a joke about the ten-date
   plan rather than a promise — but it proves she was heard.

**Auckland Zoo is deliberately excluded.** She is a vet nurse. It is either perfect or it
is her workplace with a ticket price, and only the author knows which.

All venues need current hours and trading status verified before they go on a stop.

## 8. Theme and assets

**Pixel-art cartoon.** Cosy farm-garden pixel, the Stardew register — warm greens,
hedges, ivy, flowers, soft dawn light. Not retro-arcade, not 8-bit harsh. It should read
as a small handmade game, not as a website with decorations on it.

The style choice is doing real work beyond taste. It reads as *a game she is playing*
rather than a form she is completing, which is the single most important perception in
this build. It is warm rather than technical, which keeps the over-engineering joke
affectionate. And it is the cheapest possible art to ship — a full illustrated garden in
pixel weighs less than one photograph.

**Art rules**

- One fixed palette of 24 colours, defined in `assets/palette.py`. At most 16 on any single sprite. Sixteen total had no skin tone and every face quantised to `rose`.
- One pixel grid. Nothing drawn at a different resolution and scaled to fit; mixed pixel
  sizes are the fastest way to make pixel art look broken.
- Integer scaling only (2×, 3×, 4×). Never fractional — it shimmers.
- Drawn at 1×, displayed scaled up with `image-rendering: pixelated`.

**Idle life is what makes it feel amazing.** A static pixel scene looks like a JPEG; a
breathing one looks alive. Cheap two-frame loops, staggered so they never sync:

- Chickens peck
- Ducks bob
- Cat's tail flicks
- Leaves and hedge sway
- Flowers nod
- Light motes drift

Her animals hide in the scenery: a ginger-and-white cat asleep somewhere, a dog, three
ducks, chickens and one rooster, a turtle, birds in the branches that will not leave.

**Kept generic on purpose** — a ginger cat, not a labelled portrait. She should notice,
not feel catalogued. For a reader who is explicitly wary of how much men know about her,
that distinction carries real weight.

Pigeon footer, used once: *fed and released — it may come back, they tend to.* She takes
in orphaned ducklings and has myna birds that imprinted on her and stayed.

**Asset list** — all pixel, all one palette, all one grid

- **Him**: idle, plus one variant per dress combination (2 cuts x 4 colours)
- **Her**: idle, walking loop
- Pigeon: 4-frame flight loop, landed, note-drop
- Rolled note; unrolled note; the absurd terms scroll
- Hedge and garden background tiles
- **Journey map**: road segments, stop markers (locked, active, stamped), mist tiles,
  castle on the horizon at two distances
- Escort animals: ginger cat, dog, duck, chicken — each an idle and a walk loop
- Three "kind of place" sprites: a glasshouse, a duck-and-hen yard, a quiet indoor
  window seat
- Three "how long" sprites: a small hourglass, a larger one, one with no sand left
- Food sprites: something sweet, something savoury, both — plus the struck-through white
  chocolate
- Ban-a-topic sprites: a briefcase, a crossed-out figure, a rain cloud, an open hand
- **Weather variants**: the garden, road, and castle backdrops each in sunny, overcast,
  and light rain. Palette swaps rather than redraws — same tiles, three colour ramps.
- Iced drink sprite with a slow condensation drip; the greyed-out hot drink
- Three thrones: gilded, beanbag, cat-occupied
- Construction scene: scaffolding, wonky turret, him holding a hammer wrong
- Wax seal: unpressed, pressing, pressed
- Decree card frame
- Scenery animals: ducks, chickens, rooster, turtle, branch birds
- Stepping stones: empty, filled
- **No button**: normal, dodging, slumped
- Link preview image (pixel pigeon, mid-flight)

## 9. Mobile

**Mobile is the only target.** She will open this on a phone, in bed, late — her stated
best hours. Desktop merely must not look broken; it gets no design effort.

- **Portrait only.** Design at 390 × 844 and let it scale. No landscape layout.
- **One thumb, bottom third.** Every tap target lives in the lower half of the screen.
  Nothing important requires a stretch to the top.
- **Tap targets 44 px minimum**, generously spaced. Pixel art tempts small buttons —
  refuse.
- **`100dvh`, never `100vh`.** Mobile browser chrome resizes the viewport and `vh` will
  clip the bottom button on iOS.
- **Safe-area insets** honoured for notch and home indicator. The existing
  `viewport-fit=cover` meta already sets this up.
- **No hover states anywhere.** They do not exist on her device. Design the pressed
  state instead, and make it obvious — a pixel button that visibly depresses.
- **Typography split:** pixel font for headings, labels, and buttons only. Anything
  she has to actually *read* — the plain-speech line, the sealed screen, the decline
  screen — uses a clean system font at comfortable size. Pixel fonts at body size on a
  phone are hostile, and the honest line is the one sentence that must not be hard work.
- **Every screen fits without scrolling.** If a clearing needs a scroll, it has too much
  on it.
- **Test on a real phone before sending.** Not a simulator, not a resized browser window.

## 10. Technical approach

Same posture as the current build: **static, no build step, no dependencies, no
package.json.** Deploys with `npx vercel --prod`.

```
index.html        every screen, hidden by default, swapped in place
style.css         one palette
script.js         screen swap, choice state in memory, one fire-and-forget POST
api/respond.js    existing handler, payload extended
assets/           illustrations
public/og.png     link preview
vercel.json       outputDirectory pinned to repo root
```

- **No storage.** No cookies, no localStorage, no analytics, no page-view tracking, no
  open tracking. Choices live in a plain object in memory and die with the tab.
- **One request, at the end.** Fire-and-forget, `keepalive`, never awaited. The render
  must never wait on the network — that behaviour is already correct in `script.js` and
  carries over unchanged.
- **On seal:** POST `{ choice: "sealed", picks: { escort, weather, placeKind, date,
  hour, duration, food, banned, throne, dress } }`.
- **Weather is a palette swap, not three sets of art.** Define the 24 colours as CSS
  custom properties and ship three ramps; the sprite sheets never change. Three full
  redraws of every backdrop would blow the payload budget on a joke.
- **On leaving:** POST `{ choice: "left" }` and nothing else. Her partial choices are
  never transmitted.
- **The dodging No** fires on `pointerdown`, not hover — hover does not exist on a
  phone. Move it with a CSS transform to a new position within the safe area, never
  off-screen, never under the notch or home indicator. **Hard-capped at three dodges**,
  after which it is a normal button with a single confirm step. Keyboard `Enter` and
  screen-reader activation must reach it on the first attempt, without dodging at all —
  the gag is for thumbs only and must never become an accessibility trap.
- **Pixel rendering:** `image-rendering: pixelated` on every sprite, integer scale
  factors only. One shared sprite sheet rather than many files — fewer requests, and the
  whole garden arrives at once instead of popping in piecemeal.
- **Animation via CSS `steps()` on sprite-sheet position.** No JavaScript animation loop,
  no canvas, no game engine. Two-frame idle loops are a background-position flip.
- **Payload budget: 600 KB total**, down from 1.5 MB — pixel art at 1× is small enough
  that this is comfortable. She is on a phone, possibly on mobile data, possibly on a
  rural connection at her parents' block. Indexed-colour PNG, compressed.
- **No audio.** She may open it at work, in bed, or beside someone. A page that makes
  noise unprompted is a liability, and a mute button is friction on a ninety-second
  experience.
- **Accessibility is not optional here.** Keyboard reachable, focus moved on every screen
  change, alt text on every illustration, contrast checked, `prefers-reduced-motion`
  respected by the pigeon, the walk cycles, and the mist.
- **Link preview matters unusually much.** It is the first thing she sees, in a chat,
  from someone she has never met in person. It should be obviously the running joke and
  obviously from him, before she has clicked anything.

## 11. Out of scope

- Picking the exact minute in the app. The hour gets fixed by text. One tap is the entire
  point.
- Revealing all ten dates. The mist is funnier than any list.
- Her writing a message back. She has the actual chat for that.
- Any re-prompt, reminder, expiry timer, or second send.
- Accounts, storage, sessions, analytics of any kind.

## 12. Open items

- Where in Auckland her veterinary thing is. Decides which cafes sit behind each "kind of place" answer.
- The three specific dates offered. Mondays weighted — it is her day off. She finishes at
  5:30pm on working days.
- The three hour slots.
- Domain name.
- Whether Auckland Zoo is a gift or a busman's holiday.
