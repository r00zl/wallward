/* Wallward: game flow, drawing of the characters, and the page controls. */
(function () {
  'use strict';
  var WW = window.WW, D = WW.Daily, A = WW.Answers, Hints = WW.Hints, Scene = WW.Scene, Sp = WW.Sprites;

  // ---------- rules you may want to tune ----------
  var CONFIG = {
    HITS: D.HITS,       // correct answers needed to fell an enemy
    LIVES: D.LIVES,     // torches: a wrong answer, or an enemy reaching you, puts one out
    KNOCKBACK: 3,       // paces a hit drives the enemy back
    RELIGHT_EVERY: 5,   // endless march: felling every fifth enemy relights a torch
    SHARE_URL: ''       // public address of the game, added to copied results
  };
  var PACES = D.PACES;
  var GAP = 22;         // pixels between warrior and an enemy at pace 0
  var NAMES = { cultist: 'Cultist', wolf: 'Dire wolf', skeleton: 'Skeleton', wraith: 'Wraith', dread: 'Dread knight' };
  var STORE_KEY = 'wallward.v2';

  var $ = function (id) { return document.getElementById(id); };
  var el = {};
  ['app', 'cv', 'veil', 'hud', 'lives', 'progress', 'score', 'quitBtn', 'banner', 'titleBlock',
    'menu', 'playDaily', 'dailyNo', 'dailyDone', 'doneMarks', 'doneLine', 'doneCopy', 'doneNext',
    'playEndless', 'endlessBest', 'howBtn', 'soundBtn', 'stats',
    'fightTop', 'cat', 'foe', 'qText', 'hint', 'fightBottom', 'answerForm', 'answer', 'feedback',
    'end', 'endKicker', 'endTitle', 'endScore', 'endRank', 'endMarks', 'copyBtn', 'againBtn', 'homeBtn', 'nextIn',
    'copyBox', 'copyText', 'howto', 'howClose'].forEach(function (id) { el[id] = $(id); });

  var BANK = WW.buildBank();
  A.setGuard(BANK, WW.COUNTRIES);
  var SPR = Sp.build();
  var scene = new Scene(el.cv);
  var calm = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  scene.calm = calm;

  // ---------- saved data (this browser only) ----------
  var store = { stats: { played: 0, streak: 0, maxStreak: 0, lastNum: 0, best: 0, bestEndless: 0 }, daily: null, sound: false };
  try {
    var raw = JSON.parse(window.localStorage.getItem(STORE_KEY) || 'null');
    if (raw && raw.stats) { store.stats = Object.assign(store.stats, raw.stats); store.daily = raw.daily || null; store.sound = !!raw.sound; }
  } catch (e) { /* storage unavailable: play without saving */ }
  function save() {
    try { window.localStorage.setItem(STORE_KEY, JSON.stringify(store)); } catch (e) { /* ignore */ }
  }

  // ---------- sound (off until switched on) ----------
  var AC = null;
  function audio() {
    if (!store.sound) return null;
    if (!AC) { try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { AC = null; } }
    if (AC && AC.state === 'suspended' && AC.resume) AC.resume();
    return AC;
  }
  function tone(freq, dur, type, vol, slideTo, delay) {
    var ac = audio();
    if (!ac) return;
    try {
      var o = ac.createOscillator(), g = ac.createGain(), t0 = ac.currentTime + (delay || 0);
      o.type = type || 'square';
      o.frequency.setValueAtTime(freq, t0);
      if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
      g.gain.setValueAtTime(vol || 0.05, t0);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      o.connect(g); g.connect(ac.destination);
      o.start(t0); o.stop(t0 + dur + 0.02);
    } catch (e) { /* ignore */ }
  }
  var sfx = {
    dash: function () { tone(300, 0.1, 'triangle', 0.04, 700); },
    hit: function () { tone(520, 0.05, 'square', 0.05, 180); tone(140, 0.14, 'sawtooth', 0.05, 60, 0.03); },
    miss: function () { tone(160, 0.25, 'sawtooth', 0.06, 60); },
    step: function () { tone(80, 0.05, 'triangle', 0.04, 55); },
    fell: function () { tone(392, 0.1, 'square', 0.05); tone(523, 0.1, 'square', 0.05, 0, 0.09); tone(659, 0.2, 'square', 0.05, 0, 0.18); },
    fall: function () { tone(220, 0.5, 'sawtooth', 0.07, 40); },
    win: function () { [392, 494, 587, 784].forEach(function (f, i) { tone(f, 0.18, 'square', 0.05, 0, i * 0.13); }); }
  };

  // ---------- a cloak that streams in the wind ----------
  // A short chain of points hung from the shoulders. Each frame the points are
  // pushed by wind and their own momentum, then pulled back to arm's length of
  // each other, so the cloth trails when its wearer dashes and settles after.
  function Cape(n, seg, widths, cols) {
    this.n = n; this.seg = seg; this.widths = widths; this.cols = cols;
    this.x = []; this.y = []; this.px = []; this.py = [];
    this.acc = 0; this.ready = false;
  }
  Cape.prototype.reset = function (ax, ay, dir) {
    for (var i = 0; i < this.n; i++) {
      this.x[i] = this.px[i] = ax + dir * i * this.seg * 0.8;
      this.y[i] = this.py[i] = ay + i * this.seg * 0.6;
    }
    this.ready = true;
  };
  Cape.prototype.step = function (ax, ay, dir, dt, t) {
    if (!this.ready || Math.abs(this.x[0] - ax) > 90) this.reset(ax, ay, dir);
    this.acc = Math.min(0.1, this.acc + dt);
    var h = 1 / 60, i, k;
    while (this.acc >= h) {
      this.acc -= h;
      for (i = 1; i < this.n; i++) {
        var vx = (this.x[i] - this.px[i]) * 0.9, vy = (this.y[i] - this.py[i]) * 0.9;
        this.px[i] = this.x[i]; this.py[i] = this.y[i];
        var gust = 150 + 90 * Math.sin(t * 2.1) + 50 * Math.sin(t * 5.3 + i * 0.7);
        var flutter = 110 * Math.sin(t * 9 - i * 0.9) * (i / this.n);
        this.x[i] += vx + dir * gust * h * h;
        this.y[i] += vy + (70 + flutter) * h * h;
      }
      this.x[0] = ax; this.y[0] = ay;
      for (k = 0; k < 3; k++) {
        for (i = 1; i < this.n; i++) {
          var dx = this.x[i] - this.x[i - 1], dy = this.y[i] - this.y[i - 1];
          var d = Math.sqrt(dx * dx + dy * dy) || 0.001, f = (d - this.seg) / d;
          this.x[i] -= dx * f; this.y[i] -= dy * f;
        }
      }
    }
    this.x[0] = ax; this.y[0] = ay;
  };
  Cape.prototype.draw = function (g) {
    var i, s, k;
    for (i = 0; i < this.n - 1; i++) {
      var dx = this.x[i + 1] - this.x[i], dy = this.y[i + 1] - this.y[i];
      var d = Math.sqrt(dx * dx + dy * dy) || 1, nx = -dy / d, ny = dx / d;
      if (ny < 0) { nx = -nx; ny = -ny; } // "down" side of the cloth
      var w0 = this.widths[i], w1 = this.widths[i + 1];
      for (s = 0; s <= 1; s += 0.34) {
        var cx = this.x[i] + dx * s, cy = this.y[i] + dy * s, w = w0 + (w1 - w0) * s;
        var last = i === this.n - 2;
        for (k = -1; k < w; k += 0.5) {
          // the hem is ragged
          if (last && s > 0.5 && ((Math.round(k) + i) % 3 === 0)) continue;
          g.fillStyle = k < 0.5 ? this.cols[0] : k > w * 0.6 ? this.cols[2] : this.cols[1];
          g.fillRect(Math.round(cx + nx * k), Math.round(cy + ny * k), 1, 1);
        }
      }
    }
  };

  var heroCape = new Cape(9, 3, [6, 7, 8, 8, 8, 7, 6, 5, 3], ['#c12a3a', '#8f1d2c', '#5e1220']);
  var foeCape = new Cape(10, 3, [8, 9, 10, 10, 10, 9, 8, 7, 5, 4], ['#6e1420', '#3a0b14', '#1f060b']);

  // ---------- state ----------
  var G = {
    mode: null, phase: 'title', phaseT: 0, num: 0, plan: null, idx: 0, total: 0,
    lives: CONFIG.LIVES, score: 0, results: [], hits: 0, flawless: true,
    enemy: null, def: null, q: null, seen: {}, resPos: { 1: 0, 2: 0, 3: 0 }, hintShown: -1,
    camFrom: 0, camTo: 0, walkDur: 2.4, spawned: false,
    strike: null, bits: [], arcs: [], trail: [], shake: 0, stop: 0,
    hero: { dx: 0, walkT: 0, hurt: 0, sword: 55 },
    titleT: 0
  };

  // ---------- layout ----------
  function layout() {
    var vv = window.visualViewport, fullH = window.innerHeight, appH;
    // A phone keyboard shrinks the visible area without resizing the page: follow it.
    if (vv && Math.abs(vv.scale - 1) < 0.01 && fullH - vv.height > 120) {
      appH = vv.height;
      el.app.style.height = appH + 'px';
      el.app.style.transform = 'translateY(' + vv.offsetTop + 'px)';
    } else {
      el.app.style.height = '';
      el.app.style.transform = '';
      appH = el.app.clientHeight || fullH;
    }
    var appW = el.app.clientWidth || window.innerWidth;
    scene.resize(appW, appH);
    // On short screens the wall sits lower, leaving the sky to the question.
    var ground = Math.round(scene.H * (scene.H < 240 ? 0.66 : 0.6));
    if (ground !== scene.groundY || !scene.cache[scene.stage]) {
      scene.groundY = ground;
      scene.cache = {};
      heroCape.ready = false; foeCape.ready = false;
    }
    el.app.classList.toggle('short', appH < 560);
    skyline();
  }

  /** Tell the scene how much of the sky the question covers, so sun and moon stay in view. */
  function skyline() {
    var r = el.fightTop.hidden ? null : el.fightTop.getBoundingClientRect();
    scene.skyTarget = r ? Math.round((r.bottom - el.app.getBoundingClientRect().top) / scene.scale) : 0;
  }

  function paceLen() {
    return (scene.W - scene.warriorX() - GAP - 34) / PACES;
  }

  // ---------- page helpers ----------
  function show(view) {
    el.menu.hidden = view !== 'menu';
    el.titleBlock.hidden = view !== 'menu';
    el.fightTop.hidden = el.fightBottom.hidden = el.hud.hidden = view !== 'fight';
    el.end.hidden = view !== 'end';
    skyline();
  }

  var flameOn = Sp.iconURL('flame', 3), flameOff = Sp.iconURL('flameOut', 3);

  function drawHud() {
    var i, html = '';
    for (i = 0; i < CONFIG.LIVES; i++) html += '<img alt="" width="27" height="30" src="' + (i < G.lives ? flameOn : flameOff) + '">';
    el.lives.innerHTML = html;
    el.lives.setAttribute('aria-label', G.lives + ' of ' + CONFIG.LIVES + ' torches lit');
    el.progress.textContent = G.mode === 'daily'
      ? 'Foe ' + Math.min(G.idx + 1, G.total) + ' of ' + G.total
      : 'Foe ' + (G.idx + 1);
    el.score.textContent = D.fmt(G.score);
  }

  function drawFoe() {
    var e = G.enemy;
    if (!e) { el.foe.textContent = ''; return; }
    var left = CONFIG.HITS - G.hits;
    el.foe.textContent = NAMES[e.kind] + ': ' + left + (left === 1 ? ' blow' : ' blows') + ' to fell';
  }

  var fbTimer = 0;
  function feedback(kind, text, hold) {
    el.feedback.className = 'feedback ' + kind;
    el.feedback.textContent = text;
    window.clearTimeout(fbTimer);
    fbTimer = window.setTimeout(function () { el.feedback.textContent = ''; }, hold || 3600);
  }

  var bannerTimer = 0;
  function banner(text) {
    el.banner.textContent = text;
    el.banner.hidden = false;
    el.banner.classList.remove('go'); void el.banner.offsetWidth; el.banner.classList.add('go');
    window.clearTimeout(bannerTimer);
    bannerTimer = window.setTimeout(function () { el.banner.hidden = true; }, 2800);
  }

  function veil(kind) {
    el.veil.className = 'veil';
    void el.veil.offsetWidth;
    el.veil.className = 'veil ' + kind;
  }

  /** Blank tiles for the answer; letters appear as the enemy closes in. */
  function drawHint() {
    var q = G.q, e = G.enemy;
    if (!q || !e) { el.hint.innerHTML = ''; G.hintShown = -1; return; }
    var n = Hints.hintCount(q, e.pace);
    if (n === G.hintShown) return;
    G.hintShown = n;
    var cells = Hints.hintCells(q, n), html = '<span class="word">', i;
    for (i = 0; i < cells.length; i++) {
      var c = cells[i];
      if (c.state === 'gap') html += '</span><span class="word">';
      else if (c.state === 'mark') html += '<i class="mark">' + c.ch + '</i>';
      else html += '<i class="' + c.state + '">' + (c.ch || '') + '</i>';
    }
    el.hint.innerHTML = html + '</span>';
    el.hint.setAttribute('aria-label', n ? n + ' letters revealed' : 'Answer length');
  }

  function setQuestion(q, note) {
    G.q = q; G.hintShown = -1;
    if (q) G.seen[q.id] = true;
    el.qText.textContent = q ? q.q : (note || '');
    el.cat.textContent = q ? (q.cat === 'H' ? 'History' : 'Geography') : '';
    el.answer.placeholder = !q ? '' : /^In what year/.test(q.q) ? 'The year' : 'Your answer';
    drawHint();
  }

  // ---------- a run ----------
  function startRun(mode, resume) {
    audio();
    G.mode = mode; G.results = []; G.score = 0; G.lives = CONFIG.LIVES; G.idx = 0;
    G.seen = {}; G.resPos = { 1: 0, 2: 0, 3: 0 }; G.bits = []; G.arcs = []; G.trail = [];
    G.enemy = null; G.strike = null; G.hero.dx = 0;
    if (mode === 'daily') {
      G.num = D.dayNumber();
      G.plan = D.dailyPlan(G.num, BANK);
      G.total = G.plan.enemies.length;
      var d = store.daily;
      if (resume && d && d.num === G.num && !d.done) {
        G.idx = d.idx; G.results = d.results.slice(); G.lives = d.lives; G.score = d.score;
        G.resPos = { 1: d.resPos[1] || 0, 2: d.resPos[2] || 0, 3: d.resPos[3] || 0 };
        // nothing already asked today comes back
        G.plan.enemies.slice(0, G.idx).forEach(function (en) { en.questions.forEach(function (q) { G.seen[q.id] = true; }); });
      } else {
        store.daily = { num: G.num, idx: 0, results: [], lives: G.lives, score: 0, resPos: G.resPos, done: false, total: G.total };
        save();
      }
    } else {
      G.plan = null; G.total = 0;
    }
    show('fight');
    el.answer.value = '';
    el.feedback.textContent = '';
    drawHud();
    approach();
    focusAnswer();
  }

  function focusAnswer() {
    try { el.answer.focus({ preventScroll: true }); } catch (e) { el.answer.focus(); }
  }

  /** Walk on to the next enemy. */
  function approach() {
    G.def = G.mode === 'daily' ? G.plan.enemies[G.idx] : D.endlessEnemy(G.idx + 1);
    G.phase = 'walk'; G.phaseT = 0; G.spawned = false; G.enemy = null; G.strike = null;
    G.hits = 0; G.flawless = true;
    var W = Scene.WALK;
    G.camFrom = scene.camX;
    G.camTo = Math.ceil((scene.camX + W * 0.55) / W) * W;
    G.walkDur = Math.max(1.6, (G.camTo - G.camFrom) / (W / 2.4));
    var before = scene.shownStage();
    scene.setStage(G.def.stage);
    if (G.def.stage !== before || G.idx === 0) {
      var st = Scene.STAGES[G.def.stage];
      banner(st.name + ', ' + st.time);
    }
    setQuestion(null, 'Something stirs along the wall…');
    drawHud(); drawFoe();
  }

  function spawn() {
    G.spawned = true;
    G.enemy = { kind: G.def.kind, spr: SPR[G.def.kind], pace: PACES, shown: PACES + 12, interval: G.def.interval,
      stepT: 0, hop: 0, foot: 0, flash: 0, attack: 0, struck: false, gone: false };
    foeCape.ready = false;
  }

  /** The question for the blow the player is working on. */
  function askSlot() {
    var slot = G.hits, q;
    if (G.mode === 'daily') q = G.def.questions[slot];
    else q = D.drawQuestion(BANK, G.def.tiers[slot], G.seen, (G.idx + slot) % 2 ? 'G' : 'H');
    setQuestion(q);
  }

  /** A fresh question of the same difficulty, after a failure. Never one already asked. */
  function askReplacement() {
    var tier = G.def.tiers[G.hits], q = null;
    if (G.mode === 'daily') {
      var list = G.plan.reserve[tier] || [];
      while (!q && G.resPos[tier] < list.length) {
        var c = list[G.resPos[tier]++];
        if (!G.seen[c.id]) q = c;
      }
      store.daily.resPos = G.resPos;
    }
    if (!q) q = D.drawQuestion(BANK, tier, G.seen);
    setQuestion(q);
  }

  function engage() {
    G.phase = 'fight'; G.phaseT = 0;
    G.enemy.shown = G.enemy.pace = PACES;
    G.enemy.stepT = 0;
    askSlot();
    drawFoe();
  }

  function stepEnemy() {
    var e = G.enemy;
    e.pace = Math.max(0, e.pace - 1);
    e.hop = 1; e.foot ^= 1;
    sfx.step();
    drawHint();
    if (e.pace <= 0) { e.attack = 0.0001; e.struck = false; }
  }

  /** The warrior dashes to the enemy, cuts, and springs back. onImpact fires as the blade lands. */
  function strike(onImpact) {
    if (G.strike && !G.strike.landed) G.strike.onImpact();
    G.strike = { stage: 'out', t: 0, from: G.hero.dx, onImpact: onImpact, landed: false };
    sfx.dash();
  }

  function submit(text) {
    if (G.phase !== 'fight' || !G.q || G.enemy.attack > 0) return;
    var t = String(text).trim();
    if (!t) return;
    el.answer.value = '';
    var res = A.check(t, G.q);
    if (res.ok) hit(res); else fail('No. Answer: ' + res.shown + '.');
  }

  function hit(res) {
    var e = G.enemy;
    G.hits++;
    if (G.hits >= CONFIG.HITS) {
      var gain = D.liFor(e.pace, G.flawless);
      G.score += gain;
      G.results.push(G.flawless ? 'F' : 'W');
      G.phase = 'felled'; G.phaseT = 0;
      feedback('ok', (G.flawless ? 'Flawless. ' : 'Felled. ') + '+' + D.fmt(gain) + ' glory');
      setQuestion(null, NAMES[e.kind] + ' felled.');
      strike(function () { burst(e, 40); e.gone = true; sfx.fell(); if (!calm) { G.shake = 0.3; G.stop = 0.07; } });
      var relit = G.mode === 'endless' && (G.idx + 1) % CONFIG.RELIGHT_EVERY === 0 && G.lives < CONFIG.LIVES;
      if (relit) { G.lives++; feedback('ok', 'Felled. A torch is relit. +' + D.fmt(gain) + ' glory'); }
      drawHud(); drawFoe();
      return;
    }
    feedback('ok', res.exact ? 'A clean blow.' : 'A clean blow. Close enough to ' + res.shown + '.');
    strike(function () {
      e.flash = 0.16;
      e.pace = Math.min(PACES, e.pace + CONFIG.KNOCKBACK);
      e.stepT = 0;
      burst(e, 9);
      sfx.hit();
      if (!calm) { G.shake = 0.18; G.stop = 0.05; }
      drawHint();
    });
    askSlot();
    drawFoe();
  }

  /** A failed question: a torch goes out and a different question takes its place. */
  function fail(text) {
    G.lives--;
    G.flawless = false;
    G.hero.hurt = 0.7;
    if (!calm) G.shake = 0.4;
    veil('hurt');
    sfx.miss();
    drawHud();
    if (G.lives <= 0) {
      G.results.push('X');
      G.phase = 'falling'; G.phaseT = 0;
      feedback('miss', text, 6000);
      setQuestion(null, 'The last torch goes out.');
      sfx.fall();
      return;
    }
    feedback('miss', text + ' A torch goes out.');
    askReplacement();
  }

  function burst(e, n) {
    var p = scene.plane(), feet = scene.groundY + 4 + p.y;
    var ex = scene.warriorX() + p.x + GAP + e.shown * paceLen();
    var i, cols = e.spr.bits;
    if (calm) n = Math.ceil(n / 3);
    for (i = 0; i < n; i++) {
      G.bits.push({ x: ex + (Math.random() - 0.5) * e.spr.w * 0.8, y: feet - Math.random() * e.spr.h,
        vx: (Math.random() - 0.25) * 90, vy: -40 - Math.random() * 90, life: 0.45 + Math.random() * 0.55,
        col: cols[i % cols.length], size: Math.random() < 0.35 ? 2 : 1 });
    }
  }

  function afterEnemy() {
    G.idx++;
    if (G.mode === 'daily') {
      var d = store.daily;
      d.idx = G.idx; d.results = G.results.slice(); d.lives = G.lives; d.score = G.score; d.resPos = G.resPos;
      save();
    }
    if (G.mode === 'daily' && G.idx >= G.total) { finish(true); return; }
    approach();
  }

  function finish(held) {
    G.phase = 'over'; G.enemy = null; G.strike = null; G.hero.dx = 0; setQuestion(null);
    var felled = G.results.filter(function (r) { return r !== 'X'; }).length;
    var s = store.stats;
    if (G.mode === 'daily') {
      var d = store.daily;
      if (!d.done) {
        d.done = true; d.held = held; d.results = G.results.slice(); d.score = G.score; d.lives = G.lives;
        s.played++;
        s.streak = s.lastNum === G.num - 1 ? s.streak + 1 : 1;
        s.maxStreak = Math.max(s.maxStreak, s.streak);
        s.lastNum = G.num;
        s.best = Math.max(s.best, G.score);
      }
      el.endKicker.textContent = 'Wall No. ' + G.num;
      el.endTitle.textContent = held ? (G.lives === CONFIG.LIVES ? 'The wall stands unbroken' : 'The wall held') : 'The wall fell';
      el.endRank.textContent = D.rankFor(G.score) + '. ' + felled + ' of ' + G.total + ' felled, ' +
        G.lives + (G.lives === 1 ? ' torch' : ' torches') + ' still burning.';
      el.endMarks.textContent = D.markRow(G.results, G.total);
      el.endMarks.hidden = false;
      el.copyBtn.hidden = false;
      el.againBtn.textContent = 'Endless march';
      el.nextIn.hidden = false;
    } else {
      var best = G.score > s.bestEndless;
      s.bestEndless = Math.max(s.bestEndless, G.score);
      el.endKicker.textContent = 'Endless march';
      el.endTitle.textContent = 'The wall fell';
      el.endRank.textContent = felled + (felled === 1 ? ' foe' : ' foes') + ' felled.' +
        (best && G.score > 0 ? ' A new best.' : ' Best ' + D.fmt(s.bestEndless) + ' glory.');
      el.endMarks.hidden = true;
      el.copyBtn.hidden = true;
      el.againBtn.textContent = 'March again';
      el.nextIn.hidden = true;
    }
    save();
    el.endScore.textContent = D.fmt(G.score);
    el.copyBox.hidden = true;
    if (held) sfx.win();
    show('end');
    tick();
    try { el.end.querySelector('button:not([hidden])').focus({ preventScroll: true }); } catch (e) { /* ignore */ }
  }

  function shareUrl() {
    if (CONFIG.SHARE_URL) return CONFIG.SHARE_URL;
    return /\.github\.io$/.test(window.location.hostname) ? window.location.origin + window.location.pathname : '';
  }

  function copyResult(btn) {
    var d = store.daily;
    if (!d) return;
    var text = D.shareText(d.num, d.results, d.score, d.total || 5, shareUrl());
    function fallback() {
      el.copyText.value = text;
      el.copyBox.hidden = false;
      el.copyText.focus(); el.copyText.select();
    }
    var label = btn.textContent;
    try {
      window.navigator.clipboard.writeText(text).then(function () {
        btn.textContent = 'Copied';
        window.setTimeout(function () { btn.textContent = label; }, 1600);
      }, fallback);
    } catch (e) { fallback(); }
  }

  // ---------- menu ----------
  function toMenu() {
    G.mode = null; G.phase = 'title'; G.enemy = null; G.strike = null; G.bits = []; G.arcs = []; G.hero.dx = 0;
    show('menu');
    drawMenu();
  }

  function drawMenu() {
    var num = D.dayNumber(), d = store.daily, s = store.stats;
    var today = d && d.num === num ? d : null;
    el.dailyNo.textContent = 'No. ' + num;
    if (today && today.done) {
      el.playDaily.hidden = true;
      el.dailyDone.hidden = false;
      el.doneMarks.textContent = D.markRow(today.results, today.total || 5);
      el.doneLine.textContent = 'Wall No. ' + num + ': ' + D.fmt(today.score) + ' glory, ' + D.rankFor(today.score).toLowerCase() + '.';
    } else {
      el.playDaily.hidden = false;
      el.dailyDone.hidden = true;
      el.playDaily.firstChild.textContent = today && today.idx > 0 ? 'Return to today\'s wall ' : 'Hold today\'s wall ';
    }
    el.endlessBest.textContent = s.bestEndless ? 'Best ' + D.fmt(s.bestEndless) : 'No end';
    el.soundBtn.textContent = 'Sound: ' + (store.sound ? 'on' : 'off');
    el.soundBtn.setAttribute('aria-pressed', store.sound ? 'true' : 'false');
    el.stats.textContent = s.played
      ? 'Walls held ' + s.played + '. Streak ' + s.streak + (s.streak === 1 ? ' day' : ' days') + '. Best ' + D.fmt(s.best) + ' glory.'
      : 'A new wall every day at 00:00 UTC, the same for everyone.';
    tick();
  }

  function clock(ms) {
    var s = Math.max(0, Math.floor(ms / 1000)), h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60);
    function two(n) { return (n < 10 ? '0' : '') + n; }
    return two(h) + ':' + two(m) + ':' + two(s % 60);
  }
  var lastNum = D.dayNumber();
  function tick() {
    var text = 'Next wall in ' + clock(D.msToNextWall());
    el.nextIn.textContent = text;
    el.doneNext.textContent = text;
    var n = D.dayNumber();
    if (n !== lastNum) { lastNum = n; if (!el.menu.hidden) drawMenu(); }
  }
  window.setInterval(tick, 1000);

  // ---------- update ----------
  function ease(u) { return u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2; }
  function easeOut(u) { return 1 - (1 - u) * (1 - u); }

  function foeX(e) { return GAP + e.shown * paceLen(); } // relative to the warrior's post

  function updateStrike(dt) {
    var s = G.strike, h = G.hero, e = G.enemy;
    if (!s) {
      h.dx += (0 - h.dx) * (1 - Math.exp(-dt * 12));
      if (Math.abs(h.dx) < 0.3) h.dx = 0;
      h.sword += (55 - h.sword) * (1 - Math.exp(-dt * 10));
      return;
    }
    s.t += dt;
    var reach = e ? foeX(e) - (e.spr.w / 2 + 11) : 40;
    if (s.stage === 'out') {
      var dur = Math.max(0.1, Math.min(0.2, Math.abs(reach - s.from) / 800));
      var u = Math.min(1, s.t / dur);
      h.dx = s.from + (reach - s.from) * easeOut(u);
      h.sword = 150;
      if (u >= 1) { s.stage = 'cut'; s.t = 0; s.from = h.dx; }
    } else if (s.stage === 'cut') {
      var c = Math.min(1, s.t / 0.16);
      var before = h.sword;
      h.sword = 150 - 205 * easeOut(c);
      G.arcs.push({ a0: before, a1: h.sword, life: 0.14 });
      if (!s.landed && c >= 0.35) { s.landed = true; s.onImpact(); }
      if (c >= 1) { s.stage = 'back'; s.t = 0; s.from = h.dx; }
    } else {
      var b = Math.min(1, s.t / 0.3);
      h.dx = s.from * (1 - ease(b));
      h.sword = -55 + 110 * ease(b);
      if (b >= 1) { h.dx = 0; G.strike = null; }
    }
    if (!calm && (s.stage === 'out' || s.stage === 'back')) G.trail.push({ dx: h.dx, life: 0.16 });
  }

  function update(dt) {
    var e = G.enemy, h = G.hero, i;
    if (G.stop > 0) { G.stop -= dt; return; } // a held breath as a blow lands
    G.phaseT += dt;
    h.hurt = Math.max(0, h.hurt - dt);
    G.shake = Math.max(0, G.shake - dt);

    if (G.phase === 'title') {
      G.titleT += dt;
      scene.camX += dt * 24;
      h.walkT += dt;
      if (!calm && G.titleT > 10) { G.titleT = 0; scene.setStage(scene.shownStage() + 1); }
    } else if (G.phase === 'walk') {
      var u = Math.min(1, G.phaseT / G.walkDur);
      scene.camX = G.camFrom + (G.camTo - G.camFrom) * ease(u);
      h.walkT += dt;
      var lead = 1.0;
      if (!G.spawned && G.phaseT >= G.walkDur - lead) spawn();
      if (G.spawned) {
        var v = Math.min(1, (G.phaseT - (G.walkDur - lead)) / lead);
        G.enemy.shown = PACES + 12 * (1 - ease(v));
        G.enemy.foot = Math.floor(G.phaseT * 7) % 2;
        G.enemy.hop = 1 - ((G.phaseT * 3.5) % 1);
      }
      if (u >= 1) engage();
    } else if (G.phase === 'fight') {
      drawHint();
      if (e.attack > 0) {
        // it has reached the warrior: it strikes, then is thrown back to where it began
        e.attack += dt;
        if (!e.struck && e.attack > 0.2) {
          e.struck = true;
          var was = G.q;
          fail(was ? 'Too slow. Answer: ' + was.a[0] + '.' : 'Too slow.');
        }
        if (e.attack > 0.55 && G.phase === 'fight') { e.attack = 0; e.pace = PACES; e.stepT = 0; drawHint(); }
      } else if (!G.strike) {
        e.stepT += dt;
        if (e.stepT >= e.interval) { e.stepT -= e.interval; stepEnemy(); }
      }
    } else if (G.phase === 'felled') {
      if (e && e.gone && !G.strike && G.phaseT > 0.9) afterEnemy();
      else if (G.phaseT > 3) afterEnemy();
    } else if (G.phase === 'falling') {
      if (G.phaseT > 1.7) finish(false);
    }

    e = G.enemy;
    if (e && G.phase !== 'walk') {
      e.shown += (e.pace - e.shown) * (1 - Math.exp(-dt * 12));
      e.hop = Math.max(0, e.hop - dt / 0.28);
    }
    if (e) e.flash = Math.max(0, e.flash - dt);
    updateStrike(dt);

    for (i = G.bits.length - 1; i >= 0; i--) {
      var b = G.bits[i];
      b.life -= dt; b.vy += 280 * dt; b.x += b.vx * dt; b.y += b.vy * dt;
      if (b.life <= 0) G.bits.splice(i, 1);
    }
    for (i = G.arcs.length - 1; i >= 0; i--) { G.arcs[i].life -= dt; if (G.arcs[i].life <= 0) G.arcs.splice(i, 1); }
    for (i = G.trail.length - 1; i >= 0; i--) { G.trail[i].life -= dt; if (G.trail[i].life <= 0) G.trail.splice(i, 1); }
    scene.update(dt);

    // cloaks
    var p = scene.plane(), feet = scene.groundY + 4 + p.y, ws = SPR.warrior;
    var moving = G.phase === 'title' || G.phase === 'walk' || G.strike;
    var wf = moving ? Math.floor(h.walkT * 8 + (G.strike ? scene.t * 14 : 0)) % 2 : 2;
    var hx = scene.warriorX() + p.x + Math.round(h.dx) - 9;
    heroCape.step(hx + ws.neck[0], feet - ws.h + ws.neck[1] + ws.bob[wf], -1, dt, scene.t);
    if (e && !e.gone && e.spr.cape) {
      var ex = scene.warriorX() + p.x + foeX(e);
      foeCape.step(Math.round(ex - e.spr.w / 2) + e.spr.cape[0], feet - e.spr.h + e.spr.cape[1], 1, dt, scene.t + 2);
    }
  }

  // ---------- drawing the characters ----------
  var tintCache = {};
  /** A sprite frame washed in the light of the current stage. */
  function lit(key, set, frame) {
    var stage = scene.shownStage(), id = stage + key + set + frame, c = tintCache[id];
    if (!c) {
      var tint = Scene.STAGES[stage].tint, src = SPR[key][set][frame];
      c = tintCache[id] = tint ? Sp.tinted(src, tint[0], tint[1]) : src;
    }
    return c;
  }

  /** In failing light, a thin pale edge keeps a dark figure apart from dark hills. */
  function rim(g, white, x, y) {
    if (!Scene.STAGES[scene.shownStage()].lit) return;
    g.globalAlpha = 0.32;
    g.drawImage(white, x - 1, y); g.drawImage(white, x + 1, y); g.drawImage(white, x, y - 1);
    g.globalAlpha = 1;
  }

  function shadow(g, cx, y, w) {
    g.fillStyle = 'rgba(10,6,16,0.34)';
    g.fillRect(Math.round(cx - w / 2), y, w, 2);
    g.fillRect(Math.round(cx - w / 2) + 2, y + 2, w - 4, 1);
  }

  function render() {
    var g = scene.g, p = scene.plane(), e = G.enemy, h = G.hero, i;
    var home = scene.warriorX() + p.x, feet = scene.groundY + 4 + p.y;
    scene.drawBack();

    // enemy
    if (e && !e.gone) {
      var spr = e.spr, ex = home + foeX(e);
      var hopY = spr.floats ? 4 + Math.round(Math.sin(scene.t * 3) * 2) : Math.round(Math.sin(Math.PI * e.hop) * 3);
      var frame = spr.floats ? Math.floor(scene.t * 4) % 2
        : spr.frames.length === 2 ? (e.hop > 0 ? e.foot : (spr.runs ? 0 : 1))
          : (e.hop > 0 ? e.foot : 2);
      var lunge = e.attack > 0 ? -Math.round(Math.sin(Math.min(1, e.attack / 0.3) * Math.PI) * 9) : 0;
      var sx = Math.round(ex - spr.w / 2) + lunge, sy = feet - spr.h - hopY;
      shadow(g, ex + lunge, feet, Math.round(spr.w * (spr.floats ? 0.5 : 0.75)));
      if (spr.cape) foeCape.draw(g);
      rim(g, spr.flash[frame], sx, sy);
      g.drawImage(e.flash > 0 ? spr.flash[frame] : lit(e.kind, 'frames', frame), sx, sy);
      if (spr.weapon) {
        // weapons are held upright, and swung down when the enemy strikes
        var swing = e.attack > 0 ? Math.sin(Math.min(1, e.attack / 0.3) * Math.PI) * 70 : 0;
        var rest = spr.weapon === 'dagger' ? 118 : 96;
        Sp.drawWeapon(g, sx + spr.hand[0], sy + spr.hand[1] + spr.bob[frame], rest + swing + Math.sin(scene.t * 2) * 2, spr.weapon);
      }
      if (G.phase === 'fight' || G.phase === 'felled') {
        // blows it can still take, and the time before its next step
        var left = CONFIG.HITS - G.hits, cx = Math.round(ex) + lunge, top = sy - (spr.weapon && spr.weapon !== 'dagger' ? 22 : 9);
        for (i = 0; i < CONFIG.HITS; i++) {
          var pxp = cx - 10 + i * 7;
          g.fillStyle = Sp.OUTLINE; g.fillRect(pxp, top, 6, 6);
          g.fillStyle = i < left ? '#d9432e' : '#3a3646'; g.fillRect(pxp + 1, top + 1, 4, 4);
          if (i < left) { g.fillStyle = '#ff8a6a'; g.fillRect(pxp + 1, top + 1, 2, 1); }
        }
        if (G.phase === 'fight' && e.attack === 0) {
          g.fillStyle = Sp.OUTLINE; g.fillRect(cx - 10, top + 7, 20, 3);
          g.fillStyle = e.pace <= 3 ? '#ff8a6a' : '#f5c044';
          g.fillRect(cx - 9, top + 8, Math.round(18 * (1 - e.stepT / e.interval)), 1);
        }
      }
    }

    // warrior
    var ws = SPR.warrior, s = G.strike;
    var moving = G.phase === 'title' || G.phase === 'walk' || s;
    var wf = moving ? Math.floor(h.walkT * 8 + (s ? scene.t * 14 : 0)) % 2 : 2;
    var breathe = !moving && Math.sin(scene.t * 2.4) > 0.6 ? 1 : 0;
    var wx = home + Math.round(h.dx) - 9 - (h.hurt > 0.45 ? 3 : 0), wy = feet - ws.h;
    shadow(g, wx + 9, feet, 16);
    for (i = 0; i < G.trail.length; i++) {
      // pale after-images mark the dash
      g.globalAlpha = Math.min(0.4, G.trail[i].life * 2.2);
      g.drawImage(ws.flash[wf], home + Math.round(G.trail[i].dx) - 9, wy);
    }
    g.globalAlpha = 1;
    heroCape.draw(g);
    rim(g, ws.flash[wf], wx, wy);
    var blink = h.hurt > 0 && Math.floor(h.hurt * 16) % 2 === 0;
    g.drawImage(blink ? ws.flash[wf] : lit('warrior', 'frames', wf), wx, wy);
    // sword arm, from the shoulder
    var shx = wx + ws.shoulder[0], shy = wy + ws.shoulder[1] + ws.bob[wf] + breathe;
    var a = h.sword * Math.PI / 180;
    var hx = shx + Math.round(Math.cos(a) * 3 + 2), hy = shy + Math.round(-Math.sin(a) * 3 + 2);
    g.fillStyle = '#5d6779'; g.fillRect(Math.min(shx, hx), Math.min(shy, hy), Math.abs(hx - shx) + 2, Math.abs(hy - shy) + 2);
    g.fillStyle = '#9aa3b3'; g.fillRect(hx, hy, 2, 2);
    Sp.drawWeapon(g, hx + 1, hy, h.sword, 'sword');
    // the sweep of the blade
    for (i = 0; i < G.arcs.length; i++) {
      var arc = G.arcs[i], k, r;
      g.fillStyle = arc.life > 0.07 ? '#ffffff' : '#bfe6ff';
      for (k = 0; k <= 1; k += 0.12) {
        var ang = (arc.a0 + (arc.a1 - arc.a0) * k) * Math.PI / 180;
        for (r = 13; r <= 20; r += 1) g.fillRect(Math.round(hx + Math.cos(ang) * r), Math.round(hy - Math.sin(ang) * r), 1, 1);
      }
    }

    for (i = 0; i < G.bits.length; i++) {
      var b = G.bits[i];
      g.fillStyle = b.col; g.fillRect(Math.round(b.x), Math.round(b.y), b.size, b.size);
    }
    scene.drawFront();

    var shake = G.shake > 0 ? Math.round((Math.random() - 0.5) * 2 * Math.min(1, G.shake * 4)) * Math.max(1, Math.round(scene.scale)) : 0;
    el.cv.style.transform = shake ? 'translate(' + shake + 'px,' + (-shake) + 'px)' : '';
  }

  var last = 0;
  function frame(now) {
    var dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
    last = now;
    update(dt);
    render();
    window.requestAnimationFrame(frame);
  }

  // ---------- controls ----------
  el.answerForm.addEventListener('submit', function (ev) { ev.preventDefault(); submit(el.answer.value); focusAnswer(); });
  el.playDaily.addEventListener('click', function () {
    var d = store.daily;
    startRun('daily', !!(d && d.num === D.dayNumber() && !d.done && d.idx > 0));
  });
  el.playEndless.addEventListener('click', function () { startRun('endless'); });
  el.againBtn.addEventListener('click', function () { startRun('endless'); });
  el.homeBtn.addEventListener('click', toMenu);
  el.quitBtn.addEventListener('click', toMenu);
  el.copyBtn.addEventListener('click', function () { copyResult(el.copyBtn); });
  el.doneCopy.addEventListener('click', function () { copyResult(el.doneCopy); });
  el.soundBtn.addEventListener('click', function () {
    store.sound = !store.sound; save(); drawMenu();
    if (store.sound) sfx.hit();
  });
  el.howBtn.addEventListener('click', function () {
    if (el.howto.showModal) el.howto.showModal(); else el.howto.setAttribute('open', '');
  });
  el.howClose.addEventListener('click', function () {
    if (el.howto.close) el.howto.close(); else el.howto.removeAttribute('open');
  });

  function onPointer(ev) {
    var nx = (ev.clientX / Math.max(1, window.innerWidth) - 0.5) * 2;
    var ny = (ev.clientY / Math.max(1, window.innerHeight) - 0.5) * 2;
    scene.pointer(nx, ny);
  }
  window.addEventListener('pointermove', onPointer, { passive: true });
  window.addEventListener('pointerdown', onPointer, { passive: true });
  window.addEventListener('resize', layout);
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', layout);
    window.visualViewport.addEventListener('scroll', layout);
  }

  function start() {
    layout();
    scene.setStage(2, true);
    toMenu();
    last = window.performance.now();
    window.requestAnimationFrame(frame);
  }

  WW.game = { G: G, CONFIG: CONFIG, scene: scene, store: store, submit: submit, startRun: startRun, toMenu: toMenu };

  var hot = window.claude && window.claude.hot;
  if (hot && hot.snapshot) hot.snapshot(function () { return { v: 2 }; });
  if (hot && hot.ready) hot.ready(start); else start();
})();
