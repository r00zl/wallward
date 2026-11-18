/* Wallward: game flow, drawing of the characters, and the page controls. */
(function () {
  'use strict';
  var WW = window.WW, D = WW.Daily, A = WW.Answers, Lookup = WW.Lookup, Scene = WW.Scene, Sp = WW.Sprites, Cape = WW.Cape, sfx = WW.Sound.sfx;

  // ---------- rules you may want to tune ----------
  var CONFIG = {
    LIVES: D.LIVES,         // torches: a foe reaching you, or a skipped foe, puts one out
    START: D.START,         // paces away a foe begins
    MAX_PACE: D.MAX_PACE,   // the furthest a foe can be driven back
    KNOCK: [0, 2, 2, 3],    // paces a blow of 1, 2 or 3 damage drives the foe back
    WRONG_STEP: 1,          // paces a wrong name lets the foe gain
    RELIGHT_EVERY: 5,       // endless march: felling every fifth foe relights a torch
    SHARE_URL: ''           // public address of the game, added to copied results
  };
  var COMBO_STEPS = [3, 5, 8]; // answers in a row at which the knight's strikes, and his blade, step up
  var TRACK = CONFIG.MAX_PACE;
  var GAP = 22;             // pixels between warrior and a foe at pace 0
  var NAMES = { cultist: 'Cultist', wolf: 'Dire wolf', skeleton: 'Skeleton', wraith: 'Wraith', dread: 'Dread knight' };
  var STORE_KEY = 'wallward.v3';
  var EMBER = ['#fff1c9', '#f5c044', '#f08a2c', '#d9432e'];
  var AURA = [null, ['#fff1c9', '#f5c044'], ['#f5c044', '#f08a2c', '#d9432e'], ['#ffffff', '#9fd8ff', '#5fa8ff']];
  // Sword angles in degrees: 0 points ahead, 90 straight up, 270 straight down. The blade is
  // drawn at the nearest of sixteen clean angles (Sprites.cleanAngle), so it turns in firm steps.
  var SWORD = { rest: 63, raised: 153, low: -45, up: 90, down: 270 };
  // The pose the knight holds through each part of a blow: one each, held, so the motion reads cleanly.
  var POSE = Sp.POSE;
  var STRIKE_POSE = { out: POSE.lunge, cut: POSE.lunge, back: POSE.pass,
    leap: POSE.air, hang: POSE.air, plunge: POSE.air, hold: POSE.air, rip: POSE.air, land: POSE.lunge, pose: POSE.stand };
  var GHOST = { gap: 7, life: 0.2 }; // after-images of a dash: pixels apart, and seconds each lasts
  var REEL = 0.24;       // seconds a foe staggers after a blow
  var BRACE = 0.82;      // share of the wait between steps after which a foe gathers itself to move
  var LOST_HOLD = 0.4;   // seconds lost health stays blanched on the bar before it drains
  var LOST_DRAIN = 12;   // pips a second it then drains at
  var STILL = { sink: 0, lean: 0, jolt: 0 }, BREATH = { sink: 1, lean: 0, jolt: 0 };
  var DUST = ['#8a8496', '#6b6474', '#a59fb0'];
  var BLINK = { every: 4.2, lasts: 0.13 }; // seconds
  // Seconds each part of a strike takes.
  var CUT = { quick: 0.085, last: 0.16, cleave: 0.2, back: 0.3 };
  var FINISH = { run: 0.18, leap: 0.42, hang: 0.2, plunge: 0.07, hold: 0.6, rip: 0.16, land: 0.3, pose: 0.6 };
  var FINISH_RISE = 10; // how far above his mark the knight hangs before the plunge
  var BLADE_DEPTH = 7;  // how far the point is driven into the skull

  var $ = function (id) { return document.getElementById(id); };
  var el = {};
  ['app', 'cv', 'veil', 'hud', 'lives', 'progress', 'score', 'quitBtn', 'banner', 'floats', 'combo', 'comboN', 'titleBlock',
    'menu', 'playDaily', 'dailyNo', 'dailyDone', 'doneMarks', 'doneLine', 'doneCopy', 'doneNext', 'answersBtn',
    'playEndless', 'endlessBest', 'howBtn', 'almanacBtn', 'soundBtn', 'stats',
    'fightTop', 'health', 'foe', 'qText', 'rule', 'chips', 'fightBottom', 'answerForm', 'answer', 'skipBtn', 'strikeBtn', 'feedback',
    'end', 'endKicker', 'endTitle', 'endScore', 'endRank', 'endMarks', 'copyBtn', 'againBtn', 'homeBtn', 'nextIn', 'endRecap',
    'copyBox', 'copyText', 'howto', 'howClose', 'book', 'bookTitle', 'bookBody', 'bookClose'].forEach(function (id) { el[id] = $(id); });

  var BANK = WW.buildBank();
  A.setGuard(BANK);
  var SPR = Sp.build();
  var scene = new Scene(el.cv);
  var calm = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  scene.calm = calm;

  // ---------- saved data (this browser only) ----------
  // found: the oldest answers the player has given, by question, for the almanac
  var store = { stats: { played: 0, streak: 0, maxStreak: 0, lastNum: 0, best: 0, bestEndless: 0 }, daily: null,
    sound: false, soundSet: false, found: {} };
  try {
    var raw = JSON.parse(window.localStorage.getItem(STORE_KEY) || 'null');
    if (raw && raw.stats) {
      store.stats = Object.assign(store.stats, raw.stats); store.daily = raw.daily || null;
      store.sound = !!raw.sound; store.soundSet = !!raw.soundSet; store.found = raw.found || {};
    }
    else {
      // carry the streak over from the earlier version of the game
      var old = JSON.parse(window.localStorage.getItem('wallward.v2') || 'null');
      if (old && old.stats) {
        store.stats.played = old.stats.played || 0; store.stats.streak = old.stats.streak || 0;
        store.stats.maxStreak = old.stats.maxStreak || 0; store.stats.lastNum = old.stats.lastNum || 0;
        store.sound = !!old.sound;
      }
    }
  } catch (e) { /* storage unavailable: play without saving */ }
  function save() {
    try { window.localStorage.setItem(STORE_KEY, JSON.stringify(store)); } catch (e) { /* ignore */ }
  }
  WW.Sound.enabled = store.sound;

  var heroCape = new Cape(9, 3, [6, 7, 8, 8, 8, 7, 6, 5, 3], ['#c12a3a', '#8f1d2c', '#5e1220']);
  var foeCape = new Cape(10, 3, [8, 9, 10, 10, 10, 9, 8, 7, 5, 4], ['#6e1420', '#3a0b14', '#1f060b']);

  // ---------- state ----------
  var G = {
    mode: null, phase: 'title', phaseT: 0, num: 0, plan: null, idx: 0, total: 0,
    lives: CONFIG.LIVES, score: 0, results: [], recap: [], flawless: true, combo: 0, bestCombo: 0,
    enemy: null, def: null, prompt: null, used: {}, usedList: [],
    reveal: '', recent: [], skipArmed: 0, told: false, asking: null,
    camFrom: 0, camTo: 0, walkDur: 2.4, spawned: false,
    strike: null, bits: [], arcs: [], trail: [], fx: [], shake: 0, stop: 0, emberT: 0,
    hero: { dx: 0, dy: 0, walkT: 0, hurt: 0, sword: SWORD.rest },
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
    // the combo count is cut into the face of the wall, under the knight
    el.combo.style.top = Math.round((scene.groundY + 9) * scene.scale) + 'px';
    skyline();
  }

  /** Tell the scene how much of the sky the question covers, so sun and moon stay in view. */
  function skyline() {
    var r = el.fightTop.hidden ? null : el.fightTop.getBoundingClientRect();
    scene.skyTarget = r ? Math.round((r.bottom - el.app.getBoundingClientRect().top) / scene.scale) : 0;
  }

  function paceLen() {
    return (scene.W - scene.warriorX() - GAP - 34) / TRACK;
  }

  // ---------- page helpers ----------
  function show(view) {
    el.menu.hidden = view !== 'menu';
    el.titleBlock.hidden = view !== 'menu';
    el.fightTop.hidden = el.fightBottom.hidden = el.hud.hidden = view !== 'fight';
    el.end.hidden = view !== 'end';
    if (view !== 'fight') { el.combo.hidden = true; el.floats.innerHTML = ''; el.banner.hidden = true; }
    skyline();
  }

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; });
  }

  var flameOn = Sp.iconURL('flame', 3), flameOff = Sp.iconURL('flameOut', 3);

  function drawHud() {
    var i, html = '';
    for (i = 0; i < CONFIG.LIVES; i++) html += '<img alt="" width="27" height="30" src="' + (i < G.lives ? flameOn : flameOff) + '">';
    el.lives.innerHTML = html;
    el.lives.setAttribute('aria-label', G.lives + ' of ' + CONFIG.LIVES + ' torches lit');
    var narrow = (el.app.clientWidth || 400) < 360;
    el.progress.textContent = G.mode === 'daily'
      ? (narrow ? '' : 'Foe ') + Math.min(G.idx + 1, G.total) + (narrow ? '/' : ' of ') + G.total
      : 'Foe ' + (G.idx + 1);
    el.score.textContent = D.fmt(G.score);
  }

  /** The foe's name and health on the question plate; `fate` replaces the health once it is done with. */
  function drawFoe(fate) {
    var e = G.enemy;
    el.foe.textContent = e ? NAMES[e.kind] : '';
    el.health.textContent = !e ? '' : fate || (e.hp > 0 ? 'Health ' + e.hp + ' of ' + e.maxHp : 'Felled');
  }

  var fbTimer = 0;
  function feedback(kind, text, hold) {
    el.feedback.className = 'feedback outlined ' + kind;
    el.feedback.textContent = text;
    window.clearTimeout(fbTimer);
    fbTimer = window.setTimeout(function () { el.feedback.textContent = ''; }, hold || 4200);
  }

  var bannerTimer = 0;
  function banner(text) {
    el.banner.textContent = text;
    el.banner.hidden = false;
    el.banner.classList.remove('go'); void el.banner.offsetWidth; el.banner.classList.add('go');
    window.clearTimeout(bannerTimer);
    bannerTimer = window.setTimeout(function () { el.banner.hidden = true; }, 2800);
  }

  function clearBanner() {
    window.clearTimeout(bannerTimer);
    el.banner.hidden = true;
  }

  function veil(kind) {
    el.veil.className = 'veil';
    void el.veil.offsetWidth;
    el.veil.className = 'veil ' + kind;
  }

  /** The answers given to this foe; the number on each is the damage it dealt. */
  function drawChips() {
    var html = '', i;
    for (i = 0; i < G.usedList.length; i++) {
      var a = G.usedList[i];
      html += '<span class="chip d' + a.dmg + '"><i>' + a.dmg + '</i><span>' + esc(a.name) + ' <small>' + esc(WW.fmtYear(a)) + '</small></span></span>';
    }
    el.chips.innerHTML = html;
    // only a couple of lines of them fit (one, with a phone keyboard up): keep the newest in view
    el.chips.scrollLeft = el.chips.scrollWidth; el.chips.scrollTop = el.chips.scrollHeight;
    skyline();
  }

  function setPrompt(p, note) {
    G.prompt = p; G.asking = null;
    if (p) { G.used = {}; G.usedList = []; }
    el.qText.textContent = p ? p.q : (note || '');
    el.rule.textContent = p ? 'Give the oldest answer you can. Dated by ' + p.by + '.' : '';
    el.answer.placeholder = p ? 'Oldest you know' : '';
    drawChips();
  }

  /** The question is over: say what became of the foe in its place. */
  function closePrompt(text) {
    G.prompt = null; G.asking = null;
    el.qText.textContent = text;
    el.rule.textContent = '';
  }

  /** A three-damage answer the player did not give: something to carry away once a foe is done with. */
  function example(p) {
    var heavy = p.answers.filter(function (a) { return a.dmg === 3; });
    var unused = heavy.filter(function (a) { return !G.used[a.key]; });
    var pool = unused.length ? unused : heavy;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  function dated(a) { return a.name + ', ' + WW.fmtYear(a); }

  /**
   * Note how a foe was dealt with: its mark for the shared result, and the question, the
   * answers given and a three-damage answer that was not, to be read over when the wall is
   * done. Returns what to say of it on the question plate.
   */
  function record(mark) {
    var p = G.prompt, found = G.usedList.indexOf(p.oldest) !== -1, tip = found ? '' : dated(example(p));
    G.results.push(mark);
    G.recap.push({ q: p.q, given: G.usedList.map(dated), tip: tip, found: found });
    return found ? 'You gave the oldest answer there is.' : 'A 3-damage answer was ' + tip + '.';
  }

  /** The questions of a run as list items: what was asked, what was given, and a three-damage answer. */
  function recapHtml(results, recap) {
    return (recap || []).map(function (r, i) {
      var tip = r.tip || r.oldest; // walls saved before the tip was kept hold the oldest answer in its place
      return '<li><p class="asked">' + D.markRow([results[i]], 1) + ' ' + esc(r.q) + '</p>' +
        '<p>You: ' + (r.given.length ? esc(r.given.join(' · ')) : 'no answer') + '</p>' +
        (r.found ? '<p class="found">You found the oldest answer.</p>' : '<p class="tip">A 3-damage answer: ' + esc(tip) + '</p>') + '</li>';
    }).join('');
  }

  /** The almanac: every question, with its oldest answer once the player has given it. */
  function almanacHtml() {
    var found = [], unfound = [];
    BANK.forEach(function (p) {
      if (store.found[p.id] === p.oldest.name) found.push('<li><p class="asked">' + esc(p.q) + '</p><p class="found">' + esc(dated(p.oldest)) + '</p></li>');
      else unfound.push('<li>' + esc(p.q) + '</li>');
    });
    return '<p>' + found.length + ' of ' + BANK.length + ' oldest answers found. Give a question its oldest answer and it is written here.</p>' +
      '<ol class="recap">' + found.join('') + '</ol>' +
      (unfound.length ? '<h3>Still to find</h3><ul class="unfound">' + unfound.join('') + '</ul>' : '');
  }

  function openDialog(d) {
    if (d.showModal) d.showModal(); else d.setAttribute('open', '');
    d.scrollTop = 0; // focus lands on Close at the foot; start reading from the top
  }
  function closeDialog(d) {
    if (d.close) d.close(); else d.removeAttribute('open');
  }
  /** Open the reading dialog on a page of text: the almanac, or today's answers. */
  function openBook(title, html) {
    el.bookTitle.textContent = title;
    el.bookBody.innerHTML = html;
    openDialog(el.book);
  }

  function showCombo(n) {
    if (n < 2) { el.combo.hidden = true; return; }
    el.comboN.textContent = '×' + n;
    el.combo.className = 'combo outlined l' + Math.max(1, comboLevel(n));
    el.combo.hidden = false;
    void el.combo.offsetWidth;
    el.combo.classList.add('pop');
    if (COMBO_STEPS.indexOf(n) !== -1) sfx.combo(n);
  }

  function breakCombo() {
    if (G.combo >= 2) {
      el.combo.className = 'combo outlined broke';
      window.setTimeout(function () { if (G.combo < 2) el.combo.hidden = true; }, 480);
    }
    G.combo = 0;
  }

  /** 0 to 3: how many of the combo steps a run of `n` true answers has passed. */
  function comboLevel(n) {
    var level = 0;
    while (level < COMBO_STEPS.length && n >= COMBO_STEPS[level]) level++;
    return level;
  }

  // ---------- a run ----------
  function startRun(mode, resume) {
    WW.Sound.wake();
    G.mode = mode; G.results = []; G.recap = []; G.score = 0; G.lives = CONFIG.LIVES; G.idx = 0;
    G.combo = 0; G.bestCombo = 0; G.recent = []; G.reveal = ''; G.told = false;
    G.bits = []; G.arcs = []; G.trail = []; G.fx = [];
    G.enemy = null; G.strike = null; G.hero.dx = 0; G.hero.dy = 0;
    G.used = {}; G.usedList = [];
    el.combo.hidden = true;
    if (mode === 'daily') {
      G.num = D.dayNumber();
      G.plan = D.dailyPlan(G.num, BANK);
      G.total = G.plan.enemies.length;
      var d = store.daily;
      if (resume && d && d.num === G.num && !d.done) {
        G.idx = d.idx; G.results = d.results.slice(); G.recap = (d.recap || []).slice(); G.lives = d.lives; G.score = d.score;
        G.combo = d.combo || 0; G.bestCombo = d.best || 0;
      } else {
        store.daily = { num: G.num, idx: 0, results: [], recap: [], lives: G.lives, score: 0, combo: 0, best: 0, done: false, total: G.total };
        save();
      }
    } else {
      G.plan = null; G.total = 0;
    }
    show('fight');
    el.answer.value = '';
    el.feedback.textContent = '';
    drawHud();
    showCombo(G.combo);
    el.combo.classList.remove('pop');
    approach();
    focusAnswer();
  }

  function focusAnswer() {
    try { el.answer.focus({ preventScroll: true }); } catch (e) { el.answer.focus(); }
  }

  /** Walk on to the next foe. */
  function approach() {
    if (G.mode === 'daily') G.def = G.plan.enemies[G.idx];
    else {
      G.def = D.endlessEnemy(G.idx + 1);
      G.def.prompt = D.drawPrompt(BANK, G.def.tier, G.recent);
      G.def.hp = Math.min(G.def.hp, G.def.prompt.hpCap);
    }
    G.phase = 'walk'; G.phaseT = 0; G.spawned = false; G.enemy = null; G.strike = null;
    G.flawless = true;
    disarmSkip();
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
    setPrompt(null, G.reveal || 'Something stirs along the wall…');
    drawHud(); drawFoe();
  }

  function spawn() {
    G.spawned = true;
    G.enemy = { kind: G.def.kind, spr: SPR[G.def.kind], pace: CONFIG.START, shown: CONFIG.START + 12, interval: G.def.interval,
      hp: G.def.hp, maxHp: G.def.hp, hpShown: G.def.hp, hpLost: G.def.hp, lostWait: 0,
      stepT: 0, hop: 0, foot: 0, flash: 0, reel: 0, attack: 0, struck: false, gone: false };
    foeCape.ready = false;
  }

  function engage() {
    G.phase = 'fight'; G.phaseT = 0; G.reveal = '';
    G.enemy.shown = G.enemy.pace = CONFIG.START;
    G.enemy.stepT = 0;
    setPrompt(G.def.prompt);
    drawFoe();
    // every foe opens with the one thing to remember; the first of a run says it large
    feedback('tip', 'Give the oldest answer you can: the older it is, the harder the blow.', 6000);
    if (!G.told) { G.told = true; banner('Name the oldest you can'); }
  }

  function stepEnemy(quiet) {
    var e = G.enemy;
    e.pace = Math.max(0, e.pace - 1);
    e.hop = 1; e.foot ^= 1;
    dust(e);
    if (!quiet) sfx.step();
    if (e.pace <= 0) { e.attack = 0.0001; e.struck = false; }
  }

  /**
   * The knight dashes to the foe, cuts, and springs back. onImpact fires as the last cut lands.
   * A two-damage answer is a double cut; three damage is a leaping cleave. A running combo
   * adds quick cuts before the blow: one at three in a row, two at five, three at eight.
   */
  function strike(tier, combo, onImpact) {
    settleStrike();
    var level = comboLevel(combo);
    var cuts = calm ? 1 : Math.min(4, (tier === 2 ? 2 : 1) + level);
    G.strike = { kind: 'cut', stage: 'out', t: 0, from: G.hero.dx, onImpact: onImpact, landed: false,
      tier: tier, cuts: cuts, cut: 0, ticked: false, leap: tier === 3 && !calm, level: level };
    sfx.dash();
  }

  /** A new answer, or a skip, cannot wait for a blow still in the air: land it now. */
  function settleStrike() {
    var s = G.strike;
    if (s && !s.landed) { s.landed = true; s.onImpact(); }
  }

  /**
   * The finishing blow, for any foe felled outright by the oldest answer and for every dread
   * knight: a run, a leap, a held breath at the top with the sword reversed, then the point
   * driven down through the skull. The knight stays there a moment before wrenching the
   * blade free, and only then does the foe come apart.
   */
  function finisher(combo, onImpact, onBurst) {
    settleStrike();
    G.strike = { kind: 'finisher', stage: 'run', t: 0, from: G.hero.dx, onImpact: onImpact, onBurst: onBurst,
      landed: false, embed: false, tier: 3, level: comboLevel(combo), sparkT: 0, sparks: 0 };
    sfx.dash();
  }

  /** True while the finishing blow is being struck (not once the knight is walking back). */
  function finishing() {
    return !!G.strike && G.strike.kind === 'finisher' && G.strike.stage !== 'back';
  }

  /** The crown of a foe's head on screen: where the reversed blade goes in. */
  function skullY(e) {
    return foeAt(e).feet - e.spr.h - foeLift(e) + e.spr.skull[1];
  }

  /**
   * Where the knight must be for the reversed blade to stand in the foe's skull. The blade
   * hangs 16 pixels in from his left edge and its point 37 below his top, and it is sunk
   * BLADE_DEPTH pixels into the head.
   */
  function finisherMark(e) {
    var ws = SPR.warrior, bladeX = ws.shoulder[0] + 3, bladeTip = ws.shoulder[1] + 5 + 18;
    return { dx: Math.round(foeX(e) - e.spr.w / 2) + e.spr.skull[0] - bladeX + 9,
      dy: skullY(e) + BLADE_DEPTH - bladeTip - (foeAt(e).feet - ws.h) };
  }

  /** A gleam on the point of the sword. */
  function glint() {
    var sw = swordAt(heroPose());
    G.fx.push({ kind: 'glint', x: sw.tipX, y: sw.tipY + 3, t: 0, life: 0.2 });
  }

  function updateFinisher(dt) {
    var s = G.strike, h = G.hero, e = G.enemy, m = finisherMark(e), top = m.dy - FINISH_RISE, u;
    s.t += dt;
    function next(stage) { s.stage = stage; s.t = 0; }
    if (s.stage === 'run') {
      u = Math.min(1, s.t / FINISH.run);
      h.dx = s.from + (m.dx - 30 - s.from) * easeOut(u);
      h.sword = SWORD.raised;
      if (u >= 1) { next('leap'); s.from = h.dx; sfx.leap(); }
    } else if (s.stage === 'leap') {
      u = Math.min(1, s.t / FINISH.leap);
      h.dx = s.from + (m.dx - s.from) * easeOut(u);
      h.dy = top * easeOut(u);
      h.sword = SWORD.raised + (SWORD.down - SWORD.raised) * ease(u); // the blade comes over and round to point straight down
      if (u >= 1) { next('hang'); glint(); }
    } else if (s.stage === 'hang') {
      u = Math.min(1, s.t / FINISH.hang);
      h.dx = m.dx; h.dy = top - Math.sin(u * Math.PI) * 2; h.sword = SWORD.down;
      if (u >= 1) next('plunge');
    } else if (s.stage === 'plunge') {
      u = Math.min(1, s.t / FINISH.plunge);
      h.dx = m.dx; h.dy = top + FINISH_RISE * u * u; h.sword = SWORD.down;
      if (u >= 1) { next('hold'); s.landed = true; s.embed = true; s.onImpact(); }
    } else if (s.stage === 'hold') {
      h.dx = m.dx; h.dy = m.dy; h.sword = SWORD.down;
      s.sparkT -= dt;
      if (s.sparkT <= 0) {
        // sparks from the wound, and now and then a white flicker through the foe
        s.sparkT = 0.05; s.sparks++;
        embers(e, 2);
        if (s.sparks % 4 === 0) e.flash = 0.04;
      }
      if (s.t >= FINISH.hold) { next('rip'); s.embed = false; s.onBurst(); }
    } else if (s.stage === 'rip') {
      u = Math.min(1, s.t / FINISH.rip);
      var before = h.sword;
      h.dy = m.dy - 7 * Math.sin(u * Math.PI / 2);
      h.sword = SWORD.down + 180 * easeOut(u); // wrenched free and swept up overhead
      G.arcs.push({ a0: before, a1: h.sword, life: 0.16, tier: 3, level: s.level, big: true });
      if (u >= 1) { next('land'); s.from = h.dy; h.sword = SWORD.up; }
    } else if (s.stage === 'land') {
      u = Math.min(1, s.t / FINISH.land);
      h.dy = s.from * (1 - u * u); h.sword = SWORD.up;
      if (u >= 1) { next('pose'); h.dy = 0; G.shake = 0.14; }
    } else if (s.stage === 'pose') {
      h.sword = SWORD.up + Math.sin(s.t * 9) * 3;
      if (s.t >= FINISH.pose) { next('back'); s.from = h.dx; s.swordFrom = SWORD.up; }
    }
    if (s.stage === 'leap' || s.stage === 'plunge' || s.stage === 'rip') ghost();
  }

  /** The point goes in: the foe is finished, but still standing. */
  function finisherImpact(e, blow) {
    e.hpShown = 0; e.lostWait = LOST_HOLD; e.flash = 0.3;
    floatDamage(e, blow);
    embers(e, 30); bolt(e); ring(e); veil('flash');
    sfx.hit(3, blow.combo); sfx.thud();
    G.shake = 0.6; G.stop = 0.2;
  }

  /** The blade is wrenched free, and the foe comes apart. */
  function finisherBurst(e) {
    shatter(e);
    e.gone = true;
    burst(e, 70); embers(e, 40); ring(e); bolt(e);
    sfx.fell(); sfx.thud();
    G.shake = 0.5; G.stop = 0.07;
    if (e.kind === 'dread') banner(G.mode === 'daily' ? 'The wall holds' : 'A dread knight falls');
  }

  function submit(text) {
    if (G.phase !== 'fight' || !G.prompt || G.enemy.attack > 0) return;
    var res = A.check(String(text), G.prompt, G.used);
    if (res.empty) return;
    if (G.asking) { G.asking.next = String(text); el.answer.value = ''; return; } // it waits its turn
    disarmSkip();
    if (res.vague) { feedback('miss', 'More than one answer goes by that name. Which one?'); return; }
    el.answer.value = '';
    if (res.ok) hit(res);
    else if (res.used) feedback('miss', 'You have already struck with ' + res.ans.name + '.');
    else if (res.outside) miss(res.several ? 'That name is real, but not what this foe asks.' : res.ans.name + ' is real, but not what this foe asks.');
    else if (Lookup.covers(G.prompt.family)) consult(String(text));
    else miss('No such name on the roll.');
  }

  /**
   * A name that is not on the roll may still be a true answer: no roll holds every painter.
   * Ask the archives. The foe holds its ground until they reply, since the wait is not the
   * player's doing, and an answer typed meanwhile is kept and judged straight after.
   */
  function consult(text) {
    var p = G.prompt, asking = G.asking = { next: '' };
    feedback('tip', 'Not on the roll. Searching the archives…', 12000);
    Lookup.find(p.family, text, p.people).then(function (found) {
      if (G.asking !== asking) return; // the foe is done with, or the run is over
      G.asking = null;
      judge(found, p);
      if (asking.next) submit(asking.next); // an answer given meanwhile
    });
  }

  /** Act on what the archives said of a name that was not on the roll. */
  function judge(found, p) {
    if (found.status === 'none') { miss('No such name on the roll, nor in the archives.'); return; }
    if (found.status === 'unreachable') { feedback('miss', 'Not on the roll, and the archives cannot be reached. No ground lost.'); return; }
    if (found.status === 'undated') { feedback('miss', found.name + ' is in the archives, but with no date to go by. No ground lost.'); return; }
    // the archives may know an answer on the roll by another of its names
    var a = found.ans, listed = A.known([a.name].concat(a.alts), p);
    if (listed ? listed.outside : !WW.within(p, a)) { miss(a.name + ' is real, but not what this foe asks.'); return; }
    var ans = listed ? listed.ans : { name: a.name, year: a.year, approx: a.approx, alts: [], key: a.key,
      dmg: WW.damage(a.year, p.cut), archive: true };
    if (G.used[ans.key]) feedback('miss', 'You have already struck with ' + ans.name + '.');
    else hit({ ans: ans, exact: true });
  }

  function hit(res) {
    var e = G.enemy, p = G.prompt, a = res.ans;
    G.used[a.key] = true; G.usedList.push(a);
    clearBanner(); // the fight is on: whatever was written across the sky has been read
    G.combo++; G.bestCombo = Math.max(G.bestCombo, G.combo);
    // the oldest answer on the roll (or one as good as) fells any foe, whatever health it has left
    var outright = D.kills(p, a);
    e.hp = outright ? 0 : Math.max(0, e.hp - a.dmg);
    var blow = { ans: a, dmg: a.dmg, combo: G.combo, killed: e.hp <= 0, outright: outright, oldest: a === p.oldest };
    var gain = D.hitGlory(blow.dmg, blow.combo);
    var worth = !outright ? blow.dmg + ' damage.' : blow.oldest ? 'the oldest answer.'
      : a.year < p.oldest.year ? 'older than any answer on the roll.' : 'all but the oldest answer.';
    var said = a.name + ', ' + WW.fmtYear(a) + ': ' + worth + (a.archive ? ' Found in the archives.' : res.exact ? '' : ' Close enough.');
    var learned = blow.oldest && store.found[p.id] !== a.name;
    if (learned) { store.found[p.id] = a.name; save(); }
    if (blow.killed) {
      gain += D.fellGlory(e.pace, G.flawless) + (outright ? D.OLDEST_GLORY : 0);
      var told = record(outright ? 'K' : G.flawless ? 'F' : 'W');
      G.phase = 'felled'; G.phaseT = 0;
      var relit = G.mode === 'endless' && (G.idx + 1) % CONFIG.RELIGHT_EVERY === 0 && G.lives < CONFIG.LIVES;
      if (relit) G.lives++;
      var how = outright ? 'Felled outright' : G.flawless ? 'Felled cleanly' : 'Felled';
      feedback('ok t' + blow.dmg, said + ' ' + how + ', +' + D.fmt(gain) + ' glory.' + (learned ? ' Written in your almanac.' : '') +
        (relit ? ' A torch is relit.' : ''), 5200);
      G.reveal = NAMES[e.kind] + (outright ? ' felled outright. ' : ' felled. ') + told;
      closePrompt(G.reveal);
    } else {
      feedback('ok t' + blow.dmg, said + ' +' + D.fmt(gain) + ' glory.');
    }
    G.score += gain;
    showCombo(blow.combo);
    if (blow.killed && (outright || e.kind === 'dread') && !calm) {
      finisher(blow.combo, function () { finisherImpact(e, blow); }, function () { finisherBurst(e); });
    } else {
      strike(blow.dmg, blow.combo, function () { impact(e, blow); });
    }
    drawChips(); drawHud(); drawFoe();
  }

  /** The moment the blade lands: the damage shows, the foe is thrown back, and the sparks fly. */
  function impact(e, blow) {
    var dmg = blow.dmg;
    chips(e, e.hp, e.hpShown);
    e.hpShown = e.hp; e.lostWait = LOST_HOLD;
    e.flash = dmg === 3 ? 0.26 : 0.16;
    if (!blow.killed) {
      e.pace = Math.min(CONFIG.MAX_PACE, e.pace + CONFIG.KNOCK[dmg]);
      e.stepT = 0;
      e.reel = REEL;
    }
    floatDamage(e, blow);
    burst(e, blow.killed ? 40 : 5 + dmg * 5);
    if (dmg >= 2) embers(e, dmg === 3 ? 28 : 10);
    if (dmg === 3) { bolt(e); ring(e); if (!calm) veil('flash'); }
    if (blow.killed) { shatter(e); e.gone = true; sfx.fell(); }
    sfx.hit(dmg, blow.combo);
    if (!calm) { G.shake = [0, 0.16, 0.24, 0.44][dmg] + (blow.killed ? 0.1 : 0); G.stop = [0, 0.04, 0.06, 0.11][dmg]; }
  }

  /** A name that is not on the roll: the foe gains ground and the combo is lost. No torch goes out. */
  function miss(text) {
    breakCombo();
    G.flawless = false;
    feedback('miss', text + ' It gains a pace.');
    sfx.wrong();
    if (!calm) G.shake = 0.12;
    for (var i = 0; i < CONFIG.WRONG_STEP && G.enemy.attack === 0; i++) stepEnemy(true);
  }

  /** A torch goes out. Returns false if it was the last. */
  function loseTorch(text) {
    G.lives--;
    breakCombo();
    G.flawless = false;
    G.hero.hurt = 0.7;
    if (!calm) G.shake = 0.4;
    veil('hurt');
    sfx.miss();
    drawHud();
    if (G.mode === 'daily' && store.daily) { store.daily.lives = G.lives; store.daily.combo = 0; save(); }
    if (G.lives <= 0) {
      var told = record('X');
      G.phase = 'falling'; G.phaseT = 0;
      feedback('miss', text + ' The last torch goes out.', 6000);
      closePrompt(told);
      sfx.fall();
      return false;
    }
    feedback('miss', text + ' A torch goes out.');
    return true;
  }

  var skipTimer = 0;
  function disarmSkip() {
    G.skipArmed = 0;
    window.clearTimeout(skipTimer);
    el.skipBtn.classList.remove('armed');
    el.skipBtn.textContent = 'Skip';
  }

  /** Let the foe pass: costs a torch, keeps the glory already won. Asks twice, since it cannot be undone. */
  function skip() {
    var e = G.enemy;
    if (G.phase !== 'fight' || !e || e.attack > 0) return;
    if (!G.skipArmed) {
      G.skipArmed = 1;
      el.skipBtn.classList.add('armed');
      el.skipBtn.textContent = 'Sure?';
      feedback('miss', 'Skip this foe? It costs a torch. Press again to let it pass.', 3200);
      skipTimer = window.setTimeout(disarmSkip, 3200);
      return;
    }
    disarmSkip();
    settleStrike();
    var name = NAMES[e.kind];
    if (!loseTorch('You let the ' + name.toLowerCase() + ' pass.')) return;
    var told = record('S');
    G.phase = 'fleeing'; G.phaseT = 0;
    G.reveal = name + ' slipped past. ' + told;
    closePrompt(G.reveal);
    drawFoe('Slipped past');
  }

  // ---------- sparks and such ----------
  function foeAt(e) {
    var p = scene.plane();
    return { x: scene.warriorX() + p.x + GAP + e.shown * paceLen(), feet: scene.groundY + 4 + p.y };
  }

  function burst(e, n) {
    var c = foeAt(e), i, cols = e.spr.bits;
    if (calm) n = Math.ceil(n / 3);
    for (i = 0; i < n; i++) {
      G.bits.push({ x: c.x + (Math.random() - 0.5) * e.spr.w * 0.8, y: c.feet - Math.random() * e.spr.h,
        vx: (Math.random() - 0.25) * 90, vy: -40 - Math.random() * 90, life: 0.45 + Math.random() * 0.55, g: 280,
        col: cols[i % cols.length], size: Math.random() < 0.35 ? 2 : 1 });
    }
  }

  function embers(e, n) {
    var c = foeAt(e), i;
    if (calm) n = Math.ceil(n / 3);
    for (i = 0; i < n; i++) {
      G.bits.push({ x: c.x + (Math.random() - 0.5) * e.spr.w, y: c.feet - Math.random() * e.spr.h * 0.7,
        vx: (Math.random() - 0.5) * 70, vy: -30 - Math.random() * 110, life: 0.5 + Math.random() * 0.8, g: -30,
        col: EMBER[i % EMBER.length], size: Math.random() < 0.3 ? 2 : 1 });
    }
  }

  /** Grit kicked up from the wall top as a foe steps. The dread knight's tread shakes the stones. */
  function dust(e) {
    if (e.spr.floats || calm) return;
    var c = foeAt(e), heavy = e.kind === 'dread', n = heavy ? 6 : 3, i;
    for (i = 0; i < n; i++) {
      G.bits.push({ x: c.x + (Math.random() - 0.3) * e.spr.w * 0.6, y: c.feet - 1,
        vx: 6 + Math.random() * 26, vy: -8 - Math.random() * 22, life: 0.22 + Math.random() * 0.26, g: 70,
        col: DUST[i % DUST.length], size: 1 });
    }
    if (heavy) G.shake = Math.max(G.shake, 0.07);
  }

  /** The pips a blow knocks off a foe's health bar fall away as red chips. */
  function chips(e, from, to) {
    if (calm) return;
    var c = foeAt(e), box = barBox(e, c.x, c.feet - e.spr.h - foeLift(e)), i;
    for (i = from; i < to; i++) {
      G.bits.push({ x: box.left + 1 + i * (box.pw + 1) + Math.random() * box.pw, y: box.top + 2,
        vx: (Math.random() - 0.5) * 44, vy: -24 - Math.random() * 34, life: 0.32 + Math.random() * 0.22, g: 260,
        col: i % 2 ? '#ff8a6a' : '#d9432e', size: 1 });
    }
  }

  /** What is left of a felled foe: its shape, breaking into bands that slide apart as it fades. */
  function shatter(e) {
    var c = foeAt(e), spr = e.spr;
    G.fx.push({ kind: 'shatter', img: spr.flash[foeFrame(e)], x: Math.round(c.x - spr.w / 2), y: c.feet - spr.h - foeLift(e),
      feet: c.feet, rise: !!spr.floats, t: 0, life: calm ? 0.2 : 0.5 });
  }

  function ring(e) {
    var c = foeAt(e);
    G.fx.push({ kind: 'ring', x: c.x, y: c.feet, t: 0, life: 0.5 });
  }

  /** Lightning out of the sky, for the heaviest blows. */
  function bolt(e) {
    if (calm) return;
    var c = foeAt(e), top = c.feet - e.spr.h + 4, pts = [], y = -2, x = c.x + (Math.random() - 0.5) * 30, n = 9, i;
    for (i = 0; i <= n; i++) {
      var u = i / n;
      pts.push([x + (c.x - x) * u + (i === n ? 0 : (Math.random() - 0.5) * 12), y + (top - y) * u]);
    }
    var fork = Math.floor(n * 0.5);
    G.fx.push({ kind: 'bolt', pts: pts, t: 0, life: 0.22,
      fork: [pts[fork], [pts[fork][0] + 14, pts[fork][1] + 12], [pts[fork][0] + 17, pts[fork][1] + 24]] });
  }

  function slashMark(e, k, tier) {
    var c = foeAt(e);
    G.fx.push({ kind: 'slash', x: c.x, y: c.feet - e.spr.h * 0.55, dir: k % 2 ? 1 : -1, t: 0, life: 0.13, tier: tier });
  }

  /** The damage, and the date that earned it, leaping off the foe. A blow that fells outright says so instead. */
  function floatDamage(e, blow) {
    var c = foeAt(e), d = document.createElement('div');
    var worth = !blow.outright ? blow.dmg : blow.oldest ? 'Oldest' : 'Felled';
    d.className = 'float outlined t' + blow.dmg + (blow.outright ? ' word' : '');
    d.innerHTML = worth + '<small>' + esc(WW.fmtYear(blow.ans)) + '</small>';
    d.style.left = Math.round(c.x * scene.scale) + 'px';
    d.style.top = Math.round((c.feet - e.spr.h - 12) * scene.scale) + 'px';
    el.floats.appendChild(d);
    window.setTimeout(function () { if (d.parentNode) d.parentNode.removeChild(d); }, 1080);
  }

  function afterEnemy() {
    G.idx++;
    if (G.mode === 'daily') {
      var d = store.daily;
      d.idx = G.idx; d.results = G.results.slice(); d.recap = G.recap.slice();
      d.lives = G.lives; d.score = G.score; d.combo = G.combo; d.best = G.bestCombo;
      save();
    }
    if (G.mode === 'daily' && G.idx >= G.total) { finish(true); return; }
    approach();
  }

  function finish(held) {
    G.phase = 'over'; G.enemy = null; G.strike = null; G.hero.dx = 0; G.hero.dy = 0; G.prompt = null; G.reveal = '';
    var felled = D.felledCount(G.results);
    var s = store.stats, comboLine = G.bestCombo > 1 ? ' Best combo ×' + G.bestCombo + '.' : '';
    if (G.mode === 'daily') {
      var d = store.daily;
      if (!d.done) {
        d.done = true; d.held = held; d.results = G.results.slice(); d.recap = G.recap.slice();
        d.score = G.score; d.lives = G.lives; d.best = G.bestCombo;
        if (s.lastNum !== G.num) {
          s.played++;
          s.streak = s.lastNum === G.num - 1 ? s.streak + 1 : 1;
          s.maxStreak = Math.max(s.maxStreak, s.streak);
          s.lastNum = G.num;
        }
        s.best = Math.max(s.best, G.score);
      }
      el.endKicker.textContent = 'Wall No. ' + G.num;
      el.endTitle.textContent = held ? (felled === G.total ? 'The wall stands unbroken' : 'The wall held') : 'The wall fell';
      el.endRank.textContent = D.rankFor(G.score) + '. ' + felled + ' of ' + G.total + ' felled, ' +
        G.lives + (G.lives === 1 ? ' torch' : ' torches') + ' still burning.' + comboLine;
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
      el.endRank.textContent = felled + (felled === 1 ? ' foe' : ' foes') + ' felled.' + comboLine +
        (best && G.score > 0 ? ' A new best.' : ' Best ' + D.fmt(s.bestEndless) + ' glory.');
      el.endMarks.hidden = true;
      el.copyBtn.hidden = true;
      el.againBtn.textContent = 'March again';
      el.nextIn.hidden = true;
    }
    save();
    el.endScore.textContent = D.fmt(G.score);
    el.endRecap.innerHTML = recapHtml(G.results, G.recap);
    el.copyBox.hidden = true;
    if (held) sfx.win();
    show('end');
    tick();
    try { el.answer.blur(); el.end.querySelector('button:not([hidden])').focus({ preventScroll: true }); } catch (e) { /* ignore */ }
  }

  function shareUrl() {
    if (CONFIG.SHARE_URL) return CONFIG.SHARE_URL;
    return /\.github\.io$/.test(window.location.hostname) ? window.location.origin + window.location.pathname : '';
  }

  function copyResult(btn) {
    var d = store.daily;
    if (!d) return;
    var text = D.shareText(d.num, d.results, d.score, d.total || 5, shareUrl(), d.best || 0);
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
    G.mode = null; G.phase = 'title'; G.enemy = null; G.strike = null; G.bits = []; G.arcs = []; G.fx = []; G.trail = [];
    G.hero.dx = 0; G.hero.dy = 0; G.combo = 0; G.prompt = null;
    try { el.answer.blur(); } catch (e) { /* ignore */ }
    show('menu');
    drawMenu();
  }

  function drawMenu() {
    var num = D.dayNumber(), d = store.daily, s = store.stats;
    var today = d && d.num === num ? d : null;
    el.dailyNo.textContent = 'No. ' + num;
    el.titleBlock.classList.toggle('brief', !!(today && today.done)); // the taller menu needs the room on a small phone
    if (today && today.done) {
      el.playDaily.hidden = true;
      el.dailyDone.hidden = false;
      el.doneMarks.textContent = D.markRow(today.results, today.total || 5);
      el.doneLine.textContent = 'Wall No. ' + num + ': ' + D.fmt(today.score) + ' glory, ' + D.rankFor(today.score).toLowerCase() + '.';
      el.answersBtn.hidden = !(today.recap && today.recap.length);
    } else {
      el.playDaily.hidden = false;
      el.dailyDone.hidden = true;
      el.playDaily.firstChild.textContent = today && today.idx > 0 ? 'Return to today\'s wall ' : 'Hold today\'s wall ';
    }
    el.endlessBest.textContent = s.bestEndless ? 'Best ' + D.fmt(s.bestEndless) : 'No end';
    // until the switch has been used (or a few walls played), it asks to be noticed
    var nudge = !store.sound && !store.soundSet && s.played < 3;
    el.soundBtn.textContent = nudge ? 'Turn on sound and music' : 'Sound and music: ' + (store.sound ? 'on' : 'off');
    el.soundBtn.classList.toggle('nudge', nudge);
    el.soundBtn.setAttribute('aria-pressed', store.sound ? 'true' : 'false');
    el.stats.textContent = s.played
      ? 'Walls held ' + s.played + '. Streak ' + s.streak + (s.streak === 1 ? ' day' : ' days') + '.' + (s.best ? ' Best ' + D.fmt(s.best) + ' glory.' : '')
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

  /** How far off the ground a foe is drawn this frame: wraiths hover, the rest bob as they step. */
  function foeLift(e) {
    return e.spr.floats ? 4 + Math.round(Math.sin(scene.t * 3) * 2) : Math.round(Math.sin(Math.PI * e.hop) * 3);
  }

  /** Which frame of a foe to draw: hovering, mid-step, or standing. */
  function foeFrame(e) {
    var spr = e.spr;
    if (spr.floats) return Math.floor(scene.t * 4) % 2;
    if (spr.frames.length === 2) return e.hop > 0 ? e.foot : (spr.runs ? 0 : 1);
    return e.hop > 0 ? e.foot : 2;
  }

  /**
   * How a foe holds itself this frame, in whole pixels. `sink` presses its upper body down:
   * a breath, or the crouch before a step. `lean` tips it: forward into a step, back from a
   * blow. `jolt` shakes all of it as a blow lands.
   */
  function foeStance(e) {
    var spr = e.spr, waiting = G.phase === 'fight' && e.attack === 0 && e.hop <= 0;
    if (e.reel > 0) {
      var u = 1 - e.reel / REEL; // thrown back, then upright again
      return { sink: 0, lean: Math.round(Math.sin(u * Math.PI) * 2), jolt: u < 0.35 ? (Math.floor(scene.t * 50) % 2 ? 1 : -1) : 0 };
    }
    if (!waiting || spr.floats || calm) return STILL;
    if (e.pace <= 1 || e.stepT / e.interval > BRACE) return { sink: 1, lean: spr.runs ? 0 : -1, jolt: 0 }; // gathered to move
    return Math.sin(scene.t * (spr.runs ? 5 : 2.2) + e.pace) > 0.3 ? BREATH : STILL;
  }

  /** Draw a figure with its upper body pressed down and tipped as its stance says; the legs stay planted. */
  function drawStance(g, img, x, y, st) {
    if (!st.sink && !st.lean) { g.drawImage(img, x, y); return; }
    var waist = Math.round(img.height * 0.62);
    g.drawImage(img, 0, waist, img.width, img.height - waist, x, y + waist, img.width, img.height - waist);
    g.drawImage(img, 0, 0, img.width, waist, x + st.lean, y + st.sink, img.width, waist);
  }

  /** Where a foe's health bar sits: over its head, clear of any weapon it holds upright. */
  function barBox(e, cx, top) {
    var pw = e.maxHp <= 8 ? 4 : e.maxHp <= 10 ? 3 : 2, w = e.maxHp * (pw + 1) + 1;
    return { pw: pw, w: w, left: Math.round(cx) - Math.floor(w / 2), top: top - (e.spr.weapon && e.spr.weapon !== 'dagger' ? 23 : 10) };
  }

  /**
   * A foe's health: a pip for each point of damage it can still take. Pips just lost stay
   * blanched for a moment and then drain away, so the size of a blow can be read at a glance.
   * Beneath it runs the time left before the foe's next step.
   */
  function drawHealth(g, e, box) {
    var left = box.left, top = box.top, i;
    var last = e.hpShown === 1 && e.maxHp > 1 && Math.floor(scene.t * 5) % 2 === 0; // the last pip flickers
    g.fillStyle = Sp.OUTLINE; g.fillRect(left, top, box.w, 7);
    if (e.kind === 'dread') { // the dread knight's bar is capped in gold
      g.fillStyle = '#c9a24a'; g.fillRect(left - 1, top + 1, 1, 5); g.fillRect(left + box.w, top + 1, 1, 5);
    }
    for (i = 0; i < e.maxHp; i++) {
      var x = left + 1 + i * (box.pw + 1);
      if (i < e.hpShown) {
        g.fillStyle = last ? '#ff6a4a' : '#d9432e'; g.fillRect(x, top + 1, box.pw, 5);
        g.fillStyle = '#ff9a7a'; g.fillRect(x, top + 1, box.pw, 1);
        g.fillStyle = '#9a2a22'; g.fillRect(x, top + 5, box.pw, 1);
      } else if (i < e.hpLost) {
        g.fillStyle = '#f6e7c1'; g.fillRect(x, top + 1, box.pw, 5);
      } else {
        g.fillStyle = '#2b2836'; g.fillRect(x, top + 1, box.pw, 5);
        g.fillStyle = '#1d1b26'; g.fillRect(x, top + 1, box.pw, 1);
      }
    }
    if (G.phase !== 'fight' || e.attack > 0) return;
    // the wait before its next step: grey while it is held, and burning red when that step will reach the knight
    var held = !!G.strike || !!G.asking, near = e.pace <= 1;
    g.fillStyle = Sp.OUTLINE; g.fillRect(left, top + 7, box.w, 3);
    g.fillStyle = held ? '#8a8496' : near ? (Math.floor(scene.t * 8) % 2 ? '#ff5a3c' : '#ffd0b0') : e.pace <= 3 ? '#ff8a6a' : '#f5c044';
    g.fillRect(left + 1, top + 8, Math.round((box.w - 2) * (1 - e.stepT / e.interval)), 1);
  }

  /** Which frame of the knight to draw: walking, standing, or the pose of the blow he is striking. */
  function heroFrame() {
    var s = G.strike, h = G.hero;
    if (h.dy < -2) return POSE.air;
    if (s) return s.stage === 'run' ? Math.floor(s.t * 16) % 2 : STRIKE_POSE[s.stage];
    return G.phase === 'title' || G.phase === 'walk' ? Math.floor(h.walkT * 8) % 2 : POSE.stand;
  }

  /** Where the knight is drawn this frame: the top-left of his sprite, and which frame of it. */
  function heroPose() {
    var p = scene.plane(), h = G.hero, frame = heroFrame();
    var home = scene.warriorX() + p.x, feet = scene.groundY + 4 + p.y;
    return { home: home, feet: feet, frame: frame, still: frame === POSE.stand && !G.strike,
      x: home + Math.round(h.dx) - 9 - (h.hurt > 0.45 ? 3 : 0), y: feet - SPR.warrior.h + Math.round(h.dy) };
  }

  /** The knight's shoulder, sword hand and the point of his blade, for a pose. */
  function swordAt(pose) {
    var ws = SPR.warrior, deg = Sp.cleanAngle(G.hero.sword), a = deg * Math.PI / 180;
    var breathe = pose.still && Math.sin(scene.t * 2.4) > 0.6 ? 1 : 0;
    var sx = pose.x + ws.shoulder[0], sy = pose.y + ws.shoulder[1] + ws.bob[pose.frame] + breathe;
    var hx = sx + Math.round(Math.cos(a) * 3 + 2), hy = sy + Math.round(-Math.sin(a) * 3 + 2);
    return { deg: deg, sx: sx, sy: sy, hx: hx, hy: hy, tipX: hx + Math.cos(a) * 15, tipY: hy - Math.sin(a) * 15 };
  }

  /** Leave an after-image where the knight is, once he has moved clear of the last one. */
  function ghost() {
    var h = G.hero, last = G.trail[G.trail.length - 1];
    if (calm || (last && Math.abs(h.dx - last.dx) + Math.abs(h.dy - last.dy) < GHOST.gap)) return;
    G.trail.push({ dx: h.dx, dy: h.dy, frame: heroFrame(), life: GHOST.life });
  }

  /** With no blow in hand the knight settles back to his post and his guard. */
  function settleHero(dt) {
    var h = G.hero;
    h.dx += (0 - h.dx) * (1 - Math.exp(-dt * 12));
    if (Math.abs(h.dx) < 0.3) h.dx = 0;
    h.dy += (0 - h.dy) * (1 - Math.exp(-dt * 16));
    if (Math.abs(h.dy) < 0.3) h.dy = 0;
    h.sword += (SWORD.rest - h.sword) * (1 - Math.exp(-dt * 10));
  }

  function updateStrike(dt) {
    var s = G.strike, h = G.hero, e = G.enemy;
    if (!s) { settleHero(dt); return; }
    if (finishing()) { updateFinisher(dt); return; }
    s.t += dt;
    if (s.stage === 'out') {
      var reach = e ? foeX(e) - (e.spr.w / 2 + 11) : 40;
      var dur = Math.max(0.1, Math.min(0.2, Math.abs(reach - s.from) / 800)) + (s.leap ? 0.07 : 0);
      var u = Math.min(1, s.t / dur);
      h.dx = s.from + (reach - s.from) * easeOut(u);
      h.sword = SWORD.raised;
      if (s.leap) h.dy = -20 * Math.sin(u * Math.PI / 2); // up and over for the cleave
      if (u >= 1) { s.stage = 'cut'; s.t = 0; s.cut = 0; s.ticked = false; }
    } else if (s.stage === 'cut') {
      var last = s.cut === s.cuts - 1;
      var c = Math.min(1, s.t / (!last ? CUT.quick : s.tier === 3 ? CUT.cleave : CUT.last));
      // cuts alternate, and the last always comes down
      var down = (s.cuts - 1 - s.cut) % 2 === 0;
      var a0 = down ? SWORD.raised : SWORD.low, a1 = down ? SWORD.low : SWORD.raised;
      var before = s.t === dt ? a0 : h.sword;
      h.sword = a0 + (a1 - a0) * easeOut(c);
      G.arcs.push({ a0: before, a1: h.sword, life: 0.14, tier: last ? s.tier : 1, level: s.level, big: last && s.tier === 3 });
      var landAt = s.leap ? 0.55 : 0.35; // how far through the last cut the blade meets the foe
      if (s.leap && last) h.dy = -20 * (1 - Math.pow(Math.min(1, c / landAt), 2));
      if (!last && !s.ticked && c >= 0.45) {
        // a quick cut of the combo: it marks the foe but the damage comes with the last
        s.ticked = true;
        if (e && !e.gone) { e.flash = 0.06; slashMark(e, s.cut, 1); burst(e, 3); }
        sfx.cut(s.cut);
      }
      if (last && !s.landed && c >= landAt) {
        s.landed = true;
        if (e && !e.gone) slashMark(e, s.cut, s.tier);
        s.onImpact();
      }
      if (c >= 1) {
        if (last) { s.stage = 'back'; s.from = h.dx; }
        else { s.cut++; s.ticked = false; }
        s.t = 0;
      }
    } else {
      // back to his post, bringing the sword round to guard from wherever the blow left it
      var b = Math.min(1, s.t / CUT.back), from = s.swordFrom == null ? SWORD.low : s.swordFrom;
      h.dx = s.from * (1 - ease(b));
      h.dy *= 0.6;
      h.sword = from + (SWORD.rest - from) * ease(b);
      if (b >= 1) { h.dx = 0; h.dy = 0; G.strike = null; }
    }
    if (s.stage !== 'cut') ghost();
  }

  /** Move the run on: the walk between foes, the foe's advance, and what follows its end. */
  function updatePhase(dt) {
    var e = G.enemy, h = G.hero;
    if (G.phase === 'title') {
      G.titleT += dt;
      scene.camX += dt * 24;
      h.walkT += dt;
      if (!calm && G.titleT > 10) { G.titleT = 0; scene.setStage(scene.shownStage() + 1); }
    } else if (G.phase === 'walk') {
      var u = Math.min(1, G.phaseT / G.walkDur), lead = 1.0; // the foe comes into view over the last second
      scene.camX = G.camFrom + (G.camTo - G.camFrom) * ease(u);
      h.walkT += dt;
      if (!G.spawned && G.phaseT >= G.walkDur - lead) spawn();
      if (G.spawned) {
        var v = Math.min(1, (G.phaseT - (G.walkDur - lead)) / lead);
        G.enemy.shown = CONFIG.START + 12 * (1 - ease(v));
        G.enemy.foot = Math.floor(G.phaseT * 7) % 2;
        G.enemy.hop = 1 - ((G.phaseT * 3.5) % 1);
      }
      if (u >= 1) engage();
    } else if (G.phase === 'fight') {
      if (e.attack > 0) {
        // it has reached the knight: it strikes, then is thrown back to where it began
        e.attack += dt;
        if (!e.struck && e.attack > 0.2) {
          e.struck = true;
          loseTorch('The ' + NAMES[e.kind].toLowerCase() + ' reaches you.');
        }
        if (e.attack > 0.55 && G.phase === 'fight') { e.attack = 0; e.pace = CONFIG.START; e.stepT = 0; }
      } else if (!G.strike && !G.asking) {
        e.stepT += dt;
        if (e.stepT >= e.interval) { e.stepT -= e.interval; stepEnemy(); }
      }
    } else if (G.phase === 'felled') {
      // wait for the blow to play out; the long stop is only a guard against a stuck animation
      if ((e && e.gone && !G.strike && G.phaseT > 1.5) || G.phaseT > 6) afterEnemy();
    } else if (G.phase === 'fleeing') {
      // it runs on past the knight and off along the wall
      e.pace -= dt * 26;
      e.shown = e.pace;
      e.foot = Math.floor(G.phaseT * 12) % 2;
      e.hop = 1 - ((G.phaseT * 6) % 1);
      if (foeX(e) < -(scene.warriorX() + 40) || G.phaseT > 1.6) { e.gone = true; afterEnemy(); }
    } else if (G.phase === 'falling') {
      if (G.phaseT > 1.7) finish(false);
    }
  }

  /** A blade that has not missed in a while smoulders, then burns, then burns blue. */
  function updateAura(dt) {
    var level = comboLevel(G.combo);
    if (!level || calm || !G.mode) return;
    G.emberT -= dt;
    if (G.emberT > 0) return;
    G.emberT = [0, 0.09, 0.05, 0.035][level];
    var sw = swordAt(heroPose()), cols = AURA[level];
    G.bits.push({ x: sw.tipX + (Math.random() - 0.5) * 3, y: sw.tipY + (Math.random() - 0.5) * 3,
      vx: -14 + (Math.random() - 0.5) * 16, vy: -18 - Math.random() * 26, life: 0.3 + Math.random() * 0.35, g: -20,
      col: cols[Math.floor(Math.random() * cols.length)], size: 1 });
  }

  function updateSparks(dt) {
    var i;
    for (i = G.bits.length - 1; i >= 0; i--) {
      var b = G.bits[i];
      b.life -= dt; b.vy += b.g * dt; b.x += b.vx * dt; b.y += b.vy * dt;
      if (b.life <= 0) G.bits.splice(i, 1);
    }
    for (i = G.arcs.length - 1; i >= 0; i--) { G.arcs[i].life -= dt; if (G.arcs[i].life <= 0) G.arcs.splice(i, 1); }
    for (i = G.trail.length - 1; i >= 0; i--) { G.trail[i].life -= dt; if (G.trail[i].life <= 0) G.trail.splice(i, 1); }
    for (i = G.fx.length - 1; i >= 0; i--) { G.fx[i].t += dt; if (G.fx[i].t >= G.fx[i].life) G.fx.splice(i, 1); }
  }

  function updateCloaks(dt) {
    var pose = heroPose(), ws = SPR.warrior, e = G.enemy;
    heroCape.step(pose.x + ws.neck[0], pose.y + ws.neck[1] + ws.bob[pose.frame], -1, dt, scene.t, pose.feet);
    if (e && !e.gone && e.spr.cape) {
      var c = foeAt(e);
      foeCape.step(Math.round(c.x - e.spr.w / 2) + e.spr.cape[0], c.feet - e.spr.h + e.spr.cape[1], 1, dt, scene.t + 2, c.feet);
    }
  }

  function update(dt) {
    if (G.stop > 0) { G.stop -= dt; return; } // a held breath as a blow lands
    G.phaseT += dt;
    G.hero.hurt = Math.max(0, G.hero.hurt - dt);
    G.shake = Math.max(0, G.shake - dt);
    updatePhase(dt);
    var e = G.enemy;
    if (e && (G.phase === 'fight' || G.phase === 'felled' || G.phase === 'falling')) {
      e.shown += (e.pace - e.shown) * (1 - Math.exp(-dt * 12)); // it slides to where it stands, not jumps
      e.hop = Math.max(0, e.hop - dt / 0.28);
    }
    if (e) {
      e.flash = Math.max(0, e.flash - dt);
      e.reel = Math.max(0, e.reel - dt);
      if (e.lostWait > 0) e.lostWait -= dt;
      else e.hpLost = Math.max(e.hpShown, e.hpLost - dt * LOST_DRAIN);
    }
    updateStrike(dt);
    updateAura(dt);
    updateSparks(dt);
    scene.update(dt);
    updateCloaks(dt);
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
  function rim(g, white, x, y, stance) {
    if (!Scene.STAGES[scene.shownStage()].lit) return;
    var st = stance || STILL;
    g.globalAlpha = 0.32;
    drawStance(g, white, x - 1, y, st); drawStance(g, white, x + 1, y, st); drawStance(g, white, x, y - 1, st);
    g.globalAlpha = 1;
  }

  function shadow(g, cx, y, w) {
    g.fillStyle = 'rgba(10,6,16,0.34)';
    g.fillRect(Math.round(cx - w / 2), y, w, 2);
    g.fillRect(Math.round(cx - w / 2) + 2, y + 2, w - 4, 1);
  }

  function line(g, x0, y0, x1, y1, w) {
    var n = Math.max(1, Math.ceil(Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)))), i;
    for (i = 0; i <= n; i++) g.fillRect(Math.round(x0 + (x1 - x0) * i / n - (w - 1) / 2), Math.round(y0 + (y1 - y0) * i / n), w, 1);
  }

  function drawFx(g) {
    var i, k;
    for (i = 0; i < G.fx.length; i++) {
      var f = G.fx[i], u = f.t / f.life;
      if (f.kind === 'ring') {
        // a shockwave running out along the wall top
        var rx = 5 + 46 * easeOut(u), ry = Math.max(1.5, rx * 0.2);
        g.globalAlpha = 1 - u;
        g.fillStyle = u < 0.4 ? '#fff1c9' : '#f08a2c';
        for (k = 0; k < Math.PI * 2; k += 1 / rx) g.fillRect(Math.round(f.x + Math.cos(k) * rx), Math.round(f.y + Math.sin(k) * ry), 2, 1);
        g.globalAlpha = 1;
      } else if (f.kind === 'bolt') {
        if (u > 0.45 && Math.floor(f.t * 60) % 2) continue; // it flickers as it dies
        g.fillStyle = '#f5c044';
        for (k = 1; k < f.pts.length; k++) line(g, f.pts[k - 1][0], f.pts[k - 1][1], f.pts[k][0], f.pts[k][1], 3);
        for (k = 1; k < f.fork.length; k++) line(g, f.fork[k - 1][0], f.fork[k - 1][1], f.fork[k][0], f.fork[k][1], 1);
        g.fillStyle = '#ffffff';
        for (k = 1; k < f.pts.length; k++) line(g, f.pts[k - 1][0], f.pts[k - 1][1], f.pts[k][0], f.pts[k][1], 1);
      } else if (f.kind === 'glint') {
        // a four-pointed gleam on the point of the sword
        var arm = Math.round(1 + 5 * Math.sin(u * Math.PI));
        g.fillStyle = '#ffffff';
        g.fillRect(Math.round(f.x) - arm, Math.round(f.y), arm * 2 + 1, 1);
        g.fillRect(Math.round(f.x), Math.round(f.y) - arm, 1, arm * 2 + 1);
        g.fillStyle = '#9fd8ff';
        g.fillRect(Math.round(f.x) - 1, Math.round(f.y) - 1, 3, 3);
        g.fillStyle = '#ffffff';
        g.fillRect(Math.round(f.x), Math.round(f.y), 1, 1);
      } else if (f.kind === 'shatter') {
        // the foe's shape in bands: each slides its own way as the whole sinks (a wraith's rises) and fades
        var band = 3, rows = Math.ceil(f.img.height / band);
        g.globalAlpha = 1 - u;
        for (k = 0; k < rows; k++) {
          var drift = Math.round((k % 2 ? 1 : -1) * u * (3 + (k * 7) % 5));
          var fall = Math.round(u * u * (f.rise ? -(6 + k) : 5 + (rows - k) * 1.5));
          g.drawImage(f.img, 0, k * band, f.img.width, band, f.x + drift, Math.min(f.feet - band, f.y + k * band + fall), f.img.width, band);
        }
        g.globalAlpha = 1;
      } else if (f.kind === 'slash') {
        var half = f.tier === 3 ? 13 : f.tier === 2 ? 10 : 8;
        g.fillStyle = u < 0.5 ? '#ffffff' : f.tier === 3 ? '#f08a2c' : f.tier === 2 ? '#f5c044' : '#bfe6ff';
        line(g, f.x - half, f.y - half * 0.8 * f.dir, f.x + half, f.y + half * 0.8 * f.dir, f.tier === 3 ? 2 : 1);
      }
    }
  }

  function render() {
    var g = scene.g, e = G.enemy, h = G.hero, pose = heroPose(), home = pose.home, feet = pose.feet, i;
    scene.drawBack();

    // foe
    if (e && !e.gone) {
      var spr = e.spr, ex = home + foeX(e), frame = foeFrame(e), st = foeStance(e);
      var lunge = e.attack > 0 ? -Math.round(Math.sin(Math.min(1, e.attack / 0.3) * Math.PI) * 9) : 0;
      var shudder = G.strike && G.strike.embed && Math.floor(scene.t * 40) % 2 ? 1 : 0; // run through
      var sx = Math.round(ex - spr.w / 2) + lunge + shudder + st.jolt, sy = feet - spr.h - foeLift(e);
      var body = e.flash > 0 ? spr.flash[frame] : lit(e.kind, 'frames', frame);
      shadow(g, ex + lunge, feet, Math.round(spr.w * (spr.floats ? 0.5 : 0.75)));
      if (spr.floats && !calm) {
        // a wraith leaves a little of itself behind as it drifts
        g.globalAlpha = 0.2; g.drawImage(body, sx + 3, sy + 1);
        g.globalAlpha = 0.09; g.drawImage(body, sx + 6, sy + 2);
        g.globalAlpha = 1;
      }
      if (spr.cape) foeCape.draw(g);
      rim(g, spr.flash[frame], sx, sy, st);
      drawStance(g, body, sx, sy, st);
      if (spr.weapon) {
        // weapons are held upright, drawn back as the foe closes for the kill, and swung down when it strikes
        var swing = e.attack > 0 ? Math.sin(Math.min(1, e.attack / 0.3) * Math.PI) * 70 : 0;
        var poised = e.attack === 0 && e.pace <= 1 && G.phase === 'fight';
        var rest = (spr.weapon === 'dagger' ? 118 : 96) - (poised ? 14 : 0);
        var sway = poised ? Math.sin(scene.t * 16) * 1.5 : Math.sin(scene.t * 2) * 2;
        Sp.drawWeapon(g, sx + spr.hand[0] + st.lean, sy + spr.hand[1] + spr.bob[frame] + st.sink, rest + swing + sway, spr.weapon);
      }
      if ((G.phase === 'fight' || G.phase === 'felled' || G.phase === 'falling') && !finishing()) {
        drawHealth(g, e, barBox(e, ex + lunge + st.jolt, sy));
      }
    }

    // knight
    var ws = SPR.warrior, s = G.strike, wf = pose.frame, wx = pose.x, wy = pose.y, sw = swordAt(pose);
    shadow(g, wx + 9, feet, h.dy < -6 ? 12 : 16);
    for (i = 0; i < G.trail.length; i++) {
      // a few pale after-images mark the dash, each fading in three plain steps
      var past = G.trail[i];
      g.globalAlpha = past.life > GHOST.life * 2 / 3 ? 0.42 : past.life > GHOST.life / 3 ? 0.26 : 0.12;
      g.drawImage(ws.flash[past.frame], home + Math.round(past.dx) - 9, feet - ws.h + Math.round(past.dy));
    }
    g.globalAlpha = 1;
    heroCape.draw(g);
    rim(g, ws.flash[wf], wx, wy);
    var struck = h.hurt > 0 && Math.floor(h.hurt * 16) % 2 === 0;
    var eyes = pose.still && scene.t % BLINK.every < BLINK.lasts ? 'shut' : 'frames';
    g.drawImage(struck ? ws.flash[wf] : lit('warrior', eyes, wf), wx, wy);
    // sword arm, from the shoulder
    var hx = sw.hx, hy = sw.hy;
    g.fillStyle = '#5d6779'; g.fillRect(Math.min(sw.sx, hx), Math.min(sw.sy, hy), Math.abs(hx - sw.sx) + 2, Math.abs(hy - sw.sy) + 2);
    g.fillStyle = '#9aa3b3'; g.fillRect(hx, hy, 2, 2);
    if (s && s.embed && e) {
      // the blade is buried in the foe's head: only what stands above the skull shows
      g.save(); g.beginPath(); g.rect(0, 0, scene.W, skullY(e) + 1); g.clip();
      Sp.drawWeapon(g, hx + 1, hy, sw.deg, 'sword');
      g.restore();
    } else {
      Sp.drawWeapon(g, hx + 1, hy, sw.deg, 'sword');
    }
    // the sweep of the blade: white for a plain cut, gold for two damage, fire for three
    for (i = 0; i < G.arcs.length; i++) {
      var arc = G.arcs[i], k, r, fresh = arc.life > 0.07;
      var r1 = arc.big ? 27 : arc.tier === 2 ? 22 : 20;
      g.fillStyle = arc.tier === 3 ? (fresh ? '#fff1c9' : '#f08a2c') : arc.tier === 2 ? (fresh ? '#ffffff' : '#f5c044')
        : arc.level === 3 ? (fresh ? '#ffffff' : '#9fd8ff') : (fresh ? '#ffffff' : '#bfe6ff');
      // a solid crescent out by the point of the blade: two steps for each pixel of its outer edge leave no gaps
      var steps = Math.max(1, Math.ceil(Math.abs(arc.a1 - arc.a0) * Math.PI / 180 * r1 * 2));
      for (k = 0; k <= steps; k++) {
        var ang = (arc.a0 + (arc.a1 - arc.a0) * k / steps) * Math.PI / 180;
        for (r = r1 - 6; r <= r1; r++) g.fillRect(Math.round(hx + Math.cos(ang) * r), Math.round(hy - Math.sin(ang) * r), 1, 1);
      }
    }

    drawFx(g);
    for (i = 0; i < G.bits.length; i++) {
      var b = G.bits[i];
      g.fillStyle = b.col; g.fillRect(Math.round(b.x), Math.round(b.y), b.size, b.size);
    }
    scene.drawFront();

    var shake = G.shake > 0 ? Math.round((Math.random() - 0.5) * 2 * Math.min(1, G.shake * 4)) * Math.max(1, Math.round(scene.scale)) : 0;
    el.cv.style.transform = shake ? 'translate(' + shake + 'px,' + (-shake) + 'px)' : '';
  }

  var last = 0;
  function loop(now) {
    var dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
    last = now;
    update(dt);
    render();
    window.requestAnimationFrame(loop);
  }

  // ---------- controls ----------
  el.answerForm.addEventListener('submit', function (ev) { ev.preventDefault(); submit(el.answer.value); focusAnswer(); });
  el.skipBtn.addEventListener('click', function () { skip(); focusAnswer(); });
  // Pressing a button beside the answer box must not take the keyboard away on a phone.
  [el.skipBtn, el.strikeBtn].forEach(function (b) {
    b.addEventListener('mousedown', function (ev) { ev.preventDefault(); });
  });
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
    store.sound = WW.Sound.enabled = !store.sound; store.soundSet = true; save(); drawMenu();
    if (store.sound) { WW.Sound.wake(); sfx.hit(1, 0); } else WW.Sound.hush();
  });
  // browsers allow sound only after a tap or a key press: the score starts on the first one, and rests while the page is hidden
  ['pointerdown', 'touchend', 'click', 'keydown'].forEach(function (name) { window.addEventListener(name, function () { WW.Sound.wake(); }, { passive: true }); });
  document.addEventListener('visibilitychange', function () { if (document.hidden) WW.Sound.hush(); else WW.Sound.wake(); });
  el.howBtn.addEventListener('click', function () { openDialog(el.howto); });
  el.howClose.addEventListener('click', function () { closeDialog(el.howto); });
  el.almanacBtn.addEventListener('click', function () { openBook('Almanac', almanacHtml()); });
  el.answersBtn.addEventListener('click', function () {
    var d = store.daily;
    openBook('Today\'s answers', '<ol class="recap">' + recapHtml(d.results, d.recap) + '</ol>');
  });
  el.bookClose.addEventListener('click', function () { closeDialog(el.book); });

  function onPointer(ev) {
    var nx = (ev.clientX / Math.max(1, window.innerWidth) - 0.5) * 2;
    var ny = (ev.clientY / Math.max(1, window.innerHeight) - 0.5) * 2;
    scene.pointer(nx, ny);
  }
  window.addEventListener('pointermove', onPointer, { passive: true });
  window.addEventListener('pointerdown', onPointer, { passive: true });
  // On a phone there is no mouse to follow, so the view leans with the phone instead
  // (where the browser reports tilt without asking; otherwise it drifts by itself).
  var tilt0 = null;
  window.addEventListener('deviceorientation', function (ev) {
    if (calm || ev.gamma == null || ev.beta == null) return;
    if (!tilt0) tilt0 = { g: ev.gamma, b: ev.beta };
    tilt0.g += (ev.gamma - tilt0.g) * 0.01; tilt0.b += (ev.beta - tilt0.b) * 0.01; // the resting pose drifts with the hand
    scene.pointer((ev.gamma - tilt0.g) / 18, (ev.beta - tilt0.b) / 18);
  }, { passive: true });
  window.addEventListener('resize', layout);
  window.addEventListener('orientationchange', function () { window.setTimeout(layout, 250); });
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', layout);
    window.visualViewport.addEventListener('scroll', layout);
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(layout);

  function start() {
    layout();
    scene.setStage(2, true);
    toMenu();
    last = window.performance.now();
    window.requestAnimationFrame(loop);
  }

  WW.game = { G: G, CONFIG: CONFIG, BANK: BANK, scene: scene, store: store, submit: submit, skip: skip, startRun: startRun, toMenu: toMenu };

  var hot = window.claude && window.claude.hot;
  if (hot && hot.snapshot) hot.snapshot(function () { return { v: 3 }; });
  if (hot && hot.ready) hot.ready(start); else start();
})();
