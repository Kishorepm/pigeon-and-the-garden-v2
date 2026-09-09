// The whole game. One state object, one render pass, one POST at the end.
// The render never waits on the network.
(function () {
  'use strict';

  // --- palette (the light repaints the world; sprites never change) ---------
  // Lifted out of the design canvas at build time. Never hand-copy these — the
  // canvas rewrites the whole palette between revisions, and a stale copy here
  // would repaint the site in last week's colours on the first screen.
  var PALETTE = window.__PALETTE__ || { SUNNY: {}, RAMPS: {} };
  var SUNNY = PALETTE.SUNNY;
  var RAMPS = PALETTE.RAMPS;

  // 20 is the decline screen; 21 is the closing beat after the castle.
  var LAST = 22;

  var REDUCED = !!(window.matchMedia
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  // The decree headline, keyed off the place she picked. Keys are the data-set
  // values from the "Where are we eating?" screen — change one there and it must
  // change here, which is why the fallback is a real line rather than an empty
  // string. "his choice" is deliberately absent: it falls through to "Food,
  // then.", which is his line and the honest answer when she defers.
  var VERDICTS = {
    'one with a garden': 'A table in a garden, then.',
    'one with animals nearby': 'Animals again, then.',
    'quiet and indoors': 'Somewhere quiet, then.'
  };

  var state = {
    i: 0,
    picks: {},          // lives in memory, dies with the tab. Nothing stored.
    dodges: 0,
    noX: 0, noY: 0, noR: 0,
    confirmingNo: false,
    sealed: false,
    sealScale: 1,
    notified: false,
    opened: false       // the curtain is up until she taps the note
  };

  // --- dawn ------------------------------------------------------------------
  // The world starts before sunrise and comes up as she opens the note. This is
  // a palette swap, not a scrim: the same mechanism the weather ramps use, so
  // every sprite is repainted rather than dimmed behind a sheet of grey.
  //
  // The night values are DERIVED from SUNNY rather than written down, so the
  // canvas stays the only place a colour is authored — a hand-written night
  // palette would go stale the moment the canvas is regenerated.
  var NIGHT = '#101a26';          // what everything tends toward before sunrise
  var DAWN_FROM = 0.55;           // how far toward NIGHT the world starts
  // Discrete steps, not a smooth fade. Pixel art does day/night as palette
  // swaps, and stepping keeps it in register with the rest of the world.
  var DAWN_STEPS = [0.55, 0.42, 0.30, 0.19, 0.10, 0.04, 0];
  // Extra tokens that live in the stylesheet rather than in SUNNY. Without these
  // her dress and his skin stay at full daylight while everything else is dark.
  var EXTRA_TOKENS = ['dress', 'skinHim', 'hair'];
  var extras = null;

  function readExtras() {
    if (extras) return extras;
    var cs = getComputedStyle(document.documentElement);
    extras = {};
    EXTRA_TOKENS.forEach(function (k) {
      var v = cs.getPropertyValue('--' + k).trim();
      if (v) extras[k] = v;
    });
    return extras;
  }

  function hexToRgb(h) {
    h = h.trim();
    if (h.length === 4) h = '#' + h[1] + h[1] + h[2] + h[2] + h[3] + h[3];
    return [parseInt(h.substr(1, 2), 16), parseInt(h.substr(3, 2), 16), parseInt(h.substr(5, 2), 16)];
  }

  function mix(hex, target, t) {
    if (!/^#[0-9a-f]{3,6}$/i.test(hex)) return hex;   // leave anything exotic alone
    var a = hexToRgb(hex), b = hexToRgb(target);
    return '#' + a.map(function (v, i) {
      return Math.round(v + (b[i] - v) * t).toString(16).padStart(2, '0');
    }).join('');
  }

  function applyDawn(amount) {
    var s = document.documentElement.style;
    var curtain = document.getElementById('curtain');
    var base = Object.assign({}, SUNNY, readExtras());
    Object.keys(base).forEach(function (k) {
      s.setProperty('--' + k, amount ? mix(base[k], NIGHT, amount) : base[k]);
      // The note is the one lit thing in the frame — it is what she is reading,
      // and a dimmed parchment reads as dirty concrete rather than paper. Scope
      // the pristine palette to the curtain so the dawn never touches it.
      if (curtain) curtain.style.setProperty('--' + k, base[k]);
    });
    // A night sky, derived rather than invented: the palette's darkest colour
    // pulled toward blue. There is no dark blue in the 24, and hand-writing one
    // would be the first colour on this site that came from nowhere.
    if (curtain) curtain.style.setProperty('--nightSky', mix(SUNNY.shadow, NIGHT, 0.55));
  }

  // Walk the steps, then hand the palette to applyLight(), which carries it on
  // through golden hour for the rest of the road.
  function sunrise() {
    if (REDUCED) { applyLight(lightAt(state.i)); return; }
    DAWN_STEPS.forEach(function (amount, n) {
      setTimeout(function () {
        if (amount) applyDawn(amount);
        else applyLight(lightAt(state.i));
      }, n * 230);
    });
  }

  function openTheNote() {
    if (state.opened) return;
    var curtain = document.getElementById('curtain');
    // Start the garden moving and the sun coming up WHILE the note fades, so the
    // two halves are one movement rather than a cut followed by an effect.
    document.documentElement.setAttribute('data-opened', '');
    var theme = document.querySelector('meta[name="theme-color"]');
    if (theme) theme.setAttribute('content', '#c3e0e4');
    sunrise();
    if (curtain && !REDUCED) {
      curtain.setAttribute('data-lifting', '');
      setTimeout(function () { state.opened = true; render(); }, 480);
    } else {
      state.opened = true;
      render();
    }
  }

  // --- one fire-and-forget POST ---------------------------------------------
  function tell(choice, picks) {
    // Leaving is final and silent afterwards. Sealing can happen more than once,
    // because she can go back and change something: the second message has to
    // arrive, or he acts on choices she has already replaced.
    if (state.left) return;
    if (choice === 'left') {
      if (state.notified) return;
      state.left = true;
    }
    state.notified = true;
    var body = picks ? { choice: choice, picks: picks } : { choice: choice };
    if (choice === 'sealed') {
      if (state.sealedOnce) body.updated = true;
      state.sealedOnce = true;
    }
    try {
      fetch('/api/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        keepalive: true
      }).catch(function () {});
    } catch (e) {}
    // Swallowed on purpose. A failed notification must never become her problem.
  }

  // The sky is not a question any more — asking her to pick it produced one
  // repaint and then a static world for twenty screens. It runs on its own
  // instead: late afternoon, through golden hour, into evening, advanced by the
  // screen she is on. Same mechanism as the dawn, and for the same reason — a
  // palette swap repaints every sprite, where a scrim would just grey them out.
  var GOLD = '#e8a04a';        // the sunset end of the 24, not a new colour
  var DUSK = '#2b2a46';        // where the light finally goes
  var LIGHT_FROM = 3;          // the world starts turning once she sets off
  var LIGHT_TO = 19;           // and has fully turned by the castle

  function lightAt(i) {
    return Math.max(0, Math.min(1, (i - LIGHT_FROM) / (LIGHT_TO - LIGHT_FROM)));
  }

  function applyLight(t) {
    var base = Object.assign({}, SUNNY, readExtras());
    var s = document.documentElement.style;
    // Warm first, then darken. One straight mix toward dusk skips golden hour
    // and just reads as someone switching a light off.
    var warm = Math.min(1, t / 0.55) * 0.22;
    var dark = Math.max(0, (t - 0.55) / 0.45) * 0.40;
    Object.keys(base).forEach(function (k) {
      s.setProperty('--' + k, mix(mix(base[k], GOLD, warm), DUSK, dark));
    });
    // Baked PNGs cannot recolour with the palette, so they are tinted by attribute.
    document.documentElement.setAttribute('data-weather', 'sunny');
  }

  // --- derived values, straight port of the canvas's renderVals -------------
  function vals() {
    var i = state.i, picks = state.picks;
    var v = {};
    for (var n = 0; n <= LAST; n++) v['s' + n] = (i === n);
    var w = picks.weather || 'sunny';
    var alone = picks.escort === 'no one, just her';
    var stop = Math.max(0, Math.min(11, i - 5));
    var stones = [];
    for (var m = 0; m < 11; m++) stones.push(m < stop ? 'var(--honey)' : 'var(--cream)');
    v.camX = -Math.max(0, Math.min(11, i - 2)) * 34;
    v.isSunny = w === 'sunny'; v.isOvercast = w === 'overcast'; v.isRain = w === 'light rain';
    v.inJourney = i >= 6 && i <= 16;
    // The way out stays up through the decree — the seal is the commitment, so
    // she can still stop right until she presses it. Gone afterwards: screens 18
    // and 19 are the result, and there is nothing left to leave.
    // The note over the garden, until she opens it.
    v.curtain = !state.opened;
    v.showGate = i >= 3 && i <= 17;
    // The way out asks once before it acts. Everything about the No button says
    // an accidental decline must be impossible — three dodges, then a plain
    // confirm — and this button did exactly the same thing with no guard at all,
    // 44px from where a thumb lands when you regrip a phone.
    v.gateIdle = !state.confirmingLeave;
    v.confirmLeave = !!state.confirmingLeave;
    // A way back. Not before screen 4: back from the first question is the
    // "CORRECT." beat, which is not a choice and not worth returning to.
    v.showBack = i >= 4 && i <= 17 && !state.confirmingLeave;
    // "hot" is refused, not broken. It answers, and the nudge alternates so a
    // second tap is visibly a second tap.
    v.hotNote = !state.hotTaps ? '(iced only)'
      : state.hotTaps === 1 ? 'that button has never worked.'
      : 'and it is not going to start now.';
    // The stylesheet kills transitions under prefers-reduced-motion, which would
    // leave the nudge as a permanent 5px offset rather than a movement. Zero it.
    v.hotShake = (!state.hotTaps || REDUCED) ? 0 : (state.hotTaps % 2 ? -5 : 5);
    // The last screen has two halves: the pigeon waiting with her, and the
    // pigeon gone. She decides which one she is looking at.
    v.waiting = !state.sentBack;
    v.sentBack = !!state.sentBack;
    v.stones = stones;
    v.noX = state.noX; v.noY = state.noY; v.noR = state.noR;
    v.noLabel = state.confirmingNo ? 'yes, no' : state.dodges === 0 ? 'No' : state.dodges >= 3 ? 'no…' : 'No!';
    v.escortShort = alone ? '' : (picks.escort || 'escort').replace('the ', '');
    v.hasEscort = !alone;
    v.sealScale = state.sealScale;
    v.sealLabel = state.sealed ? 'SEALED' : 'PRESS';
    v.sealHint = state.sealed ? 'Done. Nothing else to do.' : 'Press the seal.';
    v.castleLine = alone ? 'The throne is yours. Still.' : 'The throne is occupied.';
    v.castleSub = alone ? 'The crown is new. So is the table.'
                        : 'It was always going to be. The crown is new.';
    v.vPlace = picks.place || 'he chooses';
    v.vDay = picks.day || 'he chooses';
    v.vHour = picks.hour || 'he chooses';
    v.vDuration = picks.duration || 'he chooses';
    v.vDrink = picks.drink || 'iced';
    v.vFood = picks.food || 'he chooses';
    v.vBanned = picks.banned || 'nothing yet';
    v.vEscort = picks.escort || 'the escort';
    // Her throne carries over from stop 01 — the castle screen still seats her
    // escort on it. This row books the anatomy class she offered instead.
    v.vTortoise = picks.tortoise || 'a later stop';
    v.vCrown = picks.crown || 'his choice';
    // Settled at stop 01, and corrected since. Not hers to pick again.
    v.vDress = 'green, actually green';
    // The decree's headline. It used to be the literal word "Coffee" forever,
    // sitting at 29px directly above eleven rows that said something else — she
    // could pick a garden, savoury and iced and still be told "Coffee, then."
    // The cadence is his, so the derived lines keep it. Stop 01 was coffee and
    // stop 02 is the meal it never got to, so the defer path now reads "Food,
    // then." — same joke, still true on the one path where she hands it back.
    v.vVerdict = VERDICTS[picks.place] || 'Food, then.';
    return v;
  }

  // --- render: conditionals, text bindings, attribute templates, loops ------
  var tplNodes = [];
  document.querySelectorAll('[data-tpl-style]').forEach(function (el) {
    tplNodes.push({ el: el, tpl: el.getAttribute('data-tpl-style') });
  });

  function render() {
    var v = vals();
    document.querySelectorAll('[data-if]').forEach(function (el) {
      el.hidden = !v[el.getAttribute('data-if')];
    });
    document.querySelectorAll('[data-bind]').forEach(function (el) {
      var val = v[el.getAttribute('data-bind')];
      if (val !== undefined && el.textContent !== String(val)) el.textContent = String(val);
    });
    tplNodes.forEach(function (t) {
      t.el.setAttribute('style', t.tpl.replace(/\{\{\s*(\w+)\s*\}\}/g, function (_, k) {
        return v[k];
      }));
    });
    var host = document.querySelector('[data-for="stones"]');
    if (host) {
      var row = host.getAttribute('data-tpl') || '';
      var html = v.stones.map(function (bg) {
        return row.replace(/\{\{\s*st\.bg\s*\}\}/g, bg);
      }).join('');
      if (host.innerHTML !== html) host.innerHTML = html;
    }
    // Move focus so a screen reader lands on the new screen, not limbo.
    // ONLY when the screen actually changed. This used to run on every render,
    // which meant tapping a colour swatch on the Dress screen — a render, not a
    // navigation — threw focus off the swatch and back to the screen container,
    // so a keyboard user lost their place on every single pick.
    if (state.focused !== state.i) {
      var live = document.querySelector('[data-if="s' + state.i + '"]');
      if (live && !live.hidden) {
        state.focused = state.i;
        live.setAttribute('tabindex', '-1');
        live.focus({ preventScroll: true });
      }
    }
  }

  function go(n, fromHistory) {
    state.i = Math.max(0, Math.min(LAST, n));
    // Moving screen always dismisses a half-asked question.
    state.confirmingLeave = false;
    if (state.i === 20) tell('left');           // decline: choice only, no partial picks
    if (state.opened) applyLight(lightAt(state.i));
    // Give the phone's own back gesture something to go back TO. Without this
    // the whole thing is one history entry: a back swipe left the site outright,
    // and since picks live in memory and nothing is stored, returning restarted
    // her from screen zero with everything gone.
    if (!fromHistory) {
      try { history.pushState({ i: state.i }, ''); } catch (e) {}
    }
    render();
    window.scrollTo(0, 0);
  }

  // Back gesture / browser back. tell() already guards against a second 'left',
  // so stepping back onto the decline screen never re-sends anything.
  window.addEventListener('popstate', function (e) {
    var i = e.state && typeof e.state.i === 'number' ? e.state.i : 0;
    go(i, true);
  });

  // --- the No button: three dodges, surrender, ONE confirm ------------------
  // Canvas version jumped straight to the decline screen on the fourth press.
  // She chases a moving button and then one tap silently declines — that is
  // exactly the accidental-no this flow exists to prevent. Surrendered button
  // asks once, plainly, then works.
  // The safe box: inside the notch and the home indicator, both of which #app
  // already pads for.
  function safeBox() {
    var app = document.getElementById('app');
    var cs = getComputedStyle(app), r = app.getBoundingClientRect();
    return {
      left: r.left + parseFloat(cs.paddingLeft),
      top: r.top + parseFloat(cs.paddingTop),
      right: r.right - parseFloat(cs.paddingRight),
      bottom: r.bottom - parseFloat(cs.paddingBottom)
    };
  }

  function dodge() {
    if (state.confirmingNo) { go(20); return; }
    if (state.dodges >= 3) {
      state.confirmingNo = true;                // label becomes "yes, no" — one confirm
      render();
      return;
    }
    var xs = [-96, 84, -64], ys = [-104, -168, -48], rs = [-7, 6, -3];
    var btn = document.querySelector('[data-act="no"]');
    if (btn) {
      // The canvas offsets assume a 390px artboard. On a narrower phone they
      // throw the button clean off the screen, which turns the joke into a
      // dead end. Clamp to the safe box instead of trusting the numbers.
      if (!state.noBase) {
        var r0 = btn.getBoundingClientRect();
        state.noBase = { left: r0.left - state.noX, top: r0.top - state.noY, w: r0.width, h: r0.height };
      }
      var b = state.noBase, s = safeBox(), pad = 8;
      state.noX = Math.max(s.left + pad - b.left,
                  Math.min(s.right - pad - (b.left + b.w), xs[state.dodges]));
      state.noY = Math.max(s.top + pad - b.top,
                  Math.min(s.bottom - pad - (b.top + b.h), ys[state.dodges]));
    } else {
      state.noX = xs[state.dodges]; state.noY = ys[state.dodges];
    }
    state.noR = rs[state.dodges];
    state.dodges += 1;
    render();
  }

  // --- the escort that follows her ------------------------------------------
  // Her ranking, in her own words: the dog, then everyone else. So "all of them"
  // leads with the dog.
  var ESCORT_ART = {
    'Topaz': '/art-cat.png',
    'Ruby': '/art-dog.png',
    'the duck': '/art-duck.png',
    'the chicken': '/art-hen.png',
    'all of them': '/art-dog.png'  // Ruby leads; she ranked the dog above everyone
  };

  // There is no throne screen any more — stop 02 gave that slot to the tortoise,
  // because re-picking a throne she already owns at stop 01 is a continuity error.
  // This stays wired: the castle screen still seats her escort on a throne, so it
  // needs the default, and a later stop can re-add a picker without rebuilding it.
  // "his choice" lands on the gilded one, which is also what the decree prints.
  var THRONE_ART = {
    'the gilded one': '/art-throne-gilded.png',
    'the beanbag': '/art-throne-beanbag.png',
    'the one with a cat on it': '/art-throne-cat.png',
    'his choice': '/art-throne-gilded.png'
  };

  function setThrone() {
    var art = THRONE_ART[state.picks.throne] || THRONE_ART['the gilded one'];
    document.documentElement.style.setProperty('--throneArt', 'url(' + art + ')');
  }

  function setEscort() {
    var art = ESCORT_ART[state.picks.escort];
    document.documentElement.style.setProperty(
      '--escortArt', art ? 'url(' + art + ')' : 'none');
  }

  // --- the crown ------------------------------------------------------------
  // The outfit picker is gone: she dressed him at stop 01 and the site painted
  // it --forest (#26492f), which the design spec itself calls dark and murky.
  // She said so to his face. The colour is corrected in the stylesheet now, and
  // this slot went to the crown — the half of the throne conversation that
  // never got built.
  var CROWN_TINT = { 'one made of flowers': 'var(--rose)' };

  function setCrown() {
    document.documentElement.style.setProperty(
      '--crownA', CROWN_TINT[state.picks.crown] || 'var(--honey)');
  }

  function seal() {
    if (state.sealed) return;
    state.sealScale = 0.8;
    render();
    tell('sealed', state.picks);
    setTimeout(function () { state.sealed = true; state.sealScale = 1; render(); }, 130);
    setTimeout(function () { go(18); }, 640);
  }

  // --- input: pointerdown for the dodge (hover does not exist on a phone),
  //     click for everything else --------------------------------------------
  // pointerdown owns the No button outright, so the button is already gone
  // before the tap lands. It owns every press, not just the dodging ones —
  // splitting it across pointerdown and click made one press count twice.
  document.addEventListener('pointerdown', function (e) {
    var el = e.target.closest('[data-act="no"]');
    if (!el) return;
    e.preventDefault();
    dodge();
  });

  document.addEventListener('click', function (e) {
    // "hot" is aria-disabled on purpose — it is refused, not offered — so it has
    // to be handled BEFORE the aria-disabled guard below. It is the one control
    // here whose whole job is to answer without doing anything.
    if (e.target.closest('[data-act="hot"]')) {
      state.hotTaps = (state.hotTaps || 0) + 1;
      render();
      return;
    }
    var el = e.target.closest('[data-go],[data-act]');
    if (!el || el.getAttribute('aria-disabled') === 'true') return;
    var set = el.getAttribute('data-set');
    if (set) {
      var idx = set.indexOf(':');
      state.picks[set.slice(0, idx)] = set.slice(idx + 1);
    }
    var act = el.getAttribute('data-act');
    if (act === 'open') { openTheNote(); return; }
    if (act === 'no') return;                   // already handled on pointerdown
    // The way out, asked and answered. Opening the question is not leaving, and
    // "stay" is a plain dismissal — neither one sends anything.
    if (act === 'askleave') { state.confirmingLeave = true; render(); return; }
    if (act === 'stay') { state.confirmingLeave = false; render(); return; }
    // One step back. Her picks are kept, so returning to a screen shows what she
    // chose and lets her choose again rather than starting the answer over.
    if (act === 'back') { go(state.i - 1); return; }
    if (act === 'seal') { seal(); return; }
    if (set && set.indexOf('escort:') === 0) setEscort();
    if (set && set.indexOf('throne:') === 0) setThrone();
    if (set && set.indexOf('crown:') === 0) setCrown();
    // She can go back and change her mind. Her picks are kept as defaults so she
    // is not made to redo the whole thing, and the seal is un-pressed so it can
    // be pressed again.
    // Sending happens on the castle screen now, so this both sends and carries
    // her onward. The closing screen is the arrival, not a second decision.
    if (act === 'sendback') { state.sentBack = true; go(21); return; }
    if (act === 'restart') {
      state.sealed = false;
      state.sealScale = 1;
      state.sentBack = false;      // she can send it again after changing something
      go(7);
      return;
    }
    var goTo = el.getAttribute('data-go');
    if (goTo === 'leave') { go(20); return; }
    if (goTo === 'next') { go(state.i + 1); return; }
    if (goTo != null) go(parseInt(goTo, 10));
  });

  // Keyboard / screen-reader users get a working No immediately — the dodge is
  // a thumb joke, never an accessibility trap.
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    var el = e.target.closest && e.target.closest('[data-act="no"]');
    if (el) { e.preventDefault(); state.dodges = 3; dodge(); }
  });

  // Escape dismisses the leave question, the way any half-asked question should.
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && state.confirmingLeave) {
      state.confirmingLeave = false;
      render();
    }
  });

  // Before sunrise. The curtain is opaque over the garden either way, but the
  // world underneath has to already be dark or the light never arrives.
  applyLight(0);
  applyDawn(DAWN_FROM);
  setThrone();          // stop 01's throne, which the castle screen still seats her on
  setCrown();           // default, in case she never reaches the crown screen
  // Seed the history stack so the first pushState has something behind it and a
  // back gesture on screen zero leaves the site, as it should.
  try { history.replaceState({ i: 0 }, ''); } catch (e) {}
  render();
})();
