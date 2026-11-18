/* Predate sound: synthesised effects and a slow score, off until the player switches them on.
 *
 * Nothing here is a recording. The effects are tones and bursts of filtered noise. The score
 * is a dark, slow air in D minor that the browser plays from oscillators: a low drone, wind,
 * a soft pad over a falling bass, a far-off bell, a few plucked notes, and over them a lone
 * reedy voice that glides from note to note and wavers like a worn tape.
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

  /** A single tone that dies away, sliding to `slideTo` if given. */
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

  var hissBuf = null;
  /** Two seconds of plain noise: the stuff of wind, whooshes and impacts. */
  function hiss(ac) {
    if (!hissBuf || hissBuf.sampleRate !== ac.sampleRate) {
      hissBuf = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate);
      var data = hissBuf.getChannelData(0), i;
      for (i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    }
    return hissBuf;
  }

  /**
   * A burst of noise through a filter whose pitch sweeps from `from` to `to`: a whoosh when
   * it swells slowly (`swell` near 1), a crack or a crunch when it starts at once (near 0).
   */
  function rush(dur, vol, kind, from, to, delay, swell) {
    var ac = audio();
    if (!ac) return;
    try {
      var src = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain(), t0 = ac.currentTime + (delay || 0);
      src.buffer = hiss(ac); src.loop = true;
      f.type = kind; f.Q.value = 1.1;
      f.frequency.setValueAtTime(from, t0);
      f.frequency.exponentialRampToValueAtTime(to, t0 + dur);
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(vol, t0 + Math.max(0.005, dur * (swell || 0.04)));
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      src.connect(f); f.connect(g); g.connect(ac.destination);
      src.start(t0, Math.random()); src.stop(t0 + dur + 0.05);
    } catch (e) { /* ignore */ }
  }

  /** A struck bell or blade: a note with the sour upper tones of ringing metal, the high ones dying first. */
  function ring(freq, dur, vol, delay) {
    [[1, 1], [2, 0.5], [2.76, 0.34], [5.4, 0.14]].forEach(function (part) {
      tone(freq * part[0], dur / Math.sqrt(part[0]), 'sine', vol * part[1], 0, delay);
    });
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
    miss: function () { tone(160, 0.25, 'sawtooth', 0.06, 60); },
    step: function () { tone(80, 0.05, 'triangle', 0.04, 55); },
    fell: function () { tone(392, 0.1, 'square', 0.05); tone(523, 0.1, 'square', 0.05, 0, 0.09); tone(659, 0.2, 'square', 0.05, 0, 0.18); },
    fall: function () { tone(220, 0.5, 'sawtooth', 0.07, 40); },
    win: function () { [392, 494, 587, 784].forEach(function (f, i) { tone(f, 0.18, 'square', 0.05, 0, i * 0.13); }); },

    // ----- the finishing blow, stage by stage -----
    /** The leap: air rushing past as the knight goes up. */
    leap: function () { tone(180, 0.4, 'triangle', 0.05, 900); rush(0.42, 0.14, 'bandpass', 260, 2800, 0, 0.75); },
    /** The top of the leap: the blade turns over, and rings. */
    poise: function () { rush(0.12, 0.07, 'highpass', 3000, 9000, 0, 0.3); ring(1760, 0.7, 0.04, 0.03); tone(2637, 0.5, 'sine', 0.02, 2610, 0.03); },
    /** The plunge: a short, falling rush. */
    plunge: function () { rush(0.13, 0.22, 'bandpass', 3200, 240, 0, 0.25); tone(900, 0.12, 'sawtooth', 0.04, 110); },
    /** The point goes in: a crack, steel on bone, and a blow felt more than heard. */
    impale: function () {
      rush(0.07, 0.16, 'highpass', 1500, 5000);                      // the crack
      rush(0.32, 0.1, 'lowpass', 1100, 90, 0.015);                   // the crunch under it
      tone(130, 0.55, 'sine', 0.16, 30); tone(72, 0.7, 'sawtooth', 0.07, 24, 0.02);
      ring(466, 0.5, 0.04, 0.01); tone(1244, 0.22, 'square', 0.02, 1180);
      tone(49, 0.62, 'sawtooth', 0.05, 46, 0.12);                    // the held moment hums
    },
    /** The blade is wrenched free and the foe comes apart: steel dragged out, a burst, and a bell tolling it away. */
    sunder: function () {
      rush(0.18, 0.08, 'bandpass', 600, 4200, 0, 0.6); tone(260, 0.18, 'sawtooth', 0.04, 1100);
      rush(0.7, 0.14, 'lowpass', 2600, 70, 0.06); tone(98, 0.8, 'sine', 0.14, 28, 0.06);
      ring(146.83, 3.2, 0.07, 0.16);
      tone(73.42, 1.8, 'triangle', 0.07, 0, 0.16); tone(110, 1.8, 'triangle', 0.045, 0, 0.16); // a bare fifth under the bell
      [293.66, 440, 587.33].forEach(function (f, i) { tone(f, i === 2 ? 0.9 : 0.3, 'triangle', 0.04, 0, 0.42 + i * 0.13); });
    }
  };

  // ---------- the score ----------
  // Notes are MIDI numbers: 62 is the D above middle C. Time is counted in steps, six to a
  // bar, with a lilt of two beats of three. A chord lasts two bars. The bass falls by step
  // under the first four chords (D, C, B flat, G): an old way of sounding grave.
  var STEP = 0.3, BAR = 6, HOLD = 2 * BAR; // seconds to a step; steps to a bar; steps to a chord
  var CHORDS = [
    { pad: [50, 57, 62, 65], line: [62, 65, 69, 74] },     // D minor
    { pad: [48, 55, 60, 64], line: [60, 64, 67, 72] },     // C
    { pad: [46, 53, 58, 62], line: [58, 62, 65, 70] },     // B flat
    { pad: [43, 50, 58, 62], line: [55, 62, 67, 70] },     // G minor
    { pad: [50, 57, 62, 65], line: [62, 65, 69, 74] },     // D minor
    { pad: [48, 55, 60, 64], line: [60, 64, 67, 72] },     // C
    { pad: [46, 53, 58, 62], line: [58, 62, 65, 70] },     // B flat
    { pad: [45, 52, 57, 60], line: [57, 60, 64, 69, 72] }  // A minor, and home again
  ];
  // What the lone voice sings: each phrase is four bars of [note, steps], 0 for a rest. A
  // call goes over the first two chords of a half and one of the answers over the next two.
  var CALLS = [
    [[69, 2], [74, 1], [72, 2], [69, 1], [67, 1], [69, 1], [65, 1], [62, 3], [65, 2], [67, 1], [69, 2], [72, 1], [69, 4], [0, 2]],
    [[62, 2], [69, 1], [67, 2], [65, 1], [67, 3], [69, 2], [72, 1], [74, 2], [72, 1], [69, 2], [67, 1], [69, 4], [0, 2]]
  ];
  var ANSWERS = [
    [[74, 2], [72, 1], [69, 2], [67, 1], [65, 1], [67, 1], [69, 1], [65, 2], [62, 1], [62, 2], [65, 1], [64, 2], [60, 1], [62, 4], [0, 2]],
    [[65, 3], [62, 2], [65, 1], [70, 2], [69, 1], [67, 2], [65, 1], [67, 2], [65, 1], [62, 2], [60, 1], [62, 5], [0, 1]],
    [[0, 3], [69, 2], [70, 1], [69, 2], [67, 1], [65, 3], [62, 2], [64, 1], [65, 2], [64, 1], [62, 6]]
  ];
  var MINOR = [2, 4, 5, 7, 9, 10, 0]; // D E F G A B flat C, as notes within the octave
  var CHANCE = [0.42, 0.06, 0.1, 0.3, 0.06, 0.16]; // how likely a plucked note is on each step of a bar
  var LEVEL = 0.8;                 // the score sits under the effects
  var FADE = { up: 3, down: 0.8 }; // seconds
  var GLIDE = 0.035;               // how slowly the voice slides to its next note

  function hz(midi) { return 440 * Math.pow(2, (midi - 69) / 12); }

  /** A few seconds of fading noise: played through, any sound takes on the ring of a great stone hall. */
  function hall(ac) {
    var len = Math.floor(ac.sampleRate * 3.4), buf = ac.createBuffer(2, len, ac.sampleRate), ch, i;
    for (ch = 0; ch < 2; ch++) {
      var data = buf.getChannelData(ch);
      for (i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.4);
    }
    var node = ac.createConvolver();
    node.buffer = buf;
    return node;
  }

  /** A tone that sounds until the score ends: a drone, or a slow wave that sways some other setting. */
  function held(s, type, freq, vol, into) {
    var o = s.ac.createOscillator(), g = s.ac.createGain();
    o.type = type; o.frequency.value = freq; g.gain.value = vol;
    o.connect(g); g.connect(into); o.start();
    s.running.push(o);
    return { osc: o, gain: g };
  }

  /** One chord on the pad: each note a pair of slightly mistuned saws, swelling in and dying away slowly. */
  function chord(s, notes, t) {
    var len = STEP * HOLD, g = s.ac.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.018, t + len * 0.45);
    g.gain.setValueAtTime(0.018, t + len * 0.8);
    g.gain.linearRampToValueAtTime(0, t + len * 1.5);
    g.connect(s.soft);
    notes.forEach(function (midi) {
      [-7, 7].forEach(function (cents) {
        var o = s.ac.createOscillator();
        o.type = 'sawtooth'; o.frequency.value = hz(midi); o.detune.value = cents;
        o.connect(g); o.start(t); o.stop(t + len * 1.55);
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

  /** A far-off bell. */
  function bell(s, midi, t) {
    [[1, 0.032], [2, 0.012], [2.76, 0.008], [5.4, 0.003]].forEach(function (part) {
      var o = s.ac.createOscillator(), g = s.ac.createGain();
      o.type = 'sine'; o.frequency.value = hz(midi) * part[0];
      g.gain.setValueAtTime(part[1], t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 7 / part[0] + 1);
      o.connect(g); g.connect(s.bus);
      o.start(t); o.stop(t + 7 / part[0] + 1.1);
    });
  }

  /**
   * The lone voice: one reedy note at a time, like a small old synthesiser played by hand.
   * It never stops sounding; each note only opens it, bends its pitch to the new note and
   * lets it close again. Two slow waves keep it from ever being quite in tune.
   */
  function voice(s) {
    var ac = s.ac, v = { oscs: [], amp: ac.createGain(), tone: ac.createBiquadFilter() };
    v.tone.type = 'lowpass'; v.tone.frequency.value = 700; v.tone.Q.value = 3.5;
    v.amp.gain.value = 0;
    [['sawtooth', 1, 0.6], ['square', 0.5, 0.34]].forEach(function (part) { // a saw, and a hollow square an octave below
      var o = held(s, part[0], hz(62) * part[1], part[2], v.tone);
      v.oscs.push({ pitch: o.osc.frequency, ratio: part[1] });
      held(s, 'sine', 0.23, 11, o.osc.detune); // the waver of a worn tape
      held(s, 'sine', 5.3, 5, o.osc.detune);   // and a singer's tremble
    });
    v.tone.connect(v.amp);
    // heard plain, and again as an echo that grows duller each time round
    var echo = ac.createDelay(2), back = ac.createGain(), dull = ac.createBiquadFilter();
    echo.delayTime.value = STEP * 1.5; back.gain.value = 0.36; dull.type = 'lowpass'; dull.frequency.value = 1500;
    v.amp.connect(s.bus); v.amp.connect(echo); echo.connect(dull); dull.connect(back); back.connect(echo); dull.connect(s.bus);
    return v;
  }

  /** The next note up the scale of D minor. */
  function above(midi) {
    var n = midi + 1;
    while (MINOR.indexOf(n % 12) === -1) n++;
    return n;
  }

  /** Have the voice sing one note. A longer note is often leant on from the note above, as a piper would. */
  function sing(s, midi, t, len, vol) {
    var v = s.voice, lean = len >= STEP * 2 && Math.random() < 0.55;
    v.oscs.forEach(function (o) {
      if (lean) { o.pitch.setTargetAtTime(hz(above(midi)) * o.ratio, t, 0.004); o.pitch.setTargetAtTime(hz(midi) * o.ratio, t + 0.06, 0.014); }
      else o.pitch.setTargetAtTime(hz(midi) * o.ratio, t, GLIDE);
    });
    v.amp.gain.setTargetAtTime(vol, t, 0.015);
    v.amp.gain.setTargetAtTime(0, t + len - 0.07, 0.06);
    v.tone.frequency.setTargetAtTime(1700, t, 0.012);
    v.tone.frequency.setTargetAtTime(640, t + 0.09, 0.22);
  }

  /** Write a four-bar phrase for the voice into the time ahead, starting at `t`. */
  function phrase(s, notes, t, lower, vol) {
    notes.forEach(function (n) {
      if (n[0]) sing(s, n[0] - (lower ? 12 : 0), t, n[1] * STEP, vol);
      t += n[1] * STEP;
    });
  }

  function any(list) { return list[Math.floor(Math.random() * list.length)]; }

  /** The next plucked note: on a beat it lands on the chord; between beats it steps to a neighbour. */
  function nextNote(s, pool, onBeat) {
    var near = pool.slice().sort(function (a, b) { return Math.abs(a - s.last) - Math.abs(b - s.last); });
    var pick = onBeat ? near[Math.floor(Math.random() * Math.min(3, near.length))] : near[Math.random() < 0.7 ? 0 : 1];
    if (pick === s.last) pick = near[1 % near.length]; // never the same note twice running
    s.last = pick;
    return pick;
  }

  /**
   * Write out the steps that fall due in the next moment. Every pass through the eight
   * chords has two halves: in one the voice calls and is answered, and the other is left
   * to the pad, the bell and the plucked notes. Which half sings changes from pass to pass.
   */
  function compose(s) {
    while (s.next < s.ac.currentTime + 0.7) {
      var at = s.step % HOLD, turn = Math.floor(s.step / HOLD), c = CHORDS[turn % CHORDS.length], half = turn % 4;
      if (at === 0) {
        chord(s, c.pad, s.next);
        if (turn % CHORDS.length === 0) {
          bell(s, 38, s.next);
          if (turn) { s.sings = Math.random() < 0.5 ? 0 : 4; s.lower = Math.random() < 0.35; } // the first pass opens without the voice
        }
        s.singing = turn % CHORDS.length >= s.sings && turn % CHORDS.length < s.sings + 4;
        if (s.singing && half === 0) phrase(s, any(CALLS), s.next, s.lower, 0.05);
        if (s.singing && half === 2) phrase(s, any(ANSWERS), s.next, s.lower, 0.045);
      }
      // the plucked notes keep out of the voice's way
      if (Math.random() < CHANCE[at % BAR] * (s.singing ? 0.25 : 1)) {
        pluck(s, nextNote(s, c.line, at % 3 === 0), s.next + (Math.random() - 0.5) * 0.03, at % BAR === 0 ? 0.045 : 0.03);
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
      var s = score = { ac: ac, running: [], step: 0, next: ac.currentTime + 0.4, last: 69, sings: 4, lower: false, singing: false };
      s.out = ac.createGain();
      s.out.gain.setValueAtTime(0, ac.currentTime);
      s.out.gain.linearRampToValueAtTime(LEVEL, ac.currentTime + FADE.up);
      s.out.connect(ac.destination);
      // every voice goes to the bus, which is heard both plain and through the hall
      s.bus = ac.createGain();
      var room = hall(ac), wet = ac.createGain();
      wet.gain.value = 0.6;
      s.bus.connect(s.out); s.bus.connect(room); room.connect(wet); wet.connect(s.out);
      // the pad is kept dark by a filter that opens and closes a little, very slowly
      s.soft = ac.createBiquadFilter();
      s.soft.type = 'lowpass'; s.soft.frequency.value = 500; s.soft.Q.value = 0.6;
      s.soft.connect(s.bus);
      held(s, 'sine', 0.06, 150, s.soft.frequency);
      // the drone: the home note and the fifth above it, low down, with a slow swell beneath
      var low = ac.createBiquadFilter();
      low.type = 'lowpass'; low.frequency.value = 240; low.connect(s.bus);
      held(s, 'triangle', hz(38), 0.05, low);
      held(s, 'sine', hz(45), 0.022, low);
      held(s, 'sine', 0.09, 0.012, held(s, 'triangle', hz(26), 0.03, low).gain.gain);
      // wind over the wall: noise through a narrow filter, rising and falling
      var noise = ac.createBufferSource(), gust = ac.createBiquadFilter(), air = ac.createGain();
      noise.buffer = hiss(ac); noise.loop = true;
      gust.type = 'bandpass'; gust.frequency.value = 420; gust.Q.value = 0.8; air.gain.value = 0.012;
      noise.connect(gust); gust.connect(air); air.connect(s.bus); noise.start();
      s.running.push(noise);
      held(s, 'sine', 0.05, 0.008, air.gain);
      held(s, 'sine', 0.03, 160, gust.frequency);
      s.voice = voice(s);
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
