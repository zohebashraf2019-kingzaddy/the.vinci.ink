/* The Vinci Ink — tattoo try-on studio (runs 100% in the browser) */
(function () {
  const $ = id => document.getElementById(id);
  const c = $("c"), ctx = c.getContext("2d"), box = $("box"), app = $("app");
  const TONES = ["#f1d0b5", "#e0b08c", "#c99a78", "#a06d4b", "#6e4630", "#4a2e20"];
  const st = {
    mode: "model", gender: "male", view: "front", skin: TONES[2], photo: null,
    lists: { model: [], photo: [] }, sel: -1, area: null, design: null,
    knock: true, bw: false, healed: false
  };
  const items = () => st.lists[st.mode];
  const cur = () => items()[st.sel];
  let skinPath = null;

  /* ---------- design preparation ---------- */
  function rasterize(img) {
    let w = img.naturalWidth || img.width || 600, h = img.naturalHeight || img.height || 600;
    const k = Math.min(1, 900 / Math.max(w, h)); w = Math.round(w * k); h = Math.round(h * k);
    const cv = document.createElement("canvas"); cv.width = w; cv.height = h;
    cv.getContext("2d").drawImage(img, 0, 0, w, h);
    return cv;
  }
  function process(src) {
    const cv = document.createElement("canvas"); cv.width = src.width; cv.height = src.height;
    const x = cv.getContext("2d"); x.drawImage(src, 0, 0);
    if (!st.knock && !st.bw) return cv;
    const d = x.getImageData(0, 0, cv.width, cv.height), p = d.data;
    for (let i = 0; i < p.length; i += 4) {
      const l = .299 * p[i] + .587 * p[i + 1] + .114 * p[i + 2];
      if (st.bw) p[i] = p[i + 1] = p[i + 2] = l;
      if (st.knock) { if (l > 238) p[i + 3] = 0; else if (l > 200) p[i + 3] = Math.min(p[i + 3], Math.round((238 - l) / 38 * 255)); }
    }
    x.putImageData(d, 0, 0);
    return cv;
  }
  const reprocessAll = () => { Object.values(st.lists).flat().forEach(it => it.proc = process(it.src)); draw(); renderLayers(); };

  function loadImage(url) {
    return new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = rej; im.src = url; });
  }
  async function makeSamples() {
    const list = [];
    // 1 — provided sample
    try { list.push({ name: "Ornament", cv: rasterize(await loadImage("/assets/img/sample-tattoo.svg")) }); } catch (e) {}
    // 2 — Vitruvian mark in black ink
    try {
      const m = rasterize(await loadImage("/assets/img/logo-mark.png")), x = m.getContext("2d");
      x.globalCompositeOperation = "source-in"; x.fillStyle = "#141010"; x.fillRect(0, 0, m.width, m.height);
      list.push({ name: "Vitruvian", cv: m });
    } catch (e) {}
    // 3 — script lettering
    await document.fonts?.load?.("italic 500 120px 'Cormorant Garamond'").catch(() => {});
    const t = document.createElement("canvas"); t.width = 800; t.height = 300; const tx = t.getContext("2d");
    tx.fillStyle = "#141010"; tx.textAlign = "center"; tx.textBaseline = "middle"; tx.font = "italic 500 170px 'Cormorant Garamond', Georgia, serif"; tx.fillText("Familia", 400, 150);
    list.push({ name: "Script", cv: t });
    // 4 — fleur-de-lis
    const f = document.createElement("canvas"); f.width = 500; f.height = 500; const fx = f.getContext("2d");
    fx.fillStyle = "#141010"; fx.textAlign = "center"; fx.textBaseline = "middle"; fx.font = "420px Georgia, 'Segoe UI Symbol', serif"; fx.fillText("⚜", 250, 270);
    list.push({ name: "Fleur", cv: f });
    const wrap = $("samples");
    wrap.innerHTML = "";
    list.forEach((s, i) => {
      const b = document.createElement("button"); b.title = s.name; b.setAttribute("aria-label", "Use sample design: " + s.name);
      const im = new Image(); im.src = s.cv.toDataURL(); im.alt = ""; b.append(im);
      b.onclick = () => { [...wrap.children].forEach(x => x.classList.toggle("on", x === b)); useDesign(s.cv, s.name); };
      wrap.append(b);
    });
    return list;
  }

  /* ---------- items ---------- */
  function defaultSpot() {
    if (st.mode === "photo") return { x: c.width / 2, y: c.height / 2, size: Math.min(c.width, c.height) * .3, rot: 0 };
    const a = BODY_AREAS[st.gender][st.view].find(a => a.id === st.area) || BODY_AREAS[st.gender][st.view][st.view === "front" ? 0 : 1];
    return { x: a.x, y: a.y, size: a.size, rot: a.rot };
  }
  function addItem(cv, name, spot) {
    const it = Object.assign({ src: cv, name, op: +$("op").value / 100, fx: 1, fy: 1 }, spot || defaultSpot());
    it.proc = process(cv);
    items().push(it); st.sel = items().length - 1;
    sync(); renderLayers();
  }
  function useDesign(cv, name) { st.design = { cv, name }; addItem(cv, name); }

  /* ---------- drawing ---------- */
  function drawItem(it) {
    const r = it.src.height / it.src.width, w = it.size, h = it.size * r;
    ctx.save(); ctx.translate(it.x, it.y); ctx.rotate(it.rot * Math.PI / 180); ctx.scale(it.fx, it.fy);
    ctx.globalAlpha = it.op; ctx.globalCompositeOperation = "multiply";
    if (st.healed && "filter" in ctx) ctx.filter = `blur(${Math.max(.4, w / 260)}px)`;
    ctx.drawImage(it.proc, -w / 2, -h / 2, w, h);
    ctx.restore();
  }
  function corner(it) {
    const r = it.src.height / it.src.width, a = it.rot * Math.PI / 180, hw = it.size / 2, hh = it.size * r / 2;
    return { x: it.x + Math.cos(a) * hw - Math.sin(a) * hh, y: it.y + Math.sin(a) * hw + Math.cos(a) * hh };
  }
  const uiScale = () => c.width / (c.getBoundingClientRect().width || c.width);
  function draw(exporting) {
    ctx.clearRect(0, 0, c.width, c.height);
    if (st.mode === "model") {
      const g = ctx.createRadialGradient(300, 330, 40, 300, 420, 620); g.addColorStop(0, "#36312b"); g.addColorStop(1, "#1a1815");
      ctx.fillStyle = g; ctx.fillRect(0, 0, c.width, c.height);
      skinPath = drawBodyModel(ctx, { gender: st.gender, view: st.view, skin: st.skin });
      ctx.save(); ctx.clip(skinPath); items().forEach(drawItem); ctx.restore();
      drawBodyOverlay(ctx, { gender: st.gender, view: st.view });
    } else if (st.photo) {
      ctx.drawImage(st.photo, 0, 0, c.width, c.height);
      items().forEach(drawItem);
    } else {
      ctx.fillStyle = "#1d1a16"; ctx.fillRect(0, 0, c.width, c.height);
      ctx.fillStyle = "#a69c8b"; ctx.textAlign = "center"; ctx.font = "500 26px Cinzel, Georgia, serif";
      ctx.fillText("Upload a photo of your skin", c.width / 2, c.height / 2 - 10);
      ctx.font = "16px Manrope, system-ui, sans-serif"; ctx.fillStyle = "#6f6658";
      ctx.fillText("Use the panel on the right, or drop a photo here", c.width / 2, c.height / 2 + 24);
      items().forEach(drawItem);
    }
    if (exporting) return watermark();
    const it = cur();
    if (it) {
      const k = uiScale(), r = it.src.height / it.src.width;
      ctx.save(); ctx.translate(it.x, it.y); ctx.rotate(it.rot * Math.PI / 180);
      ctx.strokeStyle = "rgba(226,200,143,.95)"; ctx.lineWidth = 1.4 * k; ctx.setLineDash([6 * k, 5 * k]);
      ctx.strokeRect(-it.size / 2, -it.size * r / 2, it.size, it.size * r); ctx.restore();
      const p = corner(it);
      ctx.save(); ctx.fillStyle = "#c6a466"; ctx.strokeStyle = "#0a0908"; ctx.lineWidth = 2 * k;
      ctx.beginPath(); ctx.arc(p.x, p.y, 9 * k, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = "#0a0908"; ctx.lineWidth = 1.6 * k; ctx.beginPath(); ctx.arc(p.x, p.y, 4 * k, -.3, Math.PI * 1.3); ctx.stroke(); ctx.restore();
    }
  }
  let logoMark = null; loadImage("/assets/img/logo-mark.png").then(i => logoMark = i).catch(() => {});
  function watermark() {
    const s = Math.max(c.width, c.height) / 900, pad = 18 * s;
    ctx.save();
    ctx.fillStyle = "rgba(10,9,8,.72)"; const w = 250 * s, h = 46 * s;
    ctx.fillRect(c.width - w - pad, c.height - h - pad, w, h);
    if (logoMark) ctx.drawImage(logoMark, c.width - w - pad + 8 * s, c.height - h - pad + 5 * s, 36 * s, 36 * s);
    ctx.fillStyle = "#c6a466"; ctx.font = `500 ${15 * s}px Cinzel, Georgia, serif`; ctx.textBaseline = "middle";
    ctx.fillText("THE VINCI INK", c.width - w - pad + 52 * s, c.height - h - pad + 17 * s);
    ctx.fillStyle = "#a69c8b"; ctx.font = `${11 * s}px Manrope, sans-serif`;
    ctx.fillText("Sparks / Reno · (775) 558-6132", c.width - w - pad + 52 * s, c.height - h - pad + 33 * s);
    ctx.restore();
  }

  /* ---------- UI sync ---------- */
  function sync() {
    const it = cur();
    if (it) { $("size").value = Math.round(it.size); $("rot").value = Math.round(((it.rot + 180) % 360 + 360) % 360 - 180); $("op").value = Math.round(it.op * 100); }
    $("size-o").textContent = $("size").value + " px";
    $("rot-o").textContent = $("rot").value + "°";
    $("op-o").textContent = $("op").value + "%";
    draw();
  }
  function renderLayers() {
    const L = $("layers"); L.innerHTML = "";
    items().forEach((it, i) => {
      const b = document.createElement("button"); b.className = i === st.sel ? "on" : ""; b.title = it.name + " — select";
      b.setAttribute("aria-label", "Select tattoo " + (i + 1));
      const im = new Image(); im.src = it.src.toDataURL("image/png", .5); im.alt = ""; b.append(im);
      b.onclick = () => { st.sel = i; sync(); renderLayers(); };
      L.append(b);
    });
  }
  function renderAreas() {
    const A = $("areas"); A.innerHTML = "";
    BODY_AREAS[st.gender][st.view].forEach(a => {
      const b = document.createElement("button"); b.textContent = a.label; b.className = a.id === st.area ? "on" : "";
      b.onclick = () => {
        st.area = a.id; renderAreas();
        const it = cur();
        if (it) { Object.assign(it, { x: a.x, y: a.y, size: a.size, rot: a.rot }); sync(); }
        else if (st.design) addItem(st.design.cv, st.design.name, { x: a.x, y: a.y, size: a.size, rot: a.rot });
      };
      A.append(b);
    });
  }
  const seg = (id, key, after) => [...$(id).children].forEach(b => b.onclick = () => {
    [...$(id).children].forEach(x => x.classList.toggle("on", x === b)); st[key] = b.dataset.v;
    after && after(); renderAreas(); draw();
  });
  seg("gender", "gender"); seg("view", "view", () => { st.area = null; });
  $("tones").innerHTML = TONES.map((t, i) => `<button style="background:${t}" data-t="${t}" class="${t === st.skin ? "on" : ""}" aria-label="Skin tone ${i + 1}"></button>`).join("");
  [...$("tones").children].forEach(b => b.onclick = () => { st.skin = b.dataset.t; [...$("tones").children].forEach(x => x.classList.toggle("on", x === b)); draw(); });

  document.querySelectorAll("[data-mode]").forEach(b => b.onclick = () => {
    document.querySelectorAll("[data-mode]").forEach(x => x.classList.toggle("on", x === b));
    st.mode = b.dataset.mode; app.classList.toggle("mode-photo", st.mode === "photo");
    if (st.mode === "model") { c.width = 600; c.height = 900; }
    else fitPhotoCanvas();
    st.sel = items().length - 1; renderLayers(); sync();
  });
  function fitPhotoCanvas() {
    if (st.photo) { const k = Math.min(1, 1100 / Math.max(st.photo.width, st.photo.height)); c.width = Math.round(st.photo.width * k); c.height = Math.round(st.photo.height * k); }
    else { c.width = 900; c.height = 900; }
  }

  ["size", "rot", "op"].forEach(id => $(id).oninput = () => {
    const it = cur(); if (it) { if (id === "size") it.size = +$("size").value; if (id === "rot") it.rot = +$("rot").value; if (id === "op") it.op = +$("op").value / 100; }
    sync();
  });
  $("flipx").onclick = () => { const it = cur(); if (it) { it.fx *= -1; draw(); } };
  $("flipy").onclick = () => { const it = cur(); if (it) { it.fy *= -1; draw(); } };
  $("dup").onclick = () => { const it = cur(); if (!it) return; items().push(Object.assign({}, it, { x: it.x + 24, y: it.y + 24 })); st.sel = items().length - 1; sync(); renderLayers(); };
  $("del").onclick = () => { if (st.sel < 0) return; items().splice(st.sel, 1); st.sel = items().length - 1; sync(); renderLayers(); };
  $("clear").onclick = () => { st.lists[st.mode] = []; st.sel = -1; sync(); renderLayers(); };
  $("knock").onchange = e => { st.knock = e.target.checked; reprocessAll(); };
  $("bw").onchange = e => { st.bw = e.target.checked; reprocessAll(); };
  $("healed").onchange = e => { st.healed = e.target.checked; draw(); };

  /* ---------- uploads ---------- */
  async function readFile(file, kind) {
    if (!file) return;
    if (!/^image\//.test(file.type) || file.size > 15e6) { flash("Please use an image under 15 MB."); return; }
    const url = URL.createObjectURL(file);
    try {
      const im = await loadImage(url);
      if (kind === "photo") {
        st.photo = rasterize(im); if (st.mode !== "photo") document.querySelector('[data-mode="photo"]').click(); else { fitPhotoCanvas(); sync(); }
      } else { [...$("samples").children].forEach(x => x.classList.remove("on")); useDesign(rasterize(im), file.name.replace(/\.[^.]+$/, "")); }
    } catch (e) { flash("That image couldn't be opened. Try a JPG or PNG."); }
    finally { URL.revokeObjectURL(url); }
  }
  $("design-in").onchange = e => { readFile(e.target.files[0], "design"); e.target.value = ""; };
  $("photo-in").onchange = e => { readFile(e.target.files[0], "photo"); e.target.value = ""; };
  ["dragenter", "dragover"].forEach(ev => box.addEventListener(ev, e => { e.preventDefault(); box.classList.add("drag"); }));
  ["dragleave", "drop"].forEach(ev => box.addEventListener(ev, e => { e.preventDefault(); box.classList.remove("drag"); }));
  box.addEventListener("drop", e => { const f = e.dataTransfer.files[0]; if (f) readFile(f, st.mode === "photo" && !st.photo ? "photo" : "design"); });
  function flash(msg) { const p = document.createElement("div"); p.textContent = msg; p.style.cssText = "position:absolute;left:50%;top:16px;transform:translateX(-50%);background:#0a0908;border:1px solid #8d7444;color:#e2c88f;padding:10px 16px;border-radius:4px;font-size:13px;z-index:3"; box.append(p); setTimeout(() => p.remove(), 3200); }

  /* ---------- pointer: drag, handle, pinch, wheel ---------- */
  const pts = new Map(); let act = null;
  function pos(e) { const r = c.getBoundingClientRect(); return { x: (e.clientX - r.left) * c.width / r.width, y: (e.clientY - r.top) * c.height / r.height }; }
  function hit(p) {
    for (let i = items().length - 1; i >= 0; i--) {
      const it = items()[i], a = -it.rot * Math.PI / 180, dx = p.x - it.x, dy = p.y - it.y;
      const lx = dx * Math.cos(a) - dy * Math.sin(a), ly = dx * Math.sin(a) + dy * Math.cos(a), r = it.src.height / it.src.width;
      if (Math.abs(lx) <= Math.max(it.size / 2, 18) && Math.abs(ly) <= Math.max(it.size * r / 2, 18)) return i;
    }
    return -1;
  }
  c.addEventListener("pointerdown", e => {
    const p = pos(e); pts.set(e.pointerId, p); c.setPointerCapture(e.pointerId);
    if (pts.size === 2 && cur()) {
      const [a, b] = [...pts.values()];
      act = { type: "pinch", d: Math.hypot(b.x - a.x, b.y - a.y), ang: Math.atan2(b.y - a.y, b.x - a.x), size: cur().size, rot: cur().rot }; return;
    }
    const it = cur();
    if (it) { const k = corner(it); if (Math.hypot(p.x - k.x, p.y - k.y) < 18 * uiScale()) { act = { type: "handle" }; return; } }
    const i = hit(p);
    if (i >= 0) { st.sel = i; act = { type: "move", ox: p.x - items()[i].x, oy: p.y - items()[i].y }; c.classList.add("dragging"); renderLayers(); sync(); return; }
    // empty spot
    const onSkin = st.mode !== "model" || (skinPath && ctx.isPointInPath(skinPath, p.x, p.y));
    if (items().length === 0 && st.design && onSkin && (st.mode === "model" || st.photo)) { addItem(st.design.cv, st.design.name, { x: p.x, y: p.y, size: defaultSpot().size, rot: 0 }); act = { type: "move", ox: 0, oy: 0 }; return; }
    if (it && onSkin) { it.x = p.x; it.y = p.y; act = { type: "move", ox: 0, oy: 0 }; sync(); return; }
    st.sel = -1; renderLayers(); draw();
  });
  c.addEventListener("pointermove", e => {
    const p = pos(e);
    if (pts.has(e.pointerId)) pts.set(e.pointerId, p);
    const it = cur();
    if (!act) { c.classList.toggle("over", hit(p) >= 0); return; }
    if (!it) return;
    if (act.type === "move") { it.x = p.x - act.ox; it.y = p.y - act.oy; draw(); }
    else if (act.type === "handle") {
      const r = it.src.height / it.src.width, dx = p.x - it.x, dy = p.y - it.y, d = Math.hypot(dx, dy);
      it.size = Math.max(12, 2 * d / Math.sqrt(1 + r * r));
      it.rot = (Math.atan2(dy, dx) - Math.atan2(r, 1)) * 180 / Math.PI; sync();
    } else if (act.type === "pinch" && pts.size === 2) {
      const [a, b] = [...pts.values()];
      it.size = Math.max(12, act.size * Math.hypot(b.x - a.x, b.y - a.y) / act.d);
      it.rot = act.rot + (Math.atan2(b.y - a.y, b.x - a.x) - act.ang) * 180 / Math.PI; sync();
    }
  });
  const end = e => { pts.delete(e.pointerId); if (pts.size < 2 && act?.type === "pinch") act = null; if (!pts.size) { act = null; c.classList.remove("dragging"); } };
  c.addEventListener("pointerup", end); c.addEventListener("pointercancel", end);
  c.addEventListener("wheel", e => { const it = cur(); if (!it) return; e.preventDefault(); it.size = Math.max(12, Math.min(1200, it.size * Math.exp(-e.deltaY * .0015))); sync(); }, { passive: false });
  addEventListener("keydown", e => {
    const it = cur(); if (!it || /input|textarea|select/i.test(document.activeElement.tagName)) return;
    const m = e.shiftKey ? 10 : 2, map = { ArrowLeft: [-m, 0], ArrowRight: [m, 0], ArrowUp: [0, -m], ArrowDown: [0, m] };
    if (map[e.key]) { it.x += map[e.key][0]; it.y += map[e.key][1]; e.preventDefault(); draw(); }
    if (e.key === "Delete" || e.key === "Backspace") { $("del").click(); e.preventDefault(); }
  });
  addEventListener("resize", () => draw());

  /* ---------- export / book ---------- */
  function exportCanvas(type, q) { draw(true); const url = c.toDataURL(type, q); draw(); return url; }
  $("dl").onclick = () => {
    draw(true);
    c.toBlob(b => { const a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = "vinci-ink-tattoo-preview.png"; document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000); draw(); }, "image/png");
  };
  $("book").onclick = () => {
    const area = st.mode === "model" ? (BODY_AREAS[st.gender][st.view].find(a => a.id === st.area)?.label || "") : "";
    try {
      // downscale preview for the booking request
      const k = Math.min(1, 900 / Math.max(c.width, c.height)); draw(true);
      const t = document.createElement("canvas"); t.width = Math.round(c.width * k); t.height = Math.round(c.height * k);
      t.getContext("2d").drawImage(c, 0, 0, t.width, t.height); draw();
      sessionStorage.setItem("vinci_tryon", JSON.stringify({ img: t.toDataURL("image/jpeg", .82), placement: area, design: cur()?.name || "" }));
    } catch (e) { /* storage unavailable — booking still works without the preview */ }
    location.href = "/book?from=tryon" + (area ? "&placement=" + encodeURIComponent(area) : "");
  };

  /* ---------- start ---------- */
  renderAreas(); sync();
  makeSamples().then(list => {
    if (!list.length) return;
    st.design = { cv: list[0].cv, name: list[0].name };
    $("samples").children[0].classList.add("on");
    st.area = "chest-r"; renderAreas();
    addItem(list[0].cv, list[0].name);
  });
})();
