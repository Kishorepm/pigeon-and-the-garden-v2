"""Convert the Claude Design canvas into the deployable static site.

    python build.py

Reads  "Pigeon Garden Invite v2.dc.html"  (design canvas, with sc-if / {{ }} bindings)
Writes index.html + style.css

Re-run this after any design change; do not hand-edit index.html.
The OUTPUT has no build step — it is plain static files. This script is a one-off
local transform, not a deploy-time dependency.
"""
import hashlib
import html
import pathlib
import re
import sys

SRC = pathlib.Path("Pigeon Garden Invite v2.dc.html")
ROOT = pathlib.Path(__file__).parent

# Change this to the real domain before sending. The link preview is the first
# thing she sees, in a chat, from someone she has never met in person — it does
# the reassuring before she has clicked anything.
SITE = "https://pigeon-and-the-garden.vercel.app"
TITLE = "A pigeon has arrived."
BLURB = "It is carrying something."

# The canvas's own container: a centred, max-width column on a dark backdrop.
# It is already responsive, so it ships as-is; it only needs an id to hang the
# safe-area padding and the screen positioning off.
STAGE = re.compile(
    r'<div style="(position:relative;width:100%;max-width:\d+px;height:100dvh;[^"]*)"[^>]*>',
    re.S,
)
# Older revisions wrapped the artboard in a fake phone bezel with a drawn notch
# and home indicator. Removed if a canvas ever brings them back.
FAKE_HARDWARE = re.compile(
    r'<div style="position:absolute;(?:top:0;left:50%|bottom:7px;left:50%)[^"]*z-index:60[^"]*"></div>\s*',
    re.S,
)


# Copy fixes applied to the canvas at build time. Kept here rather than hand-edited
# into index.html so they survive regenerating the canvas from Claude Design, and
# so a target string that disappears fails the build instead of silently lapsing.
SIGNPOST = (
    '<div style="position:absolute;left:50%;top:0;transform:translateX(-50%);'
    'display:flex;flex-direction:column;align-items:center">'
    '<div style="width:5px;height:60px;background:var(--stoneDark)"></div>'
    '<div style="position:relative;background:var(--wood);border:3px solid var(--ink);'
    'padding:11px 18px;color:var(--cream);font-size:19px">{}'
    '<div style="position:absolute;left:0;right:0;bottom:0;height:5px;'
    'background:rgba(0,0,0,.22)"></div></div></div>'
)

# The castle was a dead end: no button, nothing after it. The pigeon flew from
# him to her at the start, so the ending is it going back. She also gets the card
# again here, because the decree is the one screen worth keeping and the only
# practical thing on it (where, when) is the bit she will want the morning of.
CLOSING_SCREEN = '''
<!-- 21 THE WAIT -->
<sc-if value="{{ s21 }}" hint-placeholder-val="{{ true }}">
<div style="position:absolute;inset:0;animation:in .09s both" data-screen-label="21 The wait">

  <div style="position:absolute;right:26px;bottom:34%;width:52px;height:76px">
    <div style="position:absolute;left:11px;top:0;width:30px;height:12px;background:#6b4326"></div>
    <div style="position:absolute;left:8px;top:10px;width:10px;height:22px;background:#6b4326"></div>
    <div style="position:absolute;left:34px;top:10px;width:10px;height:22px;background:#6b4326"></div>
    <div style="position:absolute;left:17px;top:14px;width:20px;height:16px;background:var(--skin)"></div>
    <div style="position:absolute;left:21px;top:21px;width:3px;height:3px;background:var(--ink)"></div>
    <div style="position:absolute;left:30px;top:21px;width:3px;height:3px;background:var(--ink)"></div>
    <div style="position:absolute;left:13px;top:30px;width:26px;height:28px;background:var(--dress)"></div>
    <div style="position:absolute;left:11px;top:44px;width:30px;height:14px;background:var(--dress)"></div>
    <div style="position:absolute;left:11px;top:54px;width:30px;height:4px;background:rgba(36,26,16,.22)"></div>
    <div style="position:absolute;left:7px;top:26px;width:6px;height:18px;background:var(--skin)"></div>
    <div style="position:absolute;left:39px;top:32px;width:6px;height:16px;background:var(--skin)"></div>
    <div style="position:absolute;left:18px;top:58px;width:6px;height:12px;background:var(--skin)"></div>
    <div style="position:absolute;left:28px;top:58px;width:6px;height:12px;background:var(--skin)"></div>
    <div style="position:absolute;left:16px;top:70px;width:10px;height:6px;background:var(--terra)"></div>
    <div style="position:absolute;left:26px;top:70px;width:10px;height:6px;background:var(--terra)"></div>
  </div>
  <div style="position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none;\
transform:translate(2%,34%);animation:gohome 3.6s steps(11,end) both">
    <div style="position:relative;width:40px;height:24px;background:#8d93a1;border:2px solid var(--ink);transform:scaleX(-1)">
      <div style="position:absolute;left:8px;top:-9px;width:22px;height:11px;background:#b0b6c2;\
border:2px solid var(--ink);animation:flap .2s steps(2,end) 18 alternate both"></div>
      <div style="position:absolute;left:-8px;top:4px;width:8px;height:8px;background:#8d93a1;border:2px solid var(--ink)"></div>
    </div>
  </div>
  <div style="position:absolute;left:22px;right:22px;bottom:112px;padding:18px 20px;background:var(--cream);border:3px solid var(--ink)">
    <p style="margin:0;font-size:23px;font-weight:600;line-height:1.15">Now we wait.</p>
    <p style="margin:10px 0 0;font-family:system-ui;font-size:14.5px;line-height:1.5;color:rgba(36,26,16,.78)">\
It is going back to tell me. I will text you to fix the hour, and the address comes with it.</p>
    <p style="margin:10px 0 0;font-family:system-ui;font-size:12.5px;color:rgba(36,26,16,.5)">\
Nothing else to do. Stop 02 unlocks once stop 01 has actually happened.</p>
  </div>
  <div style="position:absolute;left:22px;right:22px;bottom:40px;display:flex;gap:10px">
    <button type="button" data-go="17" data-active="a3" style="flex:1;min-height:52px;\
border:3px solid var(--ink);background:var(--honey);font-family:'Pixelify Sans';font-size:16px;\
font-weight:600;box-shadow:0 5px 0 var(--stoneDark);cursor:pointer">See the card</button>
    <button type="button" data-act="restart" data-active="a3" style="flex:1;min-height:52px;\
border:3px solid var(--ink);background:var(--cream);font-family:'Pixelify Sans';font-size:16px;\
box-shadow:0 5px 0 var(--stoneDark);cursor:pointer">Change something</button>
  </div>

</div>
</sc-if>

'''

