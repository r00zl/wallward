/* Wallward scenery.
 *
 * Draws the wall and the country behind it at low resolution, in layers that
 * slide at different speeds as the warrior walks and as the pointer moves.
 * Five stretches of wall (stages) run from a sea gate at dawn to a desert gate
 * at night; one dissolves into the next with a dither while the warrior walks.
 */
(function (root) {
  'use strict';
  var WW = root.WW = root.WW || {};
  var S = WW.Sprites;

  var TW = 384;        // background layers repeat every TW pixels
  var LH = 120;        // height of a background layer
  var WALL_TILE = 112; // the wall repeats every 112 pixels (merlons every 14, bricks every 8)
  var BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];

  // How far each layer follows the walk (scroll) and the pointer (mx, my), in pixels.
  var DEPTH = {
    sky:   { scroll: 0.01, mx: 1,  my: 0.5 },
    cloud: { scroll: 0.04, mx: 2,  my: 0.5 },
    far:   { scroll: 0.06, mx: 3,  my: 1 },
    mid:   { scroll: 0.14, mx: 5,  my: 1.5 },
    near:  { scroll: 0.34, mx: 8,  my: 2 },
    wall:  { scroll: 1,    mx: 11, my: 2.5 },
    front: { scroll: 1.7,  mx: 19, my: 4 }
  };

  var STAGES = [
    {
      name: 'Sea Gate', time: 'dawn',
      sky: ['#2a3566', '#5a5a9c', '#b96a93', '#f0a07a', '#fbd9a0'],
      sun: { x: 0.7, y: 0.6, r: 9, col: '#fff3c4', halo: '#fde0a0' },
      far: { col: '#7d78ad', hi: '#9a93c2', shade: '#6a6699', base: 60, amps: [[2, 9], [5, 5], [11, 2]], seed: 11, haze: '#c98aa0' },
      mid: { col: '#565f98', hi: '#7780b4', shade: '#454c80', base: 46, amps: [[3, 5], [7, 3], [13, 1.5]], seed: 12, haze: '#8a7fae', beacon: true },
      sea: { top: 38, col: '#3d6aa5', col2: '#4b7ab6', glint: '#a8d5ea', sun: '#fbd38b' },
      near: { col: '#27405a', hi: '#3a5873', shade: '#1c3047', base: 26, amps: [[2, 9], [5, 5], [9, 2]], seed: 13, trees: 'pine', treeCols: ['#1f3a4a', '#2b4d5c'] },
      stone: { lit: '#b9aeaa', mid: '#90868b', dark: '#6a606c', floor: '#c9bfb6', line: '#514858' },
      cloud: { col: '#f6c9b0', shade: '#d99aa0' },
      weather: 'gulls',
      front: { col: '#16293a', hi: '#2f4c63', kind: 'bush' }
    },
    {
      name: 'Green Ridges', time: 'midday',
      sky: ['#3f8fd6', '#5fa6e4', '#86c1ee', '#b7dcf5', '#e2f2fa'],
      sun: { x: 0.18, y: 0.2, r: 7, col: '#fffbe0', halo: '#ffffff' },
      far: { col: '#9cc0d6', hi: '#b9d6e6', shade: '#86aec6', base: 66, amps: [[2, 10], [5, 6], [9, 3]], seed: 21, haze: '#d4e8f3' },
      mid: { col: '#5d9e78', hi: '#7fbb93', shade: '#4a8765', base: 50, amps: [[3, 7], [6, 4], [11, 2]], seed: 22, haze: '#8fc0a4',
        wall: { col: '#e6dcc0', dark: '#a89c82' }, texture: '#4f8f6b' },
      near: { col: '#2f7a4c', hi: '#49a064', shade: '#22603a', base: 30, amps: [[2, 6], [5, 4], [9, 2]], seed: 23, trees: 'leaf', treeCols: ['#256b40', '#3a8f58', '#1d5634'] },
      stone: { lit: '#c9c1b1', mid: '#a0998f', dark: '#77716f', floor: '#d9d1c0', line: '#5a5560', moss: '#6f9a5a' },
      cloud: { col: '#ffffff', shade: '#d5e8f5' },
      weather: 'pollen',
      front: { col: '#17482b', hi: '#2f7a4c', kind: 'bush' }
    },
    {
      name: 'Maple Pass', time: 'afternoon',
      sky: ['#5878b6', '#8ea2c9', '#e9c08c', '#f6d49c', '#fdeac6'],
      sun: { x: 0.78, y: 0.55, r: 8, col: '#fff0b8', halo: '#fde2a0' },
      far: { col: '#b59a94', hi: '#cdb5ac', shade: '#9f8581', base: 64, amps: [[2, 9], [4, 6], [10, 3]], seed: 31, haze: '#ecd0a8' },
      mid: { col: '#c87a3e', hi: '#e39a55', shade: '#a8602f', base: 50, amps: [[3, 7], [7, 4], [12, 2]], seed: 32, haze: '#dba066',
        wall: { col: '#f0e2c0', dark: '#b39a78' }, texture: '#b5672f' },
      near: { col: '#a2452b', hi: '#d9622f', shade: '#7d3222', base: 30, amps: [[2, 6], [5, 4], [8, 2]], seed: 33, trees: 'maple', treeCols: ['#d9622f', '#e8a13a', '#b8392a', '#8f2f25'] },
      stone: { lit: '#ccb99a', mid: '#a38f77', dark: '#7a695d', floor: '#dccdac', line: '#5c4f4c' },
      cloud: { col: '#fff1d6', shade: '#e9c9a0' },
      weather: 'leaves',
      front: { col: '#5e2318', hi: '#b8392a', kind: 'bush' }
    },
    {
      name: 'Snow Line', time: 'dusk',
      sky: ['#2b2d5c', '#524d8a', '#96699e', '#dc8793', '#f5c0a0'],
      sun: { x: 0.3, y: 0.95, r: 9, col: '#ffd3a6', halo: '#f7b79a' },
      far: { col: '#8d91c2', hi: '#aab0da', shade: '#777bb0', base: 68, amps: [[2, 12], [5, 7], [9, 3]], seed: 41, haze: '#c79ab0', snow: { line: 58, col: '#f0f3ff' } },
      mid: { col: '#666ca6', hi: '#8990c4', shade: '#52578e', base: 52, amps: [[3, 8], [7, 5], [12, 2]], seed: 42, haze: '#8f86b8',
        wall: { col: '#d6daf0', dark: '#8a8fb8' }, snow: { line: 50, col: '#e6ebfb' } },
      near: { col: '#3a416e', hi: '#565e92', shade: '#2a3058', base: 30, amps: [[2, 6], [5, 4], [9, 2]], seed: 43, trees: 'snowpine', treeCols: ['#2a3058', '#343b68'], snowTop: '#e6ebfb' },
      stone: { lit: '#aeb3ca', mid: '#8389a8', dark: '#5d6284', floor: '#c7ccdf', line: '#44486a', cap: '#f3f6ff' },
      cloud: { col: '#c9a4c0', shade: '#9a7aa8' },
      weather: 'snow', lit: true,
      front: { col: '#1f2446', hi: '#e6ebfb', kind: 'bush' }
    },
    {
      name: 'Desert Gate', time: 'night',
      sky: ['#0b0e22', '#131938', '#1d2852', '#2a3a6c', '#414d86'],
      moon: { x: 0.76, y: 0.3, r: 10, col: '#f4f1d4', shade: '#cfcbb0', halo: '#5d6aa0' },
      stars: 70,
      far: { col: '#2b305c', hi: '#3a4072', shade: '#23274e', base: 60, amps: [[1, 8], [3, 6], [5, 3]], seed: 51, smooth: true, haze: '#3c477c' },
      mid: { col: '#3b3764', hi: '#4d4a7a', shade: '#2f2b54', base: 46, amps: [[2, 7], [4, 4], [7, 2]], seed: 52, smooth: true, haze: '#3f3d70',
        wall: { col: '#6c6088', dark: '#4a4266', ruined: true }, camels: true },
      near: { col: '#1f1c3a', hi: '#2f2b54', shade: '#17142e', base: 28, amps: [[1, 6], [3, 4], [6, 2]], seed: 53, smooth: true, trees: 'none' },
      stone: { lit: '#7b769e', mid: '#5a567c', dark: '#3e3b5c', floor: '#8e89b0', line: '#2b2944' },
      cloud: null,
      weather: 'fireflies', lit: true,
      front: { col: '#100e22', hi: '#2f2b54', kind: 'grass' }
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
      // chunkier, rockier outline
      for (x = 0; x < TW; x++) out[x] = Math.round(out[x - (x % 2)] + (hash(def.seed * 977 + (x >> 1)) % 3) - 1);
    } else {
      for (x = 0; x < TW; x++) out[x] = Math.round(out[x]);
    }
    return out;
  }

  function buildLayer(def, s, kind) {
    var c = S.makeCanvas(TW, LH), g = c.getContext('2d');
    var hs = ridge(def, s), x, d, h, r = rng(def.seed + 99);
    for (x = 0; x < TW; x++) {
      h = hs[x];
      g.fillStyle = def.col; g.fillRect(x, LH - h, 1, h);
      px(g, x, LH - h, def.hi);
      // slopes that face away from the light get a dithered shade
      if (hs[(x + 1) % TW] < h || hs[(x + 2) % TW] < h) {
        g.fillStyle = def.shade;
        for (d = 1; d < Math.min(8, h); d++) if ((x + d) & 1) g.fillRect(x, LH - h + d, 1, 1);
      }
    }
    if (def.texture) {
      g.fillStyle = def.texture;
      for (d = 0; d < 900; d++) {
        x = Math.floor(r() * TW);
        var ty = LH - hs[x] + 3 + Math.floor(r() * 30);
        g.fillRect(x, ty, 1 + (r() < 0.4 ? 1 : 0), 1);
      }
    }
    if (def.snow) {
      g.fillStyle = def.snow.col;
      for (x = 0; x < TW; x++) {
        var over = hs[x] - def.snow.line * s;
        if (over > 0) g.fillRect(x, LH - hs[x], 1, Math.min(10, Math.round(over * 0.8) + (hash(x + def.seed) % 3)));
      }
    }
    if (def.wall) drawFarWall(g, def, hs);
    if (def.beacon) drawBeacon(g, 150, LH - hs[150], def);
    if (def.camels) for (d = 0; d < 3; d++) drawCamel(g, 236 + d * 11, LH - hs[236 + d * 11], def.shade);
    if (def.trees && def.trees !== 'none') plantTrees(g, def, hs, r);
    if (def.haze && kind !== 'near') {
      // distance haze: thin the bottom of the layer into the sky colour
      g.fillStyle = def.haze;
      for (var y = LH - 30; y < LH; y++) {
        var level = Math.min(10, Math.floor((y - (LH - 30)) / 2.2));
        for (x = 0; x < TW; x++) if (BAYER[(x & 3) + ((y & 3) << 2)] < level && LH - hs[x] <= y) g.fillRect(x, y, 1, 1);
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
      var th = w.ruined ? 5 : 8;
      g.fillStyle = w.col; g.fillRect(x - 3, y - th, 7, th + 2);
      g.fillStyle = w.dark; g.fillRect(x + 3, y - th, 1, th + 2);
      px(g, x, y - th + 3, w.dark);
      if (!w.ruined) {
        g.fillStyle = w.col;
        g.fillRect(x - 3, y - th - 1, 1, 1); g.fillRect(x - 1, y - th - 1, 1, 1);
        g.fillRect(x + 1, y - th - 1, 1, 1); g.fillRect(x + 3, y - th - 1, 1, 1);
      }
    }
  }

  function drawBeacon(g, x, y, def) {
    g.fillStyle = def.shade; g.fillRect(x - 3, y - 11, 7, 12);
    g.fillStyle = def.hi; g.fillRect(x - 3, y - 11, 1, 12);
    g.fillStyle = '#2a2d55'; g.fillRect(x - 5, y - 13, 11, 2); g.fillRect(x - 3, y - 15, 7, 2);
    px(g, x - 6, y - 14, '#2a2d55'); px(g, x + 6, y - 14, '#2a2d55');
    px(g, x, y - 7, '#fbd38b');
  }

  function drawCamel(g, x, y, col) {
    g.fillStyle = col;
    g.fillRect(x, y - 4, 5, 2); g.fillRect(x + 1, y - 5, 2, 1);
    g.fillRect(x + 4, y - 6, 1, 3); g.fillRect(x + 5, y - 6, 1, 1);
    g.fillRect(x, y - 2, 1, 2); g.fillRect(x + 3, y - 2, 1, 2);
  }

  function plantTrees(g, def, hs, r) {
    var x = 2, cols = def.treeCols;
    while (x < TW - 4) {
      var col = cols[Math.floor(r() * cols.length)];
      var top = LH - hs[x];
      if (def.trees === 'pine' || def.trees === 'snowpine') {
        if (r() < (def.trees === 'pine' ? 0.5 : 0.8)) {
          var th = 7 + Math.floor(r() * 5), i;
          for (i = 0; i < th; i++) {
            var w = 1 + 2 * Math.floor(i / 2.2);
            g.fillStyle = col; g.fillRect(x - (w >> 1), top - th + i + 1, w, 1);
            if (def.snowTop && (i < 2 || i % 3 === 0)) { g.fillStyle = def.snowTop; g.fillRect(x - (w >> 1), top - th + i + 1, Math.max(1, w >> 1), 1); }
          }
        }
        x += 4 + Math.floor(r() * 6);
      } else {
        var rad = 3 + Math.floor(r() * 3), dx, dy;
        for (dy = -rad; dy <= rad; dy++) for (dx = -rad; dx <= rad; dx++) {
          if (dx * dx + dy * dy <= rad * rad + 1) {
            var lit = dx + dy < -rad * 0.6;
            px(g, x + dx, top - rad + dy + 1, lit ? def.hi : col);
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
        if (i < 4 && frac > 0.45 && BAYER[(x & 3) + ((y & 3) << 2)] / 16 < (frac - 0.45) / 0.55) c2 = cols[i + 1];
        var o = (y * W + x) * 4;
        img.data[o] = c2[0]; img.data[o + 1] = c2[1]; img.data[o + 2] = c2[2]; img.data[o + 3] = 255;
      }
    }
    g.putImageData(img, 0, 0);
    return c;
  }

  function buildDisc(def, moon) {
    var r = def.r, pad = 6, size = (r + pad) * 2 + 1, c = S.makeCanvas(size, size), g = c.getContext('2d'), x, y;
    for (y = -r - pad; y <= r + pad; y++) for (x = -r - pad; x <= r + pad; x++) {
      var d = Math.sqrt(x * x + y * y);
      if (d <= r + 0.3) px(g, x + r + pad, y + r + pad, def.col);
      else if (d <= r + pad && BAYER[((x + 64) & 3) + (((y + 64) & 3) << 2)] < (r + pad - d) * 2.2) px(g, x + r + pad, y + r + pad, def.halo);
    }
    if (moon) {
      g.fillStyle = def.shade;
      [[-4, -3, 3, 2], [2, 1, 4, 3], [-3, 4, 2, 2], [4, -5, 2, 1], [-6, 0, 1, 2]].forEach(function (k) {
        g.fillRect(k[0] + r + pad, k[1] + r + pad, k[2], k[3]);
      });
    }
    return c;
  }

  function buildCloud(def, seed) {
    var r = rng(seed), w = 26 + Math.floor(r() * 20), h = 9, c = S.makeCanvas(w, h), g = c.getContext('2d');
    var lumps = [], i, x, y;
    for (i = 0; i < 4; i++) lumps.push([4 + r() * (w - 8), h - 1, 4 + r() * 7, 3 + r() * 5]);
    for (y = 0; y < h; y++) for (x = 0; x < w; x++) {
      for (i = 0; i < lumps.length; i++) {
        var l = lumps[i], ex = (x - l[0]) / l[2], ey = (y - l[1]) / l[3];
        if (ex * ex + ey * ey <= 1) { px(g, x, y, y >= h - 2 ? def.shade : def.col); break; }
      }
    }
    return c;
  }

  function buildWallTile(st, rows) {
    var s = st.stone, c = S.makeCanvas(WALL_TILE, rows), g = c.getContext('2d'), x, y, r = rng(hash(s.mid.length + rows) + 7);
    // merlons (rows 0-4); the gaps stay clear so the country shows through
    for (x = 0; x < WALL_TILE; x++) {
      var m = x % 14;
      if (m < 9) {
        g.fillStyle = s.mid; g.fillRect(x, 0, 1, 5);
        px(g, x, 0, st.stone.cap || s.lit);
        if (m === 0) { g.fillStyle = s.lit; g.fillRect(x, 0, 1, 5); }
        if (m === 8) { g.fillStyle = s.dark; g.fillRect(x, 1, 1, 4); }
      }
    }
    // parapet band (rows 5-11)
    g.fillStyle = s.mid; g.fillRect(0, 5, WALL_TILE, 7);
    g.fillStyle = s.lit; g.fillRect(0, 5, WALL_TILE, 1);
    g.fillStyle = s.dark; g.fillRect(0, 8, WALL_TILE, 1); g.fillRect(0, 11, WALL_TILE, 1);
    for (x = 0; x < WALL_TILE; x += 8) { px(g, x + 3, 6, s.dark); px(g, x + 3, 7, s.dark); px(g, x + 7, 9, s.dark); px(g, x + 7, 10, s.dark); }
    if (s.cap) { g.fillStyle = s.cap; for (x = 0; x < WALL_TILE; x++) if (x % 14 >= 9) g.fillRect(x, 5, 1, 1); }
    // walkway (rows 12-15)
    g.fillStyle = s.floor; g.fillRect(0, 12, WALL_TILE, 4);
    g.fillStyle = s.lit; g.fillRect(0, 15, WALL_TILE, 1);
    for (x = 0; x < WALL_TILE; x += 16) { px(g, x + 5, 13, s.mid); px(g, x + 5, 14, s.mid); px(g, x + 13, 12, s.mid); px(g, x + 13, 13, s.mid); }
    // outer face (rows 16+)
    g.fillStyle = s.cap || s.lit; g.fillRect(0, 16, WALL_TILE, 1);
    g.fillStyle = s.line; g.fillRect(0, 17, WALL_TILE, 1);
    for (y = 18; y < rows; y += 4) {
      var off = ((y - 18) / 4) % 2 ? 4 : 0, deep = y > 30;
      for (x = -8; x < WALL_TILE; x += 8) {
        var roll = r();
        g.fillStyle = deep ? s.dark : roll < 0.16 ? s.dark : roll > 0.86 ? s.lit : s.mid;
        g.fillRect(x + off, y, 7, 3);
      }
      g.fillStyle = s.line;
      g.fillRect(0, y + 3, WALL_TILE, 1);
      for (x = -8; x < WALL_TILE; x += 8) g.fillRect(x + off + 7, y, 1, 3);
    }
    if (s.moss) {
      g.fillStyle = s.moss;
      for (x = 0; x < 46; x++) g.fillRect(Math.floor(r() * WALL_TILE), 18 + Math.floor(r() * (rows - 18)), 1 + (r() < 0.5 ? 1 : 0), 1);
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
    this.W = 320; this.H = 130; this.scale = 3;
    this.groundY = 110;
    this.camX = 0;
    this.t = 0;
    this.stage = 1; this.next = -1; this.fade = 0; this.fadeDur = 1.6;
    this.mx = 0; this.my = 0; this.tx = 0; this.ty = 0; this.lastPointer = -99;
    this.calm = false;
    this.cache = {};
    this.buf = null;
    this.masks = null;
    this.weather = null; this.weatherStage = -1;
    this.stars = [];
    var r = rng(4242), i;
    for (i = 0; i < 90; i++) this.stars.push([r(), r() * 0.8, r() * 6.28, r() < 0.2 ? 1 : 0]);
  }

  Scene.STAGES = STAGES;
  Scene.WALK = 230; // pixels of wall between one fight and the next

  /**
   * Fit the drawing to a box of CSS pixels. Each scene pixel covers a whole number
   * of device pixels (k), so the art stays crisp on any screen density. Aim for a
   * scene about 128 pixels tall, and between 190 and 440 pixels wide.
   */
  Scene.prototype.resize = function (cssW, cssH) {
    var dpr = Math.max(1, Math.round((window.devicePixelRatio || 1) * 4) / 4);
    var k = Math.max(1, Math.round(cssH / 128 * dpr));
    if (k / dpr < 1.5) k = Math.ceil(1.5 * dpr);
    if (cssW / (k / dpr) > 440) k = Math.ceil(cssW / 440 * dpr);
    if (cssW / (k / dpr) < 190) k = Math.max(1, Math.floor(cssW / 190 * dpr));
    var scale = k / dpr;
    var W = Math.ceil(cssW / scale), H = Math.ceil(cssH / scale);
    if (W === this.W && H === this.H && scale === this.scale && this.buf) return;
    this.W = W; this.H = H; this.scale = scale;
    this.groundY = H - 20;
    this.canvas.width = W; this.canvas.height = H;
    this.canvas.style.width = (W * scale) + 'px';
    this.canvas.style.height = (H * scale) + 'px';
    this.g.imageSmoothingEnabled = false;
    this.cache = {};
    this.buf = S.makeCanvas(W, H);
    this.weatherStage = -1;
  };

  Scene.prototype.assets = function (i) {
    var key = i, c = this.cache[key];
    if (c) return c;
    var st = STAGES[i], s = Math.max(0.85, Math.min(1.3, this.H / 128));
    c = this.cache[key] = {
      sky: buildSky(st, this.W, this.H, this.groundY - 5),
      far: buildLayer(st.far, s, 'far'),
      mid: buildLayer(st.mid, s, 'mid'),
      near: buildLayer(st.near, s, 'near'),
      wall: buildWallTile(st, 44),
      disc: st.sun ? buildDisc(st.sun, false) : buildDisc(st.moon, true),
      clouds: st.cloud ? [buildCloud(st.cloud, i * 10 + 1), buildCloud(st.cloud, i * 10 + 2), buildCloud(st.cloud, i * 10 + 3)] : [],
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

  /** The stage whose weather and caption should show right now. */
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
    var base = gy + 3; // layers' bottoms sit just behind the parapet
    g.drawImage(a.sky, 0, 0);

    if (st.stars) {
      for (j = 0; j < Math.min(st.stars, this.stars.length); j++) {
        var sr = this.stars[j];
        var tw = Math.sin(t * 1.3 + sr[2]);
        if (tw < -0.75) continue;
        g.fillStyle = tw > 0.6 ? '#ffffff' : '#aab6e8';
        g.fillRect(Math.round(sr[0] * W - mx * DEPTH.sky.mx), Math.round(sr[1] * (gy - 30)), 1 + sr[3], 1);
      }
    }
    var disc = st.sun || st.moon;
    g.drawImage(a.disc,
      Math.round(disc.x * W - a.disc.width / 2 - mx * DEPTH.sky.mx - cam * DEPTH.sky.scroll * 0.2),
      Math.round(disc.y * (gy - 22) - a.disc.height / 2 - my * DEPTH.sky.my));

    for (j = 0; j < a.clouds.length; j++) {
      var cl = a.clouds[j], span = W + 90;
      var cx = mod(j * 137 + 40 - cam * DEPTH.cloud.scroll - t * (1.2 + j * 0.5) - mx * DEPTH.cloud.mx, span) - 60;
      g.drawImage(cl, Math.round(cx), Math.round(6 + j * 11 + (gy - 80) * 0.12 * j - my * DEPTH.cloud.my));
    }

    tile(g, a.far, -(cam * DEPTH.far.scroll + mx * DEPTH.far.mx), base - LH - my * DEPTH.far.my, W);
    tile(g, a.mid, -(cam * DEPTH.mid.scroll + mx * DEPTH.mid.mx), base - LH - my * DEPTH.mid.my, W);

    if (st.sea) {
      var top = Math.round(base - st.sea.top * a.s - my * 1.5);
      g.fillStyle = st.sea.col; g.fillRect(0, top, W, H - top);
      g.fillStyle = st.sea.col2;
      for (j = 0; j < 14; j++) if (j % 3 !== 2) g.fillRect(0, top + 1 + j * 2, W, 1);
      var sunX = Math.round(disc.x * W - mx * DEPTH.sky.mx);
      for (j = 0; j < 16; j++) {
        var gyy = top + 1 + j * 2, ph = t * (0.8 + (j % 4) * 0.23) + j * 1.7;
        g.fillStyle = st.sea.glint;
        var gx = mod(hash(j * 31 + 5) + Math.sin(ph) * 6 - cam * 0.1 - mx * 6, W + 30) - 15;
        g.fillRect(Math.round(gx), gyy, 3 + (j % 3), 1);
        gx = mod(hash(j * 53 + 9) + Math.cos(ph * 0.8) * 5 - cam * 0.1 - mx * 6, W + 30) - 15;
        g.fillRect(Math.round(gx), gyy, 2 + (j % 2), 1);
        // the sun's road on the water
        g.fillStyle = st.sea.sun;
        var half = 2 + j * 0.7 + Math.sin(ph) * 1.5;
        if ((j + Math.floor(t * 2)) % 3 !== 0) g.fillRect(Math.round(sunX - half), gyy, Math.round(half * 2), 1);
      }
    }

    tile(g, a.near, -(cam * DEPTH.near.scroll + mx * DEPTH.near.mx), base - LH - my * DEPTH.near.my, W);

    // the wall itself
    var p = this.plane();
    tile(g, a.wall, -(cam - p.x), gy - 12 + p.y, W);
    this.drawProps(g, st, p);
  };

  /** Posts, lanterns, pennants and the watchtower beside each fight. */
  Scene.prototype.drawProps = function (g, st, p) {
    var gy = this.groundY + p.y, cam = this.camX, W = this.W, t = this.t, s = st.stone, n, x;
    var topY = gy - 12;
    // watchtowers stand where the warrior stops
    var wx = this.warriorX(), towers = [];
    var first = Math.floor((cam - 120) / Scene.WALK), last = Math.ceil((cam + W + 120) / Scene.WALK);
    for (n = first; n <= last; n++) {
      x = Math.round(n * Scene.WALK + wx - 34 - cam + p.x);
      towers.push(x);
      if (x > -70 && x < W + 70) this.drawTower(g, x, gy, st);
    }
    function clear(px0) { return towers.every(function (tx) { return Math.abs(px0 - tx) > 30; }); }
    first = Math.floor((cam - 20) / 96); last = Math.ceil((cam + W + 20) / 96);
    for (n = first; n <= last; n++) {
      // lantern post
      x = Math.round(n * 96 + 20 - cam + p.x);
      if (!clear(x + 3)) continue;
      g.fillStyle = s.line;
      g.fillRect(x, topY - 22, 1, 22); g.fillRect(x, topY - 22, 6, 1);
      var lx = x + 5, ly = topY - 21 + (Math.sin(t * 2 + n) > 0.6 ? 1 : 0);
      if (st.lit) {
        var rr = 9 + Math.round(Math.sin(t * 7 + n * 3) * 0.8), dx, dy;
        g.fillStyle = 'rgba(255,176,72,0.30)';
        for (dy = -rr; dy <= rr; dy++) for (dx = -rr; dx <= rr; dx++) {
          var dd = dx * dx + dy * dy;
          if (dd <= rr * rr && BAYER[((lx + dx) & 3) + (((ly + dy) & 3) << 2)] < 15 - dd / (rr * rr) * 15) g.fillRect(lx + dx, ly + 3 + dy, 1, 1);
        }
      }
      g.fillStyle = '#f3c04a'; g.fillRect(lx - 1, ly, 3, 1); g.fillRect(lx - 1, ly + 6, 3, 1);
      g.fillStyle = st.lit ? '#ff7a3a' : '#c9382f'; g.fillRect(lx - 2, ly + 1, 5, 5);
      g.fillStyle = st.lit ? '#ffe08a' : '#e2483b'; g.fillRect(lx - 1, ly + 2, 3, 3);
      px(g, lx, ly + 7, '#f3c04a');
      // pennant
      x = Math.round(n * 96 + 68 - cam + p.x);
      if (!clear(x - 3)) continue;
      g.fillStyle = s.line; g.fillRect(x, topY - 17, 1, 17);
      var wave = Math.floor(t * 5 + n) % 2;
      g.fillStyle = '#c9382f';
      g.fillRect(x - 7, topY - 16 + wave, 7, 1); g.fillRect(x - 6, topY - 15 + wave, 6, 1);
      g.fillRect(x - 5, topY - 14, 5, 1); g.fillRect(x - 3, topY - 13 - wave + 1, 3, 1);
      g.fillStyle = '#f3c04a'; g.fillRect(x - 3, topY - 15 + wave, 2, 1);
    }
  };

  Scene.prototype.drawTower = function (g, cx, gy, st) {
    var s = st.stone, w = 46, x0 = cx - 23, top = gy - 12 - 30, y, x;
    g.fillStyle = s.mid; g.fillRect(x0, top, w, gy - top);
    g.fillStyle = s.lit; g.fillRect(x0, top, 2, gy - top); g.fillRect(x0, top, w, 1);
    g.fillStyle = s.dark; g.fillRect(x0 + w - 2, top, 2, gy - top);
    g.fillStyle = s.dark;
    for (y = top + 5; y < gy - 2; y += 5) for (x = x0 + 3 + ((y - top) % 10 ? 4 : 0); x < x0 + w - 4; x += 8) g.fillRect(x, y, 4, 1);
    // battlements
    for (x = x0; x < x0 + w; x += 9) {
      g.fillStyle = s.mid; g.fillRect(x, top - 4, 6, 4);
      g.fillStyle = s.cap || s.lit; g.fillRect(x, top - 4, 6, 1);
      g.fillStyle = s.dark; g.fillRect(x + 5, top - 3, 1, 3);
    }
    // arched windows and the doorway
    g.fillStyle = S.OUTLINE;
    for (x = x0 + 7; x < x0 + w - 8; x += 13) { g.fillRect(x, top + 8, 5, 8); g.fillRect(x + 1, top + 7, 3, 1); }
    g.fillRect(cx - 6, gy - 17, 12, 17); g.fillRect(cx - 5, gy - 18, 10, 1); g.fillRect(cx - 3, gy - 19, 6, 1);
    if (st.lit) { g.fillStyle = '#ffb048'; for (x = x0 + 7; x < x0 + w - 8; x += 13) g.fillRect(x + 1, top + 10, 3, 5); }
    // roofed lookout on top
    var ry = top - 4;
    g.fillStyle = s.mid; g.fillRect(cx - 12, ry - 9, 24, 9);
    g.fillStyle = s.dark; g.fillRect(cx - 12, ry - 2, 24, 1);
    g.fillStyle = S.OUTLINE; g.fillRect(cx - 8, ry - 7, 4, 5); g.fillRect(cx + 4, ry - 7, 4, 5); g.fillRect(cx - 2, ry - 7, 4, 5);
    g.fillStyle = '#39465a';
    g.fillRect(cx - 17, ry - 11, 34, 2); g.fillRect(cx - 14, ry - 13, 28, 2); g.fillRect(cx - 9, ry - 15, 18, 2);
    g.fillStyle = '#56667c'; g.fillRect(cx - 14, ry - 13, 28, 1); g.fillRect(cx - 9, ry - 15, 18, 1);
    g.fillStyle = '#39465a'; g.fillRect(cx - 19, ry - 12, 2, 1); g.fillRect(cx + 17, ry - 12, 2, 1);
    g.fillRect(cx - 20, ry - 13, 1, 1); g.fillRect(cx + 19, ry - 13, 1, 1);
    if (s.cap) { g.fillStyle = s.cap; g.fillRect(cx - 9, ry - 16, 18, 1); g.fillRect(cx - 14, ry - 14, 5, 1); g.fillRect(cx + 9, ry - 14, 5, 1); }
  };

  /** Where the warrior stands, in scene pixels (before the pointer offset). */
  Scene.prototype.warriorX = function () {
    return Math.max(34, Math.round(this.W * 0.2));
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
    var i = this.shownStage(), kind = STAGES[i].weather, W = this.W, H = this.H, n, p;
    if (this.weatherStage !== i) {
      this.weatherStage = i;
      var count = { gulls: 5, pollen: 16, leaves: 16, snow: 46, fireflies: 14 }[kind] || 0;
      if (this.calm) count = Math.ceil(count / 3);
      var r = rng(i * 77 + 3);
      this.weather = [];
      for (n = 0; n < count; n++) this.weather.push({ x: r() * W, y: r() * (H - 26), a: r() * 6.28, s: 0.5 + r(), k: Math.floor(r() * 3) });
    }
    for (n = 0; n < this.weather.length; n++) {
      p = this.weather[n];
      p.a += dt * (1 + p.s);
      if (kind === 'gulls') { p.x -= dt * (5 + p.s * 4); p.y += Math.sin(p.a * 0.7) * dt * 2; if (p.y > (H - 26) * 0.55) p.y = (H - 26) * 0.2; }
      else if (kind === 'pollen') { p.x -= dt * (3 + p.s * 3); p.y -= dt * (1.5 + Math.sin(p.a) * 3); }
      else if (kind === 'leaves') { p.x -= dt * (9 + p.s * 8) + Math.sin(p.a * 1.4) * dt * 6; p.y += dt * (9 + p.s * 6); }
      else if (kind === 'snow') { p.x -= dt * (4 + p.s * 5) + Math.sin(p.a) * dt * 4; p.y += dt * (12 + p.s * 10); }
      else if (kind === 'fireflies') { p.x += Math.cos(p.a * 0.7) * dt * 5; p.y += Math.sin(p.a * 0.9) * dt * 4; }
      if (p.x < -6) p.x += W + 12; if (p.x > W + 6) p.x -= W + 12;
      if (p.y > H - 22) p.y = -3; if (p.y < -4) p.y = H - 24;
    }
  };

  /** Everything in front of the characters: weather, then plants close to the eye. */
  Scene.prototype.drawFront = function () {
    var g = this.g, i = this.shownStage(), st = STAGES[i], kind = st.weather, n, p, W = this.W, H = this.H;
    var ox = -this.mx * 6, oy = -this.my * 1.5;
    for (n = 0; n < (this.weather ? this.weather.length : 0); n++) {
      p = this.weather[n];
      var x = Math.round(mod(p.x + ox, W + 12) - 6), y = Math.round(p.y + oy);
      if (kind === 'gulls') {
        g.fillStyle = '#f4f0ea';
        var up = Math.sin(p.a * 2.2) > 0;
        g.fillRect(x, y, 1, 1); g.fillRect(x - 1, y + (up ? -1 : 0), 1, 1); g.fillRect(x + 1, y + (up ? -1 : 0), 1, 1);
        g.fillRect(x - 2, y + (up ? -1 : 1), 1, 1); g.fillRect(x + 2, y + (up ? -1 : 1), 1, 1);
      } else if (kind === 'pollen') {
        if (y > H * 0.3) { g.fillStyle = p.k ? '#e6f7b8' : '#c9eaa0'; g.fillRect(x, y, 1, 1); }
      } else if (kind === 'leaves') {
        g.fillStyle = ['#e8a13a', '#d9622f', '#b8392a'][p.k];
        g.fillRect(x, y, 2, 1); if (Math.sin(p.a * 3) > 0) g.fillRect(x + 1, y + 1, 1, 1);
      } else if (kind === 'snow') {
        g.fillStyle = '#ffffff'; g.fillRect(x, y, p.k === 0 ? 2 : 1, 1);
      } else if (kind === 'fireflies') {
        if (Math.sin(p.a * 1.7) > -0.2) { g.fillStyle = Math.sin(p.a * 1.7) > 0.6 ? '#fff6a8' : '#d9c24a'; g.fillRect(x, y, 1, 1); }
      }
    }
    // plants near the eye slide fastest of all
    var f = st.front, cam = this.camX * DEPTH.front.scroll + this.mx * DEPTH.front.mx;
    var fy = H + 3 - Math.round(this.my * DEPTH.front.my);
    var first = Math.floor((cam - 40) / 150), last = Math.ceil((cam + W + 40) / 150);
    for (n = first; n <= last; n++) {
      var bx = Math.round(n * 150 + (hash(n + i * 31) % 70) - cam);
      var size = 9 + hash(n * 7 + i) % 7;
      this.drawPlant(g, bx, fy, size, f, n);
    }
  };

  Scene.prototype.drawPlant = function (g, x, y, size, f, n) {
    var dx, dy, k;
    if (f.kind === 'bush') {
      for (k = -1; k <= 1; k++) {
        var r = size - Math.abs(k) * 3, cx = x + k * (size - 2);
        for (dy = -r; dy <= 0; dy++) for (dx = -r; dx <= r; dx++) {
          if (dx * dx + dy * dy <= r * r) px(g, cx + dx, y + dy, (dx + dy < -r * 0.9 && ((dx + dy) & 1)) ? f.hi : f.col);
        }
      }
    } else if (f.kind === 'reeds') {
      for (k = 0; k < 9; k++) {
        var h = size + (hash(n * 13 + k) % 9), rx = x + k * 3 - 12, lean = Math.round(Math.sin(this.t * 1.4 + k + n) * 1.2);
        g.fillStyle = f.col; g.fillRect(rx, y - h, 1, h);
        g.fillRect(rx + lean, y - h - 3, 1, 3);
        g.fillStyle = f.hi; g.fillRect(rx + lean, y - h - 5, 1, 3);
      }
    } else {
      for (k = 0; k < 11; k++) {
        var gh = 4 + (hash(n * 17 + k) % (size - 2)), gx = x + k * 2 - 11;
        g.fillStyle = k % 3 ? f.col : f.hi; g.fillRect(gx, y - gh, 1, gh);
      }
    }
  };

  WW.Scene = Scene;
})(typeof globalThis !== 'undefined' ? globalThis : this);
