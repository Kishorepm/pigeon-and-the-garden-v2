# Design brief — send to Claude Design

> Self-contained on purpose. Nothing personal about the recipient goes into a design
> tool; everything is abstracted to a visual requirement.

---

Design a pixel-art invitation micro-game. Mobile only.

## What it is

A single-page illustrated invitation that plays like a tiny adventure game. A pigeon
carries a note from one character to another. She is asked on a date. She says yes. Then
she walks a winding road through a garden, choosing the shape of the date as she goes,
and the road ends at a castle.

It must feel like a small handmade game, not a website with decorations on it. Warm and
storybook — never corporate, never arcade-retro, never techy.

Twenty-one screens, zero typing, one tap each, no screen that scrolls.

## Art direction

Cosy farm-garden pixel art. The Stardew Valley register — warm greens, soft dawn light,
hedges, ivy, wildflowers, hand-placed detail. Not 8-bit harsh, not neon, not glitch.

Hard rules:

- ONE fixed palette of 24 colours, supplied below. Every asset drawn from it, no exceptions. Use at most 16 of the 24 on any single sprite.
- ONE pixel grid. Never mix pixel sizes — it instantly reads as broken.
- Integer scaling only (2x, 3x, 4x). Never fractional.
- Drawn at 1x, displayed scaled up with `image-rendering: pixelated`.

Palette direction: mossy greens, warm cream, terracotta, dusty rose, honey gold, deep
forest shadow. Soft and sunlit rather than saturated.

**The palette is supplied, not invented.** Three ramps — sunny, overcast, light rain —
over the same 24 slots. The player picks the weather early and it repaints every screen after it. This
must be a colour swap over identical sprites, never three sets of redrawn art.

## Two characters

A male character and a female character, both pixel sprites. Keep them simple and
flattering — pixel portraits that chase likeness get uncanny fast. A readable silhouette
and the right hair colour is the whole job.

The male character needs **eight outfit variants**: casual and formal, each in black,
red, blue and green. The female character needs an idle and a walking loop.

## The screens

### Act 1 — the ask

1. **Delivery** — male character left, female character right, garden between. Pigeon
   flies from him to her carrying a rolled note, lands, drops it. No text at all.
2. **The note** — "Will you go on a date with me?" with `Yes` and `No`.
   The No button needs three drawn states: **normal**, **dodging** (mid-flinch,
   alarmed), and **slumped** (defeated, given up, slightly sad). It dodges away from the
   thumb three times, then surrenders and becomes a normal button.
3. **Correct** — a big deadpan confirmation with falling petals.

### Act 2 — the map

4. **Escort** — she picks an animal companion: ginger cat, dog, duck, chicken, or all of
   them. The chosen sprite follows her one step behind for the entire rest of the
   journey. Each needs an idle and a walk loop.
5. **Weather** — sunny, overcast, or light rain. Sets the palette ramp for every screen
   after it. Small footnote beneath: *this is not binding.*
6. **Journey map** — a winding road through the garden, in the chosen weather. Her
   avatar at the start, escort behind. **A castle on the horizon, always visible, always
   distant.** The first stop glows. The road beyond it is under mist so the number of
   remaining stops is unknowable. **This is the centrepiece screen — give it the most
   attention.**

### Act 3 — the stop

Each is one full screen, one question, three options, plus a "you choose" option.

7. **Terms** — a scroll unrolls absurdly far, then resolves to three short lines. One
   tap to agree.
8. **Kind of place** — one with a garden / one with animals nearby / one that is quiet
   and indoors. Illustrated as small scenes, not as named venues.
9. **When** — three date options.
10. **What hour** — three time slots.
11. **How long** — three durations, illustrated as hourglasses at different levels.
12. **Food** — something sweet / something savoury / both. **White chocolate appears in
    the list greyed out and struck through, labelled *(not chocolate)*.**
13. **The drink** — "iced or hot?" with **hot visibly disabled and greyed out**. Only one
    answer is tappable.
14. **Ban a topic** — she picks one thing that is off limits for the date.
15. **Construction** — a pixel scene of the male character building the castle badly:
    scaffolding, a wonky turret, holding a hammer wrong. Reads `Progress: 4%`. Buttons:
    approve, or note concerns.
16. **Throne** — three thrones side by side: a gilded one, a beanbag, and one that
    already has a cat sitting on it.
17. **Dress** — casual or formal, then a colour. Her choice renders onto the male
    character, who wears it for the rest of the journey. Lowest priority screen.

**Screens 12 and 13 both contain a greyed-out option that cannot be chosen.** These are a
deliberate pair — design the disabled state so it reads as an intentional joke rather
than a bug. Nothing else in the build is disabled.

### Act 4 — the decree

