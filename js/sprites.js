/* Predate pixel sprites.
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
  // An open nasal helm: steel dome, a dark brow band, and under it a face turned towards the
  // foe. s/S skin, w and k the eyes, the bar of the helm running down between them.
  var WARRIOR = {
    pal: { k: K, m: '#c9d1dc', M: '#7b8798', w: '#ffffff', s: '#e8b48c', S: '#b87a56', n: '#5a2f24', c: '#8f1d2c',
      a: '#9aa3b3', A: '#5d6779', g: '#d9a441', t: '#2b2f45', b: '#3a2a22', r: '#2b2f45', R: '#1e2133', p: '#7b8798', P: '#5a6476' },
    body: [
      '.......kkkkkk',
      '.....kkmwwmmMkk',
      '....kmwwmmmmmMMk',
      '....kmwmmmmmmMMk',
      '....kAAgAAAAAgAk',
      '....kmMkSwkmwkMk',
      '....kmMksssMssMk',
      '....kmMkSssnnsMk',
      '....kaAAkssssSk',
      '.....kaAAkSSSk',
      '......kkAaAAkk',
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
    // the same face with the eyes closed, for a blink: row number and what replaces it
    shut: { 5: '....kmMkSSSmSSMk' },
    // poses of his own, after the three every human figure has (see POSE)
    poses: [
      { bob: 2, legs: [ // lunge: front knee bent over the foot, back leg thrown out straight
        '',
        '',
        '....krrrrrrrrrk',
        '....krRrrrrrRrrk',
        '...kkppkkkpppppk',
        '..kppkk.....kPPk',
        '.kPPk.......kPPk',
        'kbbk........kbbk',
        'kbbbk.......kbbbbk',
        'kkkkk.......kkkkkk'
      ] },
      { bob: 0, legs: [ // air: front knee driven up, back leg trailing
        '....krrrrrrrrrk',
        '....krRrrrrrRrk',
        '....kppkkkpppppk',
        '...kppk...kkkPPk',
        '..kPPk.......kbbk',
        '.kbbk........kbbbk',
        'kbbk.........kkkkk',
        'kkkk',
        '',
        ''
      ] }
    ],
    shoulder: [13, 14], neck: [5, 12]
  };
  /** Which frame of a human figure is which pose. The last two are the knight's alone. */
  var POSE = { stride: 0, pass: 1, stand: 2, lunge: 3, air: 4 };

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
      var poses = [{ legs: LEGS.split, bob: 1 }, { legs: LEGS.pass, bob: 0 }, { legs: LEGS.stand, bob: 0 }].concat(def.poses || []);
      function framesOf(body) {
        var frames = poses.map(function (p) { return compose(body, p.legs, def.pal, p.bob); });
        return mirror ? frames.map(flipped) : frames;
      }
      var frames = framesOf(def.body);
      extra = extra || {};
      extra.bob = poses.map(function (p) { return p.bob; });
      if (mirror && def.hand) extra.hand = [frames[0].width - 1 - def.hand[0], def.hand[1]];
      if (def.shut) extra.shut = framesOf(def.body.map(function (row, y) { return def.shut[y] || row; }));
      return pack(frames, extra);
    }
    var wolf = [compose(WOLF.body, WOLF.legs[0], WOLF.pal, 0), compose(WOLF.body, WOLF.legs[1], WOLF.pal, 0)].map(flipped);
    var wraith = [compose(WRAITH.body, WRAITH.tails[0], WRAITH.pal, 0), compose(WRAITH.body, WRAITH.tails[1], WRAITH.pal, 0)];
    var dreadRaw = [compose(DREAD.body, DREAD.legs[1], DREAD.pal, 1), compose(DREAD.body, DREAD.legs[0], DREAD.pal, 0)];
    var dw = dreadRaw[0].width;
    // skull: the crown of the head as drawn, where the finishing blow goes in
    built = {
      warrior: human(WARRIOR, false, { shoulder: WARRIOR.shoulder, neck: WARRIOR.neck }),
      cultist: human(CULTIST, true, { weapon: 'dagger', skull: [9, 1], bits: ['#5a1a26', '#3a2a34', '#ffb347', '#b9a58f'] }),
      skeleton: human(SKELETON, true, { weapon: 'spear', skull: [9, 1], bits: ['#e3dcc6', '#b3ab94', '#7a5a48', '#7dffb0'] }),
      wolf: pack(wolf, { runs: true, bob: [0, 0], skull: [6, 2], bits: ['#565666', '#353542', '#d9d4c8', '#ff3b3b'] }),
      wraith: pack(wraith, { floats: true, bob: [0, 0], skull: [10, 1], bits: ['#d6f3fb', '#8fc4dd', '#5a8fb3', '#ff5c8a'] }),
      dread: pack(dreadRaw.map(flipped), { weapon: 'halberd', bob: [1, 0], skull: [12, 4],
        hand: [dw - 1 - DREAD.hand[0], DREAD.hand[1]], cape: [dw - 1 - DREAD.cape[0], DREAD.cape[1]],
        bits: ['#45455a', '#272735', '#a8323a', '#6e1420', '#ff3a2a'] })
    };
    return built;
  }

  // The sixteen directions a line of pixels can take and stay clean: flat, upright, the
  // true diagonal, and the one-in-two slopes between them.
  var SLOPE = Math.atan(0.5) * 180 / Math.PI;
  var CLEAN = [0, SLOPE, 45, 90 - SLOPE];
  /** The nearest clean direction to `deg`, so a blade never shimmers as it turns. */
  function cleanAngle(deg) {
    var turn = ((deg % 360) + 360) % 360, quarter = Math.floor(turn / 90), within = turn - quarter * 90, best = 90, i;
    for (i = 0; i < CLEAN.length; i++) if (Math.abs(CLEAN[i] - within) < Math.abs(best - within)) best = CLEAN[i];
    return quarter * 90 + best;
  }

  /**
   * A run of pixels from (x, y) in the direction `deg`, between the distances `from` and
   * `to`. It steps whole pixels along its longer axis, which keeps the run even.
   */
  function stroke(g, x, y, deg, from, to, colour, ox, oy) {
    var a = deg * Math.PI / 180, c = Math.cos(a), s = -Math.sin(a), m = Math.max(Math.abs(c), Math.abs(s));
    g.fillStyle = colour;
    for (var j = Math.round(from * m); j <= Math.round(to * m); j++) {
      g.fillRect(Math.round(x + c / m * j) + (ox || 0), Math.round(y + s / m * j) + (oy || 0), 1, 1);
    }
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
      var sword = kind === 'sword', len = sword ? 17 : 10, flat = Math.abs(cx) >= Math.abs(sy);
      stroke(g, hx, hy, deg, -3, 0, '#3a2a22');                                        // grip
      stroke(g, hx, hy, deg, -4, -4, '#d9a441');                                       // pommel
      stroke(g, hx, hy, deg, 2, len, sword ? '#eef3f8' : '#b9b2c6');                   // blade
      stroke(g, hx, hy, deg, 2, len - 2, sword ? '#8f9fb4' : '#6a6478', flat ? 0 : 1, flat ? 1 : 0); // its shaded edge
      stroke(g, Math.round(hx + cx), Math.round(hy + sy), deg + 90, -3, 3, sword ? '#d9a441' : '#55505e'); // guard
      stroke(g, hx, hy, deg, len + 1, len + 1, '#ffffff');                             // point
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

  WW.Sprites = { build: build, makeCanvas: makeCanvas, tinted: tinted, drawWeapon: drawWeapon, cleanAngle: cleanAngle,
    iconURL: iconURL, POSE: POSE, OUTLINE: K };
})(typeof globalThis !== 'undefined' ? globalThis : this);
