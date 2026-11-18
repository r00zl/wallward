/* Wallward sound: short synthesised effects and a slow score, off until the player switches them on.
 *
 * Nothing here is a recording. The effects are single tones; the score is a dark, quiet air
 * in D minor that the browser plays from oscillators: a low drone, wind, a choir-like pad
 * moving through eight chords, and a few plucked notes over it, chosen afresh on every pass.
 */
(function (root) {
  'use strict';
  var WW = root.WW = root.WW || {};

  var AC = null;
  var Sound = { enabled: false };

  /** The audio context, made on first use. Call from a tap or key press so the browser allows it. */
  function audio() {
    if (!Sound.enabled) return null;
    if (!AC) { try { AC = new (root.AudioContext || root.webkitAudioContext)(); } catch (e) { AC = null; } }
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
  Sound.sfx = {
    dash: function () { tone(300, 0.1, 'triangle', 0.04, 700); },
    cut: function (k) { tone(700 + 90 * k, 0.04, 'square', 0.03, 300); },
    // the pitch climbs with the combo; heavier blows add weight and, at three damage, thunder
    hit: function (tier, combo) {
      var up = Math.pow(2, Math.min(combo, 12) / 24);
      tone(520 * up, 0.05, 'square', 0.05, 180); tone(140, 0.14, 'sawtooth', 0.05, 60, 0.03);
      if (tier >= 2) tone(660 * up, 0.07, 'square', 0.05, 240, 0.07);
      if (tier === 3) { tone(1500, 0.16, 'square', 0.04, 180); tone(74, 0.55, 'sawtooth', 0.08, 28, 0.03); }
    },
    combo: function (n) { [0, 1, 2].forEach(function (i) { tone(392 * Math.pow(1.26, i) * (1 + n / 30), 0.09, 'triangle', 0.05, 0, i * 0.06); }); },
    wrong: function () { tone(210, 0.12, 'square', 0.04, 120); },
    leap: function () { tone(180, 0.4, 'triangle', 0.05, 900); },
    thud: function () { tone(110, 0.3, 'sawtooth', 0.09, 34); tone(60, 0.45, 'triangle', 0.08, 30, 0.02); },
    miss: function () { tone(160, 0.25, 'sawtooth', 0.06, 60); },
    step: function () { tone(80, 0.05, 'triangle', 0.04, 55); },
    fell: function () { tone(392, 0.1, 'square', 0.05); tone(523, 0.1, 'square', 0.05, 0, 0.09); tone(659, 0.2, 'square', 0.05, 0, 0.18); },
    fall: function () { tone(220, 0.5, 'sawtooth', 0.07, 40); },
    win: function () { [392, 494, 587, 784].forEach(function (f, i) { tone(f, 0.18, 'square', 0.05, 0, i * 0.13); }); }
  };

  // ---------- the score ----------
  // Notes are MIDI numbers: 50 is the D below middle C. Each chord gives the pad its four
  // notes and the plucked line the notes it may land on while that chord sounds.
  var CHORDS = [
    { pad: [50, 57, 62, 65], line: [62, 65, 69, 74, 77] }, // D minor
    { pad: [46, 53, 58, 62], line: [62, 65, 70, 74] },     // B flat
    { pad: [43, 50, 58, 62], line: [62, 67, 70, 74] },     // G minor
    { pad: [45, 52, 57, 60], line: [64, 69, 72, 76] },     // A minor
    { pad: [50, 57, 62, 65], line: [62, 65, 69, 74, 77] }, // D minor
    { pad: [43, 55, 58, 62], line: [62, 67, 70, 74] },     // G minor
    { pad: [51, 55, 58, 63], line: [63, 67, 70, 75] },     // E flat: the dark step above the home note
    { pad: [45, 52, 57, 64], line: [64, 69, 72, 76] }      // A minor, and home again
  ];
  var STEP = 0.5;            // seconds to a step; a chord lasts sixteen of them
  var STEPS = 16;
  var CHANCE = [0.5, 0.08, 0.22, 0.1, 0.34, 0.08, 0.26, 0.14]; // how likely a plucked note is on each step of a bar
  var LEVEL = 0.8;           // the score sits well under the effects
  var FADE = { up: 3, down: 0.8 }; // seconds

  function hz(midi) { return 440 * Math.pow(2, (midi - 69) / 12); }

  /** A few seconds of fading noise: played through, any sound takes on the ring of a great stone hall. */
  function hall(ac) {
    var len = Math.floor(ac.sampleRate * 3.2), buf = ac.createBuffer(2, len, ac.sampleRate), ch, i;
    for (ch = 0; ch < 2; ch++) {
      var data = buf.getChannelData(ch);
      for (i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6);
    }
    var node = ac.createConvolver();
    node.buffer = buf;
    return node;
  }

  /** A tone that sounds until the score ends. */
  function held(s, type, freq, vol, into) {
    var o = s.ac.createOscillator(), g = s.ac.createGain();
    o.type = type; o.frequency.value = freq; g.gain.value = vol;
    o.connect(g); g.connect(into); o.start();
    s.running.push(o);
    return g;
  }

  /** One chord on the pad: each note a pair of slightly mistuned saws, swelling in and dying away slowly. */
  function chord(s, notes, t) {
    var len = STEP * STEPS, g = s.ac.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.02, t + len * 0.4);
    g.gain.setValueAtTime(0.02, t + len * 0.75);
    g.gain.linearRampToValueAtTime(0, t + len * 1.35);
    g.connect(s.soft);
    notes.forEach(function (midi) {
      [-6, 6].forEach(function (cents) {
        var o = s.ac.createOscillator();
        o.type = 'sawtooth'; o.frequency.value = hz(midi); o.detune.value = cents;
        o.connect(g); o.start(t); o.stop(t + len * 1.4);
      });
    });
  }

  /** One plucked note, like a harp string: a quick attack and a long fall. */
  function pluck(s, midi, t, vol) {
    var ac = s.ac, o = ac.createOscillator(), over = ac.createOscillator(), g = ac.createGain(), thin = ac.createGain();
    o.type = 'triangle'; o.frequency.value = hz(midi);
    over.type = 'sine'; over.frequency.value = hz(midi + 12); thin.gain.value = 0.3;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 2.4);
    o.connect(g); over.connect(thin); thin.connect(g); g.connect(s.bus);
    o.start(t); over.start(t); o.stop(t + 2.5); over.stop(t + 2.5);
  }

  /** A far-off bell: a low note with the sour upper tones that make a bell a bell. */
  function bell(s, midi, t) {
    [[1, 0.03], [2, 0.012], [2.76, 0.008], [5.4, 0.003]].forEach(function (part) {
      var o = s.ac.createOscillator(), g = s.ac.createGain();
      o.type = 'sine'; o.frequency.value = hz(midi) * part[0];
      g.gain.setValueAtTime(part[1], t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 7 / part[0] + 1);
      o.connect(g); g.connect(s.bus);
      o.start(t); o.stop(t + 7 / part[0] + 1.1);
    });
  }

  /** The next note of the plucked line: on the beat it lands on the chord; between beats it steps to a neighbour. */
  function nextNote(s, pool, onBeat) {
    var near = pool.slice().sort(function (a, b) { return Math.abs(a - s.last) - Math.abs(b - s.last); });
    var pick = onBeat ? near[Math.floor(Math.random() * Math.min(3, near.length))] : near[Math.random() < 0.7 ? 0 : 1];
    if (pick === s.last) pick = near[1 % near.length]; // never the same note twice running
    s.last = pick;
    return pick;
  }

  /** Write out the steps that fall due in the next moment: chords, the bell, and the plucked line. */
  function compose(s) {
    while (s.next < s.ac.currentTime + 0.7) {
      var bar = Math.floor(s.step / STEPS), at = s.step % STEPS, c = CHORDS[bar % CHORDS.length];
      if (at === 0) {
        chord(s, c.pad, s.next);
        if (bar % 4 === 0) bell(s, 38, s.next);
        s.sparse = bar % 4 === 3 || Math.random() < 0.25; // some bars are left almost empty, to breathe
      }
      if (Math.random() < CHANCE[at % CHANCE.length] * (s.sparse ? 0.35 : 1)) {
        pluck(s, nextNote(s, c.line, at % 4 === 0), s.next + (Math.random() - 0.5) * 0.03, at % 8 === 0 ? 0.05 : 0.034);
      }
      s.step++; s.next += STEP;
    }
  }

  var score = null;
  /** Begin the score, if sound is on and it is not already playing. */
  function play() {
    var ac = audio();
    if (!ac || score) return;
    try {
      var s = score = { ac: ac, running: [], step: 0, next: ac.currentTime + 0.4, last: 69, sparse: false };
      s.out = ac.createGain();
      s.out.gain.setValueAtTime(0, ac.currentTime);
      s.out.gain.linearRampToValueAtTime(LEVEL, ac.currentTime + FADE.up);
      s.out.connect(ac.destination);
      // every voice goes to the bus, which is heard both plain and through the hall
      s.bus = ac.createGain();
      var room = hall(ac), wet = ac.createGain();
      wet.gain.value = 0.55;
      s.bus.connect(s.out); s.bus.connect(room); room.connect(wet); wet.connect(s.out);
      // the pad is kept dark by a filter that opens and closes a little, very slowly
      s.soft = ac.createBiquadFilter();
      s.soft.type = 'lowpass'; s.soft.frequency.value = 560; s.soft.Q.value = 0.6;
      s.soft.connect(s.bus);
      held(s, 'sine', 0.06, 170, s.soft.frequency);
      // the drone: the home note and the fifth above it, low down
      var low = ac.createBiquadFilter();
      low.type = 'lowpass'; low.frequency.value = 240; low.connect(s.bus);
      held(s, 'triangle', hz(38), 0.05, low);
      held(s, 'sine', hz(45), 0.022, low);
      held(s, 'sine', 0.09, 0.012, held(s, 'triangle', hz(26), 0.03, low).gain);
      // wind over the wall: noise through a narrow filter, rising and falling
      var noise = ac.createBufferSource(), nb = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate), nd = nb.getChannelData(0), i;
      for (i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
      noise.buffer = nb; noise.loop = true;
      var gust = ac.createBiquadFilter(), air = ac.createGain();
      gust.type = 'bandpass'; gust.frequency.value = 420; gust.Q.value = 0.8; air.gain.value = 0.012;
      noise.connect(gust); gust.connect(air); air.connect(s.bus); noise.start();
      s.running.push(noise);
      held(s, 'sine', 0.05, 0.008, air.gain);
      held(s, 'sine', 0.03, 160, gust.frequency);
      compose(s);
      s.timer = root.setInterval(function () { compose(s); }, 200);
    } catch (e) { score = null; }
  }

  /** Let the score die away. */
  function hush() {
    var s = score;
    if (!s) return;
    score = null;
    root.clearInterval(s.timer);
    try {
      s.out.gain.cancelScheduledValues(s.ac.currentTime);
      s.out.gain.setValueAtTime(s.out.gain.value, s.ac.currentTime);
      s.out.gain.linearRampToValueAtTime(0, s.ac.currentTime + FADE.down);
    } catch (e) { /* ignore */ }
    root.setTimeout(function () {
      s.running.forEach(function (node) { try { node.stop(); } catch (e) { /* already stopped */ } });
      try { s.out.disconnect(); } catch (e) { /* ignore */ }
    }, FADE.down * 1000 + 200);
  }

  /** Wake the audio (from a tap or key press) and, with sound on, start the score. */
  Sound.wake = function () { play(); return audio(); };
  Sound.hush = hush;

  WW.Sound = Sound;
})(typeof globalThis !== 'undefined' ? globalThis : this);
