/* Wallward daily puzzle.
 *
 * There is no server. Everyone gets the same wall because the day's questions
 * are picked from the bank by a deterministic shuffle keyed on the UTC date.
 * The puzzle changes at 00:00 UTC.
 *
 * To avoid repeats, each tier/category pool is shuffled once per "cycle" and
 * consumed a fixed window per day, so no question returns until its pool has
 * been used up. A bigger bank means longer cycles, automatically.
 */
(function (root) {
  'use strict';
  var WW = root.WW = root.WW || {};

  var EPOCH_UTC = Date.UTC(2026, 10, 18); // Wall No. 1 = 18 November 2026 (UTC)
  var DAY_MS = 86400000;

  // The five enemies of a daily wall. tiers cycle per question; interval is seconds per step.
  var DAILY_ENEMIES = [
    { kind: 'raider',  stage: 0, tiers: [1],    interval: 4.0 },
    { kind: 'wolf',    stage: 1, tiers: [1],    interval: 3.7 },
    { kind: 'clay',    stage: 2, tiers: [1, 2], interval: 3.4 },
    { kind: 'wraith',  stage: 3, tiers: [2],    interval: 3.2 },
    { kind: 'warlord', stage: 4, tiers: [2, 3], interval: 3.0 }
  ];
  var PER_ENEMY = 6; // questions held ready for each enemy (three needed in a row)

  function dayNumber(now) {
    var t = now == null ? Date.now() : +now;
    return Math.floor((t - EPOCH_UTC) / DAY_MS) + 1;
  }

  function msToNextWall(now) {
    var t = now == null ? Date.now() : +now;
    return DAY_MS - (((t - EPOCH_UTC) % DAY_MS) + DAY_MS) % DAY_MS;
  }

  function dateOfDay(num) {
    return new Date(EPOCH_UTC + (num - 1) * DAY_MS);
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

  function shuffled(arr, rng) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(rng() * (i + 1));
      var x = a[i]; a[i] = a[j]; a[j] = x;
    }
    return a;
  }

  function pools(bank) {
    var p = {};
    bank.forEach(function (q) {
      var k = q.tier + q.cat;
      (p[k] = p[k] || []).push(q);
    });
    Object.keys(p).forEach(function (k) {
      p[k].sort(function (a, b) { return a.id < b.id ? -1 : a.id > b.id ? 1 : 0; });
    });
    return p;
  }

  function words(s) { return ' ' + WW.Answers.norm(s) + ' '; }

  /** True when showing both questions on one day would hand over an answer. */
  function clash(a, b) {
    function leaks(src, dst) {
      var text = words(src.q);
      return WW.Answers.formsOf(dst).some(function (f) {
        return f.full.length >= 4 && text.indexOf(' ' + f.full + ' ') !== -1;
      });
    }
    var fa = WW.Answers.formsOf(a)[0].full, fb = WW.Answers.formsOf(b)[0].full;
    return fa === fb || leaks(a, b) || leaks(b, a);
  }

  /**
   * Shuffled order of a pool for one cycle. Questions used in the second half of
   * the previous cycle are pushed to the second half of this one, so a question
   * never comes back within a few days of a cycle boundary.
   */
  var orderCache = {};
  function cycleOrder(pool, key, cycle) {
    var tag = key + '|' + pool.length, c = orderCache[tag];
    if (!c || c.cycle > cycle) c = orderCache[tag] = { cycle: -1, order: null };
    while (c.cycle < cycle) {
      var next = shuffled(pool, mulberry32(WW.hashStr('wallward|' + key + '|' + (c.cycle + 1))));
      if (c.order) {
        var late = {};
        for (var i = Math.floor(c.order.length / 2); i < c.order.length; i++) late[c.order[i].id] = true;
        next = next.filter(function (q) { return !late[q.id]; })
          .concat(next.filter(function (q) { return late[q.id]; }));
      }
      c.order = next;
      c.cycle++;
    }
    return c.order;
  }

  /** The day's window from one pool: `win` questions, the same size every day. */
  function windowFor(pool, key, num, win) {
    var cycleLen = Math.max(1, Math.floor(pool.length / win));
    var idx = num - 1;
    var cycle = Math.floor(idx / cycleLen);
    var pos = ((idx % cycleLen) + cycleLen) % cycleLen;
    var order = cycleOrder(pool, key, cycle);
    var out = [];
    for (var i = 0; i < win; i++) out.push(order[(pos * win + i) % order.length]);
    return out;
  }

  /**
   * Build the wall for a given day number.
   * Returns [{ kind, stage, interval, questions: [q, ...] }] for the five enemies.
   */
  function dailyPlan(num, bank) {
    var p = pools(bank);
    // How many of each tier the five enemies ask for.
    var need = { 1: 0, 2: 0, 3: 0 };
    DAILY_ENEMIES.forEach(function (e) {
      for (var i = 0; i < PER_ENEMY; i++) need[e.tiers[i % e.tiers.length]]++;
    });
    var chosen = [];
    var byTier = {};
    [1, 2, 3].forEach(function (tier) {
      var h = Math.ceil(need[tier] / 2), g = need[tier] - h;
      var win = h + 3; // a few spares, in case two questions would give each other away
      var hs = windowFor(p[tier + 'H'] || [], tier + 'H', num, win);
      var gs = windowFor(p[tier + 'G'] || [], tier + 'G', num, win);
      if (h !== g && num % 2 === 0) { var s = h; h = g; g = s; }
      var list = [], hi = 0, gi = 0, wantH = h, wantG = g;
      function take(src, i) {
        while (i < src.length) {
          var q = src[i++];
          if (!q || chosen.some(function (c) { return clash(c, q); })) continue;
          chosen.push(q); list.push(q);
          break;
        }
        return i;
      }
      // Alternate history and geography so each enemy asks a mix.
      while (wantH > 0 || wantG > 0) {
        if (wantH > 0) { hi = take(hs, hi); wantH--; }
        if (wantG > 0) { gi = take(gs, gi); wantG--; }
      }
      byTier[tier] = list;
    });
    var cursor = { 1: 0, 2: 0, 3: 0 };
    return DAILY_ENEMIES.map(function (e) {
      var qs = [];
      for (var i = 0; i < PER_ENEMY; i++) {
        var tier = e.tiers[i % e.tiers.length];
        var q = byTier[tier][cursor[tier]++];
        if (q) qs.push(q);
      }
      return { kind: e.kind, stage: e.stage, interval: e.interval, questions: qs };
    });
  }

  /** Endless mode: enemy n (1-based) gets harder questions and steps faster. */
  var KINDS = ['raider', 'wolf', 'clay', 'wraith'];
  function endlessEnemy(n) {
    var boss = n % 5 === 0;
    var tiers = n <= 2 ? [1] : n <= 4 ? [1, 2] : n <= 8 ? [2] : [2, 3];
    if (boss) tiers = n <= 5 ? [2] : [2, 3];
    return {
      kind: boss ? 'warlord' : KINDS[(n - 1 - Math.floor((n - 1) / 5)) % KINDS.length],
      stage: Math.floor((n - 1) / 2) % 5,
      tiers: tiers,
      interval: Math.max(2.0, 4.0 - 0.14 * (n - 1))
    };
  }

  /** Random question of a tier, avoiding ones already seen this session. */
  function drawQuestion(bank, tier, seen, wantCat) {
    var pool = bank.filter(function (q) { return q.tier === tier && !seen[q.id] && (!wantCat || q.cat === wantCat); });
    if (!pool.length) pool = bank.filter(function (q) { return q.tier === tier && !seen[q.id]; });
    if (!pool.length) {
      bank.forEach(function (q) { if (q.tier === tier) delete seen[q.id]; });
      pool = bank.filter(function (q) { return q.tier === tier; });
    }
    var q = pool[Math.floor(Math.random() * pool.length)];
    seen[q.id] = true;
    return q;
  }

  // ----- scoring -----
  var PACES = 12;
  function liFor(pacesLeft, flawless) {
    return 1000 + 50 * Math.max(0, Math.min(PACES, pacesLeft)) + (flawless ? 400 : 0);
  }
  var RANKS = [
    [10000, 'Warden of the Wall'], [8000, 'Commander'], [6000, 'Captain'],
    [4000, 'Archer'], [2000, 'Sentry'], [0, 'Recruit']
  ];
  function rankFor(li) {
    for (var i = 0; i < RANKS.length; i++) if (li >= RANKS[i][0]) return RANKS[i][1];
    return 'Recruit';
  }

  function fmt(n) { return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }

  /** results: array of 'F' (flawless), 'W' (felled), 'X' (broke through). */
  function shareText(num, results, li, total, url) {
    var marks = { F: '🎯', W: '🏹', X: '💥' };
    var row = '';
    for (var i = 0; i < total; i++) row += marks[results[i]] || '⬛';
    var felled = results.filter(function (r) { return r !== 'X'; }).length;
    var lines = ['Wallward No. ' + num + ' · ' + fmt(li) + ' li', row + '  ' + felled + '/' + total];
    if (url) lines.push(url);
    return lines.join('\n');
  }

  WW.Daily = {
    EPOCH_UTC: EPOCH_UTC, PACES: PACES, PER_ENEMY: PER_ENEMY, DAILY_ENEMIES: DAILY_ENEMIES,
    dayNumber: dayNumber, msToNextWall: msToNextWall, dateOfDay: dateOfDay,
    mulberry32: mulberry32, shuffled: shuffled, dailyPlan: dailyPlan, clash: clash,
    endlessEnemy: endlessEnemy, drawQuestion: drawQuestion,
    liFor: liFor, rankFor: rankFor, fmt: fmt, shareText: shareText
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);
