/* Predate daily puzzle and the rules that go with it.
 *
 * There is no server. Everyone gets the same wall because the day's questions
 * are picked from the bank by a deterministic shuffle keyed on the UTC date.
 * The puzzle changes at 00:00 UTC.
 *
 * Questions drawn from the same roll of names (a "family") never share a day,
 * and no question returns for at least a week. A bigger bank means longer gaps,
 * automatically.
 */
(function (root) {
  'use strict';
  var WW = root.WW = root.WW || {};

  var EPOCH_UTC = Date.UTC(2026, 10, 18); // Wall No. 1 = 18 November 2026 (UTC)
  var DAY_MS = 86400000;

  var LIVES = 5;      // torches a run starts with
  var START = 8;      // paces away a foe begins
  var MAX_PACE = 10;  // the furthest a foe can be driven back
  // The oldest answer to a question fells any foe outright, and so does any answer dated
  // within this share of the roll's whole span of time after it (2% of 500 years of Roman
  // emperors is 10 years; of the three years of Moon landings, about three weeks).
  var KILL_RANGE = 0.02;
  // ...and only the three oldest dates on a roll can do it, however closely the rest crowd in behind.
  var KILL_MOST = 3;

  // The five foes of a daily wall: the tier of question each asks, how much
  // damage it takes to fell, and the seconds between its steps.
  var DAILY_ENEMIES = [
    { kind: 'cultist',  stage: 0, tier: 1, hp: 4, interval: 3.3 },
    { kind: 'wolf',     stage: 1, tier: 1, hp: 5, interval: 3.2 },
    { kind: 'skeleton', stage: 2, tier: 1, hp: 6, interval: 3.1 },
    { kind: 'wraith',   stage: 3, tier: 2, hp: 6, interval: 3.1 },
    { kind: 'dread',    stage: 4, tier: 2, hp: 8, interval: 3.0 }
  ];

  function dayNumber(now) {
    var t = now == null ? Date.now() : +now;
    return Math.floor((t - EPOCH_UTC) / DAY_MS) + 1;
  }

  function msToNextWall(now) {
    var t = now == null ? Date.now() : +now;
    return DAY_MS - (((t - EPOCH_UTC) % DAY_MS) + DAY_MS) % DAY_MS;
  }

  function mulberry32(seed) {
    var a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      var t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function byId(a, b) { return a.id < b.id ? -1 : a.id > b.id ? 1 : 0; }

  // ----- the calendar of walls -----
  // Walls are laid out a "season" of 30 days at a time, each season picking up where
  // the last left off. Within a season the questions of a tier are used evenly, a
  // question is never brought back before MIN_GAP days have passed, two questions
  // from one roll never share a day, and a roll used yesterday is avoided today.
  var SEASON = 30;
  var MIN_GAP = { 1: 12, 2: 20, 3: 10 };
  var calendar = { bank: null, days: [], lastUse: {}, lastFam: {} };

  function buildSeason(cal, bank, s) {
    var rng = mulberry32(WW.hashStr('wallward3|season|' + s));
    var pools = {}, count = {};
    bank.slice().sort(byId).forEach(function (p) { (pools[p.tier] = pools[p.tier] || []).push(p); });
    for (var d = 0; d < SEASON; d++) {
      var day = s * SEASON + d, today = [], famToday = {}, taken = {};
      DAILY_ENEMIES.forEach(function (e) {
        var best = null, bestKey = null;
        (pools[e.tier] || []).forEach(function (p) {
          if (taken[p.id] || famToday[p.family]) return;
          var gap = cal.lastUse[p.id] == null ? 999 : day - cal.lastUse[p.id];
          var famGap = cal.lastFam[p.family] == null ? 999 : day - cal.lastFam[p.family];
          var key = [gap >= MIN_GAP[e.tier] ? 0 : 1, famGap >= 2 ? 0 : 1, count[p.id] || 0, famGap >= 3 ? 0 : 1, rng()];
          for (var i = 0; i < key.length; i++) {
            if (!bestKey || key[i] < bestKey[i]) { best = p; bestKey = key; break; }
            if (key[i] > bestKey[i]) break;
          }
        });
        if (!best) best = (pools[e.tier] || bank)[0];
        taken[best.id] = true; famToday[best.family] = true;
        count[best.id] = (count[best.id] || 0) + 1;
        today.push(best);
      });
      today.forEach(function (p) { cal.lastUse[p.id] = day; cal.lastFam[p.family] = day; });
      cal.days[day] = today;
    }
  }

  /**
   * Build the wall for a given day number.
   * Returns { enemies: [{ kind, stage, interval, tier, hp, prompt }] }.
   * Every player meets the same question at each foe.
   */
  function dailyPlan(num, bank) {
    var day = Math.max(0, num - 1);
    if (calendar.bank !== bank) calendar = { bank: bank, days: [], lastUse: {}, lastFam: {} };
    while (calendar.days.length <= day) buildSeason(calendar, bank, Math.floor(calendar.days.length / SEASON));
    var picks = calendar.days[day];
    return { enemies: DAILY_ENEMIES.map(function (e, i) {
      var prompt = picks[i];
      return { kind: e.kind, stage: e.stage, interval: e.interval, tier: e.tier,
        hp: Math.min(e.hp, prompt.hpCap), prompt: prompt };
    }) };
  }

  /** Endless march: foe n (1-based) has more health, steps faster and asks harder questions. */
  var KINDS = ['cultist', 'wolf', 'skeleton', 'wraith'];
  function endlessEnemy(n) {
    var boss = n % 5 === 0;
    var tier = n <= 3 ? 1 : n <= 8 ? (n % 2 ? 1 : 2) : n <= 14 ? 2 : (n % 3 === 0 ? 3 : 2);
    return {
      kind: boss ? 'dread' : KINDS[(n - 1 - Math.floor((n - 1) / 5)) % KINDS.length],
      stage: Math.floor((n - 1) / 2) % 5,
      tier: tier,
      hp: Math.min(12, 4 + Math.floor((n - 1) / 2) + (boss ? 2 : 0)),
      interval: Math.max(1.9, 3.3 - 0.07 * (n - 1))
    };
  }

  /** A random question of a tier whose family has not come up lately in this run. */
  function drawPrompt(bank, tier, recent) {
    var pool = bank.filter(function (p) { return p.tier === tier && recent.indexOf(p.family) === -1; });
    if (!pool.length) pool = bank.filter(function (p) { return p.tier === tier; });
    if (!pool.length) pool = bank.slice();
    var p = pool[Math.floor(Math.random() * pool.length)];
    recent.push(p.family);
    if (recent.length > 14) recent.shift();
    return p;
  }

  /** True if this answer fells a foe outright: the oldest on the roll, or within KILL_RANGE of it. */
  function kills(prompt, ans) {
    if (ans.year - prompt.oldest.year > prompt.span * KILL_RANGE) return false;
    var older = {};
    prompt.answers.forEach(function (a) { if (a.year < ans.year) older[a.year] = true; });
    return Object.keys(older).length < KILL_MOST;
  }

  // ----- glory -----
  var HIT_GLORY = [0, 100, 250, 450]; // for a blow of 1, 2 or 3 damage
  /** Glory for one blow. Each answer in an unbroken run adds a tenth, up to double. */
  function hitGlory(dmg, combo) {
    return Math.round(HIT_GLORY[dmg] * (1 + 0.1 * Math.min(10, Math.max(0, combo - 1))));
  }
  /** Glory for felling a foe: more the further off it still was, and for a clean fight. */
  function fellGlory(pacesLeft, flawless) {
    return 300 + 40 * Math.max(0, Math.min(MAX_PACE, Math.round(pacesLeft))) + (flawless ? 200 : 0);
  }

  var OLDEST_GLORY = 800; // on top of the rest, for felling a foe with the oldest answer

  var RANKS = [
    [10000, 'Warden of the Wall'], [8000, 'Commander'], [6000, 'Captain'],
    [4000, 'Man-at-arms'], [2000, 'Sentry'], [0, 'Recruit']
  ];
  function rankFor(glory) {
    for (var i = 0; i < RANKS.length; i++) if (glory >= RANKS[i][0]) return RANKS[i][1];
    return 'Recruit';
  }

  function fmt(n) { return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }

  /** results: 'K' felled outright by the oldest answer, 'F' felled cleanly, 'W' felled, 'S' skipped, 'X' the wall fell here. */
  var MARKS = { K: '💀', F: '⚔️', W: '🗡️', S: '💨', X: '💥' };
  function felledCount(results) {
    return results.filter(function (r) { return r === 'K' || r === 'F' || r === 'W'; }).length;
  }
  function markRow(results, total) {
    var row = '';
    for (var i = 0; i < total; i++) row += MARKS[results[i]] || '⬛';
    return row;
  }

  function shareText(num, results, glory, total, url, bestCombo) {
    var felled = felledCount(results);
    var lines = ['Predate No. ' + num + ' · ' + fmt(glory) + ' glory',
      markRow(results, total) + '  ' + felled + '/' + total + (bestCombo > 1 ? ' · combo ×' + bestCombo : '')];
    if (url) lines.push(url);
    return lines.join('\n');
  }

  WW.Daily = {
    LIVES: LIVES, START: START, MAX_PACE: MAX_PACE, KILL_RANGE: KILL_RANGE, KILL_MOST: KILL_MOST, DAILY_ENEMIES: DAILY_ENEMIES,
    dayNumber: dayNumber, msToNextWall: msToNextWall, dailyPlan: dailyPlan,
    endlessEnemy: endlessEnemy, drawPrompt: drawPrompt, kills: kills,
    hitGlory: hitGlory, fellGlory: fellGlory, OLDEST_GLORY: OLDEST_GLORY, rankFor: rankFor, fmt: fmt,
    markRow: markRow, felledCount: felledCount, shareText: shareText
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);
