/* The Vinci Ink — shared layout + page behaviour */
(function () {
  const V = window.VINCI, S = V.studio;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const initials = n => n.split(/\s+/).filter(Boolean).map(w => w[0]).slice(0, 2).join("").toUpperCase();
  const page = document.body.dataset.page || "home";
  const home = page === "home" ? "" : "/";

  /* ---------- header ---------- */
  const head = document.createElement("header");
  head.className = "site-head" + (page === "home" ? "" : " always");
  head.innerHTML = `
    <div class="wrap head-in">
      <a class="brand" href="/" aria-label="The Vinci Ink home"><img src="/assets/img/logo-badge.png" alt="" width="44" height="44"><span>THE VINCI INK</span></a>
      <nav class="nav" id="nav" aria-label="Main">
        <a href="${home}#work">Work</a>
        <a href="${home}#artists">Artists</a>
        <a href="${home}#services">Services</a>
        <a href="/try-on" class="${page === "tryon" ? "on" : ""}">Try-On</a>
        <a href="${home}#visit">Visit</a>
        <a class="btn sm" href="/book">Book now</a>
      </nav>
      <button class="menu-btn" aria-label="Menu" aria-controls="nav" aria-expanded="false"><i></i><i></i><i></i></button>
    </div>`;
  document.body.prepend(head);
  const mb = $(".menu-btn", head);
  mb.onclick = () => { const o = document.body.classList.toggle("menu-open"); mb.setAttribute("aria-expanded", o); };
  $$(".nav a", head).forEach(a => a.addEventListener("click", () => document.body.classList.remove("menu-open")));
  const onScroll = () => head.classList.toggle("solid", scrollY > 40);
  addEventListener("scroll", onScroll, { passive: true }); onScroll();

  /* ---------- footer ---------- */
  const foot = document.createElement("footer");
  foot.className = "foot";
  foot.innerHTML = `
    <div class="wrap">
      <div class="foot-grid">
        <div class="foot-brand"><img src="/assets/img/logo-badge.png" alt="The Vinci Ink logo" width="64" height="64"><p>${esc(S.tagline)} Custom black &amp; grey realism, cover-ups and sleeves in Sparks / Reno.</p></div>
        <div><h4>Studio</h4><ul>
          <li><a href="${esc(S.mapsUrl)}" target="_blank" rel="noopener">${esc(S.address)}<br>${esc(S.city)}</a></li>
          <li><a href="tel:${S.phoneRaw}">${esc(S.phone)}</a></li>
          ${S.hours.map(h => `<li>${esc(h[0])}: ${esc(h[1])}</li>`).join("")}
        </ul></div>
        <div><h4>Explore</h4><ul>
          <li><a href="/book">Book an appointment</a></li>
          <li><a href="/try-on">Free tattoo try-on</a></li>
          <li><a href="${home}#artists">Meet the artists</a></li>
          <li><a href="${home}#contact">Ask a question</a></li>
        </ul></div>
        <div><h4>Follow</h4><ul>
          <li><a href="${esc(S.instagram)}" target="_blank" rel="noopener">Instagram · @the.vinci.ink</a></li>
          <li><a href="${esc(S.tiktok)}" target="_blank" rel="noopener">TikTok</a></li>
          ${V.artists.slice(0, 4).map(a => `<li><a href="${esc(a.instagram)}" target="_blank" rel="noopener">@${esc(a.handle)}</a></li>`).join("")}
        </ul></div>
      </div>
      <div class="foot-base"><span>© ${new Date().getFullYear()} The Vinci Ink · Sparks, Nevada · 18+ with valid ID</span><span>Website by <a href="https://www.nexoradigital.live" target="_blank" rel="noopener">Nexora Digital</a></span></div>
    </div>`;
  document.body.append(foot);

  /* ---------- mobile book bar ---------- */
  if (page !== "book") {
    const bar = document.createElement("div");
    bar.className = "mbar";
    bar.innerHTML = `<a class="btn ghost" href="tel:${S.phoneRaw}">Call</a><a class="btn" href="/book">Book now</a>`;
    document.body.append(bar); document.body.classList.add("has-mbar");
  }

  /* ---------- reveal on scroll ---------- */
  const io = "IntersectionObserver" in window ? new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -8% 0px" }) : null;
  window.vinciReveal = () => $$(".rv:not(.in)").forEach(el => io ? io.observe(el) : el.classList.add("in"));
  window.vinciReveal();

  /* ---------- fill studio facts ---------- */
  $$("[data-s]").forEach(el => {
    const k = el.dataset.s;
    if (k === "phone") { el.textContent = S.phone; if (el.tagName === "A") el.href = "tel:" + S.phoneRaw; }
    if (k === "address") el.innerHTML = esc(S.address) + "<br>" + esc(S.city);
    if (k === "hours") el.innerHTML = S.hours.map(h => `<div class="hours-row"><span>${esc(h[0])}</span><span>${esc(h[1])}</span></div>`).join("");
    if (k === "texts") el.innerHTML = S.textLines.map(t => `<a href="sms:${t.replace(/\D/g, "")}">${esc(t)}</a>`).join(" · ");
    if (k === "deposit") el.textContent = "$" + V.deposit.amount;
  });

  /* ---------- artists ---------- */
  const grid = $("#artist-grid");
  if (grid) {
    const sorted = [...V.artists].sort((a, b) => (b.owner ? 1 : 0) - (a.owner ? 1 : 0));
    grid.innerHTML = sorted.map(a => `
      <article class="artist rv${a.owner ? " owner" : ""}">
        <div class="mono" aria-hidden="true">${esc(initials(a.name))}</div>
        <div>
          <div class="role">${esc(a.role)}</div>
          <h3>${esc(a.name)}</h3>
          <a class="handle" href="${esc(a.instagram)}" target="_blank" rel="noopener">@${esc(a.handle)}</a>
          ${a.bio ? `<p>${esc(a.bio)}</p>` : ""}
          <div class="tags">${(a.styles || []).map(s => `<span>${esc(s)}</span>`).join("")}</div>
        </div>
        <div class="acts">
          <a class="btn" href="/book?artist=${encodeURIComponent(a.id)}">Book ${esc(a.name.split(" ")[0])}</a>
          <a class="btn ghost" href="${esc(a.instagram)}" target="_blank" rel="noopener">Instagram</a>
        </div>
      </article>`).join("");
    window.vinciReveal();
  }

  /* ---------- prices ---------- */
  const pl = $("#price-list");
  if (pl) pl.innerHTML = V.services.map(s => `
    <div class="price-row"><b>${esc(s.name)}</b><em class="${s.price ? "" : "ask"}">${s.price ? esc(s.price) : "Ask the artist"}</em><span>${esc(s.note)}</span></div>`).join("");

  /* ---------- gallery filter + lightbox ---------- */
  const tiles = $$(".tile");
  $$(".chip[data-f]").forEach(c => c.onclick = () => {
    $$(".chip[data-f]").forEach(x => x.classList.toggle("on", x === c));
    tiles.forEach(t => t.classList.toggle("hide", c.dataset.f !== "all" && t.dataset.kind !== c.dataset.f));
  });
  const lb = $("#lb");
  if (lb && tiles.length) {
    let idx = 0;
    const stage = $(".lb-stage", lb), cap = $(".lb-cap", lb);
    const visible = () => tiles.filter(t => !t.classList.contains("hide"));
    const show = i => {
      const list = visible(); idx = (i + list.length) % list.length; const t = list[idx];
      stage.innerHTML = t.dataset.video
        ? `<video src="${t.dataset.video}" poster="${t.dataset.poster || ""}" controls autoplay playsinline></video>`
        : `<img src="${t.dataset.full || $("img", t).src}" alt="${esc($("img", t).alt)}">`;
      cap.textContent = $(".cap", t)?.innerText.replace(/\n/g, " · ") || "";
    };
    const close = () => { lb.classList.remove("open"); stage.innerHTML = ""; document.body.style.overflow = ""; };
    tiles.forEach(t => t.onclick = () => { lb.classList.add("open"); document.body.style.overflow = "hidden"; show(visible().indexOf(t)); });
    $(".lb-close", lb).onclick = close;
    $(".lb-prev", lb).onclick = () => show(idx - 1);
    $(".lb-next", lb).onclick = () => show(idx + 1);
    lb.onclick = e => { if (e.target === lb) close(); };
    addEventListener("keydown", e => { if (!lb.classList.contains("open")) return; if (e.key === "Escape") close(); if (e.key === "ArrowRight") show(idx + 1); if (e.key === "ArrowLeft") show(idx - 1); });
  }

  /* ---------- forms → /api/inquiry ---------- */
  window.vinciSubmit = async function (form, extra = {}) {
    const st = $(".status", form), btn = $("button[type=submit]", form);
    const data = Object.fromEntries(new FormData(form).entries());
    Object.assign(data, extra);
    delete data.reference;
    st.className = "status"; btn.disabled = true; const label = btn.textContent; btn.textContent = "Sending…";
    const smsBody = encodeURIComponent(`Hi Vinci Ink, this is ${data.name || ""}. ${data.message || data.idea || ""}`.slice(0, 600));
    const fallback = `Please call <a href="tel:${S.phoneRaw}">${esc(S.phone)}</a> or <a href="sms:${S.phoneRaw.replace("+", "")}?&body=${smsBody}">send it as a text</a> instead.`;
    try {
      const r = await fetch("/api/inquiry", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok || !j.ok) throw new Error(j.error || "send failed");
      st.className = "status ok show";
      st.innerHTML = form.dataset.success || "Thank you — your message is in. The studio will reply soon.";
      form.reset(); form.dispatchEvent(new Event("vinci:sent"));
      return true;
    } catch (e) {
      st.className = "status err show";
      st.innerHTML = "We couldn't send that online right now. " + fallback;
      return false;
    } finally { btn.disabled = false; btn.textContent = label; }
  };
  const cf = $("#contact-form");
  if (cf) cf.addEventListener("submit", e => { e.preventDefault(); window.vinciSubmit(cf, { type: "question" }); });

  /* hero video: pause when tab hidden to save battery */
  const hv = $(".hero-media video");
  if (hv) document.addEventListener("visibilitychange", () => document.hidden ? hv.pause() : hv.play().catch(() => {}));
})();
