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
      a: '#9aa3b3', A: '#5d6779', g: '#d9a441', t: '#2b2f45', b: '#3a2a22', r: '#2b2f45', R: '#1e2133', p: '#7b8798', P: '#5a6476',
      q: '#4f5970', Q: '#3d455a', d: '#251a16' }, // q/Q/d: the leg on his far side, in shade
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
    shoulder: [13, 14], neck: [5, 12],
    split: 11 // the row his torso starts at: above it is the head, which a gait may carry apart from the rest
  };

  // ---------- the knight's gaits ----------
  // He walks and runs on drawn strides, not on two frames swapped. One leg is drawn through a
  // whole stride; his other leg is the same leg half a stride on, in shade and a pixel across
  // (see gait()). Ten rows, the last on the ground; each leg is drawn for the height his hips
  // ride at in that frame (`bob`: how far the body has sunk), so its top two or three rows are
  // left for the hem. While a foot is planted it is drawn `step` pixels further back each
  // frame, which is how far the wall slides by in that time when the game runs the stride by
  // the ground covered (GAIT in game.js): a planted foot stays where it was put.
  var STRIDE = {
    // eight frames to two steps, 24 pixels of ground: heel down, weight on, passing, pushing off; then the swing through
    walk: { step: 3, bob: [1, 1, 0, 0, 1, 1, 0, 0], leg: [
      [ // the foot comes down, leg out ahead
        '', '', '',
        '........kpppk',
        '.........kpppk',
        '..........kPPk',
        '...........kbbk',
        '............kbbk',
        '............kbbbk',
        '............kkkkk'],
      [ // the weight comes on to it, knee giving
        '', '', '',
        '.......kpppk',
        '........kpppk',
        '.........kPPk',
        '.........kbbk',
        '.........kbbk',
        '.........kbbbk',
        '.........kkkkk'],
      [ // straight under him as the other leg passes
        '', '',
        '......kpppk',
        '......kpppk',
        '......kppk',
        '......kPPk',
        '......kbbk',
        '......kbbk',
        '......kbbbk',
        '......kkkkk'],
      [ // behind him now, pushing
        '', '',
        '......kpppk',
        '.....kpppk',
        '....kppkk',
        '...kPPk',
        '...kbbk',
        '...kbbk',
        '...kbbbk',
        '...kkkkk'],
      [ // the last of the push: up on the toe, heel lifted
        '', '', '',
        '....kpppk',
        '...kpppk',
        '..kPPkk',
        '.kbbk',
        'kbbbk',
        'kkbbk',
        '..kkk'],
      [ // off the ground and folding, the foot trailing
        '', '', '',
        '......kpppk',
        '.....kpppk',
        '...kkPPkk',
        '..kbbbk',
        '..kbbk',
        '...kk',
        ''],
      [ // swinging through: knee leading, the foot tucked up behind it
        '', '',
        '.......kpppk',
        '........kpppk',
        '......kkkPPk',
        '.....kbbbkk',
        '.....kbbk',
        '......kk',
        '', ''],
      [ // reaching for the next step, toe up
        '', '',
        '.......kpppk',
        '........kpppk',
        '.........kPPk',
        '..........kbbk',
        '..........kbbkk',
        '..........kbbbk',
        '..........kkkk',
        '']
    ] },
    // six frames to two bounds, 48 pixels of ground: landing, driving off, flight; then the leg gathered and thrown forward
    run: { step: 8, bob: [2, 1, 0, 2, 1, 0], lean: 1, leg: [
      [ // landing: foot flat ahead of him, knee deep
        '', '', '', '',
        '........kpppk',
        '.........kPPPk',
        '..........kbbk',
        '..........kbbk',
        '..........kbbbk',
        '..........kkkkk'],
      [ // driving off: the leg straight out behind, on its toe
        '', '', '',
        '......kpppk',
        '.....kpppk',
        '....kPPkk',
        '...kbbk',
        '..kbbbk',
        '..kkbbk',
        '....kkk'],
      [ // in the air: trailing, heel kicked up
        '', '',
        '......kpppk',
        '.....kpppk',
        '...kkPPkk',
        '..kbbbk',
        '..kbbk',
        '...kk',
        '', ''],
      [ // gathered under him as the other foot lands
        '', '', '', '',
        '.......kpppk',
        '......kkPPk',
        '.....kbbbk',
        '.....kbbk',
        '......kk',
        ''],
      [ // the knee driven forward
        '', '', '',
        '.......kpppk',
        '........kpppk',
        '.........kPPk',
        '.........kbbk',
        '.........kbbbk',
        '.........kkkkk',
        ''],
      [ // in the air: thrown out ahead for the landing
        '', '',
        '.......kpppk',
        '........kpppk',
        '.........kPPk',
        '..........kbbk',
        '..........kbbkk',
        '..........kbbbk',
        '..........kkkk',
        '']
    ] }
  };
  // The arm he does not fight with swings against the leg on its side: these rows of his body
  // redrawn with that arm, from the shoulder down, a pixel back, or a pixel forward across his belt.
  var ARM = {
    back: { 14: 'kaAaaaaaaaaaaaAak', 15: 'kaAkkattttttakAak', 16: '.kkkkatgttgtakkk' },
    fore: { 14: '..kaAaaaaaaaaaAak', 15: '..kaAkttttttakAak', 16: '...kkktgttgtakkk' }
  };
  var HEM = ['....krrrrrrrrrk', '....krRrrrrrRrk'];

  /**
   * The frames of a gait, as poses: for each, the far leg (the same stride half a turn on,
   * in shade, a pixel across), the near leg over it and the hem of his tunic over both.
   * He leans his head into a run; his free arm swings back as the near leg comes forward,
   * and his sword hand answers it (`sway`).
   */
  function gait(stride) {
    var n = stride.leg.length, half = n / 2;
    function shaded(rows) {
      return rows.map(function (r) { return r ? '.' + r.replace(/p/g, 'q').replace(/P/g, 'Q').replace(/b/g, 'd') : r; });
    }
    return stride.leg.map(function (near, i) {
      var bob = stride.bob[i], hem = [], y;
      for (y = 0; y < bob; y++) hem.push('');
      var u = i / n, swing = Math.cos(u * 2 * Math.PI); // 1 as the near leg strikes ahead, -1 as the far one does
      return { bob: bob, legs: [shaded(stride.leg[(i + half) % n]), near, hem.concat(HEM)],
        head: stride.lean ? { dx: stride.lean } : null,
        patch: swing > 0.5 ? ARM.back : swing < -0.5 ? ARM.fore : null,
        sway: swing > 0.5 ? 1 : swing < -0.5 ? -1 : 0 };
    });
  }
  WARRIOR.poses = WARRIOR.poses.concat(gait(STRIDE.walk), gait(STRIDE.run));

  /** Which frame of a human figure is which pose. Those after `stand` are the knight's alone: `walk` and `run` list the frames of his strides. */
  var POSE = { stride: 0, pass: 1, stand: 2, lunge: 3, air: 4, walk: [], run: [] };
  (function () {
    var i, at = 5;
    for (i = 0; i < STRIDE.walk.leg.length; i++) POSE.walk.push(at++);
    for (i = 0; i < STRIDE.run.leg.length; i++) POSE.run.push(at++);
  })();

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
  // How each foe of a wall ended, a twelve-pixel square apiece. (Copied results say the same in emoji.)
  var MARK = { k: K, w: '#e8e2cf', g: '#a9a394', s: '#eef3f8', t: '#8f9fb4', y: '#d9a441', n: '#7a5232',
    r: '#c9382f', o: '#f08a2c', e: '#ffe08a', b: '#5a5468', c: '#2c2936' };
  var ICONS = {
    flame: { pal: { k: K, y: '#ffe08a', o: '#f08a2c', r: '#c9382f' }, rows: FLAME },
    flameOut: { pal: { k: K, y: '#4a4658', o: '#3a3646', r: '#2c2936' }, rows: FLAME },
    // felled outright by the oldest answer: a skull
    markK: { pal: MARK, rows: [
      '...kkkkkk...',
      '..kwwwwwwk..',
      '.kwwwwwwwwk.',
      '.kwwwwwwwgk.',
      '.kwkkwwkkgk.',
      '.kwkkwwkkgk.',
      '.kwwwkkwwgk.',
      '..kwwwwwgk..',
      '..kwkwkwgk..',
      '..kwkwkwgk..',
      '...kkkkkk...',
      '............'] },
    // felled without a slip: crossed swords
    markF: { pal: MARK, rows: [
      's..........s',
      'ts........st',
      '.ts......st.',
      '..ts....st..',
      '...ts..st...',
      '....tsst....',
      '.....ss.....',
      '..y.stts.y..',
      '...yt..ty...',
      '..n.y..y.n..',
      '.y........y.',
      '............'] },
    // felled, though not cleanly: one sword
    markW: { pal: MARK, rows: [
      '...........s',
      '..........st',
      '.........st.',
      '........st..',
      '.......st...',
      '......st....',
      '.y...st.....',
      '..y.st......',
      '...y........',
      '..n.y.......',
      '.y...y......',
      'y...........'] },
    // skipped: gone like the wind
    markS: { pal: MARK, rows: [
      '............',
      '.....ggg....',
      '....g...g...',
      '........g...',
      'wwwwwwww....',
      '............',
      '.wwwwwwwww..',
      '..........g.',
      '.........g..',
      'wwwwwww.....',
      '............',
      '............'] },
    // the wall fell here
    markX: { pal: MARK, rows: [
      '.....rr.....',
      '.r...oo...r.',
      '..ro.oo.or..',
      '...oooooo...',
      '..ooeeeeoo..',
      'rroeewweeorr',
      'rroeewweeorr',
      '..ooeeeeoo..',
      '...oooooo...',
      '..ro.oo.or..',
      '.r...oo...r.',
      '.....rr.....'] },
    // a day whose wall fell: the torch burnt down to embers
    ember: { pal: { k: K, y: '#ffe08a', o: '#f08a2c', r: '#c9382f', d: '#6e1420', g: '#6c6678' }, rows: [
      '.........',
      '....g....',
      '...g.....',
      '....g....',
      '.....g...',
      '.........',
      '...kkk...',
      '..kroyk..',
      '.krorork.',
      '.kkkkkkk.'] },
    // a foe never met
    markNone: { pal: MARK, rows: [
      '............',
      '............',
      '............',
      '....bbbb....',
      '...bccccb...',
      '...bc..cb...',
      '...bc..cb...',
      '...bccccb...',
      '....bbbb....',
      '............',
      '............',
      '............'] }
  };

  // A badge for each rank of the end screen, Recruit to Warden of the Wall: one shield, its rim
  // going from iron to silver to gold and its charge from a plain boss to the wall's own tower.
  // L and D are the lit and shaded sides of the rim, f the field.
  var SHIELD = [
    '.kkkkkkkkkkkkkk.',
    'kLLLLLLLLLLLLLLk',
    'kLffffffffffffDk',
    'kLffffffffffffDk',
    'kLffffffffffffDk',
    'kLffffffffffffDk',
    'kLffffffffffffDk',
    'kLffffffffffffDk',
    'kLffffffffffffDk',
    'kLffffffffffffDk',
    '.kLffffffffffDk.',
    '.kLffffffffffDk.',
    '..kLffffffffDk..',
    '..kLffffffffDk..',
    '...kLffffffDk...',
    '....kLffffDk....',
    '.....kDDDDk.....',
    '......kkkk......'];
  /** The shield with a charge laid on its field: rows of twelve, from the field's top row down; '.' leaves the field showing. */
  function shield(charge) {
    return SHIELD.map(function (row, y) {
      var c = charge[y - 2];
      if (!c) return row;
      var out = row.split('');
      for (var x = 0; x < 12; x++) if (c.charAt(x) !== '.' && out[x + 2] === 'f') out[x + 2] = c.charAt(x);
      return out.join('');
    });
  }
  var SWORDS = [ // two blades crossed, points up, hilts down
    '.s........s.',
    '.ts......st.',
    '..ts....st..',
    '...ts..st...',
    '....tsst....',
    '.....ss.....',
    '....stts....',
    '..ggt..tgg..',
    '...n....n...',
    '..n......n..'];
  var RANK_BADGES = [
    { // Recruit: a plain wooden shield with an iron boss
      pal: { k: K, L: '#9a94a8', D: '#4a4558', f: '#7a5232', F: '#563820', b: '#a9a394', B: '#e8e2cf', n: '#6c6678' },
      charge: ['...F....F...', '...F....F...', '...F....F...', '...F.kk.F...', '...FkBbkF...', '...FkbnkF...',
        '...F.kk.F...', '...F....F...', '...F....F...', '...F....F...', '...F....F...', '...F....F...', '...F....F...'] },
    { // Sentry: iron, with the torch of the watch
      pal: { k: K, L: '#9a94a8', D: '#4a4558', f: '#2f3446', y: '#ffe08a', o: '#f08a2c', r: '#c9382f', c: '#8f8aa0', h: '#7a5232' },
      charge: ['......r.....', '.....ro.....', '.....oyo....', '....oyyo....', '....oyyyo...', '....royor...', '....kcccck..',
        '.....khhk...', '.....khhk...', '.....khhk...', '.....khhk...', '......kk....'] },
    { // Man-at-arms: steel, with a sword point down
      pal: { k: K, L: '#c9d1dc', D: '#5d6779', f: '#3a4560', s: '#eef3f8', t: '#8f9fb4', g: '#d9a441', n: '#3a2a22' },
      charge: ['.....gg.....', '.....nn.....', '.....nn.....', '..gggggggg..', '.....st.....', '.....st.....', '.....st.....',
        '.....st.....', '.....st.....', '.....st.....', '.....st.....', '.....st.....', '......s.....'] },
    { // Captain: a red field, silver rim, crossed swords
      pal: { k: K, L: '#f2ecdc', D: '#8e8776', f: '#8f1d2c', s: '#eef3f8', t: '#8f9fb4', g: '#d9a441', n: '#3a2a22' },
      charge: [''].concat(SWORDS) },
    { // Commander: gold rim, and a crown over the swords
      pal: { k: K, L: '#ffe08a', D: '#9a6f24', f: '#8f1d2c', s: '#eef3f8', t: '#8f9fb4', g: '#d9a441', n: '#3a2a22', y: '#f5c044', r: '#4fd0e0' },
      charge: ['...y.yy.y...', '...yyyyyy...', '...yryyry...'].concat(SWORDS.slice(1)) },
    { // Warden of the Wall: the wall's own tower in gold on the night sky
      pal: { k: K, L: '#fff1c9', D: '#b8862a', f: '#1d2240', y: '#f5c044', Y: '#b8862a', e: '#ff9a3c', w: '#e8e2cf' },
      charge: ['w.........w.', '...y.yy.y...', '...yyyyyy...', '...yyyyyY...', '...yyeeyY...', '...yyeeyY...', '...yyyyyY...',
        '...yyyyyY...', '..yyyyyyyY..', '..yyykkyyY..', '..yyykkyyY..', '..YYYYYYYY..'] }
  ];
  RANK_BADGES.forEach(function (b, i) { ICONS['rank' + i] = { pal: b.pal, rows: shield(b.charge) }; });

  /**
   * A body over its legs. The legs may be several pictures laid one over another. A pose
   * may redraw rows of the body (`patch`), and carry the head (the rows above `split`)
   * apart from the rest: a pixel forward, or at a height of its own. A head riding higher
   * than the body has its last row drawn again to fill the neck; one riding lower sinks
   * behind the collar.
   */
  function compose(bodyRows, legRows, pal, bob, pose, split) {
    var layers = typeof legRows[0] === 'string' ? [legRows] : legRows, w = 0, i;
    var rows = pose && pose.patch ? bodyRows.map(function (r, y) { return pose.patch[y] || r; }) : bodyRows;
    var head = pose && split ? pose.head : null, dx = head ? head.dx || 0 : 0;
    rows.forEach(function (r) { w = Math.max(w, r.length + dx); });
    layers.forEach(function (l) { l.forEach(function (r) { w = Math.max(w, r.length); }); });
    var c = makeCanvas(w, rows.length + layers[0].length);
    layers.forEach(function (l) { paint(l, pal, c, 0, rows.length); });
    bob = bob || 0;
    if (!head) { paint(rows, pal, c, 0, bob); return c; }
    var top = rows.slice(0, split), hb = head.bob == null ? bob : head.bob;
    paint(top, pal, c, dx, hb);
    for (i = hb; i < bob; i++) paint([top[split - 1]], pal, c, dx, i + split);
    paint(rows.slice(split), pal, c, 0, bob + split);
    return c;
  }

  function pack(frames, extra) {
    var s = { frames: frames, flash: frames.map(function (f) { return silhouette(f); }),
      w: frames[0].width, h: frames[0].height };
    for (var k in extra) s[k] = extra[k];
    return s;
  }

  /** A figure on two legs, in every pose: the three all of them share, then any of its own. */
  function human(def, mirror, extra) {
    var poses = [{ legs: LEGS.split, bob: 1 }, { legs: LEGS.pass, bob: 0 }, { legs: LEGS.stand, bob: 0 }].concat(def.poses || []);
    function framesOf(body) {
      var frames = poses.map(function (p) { return compose(body, p.legs, def.pal, p.bob, p, def.split); });
      return mirror ? frames.map(flipped) : frames;
    }
    var frames = framesOf(def.body);
    extra = extra || {};
    extra.bob = poses.map(function (p) { return p.bob; });
    extra.sway = poses.map(function (p) { return p.sway || 0; }); // the sword hand, a pixel forward or back with his stride
    if (mirror && def.hand) extra.hand = [frames[0].width - 1 - def.hand[0], def.hand[1]];
    if (def.shut) extra.shut = framesOf(def.body.map(function (row, y) { return def.shut[y] || row; }));
    return pack(frames, extra);
  }

  /** The knight with some of his colours changed: the scarf at his throat follows the colour of his cape. */
  function knight(colours) {
    var pal = {}, k;
    for (k in WARRIOR.pal) pal[k] = WARRIOR.pal[k];
    for (k in colours || {}) pal[k] = colours[k];
    var def = {};
    for (k in WARRIOR) def[k] = WARRIOR[k];
    def.pal = pal;
    return human(def, false, { shoulder: WARRIOR.shoulder, neck: WARRIOR.neck });
  }

  var built = null;
  /** Build every sprite once. Each has frames, a white flash copy of each, and a few anchor points. */
  function build() {
    if (built) return built;
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

  /**
   * An iron band round a panel of dark wood, with a riveted plate at each corner, lit from
   * the top left: a nineteen-pixel square for the page to stretch round any panel (a CSS
   * border-image cut 7 pixels in from each side). Returns a data URL.
   */
  function frameURL() {
    var N = 19, c = makeCanvas(N, N), g = c.getContext('2d');
    var col = { ink: '#0d0b12', hi: '#8c869c', iron: '#5c566c', lo: '#36313f', wood: '#261d22',
      plate: '#6a6479', plateHi: '#a49eb4', plateLo: '#3f3a4a', rivet: '#c9c3d6', glint: '#f2ecdc', rivetLo: '#2a2633' };
    function px(x, y, k) { g.fillStyle = col[k] || k; g.fillRect(x, y, 1, 1); }
    function rect(x, y, w, h, k) { g.fillStyle = col[k] || k; g.fillRect(x, y, w, h); }
    rect(0, 0, N, N, 'wood');
    // the bands: outer ink, the lit edge, iron, the shaded edge, inner ink
    var band = ['ink', 'hi', 'iron', 'iron', 'lo', 'ink'], i;
    for (i = 0; i < 6; i++) {
      rect(0, i, N, 1, band[i]);                 // top: lit along its top
      rect(0, N - 1 - i, N, 1, band[5 - i] === 'hi' ? 'lo' : band[5 - i] === 'lo' ? 'hi' : band[5 - i]); // bottom: lit along its top, which faces in
    }
    for (i = 0; i < 6; i++) {
      rect(i, 6, 1, N - 12, band[i]);            // left, between the top and bottom bands
      rect(N - 1 - i, 6, 1, N - 12, band[5 - i] === 'hi' ? 'lo' : band[5 - i] === 'lo' ? 'hi' : band[5 - i]);
    }
    // the corner plates, seven pixels square, each with a rivet
    [[0, 0], [N - 7, 0], [0, N - 7], [N - 7, N - 7]].forEach(function (o) {
      var x = o[0], y = o[1];
      rect(x, y, 7, 7, 'ink');
      rect(x + 1, y + 1, 5, 5, 'plate');
      rect(x + 1, y + 1, 5, 1, 'plateHi'); rect(x + 1, y + 1, 1, 5, 'plateHi');
      rect(x + 1, y + 5, 5, 1, 'plateLo'); rect(x + 5, y + 1, 1, 5, 'plateLo');
      px(x + 2, y + 2, 'rivet'); px(x + 3, y + 2, 'rivet'); px(x + 2, y + 3, 'rivet'); px(x + 3, y + 3, 'rivetLo');
      px(x + 2, y + 2, 'glint');
    });
    return c.toDataURL('image/png');
  }

  /**
   * A ribbon to carry a rank: a swallow-tailed cap at each end and a body between, twelve
   * pixels high (a border-image cut 7 pixels in from either end). Returns a data URL.
   */
  function ribbonURL() {
    var rows = [
      '.kkkkkk.kkkkkk.',
      'kRrrrrkkrrrrrRk',
      'kRrrrrrrrrrrrRk',
      'kRrrrrrrrrrrrRk',
      '.kRrrrrrrrrrRk.',
      '..kRrrrrrrrRk..',
      '..kRrrrrrrrRk..',
      '.kRrrrrrrrrrRk.',
      'kRrrrrrrrrrrrRk',
      'kRrrrrrrrrrrrRk',
      'kRdddddddddddRk',
      '.kkkkkk.kkkkkk.'];
    // the body: the middle column, lit along the top and shaded along the bottom
    var pal = { k: K, r: '#a8262b', R: '#5e1220', d: '#6e1420' };
    var c = paint(rows, pal), g = c.getContext('2d');
    g.fillStyle = '#c9383d'; g.fillRect(2, 1, 11, 1);
    return c.toDataURL('image/png');
  }

  /** A sprite as a crisp, enlarged data URL for use in the page's HTML. */
  function iconURL(name, scale) {
    var def = ICONS[name], small = paint(def.rows, def.pal);
    var c = makeCanvas(small.width * scale, small.height * scale), g = c.getContext('2d');
    g.imageSmoothingEnabled = false;
    g.drawImage(small, 0, 0, c.width, c.height);
    return c.toDataURL('image/png');
  }

  WW.Sprites = { build: build, knight: knight, makeCanvas: makeCanvas, tinted: tinted, drawWeapon: drawWeapon, cleanAngle: cleanAngle,
    stroke: stroke, iconURL: iconURL, frameURL: frameURL, ribbonURL: ribbonURL, POSE: POSE, OUTLINE: K };
})(typeof globalThis !== 'undefined' ? globalThis : this);