# She is asked out by a stranger in the second screen, having been told nothing
# about him. She has said plainly that a green flag is "being able to talk about
# yourself", so this is the one place a short honest word earns its keep.
#
# Written in the third person on purpose. "I am reliable" is a boast; "he will be
# early" reads as a record, and the formal register keeps sincere claims from
# sounding like sales. Nothing here says she is lucky, and nothing compares him
# to anyone: she has already been "play bullied" by one match and does not need a
# man ranking himself.
#
# EVERY LINE MUST BE TRUE. She has said she hates half truths, and this is the
# screen where that is easiest to break. Replace these with real specifics.
INTRO_SCREEN = '''
<!-- 22 THE PETITIONER -->
<sc-if value="{{ s22 }}" hint-placeholder-val="{{ true }}">
<div style="position:absolute;inset:0;animation:in .09s both" data-screen-label="22 The petitioner">
  <div style="position:absolute;left:26px;right:26px;top:104px;padding:24px 22px;background:var(--white);border:3px solid var(--ink);box-shadow:8px 8px 0 rgba(36,26,16,.18)">
    <div style="height:6px;background:var(--cream2);margin:-16px -14px 18px"></div>
    <p style="margin:0;font-size:13px;letter-spacing:.18em;color:rgba(36,26,16,.55)">THE PETITIONER</p>
    <p style="margin:14px 0 0;font-size:26px;font-weight:600;line-height:1.15">Before you answer.</p>
    <p style="margin:14px 0 0;font-family:system-ui;font-size:15px;line-height:1.6;color:rgba(36,26,16,.85)">\
He builds things. This is one of them.</p>
    <p style="margin:9px 0 0;font-family:system-ui;font-size:15px;line-height:1.6;color:rgba(36,26,16,.85)">\
He will be early. You will not be kept waiting.</p>
    <p style="margin:9px 0 0;font-family:system-ui;font-size:15px;line-height:1.6;color:rgba(36,26,16,.85)">\
He would rather hear you talk than talk.</p>
    <p style="margin:9px 0 0;font-family:system-ui;font-size:15px;line-height:1.6;color:rgba(36,26,16,.85)">\
He does not need you to be anything other than what you already are.</p>
    <p style="margin:16px 0 0;font-family:system-ui;font-size:13px;line-height:1.5;color:rgba(36,26,16,.55)">\
That is the whole pitch. No one is lucky here yet.</p>
    <p style="margin:8px 0 0;font-family:system-ui;font-size:14.5px;line-height:1.5;color:rgba(36,26,16,.8)">\
You do finally get to judge the accent in person.</p>
  </div>
  <div style="position:absolute;left:22px;right:22px;bottom:56px">
    <button type="button" data-go="1" data-active="a3" style="width:100%;min-height:56px;\
border:3px solid var(--ink);background:var(--honey);font-family:'Pixelify Sans';font-size:19px;\
font-weight:600;box-shadow:0 6px 0 var(--stoneDark);cursor:pointer">Go on then.</button>
  </div>
</div>
</sc-if>

'''

