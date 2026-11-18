/* Predate cloaks: cloth that streams in the wind behind its wearer. */
(function (root) {
  'use strict';
  var WW = root.WW = root.WW || {};

  // A short chain of points hung from the shoulders. Each frame the points are
  // pushed by wind and their own momentum, then pulled back to arm's length of
  // each other, so the cloth trails when its wearer dashes and settles after.
  function Cape(n, seg, widths, cols) {
    this.n = n; this.seg = seg; this.widths = widths; this.cols = cols;
    this.x = []; this.y = []; this.px = []; this.py = [];
    this.acc = 0; this.ready = false; this.dir = -1;
  }
  Cape.prototype.reset = function (ax, ay, dir) {
    for (var i = 0; i < this.n; i++) {
      this.x[i] = this.px[i] = ax + dir * i * this.seg * 0.8;
      this.y[i] = this.py[i] = ay + i * this.seg * 0.6;
    }
    this.ready = true;
  };
  Cape.prototype.step = function (ax, ay, dir, dt, t, floor) {
    this.dir = dir;
    if (!this.ready || Math.abs(this.x[0] - ax) > 90) this.reset(ax, ay, dir);
    this.acc = Math.min(0.1, this.acc + dt);
    var h = 1 / 60, i, k;
    while (this.acc >= h) {
      this.acc -= h;
      for (i = 1; i < this.n; i++) {
        var vx = (this.x[i] - this.px[i]) * 0.9, vy = (this.y[i] - this.py[i]) * 0.9;
        this.px[i] = this.x[i]; this.py[i] = this.y[i];
        var gust = 150 + 90 * Math.sin(t * 2.1) + 50 * Math.sin(t * 5.3 + i * 0.7);
        var flutter = 110 * Math.sin(t * 9 - i * 0.9) * (i / this.n);
        this.x[i] += vx + dir * gust * h * h;
        this.y[i] += vy + (70 + flutter) * h * h;
        // a cloak is pinned behind the shoulders: it may flare when its wearer stops short,
        // but it is drawn back rather than swinging round in front, and it does not sink into the stone
        var ahead = (this.x[i] - ax) * -dir;
        if (ahead > 0) this.x[i] += dir * ahead * 0.3;
        if (this.y[i] < ay - 3) this.y[i] += (ay - 3 - this.y[i]) * 0.3; // nor does it stand up over the head
        if (floor != null && this.y[i] > floor - this.widths[i] * 0.4) this.y[i] = floor - this.widths[i] * 0.4;
      }
      this.x[0] = ax; this.y[0] = ay;
      for (k = 0; k < 3; k++) {
        for (i = 1; i < this.n; i++) {
          var dx = this.x[i] - this.x[i - 1], dy = this.y[i] - this.y[i - 1];
          var d = Math.sqrt(dx * dx + dy * dy) || 0.001, f = (d - this.seg) / d;
          this.x[i] -= dx * f; this.y[i] -= dy * f;
        }
      }
    }
    this.x[0] = ax; this.y[0] = ay;
  };
  /**
   * Drawn as one unbroken ribbon of cloth. The chain is its upper edge; at every point
   * the cloth hangs off it at right angles, and neighbouring points share that angle,
   * so the pieces meet exactly and nothing gaps or doubles up when the cape bends.
   * Stretches running downhill fall into shade, which is what makes it read as folds.
   */
  Cape.prototype.draw = function (g) {
    var n = this.n, s = -this.dir, i, j, top = [], bot = [], slope = [], cols = {}, xs = [];
    for (i = 0; i < n; i++) {
      var a = Math.max(0, i - 1), b = Math.min(n - 1, i + 1);
      var tx = this.x[b] - this.x[a], ty = this.y[b] - this.y[a];
      var d = Math.sqrt(tx * tx + ty * ty) || 1;
      tx /= d; ty /= d;
      var nx = ty * s, ny = -tx * s; // towards the hanging side of the cloth
      top.push([this.x[i] - nx, this.y[i] - ny]);
      bot.push([this.x[i] + nx * this.widths[i], this.y[i] + ny * this.widths[i]]);
      slope.push(ty);
    }
    // each stretch between two points is a four-sided patch: find the pixels of every column it covers
    for (i = 0; i < n - 1; i++) {
      var q = [top[i], top[i + 1], bot[i + 1], bot[i]];
      var x0 = Math.min(q[0][0], q[1][0], q[2][0], q[3][0]), x1 = Math.max(q[0][0], q[1][0], q[2][0], q[3][0]);
      var along = top[i + 1][0] - top[i][0];
      var fold = (slope[i] + slope[i + 1]) / 2;
      for (var px = Math.round(x0); px <= Math.round(x1 - 0.001); px++) {
        var cx = Math.min(x1, Math.max(x0, px + 0.5)), lo = 1e9, hi = -1e9;
        for (j = 0; j < 4; j++) {
          var p0 = q[j], p1 = q[(j + 1) % 4], ex0 = Math.min(p0[0], p1[0]), ex1 = Math.max(p0[0], p1[0]);
          if (cx < ex0 || cx > ex1) continue;
          if (ex1 - ex0 < 0.001) { lo = Math.min(lo, p0[1], p1[1]); hi = Math.max(hi, p0[1], p1[1]); continue; }
          var y = p0[1] + (p1[1] - p0[1]) * (cx - p0[0]) / (p1[0] - p0[0]);
          if (y < lo) lo = y;
          if (y > hi) hi = y;
        }
        if (hi < lo) continue;
        var u = Math.abs(along) > 0.01 ? Math.max(0, Math.min(1, (cx - top[i][0]) / along)) : 0;
        var y0 = Math.round(lo), y1 = Math.max(y0, Math.round(hi) - 1);
        // the hem is torn: notches cut up into the last stretch, fixed to the cloth so they do not crawl
        if (i === n - 2 && Math.floor(u * 3) === 1) y1 = Math.max(y0, y1 - 2);
        if (i === n - 3 && Math.floor(u * 3) === 2) y1 = Math.max(y0, y1 - 1);
        // neighbouring patches share their boundary columns: keep one span for each column
        var c = cols[px];
        if (!c) { cols[px] = [y0, y1, fold]; xs.push(px); }
        else { if (y0 < c[0]) c[0] = y0; if (y1 > c[1]) c[1] = y1; c[2] = (c[2] + fold) / 2; }
      }
    }
    // a dark edge all round, like the figures have, then the cloth itself
    g.fillStyle = WW.Sprites.OUTLINE;
    for (i = 0; i < xs.length; i++) { var o = cols[xs[i]]; g.fillRect(xs[i] - 1, o[0] - 1, 3, o[1] - o[0] + 3); }
    for (i = 0; i < xs.length; i++) {
      var x = xs[i], t0 = cols[x][0], h = cols[x][1] - t0 + 1, f = cols[x][2];
      // how deep the lit band and the mid band run: more light on a rising fold, more shade on a falling one
      var lit = f < -0.12 ? Math.ceil(h * 0.5) : f > 0.3 ? 0 : Math.min(2, Math.ceil(h * 0.25));
      var mid = f < -0.12 ? h - 1 : f > 0.3 ? Math.ceil(h * 0.35) : Math.ceil(h * 0.62);
      g.fillStyle = this.cols[2]; g.fillRect(x, t0, 1, h);
      if (mid > 0) { g.fillStyle = this.cols[1]; g.fillRect(x, t0, 1, Math.min(h, mid)); }
      if (lit > 0) { g.fillStyle = this.cols[0]; g.fillRect(x, t0, 1, Math.min(h, lit)); }
    }
  };

  WW.Cape = Cape;
})(typeof globalThis !== 'undefined' ? globalThis : this);
