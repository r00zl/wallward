/* Wallward pixel sprites.
 *
 * Every sprite is a small text picture: one character per pixel, looked up in
 * a palette. "." is transparent. Sprites are drawn facing right and mirrored
 * for enemies, which walk towards the left.
 */
(function (root) {
  'use strict';
  var WW = root.WW = root.WW || {};
  var K = '#1b1524'; // shared outline colour

  function makeCanvas(w, h) {
    var c = document.createElement('canvas');
    c.width = w; c.height = h;
    return c;
  }

  /** Paint a text picture into a canvas (optionally onto an existing one at an offset). */
  function paint(rows, pal, target, ox, oy) {
    var w = 0, y, x;
    for (y = 0; y < rows.length; y++) w = Math.max(w, rows[y].length);
    var c = target || makeCanvas(w, rows.length);
    var g = c.getContext('2d');
    for (y = 0; y < rows.length; y++) {
      for (x = 0; x < rows[y].length; x++) {
        var ch = rows[y].charAt(x);
        if (ch === '.' || ch === ' ') continue;
        g.fillStyle = pal[ch] || '#ff00ff';
        g.fillRect((ox || 0) + x, (oy || 0) + y, 1, 1);
      }
    }
    return c;
  }

  function flipped(src) {
    var c = makeCanvas(src.width, src.height), g = c.getContext('2d');
    g.translate(src.width, 0); g.scale(-1, 1); g.drawImage(src, 0, 0);
    return c;
  }

  /** Same shape, one flat colour: used for the white flash when something is hit. */
  function silhouette(src, colour) {
    var c = makeCanvas(src.width, src.height), g = c.getContext('2d');
    g.drawImage(src, 0, 0);
    g.globalCompositeOperation = 'source-in';
    g.fillStyle = colour || '#ffffff';
    g.fillRect(0, 0, c.width, c.height);
    return c;
  }

  // ---------- shared humanoid legs (k outline, p trousers, b boots) ----------
  var LEGS = {
    stand: [
      '...kppkppk',
      '...kppkppk',
      '...kppkppk',
      '...kbbkbbk',
      '...kbbbkbbbk',
      '...kkkkkkkkk'
    ],
    stride: [
      '...kpppppk',
      '..kppkkppk',
      '..kppk.kppk',
      '.kbbk...kbbk',
      '.kbbbk..kbbbk',
      '.kkkkk..kkkkk'
    ],
    pass: [
      '...kpppppk',
      '....kpppk',
      '....kpppk',
      '....kbbbk',
      '....kbbbbk',
      '....kkkkkk'
    ]
  };

  // ---------- the warrior: a wall guard with a bow ----------
  var WARRIOR = {
    pal: { k: K, m: '#d9dfe7', M: '#8f9aab', t: '#e2483b', s: '#f3c9a5', S: '#cf9a78', r: '#c9382f',
      R: '#8b2227', a: '#46526e', A: '#2d3652', g: '#f3c04a', p: '#3d3856', b: '#241e2c', q: '#c9a26b' },
    body: [
      '.....tt',
      '....ttt',
      '......kk',
      '.....kmmk',
      '....kmmmmk',
      '...kmmmmmMk',
      '..kkkkkkkkkk',
      '...ksssssk',
      '...ksssksk',
      '...kssssSk',
      '....kkkkk',
      '.qqkraaark',
      '.qkkraaaark',
      '..kkrgaagrk',
      '...kraaaark',
      '...kAaaaAk',
      '...kRrrrRk'
    ]
  };

  // ---------- enemies ----------
  var RAIDER = {
    pal: { k: K, h: '#6d4c93', H: '#463060', e: '#ffe45c', c: '#8160ab', C: '#573c78', g: '#d9a441',
      s: '#d9b08c', w: '#eef2f7', W: '#aab4c2', p: '#3d2c52', b: '#1f1828' },
    body: [
      '..............w',
      '.....kkkkk....w',
      '....khhhhhk..ww',
      '...khhhhhhhk.w',
      '...khhHHHHHk.w',
      '...khHkkkkkk.w',
      '...khHkekkek.w',
      '...khHkkkkkk.w',
      '....khHHHHk.kgk',
      '...kkcccckkksk',
      '..kcccccccccsk',
      '..kccCggCcckk',
      '..kccCccCcck',
      '...kcCccCck',
      '...kcccccck',
      '...kcCCCCck',
      '....kkkkkk'
    ]
  };

  var CLAY = {
    pal: { k: K, t: '#cd7d52', T: '#98522f', l: '#e6a273', e: '#7ef0d0', p: '#98522f', b: '#6a3a22',
      w: '#dfe6ee', o: '#6b4a2f' },
    body: [
      '.............w',
      '............www',
      '............www',
      '.............o',
      '......kk.....o',
      '.....kTTk....o',
      '....kkttkk...o',
      '...ktlltttk..o',
      '...kttttttk..o',
      '...kttetekk..o',
      '...kttttttk..o',
      '....kTTTTk...o',
      '...kkkkkkkk..o',
      '..ktTtTtTtTk.o',
      '..kttttttttklo',
      '..kTtTtTtTtkko',
      '..kttttttttk.o',
      '...kTtTtTtk..o',
      '...kttttttk..o',
      '...kTTTTTTk..o',
      '....kkkkkk...o'
    ],
    // the spear shaft carries on past the legs
    legExtra: ['.............o', '.............o', '.............o', '.............o', '.............o', '.............o']
  };

  var WRAITH = {
    pal: { k: '#22304f', f: '#d6f3fb', F: '#8fc4dd', d: '#5a8fb3', e: '#ff5c8a' },
    frames: [[
      '......kkkk',
      '....kkffffkk',
      '...kffffffffk',
      '..kffffffffffk',
      '..kffffffffffk',
      '..kfkkkffkkkfk',
      '..kfkekffkekfk',
      '..kffffffffffk',
      '..kfffkkkkfffk',
      '..kFffffffffFk',
      '.kFFffffffffFFk',
      '.kFfffffffffffk',
      'kFFfffffffffFFFk',
      'kFfkfffffffkffFk',
      '.kk.kFfffFfk.kk',
      '....kFfffFfk',
      '....kFffFFfk',
      '...kFFfffFFk',
      '...kFfkFffkFk',
      '...kfk.kFk.kfk',
      '....k...k...k'
    ], [
      '......kkkk',
      '....kkffffkk',
      '...kffffffffk',
      '..kffffffffffk',
      '..kffffffffffk',
      '..kfkkkffkkkfk',
      '..kfkekffkekfk',
      '..kffffffffffk',
      '..kfffkkkkfffk',
      '..kFffffffffFk',
      '.kFFffffffffFFk',
      '.kFfffffffffffk',
      'kFFfffffffffFFFk',
      'kFfkfffffffkffFk',
      '.kk.kFfffFfk.kk',
      '....kFfffFfk',
      '....kFFffFfk',
      '....kFfffFFk',
      '...kfFkfFkFfk',
      '..kfk.kfk.kFk',
      '...k...k...k'
    ]]
  };

  var WOLF = {
    pal: { k: K, g: '#9aa3b5', G: '#687188', w: '#e9edf3', e: '#ff4d4d', n: '#2a2433' },
    body: [
      '................k..k',
      '...............kgkkgk',
      '..............kgggggk',
      '.kk..........kgggeggk',
      'kggk.kkkkkkkkkggggggwk',
      'kgGgkgggggggggggggwwwn',
      '.kGgggggggggggggggkkk',
      '..kggggggggggggggk',
      '..kgGGggggggGGgggk',
      '..kgGkkkkkkkkGggk'
    ],
    legs: [[
      '..kgk.kgk...kgk.kgk',
      '..kgk.kgk...kgk.kgk',
      '..kGk.kGk...kGk.kGk',
      '..kkk.kkk...kkk.kkk'
    ], [
      '.kgk...kgk.kgk...kgk',
      'kgk.....kgkgk.....kgk',
      'kGk.....kGkGk.....kGk',
      'kkk.....kkkkk.....kkk'
    ]]
  };

  var WARLORD = {
    pal: { k: K, i: '#606985', I: '#3a4159', g: '#f0b93a', r: '#b3262b', R: '#7a1820', e: '#ff8a1a',
      h: '#ece6d2', w: '#eef2f7', o: '#5a3e2a' },
    body: [
      '.....................ww',
      '....................www',
      '....h..............hwww',
      '....hh............hh.ww',
      '.....hhk........khh..o',
      '......khkkkkkkkkhk...o',
      '.......kiiiiiiiik....o',
      '......kiiigggiiiik...o',
      '......kiiiiiiiiiik...o',
      '......kIkkkkkkkkIk...o',
      '......kIkekkkkekIk...o',
      '......kIkkkkkkkkIk...o',
      '.......kIIIIIIIIk....o',
      '....kkkkkkkkkkkkkkkk.o',
      '...kiigkiiiiiiiikgiikko',
      '..kiiiikiigiigiikiiihho',
      '..kiiIkkiiiiiiiikkIikko',
      '..kiIk.kigiigiigk.kk.o',
      '..kiik.kiiiiiiiik....o',
      '..kiik.kgggggggk.....o',
      '..khhk.kiIiIiIik.....o',
      '...kk..kIiIiIiIk.....o',
      '.......kiIiIiIik.....o',
      '.......kkkkkkkkk.....o'
    ],
    legs: [[
      '.......kiik.kiik.....o',
      '.......kiik.kiik.....o',
      '.......kIIk.kIIk.....o',
      '......kIIIk.kIIIk....o',
      '......kkkkk.kkkkk....o'
    ], [
      '......kiik...kiik....o',
      '.....kiik.....kiik...o',
      '.....kIIk.....kIIk...o',
      '....kIIIk.....kIIIk..o',
      '....kkkkk.....kkkkk..o'
    ]]
  };

  // ---------- small pictures for the interface ----------
  var ICONS = {
    lantern: { pal: { k: K, g: '#f3c04a', r: '#d9432e', y: '#ffe08a' }, rows: [
      '....k', '..kgggk', '.krrrrrk', 'krrryrrrk', 'krryyyrrk', 'krryyyrrk', 'krrryrrrk', '.krrrrrk', '..kgggk', '....g', '....g'] },
    lanternOut: { pal: { k: K, g: '#6b6578', r: '#3c3a4a', y: '#4a4759' }, rows: [
      '....k', '..kgggk', '.krrrrrk', 'krrryrrrk', 'krryyyrrk', 'krryyyrrk', 'krrryrrrk', '.krrrrrk', '..kgggk', '....g', '....g'] },
    arrow: { pal: { f: '#e2483b', s: '#d9b97c', w: '#f4f7fb', k: K }, rows: [
      'f.......w', '.f......ww', 'ffssssssswww', '.f......ww', 'f.......w'] },
    arrowOff: { pal: { f: '#565c70', s: '#565c70', w: '#565c70', k: K }, rows: [
      'f.......w', '.f......ww', 'ffssssssswww', '.f......ww', 'f.......w'] }
  };

  // 3x5 digits for the paces counter drawn in the scene
  var DIGITS = ['111101101101111', '010110010010111', '111001111100111', '111001111001111', '101101111001001',
    '111100111001111', '111100111101111', '111001001001001', '111101111101111', '111101111001111'];

  function compose(bodyRows, legRows, pal, bob, extra) {
    var w = 0;
    bodyRows.concat(legRows).forEach(function (r) { w = Math.max(w, r.length); });
    var c = makeCanvas(w, bodyRows.length + legRows.length);
    paint(legRows, pal, c, 0, bodyRows.length);
    if (extra) paint(extra, pal, c, 0, bodyRows.length);
    paint(bodyRows, pal, c, 0, bob || 0);
    return c;
  }

  function withFlash(frames) {
    return { frames: frames, flash: frames.map(function (f) { return silhouette(f); }),
      w: frames[0].width, h: frames[0].height };
  }

  var built = null;
  /** Build every sprite canvas once. Returns { warrior, raider, wolf, clay, wraith, warlord }. */
  function build() {
    if (built) return built;
    function humanoid(def, mirror) {
      var frames = [
        compose(def.body, LEGS.stride, def.pal, 1, def.legExtra),
        compose(def.body, LEGS.pass, def.pal, 0, def.legExtra),
        compose(def.body, LEGS.stand, def.pal, 0, def.legExtra)
      ];
      if (mirror) frames = frames.map(flipped);
      return withFlash(frames);
    }
    var wolf = [compose(WOLF.body, WOLF.legs[0], WOLF.pal, 0), compose(WOLF.body, WOLF.legs[1], WOLF.pal, 0)].map(flipped);
    var lord = [compose(WARLORD.body, WARLORD.legs[1], WARLORD.pal, 0), compose(WARLORD.body, WARLORD.legs[0], WARLORD.pal, 1)].map(flipped);
    var wraith = WRAITH.frames.map(function (f) { return paint(f, WRAITH.pal); });
    built = {
      warrior: humanoid(WARRIOR, false),
      raider: humanoid(RAIDER, true),
      clay: humanoid(CLAY, true),
      wolf: withFlash(wolf),
      wraith: withFlash(wraith),
      warlord: withFlash(lord)
    };
    built.wraith.floats = true;
    built.wolf.runs = true;
    built.warlord.big = true;
    // colours used when an enemy bursts apart
    built.raider.bits = ['#8160ab', '#573c78', '#ffe45c', '#eef2f7'];
    built.clay.bits = ['#cd7d52', '#98522f', '#e6a273', '#7ef0d0'];
    built.wolf.bits = ['#9aa3b5', '#687188', '#e9edf3', '#ff4d4d'];
    built.wraith.bits = ['#d6f3fb', '#8fc4dd', '#5a8fb3', '#ff5c8a'];
    built.warlord.bits = ['#606985', '#3a4159', '#f0b93a', '#b3262b', '#ff8a1a'];
    return built;
  }

  /** Draw a whole number with the 3x5 pixel digits, centred on cx. */
  function drawNumber(g, n, cx, y, colour, shadow) {
    var s = String(n), w = s.length * 4 - 1, x0 = Math.round(cx - w / 2);
    for (var pass = shadow ? 0 : 1; pass < 2; pass++) {
      g.fillStyle = pass === 0 ? shadow : colour;
      var off = pass === 0 ? 1 : 0;
      for (var i = 0; i < s.length; i++) {
        var d = DIGITS[+s.charAt(i)];
        if (!d) continue;
        for (var p = 0; p < 15; p++) {
          if (d.charAt(p) === '1') g.fillRect(x0 + i * 4 + (p % 3) + off, y + Math.floor(p / 3) + off, 1, 1);
        }
      }
    }
  }

  /** A sprite as a crisp, enlarged data URL for use in the page's HTML. */
  function iconURL(name, scale) {
    var def = ICONS[name], small = paint(def.rows, def.pal);
    var c = makeCanvas(small.width * scale, small.height * scale), g = c.getContext('2d');
    g.imageSmoothingEnabled = false;
    g.drawImage(small, 0, 0, c.width, c.height);
    return c.toDataURL('image/png');
  }

  WW.Sprites = { build: build, paint: paint, makeCanvas: makeCanvas, flipped: flipped,
    silhouette: silhouette, drawNumber: drawNumber, iconURL: iconURL, OUTLINE: K };
})(typeof globalThis !== 'undefined' ? globalThis : this);