COPY_FIXES = [
    # The delivery screen used to hand straight to the question. It now stops at
    # the introduction first.
    ('<div style="position:absolute;inset:0;animation:in .09s both" data-go="next" data-screen-label="00 Delivery">',
     '<div style="position:absolute;inset:0;animation:in .09s both" data-go="22" data-screen-label="00 Delivery">'),
    ("<!-- 1 THE NOTE -->", INTRO_SCREEN.strip() + "\n\n<!-- 1 THE NOTE -->"),

    # "FR" is also the texting abbreviation for "for real". She has said plainly
    # that she will not decipher messages, and this is the one rule in the spec
    # drawn from a stated dealbreaker rather than a preference.
    (">FR<", ">FRI<"),
    (">SA<", ">SAT<"),
    # The screen lets her choose the weather, so asking her to report it reads as
    # a question she cannot answer. Handing her the power makes the disclaimer
    # underneath ("this is not binding") the punchline instead of a correction.
    ("What is the sky doing?", "You decide the sky."),
    # NOTE: "silly goose" is hers. It was briefly put in his mouth here and taken
    # straight back out. Her signature line said in his voice reads as borrowing
    # her personality, not as noticing it. If it is ever used, it has to be
    # attributed to her ("you would call this...") rather than spoken as his own.

    # Give the castle a way onward, and add the closing screen after it.
    ("<!-- 20 LEFT -->", CLOSING_SCREEN.strip() + "\n\n<!-- 20 LEFT -->"),
    ('<div style="position:relative;margin:0 22px 34px;padding:16px 18px;'
     'background:var(--cream);border:3px solid var(--ink)">',
     '<div style="position:relative;margin:0 22px 12px;padding:16px 18px;'
     'background:var(--cream);border:3px solid var(--ink)">'),
    # The button that carries her off the castle. Sits under the card, in the
    # margin the card just gave back.
    ('</p>\n  </div>\n</div>\n</sc-if>\n\n<!-- 21 THE WAIT -->',
     # The castle had exactly one button and no way out. She has just been shown
     # her throne, which is the likeliest moment to think "actually, not Friday",
     # so the same escape the closing screen offers belongs here too. The gate is
     # deliberately gone by this point: she has sealed, so the exit is "change it",
     # not "leave".
     '</p>\n  </div>\n'
     # position:relative is load-bearing, not decoration. This row is in normal
     # flow, and CSS paints positioned elements above non-positioned block-level
     # siblings: the absolutely-positioned carpet was drawn straight over the top
     # of it, so the buttons measured fine and were invisible on screen. The card
     # above only survived because it happens to be position:relative already.
     '  <div style="position:relative;z-index:2;margin:0 22px 30px;display:flex;gap:10px">\n'
     '    <button type="button" data-act="sendback" data-active="a3" style="flex:1;min-height:50px;'
     "border:3px solid var(--ink);background:var(--honey);font-family:'Pixelify Sans';"
     'font-size:15px;font-weight:600;box-shadow:0 5px 0 var(--stoneDark);cursor:pointer">'
     'Send the pigeon back</button>\n'
     '    <button type="button" data-act="restart" data-active="a3" style="flex:1;min-height:50px;'
     "border:3px solid var(--ink);background:var(--cream);font-family:'Pixelify Sans';"
     'font-size:16px;box-shadow:0 5px 0 var(--stoneDark);cursor:pointer">'
     'Change something</button>\n'
     '  </div>\n</div>\n</sc-if>\n\n<!-- 21 THE WAIT -->'),

    # His "red" swatch was var(--terra) (#c25f2e), which is terracotta. Picking
    # red dressed him in orange. dressUp() reads the colour straight off the
    # swatch, so correcting it here corrects his torso on every screen.
    ('data-set="colour:red" style="min-height:52px;border:3px solid var(--ink);background:var(--terra)',
     'data-set="colour:red" style="min-height:52px;border:3px solid var(--ink);background:#b32330'),

    # Mark his figure so his skin can differ from hers.
    ('<div style="position:absolute;left:26px;bottom:32%;width:52px;height:74px">',
     '<div data-him style="position:absolute;left:26px;bottom:32%;width:52px;height:74px">'),
    # Mark his figure so his skin can differ from hers.
    ('<div style="position:absolute;right:20px;bottom:266px;width:52px;height:76px">',
     '<div data-him style="position:absolute;right:20px;bottom:266px;width:52px;height:76px">'),
    # Mark his figure so his skin can differ from hers.
    ('<div style="position:relative;width:104px;height:152px">',
     '<div data-him style="position:relative;width:104px;height:152px">'),
    # No em dashes anywhere in what she reads.
    ("STOP 01 — THE DECREE", "STOP 01 · THE DECREE"),
    ("Pigeon: fed and released — it may come back, they tend to.",
     "Pigeon: fed and released. It may come back, they tend to."),

    # Her dress. The canvas painted it --rose (#dc8f79), a dusty salmon that reads
    # brown on a phone. Pointed at its own token so it is one knob, not six edits.
    # Only her torso and skirt match these two shapes; every other --rose in the
    # canvas is a flower or a falling petal and must stay put.
    ("left:13px;top:30px;width:26px;height:28px;background:var(--rose)",
     "left:13px;top:30px;width:26px;height:28px;background:var(--dress)"),
    ("left:11px;top:44px;width:30px;height:14px;background:var(--rose)",
     "left:11px;top:44px;width:30px;height:14px;background:var(--dress)"),

    # The throne in the final frame was always the same gilded one. It is now the
    # throne she actually chose, set by script.js. Her escort still sits on it.
    ('<div style="position:absolute;left:50%;bottom:212px;transform:translateX(-50%);'
     'width:116px;height:126px;background:var(--honey);border:4px solid var(--ink)">',
     # The whole dais was drawn behind the info card, which starts 226px off the
     # bottom: the steps existed and were simply never visible, and the card cut
     # the throne's feet off. Everything now sits above 240px.
     #
     # A carpet runs the length of the floor to the foot of the steps, so the eye
     # is led up to the throne rather than just finding it there.
     '<div style="position:absolute;left:50%;bottom:0;transform:translateX(-50%);'
     'width:104px;height:250px;background:var(--terra);opacity:.55"></div>'
     '<div style="position:absolute;left:50%;bottom:0;transform:translateX(-50%);'
     'width:104px;height:250px;border-left:4px solid var(--honey);'
     'border-right:4px solid var(--honey);opacity:.5"></div>'
     # Three steps, widest at the bottom.
     '<div style="position:absolute;left:50%;bottom:240px;transform:translateX(-50%);'
     'width:244px;height:20px;background:var(--stone);border:3px solid var(--ink)"></div>'
     '<div style="position:absolute;left:50%;bottom:258px;transform:translateX(-50%);'
     'width:210px;height:20px;background:var(--stone);border:3px solid var(--ink)"></div>'
     '<div style="position:absolute;left:50%;bottom:276px;transform:translateX(-50%);'
     'width:176px;height:20px;background:var(--stone);border:3px solid var(--ink)"></div>'
     # A hanging banner behind the throne, so it has a back wall of its own.
     '<div style="position:absolute;left:50%;bottom:296px;transform:translateX(-50%);'
     'width:120px;height:196px;background:var(--terra);border:3px solid var(--ink)"></div>'
     '<div style="position:absolute;left:50%;bottom:296px;transform:translateX(-50%);'
     'width:120px;height:196px;border-top:10px solid var(--honey)"></div>'
     '<div data-art="swap" style="position:absolute;left:50%;bottom:296px;'
     'transform:translateX(-50%);width:168px;height:182px;'
     'background:var(--throneArt) no-repeat bottom center/contain;'
     'image-rendering:pixelated">'),

    # Her animals by name. Topaz is the cat, Ruby is the dog — that mapping is
    # hers, not a guess. Using the names is the whole point: "cat" is a species,
    # "Topaz" is someone she rescued.
    ('font-size:12px">cat</span>', 'font-size:12px">Topaz</span>'),
    ('font-size:12px">dog</span>', 'font-size:12px">Ruby</span>'),
    # The picked value is printed on the decree, so it has to read as a sentence
    # there too: "escort — Topaz".
    ('data-set="escort:the ginger cat"', 'data-set="escort:Topaz"'),
    ('data-set="escort:the dog"', 'data-set="escort:Ruby"'),
    # Construction was the only choice screen with no signpost — two buttons and
    # no way to know what she was approving.
    ('<div style="position:absolute;inset:0;animation:in .09s both" data-screen-label="14 Construction">',
     '<div style="position:absolute;inset:0;animation:in .09s both" data-screen-label="14 Construction">'
     + SIGNPOST.format("The castle, so far.")),
]


# His hair is black; the canvas shipped it dark brown. The value lives in two
# places outside the body markup — the :root stylesheet and the palette object —
# so it is patched where each actually is, not via the copy-fix pass.
HAIR = ("#4a2f1a", "#241a10")