18. **Decree card** — every choice assembled on one card, framed like a storybook
    certificate. Must look good as a screenshot. Final action is pressing a wax seal:
    design unpressed, mid-press squash, and pressed states.

### Act 5 — the road on

19. **The road again** — the first stop now stamped complete. Her avatar one segment
    further along, escort following. **The mist has pulled back exactly one step**,
    revealing a silhouette of the next stop — unlabelled, unreadable, just a shape. The
    castle is fractionally closer.
20. **The castle** — the end of the road, close at last. The throne she chose on the
    dais, and **her escort animal already sitting on it.**

### Any time

21. **Left** — a quiet decline screen, reachable from a small persistent link on every
    screen. Warm, not punishing.

## Motion

Idle animation is what separates this from a static image. Cheap two-frame loops,
deliberately staggered so nothing syncs:

- chickens pecking, ducks bobbing, a cat's tail flicking
- hedge and leaves swaying, flowers nodding
- condensation running down the iced glass
- dust motes in sun, drizzle in rain
- mist drifting on the unexplored road

Plus: the pigeon's wing flap, the No button's flinch, the wax seal squashing, both
character walk cycles.

All via CSS `steps()` on sprite-sheet background-position. No canvas, no JavaScript
animation loop, no game engine.

**Transitions between screens must be fast and immediate.** Twenty-one screens only works
if the pace never sags — no loading states, no waiting, nothing that lingers after a tap.

Honour `prefers-reduced-motion` — show landed and settled states immediately.

## Mobile rules

Mobile is the only target. Desktop merely must not look broken.

- Portrait only. Design at 390x844. No landscape layout.
- Every tap target in the bottom half of the screen — one-thumb reach.
- Tap targets 44px minimum, generously spaced. Pixel art tempts tiny buttons: refuse.
- Use `100dvh`, never `100vh`.
- Honour safe-area insets for notch and home indicator. **The dodging No button must
  never land under the notch, under the home indicator, or off-screen.**
- No hover states anywhere. Design the pressed state instead — buttons should visibly
  depress like physical pixel buttons.
- Every screen fits without scrolling.

## Typography

Split it:

- **Pixel font** for headings, labels, and buttons only.
- **Clean readable system font** for anything that must actually be read — the decree
  card, the terms, the confirmation, the decline screen.

Pixel type at body size on a phone is hostile. The sincere lines must not be work to
read.

## Deliverables

1. All twenty-one screens as artboards at 390x844.
2. Artboards using the supplied 24-colour palette in all three weather ramps.
3. Sprite sheet layouts for both characters, the four escort animals, and the pigeon.
4. Component set: button, pressed button, **disabled button**, the No button's three
   states, stop markers (locked / active / stamped), stepping stones, mist tiles.

## Avoid

- Hearts, roses, cupids, or any conventional romance iconography. The warmth comes from
  the garden and the animals, not from Valentine's imagery.
- Neon, glitch effects, CRT scanlines, vaporwave.
- Anything that reads as a form, a wizard, or a checkout flow.
- Drop shadows, gradients, and blur. Pixel art uses none of them.
- Making the decline screen feel like a punishment or a guilt trip.

## The palette (fixed — do not substitute)

Twenty-four slots. Use at most 16 on any single sprite.

**sunny**

```
#1a1410  #2d2418  #4a3b28  #7a5c3a  #b08055  #e8d5b0  #fdf6e3  #8c5a48  #c88e6a  #f0c9a6  #1e3a24  #2f5e35  #4a8b3f  #7bb85a  #b8d97a  #6b7a3f  #8c3030  #c94f4f  #e8a04a  #c9a227  #d98ba0  #6a4a7a  #3a5a8c  #6a9ec4
```

**overcast**

```
#161311  #25221a  #3d382c  #635843  #907d60  #d0c7a7  #ede8cc  #735e50  #aa8d70  #d5c0a0  #213026  #354d3b  #4b704a  #6f9a62  #9eba7e  #596446  #6e453f  #a6655c  #bd9d5c  #978d45  #bd8a92  #614e66  #465270  #6f89a7
```

**rain**

```
#12110f  #1e1d18  #323027  #504c3c  #756c57  #b4b08a  #d3d1a4  #5d5348  #8d7d61  #baaa83  #1e2722  #303e35  #435b45  #5e7c5a  #7f9f69  #48513f  #58423b  #846156  #9c8c52  #777744  #a27375  #534554  #40445a  #616f8a
```

Slot names, in order: `ink`, `bark`, `soil`, `timber`, `tan`, `cream`, `paper`, `skinlo`, `skinmid`, `skinhi`, `pine`, `moss`, `hedge`, `grass`, `shoot`, `sage`, `rust`, `terracota`, `honey`, `mustard`, `rose`, `plum`, `deep`, `sky`
