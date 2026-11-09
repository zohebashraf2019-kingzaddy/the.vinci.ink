/* Illustrated mannequin body models for the try-on (600 × 900 canvas space).
   drawBodyModel(ctx, {gender, view, skin}) → paints skin + shading, returns the skin Path2D (use it to clip ink)
   drawBodyOverlay(ctx, {gender, view})     → paints clothing + hair on top of the ink
   BODY_AREAS[gender][view]                → quick-placement spots {id,label,x,y,size,rot} */
(function () {
  const SK = {
    male: {
      head: [300, 92, 36, 46], neck: [300, 128, 19, 300, 182, 22],
      torso: [[270, 176], [330, 176], [364, 182, 376, 204], [368, 250, 360, 280], [344, 330, 342, 372], [354, 420, 350, 466], [250, 466], [246, 420, 258, 372], [256, 330, 240, 280], [232, 250, 224, 204], [236, 182, 270, 176]],
      delt: [233, 214, 27], upper: [231, 222, 24, 214, 340, 18], fore: [214, 340, 18, 198, 458, 12], hand: [198, 460, 13, 192, 505, 11],
      thigh: [278, 460, 34, 272, 640, 22], calfA: [272, 640, 22, 274, 700, 23], calfB: [274, 700, 23, 278, 818, 12], foot: [278, 836, 19, 10],
      shorts: [[248, 432], [352, 432], [358, 548], [306, 548], [300, 500], [294, 548], [242, 548]]
    },
    female: {
      head: [300, 96, 33, 43], neck: [300, 130, 16, 300, 184, 18],
      torso: [[276, 180], [324, 180], [354, 186, 364, 206], [356, 250, 350, 282], [334, 330, 330, 366], [360, 420, 356, 474], [244, 474], [240, 420, 270, 366], [266, 330, 250, 282], [244, 250, 236, 206], [246, 186, 276, 180]],
      delt: [242, 214, 22], upper: [241, 220, 20, 227, 336, 15], fore: [227, 336, 15, 215, 450, 10], hand: [215, 452, 11, 210, 494, 9],
      thigh: [277, 470, 37, 277, 646, 21], calfA: [277, 646, 21, 279, 700, 21], calfB: [279, 700, 21, 283, 818, 10], foot: [283, 834, 16, 9],
      shorts: [[246, 440], [354, 440], [360, 520], [308, 512], [300, 494], [292, 512], [240, 520]],
      top: [[244, 212], [356, 212], [352, 300], [248, 300]]
    }
  };
  const mx = x => 600 - x;

  function capsule(p, x1, y1, r1, x2, y2, r2) {
    const a = Math.atan2(y2 - y1, x2 - x1);
    p.moveTo(x1 + Math.cos(a + Math.PI / 2) * r1, y1 + Math.sin(a + Math.PI / 2) * r1);
    p.arc(x1, y1, r1, a + Math.PI / 2, a + Math.PI * 1.5, false);
    p.arc(x2, y2, r2, a - Math.PI / 2, a + Math.PI / 2, false);
    p.closePath();
  }
  function torso(p, pts, mirror) {
    const X = mirror ? mx : x => x;
    p.moveTo(X(pts[0][0]), pts[0][1]);
    for (let i = 1; i < pts.length; i++) {
      const q = pts[i];
      if (q.length === 2) p.lineTo(X(q[0]), q[1]); else p.quadraticCurveTo(X(q[0]), q[1], X(q[2]), q[3]);
    }
    p.closePath();
  }
  function limbs(s) {
    const L = [];
    ["upper", "fore", "hand", "thigh", "calfA", "calfB"].forEach(k => {
      const v = s[k]; L.push(v); L.push([mx(v[0]), v[1], v[2], mx(v[3]), v[4], v[5]]);
    });
    L.push(s.neck);
    return L;
  }
  function skinPath(s) {
    const p = new Path2D();
    p.ellipse(s.head[0], s.head[1], s.head[2], s.head[3], 0, 0, Math.PI * 2);
    // ears
    [s.head[0] - s.head[2] + 1, s.head[0] + s.head[2] - 1].forEach(ex => { p.moveTo(ex + 6, s.head[1] + 4); p.ellipse(ex, s.head[1] + 4, 6, 11, 0, 0, Math.PI * 2); });
    torso(p, s.torso, false);
    [s.delt, [mx(s.delt[0]), s.delt[1], s.delt[2]]].forEach(d => { p.moveTo(d[0] + d[2], d[1]); p.arc(d[0], d[1], d[2], 0, Math.PI * 2); });
    limbs(s).forEach(v => capsule(p, ...v));
    [s.foot, [mx(s.foot[0]), s.foot[1], s.foot[2], s.foot[3]]].forEach(f => { p.moveTo(f[0] + f[2], f[1]); p.ellipse(f[0], f[1], f[2], f[3], 0, 0, Math.PI * 2); });
    return p;
  }
  function shade(hex, amt) {
    const n = parseInt(hex.slice(1), 16); let r = n >> 16, g = (n >> 8) & 255, b = n & 255;
    const f = v => Math.max(0, Math.min(255, Math.round(amt < 0 ? v * (1 + amt) : v + (255 - v) * amt)));
    return `rgb(${f(r)},${f(g)},${f(b)})`;
  }
  function limbShade(ctx, v, skin) {
    const [x1, y1, r1, x2, y2, r2] = v, a = Math.atan2(y2 - y1, x2 - x1) + Math.PI / 2;
    const mxp = (x1 + x2) / 2, myp = (y1 + y2) / 2, r = Math.max(r1, r2) + 1;
    const g = ctx.createLinearGradient(mxp - Math.cos(a) * r, myp - Math.sin(a) * r, mxp + Math.cos(a) * r, myp + Math.sin(a) * r);
    g.addColorStop(0, shade(skin, -.32)); g.addColorStop(.28, "rgba(0,0,0,0)"); g.addColorStop(.45, shade(skin, .12)); g.addColorStop(.62, "rgba(0,0,0,0)"); g.addColorStop(1, shade(skin, -.36));
    const p = new Path2D(); capsule(p, ...v);
    ctx.fillStyle = g; ctx.globalAlpha = .45; ctx.fill(p); ctx.globalAlpha = 1;
  }

  window.drawBodyModel = function (ctx, o) {
    const s = SK[o.gender] || SK.male, skin = o.skin || "#c99a78";
    // floor shadow
    ctx.save(); ctx.fillStyle = "rgba(0,0,0,.28)"; ctx.beginPath(); ctx.ellipse(300, 852, 120, 14, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    const p = skinPath(s);
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,.35)"; ctx.shadowBlur = 24; ctx.shadowOffsetY = 8;
    ctx.fillStyle = skin; ctx.fill(p);
    ctx.restore();
    ctx.save(); ctx.clip(p);
    // torso volume
    const tg = ctx.createLinearGradient(222, 0, 378, 0);
    tg.addColorStop(0, shade(skin, -.35)); tg.addColorStop(.22, "rgba(0,0,0,0)"); tg.addColorStop(.42, shade(skin, .1)); tg.addColorStop(.7, "rgba(0,0,0,0)"); tg.addColorStop(1, shade(skin, -.38));
    ctx.globalAlpha = .6; ctx.fillStyle = tg; ctx.fillRect(200, 170, 200, 310); ctx.globalAlpha = 1;
    ["upper", "fore", "thigh"].forEach(k => { const v = s[k]; limbShade(ctx, v, skin); limbShade(ctx, [mx(v[0]), v[1], v[2], mx(v[3]), v[4], v[5]], skin); });
    const cv = [s.calfA[0], s.calfA[1], s.calfA[5], s.calfB[3], s.calfB[4], s.calfB[5]];
    limbShade(ctx, cv, skin); limbShade(ctx, [mx(cv[0]), cv[1], cv[2], mx(cv[3]), cv[4], cv[5]], skin);
    // head light
    const hg = ctx.createRadialGradient(s.head[0] - 10, s.head[1] - 14, 4, s.head[0], s.head[1], s.head[3] + 6);
    hg.addColorStop(0, shade(skin, .14)); hg.addColorStop(1, shade(skin, -.25));
    ctx.globalAlpha = .55; ctx.fillStyle = hg; ctx.fillRect(s.head[0] - 50, s.head[1] - 60, 100, 120); ctx.globalAlpha = 1;
    // anatomy lines
    ctx.strokeStyle = shade(skin, -.3); ctx.lineWidth = 1.6; ctx.globalAlpha = .55; ctx.lineCap = "round";
    const L = (pts, q) => { ctx.beginPath(); ctx.moveTo(...pts[0]); for (let i = 1; i < pts.length; i++) ctx.quadraticCurveTo(...pts[i]); ctx.stroke(); };
    if (o.view === "back") {
      L([[300, 196], [302, 300, 300, 400]]);
      if (o.gender === "male") { L([[256, 224], [262, 270, 286, 284]]); L([[344, 224], [338, 270, 314, 284]]); }
      else { L([[262, 228], [268, 266, 288, 276]]); L([[338, 228], [332, 266, 312, 276]]); }
      ctx.beginPath(); ctx.arc(288, 416, 4, 0, Math.PI * 2); ctx.arc(312, 416, 4, 0, Math.PI * 2); ctx.stroke();
    } else if (o.gender === "male") {
      L([[256, 262], [280, 282, 298, 262]]); L([[344, 262], [320, 282, 302, 262]]);
      L([[300, 290], [301, 340, 300, 398]]);
      L([[278, 318], [300, 322, 322, 318]]); L([[280, 354], [300, 357, 320, 354]]);
      ctx.beginPath(); ctx.ellipse(300, 410, 2.5, 4, 0, 0, Math.PI * 2); ctx.stroke();
      L([[262, 192], [280, 204, 296, 200]]); L([[338, 192], [320, 204, 304, 200]]);
    } else {
      L([[300, 320], [301, 360, 300, 400]]);
      ctx.beginPath(); ctx.ellipse(300, 412, 2.5, 4, 0, 0, Math.PI * 2); ctx.stroke();
      L([[268, 194], [284, 204, 296, 200]]); L([[332, 194], [316, 204, 304, 200]]);
    }
    // knees
    [[272, 640], [328, 640]].forEach(([x, y]) => L([[x - 10, y + 6], [x, y + 14, x + 10, y + 6]]));
    ctx.restore();
    return p;
  };

  window.drawBodyOverlay = function (ctx, o) {
    const s = SK[o.gender] || SK.male, cloth = "#17161b", seam = "#2a2830";
    const poly = pts => { ctx.beginPath(); pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.closePath(); };
    ctx.save();
    ctx.fillStyle = cloth; ctx.strokeStyle = seam; ctx.lineWidth = 1.5;
    poly(s.shorts); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(s.shorts[0][0] + 2, s.shorts[0][1] + 10); ctx.lineTo(s.shorts[1][0] - 2, s.shorts[1][1] + 10); ctx.stroke();
    if (s.top) {
      ctx.beginPath();
      if (o.view === "back") { ctx.moveTo(242, 250); ctx.lineTo(358, 250); ctx.lineTo(356, 284); ctx.lineTo(244, 284); ctx.closePath(); }
      else { ctx.moveTo(246, 226); ctx.quadraticCurveTo(272, 214, 288, 232); ctx.quadraticCurveTo(300, 244, 312, 232); ctx.quadraticCurveTo(328, 214, 354, 226); ctx.lineTo(350, 296); ctx.quadraticCurveTo(300, 304, 250, 296); ctx.closePath(); }
      ctx.fill(); ctx.stroke();
      // straps
      ctx.lineWidth = 5; ctx.strokeStyle = cloth;
      ctx.beginPath(); ctx.moveTo(262, 222); ctx.lineTo(276, 186); ctx.moveTo(338, 222); ctx.lineTo(324, 186); ctx.stroke();
    }
    // hair
    const [hx, hy, rx, ry] = s.head;
    ctx.fillStyle = "#231a16";
    ctx.beginPath();
    if (o.gender === "female") {
      if (o.view === "back") { ctx.ellipse(hx, hy - 4, rx + 3, ry + 2, 0, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.ellipse(hx, hy - ry + 2, 15, 13, 0, 0, Math.PI * 2); }
      else { ctx.ellipse(hx, hy - ry * .45, rx + 3, ry * .62, 0, Math.PI, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.ellipse(hx, hy - ry + 2, 15, 13, 0, 0, Math.PI * 2); }
    } else {
      if (o.view === "back") ctx.ellipse(hx, hy - 6, rx + 2, ry - 2, 0, 0, Math.PI * 2);
      else ctx.ellipse(hx, hy - ry * .5, rx + 2, ry * .55, 0, Math.PI, Math.PI * 2);
    }
    ctx.fill();
    ctx.restore();
  };

  /* quick-placement areas computed from the skeleton */
  const mid = v => [(v[0] + v[3]) / 2, (v[1] + v[4]) / 2];
  const ang = v => -Math.atan2(v[3] - v[0], v[4] - v[1]) * 180 / Math.PI;
  function areas(g, view) {
    const s = SK[g], f = g === "female";
    const U = s.upper, F = s.fore, T = s.thigh, C = s.calfB, H = s.hand;
    const R = v => [mx(v[0]), v[1], v[2], mx(v[3]), v[4], v[5]];
    const sz = f ? .88 : 1;
    if (view === "back") return [
      { id: "neck", label: "Back of neck", x: 300, y: 160, size: 30 * sz, rot: 0 },
      { id: "upper-back", label: "Upper back", x: 300, y: 236, size: 118 * sz, rot: 0 },
      { id: "shoulder-blade", label: "Shoulder blade", x: 266, y: 250, size: 58 * sz, rot: 0 },
      { id: "spine", label: "Spine", x: 300, y: 320, size: 64 * sz, rot: 0 },
      { id: "lower-back", label: "Lower back", x: 300, y: 412, size: 86 * sz, rot: 0 },
      { id: "back-arm", label: "Back of arm", x: mid(R(U))[0], y: mid(R(U))[1], size: 46 * sz, rot: ang(R(U)) },
      { id: "back-forearm", label: "Back forearm", x: mid(R(F))[0], y: mid(R(F))[1], size: 38 * sz, rot: ang(R(F)) },
      { id: "back-thigh", label: "Back of thigh", x: mid(T)[0], y: mid(T)[1] + 10, size: 62 * sz, rot: ang(T) },
      { id: "calf", label: "Calf", x: mid(C)[0], y: mid(C)[1] - 12, size: 42 * sz, rot: ang(C) }
    ];
    return [
      { id: "chest", label: "Chest", x: 300, y: f ? 192 : 250, size: f ? 70 : 112, rot: 0 },
      { id: "chest-r", label: "Pec / collarbone", x: f ? 326 : 330, y: f ? 196 : 248, size: f ? 40 : 62, rot: 0 },
      { id: "shoulder", label: "Shoulder", x: s.delt[0], y: s.delt[1], size: 48 * sz, rot: 8 },
      { id: "upper-arm", label: "Upper arm", x: mid(U)[0], y: mid(U)[1], size: 46 * sz, rot: ang(U) },
      { id: "forearm-l", label: "Forearm", x: mid(F)[0], y: mid(F)[1], size: 38 * sz, rot: ang(F) },
      { id: "hand", label: "Hand", x: mid(H)[0], y: mid(H)[1], size: 22 * sz, rot: ang(H) },
      { id: "ribs", label: "Ribs", x: f ? 338 : 344, y: f ? 318 : 302, size: 50 * sz, rot: -10 },
      { id: "abdomen", label: "Stomach", x: 300, y: f ? 380 : 345, size: 74 * sz, rot: 0 },
      { id: "thigh", label: "Thigh", x: mid(R(T))[0], y: mid(R(T))[1] + 8, size: 64 * sz, rot: ang(R(T)) },
      { id: "shin", label: "Shin", x: mid(R(C))[0], y: mid(R(C))[1] - 12, size: 38 * sz, rot: ang(R(C)) }
    ];
  }
  window.BODY_AREAS = {
    male: { front: areas("male", "front"), back: areas("male", "back") },
    female: { front: areas("female", "front"), back: areas("female", "back") }
  };
})();