def fix_hair(text, label):
    if HAIR[0] not in text:
        sys.exit(f"hair colour not found in {label} — canvas changed?")
    return text.replace(HAIR[0], HAIR[1])


# Fixes that must apply to ONE screen only. His hair on Construction and Dress is
# drawn with the same literal markup as HER hair on Delivery, so a global replace
# would recolour her too.
SCOPED_FIXES = [
    # He is drawn with var(--hair) on Delivery but hard-coded to #6b4326 — her
    # colour — on these two screens, so his hair changed between screens. Point
    # them at the same variable so there is one source of truth for his hair.
    ("14 Construction",
     'left:11px;top:0;width:30px;height:12px;background:#6b4326',
     'left:11px;top:0;width:30px;height:12px;background:var(--hair)'),
    ("16 Dress",
     'left:22px;top:0;width:60px;height:24px;background:#6b4326',
     'left:22px;top:0;width:60px;height:24px;background:var(--hair)'),

    # A fourth day. She has a veterinary thing in Auckland "in a couple weeks" and
    # may simply not know her shifts yet, so "next week" is a real answer rather
    # than a dodge. It shares the bottom row with "you choose" instead of becoming
    # a fourth card, which would squeeze the cards below a comfortable tap size.
    ("08 When",
     '<div style="position:absolute;left:22px;right:22px;bottom:84px">',
     '<div style="position:absolute;left:22px;right:22px;bottom:84px;display:flex;gap:10px">'
     '<button type="button" data-go="next" data-set="day:next week" data-active="a3"'
     ' style="flex:1;min-height:48px;border:3px solid var(--ink);background:var(--cream);'
     "font-family:'Pixelify Sans';font-size:16px;box-shadow:0 5px 0 var(--stoneDark);"
     'cursor:pointer">next week</button>'),
    ("08 When",
     'data-set="day:his choice" style="width:100%;min-height:48px;',
     'data-set="day:his choice" style="flex:1;min-height:48px;'),
]


def apply_copy_fixes(markup):
    for find, replace in COPY_FIXES:
        if find not in markup:
            sys.exit(f"copy fix no longer applies, canvas changed: {find[:60]!r}")
        markup = markup.replace(find, replace)

    for label, find, replace in SCOPED_FIXES:
        m = re.search(r'data-screen-label="' + re.escape(label) + r'".*?(?=<!-- \d\d )',
                      markup, re.S)
        if not m:
            sys.exit(f"screen {label!r} not found for scoped fix")
        block = m.group(0)
        if find not in block:
            sys.exit(f"scoped fix no longer applies on {label}: {find[:60]!r}")
        markup = markup[:m.start()] + block.replace(find, replace, 1) + markup[m.end():]
    return markup


# Generated pixel art layered into the CSS-drawn world. Everything here is
# decoration behind the interface — nothing functional is replaced, so a missing
# image degrades to the canvas's own artwork rather than breaking a screen.
PIXEL_ART = "image-rendering:pixelated;background-repeat:no-repeat"

