// The whole game. One state object, one render pass, one POST at the end.
// The render never waits on the network.
(function () {
  'use strict';

  // --- palette ramps (weather repaints the world; sprites never change) ------
  // Lifted out of the design canvas at build time. Never hand-copy these — the
  // canvas rewrites the whole palette between revisions, and a stale copy here
  // repaints the site in last week's colours the moment she picks the weather.
  var PALETTE = window.__PALETTE__ || { SUNNY: {}, RAMPS: {} };
  var SUNNY = PALETTE.SUNNY;
  var RAMPS = PALETTE.RAMPS;

  // 20 is the decline screen; 21 is the closing beat after the castle.
  var LAST = 22;

  var state = {
    i: 0,
    picks: {},          // lives in memory, dies with the tab. Nothing stored.
    dodges: 0,
    noX: 0, noY: 0, noR: 0,
    confirmingNo: false,
    sealed: false,
    sealScale: 1,
    notified: false
  };

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

  function applyRamp(name) {
    var r = Object.assign({}, SUNNY, RAMPS[name] || {});
    var s = document.documentElement.style;
    Object.keys(r).forEach(function (k) { s.setProperty('--' + k, r[k]); });
    // Baked PNGs cannot recolour with the ramp, so they get tinted by attribute.
    document.documentElement.setAttribute('data-weather', name);
  }

  // --- derived values, straight port of the canvas's renderVals -------------
  function vals() {
    var i = state.i, picks = state.picks;
    var v = {};
    for (var n = 0; n <= LAST; n++) v['s' + n] = (i === n);
    var w = picks.weather || 'sunny';
    var alone = picks.escort === 'no one, just her';
    var dress = (picks.cut || picks.colour)
      ? [picks.colour, picks.cut].filter(Boolean).join(' ')
      : 'dress him';
    var stop = Math.max(0, Math.min(11, i - 5));
    var stones = [];
    for (var m = 0; m < 11; m++) stones.push(m < stop ? 'var(--honey)' : 'var(--cream)');
    v.camX = -Math.max(0, Math.min(11, i - 2)) * 34;
    v.isSunny = w === 'sunny'; v.isOvercast = w === 'overcast'; v.isRain = w === 'light rain';
    v.inJourney = i >= 6 && i <= 16;
    // The way out stays up through the decree — the seal is the commitment, so
    // she can still stop right until she presses it. Gone afterwards: screens 18
    // and 19 are the result, and there is nothing left to leave.
    v.showGate = i >= 3 && i <= 17;
    // The last screen has two halves: the pigeon waiting with her, and the
    // pigeon gone. She decides which one she is looking at.
    v.waiting = !state.sentBack;
    v.sentBack = !!state.sentBack;
    v.stones = stones;
    v.noX = state.noX; v.noY = state.noY; v.noR = state.noR;
    v.noLabel = state.confirmingNo ? 'yes, no' : state.dodges === 0 ? 'No' : state.dodges >= 3 ? 'no…' : 'No!';
    v.escortShort = alone ? '' : (picks.escort || 'escort').replace('the ', '');
    v.hasEscort = !alone;
    v.dressLabel = dress;
    v.sealScale = state.sealScale;
    v.sealLabel = state.sealed ? 'SEALED' : 'PRESS';
    v.sealHint = state.sealed ? 'Done. Nothing else to do.' : 'Press the seal.';
    v.castleLine = alone ? 'The throne is yours.' : 'The throne is occupied.';
    v.castleSub = alone ? 'No queue, no negotiation.' : 'It was always going to be.';
    v.vPlace = picks.place || 'he chooses';
    v.vDay = picks.day || 'he chooses';
    v.vHour = picks.hour || 'he chooses';
    v.vDuration = picks.duration || 'he chooses';
    v.vDrink = picks.drink || 'iced';
    v.vFood = picks.food || 'he chooses';
    v.vBanned = picks.banned || 'nothing yet';
    v.vEscort = picks.escort || 'the escort';
    v.vThrone = picks.throne || 'the gilded one';
    v.vDress = dress === 'dress him' ? 'as he is' : dress;
    v.vWeather = w;
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
    var live = document.querySelector('[data-if="s' + state.i + '"]');
    if (live && !live.hidden) {
      live.setAttribute('tabindex', '-1');
      live.focus({ preventScroll: true });
    }
  }

  function go(n) {
    state.i = Math.max(0, Math.min(LAST, n));
    if (state.i === 20) tell('left');           // decline: choice only, no partial picks
    render();
    window.scrollTo(0, 0);
  }

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

  // --- dressing him ---------------------------------------------------------
  // The canvas draws his torso as var(--escOutfit, <blue>) but never sets the
  // variable, so picking a colour changed the caption and not the character.
  // Colours are read off the swatch buttons themselves, so the design keeps
  // ownership of them — no second copy to drift.
  function dressUp() {
    var root = document.documentElement.style;
    var picked = state.picks.colour;
    if (picked) {
      var swatch = document.querySelector('[data-set="colour:' + picked + '"]');
      if (swatch) {
        var bg = (swatch.getAttribute('style') || '').match(/background:([^;]+)/);
        if (bg) root.setProperty('--escOutfit', bg[1].trim());
      }
    }
    // Formal gets a darker yoke across the shoulders; casual stays flat. One
    // variable, so the shape stays the canvas's business.
    root.setProperty('--escCollar',
      state.picks.cut === 'formal' ? 'inset 0 11px 0 rgba(36,26,16,.34)' : 'none');

    // Acknowledge the tap. Without this she picks a colour and nothing on the
    // screen agrees that she did.
    ['cut', 'colour'].forEach(function (kind) {
      document.querySelectorAll('[data-act="' + kind + '"]').forEach(function (el) {
        var v = (el.getAttribute('data-set') || '').split(':')[1];
        if (v === state.picks[kind]) el.setAttribute('data-chosen', '');
        else el.removeAttribute('data-chosen');
      });
    });
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
    var el = e.target.closest('[data-go],[data-act]');
    if (!el || el.getAttribute('aria-disabled') === 'true') return;
    var set = el.getAttribute('data-set');
    if (set) {
      var idx = set.indexOf(':');
      state.picks[set.slice(0, idx)] = set.slice(idx + 1);
    }
    var act = el.getAttribute('data-act');
    if (act === 'no') return;                   // already handled on pointerdown
    if (act === 'weather') { applyRamp(state.picks.weather); go(state.i + 1); return; }
    if (act === 'seal') { seal(); return; }
    if (set && set.indexOf('escort:') === 0) setEscort();
    if (set && set.indexOf('throne:') === 0) setThrone();
    if (act === 'cut' || act === 'colour') { dressUp(); render(); return; }
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

  applyRamp('sunny');
  setThrone();          // default, in case she never reaches the throne screen
  render();
})();
