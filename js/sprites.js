/* Wallward pixel sprites.
 *
 * Every sprite is a small text picture: one character per pixel, looked up in
 * a palette. "." is transparent. Sprites are drawn facing right; enemies are
 * mirrored because they walk towards the left. Swords, spears and capes are
 * not part of the pictures: the game draws them at whatever angle the moment
 * needs, which is what lets the warrior swing.
 */
(function (root) {
  'use strict';
  var WW = root.WW = root.WW || {};
  var K = '#1b1524'; // shared outline colour

  function makeCanvas(w, h) {
    var c = document.createElement('canvas');
    c.width = Math.max(1, w); c.height = Math.max(1, h);
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

  /** Same shape, one flat colour: the white flash when something is hit, and dash trails. */
  function silhouette(src, colour) {
    var c = makeCanvas(src.width, src.height), g = c.getContext('2d');
    g.drawImage(src, 0, 0);
    g.globalCompositeOperation = 'source-in';
    g.fillStyle = colour || '#ffffff';
    g.fillRect(0, 0, c.width, c.height);
    return c;
  }

  /** A copy washed with the colour of the light, so characters sit in their scene. */
  function tinted(src, colour, alpha) {
    var c = makeCanvas(src.width, src.height), g = c.getContext('2d');
    g.drawImage(src, 0, 0);
    if (colour && alpha) {
      g.globalCompositeOperation = 'source-atop';
      g.globalAlpha = alpha;
      g.fillStyle = colour;
      g.fillRect(0, 0, c.width, c.height);
    }
    return c;
  }

  // ---------- shared legs for the human-shaped figures ----------
  // r/R skirt, p/P trousers, b boots. Ten rows; the last row touches the ground.
  var LEGS = {
    stand: [
      '....krrrrrrrrrk',
      '....krRrrrrrRrk',
      '.....kppk.kppk',
      '.....kppk.kppk',
      '.....kppk.kppk',
      '.....kPPk.kPPk',
      '.....kbbk.kbbk',
      '.....kbbk.kbbk',
      '.....kbbbk.kbbbk',
      '.....kkkkk.kkkkk'
    ],
    split: [
      '',
      '....krrrrrrrrrk',
      '....krRrrrrrRrk',
      '....kppkk.kkppk',
      '...kppk....kppk',
      '..kPPk......kPPk',
      '.kbbk........kbbk',
      '.kbbk........kbbk',
      'kbbbk........kbbbk',
      'kkkkk........kkkkk'
    ],
    pass: [
      '....krrrrrrrrrk',
      '....krRrrrrrRrk',
      '.....kpppppk',
      '......kppppk',
      '......kpppk',
      '......kPPPk',
      '......kbbbk',
      '......kbbbk',
      '......kbbbbk',
      '......kkkkkk'
    ]
  };

  // ---------- the warrior: a knight of the wall ----------
  var WARRIOR = {
    pal: { k: K, m: '#c9d1dc', M: '#7b8798', w: '#ffffff', e: '#bfe6ff', c: '#8f1d2c', a: '#9aa3b3', A: '#5d6779',
      g: '#d9a441', t: '#2b2f45', b: '#3a2a22', r: '#2b2f45', R: '#1e2133', p: '#7b8798', P: '#5a6476' },
    body: [
      '........kkkk',
      '......kkmmmmkk',
      '.....kmmwmmmmMk',
      '....kmmwmmmmmMMk',
      '....kmmmmmmmmMMk',
      '....kmkeekkeekMk',
      '....kmmmmkmmmMMk',
      '....kmMmMkMmMMMk',
      '....kmmmmmmmmMMk',
      '.....kmmmmmmMMk',
      '......kkMMMMkk',
      '....kccccccccck',
      '..kkaaccccccaaakk',
      '.kaawaagaaagaaaak',
      '.kaAaaaaaaaaaaAak',
      '.kaAkattttttakAak',
      '..kkkatgttgtakkk',
      '.....ktttttttk',
      '.....ktgtttgtk',
      '.....kbbbgbbbk',
      '.....ktttttttk'
    ],
    shoulder: [13, 14], neck: [5, 12]
  };

  // ---------- enemies ----------
  var CULTIST = {
    pal: { k: K, h: '#5a1a26', H: '#3a0f1a', e: '#ffb347', c: '#3a2a34', C: '#261a22', g: '#b08a3e', s: '#b9a58f',
      b: '#1a1218', r: '#3a2a34', R: '#261a22', p: '#261a22', P: '#1a1218' },
    body: [
      '.......kkkkk',
      '.....kkhhhhhkk',
      '....khhhhhhhhhk',
      '...khhhHHHHHHhhk',
      '...khhHkkkkkkHhk',
      '...khHkkkkkkkkHk',
      '...khHkeekkeekHk',
      '...khHkkkkkkkkHk',
      '...khhHkkkkkkHhk',
      '....khhHHHHHHhk',
      '...kkchhhhhhhckk',
      '..kcccchhhhhcccck',
      '.kccCcccggggccCcck',
      '.kcCCcccccccccCCck',
      '.kcCkcccccccccckCck',
      '.kcCkcCcccccCcckCck',
      '.kssk.kcccccck.kssk',
      '..kk..kcCcccCck.kk',
      '......kccCcCcck',
      '......kbbbgbbbk',
      '......kccccccck'
    ],
    hand: [17, 16]
  };

  var SKELETON = {
    pal: { k: K, w: '#e3dcc6', v: '#b3ab94', i: '#7a5a48', I: '#553c32', e: '#7dffb0',
      b: '#553c32', r: '#7a5a48', R: '#553c32', p: '#e3dcc6', P: '#b3ab94' },
    body: [
      '......kkkkkk',
      '....kkwwwwwwkk',
      '...kwwwwwwwwwvk',
      '...kwwwwwwwwwvk',
      '...kwkkkwwkkkvk',
      '...kwkekwwkekvk',
      '...kwwwwkkwwwvk',
      '....kwwwwwwwvk',
      '....kwkwkwkwkk',
      '.....kkkkkkkk',
      '...kkkkiiiikkkk',
      '..kiiIkwwwwkIiik',
      '.kiiIkwkwwkwkIiik',
      '.kiIk.kwwwwwk.kIik',
      '.kwk..kwkwwkwk.kwk',
      '.kwk...kwwwwk..kwk',
      '.kvk...kwkkwk..kvk',
      '..k....kkwwkk...k',
      '......kiiiiiik',
      '......kiIiIiIk',
      '......kiiiiiik'
    ],
    hand: [16, 16]
  };

  var WOLF = {
    pal: { k: K, g: '#565666', G: '#353542', w: '#d9d4c8', e: '#ff3b3b', n: '#15121c' },
    body: [
      '.........................k...k',
      '........................kgk.kgk',
      '.......................kgggkgggk',
      '......................kggggggggk',
      '.kk..................kgggggegggkk',
      'kggk................kggggggggggwwk',
      'kgGgk...kkkkkkkkkkkkgggggggggwwwnk',
      '.kGggkkkgggggggggggggggggggGkkwwk',
      '..kGgggggggggggggggggggggggGk.kk',
      '...kgggggggggggggggggggggggk',
      '...kgGgggggggggggggggggggGgk',
      '...kgGGggggggggggggggggGGggk',
      '...kggGGgggkkkkkkkkkgggGGggk'
    ],
    legs: [[
      '...kggk.kggk......kggk.kggk',
      '...kggk.kggk......kggk.kggk',
      '...kgGk.kgGk......kgGk.kgGk',
      '...kgGk.kgGk......kgGk.kgGk',
      '...kGGk.kGGk......kGGk.kGGk',
      '..kgggk.kgggk....kgggk.kgggk',
      '..kkkkk.kkkkk....kkkkk.kkkkk'
    ], [
      '..kggk...kggk....kggk...kggk',
      '.kggk.....kggk..kggk.....kggk',
      'kggk.......kggkkggk.......kggk',
      'kgGk.......kgGkkgGk.......kgGk',
      'kGGk........kGGGGk........kGGk',
      'kggk........kggggk........kggk',
      'kkkk........kkkkkk........kkkk'
    ]]
  };

  var WRAITH = {
    pal: { k: '#22304f', f: '#d6f3fb', F: '#8fc4dd', e: '#ff5c8a' },
    body: [
      '.......kkkkkk',
      '.....kkffffffkk',
      '....kffffffffffk',
      '...kffffffffffffk',
      '..kffffffffffffffk',
      '..kffkkkkffkkkkffk',
      '..kffkeekffkeekffk',
      '..kffkkkkffkkkkffk',
      '..kffffffffffffffk',
      '..kfffffkkkkfffffk',
      '..kFfffkkkkkkfffFk',
      '..kFffffkkkkffffFk',
      '.kFFffffffffffffFFk',
      'kFFffffffffffffffFFk',
      'kFfffkfffffffkfffFFk',
      'kFfkk.kffffffk.kkfFk',
      '.kk...kFfffffk...kk',
      '......kFffffFk',
      '......kFfffffk',
      '.....kFFffffFFk',
      '.....kFfffffffk',
      '.....kFffFfffFk'
    ],
    tails: [[
      '.....kFfFFffFfk',
      '....kFffkFffkFfk',
      '....kFfk.kFk.kFk',
      '.....kk..kFk..k',
      '.........kk',
      '', '', ''
    ], [
      '.....kFffFFfFfk',
      '.....kFfkFffkFfk',
      '....kFfk.kFfk.kFk',
      '....kFk..kFk...k',
      '.....k...kk',
      '', '', ''
    ]]
  };

  var DREAD = {
    pal: { k: K, i: '#45455a', I: '#272735', w: '#7d7d94', g: '#a8323a', r: '#6e1420', e: '#ff3a2a', h: '#cfc6b0' },
    body: [
      '......h..................h',
      '......hh................hh',
      '.......hhk............khh',
      '........khhkkkkkkkkkkhhk',
      '.........kkiiiiiiiiiikk',
      '........kiiiwiiiiiiiiiIk',
      '.......kiiiwiigggiiiiiIIk',
      '.......kiiiiiigggiiiiiIIk',
      '......kkkkkkkkkkkkkkkkkkkk',
      '.......kIIkkkkkkkkkkkkIIk',
      '.......kIkkeekkkkkeekkkIk',
      '.......kIkkkkkkkkkkkkkkIk',
      '.......kIIkkkIIIIIkkkkIIk',
      '........kIIIIIIIIIIIIIIk',
      '....kkkkkkrrrrrrrrrrkkkkkk',
      '...kiiiiikkiiiiiiiikkiiiiik',
      '..kiiwiiiikiiggggiikiiiiiIIk',
      '..kiiiiiiikigggggigkiiiiiIIk',
      '..kgiiiiigkiiggggiikgiiiiiIk',
      '..kkiiiiikkiiiiiiiikkiiiiikk',
      '...kkiiikkgiiiiiiiigkkiiikk',
      '....kiiik.kiigiigiiik.kiiik',
      '....kiiik.kiiiiiiiiik.kiiik',
      '....kIIIk.kgggggggggk.kIIIk',
      '....khhhk.kiIiIiIiIik.khhhk',
      '.....kkk..kIiIiIiIiIk..kkk',
      '..........kiIiIiIiIik',
      '..........krrrrrrrrrk'
    ],
    legs: [[
      '..........kiik...kiik',
      '..........kiik...kiik',
      '..........kIIk...kIIk',
      '..........kiik...kiik',
      '..........kiik...kiik',
      '..........kggk...kggk',
      '..........kIIk...kIIk',
      '.........kIIIk...kIIIk',
      '.........kiiiik..kiiiik',
      '.........kkkkkk..kkkkkk'
    ], [
      '',
      '.........kiik.....kiik',
      '........kiik.......kiik',
      '........kIIk.......kIIk',
      '.......kiik.........kiik',
      '.......kggk.........kggk',
      '.......kIIk.........kIIk',
      '......kIIIk.........kIIIk',
      '......kiiiik........kiiiik',
      '......kkkkkk........kkkkkk'
    ]],
    hand: [24, 24], cape: [6, 15]
  };

  // ---------- small pictures for the interface ----------
  var FLAME = ['....k', '...kyk', '...kyok', '..kyyok', '..kyyook', '.kyyyook', '.kyyyoork', '.kyyooork', '..kooork', '...kkkk'];
  var ICONS = {
    flame: { pal: { k: K, y: '#ffe08a', o: '#f08a2c', r: '#c9382f' }, rows: FLAME },
    flameOut: { pal: { k: K, y: '#4a4658', o: '#3a3646', r: '#2c2936' }, rows: FLAME }
  };

  function compose(bodyRows, legRows, pal, bob) {
    var w = 0;
    bodyRows.concat(legRows).forEach(function (r) { w = Math.max(w, r.length); });
    var c = makeCanvas(w, bodyRows.length + legRows.length);
    paint(legRows, pal, c, 0, bodyRows.length);
    paint(bodyRows, pal, c, 0, bob || 0);
    return c;
  }

  function pack(frames, extra) {
    var s = { frames: frames, flash: frames.map(function (f) { return silhouette(f); }),
      w: frames[0].width, h: frames[0].height };
    for (var k in extra) s[k] = extra[k];
    return s;
  }

  var built = null;
  /** Build every sprite once. Each has frames, a white flash copy of each, and a few anchor points. */
  function build() {
    if (built) return built;
    function human(def, mirror, extra) {
      var frames = [compose(def.body, LEGS.split, def.pal, 1), compose(def.body, LEGS.pass, def.pal, 0),
        compose(def.body, LEGS.stand, def.pal, 0)];
      var w = frames[0].width;
      extra = extra || {};
      extra.bob = [1, 0, 0];
      if (mirror) {
        frames = frames.map(flipped);
        if (def.hand) extra.hand = [w - 1 - def.hand[0], def.hand[1]];
      }
      return pack(frames, extra);
    }
    var wolf = [compose(WOLF.body, WOLF.legs[0], WOLF.pal, 0), compose(WOLF.body, WOLF.legs[1], WOLF.pal, 0)].map(flipped);
    var wraith = [compose(WRAITH.body, WRAITH.tails[0], WRAITH.pal, 0), compose(WRAITH.body, WRAITH.tails[1], WRAITH.pal, 0)];
    var dreadRaw = [compose(DREAD.body, DREAD.legs[1], DREAD.pal, 1), compose(DREAD.body, DREAD.legs[0], DREAD.pal, 0)];
    var dw = dreadRaw[0].width;
    built = {
      warrior: human(WARRIOR, false, { shoulder: WARRIOR.shoulder, neck: WARRIOR.neck }),
      cultist: human(CULTIST, true, { weapon: 'dagger', bits: ['#5a1a26', '#3a2a34', '#ffb347', '#b9a58f'] }),
      skeleton: human(SKELETON, true, { weapon: 'spear', bits: ['#e3dcc6', '#b3ab94', '#7a5a48', '#7dffb0'] }),
      wolf: pack(wolf, { runs: true, bob: [0, 0], bits: ['#565666', '#353542', '#d9d4c8', '#ff3b3b'] }),
      wraith: pack(wraith, { floats: true, bob: [0, 0], bits: ['#d6f3fb', '#8fc4dd', '#5a8fb3', '#ff5c8a'] }),
      dread: pack(dreadRaw.map(flipped), { weapon: 'halberd', bob: [1, 0], big: true,
        hand: [dw - 1 - DREAD.hand[0], DREAD.hand[1]], cape: [dw - 1 - DREAD.cape[0], DREAD.cape[1]],
        bits: ['#45455a', '#272735', '#a8323a', '#6e1420', '#ff3a2a'] })
    };
    return built;
  }

  /**
   * Draw a straight weapon from a hand, pointing at `deg` degrees (0 = right, 90 = up).
   * kind: sword, dagger, spear or halberd.
   */
  function drawWeapon(g, hx, hy, deg, kind) {
    var a = deg * Math.PI / 180, cx = Math.cos(a), sy = -Math.sin(a), i, x, y;
    var px = -sy, py = cx; // a step to one side of the blade
    function dot(d, off, col) {
      g.fillStyle = col;
      g.fillRect(Math.round(hx + cx * d + px * off), Math.round(hy + sy * d + py * off), 1, 1);
    }
    if (kind === 'sword' || kind === 'dagger') {
      var len = kind === 'sword' ? 17 : 10;
      var edge = kind === 'sword' ? '#8f9fb4' : '#6a6478', steel = kind === 'sword' ? '#eef3f8' : '#b9b2c6';
      for (i = -3; i <= 0; i++) dot(i, 0, '#3a2a22');                       // grip
      dot(-4, 0, '#d9a441');                                                // pommel
      for (i = -3; i <= 3; i++) dot(1, i, kind === 'sword' ? '#d9a441' : '#55505e'); // guard
      for (i = 2; i <= len; i++) { dot(i, 0, steel); if (i < len - 1) dot(i, 1, edge); }
      dot(len + 1, 0, '#ffffff');
    } else {
      var shaft = kind === 'spear' ? 30 : 34;
      for (i = -10; i <= shaft; i++) dot(i, 0, i % 7 === 0 ? '#2e2018' : '#4e3626');
      if (kind === 'spear') {
        for (i = 0; i < 6; i++) { dot(shaft + i, 0, '#c9c2b0'); if (i < 3) { dot(shaft + i, 1, '#8a8474'); dot(shaft + i, -1, '#8a8474'); } }
      } else {
        for (i = 0; i < 11; i++) {
          var wide = i < 3 ? i + 1 : Math.max(1, 5 - Math.floor((i - 3) / 2));
          for (x = 0; x < wide; x++) dot(shaft + i, -x, x === wide - 1 ? '#6a6a80' : '#b9b9cc');
        }
        for (y = -1; y <= 1; y++) dot(shaft - 1, y, '#a8323a');
        for (i = 0; i < 4; i++) dot(shaft + 2, 1 + i, '#8a8aa0');           // back spike
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

  WW.Sprites = { build: build, paint: paint, makeCanvas: makeCanvas, flipped: flipped, silhouette: silhouette,
    tinted: tinted, drawWeapon: drawWeapon, iconURL: iconURL, OUTLINE: K };
})(typeof globalThis !== 'undefined' ? globalThis : this);