ART_INJECTIONS = [
    # A far treeline, one band behind the existing hedges. It pans with the same
    # camera, so the world gains depth without any layout moving.
    (
        '<div style="position:absolute;left:0;top:0;width:860px;height:100%;'
        'transition:transform .42s linear;transform:translateX({{ camX }}px)">',
        # Its base sits ON the horizon — the ground starts at 44% — rather than
        # floating in mid-sky, and the art keeps its own aspect via `100% auto`
        # anchored to the bottom. Forcing `100% 100%` squashed a 16:9 strip into a
        # smeared band, which is what made it read as a mistake on screen.
        '<div style="position:absolute;left:-100px;top:0;width:calc(100% + 200px);height:44%;'
        f'background-image:url(/art-horizon.png);{PIXEL_ART};'
        'background-size:100% auto;background-position:bottom center;'
        'transition:transform .42s linear;transform:translateX(calc({{ camX }}px * .45))"></div>\n'
        '  <div style="position:absolute;left:0;top:0;width:860px;height:100%;'
        'transition:transform .42s linear;transform:translateX({{ camX }}px)">',
    ),
    # The throne room's two windows look onto flat sky. Same treeline, seen from
    # inside — the garden she walked through is visible from the throne.
    (
        '<div style="position:absolute;left:34px;top:60px;width:58px;height:150px;'
        'background:var(--skyHi);border:4px solid var(--ink)">',
        '<div style="position:absolute;left:34px;top:60px;width:58px;height:150px;'
        f'background:var(--skyHi) url(/art-horizon.png) no-repeat bottom/150% auto;'
        'image-rendering:pixelated;border:4px solid var(--ink)">',
    ),
    (
        '<div style="position:absolute;right:34px;top:60px;width:58px;height:150px;'
        'background:var(--skyHi);border:4px solid var(--ink)">',
        '<div style="position:absolute;right:34px;top:60px;width:58px;height:150px;'
        f'background:var(--skyHi) url(/art-horizon.png) no-repeat bottom/150% auto;'
        'image-rendering:pixelated;border:4px solid var(--ink)">',
    ),
    # The delivery. The canvas flew the pigeon on an infinite loop from off-screen
    # left to roughly mid-screen — so it never started at him, never reached her,
    # and never landed. It is the first thing she sees and it is the premise of the
    # whole page, so it now flies once, him to her, and stays put.
    #
    # The wrapper is full-bleed on purpose: percentage translations resolve against
    # the element's own box, so a 100%-size wrapper gives motion in screen widths
    # and lands correctly at any phone size.
    (
        '<div style="position:absolute;left:0;top:0;animation:fly 3.6s steps(9,end) infinite">',
        # `both`, not `forwards`. During the delay the 0% keyframe applies, so the
        # pigeon waits in his hands where she can see it before it goes. With
        # `forwards` it sat at the LANDED position until the delay elapsed, which
        # is why it looked half-delivered the instant the page opened.
        '<div style="position:absolute;left:0;top:0;width:100%;height:100%;'
        'pointer-events:none;transform:translate(72.5%,62%);'
        'animation:deliver 3.4s steps(11,end) 1.1s both">',
    ),
    # Wings beat only while it is actually flying: same delay, then ~19 beats
    # across the 3.4s flight, then still.
    (
        'animation:flap .18s steps(2,end) infinite alternate"></div>\n'
        '      <div style="position:absolute;left:-8px;top:4px;',
        'animation:flap .18s steps(2,end) 1.1s 19 alternate both"></div>\n'
        '      <div style="position:absolute;left:-8px;top:4px;',
    ),
    # The scroll unrolls instead of being there already. clip-path reveals it
    # top-down without scaling, so the text inside never stretches; steps() keeps
    # the reveal chunky rather than a smooth wipe.
    (
        '<div style="position:absolute;left:56px;right:24px;top:100px;bottom:140px;'
        'background:var(--white);border:3px solid var(--ink);'
        'display:flex;flex-direction:column">',
        '<div style="position:absolute;left:56px;right:24px;top:100px;bottom:140px;'
        'background:var(--white);border:3px solid var(--ink);'
        'display:flex;flex-direction:column;animation:unroll 1s steps(14,end) both">',
    ),
    # The drink. The whole design is built around this one screen, so it gets the
    # real glass rather than a stack of rectangles.
    (
        '<div style="position:relative;width:112px;height:160px">',
        '<div data-art="swap" style="position:relative;width:112px;height:160px;'
        'background:url(/art-drink.png) no-repeat center/contain;'
        'image-rendering:pixelated">',
    ),
    # The note in the pigeon's feet — the thing actually being delivered.
    (
        '<div style="position:absolute;right:-14px;top:6px;width:14px;height:7px;'
        'background:var(--cream)"></div>',
        '<div style="position:absolute;right:-16px;top:4px;width:18px;height:12px;'
        'background:url(/art-scroll.png) no-repeat center/contain;'
        'image-rendering:pixelated"></div>',
    ),
    # The way out. The canvas drew it as a wooden gate on the left edge at 32% —
    # which put it directly where her avatar walks, in the same brown as the
    # signposts, labelled like a place to go rather than a way to stop. All three
    # made it read as scenery she kept bumping into.
    #
    # It is now chrome: quiet, cornered, out of the thumb zone so a terminal
    # action cannot be fumbled into, and worded the way the decline screen is.
    (
        '<div data-go="leave" style="position:absolute;left:0;bottom:32%;width:44px;'
        'height:76px;background:var(--wood);border:3px solid var(--ink);'
        'border-left:none;cursor:pointer;z-index:45">\n'
        '  <div style="position:absolute;left:0;right:0;top:10px;height:5px;background:var(--woodHi)"></div>\n'
        '  <div style="position:absolute;left:0;right:0;top:34px;height:5px;background:var(--woodHi)"></div>\n'
        '  <div style="position:absolute;left:0;right:0;bottom:6px;text-align:center;'
        'font-size:11px;color:var(--cream)">gate</div>\n'
        '</div>',
        '<button type="button" data-go="leave" data-active="exit" aria-label="Leave"'
        ' style="position:absolute;right:10px;top:10px;height:44px;padding:0 14px;'
        'display:flex;align-items:center;justify-content:center;'
        'background:rgba(246,231,196,.82);border:2px solid rgba(36,26,16,.5);'
        'color:rgba(36,26,16,.72);font-family:\'Pixelify Sans\';font-size:14px;'
        'cursor:pointer;z-index:45">leave</button>',
    ),
    # Landmarks either side of the road. The map is a three-quarter view, which is
    # the view these ruins are drawn in, so they stand correctly here. The canvas
    # already puts two flat --forest blocks in these spots; these replace them.
    (
        '<div style="position:absolute;right:20px;bottom:64px;width:74px;height:46px;'
        'background:var(--forest);animation:sway 2.6s steps(2,end) infinite alternate"',
        '<div style="position:absolute;right:18px;bottom:58px;width:78px;height:92px;'
        'background:url(/art-ruin-tree.png) no-repeat bottom center/contain;'
        'image-rendering:pixelated;animation:sway 2.6s steps(2,end) infinite alternate"',
    ),
    (
        '<div style="position:absolute;right:14px;bottom:40px;width:80px;height:46px;'
        'background:var(--forest);animation:sway 3.2s steps(2,end) infinite alternate"',
        # Further up the road, not down at bottom:40px. She stands at the start of
        # the path and this landed squarely on her head.
        '<div style="position:absolute;left:14px;bottom:196px;width:56px;height:60px;'
        'background:url(/art-ruin-stones.png) no-repeat bottom center/contain;'
        'image-rendering:pixelated"',
    ),
    # The castle on the horizon — the thing she walks toward for the whole game.
    # The drawn one is a few blocks; this gives the destination something worth
    # arriving at. Same box, same position, so nothing shifts.
    (
        '<div style="position:absolute;left:50%;top:48px;transform:translateX(-50%);'
        'width:120px;height:86px">',
        # A dragon over the far hills. It is the one borrowed sprite that survives
        # being snapped to this palette, and a castle on the horizon is exactly
        # where a fairytale wants one. Small and drifting, never in the way.
        '<div style="position:absolute;right:16px;top:14px;width:58px;height:64px;'
        'background:url(/art-dragon.png) no-repeat center/contain;'
        'image-rendering:pixelated;opacity:.9;pointer-events:none;'
        'animation:soar 11s ease-in-out infinite alternate"></div>\n  '
        '<div data-art="castle" style="position:absolute;left:50%;top:48px;'
        'transform:translateX(-50%);width:120px;height:86px;'
        'background:url(/art-castle.png) no-repeat bottom center/contain;'
        'image-rendering:pixelated">',
    ),
    (
        '<div style="position:absolute;left:50%;top:38px;transform:translateX(-50%);'
        'width:140px;height:96px">',
        '<div style="position:absolute;left:18px;top:10px;width:50px;height:55px;'
        'background:url(/art-dragon.png) no-repeat center/contain;'
        'image-rendering:pixelated;opacity:.82;pointer-events:none;'
        'animation:soar 13s ease-in-out infinite alternate-reverse"></div>\n  '
        '<div data-art="castle" style="position:absolute;left:50%;top:38px;'
        'transform:translateX(-50%);width:140px;height:96px;'
        'background:url(/art-castle.png) no-repeat bottom center/contain;'
        'image-rendering:pixelated">',
    ),
]


