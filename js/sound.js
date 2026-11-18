/* Wallward sound: short synthesised effects, off until the player switches them on. */
(function (root) {
  'use strict';
  var WW = root.WW = root.WW || {};

  var AC = null;
  var Sound = { enabled: false };

  /** The audio context, made on first use. Call from a tap or key press so the browser allows it. */
  function audio() {
    if (!Sound.enabled) return null;
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
  Sound.wake = audio;
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

  WW.Sound = Sound;
})(typeof globalThis !== 'undefined' ? globalThis : this);
