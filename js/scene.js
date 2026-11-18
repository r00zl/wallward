/* Wallward scenery.
 *
 * The scene fills the whole page. It is drawn at low resolution in layers that
 * slide at different speeds as the warrior walks and as the pointer moves:
 * sky, haze, far and middle mountains (with the wall winding along a ridge),
 * mist, near slopes, then the wall itself, and finally plants close to the eye.
 * Five stretches of wall (stages) run from a sea gate at dawn to a desert gate
 * at night; one dissolves into the next with a dither while the warrior walks.
 */
(function (root) {
  'use strict';
  var WW = root.WW = root.WW || {};
  var S = WW.Sprites;

  var TW = 384;        // background layers repeat every TW pixels
  var LH = 300;        // height of a background layer
  var WALL_TILE = 120; // the wall repeats every 120 pixels (merlons every 20, bricks every 12)
  var TOP = 17;        // merlon tops sit this far above the walkway
  var BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];

  // How far each layer follows the walk (scroll) and the pointer (mx, my), in pixels.
  var DEPTH = {
    sky:   { scroll: 0.01, mx: 1,  my: 0.5 },
    cloud: { scroll: 0.03, mx: 2,  my: 1 },
    haze:  { scroll: 0.03, mx: 2,  my: 1 },
    far:   { scroll: 0.06, mx: 4,  my: 1.5 },
    mid:   { scroll: 0.14, mx: 7,  my: 2 },
    mist:  { scroll: 0.2,  mx: 9,  my: 2.5 },
    near:  { scroll: 0.34, mx: 12, my: 3 },
    wall:  { scroll: 1,    mx: 16, my: 4 },
    front: { scroll: 1.8,  mx: 28, my: 7 }
  };

  // Five stretches of wall. Each sets its sky bands (top to bottom), sun or moon,
  // four ridgelines (base height and wave sizes), the colour of the air between
  // them, the stone of the wall, its weather, and the tint of the light on the figures.
  var STAGES = [
    {
      name: 'Drowned Gate', time: 'dawn', tint: ['#5a6a9a', 0.14], torch: 13,
      sky: ['#141a2e', '#2a3350', '#555a78', '#9a8a8a', '#d8c39a'],
      sun: { x: 0.68, y: 0.8, r: 10, col: '#f2e3b8', halo: '#c9b48c' },
      haze: { col: '#6f7390', hi: '#80849e', shade: '#62667f', base: 78, amps: [[1, 8], [3, 5]], seed: 10, smooth: true },
      far: { col: '#4c5372', hi: '#5f6686', shade: '#3f4560', base: 62, amps: [[2, 9], [5, 5], [11, 2]], seed: 11, mistCol: '#8b8796' },
      mid: { col: '#363c56', hi: '#474e6c', shade: '#2a2f46', base: 48, amps: [[3, 5], [7, 3], [13, 1.5]], seed: 12, mistCol: '#5d6078', beacon: true },
      sea: { top: 40, col: '#27374d', col2: '#30445c', glint: '#7f97a8', sun: '#cdb98c' },
      near: { col: '#1a2233', hi: '#27314a', shade: '#121826', base: 27, amps: [[2, 9], [5, 5], [9, 2]], seed: 13, trees: 'pine', treeCols: ['#131b28', '#1c2636'] },
      mist: '#9a98a8',
      stone: { lit: '#8d8a92', mid: '#6a6772', dark: '#4a4754', floor: '#9c98a0', line: '#2e2b38', moss: '#3f5a4a' },
      cloud: { col: '#6d6f88', shade: '#4f5270' },
      weather: 'crows',
      front: { col: '#0c111b', hi: '#1c2636', kind: 'grass' }
    },
    {
      name: 'Greywood', time: 'a grey noon', tint: ['#5d7a80', 0.12], torch: 12,
      sky: ['#3d4a5c', '#566577', '#73838f', '#94a2a6', '#b9c2bd'],
      sun: { x: 0.22, y: 0.3, r: 8, col: '#e6e8dc', halo: '#c5cdc6' },
      haze: { col: '#8c9aa2', hi: '#9aa8ae', shade: '#7f8d96', base: 84, amps: [[1, 9], [3, 5]], seed: 20, smooth: true },
      far: { col: '#6a7c86', hi: '#7c8e97', shade: '#5b6c76', base: 68, amps: [[2, 10], [5, 6], [9, 3]], seed: 21, mistCol: '#a3afb0' },
      mid: { col: '#3f5a52', hi: '#51706a', shade: '#314840', base: 52, amps: [[3, 7], [6, 4], [11, 2]], seed: 22, mistCol: '#6d837c',
        wall: { col: '#a9a79a', dark: '#6f6d66' }, texture: '#35504a' },
      near: { col: '#1f3a33', hi: '#2f5046', shade: '#152a25', base: 31, amps: [[2, 6], [5, 4], [9, 2]], seed: 23, trees: 'pine', treeCols: ['#18302a', '#234238', '#122420'] },
      mist: '#b4bdb9',
      stone: { lit: '#9a9a94', mid: '#77776f', dark: '#55554f', floor: '#a8a8a0', line: '#34342f', moss: '#4f6a4a' },
      cloud: { col: '#8b979f', shade: '#6a7780' },
      weather: 'rain',
      front: { col: '#0f201c', hi: '#234238', kind: 'bush' }
    },
    {
      name: 'Bloodleaf Pass', time: 'late afternoon', tint: ['#ff8a3c', 0.14], torch: 13,
      sky: ['#3a2f48', '#6a4658', '#a8604e', '#d98e4e', '#f0c27a'],
      sun: { x: 0.78, y: 0.66, r: 11, col: '#ffdf9a', halo: '#f0a860' },
      haze: { col: '#9a6a62', hi: '#ad7b70', shade: '#885a55', base: 82, amps: [[1, 9], [3, 5]], seed: 30, smooth: true },
      far: { col: '#74505a', hi: '#89626a', shade: '#60404b', base: 66, amps: [[2, 9], [4, 6], [10, 3]], seed: 31, mistCol: '#c98a5e' },
      mid: { col: '#6e3a36', hi: '#8a4c42', shade: '#55292a', base: 52, amps: [[3, 7], [7, 4], [12, 2]], seed: 32, mistCol: '#a0583e',
        wall: { col: '#c9a888', dark: '#8a6a58' }, texture: '#5c2c2c' },
      near: { col: '#4a1f24', hi: '#8f2f2a', shade: '#33151a', base: 31, amps: [[2, 6], [5, 4], [8, 2]], seed: 33, trees: 'maple', treeCols: ['#8f2f2a', '#b8452e', '#6e2226', '#c96a2e'] },
      mist: '#d99a66',
      stone: { lit: '#a8927c', mid: '#836e60', dark: '#5e4e48', floor: '#b8a288', line: '#3a2e2e' },
      cloud: { col: '#c98a66', shade: '#8f5a52' },
      weather: 'leaves',
      front: { col: '#240e12', hi: '#8f2f2a', kind: 'bush' }
    },
    {
      name: 'Frostmarch', time: 'dusk', tint: ['#5a58b0', 0.26], torch: 16, lit: true,
      sky: ['#10142c', '#262a52', '#4a4476', '#7d5c84', '#b88a94'],
      sun: { x: 0.3, y: 0.92, r: 10, col: '#e8c0b0', halo: '#a87a90' },
      haze: { col: '#6c6c98', hi: '#7e7eaa', shade: '#5e5e88', base: 86, amps: [[1, 10], [3, 6]], seed: 40, smooth: true },
      far: { col: '#5a5e90', hi: '#7479a8', shade: '#4a4e7c', base: 70, amps: [[2, 12], [5, 7], [9, 3]], seed: 41, mistCol: '#8a7a9c', snow: { line: 60, col: '#dfe4f6' } },
      mid: { col: '#3e4270', hi: '#565b8c', shade: '#30345c', base: 54, amps: [[3, 8], [7, 5], [12, 2]], seed: 42, mistCol: '#62608a',
        wall: { col: '#b0b4d2', dark: '#6a6e96' }, snow: { line: 52, col: '#cdd4ee' } },
      near: { col: '#20244a', hi: '#343a66', shade: '#171a38', base: 31, amps: [[2, 6], [5, 4], [9, 2]], seed: 43, trees: 'snowpine', treeCols: ['#171a38', '#20264c'], snowTop: '#cdd4ee' },
      mist: '#8f8fb8',
      stone: { lit: '#8f94b0', mid: '#696e8e', dark: '#484c6c', floor: '#a4a9c2', line: '#2c2f4c', cap: '#e6ebfb' },
      cloud: { col: '#6f6a94', shade: '#4c4874' },
      weather: 'snow',
      front: { col: '#0f1228', hi: '#cdd4ee', kind: 'bush' }
    },
    {
      name: 'Ashen Gate', time: 'night', tint: ['#7a1c2c', 0.3], torch: 18, lit: true,
      sky: ['#07060e', '#120d1c', '#22132a', '#3a1a2e', '#5a2630'],
      moon: { x: 0.74, y: 0.36, r: 14, col: '#e8b8a0', shade: '#c08878', halo: '#7a2a34' },
      stars: 90,
      haze: { col: '#2e1c30', hi: '#3a2438', shade: '#26162a', base: 80, amps: [[1, 10], [3, 6]], seed: 50, smooth: true },
      far: { col: '#22162a', hi: '#30203a', shade: '#1a1022', base: 66, amps: [[2, 12], [5, 7], [9, 4]], seed: 51, mistCol: '#4a2230' },
      mid: { col: '#1a1220', hi: '#2a1c30', shade: '#120c18', base: 50, amps: [[2, 8], [5, 5], [9, 2]], seed: 52, mistCol: '#3a1c28',
        wall: { col: '#4a3a48', dark: '#2c2230', ruined: true } },
      near: { col: '#0f0a14', hi: '#1c1422', shade: '#0a060e', base: 29, amps: [[1, 6], [3, 4], [6, 2]], seed: 53, trees: 'dead', treeCols: ['#0a060e', '#140e1a'] },
      mist: '#5a2a34',
      stone: { lit: '#5f566a', mid: '#443c50', dark: '#2c2638', floor: '#6e647a', line: '#16121e' },
      cloud: { col: '#3a1a2a', shade: '#261020' },
      weather: 'embers',
      front: { col: '#050308', hi: '#1c1422', kind: 'grass' }
    }
  ];

  // ---------- helpers ----------
  function rng(seed) {
    var a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      var t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function hash(n) {
    n = Math.imul(n ^ (n >>> 15), 0x2c1b3c6d);
    n = Math.imul(n ^ (n >>> 12), 0x297a2d39);
    return (n ^ (n >>> 15)) >>> 0;
  }
  function rgb(hex) {
    var n = parseInt(hex.slice(1), 16);
    return [n >> 16 & 255, n >> 8 & 255, n & 255];
  }
  function mod(n, m) { return ((n % m) + m) % m; }
  function px(g, x, y, col) { g.fillStyle = col; g.fillRect(x, y, 1, 1); }
  function bayer(x, y) { return BAYER[(x & 3) + ((y & 3) << 2)]; }

  function ridge(def, s) {
    var r = rng(def.seed), ph = def.amps.map(function () { return r() * 6.2832; });
    var out = new Array(TW), x, i;
    for (x = 0; x < TW; x++) {
      var v = def.base * s;
      for (i = 0; i < def.amps.length; i++) {
        v += def.amps[i][1] * s * Math.sin(6.2832 * def.amps[i][0] * x / TW + ph[i]);
      }
      out[x] = v;
    }
    if (!def.smooth) {
      for (x = 0; x < TW; x++) out[x] = Math.round(out[x - (x % 2)] + (hash(def.seed * 977 + (x >> 1)) % 3) - 1);
    } else {
      for (x = 0; x < TW; x++) out[x] = Math.round(out[x]);
    }
    return out;
  }

  function buildLayer(def, s, kind) {
    var c = S.makeCanvas(TW, LH), g = c.getContext('2d');
    var hs = ridge(def, s), x, d, h, r = rng(def.seed + 99), y;
    for (x = 0; x < TW; x++) {
      h = hs[x];
      g.fillStyle = def.col; g.fillRect(x, LH - h, 1, h);
      px(g, x, LH - h, def.hi);
      // slopes that face away from the light get a dithered shade
      if (hs[(x + 1) % TW] < h || hs[(x + 2) % TW] < h) {
        g.fillStyle = def.shade;
        for (d = 1; d < Math.min(6 + 4 * s, h); d++) if ((x + d) & 1) g.fillRect(x, LH - h + d, 1, 1);
      } else if (kind !== 'haze' && hs[mod(x - 1, TW)] < h) {
        // and the lit side a streak of highlight
        g.fillStyle = def.hi;
        for (d = 1; d < Math.min(4 + 2 * s, h); d++) if ((x + d) % 3 === 0) g.fillRect(x, LH - h + d, 1, 1);
      }
    }
    if (def.texture) {
      g.fillStyle = def.texture;
      for (d = 0; d < 1100 * s; d++) {
        x = Math.floor(r() * TW);
        y = LH - hs[x] + 3 + Math.floor(r() * 34 * s);
        g.fillRect(x, y, 1 + (r() < 0.4 ? 1 : 0), 1);
      }
    }
    if (def.snow) {
      g.fillStyle = def.snow.col;
      for (x = 0; x < TW; x++) {
        var over = hs[x] - def.snow.line * s;
        if (over > 0) g.fillRect(x, LH - hs[x], 1, Math.min(14, Math.round(over * 0.8) + (hash(x + def.seed) % 3)));
      }
    }
    if (def.wall) drawFarWall(g, def, hs);
    if (def.beacon) drawBeacon(g, 150, LH - hs[150], def);
    if (def.trees && def.trees !== 'none') plantTrees(g, def, hs, r);
    if (def.mistCol) {
      // distance haze: thin the foot of the layer into the air colour
      var band = Math.round(26 * s) + 14;
      g.fillStyle = def.mistCol;
      for (y = LH - band; y < LH; y++) {
        var level = Math.min(11, Math.floor((y - (LH - band)) / (band / 12)));
        for (x = 0; x < TW; x++) if (bayer(x, y) < level && LH - hs[x] <= y) g.fillRect(x, y, 1, 1);
      }
    }
    return c;
  }

  /** The wall as seen far away: a pale line along the ridge with watchtowers. */
  function drawFarWall(g, def, hs) {
    var w = def.wall, x, y;
    for (x = 0; x < TW; x++) {
      if (w.ruined && hash((x / 18 | 0) + def.seed) % 3 === 0) continue;
      y = LH - hs[x] - 2;
      g.fillStyle = w.col; g.fillRect(x, y, 1, 2);
      if ((x & 3) < 2) g.fillRect(x, y - 1, 1, 1);
      px(g, x, y + 2, w.dark);
    }
    for (x = 36; x < TW; x += 96) {
      y = LH - hs[x] - 2;
      var th = w.ruined ? 6 : 10;
      g.fillStyle = w.col; g.fillRect(x - 4, y - th, 9, th + 2);
      g.fillStyle = w.dark; g.fillRect(x + 4, y - th, 1, th + 2); g.fillRect(x - 1, y - th + 3, 2, 3);
      if (!w.ruined) {
        g.fillStyle = w.col;
        for (var k = -4; k <= 4; k += 2) g.fillRect(x + k, y - th - 1, 1, 1);
      }
    }
  }

  function drawBeacon(g, x, y, def) {
    g.fillStyle = def.shade; g.fillRect(x - 4, y - 14, 9, 15);
    g.fillStyle = def.hi; g.fillRect(x - 4, y - 14, 1, 15);
    g.fillStyle = '#2a2d55'; g.fillRect(x - 7, y - 16, 15, 2); g.fillRect(x - 4, y - 18, 9, 2);
    px(g, x - 8, y - 17, '#2a2d55'); px(g, x + 8, y - 17, '#2a2d55');
    g.fillStyle = '#fbd38b'; g.fillRect(x - 1, y - 9, 2, 3);
  }

  function plantTrees(g, def, hs, r) {
    var x = 2, cols = def.treeCols;
    while (x < TW - 4) {
      var col = cols[Math.floor(r() * cols.length)];
      var top = LH - hs[x];
      if (def.trees === 'dead') {
        if (r() < 0.35) {
          var dh = 10 + Math.floor(r() * 9), b;
          g.fillStyle = col; g.fillRect(x, top - dh, 1, dh + 1); g.fillRect(x + 1, top - Math.floor(dh / 2), 1, Math.floor(dh / 2) + 1);
          for (b = 0; b < 3; b++) {
            var by0 = top - dh + 2 + b * 3, dir = b % 2 ? 1 : -1, bl = 3 + Math.floor(r() * 4), q;
            for (q = 1; q <= bl; q++) g.fillRect(x + dir * q, by0 - Math.floor(q / 2), 1, 1);
          }
        }
        x += 5 + Math.floor(r() * 9);
      } else if (def.trees === 'pine' || def.trees === 'snowpine') {
        if (r() < (def.trees === 'pine' ? 0.55 : 0.8)) {
          var th = 9 + Math.floor(r() * 8), i;
          for (i = 0; i < th; i++) {
            var w = 1 + 2 * Math.floor(i / 2.2);
            g.fillStyle = col; g.fillRect(x - (w >> 1), top - th + i + 1, w, 1);
            if (def.snowTop && (i < 2 || i % 3 === 0)) { g.fillStyle = def.snowTop; g.fillRect(x - (w >> 1), top - th + i + 1, Math.max(1, w >> 1), 1); }
          }
        }
        x += 4 + Math.floor(r() * 6);
      } else {
        var rad = 4 + Math.floor(r() * 4), dx, dy;
        for (dy = -rad; dy <= rad; dy++) for (dx = -rad; dx <= rad; dx++) {
          if (dx * dx + dy * dy <= rad * rad + 1) {
            var lit = dx + dy < -rad * 0.6;
            px(g, x + dx, top - rad + dy + 1, lit ? def.hi : (dx + dy > rad * 0.7 ? def.shade : col));
          }
        }
        x += rad + 1 + Math.floor(r() * 4);
      }
    }
  }

  function buildSky(st, W, H, horizon) {
    var c = S.makeCanvas(W, H), g = c.getContext('2d');
    var img = g.createImageData(W, H), cols = st.sky.map(rgb), x, y;
    for (y = 0; y < H; y++) {
      var f = Math.min(4.999, Math.max(0, y / horizon * 5)), i = Math.floor(f), frac = f - i;
      for (x = 0; x < W; x++) {
        var c2 = cols[i];
        if (i < 4 && frac > 0.35 && bayer(x, y) / 16 < (frac - 0.35) / 0.65) c2 = cols[i + 1];
        var o = (y * W + x) * 4;
        img.data[o] = c2[0]; img.data[o + 1] = c2[1]; img.data[o + 2] = c2[2]; img.data[o + 3] = 255;
      }
    }
    g.putImageData(img, 0, 0);
    return c;
  }

  /** Sun or moon with a wide dithered glow. */
  function buildDisc(def, moon) {
    var r = def.r, pad = moon ? 12 : 18, size = (r + pad) * 2 + 1, c = S.makeCanvas(size, size), g = c.getContext('2d'), x, y;
    for (y = -r - pad; y <= r + pad; y++) for (x = -r - pad; x <= r + pad; x++) {
      var d = Math.sqrt(x * x + y * y);
      if (d <= r + 0.3) px(g, x + r + pad, y + r + pad, def.col);
      else if (d <= r + pad && bayer(x + 64, y + 64) < (r + pad - d) / pad * 13) px(g, x + r + pad, y + r + pad, def.halo);
    }
    if (moon) {
      g.fillStyle = def.shade;
      [[-5, -4, 4, 3], [3, 1, 5, 4], [-4, 5, 3, 3], [5, -7, 3, 2], [-8, 0, 2, 3], [0, -9, 2, 1]].forEach(function (k) {
        g.fillRect(k[0] + r + pad, k[1] + r + pad, k[2], k[3]);
      });
    }
    return c;
  }

  function buildCloud(def, seed, big) {
    var r = rng(seed), w = (big ? 50 : 26) + Math.floor(r() * 24), h = big ? 15 : 9, c = S.makeCanvas(w, h), g = c.getContext('2d');
    var lumps = [], i, x, y;
    for (i = 0; i < (big ? 6 : 4); i++) lumps.push([5 + r() * (w - 10), h - 1, 5 + r() * (big ? 12 : 7), 3 + r() * (h - 4)]);
    for (y = 0; y < h; y++) for (x = 0; x < w; x++) {
      for (i = 0; i < lumps.length; i++) {
        var l = lumps[i], ex = (x - l[0]) / l[2], ey = (y - l[1]) / l[3];
        if (ex * ex + ey * ey <= 1) { px(g, x, y, y >= h - (big ? 4 : 2) ? def.shade : def.col); break; }
      }
    }
    return c;
  }

  /** A drifting ribbon of mist: thin, uneven, and never dense enough to hide the hills. */
  function buildMist(col, seed) {
    var h = 30, c = S.makeCanvas(TW, h), g = c.getContext('2d'), x, y, r = rng(seed), p1 = r() * 6.28, p2 = r() * 6.28, p3 = r() * 6.28;
    g.fillStyle = col;
    for (x = 0; x < TW; x++) {
      var top = 9 + 6 * Math.sin(6.2832 * 2 * x / TW + p1) + 3 * Math.sin(6.2832 * 5 * x / TW + p2);
      var thick = 0.55 + 0.45 * Math.sin(6.2832 * 3 * x / TW + p3); // the ribbon thins out in places
      for (y = Math.max(0, Math.round(top)); y < h; y++) {
        var rise = Math.min(1, (y - top) / 7), fall = Math.min(1, (h - y) / 9);
        if (bayer(x, y) < 4.5 * rise * fall * thick) g.fillRect(x, y, 1, 1);
      }
    }
    return c;
  }

  function buildWallTile(st, rows) {
    var s = st.stone, c = S.makeCanvas(WALL_TILE, rows), g = c.getContext('2d'), x, y, r = rng(hash(s.mid.length + 5) + 7);
    // merlons (rows 0-6); the gaps stay clear so the country shows through
    for (x = 0; x < WALL_TILE; x++) {
      var m = x % 20;
      if (m < 12) {
        g.fillStyle = s.mid; g.fillRect(x, 0, 1, 7);
        px(g, x, 0, s.cap || s.lit);
        if (m === 0) { g.fillStyle = s.lit; g.fillRect(x, 0, 1, 7); }
        if (m === 11) { g.fillStyle = s.dark; g.fillRect(x, 1, 1, 6); }
        if (m > 1 && m < 10 && (m & 1)) px(g, x, 3, s.dark);
      }
    }
    // parapet band (rows 7-16)
    g.fillStyle = s.mid; g.fillRect(0, 7, WALL_TILE, 10);
    g.fillStyle = s.lit; g.fillRect(0, 7, WALL_TILE, 1);
    g.fillStyle = s.dark; g.fillRect(0, 11, WALL_TILE, 1); g.fillRect(0, 16, WALL_TILE, 1);
    for (x = 0; x < WALL_TILE; x += 12) {
      g.fillStyle = s.dark;
      g.fillRect(x + 5, 8, 1, 3); g.fillRect(x + 11, 12, 1, 4);
      if (r() < 0.3) { g.fillStyle = s.lit; g.fillRect(x + 6, 9, 4, 1); }
    }
    if (s.cap) { g.fillStyle = s.cap; for (x = 0; x < WALL_TILE; x++) if (x % 20 >= 12) g.fillRect(x, 7, 1, 1); }
    // walkway (rows 17-23)
    g.fillStyle = s.floor; g.fillRect(0, 17, WALL_TILE, 7);
    g.fillStyle = s.mid; g.fillRect(0, 17, WALL_TILE, 1);
    g.fillStyle = s.lit; g.fillRect(0, 23, WALL_TILE, 1);
    for (x = 0; x < WALL_TILE; x += 24) {
      g.fillStyle = s.mid;
      g.fillRect(x + 7, 18, 1, 3); g.fillRect(x + 19, 20, 1, 3); g.fillRect(x + 12, 21, 3, 1);
    }
    // outer face (rows 24 down)
    g.fillStyle = s.cap || s.lit; g.fillRect(0, 24, WALL_TILE, 1);
    g.fillStyle = s.line; g.fillRect(0, 25, WALL_TILE, 1);
    for (y = 26; y < rows; y += 5) {
      var off = ((y - 26) / 5) % 2 ? 6 : 0, depth = y - 26;
      for (x = -12; x < WALL_TILE; x += 12) {
        var roll = r(), col = roll < 0.16 ? s.dark : roll > 0.86 ? s.lit : s.mid;
        // the wall falls into shadow towards its foot
        if (depth > 70) col = roll > 0.9 ? s.dark : s.line;
        else if (depth > 34) col = roll > 0.8 ? s.mid : s.dark;
        g.fillStyle = col; g.fillRect(x + off, y, 11, 4);
        if (depth <= 34 && roll > 0.5) { g.fillStyle = s.lit; g.fillRect(x + off, y, 11, 1); }
      }
      g.fillStyle = s.line;
      g.fillRect(0, y + 4, WALL_TILE, 1);
      for (x = -12; x < WALL_TILE; x += 12) g.fillRect(x + off + 11, y, 1, 4);
    }
    // arrow slits
    g.fillStyle = S.OUTLINE;
    for (x = 28; x < WALL_TILE; x += 60) { g.fillRect(x, 33, 2, 8); g.fillRect(x - 1, 36, 4, 2); }
    if (s.moss) {
      g.fillStyle = s.moss;
      for (x = 0; x < 70; x++) g.fillRect(Math.floor(r() * WALL_TILE), 26 + Math.floor(r() * Math.min(60, rows - 26)), 1 + (r() < 0.5 ? 1 : 0), 1);
    }
    return c;
  }

  function tile(g, img, offX, y, W) {
    var x = -mod(Math.round(-offX), img.width);
    for (; x < W; x += img.width) g.drawImage(img, x, Math.round(y));
  }

  // ---------- the scene ----------
  function Scene(canvas) {
    this.canvas = canvas;
    this.g = canvas.getContext('2d');
    this.W = 320; this.H = 200; this.scale = 4;
    this.groundY = 120;
    this.camX = 0;
    this.t = 0;
    this.stage = 1; this.next = -1; this.fade = 0; this.fadeDur = 1.6;
    this.mx = 0; this.my = 0; this.tx = 0; this.ty = 0; this.lastPointer = -99;
    this.skyTop = 0; this.skyTarget = 0; // rows at the top hidden behind the question
    this.calm = false;
    this.cache = {};
    this.buf = null;
    this.masks = null;
    this.weather = null; this.weatherStage = -1;
    this.stars = [];
    var r = rng(4242), i;
    for (i = 0; i < 130; i++) this.stars.push([r(), r() * 0.92, r() * 6.28, r() < 0.18 ? 1 : 0]);
  }

  Scene.STAGES = STAGES;
  Scene.WALK = 260; // pixels of wall between one fight and the next

  /**
   * Fit the drawing to the page. Each scene pixel covers a whole number of device
   * pixels, so the art stays crisp on any screen density. The scene is kept about
   * 300 pixels wide on big screens and never narrower than 185 on phones.
   */
  Scene.prototype.resize = function (cssW, cssH) {
    var dpr = Math.max(1, Math.round((window.devicePixelRatio || 1) * 4) / 4);
    var want = Math.max(2, Math.min(cssW / 300, cssH / 175));
    want = Math.min(want, cssW / 185);
    var k = Math.max(1, Math.round(want * dpr));
    if (cssW / (k / dpr) < 185) k = Math.max(1, Math.floor(cssW / 185 * dpr));
    var scale = k / dpr;
    var W = Math.ceil(cssW / scale), H = Math.ceil(cssH / scale);
    if (W === this.W && H === this.H && scale === this.scale && this.buf) return;
    this.W = W; this.H = H; this.scale = scale;
    this.groundY = Math.round(H * 0.6);
    this.canvas.width = W; this.canvas.height = H;
    this.canvas.style.width = (W * scale) + 'px';
    this.canvas.style.height = (H * scale) + 'px';
    this.g.imageSmoothingEnabled = false;
    this.cache = {};
    this.buf = S.makeCanvas(W, H);
    this.weatherStage = -1;
  };

  Scene.prototype.assets = function (i) {
    var c = this.cache[i];
    if (c) return c;
    var st = STAGES[i], s = Math.max(0.9, Math.min(2.4, this.groundY / 118));
    c = this.cache[i] = {
      sky: buildSky(st, this.W, this.H, this.groundY - 6),
      haze: buildLayer(st.haze, s, 'haze'),
      far: buildLayer(st.far, s, 'far'),
      mid: buildLayer(st.mid, s, 'mid'),
      near: buildLayer(st.near, s, 'near'),
      mist: buildMist(st.mist, i * 5 + 3),
      wall: buildWallTile(st, this.H - this.groundY + TOP + 12),
      disc: st.sun ? buildDisc(st.sun, false) : buildDisc(st.moon, true),
      clouds: st.cloud ? [buildCloud(st.cloud, i * 10 + 1, true), buildCloud(st.cloud, i * 10 + 2, false),
        buildCloud(st.cloud, i * 10 + 3, true), buildCloud(st.cloud, i * 10 + 4, false)] : [],
      s: s
    };
    return c;
  };

  Scene.prototype.setStage = function (i, instant) {
    i = mod(i, STAGES.length);
    if (instant) { this.stage = i; this.next = -1; this.fade = 0; return; }
    if (i === this.stage && this.next < 0) return;
    if (this.next >= 0) { this.stage = this.fade > 0.5 ? this.next : this.stage; }
    if (i === this.stage) { this.next = -1; this.fade = 0; return; }
    this.next = i; this.fade = 0;
  };

  /** The stage whose weather, light and caption should show right now. */
  Scene.prototype.shownStage = function () {
    return this.next >= 0 && this.fade > 0.5 ? this.next : this.stage;
  };

  Scene.prototype.pointer = function (nx, ny) {
    this.tx = Math.max(-1, Math.min(1, nx));
    this.ty = Math.max(-1, Math.min(1, ny));
    this.lastPointer = this.t;
  };

  Scene.prototype.update = function (dt) {
    this.t += dt;
    var tx = this.tx, ty = this.ty;
    if (this.t - this.lastPointer > 4 && !this.calm) {
      // nobody is steering: let the view drift a little so it never sits dead still
      tx = Math.sin(this.t * 0.31) * 0.45; ty = Math.sin(this.t * 0.23 + 1) * 0.3;
    }
    var k = 1 - Math.exp(-dt * 5);
    this.skyTop += (Math.min(this.skyTarget, this.groundY - 90) - this.skyTop) * (1 - Math.exp(-dt * 3));
    this.mx += (tx - this.mx) * k;
    this.my += (ty - this.my) * k;
    if (this.next >= 0) {
      this.fade += dt / this.fadeDur;
      if (this.fade >= 1) { this.stage = this.next; this.next = -1; this.fade = 0; }
    }
    this.stepWeather(dt);
  };

  /** Offset of the wall and everything standing on it. */
  Scene.prototype.plane = function () {
    return { x: Math.round(-this.mx * DEPTH.wall.mx), y: Math.round(-this.my * DEPTH.wall.my) };
  };

  Scene.prototype.drawStage = function (g, i) {
    var st = STAGES[i], a = this.assets(i), W = this.W, H = this.H, gy = this.groundY;
    var mx = this.mx, my = this.my, cam = this.camX, t = this.t, j;
    var base = gy + 2; // layers' feet sit just behind the parapet
    g.drawImage(a.sky, 0, 0);

    if (st.stars) {
      for (j = 0; j < Math.min(st.stars, this.stars.length); j++) {
        var sr = this.stars[j];
        var tw = Math.sin(t * 1.3 + sr[2]);
        if (tw < -0.75) continue;
        g.fillStyle = tw > 0.6 ? '#ffffff' : '#aab6e8';
        g.fillRect(Math.round(sr[0] * W - mx * DEPTH.sky.mx), Math.round(sr[1] * (gy - 34)), 1 + sr[3], 1 + (sr[3] && tw > 0.8 ? 1 : 0));
      }
    }
    var disc = st.sun || st.moon;
    g.drawImage(a.disc,
      Math.round(disc.x * W - a.disc.width / 2 - mx * DEPTH.sky.mx),
      Math.round(this.skyTop + disc.y * (gy - 30 - this.skyTop) - a.disc.height / 2 - my * DEPTH.sky.my));

    for (j = 0; j < a.clouds.length; j++) {
      var cl = a.clouds[j], span = W + 140;
      var cx = mod(j * 173 + 40 - cam * DEPTH.cloud.scroll - t * (1 + j * 0.45) - mx * DEPTH.cloud.mx, span) - 80;
      g.drawImage(cl, Math.round(cx), Math.round(this.skyTop + (gy - 60 - this.skyTop) * (0.08 + 0.17 * j) - my * DEPTH.cloud.my));
    }

    tile(g, a.haze, -(cam * DEPTH.haze.scroll + mx * DEPTH.haze.mx), base - LH - my * DEPTH.haze.my, W);
    tile(g, a.far, -(cam * DEPTH.far.scroll + mx * DEPTH.far.mx), base - LH - my * DEPTH.far.my, W);
    tile(g, a.mid, -(cam * DEPTH.mid.scroll + mx * DEPTH.mid.mx), base - LH - my * DEPTH.mid.my, W);

    if (st.sea) {
      var top = Math.round(base - st.sea.top * a.s - my * 2), rowsN = Math.ceil((gy - top) / 2) + 4;
      g.fillStyle = st.sea.col; g.fillRect(0, top, W, H - top);
      g.fillStyle = st.sea.col2;
      for (j = 0; j < rowsN; j++) if (j % 3 !== 2) g.fillRect(0, top + 1 + j * 2, W, 1);
      var sunX = Math.round(disc.x * W - mx * DEPTH.sky.mx);
      for (j = 0; j < rowsN; j++) {
        var gyy = top + 1 + j * 2, ph = t * (0.8 + (j % 4) * 0.23) + j * 1.7;
        g.fillStyle = st.sea.glint;
        var gx = mod(hash(j * 31 + 5) + Math.sin(ph) * 6 - cam * 0.1 - mx * 6, W + 30) - 15;
        g.fillRect(Math.round(gx), gyy, 3 + (j % 3), 1);
        gx = mod(hash(j * 53 + 9) + Math.cos(ph * 0.8) * 5 - cam * 0.1 - mx * 6, W + 30) - 15;
        g.fillRect(Math.round(gx), gyy, 2 + (j % 2), 1);
        // the sun's road on the water
        g.fillStyle = st.sea.sun;
        var half = 2 + j * 0.8 + Math.sin(ph) * 1.5;
        if ((j + Math.floor(t * 2)) % 3 !== 0) g.fillRect(Math.round(sunX - half), gyy, Math.round(half * 2), 1);
      }
    }

    // mist lies in the valley between the middle hills and the near slope
    tile(g, a.mist, -(cam * DEPTH.mist.scroll + mx * DEPTH.mist.mx + t * 3), base - (st.near.base + 16) * a.s - 8 - my * DEPTH.mist.my, W);
    tile(g, a.near, -(cam * DEPTH.near.scroll + mx * DEPTH.near.mx), base - LH - my * DEPTH.near.my, W);

    // the wall itself
    var p = this.plane();
    tile(g, a.wall, -(cam - p.x), gy - TOP + p.y, W);
    this.drawProps(g, st, p);
  };

  /** The watchtower beside each fight, lantern posts, and banners on the wall face. */
  Scene.prototype.drawProps = function (g, st, p) {
    var gy = this.groundY + p.y, cam = this.camX, W = this.W, t = this.t, n, x;
    var topY = gy - TOP;
    var wx = this.warriorX(), towers = [];
    var first = Math.floor((cam - 160) / Scene.WALK), last = Math.ceil((cam + W + 160) / Scene.WALK);
    for (n = first; n <= last; n++) {
      x = Math.round(n * Scene.WALK + wx - 46 - cam + p.x);
      towers.push(x);
      if (x > -90 && x < W + 90) this.drawTower(g, x, gy, st);
    }
    function clear(px0) { return towers.every(function (tx) { return Math.abs(px0 - tx) > 44; }); }
    first = Math.floor((cam - 30) / 150); last = Math.ceil((cam + W + 30) / 150);
    for (n = first; n <= last; n++) {
      // tattered banner hanging down the wall face
      x = Math.round(n * 150 + 95 - cam + p.x);
      var sway = Math.round(Math.sin(t * 1.6 + n) * 1), k;
      g.fillStyle = S.OUTLINE; g.fillRect(x - 1, gy + 8, 15, 2);
      g.fillStyle = '#6e1420'; g.fillRect(x, gy + 10, 13, 24);
      g.fillStyle = '#4a0d18'; g.fillRect(x + 10, gy + 10, 3, 24);
      for (k = 0; k < 13; k++) {
        var rag = 2 + (hash(n * 13 + k) % 6);
        g.fillStyle = k > 9 ? '#4a0d18' : '#6e1420';
        g.fillRect(x + k, gy + 34, 1, rag + (k % 3 === 0 ? sway : 0));
      }
      g.fillStyle = '#cfc6b0'; // a pale tower on the cloth
      g.fillRect(x + 4, gy + 17, 5, 8); g.fillRect(x + 3, gy + 15, 2, 2); g.fillRect(x + 6, gy + 15, 1, 2); g.fillRect(x + 8, gy + 15, 2, 2);
      g.fillStyle = '#6e1420'; g.fillRect(x + 6, gy + 21, 1, 4);
      // iron brazier on the parapet
      x = Math.round(n * 150 + 20 - cam + p.x);
      if (!clear(x + 2)) continue;
      this.drawTorch(g, x, topY, st, n);
    }
  };

  /** A burning brazier on a post. Its glow reaches further as the light fails. */
  Scene.prototype.drawTorch = function (g, x, topY, st, n) {
    var t = this.t, fy = topY - 24, dx, dy;
    var rr = st.torch + Math.round(Math.sin(t * 9 + n * 3) * 1.2);
    g.fillStyle = st.lit ? 'rgba(255,150,60,0.30)' : 'rgba(255,170,90,0.16)';
    for (dy = -rr; dy <= rr; dy++) for (dx = -rr; dx <= rr; dx++) {
      var dd = dx * dx + dy * dy;
      if (dd <= rr * rr && bayer(x + dx, fy + dy) < 15 - dd / (rr * rr) * 15) g.fillRect(x + 1 + dx, fy - 2 + dy, 1, 1);
    }
    g.fillStyle = '#1b1524'; g.fillRect(x, topY - 20, 2, 20); g.fillRect(x - 3, topY - 22, 8, 2); g.fillRect(x - 2, topY - 20, 6, 1);
    g.fillStyle = '#3a3340'; g.fillRect(x, topY - 20, 1, 20);
    // flame: three lapping tongues
    var f = Math.floor(t * 9 + n) % 3, lean = f - 1;
    g.fillStyle = '#c9382f'; g.fillRect(x - 2, fy - 4, 6, 4); g.fillRect(x - 1 + lean, fy - 7, 4, 3); g.fillRect(x + lean, fy - 9, 2, 2);
    g.fillStyle = '#f08a2c'; g.fillRect(x - 1, fy - 3, 4, 3); g.fillRect(x + lean, fy - 6, 2, 3);
    g.fillStyle = '#ffe08a'; g.fillRect(x, fy - 2, 2, 2); g.fillRect(x + (lean > 0 ? 1 : 0), fy - 4, 1, 2);
    // a spark or two
    var sp = (t * 14 + n * 7) % 14;
    g.fillStyle = '#ffb347'; g.fillRect(x + 1 + Math.round(Math.sin(sp + n) * 3), Math.round(fy - 9 - sp), 1, 1);
  };

  Scene.prototype.drawTower = function (g, cx, gy, st) {
    var s = st.stone, w = 64, x0 = cx - 32, top = gy - TOP - 42, y, x;
    g.fillStyle = s.mid; g.fillRect(x0, top, w, gy - top);
    g.fillStyle = s.lit; g.fillRect(x0, top, 3, gy - top); g.fillRect(x0, top, w, 1);
    g.fillStyle = s.dark; g.fillRect(x0 + w - 3, top, 3, gy - top);
    for (y = top + 6; y < gy - 2; y += 6) {
      g.fillStyle = s.dark;
      for (x = x0 + 5 + (((y - top) / 6) % 2 ? 6 : 0); x < x0 + w - 6; x += 12) g.fillRect(x, y, 6, 1);
    }
    // battlements
    for (x = x0; x < x0 + w; x += 13) {
      g.fillStyle = s.mid; g.fillRect(x, top - 6, 9, 6);
      g.fillStyle = s.cap || s.lit; g.fillRect(x, top - 6, 9, 1);
      g.fillStyle = s.dark; g.fillRect(x + 8, top - 5, 1, 5);
    }
    // arched windows and the doorway
    for (x = x0 + 10; x < x0 + w - 12; x += 18) {
      g.fillStyle = S.OUTLINE; g.fillRect(x, top + 10, 8, 12); g.fillRect(x + 1, top + 9, 6, 1); g.fillRect(x + 2, top + 8, 4, 1);
      if (st.lit) { g.fillStyle = '#f08a2c'; g.fillRect(x + 1, top + 12, 6, 9); g.fillStyle = '#ffd27a'; g.fillRect(x + 2, top + 14, 4, 5); }
      g.fillStyle = s.lit; g.fillRect(x - 1, top + 22, 10, 1);
    }
    g.fillStyle = S.OUTLINE;
    g.fillRect(cx - 9, gy - 26, 18, 26); g.fillRect(cx - 8, gy - 27, 16, 1); g.fillRect(cx - 6, gy - 28, 12, 1); g.fillRect(cx - 4, gy - 29, 8, 1);
    g.fillStyle = s.dark; g.fillRect(cx - 11, gy - 26, 2, 26); g.fillRect(cx + 9, gy - 26, 2, 26);
    // pointed slate roof with a pennant
    var ry = top - 6, rh = 26, half, q;
    for (q = 0; q < rh; q++) {
      half = Math.round((q + 1) / rh * (w / 2 + 6));
      g.fillStyle = '#2a2c3c'; g.fillRect(cx - half, ry - rh + q, half * 2, 1);
      g.fillStyle = '#1d1f2c'; g.fillRect(cx + Math.round(half * 0.25), ry - rh + q, half - Math.round(half * 0.25), 1);
      if (q % 4 === 3) { g.fillStyle = '#3d4054'; g.fillRect(cx - half, ry - rh + q, Math.round(half * 1.2), 1); }
    }
    if (s.cap) { g.fillStyle = s.cap; for (q = 0; q < rh; q += 1) { half = Math.round((q + 1) / rh * (w / 2 + 6)); if (q < 7 || q % 5 === 0) g.fillRect(cx - half, ry - rh + q, Math.max(1, Math.round(half * 0.7)), 1); } }
    g.fillStyle = S.OUTLINE; g.fillRect(cx, ry - rh - 11, 1, 11);
    var wv = Math.floor(this.t * 6) % 2;
    g.fillStyle = '#8f1d2c'; g.fillRect(cx - 8, ry - rh - 11 + wv, 8, 2); g.fillRect(cx - 6, ry - rh - 9, 6, 2); g.fillRect(cx - 4, ry - rh - 7 - wv + 1, 4, 1);
  };

  /** Where the warrior stands, in scene pixels (before the pointer offset). */
  Scene.prototype.warriorX = function () {
    return Math.max(34, Math.round(this.W * 0.19));
  };

  /** Everything behind the characters. During a stage change, the new stage dissolves in. */
  Scene.prototype.drawBack = function () {
    var g = this.g;
    this.drawStage(g, this.stage);
    if (this.next >= 0 && this.fade > 0) {
      var b = this.buf.getContext('2d');
      b.globalCompositeOperation = 'source-over';
      this.drawStage(b, this.next);
      b.globalCompositeOperation = 'destination-in';
      b.fillStyle = this.mask(Math.max(1, Math.min(16, Math.ceil(this.fade * 16))));
      b.fillRect(0, 0, this.W, this.H);
      b.globalCompositeOperation = 'source-over';
      g.drawImage(this.buf, 0, 0);
    }
  };

  Scene.prototype.mask = function (level) {
    if (!this.masks) this.masks = {};
    if (!this.masks[level]) {
      var c = S.makeCanvas(4, 4), g = c.getContext('2d'), i;
      g.fillStyle = '#000';
      for (i = 0; i < 16; i++) if (BAYER[i] < level) g.fillRect(i & 3, i >> 2, 1, 1);
      this.masks[level] = this.g.createPattern(c, 'repeat');
    }
    return this.masks[level];
  };

  // ---------- weather ----------
  Scene.prototype.stepWeather = function (dt) {
    var i = this.shownStage(), kind = STAGES[i].weather, W = this.W, n, p, floor = this.groundY + 30;
    if (this.weatherStage !== i) {
      this.weatherStage = i;
      var area = Math.max(1, W * floor / 30000);
      var count = Math.round(({ crows: 5, rain: 70, leaves: 20, snow: 60, embers: 26 }[kind] || 0) * area);
      if (this.calm) count = Math.ceil(count / 3);
      var r = rng(i * 77 + 3);
      this.weather = [];
      for (n = 0; n < count; n++) this.weather.push({ x: r() * W, y: r() * floor, a: r() * 6.28, s: 0.5 + r(), k: Math.floor(r() * 3) });
    }
    for (n = 0; n < this.weather.length; n++) {
      p = this.weather[n];
      p.a += dt * (1 + p.s);
      if (kind === 'crows') { p.x -= dt * (7 + p.s * 5); p.y += Math.sin(p.a * 0.7) * dt * 2; if (p.y > floor * 0.5) p.y = floor * 0.15; }
      else if (kind === 'rain') { p.x -= dt * 50; p.y += dt * (150 + p.s * 40); }
      else if (kind === 'leaves') { p.x -= dt * (9 + p.s * 8) + Math.sin(p.a * 1.4) * dt * 6; p.y += dt * (9 + p.s * 6); }
      else if (kind === 'snow') { p.x -= dt * (4 + p.s * 5) + Math.sin(p.a) * dt * 4; p.y += dt * (12 + p.s * 10); }
      else if (kind === 'embers') { p.x -= dt * (6 + p.s * 6) + Math.sin(p.a) * dt * 5; p.y -= dt * (10 + p.s * 9); }
      if (p.x < -6) p.x += W + 12; if (p.x > W + 6) p.x -= W + 12;
      if (p.y > floor) p.y = -3; if (p.y < -4) p.y = floor - 2;
    }
  };

  /** Everything in front of the characters: weather, then plants close to the eye. */
  Scene.prototype.drawFront = function () {
    var g = this.g, i = this.shownStage(), st = STAGES[i], kind = st.weather, n, p, W = this.W, H = this.H;
    var ox = -this.mx * 8, oy = -this.my * 2;
    for (n = 0; n < (this.weather ? this.weather.length : 0); n++) {
      p = this.weather[n];
      var x = Math.round(mod(p.x + ox, W + 12) - 6), y = Math.round(p.y + oy);
      if (kind === 'crows') {
        g.fillStyle = '#0c0a12';
        var up = Math.sin(p.a * 2.2) > 0;
        g.fillRect(x, y, 1, 1); g.fillRect(x - 1, y + (up ? -1 : 0), 1, 1); g.fillRect(x + 1, y + (up ? -1 : 0), 1, 1);
        g.fillRect(x - 2, y + (up ? -1 : 1), 1, 1); g.fillRect(x + 2, y + (up ? -1 : 1), 1, 1);
      } else if (kind === 'rain') {
        g.fillStyle = p.k ? 'rgba(210,225,232,0.55)' : 'rgba(170,190,200,0.4)';
        g.fillRect(x, y, 1, 2); g.fillRect(x - 1, y + 2, 1, 2);
      } else if (kind === 'leaves') {
        g.fillStyle = ['#c96a2e', '#b8452e', '#8f2f2a'][p.k];
        g.fillRect(x, y, 2, 1); if (Math.sin(p.a * 3) > 0) g.fillRect(x + 1, y + 1, 1, 1); else g.fillRect(x, y - 1, 1, 1);
      } else if (kind === 'snow') {
        g.fillStyle = '#ffffff'; g.fillRect(x, y, p.k === 0 ? 2 : 1, p.k === 0 ? 2 : 1);
      } else if (kind === 'embers') {
        if (Math.sin(p.a * 2.3) > -0.4) { g.fillStyle = Math.sin(p.a * 2.3) > 0.5 ? '#ffd27a' : (p.k ? '#f08a2c' : '#c9382f'); g.fillRect(x, y, 1, 1); }
      }
    }
    // undergrowth near the eye slides fastest of all
    var f = st.front, cam = this.camX * DEPTH.front.scroll + this.mx * DEPTH.front.mx;
    var fy = H + 4 - Math.round(this.my * DEPTH.front.my);
    var first = Math.floor((cam - 60) / 190), last = Math.ceil((cam + W + 60) / 190);
    for (n = first; n <= last; n++) {
      var bx = Math.round(n * 190 + (hash(n + i * 31) % 80) - cam);
      this.drawPlant(g, bx, fy, 13 + hash(n * 7 + i) % 9, f, n);
    }
  };

  Scene.prototype.drawPlant = function (g, x, y, size, f, n) {
    var dx, dy, k;
    if (f.kind === 'bush') {
      for (k = -1; k <= 1; k++) {
        var r = size - Math.abs(k) * 4, cx = x + k * (size - 2);
        for (dy = -r; dy <= 0; dy++) for (dx = -r; dx <= r; dx++) {
          if (dx * dx + dy * dy <= r * r) px(g, cx + dx, y + dy, (dx + dy < -r * 0.9 && ((dx + dy) & 1)) ? f.hi : f.col);
        }
      }
    } else {
      for (k = 0; k < 16; k++) {
        var gh = 6 + (hash(n * 17 + k) % size), gx = x + k * 2 - 16, lean = Math.round(Math.sin(this.t * 1.3 + k) * 1);
        g.fillStyle = k % 3 ? f.col : f.hi; g.fillRect(gx, y - gh, 1, gh); g.fillRect(gx + lean, y - gh - 2, 1, 2);
      }
    }
  };

  WW.Scene = Scene;
})(typeof globalThis !== 'undefined' ? globalThis : this);