def apply_art(markup):
    for find, replace in ART_INJECTIONS:
        if find not in markup:
            sys.exit(f"art injection no longer applies, canvas changed:\n  {find[:110]!r}")
        markup = markup.replace(find, replace, 1)
    return paint_sprites(plant_foliage(markup))


def paint_box(markup, start, tag, url, mode, size="contain", pos="bottom center", where="forward"):
    """Paint a background image onto an element located relative to an anchor.

    Anchored on position rather than on the style string, because the canvas gives
    every swatch in a row an identical style — a literal replace cannot tell the
    cat button from the dog button.

    where "forward": the next <tag> after the anchor (the swatch inside a button).
    where "self":    the <tag> the anchor sits inside (the button itself).
    mode  "swap":    hide the drawn shapes underneath. "behind": keep them (labels).

    Attribute order is not assumed — the style attribute is found within the tag.
    """
    if where == "self":
        j = markup.rindex(f"<{tag}", 0, start)
    else:
        j = markup.index(f"<{tag}", start)
    end = markup.index(">", j)
    seg = markup[j:end]

    paint = (f"background-image:url({url});background-repeat:no-repeat;"
             f"background-position:{pos};background-size:{size};image-rendering:pixelated")

    m = re.search(r'style="([^"]*)"', seg)
    if m:
        seg = seg[:m.start()] + f'style="{m.group(1)};{paint}"' + seg[m.end():]
    else:
        seg += f' style="{paint}"'
    seg = seg.replace(f"<{tag}", f'<{tag} data-art="{mode}"', 1)
    return markup[:j] + seg + markup[end:]


# Sprites painted onto elements located by an anchor string rather than by style.
SPRITES = [
    # (anchor, tag, url, mode, size, position)
    ('data-set="escort:Topaz"', "span", "/art-cat.png", "swap", "contain", "bottom center", "forward"),
    ('data-set="escort:Ruby"', "span", "/art-dog.png", "swap", "contain", "bottom center", "forward"),
    ('data-set="escort:the duck"', "span", "/art-duck.png", "swap", "contain", "bottom center", "forward"),
    ('data-set="escort:the chicken"', "span", "/art-hen.png", "swap", "contain", "bottom center", "forward"),
    ('data-set="throne:the gilded one"', "span", "/art-throne-gilded.png", "swap", "contain", "bottom center", "forward"),
    ('data-set="throne:the beanbag"', "span", "/art-throne-beanbag.png", "swap", "contain", "bottom center", "forward"),
    ('data-set="throne:the one with a cat on it"', "span", "/art-throne-cat.png", "swap", "contain", "bottom center", "forward"),
    # The seal keeps its label on top — the art sits behind "PRESS" / "SEALED".
    ('data-act="seal"', "button", "/art-seal.png", "behind", "86%", "center", "self"),
]


# The parallax layer draws its trees as plain filled rectangles. On screen they
# read as flat dark slabs, which is the single most conspicuous thing in the world
# behind every screen. Matched by shape rather than by literal string so the canvas
# can move them around without breaking the build.
BIG_FOLIAGE = re.compile(
    r'<div style="(position:absolute;left:-?\d+px;top:\d+%;width:(\d+)px;'
    r'height:\d+px;)background:var\(--forest\);([^"]*)"'
)
# Rotated across the big --forest slabs in the parallax layer. Mixing the drawn
# tree and hedge with borrowed rock and crystal gives the world behind every
# screen some variety, and it costs nothing: the slabs already existed, already
# sway, and already sit behind the interface.
FOLIAGE_ART = ["/art-tree.png", "/art-boulder.png", "/art-hedge.png",
               "/art-crystal.png", "/art-tree.png"]


def plant_foliage(markup):
    """Swap the big --forest slabs for real trees and hedges."""
    n = [0]

    def repl(m):
        head, width, tail = m.group(1), int(m.group(2)), m.group(3)
        if width < 100:                       # leave grass blades and far hedgerows alone
            return m.group(0)
        art = FOLIAGE_ART[n[0] % len(FOLIAGE_ART)]
        n[0] += 1
        return (f'<div style="{head}{tail};'
                f"background:url({art}) no-repeat bottom center/contain;"
                f'image-rendering:pixelated"')

    markup = BIG_FOLIAGE.sub(repl, markup)
    if n[0] == 0:
        sys.exit("no foliage slabs matched — canvas structure changed?")
    print(f"  planted {n[0]} trees and hedges")
    return markup


def paint_sprites(markup):
    for anchor, tag, url, mode, size, pos, where in SPRITES:
        i = markup.find(anchor)
        if i < 0:
            sys.exit(f"sprite anchor missing, canvas changed: {anchor!r}")
        markup = paint_box(markup, i, tag, url, mode, size, pos, where)

    # The escort that follows her: three placeholders, each tinted with --escA.
    # The image is a variable so script.js can point it at whichever animal she
    # picked, without this build knowing which.
    followers = [
        ('<div style="position:absolute;left:74px;bottom:8px;width:52px;height:40px">',
         '<div data-art="swap" style="position:absolute;left:74px;bottom:8px;width:52px;height:40px;'
         'background:var(--escortArt) no-repeat bottom center/contain;image-rendering:pixelated">'),
        ('<div style="position:absolute;left:50%;bottom:262px;transform:translateX(-50%);'
         'width:64px;height:52px;animation:bob 2.4s steps(2,end) infinite alternate">',
         # Raised to match the taller throne, or it perches halfway up the leg.
         '<div data-art="swap" style="position:absolute;left:50%;bottom:372px;'
         'transform:translateX(-50%);width:64px;height:52px;'
         'animation:bob 2.4s steps(2,end) infinite alternate;'
         'background:var(--escortArt) no-repeat bottom center/contain;image-rendering:pixelated">'),
    ]
    for find, replace in followers:
        if find not in markup:
            sys.exit(f"escort follower missing, canvas changed:\n  {find[:100]!r}")
        markup = markup.replace(find, replace)
    return markup


