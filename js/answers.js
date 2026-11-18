/* Wallward answer checking.
 *
 * Typed answers are compared after normalising case, accents and punctuation.
 * Small spelling slips are forgiven, but never when the slip spells a different
 * real place ("Austria" for "Australia") and never in numbers or regnal numerals.
 */
(function (root) {
  'use strict';
  var WW = root.WW = root.WW || {};

  var SPECIAL = { 'ł': 'l', 'ø': 'o', 'đ': 'd', 'ß': 'ss', 'æ': 'ae', 'œ': 'oe', 'ı': 'i', 'þ': 'th', 'ð': 'd' };
  var SYN = { mt: 'mount', st: 'saint', ste: 'saint' };

  // Generic words a player may add or drop without changing the answer.
  var NOISE = {}, TITLE = {};
  ('the of river mount mountain mountains lake sea ocean desert empire dynasty kingdom republic island islands ' +
   'isle strait straits cape falls canal battle treaty peninsula trench plateau palace gulf tropic bay valley ' +
   'house hms rms operation').split(' ').forEach(function (w) { NOISE[w] = true; });
  // Titles only count as filler in front of a name ("King Harold"), never inside one ("Martin Luther King").
  ('king queen emperor empress tsar czar kaiser president sir lord lady general captain admiral commodore duke ' +
   'pharaoh sultan pope prince princess dr saint chairman shah').split(' ').forEach(function (w) { TITLE[w] = true; });

  function norm(s) {
    s = String(s == null ? '' : s).toLowerCase();
    if (s.normalize) s = s.normalize('NFD').replace(/[̀-ͯ]/g, '');
    s = s.replace(/[łøđßæœıþð]/g, function (c) { return SPECIAL[c] || c; });
    s = s.replace(/&/g, ' and ');
    s = s.replace(/['’‘`´.]/g, '');
    s = s.replace(/[^a-z0-9]+/g, ' ').trim();
    if (!s) return '';
    var t = s.split(' ').map(function (w) { return SYN[w] || w; });
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

  var NUMERAL = /(^| )([ivx]+|\d+(st|nd|rd|th)?)( |$)/;

  /** How many slips a target string may absorb. */
  function tolerance(target) {
    if (/\d/.test(target) || NUMERAL.test(target)) return 0;
    var len = target.replace(/ /g, '').length;
    if (len <= 4) return 0;
    if (len <= 7) return 1;
    return 2;
  }

  function formsOf(q) {
    if (q._forms) return q._forms;
    var seen = {}, forms = [];
    q.a.forEach(function (ans) {
      var full = norm(ans);
      if (!full || seen[full]) return;
      seen[full] = true;
      forms.push({ full: full, bare: stripNoise(full) });
    });
    q._forms = forms;
    return forms;
  }

  var guard = null;

  /** Register every known answer and country so near-miss spellings of the wrong thing fail. */
  var LOOKALIKES = 'Rhone,Volta,Saone,Marne,Genoa,Grenada,Song dynasty,Han dynasty,Yuan dynasty,' +
    'Zhou dynasty,Shang dynasty,Sui dynasty,Jin dynasty,Athena,Sparta,Persia,Prussia,Russia,Austria-Hungary';

  function setGuard(bank, countries) {
    guard = {};
    (countries || []).concat(LOOKALIKES.split(',')).forEach(function (c) { guard[norm(c)] = true; });
    (bank || []).forEach(function (q) {
      formsOf(q).forEach(function (f) { guard[f.full] = true; });
    });
  }

  /**
   * Check a typed answer.
   * Returns { ok, exact, empty, shown } where shown is the answer to display.
   */
  function check(input, q) {
    var shown = q.a[0];
    var inF = norm(input);
    if (!inF) return { ok: false, empty: true, shown: shown };
    var inB = stripNoise(inF);
    var forms = formsOf(q), i, f;

    // Years and other pure numbers: digits must match exactly.
    if (/^\d+$/.test(forms[0].full)) {
      var cleaned = inF.replace(/\b(ad|ce|in|year|about|circa)\b/g, ' ').replace(/ +/g, ' ').trim();
      return { ok: cleaned === forms[0].full, exact: true, shown: shown };
    }

    for (i = 0; i < forms.length; i++) {
      f = forms[i];
      if (inF === f.full || inF === f.bare || inB === f.full) return { ok: true, exact: true, shown: shown };
    }
    // A correctly spelled different thing is simply wrong.
    if (guard && (guard[inF] || guard[inB])) return { ok: false, shown: shown };

    for (i = 0; i < forms.length; i++) {
      f = forms[i];
      // Allowance is set by the distinctive part only: "Ming dynasty" gets none,
      // so "Qing dynasty" cannot slip through on the strength of the shared word.
      var tol = tolerance(f.bare);
      if (!tol) continue;
      if (distance(inF, f.full, tol) <= tol) return { ok: true, exact: false, shown: shown };
      if (inB !== inF && distance(inB, f.full, tol) <= tol) return { ok: true, exact: false, shown: shown };
      if (f.bare !== f.full && distance(inF, f.bare, tol) <= tol) return { ok: true, exact: false, shown: shown };
    }
    return { ok: false, shown: shown };
  }

  // ---------- letter hints ----------
  // As an enemy closes in, letters of the answer are uncovered: the first letter of
  // each word, then others in a fixed scrambled order. Never more than about 40%,
  // so a hint narrows the answer without handing it over.
  var REVEAL_AT = [9, 7, 5, 4, 3, 2]; // paces at which one more letter appears

  function hintFor(q) {
    if (q._hint) return q._hint;
    var text = q.a[0], starts = [], rest = [], i, prev = false;
    for (i = 0; i < text.length; i++) {
      var isLetter = /[A-Za-z0-9\u00C0-\u024F]/.test(text.charAt(i));
      if (isLetter) (prev ? rest : starts).push(i);
      prev = isLetter;
    }
    var n = starts.length + rest.length;
    var cap = n <= 2 ? 0 : n <= 4 ? 1 : Math.floor(n * 0.4);
    var seed = WW.hashStr(q.id + '|' + text);
    for (i = rest.length - 1; i > 0; i--) {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      var j = seed % (i + 1), x = rest[i]; rest[i] = rest[j]; rest[j] = x;
    }
    q._hint = { text: text, order: starts.concat(rest), cap: cap, letters: n };
    return q._hint;
  }

  /** How many letters to show when the enemy is `pace` paces away. */
  function hintCount(q, pace) {
    var n = 0, i;
    for (i = 0; i < REVEAL_AT.length; i++) if (pace <= REVEAL_AT[i]) n++;
    return Math.min(hintFor(q).cap, n);
  }

  /** The answer as cells: { ch, state } where state is 'open', 'hidden', 'gap' or 'mark'. */
  function hintCells(q, count) {
    var h = hintFor(q), open = {}, i, out = [];
    for (i = 0; i < Math.min(count, h.cap); i++) open[h.order[i]] = true;
    for (i = 0; i < h.text.length; i++) {
      var ch = h.text.charAt(i);
      if (ch === ' ') out.push({ ch: ' ', state: 'gap' });
      else if (!/[A-Za-z0-9\u00C0-\u024F]/.test(ch)) out.push({ ch: ch, state: 'mark' });
      else out.push({ ch: open[i] ? ch : '', state: open[i] ? 'open' : 'hidden' });
    }
    return out;
  }

  WW.Hints = { REVEAL_AT: REVEAL_AT, hintFor: hintFor, hintCount: hintCount, hintCells: hintCells };

  WW.Answers = { norm: norm, stripNoise: stripNoise, distance: distance, tolerance: tolerance,
    formsOf: formsOf, setGuard: setGuard, check: check };
})(typeof globalThis !== 'undefined' ? globalThis : this);
