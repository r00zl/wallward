/* Wallward answer checking.
 *
 * Each question is a roll of names. A typed answer is matched against every name
 * and spelling on the roll after normalising case, accents, punctuation and
 * numerals ("Henry 8", "Henry the Eighth" and "Henry VIII" are one answer).
 * Small spelling slips are forgiven, never in a numeral, and never when the slip
 * spells some other real name. A bare name shared by several answers ("Henry",
 * "Roosevelt") is not guessed at: the player is asked which one.
 */
(function (root) {
  'use strict';
  var WW = root.WW = root.WW || {};

  var SPECIAL = { 'ł': 'l', 'ø': 'o', 'đ': 'd', 'ß': 'ss', 'æ': 'ae', 'œ': 'oe', 'ı': 'i', 'þ': 'th', 'ð': 'd' };
  var SYN = { st: 'saint', ste: 'saint', mt: 'mount' };

  // Generic words a player may add or drop without changing the answer.
  var NOISE = {}, TITLE = {};
  ('the of a an and battle siege fall treaty peace empire dynasty dynasties kingdom house war wars revolution revolutions ' +
   'crusade crusades period era age ages shogunate civilisation civilization culture operation project ' +
   'programme program hms rms uss ss rrs hmhs hmy').split(' ').forEach(function (w) { NOISE[w] = true; });
  // Titles only count as filler in front of a name ("King Harold"), never inside one ("Martin Luther King").
  ('king queen emperor empress tsar czar kaiser president sir lord lady general captain admiral commodore duke ' +
   'earl viscount marquess count pharaoh sultan pope prince princess dr chairman shah chancellor ' +
   'marshal madame').split(' ').forEach(function (w) { TITLE[w] = true; });

  var WORDNUM = { first: 1, second: 2, third: 3, fourth: 4, fifth: 5, sixth: 6, seventh: 7, eighth: 8, ninth: 9,
    tenth: 10, eleventh: 11, twelfth: 12, thirteenth: 13, fourteenth: 14, fifteenth: 15, sixteenth: 16,
    seventeenth: 17, eighteenth: 18, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8,
    nine: 9, ten: 10, eleven: 11, twelve: 12, thirty: 30 };

  function roman(n) {
    var out = '', pairs = [[10, 'x'], [9, 'ix'], [5, 'v'], [4, 'iv'], [1, 'i']];
    pairs.forEach(function (p) { while (n >= p[0]) { out += p[1]; n -= p[0]; } });
    return out;
  }

  function norm(s) {
    s = String(s == null ? '' : s).toLowerCase();
    if (s.normalize) s = s.normalize('NFD').replace(/[̀-ͯ]/g, '');
    s = s.replace(/[łøđßæœıþð]/g, function (c) { return SPECIAL[c] || c; });
    s = s.replace(/&/g, ' and ');
    s = s.replace(/['’‘`´.]/g, function (c) { return c === '.' ? ' ' : ''; });
    s = s.replace(/[^a-z0-9]+/g, ' ').trim();
    if (!s) return '';
    var raw = s.split(' '), t = [], i;
    // initials run together: "H. G. Wells", "H G Wells" and "HG Wells" are the same
    for (i = 0; i < raw.length; i++) {
      if (raw[i].length === 1 && /[a-z]/.test(raw[i]) && t.length && t[t.length - 1].initials) t[t.length - 1].w += raw[i];
      else t.push({ w: raw[i], initials: raw[i].length === 1 && /[a-z]/.test(raw[i]) && i + 1 < raw.length && raw[i + 1].length === 1 });
    }
    t = t.map(function (o) {
      var w = SYN[o.w] || o.w, m = /^(\d+)(st|nd|rd|th)?$/.exec(w);
      if (m && +m[1] >= 1 && +m[1] <= 39) return roman(+m[1]);
      if (WORDNUM[w]) return roman(WORDNUM[w]);
      return w;
    });
    while (t.length > 1 && (t[0] === 'the' || t[0] === 'a' || t[0] === 'an')) t.shift();
    return t.join(' ');
  }

  function stripNoise(n) {
    var t = n.split(' ');
    while (t.length > 1 && (TITLE[t[0]] || t[0] === 'the')) t.shift();
    t = t.filter(function (w) { return !NOISE[w]; });
    return t.length ? t.join(' ') : n;
  }

  /** Damerau-Levenshtein distance (adjacent swaps count as one slip), capped at max + 1. */
  function distance(a, b, max) {
    var la = a.length, lb = b.length;
    if (Math.abs(la - lb) > max) return max + 1;
    var prev2 = null, prev = [], cur, i, j;
    for (j = 0; j <= lb; j++) prev[j] = j;
    for (i = 1; i <= la; i++) {
      cur = [i];
      var rowMin = cur[0];
      for (j = 1; j <= lb; j++) {
        var cost = a.charCodeAt(i - 1) === b.charCodeAt(j - 1) ? 0 : 1;
        var v = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost);
        if (prev2 && i > 1 && j > 1 && a.charCodeAt(i - 1) === b.charCodeAt(j - 2) &&
            a.charCodeAt(i - 2) === b.charCodeAt(j - 1)) {
          v = Math.min(v, prev2[j - 2] + 1);
        }
        cur[j] = v;
        if (v < rowMin) rowMin = v;
      }
      if (rowMin > max) return max + 1;
      prev2 = prev; prev = cur;
    }
    return prev[lb];
  }

  var NUMERAL = /^([ivx]+|\d+)$/;

  /** A form split into its words and its numerals; only the words may absorb slips. */
  function parts(form) {
    var num = [], rest = [];
    form.split(' ').forEach(function (w) { (NUMERAL.test(w) ? num : rest).push(w); });
    return { num: num.join(' '), rest: rest.join(' ') };
  }

  /** How many slips the wordy part of a name may absorb. */
  function tolerance(rest) {
    var len = rest.replace(/ /g, '').length;
    if (len <= 4) return 0;
    if (len <= 7) return 1;
    return 2;
  }

  // ---------- the index of one question ----------
  // Every spelling points at its answer with a rank: the name itself outranks a listed
  // spelling, which outranks a guessable short form. A spelling claimed by two answers
  // at the same rank is "vague".
  function indexOf(list, people) {
    var map = {}, forms = [];
    function add(form, ans, pri) {
      if (!form) return;
      var cur = map[form];
      if (!cur || pri < cur.pri) map[form] = { pri: pri, list: [ans] };
      else if (pri === cur.pri && cur.list.indexOf(ans) === -1) cur.list.push(ans);
    }
    function stem(form) {
      var t = form.split(' ');
      if (t.length < 2 || !NUMERAL.test(t[t.length - 1])) return '';
      while (t.length > 1 && NUMERAL.test(t[t.length - 1])) t.pop();
      return t.join(' ');
    }
    list.forEach(function (ans) {
      var full = norm(ans.name), bare = stripNoise(full), all = [full, bare];
      add(full, ans, 1); add(bare, ans, 2);
      ans.alts.forEach(function (alt) {
        var f = norm(alt), b = stripNoise(f);
        add(f, ans, 3); add(b, ans, 4);
        all.push(f, b);
      });
      // "Theodosius" for Theodosius I, when no other Theodosius is on the roll
      all.forEach(function (f) { add(stem(f), ans, 5); });
      if (people) {
        var t = bare.split(' ').filter(function (w) { return !NUMERAL.test(w); });
        if (t.length >= 2) {
          add(t[t.length - 1], ans, 5);                       // surname
          if (t.length >= 3) add(t[0] + ' ' + t[t.length - 1], ans, 5); // first and last name
        }
      }
    });
    Object.keys(map).forEach(function (form) {
      if (map[form].list.length === 1) forms.push({ text: form, p: parts(form), ans: map[form].list[0] });
    });
    return { map: map, forms: forms };
  }

  function ix(prompt) {
    if (!prompt._ix) {
      prompt._ix = indexOf(prompt.answers, prompt.people);
      prompt._out = prompt.outside.length ? indexOf(prompt.outside, prompt.people) : null;
    }
    return prompt._ix;
  }

  var guard = null;

  /** Register every spelling in the bank, so a correctly spelled other name is never "close enough". */
  function setGuard(bank) {
    guard = {};
    (bank || []).forEach(function (p) {
      Object.keys(ix(p).map).forEach(function (f) { guard[f] = true; });
    });
  }

  function lookup(index, inF, inB) {
    var a = index.map[inF], b = inB !== inF ? index.map[inB] : null;
    if (a && b) return b.pri < a.pri ? b : a;
    return a || b || null;
  }

  /**
   * Check a typed answer against a question.
   * used: map of answer keys already given for this foe.
   * Returns one of
   *   { ok: true, ans, exact }   a fresh answer on the roll
   *   { used: true, ans }        right, but already given
   *   { vague: true }            several answers share that name
   *   { outside: true, ans }     a real name, but not within this question's bounds
   *   { empty: true }            nothing typed
   *   { }                        not on the roll
   */
  function check(input, prompt, used) {
    used = used || {};
    var inF = norm(input);
    if (!inF) return { empty: true };
    var inB = stripNoise(inF), index = ix(prompt);

    var hit = lookup(index, inF, inB);
    if (hit) {
      var fresh = hit.list.filter(function (a) { return !used[a.key]; });
      if (fresh.length === 1) return { ok: true, ans: fresh[0], exact: true };
      if (fresh.length > 1) return { vague: true };
      return { used: true, ans: hit.list[0] };
    }
    if (prompt._out) {
      var out = lookup(prompt._out, inF, inB);
      if (out) return { outside: true, ans: out.list[0], several: out.list.length > 1 };
    }
    // A correctly spelled different name is simply wrong.
    if (guard && (guard[inF] || guard[inB])) return {};

    var best = null, bestD = 99, tie = false;
    [inF, inB].forEach(function (text, n) {
      if (n === 1 && inB === inF) return;
      var p = parts(text);
      if (!p.rest) return;
      index.forms.forEach(function (f) {
        if (f.p.num !== p.num || !f.p.rest) return;
        var tol = tolerance(f.p.rest);
        if (!tol) return;
        var d = distance(p.rest, f.p.rest, tol);
        if (d > tol) return;
        if (d < bestD) { best = f.ans; bestD = d; tie = false; }
        else if (d === bestD && f.ans !== best) tie = true;
      });
    });
    if (!best || tie) return {};
    if (used[best.key]) return { used: true, ans: best };
    return { ok: true, ans: best, exact: false };
  }

  // ---------- letter hints ----------
  // As a foe closes in, the letters of one name still unused are uncovered: the first
  // letter of each word, then others in a fixed scrambled order. Never more than about
  // 40%, and the name is always one of the weakest left, so a hint is a lifeline and
  // not a free heavy blow.
  var SHOW_AT = 5;                      // paces at which the blank tiles appear
  var REVEAL_AT = [4, 3, 3, 2, 2, 1, 1]; // paces at which one more letter appears

  /** The name to hint at: weakest damage first, well-known names before obscure ones. */
  function pick(prompt, used) {
    var left = prompt.answers.filter(function (a) { return !used[a.key]; });
    if (!left.length) return null;
    left.sort(function (a, b) {
      return (a.dmg - b.dmg) || ((b.star ? 1 : 0) - (a.star ? 1 : 0)) ||
        (WW.hashStr(prompt.id + a.name) - WW.hashStr(prompt.id + b.name));
    });
    return left[0];
  }

  function plan(ans) {
    if (ans._hint) return ans._hint;
    var text = ans.name, starts = [], rest = [], i, prev = false;
    for (i = 0; i < text.length; i++) {
      var isLetter = /[A-Za-z0-9À-ɏ]/.test(text.charAt(i));
      if (isLetter) (prev ? rest : starts).push(i);
      prev = isLetter;
    }
    var n = starts.length + rest.length;
    var cap = n <= 2 ? 0 : n <= 4 ? 1 : Math.floor(n * 0.4);
    var seed = WW.hashStr(ans.key);
    for (i = rest.length - 1; i > 0; i--) {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      var j = seed % (i + 1), x = rest[i]; rest[i] = rest[j]; rest[j] = x;
    }
    ans._hint = { text: text, order: starts.concat(rest), cap: cap, letters: n };
    return ans._hint;
  }

  /** How many letters to show when the foe is `pace` paces away; -1 while it is still far off. */
  function hintCount(ans, pace) {
    if (pace > SHOW_AT) return -1;
    var n = 0, i;
    for (i = 0; i < REVEAL_AT.length; i++) if (pace <= REVEAL_AT[i]) n++;
    return Math.min(plan(ans).cap, n);
  }

  /** The name as cells: { ch, state } where state is 'open', 'hidden', 'gap' or 'mark'. */
  function hintCells(ans, count) {
    var h = plan(ans), open = {}, i, out = [];
    for (i = 0; i < Math.min(count, h.cap); i++) open[h.order[i]] = true;
    for (i = 0; i < h.text.length; i++) {
      var ch = h.text.charAt(i);
      if (ch === ' ') out.push({ ch: ' ', state: 'gap' });
      else if (!/[A-Za-z0-9À-ɏ]/.test(ch)) out.push({ ch: ch, state: 'mark' });
      else out.push({ ch: open[i] ? ch : '', state: open[i] ? 'open' : 'hidden' });
    }
    return out;
  }

  WW.Hints = { SHOW_AT: SHOW_AT, REVEAL_AT: REVEAL_AT, pick: pick, plan: plan, hintCount: hintCount, hintCells: hintCells };

  WW.Answers = { norm: norm, stripNoise: stripNoise, distance: distance, tolerance: tolerance, parts: parts,
    index: ix, setGuard: setGuard, check: check };
})(typeof globalThis !== 'undefined' ? globalThis : this);