def strip_chrome(markup):
    markup, n = STAGE.subn(lambda m: f'<main id="app" style="{m.group(1)}">', markup)
    if n != 1:
        sys.exit(f"expected exactly one stage container, found {n} — canvas structure changed?")
    markup = FAKE_HARDWARE.sub("", markup)
    # The stage's own closing tag is now </main>; the outer backdrop div stays.
    markup = re.sub(r"</div>\s*</div>\s*$", "</main>\n</div>", markup.rstrip())
    return markup


def convert_conditionals(markup):
    """<sc-if value="{{ x }}"> -> <div data-if="x">. Stack-safe, so nesting survives."""
    out, depth = [], 0
    pos = 0
    token = re.compile(r'<sc-if\s+value="\{\{\s*([\w.]+)\s*\}\}"[^>]*>|</sc-if>')
    for m in token.finditer(markup):
        out.append(markup[pos:m.start()])
        if m.group(0).startswith("</"):
            depth -= 1
            out.append("</div>")
        else:
            depth += 1
            out.append(f'<div data-if="{m.group(1)}" hidden>')
        pos = m.end()
    out.append(markup[pos:])
    if depth != 0:
        sys.exit(f"unbalanced sc-if (depth {depth})")
    return "".join(out)


# Templates that must survive the {{ }} pass are parked behind opaque tokens and
# restored once, at the very end. Shared so nothing gets parked twice.
_parked = []


def park(value):
    _parked.append(value)
    return f"__TPL{len(_parked) - 1}__"


def unpark(markup):
    for i, val in enumerate(_parked):
        markup = markup.replace(f"__TPL{i}__", html.escape(val, quote=True))
    return markup


def convert_loops(markup):
    """sc-for becomes an empty host carrying its row template.

    The template travels with the markup rather than being copied into script.js —
    the canvas restyles these rows freely, and a hand-copy silently goes stale.
    """
    def repl(m):
        name, inner = m.group(1), m.group(2).strip()
        return (f'<div data-for="{name}" style="display:contents" '
                f'data-tpl="{park(inner)}"></div>')

    return re.sub(
        r'<sc-for\s+list="\{\{\s*(\w+)\s*\}\}"[^>]*>(.*?)</sc-for>',
        repl, markup, flags=re.S,
    )


def extract_palette(raw):
    """Lift `const SUNNY = {...}` and `const RAMPS = {...}` out of the canvas.

    Brace-matched rather than regexed, because RAMPS nests one level deep.
    Emitted verbatim so script.js never carries a second copy of the palette.
    """
    out = {}
    for name in ("SUNNY", "RAMPS"):
        start = raw.find(f"const {name} = {{")
        if start < 0:
            sys.exit(f"could not find `const {name}` in the canvas")
        open_brace = raw.index("{", start)
        depth, i = 0, open_brace
        while i < len(raw):
            if raw[i] == "{":
                depth += 1
            elif raw[i] == "}":
                depth -= 1
                if depth == 0:
                    break
            i += 1
        # Note: SUNNY carries no `hair`, `skin` or `esc*` key — those live only in
        # the :root stylesheet, so applyRamp never overrides them and they survive
        # every weather change untouched.
        out[name] = raw[open_brace:i + 1]
    return out


def extract_active_styles(markup, sheet):
    """style-active="..." is a canvas feature. Emit a real :active rule per element."""
    seen = {}

    def repl(m):
        css = m.group(1)
        cls = seen.setdefault(css, f"a{len(seen)}")
        return f' data-active="{cls}"'

    markup = re.sub(r'\s*style-active="([^"]*)"', repl, markup)
    for css, cls in seen.items():
        body = ";".join(f"{d.strip()} !important" for d in css.split(";") if d.strip())
        sheet.append(f'[data-active="{cls}"]:active{{{body}}}')
    return markup


def convert_bindings(markup):
    """{{ x }} in an attribute -> data-tpl-attr; in text -> <span data-bind>.

    Attribute templates are parked behind opaque tokens first, so the text pass
    below cannot rewrite the very bindings the template needs to keep.
    """
    # Drop the canvas's own tap wiring; the real script delegates from document.
    markup = re.sub(r'\s*onClick="\{\{\s*\w+\s*\}\}"', "", markup)

    binding = re.compile(r"\{\{[^}]*\}\}")

    def attrs(m):
        tag = m.group(0)
        if "{{" not in tag:
            return tag
        extra = ""
        for attr, val in re.findall(r'([\w-]+)="([^"]*\{\{[^"]*)"', tag):
            extra += f' data-tpl-{attr}="{park(val)}"'
            # Neutralise the live attribute so nothing renders literally pre-JS.
            tag = tag.replace(f'{attr}="{val}"', f'{attr}="{binding.sub("0", val)}"')
        return tag[:-1] + extra + ">"

    markup = re.sub(r"<[a-zA-Z][^>]*>", attrs, markup)

    # Text-node bindings.
    return re.sub(
        r"\{\{\s*([\w.]+)\s*\}\}",
        lambda m: f'<span data-bind="{m.group(1)}"></span>',
        markup,
    )


