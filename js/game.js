/* Wallward: game flow, drawing of the characters, and the page controls. */
(function () {
  'use strict';
  var WW = window.WW, D = WW.Daily, A = WW.Answers, Scene = WW.Scene, Sp = WW.Sprites;

  // ---------- rules you may want to tune ----------
  var CONFIG = {
    CHAIN: 3,                    // correct answers in a row needed to fell an enemy
    CHAIN_BREAKS_ON_MISS: true,  // false = a miss costs ground but keeps the chain
    KNOCKBACK: 2,                // paces a hit drives the enemy back
    LUNGE: 1,                    // paces the enemy gains on a wrong answer
    LANTERNS: 3,                 // breaches the wall can take
    SHARE_URL: ''                // public address of the game, added to copied results
  };
  var PACES = D.PACES;
  var GAP = 16;                  // pixels between warrior and an enemy at pace 0
  var NAMES = { raider: 'Raider', wolf: 'Wolf', clay: 'Clay soldier', wraith: 'Frost wraith', warlord: 'Warlord' };
  var STORE_KEY = 'wallward.v1';

  var $ = function (id) { return document.getElementById(id); };
  var el = {};
  ['app', 'scene', 'cv', 'hud', 'lanterns', 'progress', 'li', 'quitBtn', 'banner', 'titleBlock',
    'menu', 'playDaily', 'dailyNo', 'dailyDone', 'doneMarks', 'doneLine', 'doneCopy', 'doneNext',
    'playEndless', 'endlessBest', 'howBtn', 'soundBtn', 'stats',
    'fight', 'pips', 'chainText', 'cat', 'foe', 'qText', 'answerForm', 'answer', 'shootBtn', 'feedback', 'skipBtn',
    'end', 'endKicker', 'endTitle', 'endLi', 'endRank', 'endMarks', 'copyBtn', 'againBtn', 'homeBtn', 'nextIn',
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
    shoot: function () { tone(880, 0.09, 'square', 0.04, 1500); },
    hit: function () { tone(240, 0.12, 'square', 0.06, 110); },
    miss: function () { tone(160, 0.22, 'sawtooth', 0.05, 70); },
    step: function () { tone(90, 0.05, 'triangle', 0.05, 60); },
    fell: function () { tone(523, 0.1, 'square', 0.05); tone(659, 0.1, 'square', 0.05, 0, 0.09); tone(784, 0.18, 'square', 0.05, 0, 0.18); },
    breach: function () { tone(120, 0.4, 'sawtooth', 0.07, 40); },
    win: function () { [523, 659, 784, 1047].forEach(function (f, i) { tone(f, 0.16, 'square', 0.05, 0, i * 0.12); }); }
  };

  // ---------- state ----------
  var G = {
    mode: null, phase: 'title', phaseT: 0, num: 0, plan: null, idx: 0, total: 0,
    hearts: CONFIG.LANTERNS, li: 0, results: [], chain: 0, flawless: true,
    enemy: null, def: null, q: null, qPos: 0, seen: {},
    camFrom: 0, camTo: 0, walkDur: 2.4, spawned: false,
    arrows: [], bits: [], shake: 0,
    warrior: { walkT: 0, hurt: 0, shot: 0 },
    titleT: 0
  };

  // ---------- layout ----------
  function layout() {
    var vv = window.visualViewport;
    var fullH = window.innerHeight;
    var appH = fullH;
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
    var wide = appW >= 720;
    var sceneH = Math.round(appH * (wide ? 0.52 : 0.36));
    sceneH = Math.max(Math.min(sceneH, appH - 268), 150);
    el.scene.style.height = sceneH + 'px';
    scene.resize(appW, sceneH);
    el.app.classList.toggle('short', appH < 520);
  }

  function paceLen() {
    return (scene.W - scene.warriorX() - GAP - 30) / PACES;
  }

  // ---------- page helpers ----------
  function show(view) {
    ['menu', 'fight', 'end'].forEach(function (v) { el[v].hidden = v !== view; });
    var inRun = view === 'fight';
    el.hud.hidden = !inRun;
    el.titleBlock.hidden = view !== 'menu';
  }

  var lanternOn = Sp.iconURL('lantern', 3), lanternOff = Sp.iconURL('lanternOut', 3);
  var arrowOn = Sp.iconURL('arrow', 3), arrowOff = Sp.iconURL('arrowOff', 3);

  function drawHud() {
    var i, html = '';
    for (i = 0; i < CONFIG.LANTERNS; i++) html += '<img alt="" width="27" height="33" src="' + (i < G.hearts ? lanternOn : lanternOff) + '">';
    el.lanterns.innerHTML = html;
    el.lanterns.setAttribute('aria-label', G.hearts + ' of ' + CONFIG.LANTERNS + ' lanterns lit');
    el.progress.textContent = G.mode === 'daily'
      ? 'Enemy ' + Math.min(G.idx + 1, G.total) + ' of ' + G.total
      : 'Enemy ' + (G.idx + 1);
    el.li.textContent = D.fmt(G.li);
  }

  function drawPips() {
    var i, html = '';
    for (i = 0; i < CONFIG.CHAIN; i++) html += '<img alt="" width="36" height="15" src="' + (i < G.chain ? arrowOn : arrowOff) + '">';
    el.pips.innerHTML = html;
    var left = CONFIG.CHAIN - G.chain;
    el.chainText.textContent = G.chain === 0 ? CONFIG.CHAIN + ' in a row to fell it'
      : left === 1 ? 'One more' : left + ' more in a row';
  }

  function drawFoe() {
    var e = G.enemy;
    if (!e) { el.foe.textContent = ''; return; }
    el.foe.textContent = NAMES[e.kind] + ', ' + e.pace + (e.pace === 1 ? ' pace' : ' paces');
    el.foe.classList.toggle('close', e.pace <= 3);
  }

  var fbTimer = 0;
  function feedback(kind, text) {
    el.feedback.className = 'feedback ' + kind;
    el.feedback.textContent = text;
    window.clearTimeout(fbTimer);
    fbTimer = window.setTimeout(function () { el.feedback.textContent = ''; }, 3200);
  }

  var bannerTimer = 0;
  function banner(text) {
    el.banner.textContent = text;
    el.banner.hidden = false;
    el.banner.classList.remove('go'); void el.banner.offsetWidth; el.banner.classList.add('go');
    window.clearTimeout(bannerTimer);
    bannerTimer = window.setTimeout(function () { el.banner.hidden = true; }, 2600);
  }

  function setQuestion(q) {
    G.q = q;
    if (!q) {
      el.qText.textContent = G.phase === 'walk' ? 'Something is coming along the wall…' : '';
      el.cat.textContent = '';
      el.answer.placeholder = '';
      return;
    }
    el.qText.textContent = q.q;
    el.cat.textContent = q.cat === 'H' ? 'History' : 'Geography';
    el.answer.placeholder = /^In what year/.test(q.q) ? 'The year' : 'Your answer';
  }

  // ---------- a run ----------
  function startRun(mode, resume) {
    audio();
    G.mode = mode; G.results = []; G.li = 0; G.hearts = CONFIG.LANTERNS; G.idx = 0;
    G.seen = {}; G.arrows = []; G.bits = []; G.enemy = null; G.chain = 0;
    if (mode === 'daily') {
      G.num = D.dayNumber();
      G.plan = D.dailyPlan(G.num, BANK);
      G.total = G.plan.length;
      var d = store.daily;
      if (resume && d && d.num === G.num && !d.done) {
        G.idx = d.idx; G.results = d.results.slice(); G.hearts = d.hearts; G.li = d.li;
      } else {
        store.daily = { num: G.num, idx: 0, results: [], hearts: G.hearts, li: 0, done: false, total: G.total };
        save();
      }
    } else {
      G.plan = null; G.total = 0;
    }
    show('fight');
    el.answer.value = '';
    el.feedback.textContent = '';
    drawHud(); drawPips();
    approach();
    focusAnswer();
  }

  function focusAnswer() {
    try { el.answer.focus({ preventScroll: true }); } catch (e) { el.answer.focus(); }
  }

  function enemyDef() {
    if (G.mode === 'daily') return G.plan[G.idx];
    return D.endlessEnemy(G.idx + 1);
  }

  /** Walk on to the next enemy. */
  function approach() {
    G.def = enemyDef();
    G.phase = 'walk'; G.phaseT = 0; G.spawned = false; G.enemy = null;
    G.chain = 0; G.flawless = true; G.qPos = 0;
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
    setQuestion(null);
    drawHud(); drawPips(); drawFoe();
  }

  function spawn() {
    G.spawned = true;
    G.enemy = { kind: G.def.kind, spr: SPR[G.def.kind], pace: PACES, shown: PACES + 11, interval: G.def.interval,
      stepT: 0, hop: 0, foot: 0, flash: 0, lunge: 0, gone: false };
  }

  function nextQuestion() {
    var q;
    if (G.mode === 'daily') {
      var list = G.def.questions;
      q = list[G.qPos % list.length];
    } else {
      var tiers = G.def.tiers;
      q = D.drawQuestion(BANK, tiers[G.qPos % tiers.length], G.seen, G.qPos % 2 ? 'G' : 'H');
    }
    G.qPos++;
    setQuestion(q);
  }

  function engage() {
    G.phase = 'fight'; G.phaseT = 0;
    G.enemy.shown = G.enemy.pace = PACES;
    G.enemy.stepT = 0;
    nextQuestion();
    drawFoe(); drawPips();
  }

  function stepEnemy(n, lunge) {
    var e = G.enemy;
    e.pace = Math.max(0, e.pace - n);
    e.hop = 1; e.foot ^= 1;
    if (lunge) e.lunge = 1;
    sfx.step();
    drawFoe();
    if (e.pace <= 0) breach();
  }

  function shoot(onHit) {
    var p = scene.plane(), feet = scene.groundY + 3 + p.y;
    G.warrior.shot = 0.3;
    G.arrows.push({ x: scene.warriorX() + p.x + 12, y: feet - 12, onHit: onHit });
    sfx.shoot();
  }

  function submit(text) {
    if (G.phase !== 'fight' || !G.q) return;
    var t = String(text).trim();
    if (!t) return;
    el.answer.value = '';
    if (t === '?') { skip(); return; }
    var res = A.check(t, G.q);
    if (res.ok) hit(res); else miss(res, false);
  }

  function hit(res) {
    var e = G.enemy;
    G.chain++;
    drawPips();
    if (G.chain >= CONFIG.CHAIN) {
      var gain = D.liFor(e.pace, G.flawless);
      G.li += gain;
      G.results.push(G.flawless ? 'F' : 'W');
      G.phase = 'felled'; G.phaseT = 0;
      feedback('ok', (G.flawless ? 'Flawless. ' : 'Felled. ') + '+' + D.fmt(gain) + ' li');
      setQuestion(null);
      el.qText.textContent = NAMES[e.kind] + ' felled.';
      shoot(function () { burst(e); e.gone = true; sfx.fell(); });
      drawHud();
      return;
    }
    feedback('ok', res.exact ? 'Hit. It staggers back.' : 'Hit. Close enough to ' + res.shown + '.');
    e.pace = Math.min(PACES, e.pace + CONFIG.KNOCKBACK);
    e.stepT = 0;
    shoot(function () { e.flash = 0.14; sfx.hit(); });
    drawFoe();
    nextQuestion();
  }

  function miss(res, skipped) {
    if (CONFIG.CHAIN_BREAKS_ON_MISS) G.chain = 0;
    G.flawless = false;
    drawPips();
    feedback('miss', (skipped ? 'Skipped. Answer: ' : 'No. Answer: ') + res.shown);
    if (!skipped) {
      sfx.miss();
      if (!calm) G.shake = 0.25;
      stepEnemy(CONFIG.LUNGE, true);
    }
    if (G.phase === 'fight') nextQuestion();
  }

  function skip() {
    if (G.phase !== 'fight' || !G.q) return;
    miss({ shown: G.q.a[0] }, true);
  }

  function breach() {
    var e = G.enemy;
    G.phase = 'breach'; G.phaseT = 0;
    G.hearts--;
    G.results.push('X');
    G.warrior.hurt = 0.7;
    if (!calm) G.shake = 0.5;
    sfx.breach();
    var was = G.q;
    setQuestion(null);
    el.qText.textContent = 'The ' + NAMES[e.kind].toLowerCase() + ' broke through. A lantern goes out.';
    if (was) feedback('miss', 'Answer: ' + was.a[0]);
    drawHud();
  }

  function burst(e) {
    var p = scene.plane(), feet = scene.groundY + 3 + p.y;
    var ex = scene.warriorX() + p.x + GAP + e.shown * paceLen();
    var n = calm ? 10 : 34, i, cols = e.spr.bits;
    for (i = 0; i < n; i++) {
      G.bits.push({ x: ex + (Math.random() - 0.5) * e.spr.w * 0.8, y: feet - Math.random() * e.spr.h,
        vx: (Math.random() - 0.3) * 70, vy: -30 - Math.random() * 80, life: 0.5 + Math.random() * 0.5,
        col: cols[i % cols.length], size: Math.random() < 0.3 ? 2 : 1 });
    }
  }

  function afterEnemy() {
    G.idx++;
    if (G.mode === 'daily') {
      store.daily.idx = G.idx; store.daily.results = G.results.slice();
      store.daily.hearts = G.hearts; store.daily.li = G.li;
      save();
    }
    if (G.hearts <= 0) { finish(false); return; }
    if (G.mode === 'daily' && G.idx >= G.total) { finish(true); return; }
    approach();
  }

  function finish(held) {
    G.phase = 'over'; G.enemy = null; setQuestion(null);
    var felled = G.results.filter(function (r) { return r !== 'X'; }).length;
    var s = store.stats;
    if (G.mode === 'daily') {
      if (!store.daily.done) {
        store.daily.done = true; store.daily.held = held;
        s.played++;
        s.streak = s.lastNum === G.num - 1 ? s.streak + 1 : 1;
        s.maxStreak = Math.max(s.maxStreak, s.streak);
        s.lastNum = G.num;
        s.best = Math.max(s.best, G.li);
      }
      el.endKicker.textContent = 'Wall No. ' + G.num;
      el.endTitle.textContent = held ? (felled === G.total ? 'The wall held, untouched' : 'The wall held') : 'The wall fell';
      el.endRank.textContent = D.rankFor(G.li) + '. ' + felled + ' of ' + G.total + ' felled.';
      el.endMarks.textContent = marks(G.results, G.total);
      el.endMarks.hidden = false;
      el.copyBtn.hidden = false;
      el.againBtn.textContent = 'Endless march';
      el.nextIn.hidden = false;
    } else {
      var best = G.li > s.bestEndless;
      s.bestEndless = Math.max(s.bestEndless, G.li);
      el.endKicker.textContent = 'Endless march';
      el.endTitle.textContent = 'The wall fell';
      el.endRank.textContent = felled + (felled === 1 ? ' enemy' : ' enemies') + ' felled.' + (best && G.li > 0 ? ' A new best.' : ' Best ' + D.fmt(s.bestEndless) + ' li.');
      el.endMarks.hidden = true;
      el.copyBtn.hidden = true;
      el.againBtn.textContent = 'March again';
      el.nextIn.hidden = true;
    }
    save();
    el.endLi.textContent = D.fmt(G.li);
    el.copyBox.hidden = true;
    if (held) sfx.win();
    show('end');
    tick();
    try { el.end.querySelector('button:not([hidden])').focus({ preventScroll: true }); } catch (e) { /* ignore */ }
  }

  function marks(results, total) {
    var m = { F: '🎯', W: '🏹', X: '💥' }, out = '', i;
    for (i = 0; i < total; i++) out += m[results[i]] || '⬛';
    return out;
  }

  function shareUrl() {
    if (CONFIG.SHARE_URL) return CONFIG.SHARE_URL;
    return /\.github\.io$/.test(window.location.hostname) ? window.location.origin + window.location.pathname : '';
  }

  function copyResult(btn) {
    var d = store.daily;
    if (!d) return;
    var text = D.shareText(d.num, d.results, d.li, d.total || 5, shareUrl());
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
    G.mode = null; G.phase = 'title'; G.enemy = null; G.arrows = []; G.bits = [];
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
      el.doneMarks.textContent = marks(today.results, today.total || 5);
      el.doneLine.textContent = 'Wall No. ' + num + ': ' + D.fmt(today.li) + ' li, ' + D.rankFor(today.li).toLowerCase() + '.';
    } else {
      el.playDaily.hidden = false;
      el.dailyDone.hidden = true;
      el.playDaily.firstChild.textContent = today && today.idx > 0 ? 'Carry on today\'s wall ' : 'Play today\'s wall ';
    }
    el.endlessBest.textContent = s.bestEndless ? 'Best ' + D.fmt(s.bestEndless) + ' li' : 'No limit';
    el.soundBtn.textContent = 'Sound: ' + (store.sound ? 'on' : 'off');
    el.soundBtn.setAttribute('aria-pressed', store.sound ? 'true' : 'false');
    el.stats.textContent = s.played
      ? 'Walls played ' + s.played + '. Streak ' + s.streak + (s.streak === 1 ? ' day' : ' days') + '. Best ' + D.fmt(s.best) + ' li.'
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

  function update(dt) {
    var e = G.enemy, w = G.warrior, i;
    G.phaseT += dt;
    w.hurt = Math.max(0, w.hurt - dt);
    w.shot = Math.max(0, w.shot - dt);
    G.shake = Math.max(0, G.shake - dt);

    if (G.phase === 'title') {
      G.titleT += dt;
      scene.camX += dt * 22;
      w.walkT += dt;
      if (!calm && G.titleT > 9) { G.titleT = 0; scene.setStage(scene.shownStage() + 1); }
    } else if (G.phase === 'walk') {
      var u = Math.min(1, G.phaseT / G.walkDur);
      scene.camX = G.camFrom + (G.camTo - G.camFrom) * ease(u);
      w.walkT += dt;
      var lead = 1.0;
      if (!G.spawned && G.phaseT >= G.walkDur - lead) spawn();
      if (G.spawned) {
        var v = Math.min(1, (G.phaseT - (G.walkDur - lead)) / lead);
        G.enemy.shown = PACES + 11 * (1 - ease(v));
        G.enemy.foot = Math.floor(G.phaseT * 7) % 2;
        G.enemy.hop = 1 - ((G.phaseT * 3.5) % 1);
      }
      if (u >= 1) engage();
    } else if (G.phase === 'fight') {
      e.stepT += dt;
      if (e.stepT >= e.interval) { e.stepT -= e.interval; stepEnemy(1, false); }
    } else if (G.phase === 'felled') {
      if (e && e.gone && G.phaseT > 1.0) afterEnemy();
      else if (G.phaseT > 2.5) afterEnemy();
    } else if (G.phase === 'breach') {
      if (!e.gone && G.phaseT > 0.9) { burst(e); e.gone = true; }
      if (G.phaseT > 1.6) afterEnemy();
    }

    e = G.enemy;
    if (e && G.phase !== 'walk') {
      e.shown += (e.pace - e.shown) * (1 - Math.exp(-dt * 13));
      e.hop = Math.max(0, e.hop - dt / 0.28);
    }
    if (e) { e.flash = Math.max(0, e.flash - dt); e.lunge = Math.max(0, e.lunge - dt / 0.3); }

    // arrows fly level until they reach the enemy
    var p = scene.plane();
    for (i = G.arrows.length - 1; i >= 0; i--) {
      var a = G.arrows[i];
      a.x += dt * 520;
      var target = e && !e.gone ? scene.warriorX() + p.x + GAP + e.shown * paceLen() - 3 : scene.W + 20;
      if (a.x >= target) { if (a.onHit) a.onHit(); G.arrows.splice(i, 1); }
    }
    for (i = G.bits.length - 1; i >= 0; i--) {
      var b = G.bits[i];
      b.life -= dt; b.vy += 260 * dt; b.x += b.vx * dt; b.y += b.vy * dt;
      if (b.life <= 0) G.bits.splice(i, 1);
    }
    scene.update(dt);
  }

  // ---------- drawing the characters ----------
  var WOOD = '#a8703a', WOOD_D = '#6e4520', STRING = '#eef2f7';
  var ARC = [0, 1, 2, 2, 3, 3, 3, 3, 3, 2, 2, 1, 0];

  function drawBow(g, bx, by, drawn, loosed) {
    var i;
    for (i = -6; i <= 6; i++) {
      g.fillStyle = Math.abs(i) > 4 ? WOOD_D : WOOD;
      g.fillRect(bx + ARC[i + 6], by + i, 1, 1);
    }
    g.fillStyle = STRING;
    for (i = -6; i <= 6; i++) {
      var pull = drawn && !loosed ? Math.round(3 * (1 - Math.abs(i) / 6)) : 0;
      if (pull || (i & 1) === 0) g.fillRect(bx - pull, by + i, 1, 1);
    }
    if (drawn && !loosed) drawArrow(g, bx - 3, by);
  }

  function drawArrow(g, x, y) {
    g.fillStyle = '#e2483b'; g.fillRect(x, y - 1, 1, 3);
    g.fillStyle = '#d9b97c'; g.fillRect(x + 1, y, 7, 1);
    g.fillStyle = '#f4f7fb'; g.fillRect(x + 8, y - 1, 1, 3); g.fillRect(x + 9, y, 1, 1);
  }

  function render() {
    var g = scene.g, p = scene.plane(), e = G.enemy, w = G.warrior, i;
    var wx = scene.warriorX() + p.x, feet = scene.groundY + 3 + p.y, pl = paceLen();
    scene.drawBack();

    // pace marks on the walkway while an enemy is closing in
    if (e && G.phase !== 'walk' && !e.gone) {
      var st = Scene.STAGES[scene.shownStage()].stone;
      for (i = 1; i <= PACES; i++) {
        g.fillStyle = i <= 3 ? '#c9382f' : st.dark;
        g.fillRect(Math.round(wx + GAP + i * pl) - 1, feet - 1, 2, 1);
      }
    }

    // enemy
    if (e && !e.gone) {
      var spr = e.spr, ex = wx + GAP + e.shown * pl;
      var hopY = spr.floats ? 3 + Math.round(Math.sin(scene.t * 3) * 1.5) : Math.round(Math.sin(Math.PI * e.hop) * 3);
      var frame;
      if (spr.floats) frame = Math.floor(scene.t * 4) % 2;
      else if (spr.frames.length === 2) frame = e.hop > 0 ? e.foot : 0;
      else frame = e.hop > 0 ? e.foot : 2;
      var lx = G.phase === 'breach' ? -Math.round(Math.sin(Math.min(1, G.phaseT / 0.25) * Math.PI) * 7) : -Math.round(e.lunge * 3);
      var sx = Math.round(ex - spr.w / 2) + lx, sy = feet - spr.h - hopY;
      g.drawImage(e.flash > 0 ? spr.flash[frame] : spr.frames[frame], sx, sy);
      if (G.phase === 'fight') {
        // paces left, on a dark plate, with the time before its next step underneath
        var danger = e.pace <= 3, cx = Math.round(ex), bw = 11;
        var fill = Math.round(bw * (1 - e.stepT / e.interval));
        g.fillStyle = Sp.OUTLINE; g.fillRect(cx - 7, sy - 12, bw + 4, 12); g.fillRect(cx - 6, sy - 13, bw + 2, 1);
        Sp.drawNumber(g, e.pace, cx + 1, sy - 11, danger ? '#ff8a6a' : '#ffffff');
        g.fillStyle = '#4a4660'; g.fillRect(cx - 5, sy - 4, bw, 2);
        g.fillStyle = danger ? '#ff8a6a' : '#f5c044'; g.fillRect(cx - 5, sy - 4, fill, 2);
      }
    }

    // warrior
    var ws = SPR.warrior, walking = G.phase === 'title' || G.phase === 'walk';
    var wf = walking ? Math.floor(w.walkT * 7) % 2 : 2;
    var bob = walking && wf === 0 ? 1 : 0;
    var wxs = wx - 7 - (w.hurt > 0.4 ? 2 : 0), wys = feet - ws.h;
    var blink = w.hurt > 0 && Math.floor(w.hurt * 14) % 2 === 0;
    g.drawImage(blink ? ws.flash[wf] : ws.frames[wf], wxs, wys);
    var aiming = !walking && G.phase !== 'over';
    var by = feet - (aiming ? 11 : 8) + bob;
    // arm reaching to the bow
    g.fillStyle = '#c9382f'; g.fillRect(wxs + 10, by, 2, 1);
    g.fillStyle = '#f3c9a5'; g.fillRect(wxs + 12, by, 1, 1);
    drawBow(g, wxs + 13, by, aiming && G.phase === 'fight', w.shot > 0);

    for (i = 0; i < G.arrows.length; i++) drawArrow(g, Math.round(G.arrows[i].x), Math.round(G.arrows[i].y));
    for (i = 0; i < G.bits.length; i++) {
      var b = G.bits[i];
      g.fillStyle = b.col; g.fillRect(Math.round(b.x), Math.round(b.y), b.size, b.size);
    }
    if (G.phase === 'breach' && G.phaseT < 0.35) {
      // the blow lands
      g.fillStyle = '#ffffff';
      for (i = 0; i < 9; i++) g.fillRect(wx + 9 - i, feet - 20 + i * 2, 2, 1);
    }
    scene.drawFront();

    var shake = G.shake > 0 ? Math.round((Math.random() - 0.5) * 2 * Math.min(1, G.shake * 4)) * scene.scale : 0;
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
  el.skipBtn.addEventListener('click', function () { skip(); focusAnswer(); });
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
    var r = el.scene.getBoundingClientRect();
    var nx = (ev.clientX / Math.max(1, window.innerWidth) - 0.5) * 2;
    var ny = ((ev.clientY - r.top) / Math.max(1, r.height) - 0.5) * 2;
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
    scene.setStage(1, true);
    toMenu();
    last = window.performance.now();
    window.requestAnimationFrame(frame);
  }

  WW.game = { G: G, CONFIG: CONFIG, scene: scene, store: store, submit: submit, skip: skip, startRun: startRun, toMenu: toMenu };

  var hot = window.claude && window.claude.hot;
  if (hot && hot.snapshot) hot.snapshot(function () { return { v: 1 }; });
  if (hot && hot.ready) hot.ready(start); else start();
})();