def main():
    if not SRC.exists():
        sys.exit(f"missing {SRC}")
    raw = SRC.read_text(encoding="utf-8")

    helmet = re.search(r"<helmet[^>]*>(.*?)</helmet>", raw, re.S)
    body = re.search(r"<x-dc>(.*?)</x-dc>", raw, re.S)
    if not (helmet and body):
        sys.exit("could not find <helmet> or <x-dc> in the canvas")

    head = helmet.group(1)
    fonts = "\n".join(re.findall(r"<link[^>]*>", head))
    base_css = fix_hair(re.search(r"<style>(.*?)</style>", head, re.S).group(1).strip(), ":root")

    markup = body.group(1).replace(helmet.group(0), "")
    markup = apply_copy_fixes(markup)
    markup = apply_art(markup)
    markup = strip_chrome(markup)
    markup = convert_conditionals(markup)
    markup = convert_loops(markup)

    sheet = [base_css]
    markup = extract_active_styles(markup, sheet)
    markup = convert_bindings(markup)
    markup = unpark(markup)   # restore every parked template, exactly once

    sheet.append(
        "\n/* --- real-device overrides ---------------------------------------- */\n"
        "/* The canvas is already a responsive max-width column; keep its layout\n"
        "   and only add what a real phone needs. */\n"
        "html,body{height:100%;overflow:hidden;overscroll-behavior:none}\n"
        "#app{padding:env(safe-area-inset-top) env(safe-area-inset-right) "
        "env(safe-area-inset-bottom) env(safe-area-inset-left)}\n"
        "#app>div[data-if]{position:absolute;inset:0}\n"
        "button{font:inherit;color:inherit}\n"
        "[hidden]{display:none!important}\n"
        "\n/* Dress screen: his torso is the one element painted with --escOutfit,\n"
        "   so it is also where the formal yoke lands. Selected swatches get a ring\n"
        "   — tapping a colour has to visibly agree with her. */\n"
        '#app [style*="--escOutfit"]{box-shadow:var(--escCollar,none)}\n'
        "[data-chosen]{outline:3px solid var(--ink);outline-offset:3px}\n"
        '[data-act="cut"][data-chosen]{background:var(--honey)!important}\n'
        "\n/* The drawn horizon castle is replaced by artwork; its block towers stay\n"
        "   in the markup as the fallback if the image ever fails to load. */\n"
        '[data-art="castle"]>div{display:none}\n'
        "/* Painted sprites replace the drawn shapes underneath; the shapes stay in\n"
        "   the markup as the fallback if an image ever fails to load. 'behind'\n"
        "   keeps its children, because the seal has a label on top of it. */\n"
        '[data-art="swap"]>*{display:none}\n'
        "\n/* Her dress. Its own token so it is one knob rather than six edits, and\n"
        "   so it never drifts when the canvas restyles --rose for flowers. */\n"
        # Green, and specifically a green with blue in it. The scene's greens are
        # yellowish (moss #4f8040, leaf #7cb14f), so an olive or forest dress
        # camouflages her against her own garden. Emerald is saturated and cooler
        # than the grass, so she stays a figure rather than becoming shrubbery.
        # #16624f is the cooler alternative; #26492f reads dark and murky.
        ":root{--dress:#197a4b}\n"
        "\n/* His skin. Matched on his figure rather than on coordinates, because\n"
        "   his arms sit at exactly the same coordinates as hers and a coordinate\n"
        "   match would recolour her too. */\n"
        ":root{--skinHim:#8a5a3b}\n"
        '[data-him] [style*="var(--skin)"]{background:var(--skinHim)!important}\n'
        "\n/* The way out. Deliberately the quietest control on screen — always\n"
        "   present, never competing, and far from the thumb so a terminal action\n"
        "   cannot be pressed by accident. */\n"
        '[data-active="exit"]:active{transform:translateY(2px);'
        "background:rgba(246,231,196,.95)!important}\n"
        "\n/* The pigeon's delivery: from him, over the garden, to her — once.\n"
        "   The wrapper's resting transform IS the landed position, so reduced-motion\n"
        "   users (whose animations are killed above) see it arrived rather than\n"
        "   parked in the top-left corner. */\n"
        "/* The scroll unrolling. clip-path reveals top-down without scaling, so\n"
        "   nothing inside stretches; steps() keeps it chunky rather than a wipe. */\n"
        "@keyframes unroll{from{clip-path:inset(0 0 100% 0)}to{clip-path:inset(0 0 0 0)}}\n"
        "/* The dragon drifting over the far hills. Slow and small; it is scenery,\n"
        "   not an event. */\n"
        "@keyframes soar{from{transform:translate(0,0)}to{transform:translate(-26px,10px)}}\n"
        "/* And the pigeon going back the other way at the end. */\n"
        # Starts at her raised hand, not in mid-air. She is standing on this
        # screen now, and the bird has to leave from her or she is not the one
        # sending it.
        "@keyframes gohome{"
        "0%{transform:translate(80%,58%)}"
        "45%{transform:translate(40%,30%)}"
        "100%{transform:translate(2%,36%)}}\n"
        # Lands at her hand, not above her head. At 70%/52% the bird finished 46px
        # up and 11px clear of her, hovering beside her ear; the note it carries
        # now reaches her fingers instead. Her hand sits at roughly (359, 575) in
        # a 430x910 stage, and on this wrapper the percentages are the bird's own
        # left and top, so these numbers are readable as coordinates.
        "@keyframes deliver{"
        "0%{transform:translate(6%,44%)}"
        "55%{transform:translate(40%,30%)}"
        "100%{transform:translate(72.5%,62%)}}\n"
    )

    css_text = "\n".join(sheet) + "\n"
    (ROOT / "style.css").write_text(css_text, encoding="utf-8")

    # Content-hashed asset URLs. Without these a cached style.css or script.js
    # survives a redeploy, and she gets last week's build.
    def stamp(name, text=None):
        body = text if text is not None else (ROOT / name).read_text(encoding="utf-8")
        return f"/{name}?v={hashlib.sha1(body.encode()).hexdigest()[:8]}"

    css_url = stamp("style.css", css_text)
    js_url = stamp("script.js")

    pal = extract_palette(raw)
    palette_js = f"window.__PALETTE__={{SUNNY:{pal['SUNNY']},RAMPS:{pal['RAMPS']}}};"

    page = f"""<!doctype html>
<html lang="en-NZ">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>{TITLE}</title>
<meta name="description" content="{BLURB}">
<meta name="theme-color" content="#c3e0e4">

<meta property="og:type" content="website">
<meta property="og:url" content="{SITE}/">
<meta property="og:title" content="{TITLE}">
<meta property="og:description" content="{BLURB}">
<meta property="og:image" content="{SITE}/og.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="A pixel-art pigeon in flight, carrying a rolled note.">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{TITLE}">
<meta name="twitter:description" content="{BLURB}">
<meta name="twitter:image" content="{SITE}/og.png">
{fonts}
<link rel="stylesheet" href="{css_url}">
</head>
<body>
{markup.strip()}
<script>{palette_js}</script>
<script src="{js_url}"></script>
</body>
</html>
"""
    (ROOT / "index.html").write_text(page, encoding="utf-8")

    screens = len(re.findall(r'data-if="s\d+"', markup))
    print(f"wrote index.html ({len(page) // 1024} KB, {screens} screens) and style.css")


if __name__ == "__main__":
    main()
