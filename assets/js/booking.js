/* The Vinci Ink — single booking hub for every artist */
(function () {
  const V = window.VINCI, S = V.studio, D = V.deposit;
  const $ = id => document.getElementById(id);
  const iso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const initials = n => n.split(/\s+/).map(w => w[0]).slice(0, 2).join("").toUpperCase();
  const q = new URLSearchParams(location.search);
  const form = $("book-form");
  const st = { artist: null, date: null, time: null, refImg: null, tryon: null, month: new Date() };
  st.month.setDate(1);

  $("policy").innerHTML = D.policy.map(p => `<li>${esc(p)}</li>`).join("");

  /* ---------- artists ---------- */
  const any = { id: "any", name: "Any artist", role: "Match me by style", calendarUrl: "" };
  const list = [any, ...[...V.artists].sort((a, b) => (b.owner ? 1 : 0) - (a.owner ? 1 : 0))];
  $("artist-pick").innerHTML = list.map(a => `
    <label>
      <input type="radio" name="artist" value="${esc(a.id)}" required>
      <span class="m">${a.id === "any" ? "⚜" : esc(initials(a.name))}</span>
      <span><strong>${esc(a.name)}</strong><small>${a.handle ? "@" + esc(a.handle) : esc(a.role)}</small></span>
      ${a.calendarUrl ? '<span class="live">LIVE</span>' : ""}
    </label>`).join("");
  form.querySelectorAll('input[name=artist]').forEach(r => r.onchange = () => { st.artist = list.find(a => a.id === r.value); st.time = null; renderWhen(); summary(); });

  /* ---------- prefill from URL / try-on ---------- */
  const pre = q.get("artist") && list.find(a => a.id === q.get("artist"));
  if (pre) { const r = form.querySelector(`input[value="${pre.id}"]`); r.checked = true; st.artist = pre; }
  const pl = q.get("placement");
  if (pl) { const sel = $("b-place"); if (![...sel.options].some(o => o.text === pl)) sel.add(new Option(pl)); sel.value = pl; }
  try {
    const t = JSON.parse(sessionStorage.getItem("vinci_tryon") || "null");
    if (t && t.img && q.get("from") === "tryon") {
      st.tryon = t.img;
      $("tryon-preview").innerHTML = `<div class="ref"><img src="${t.img}" alt="Your try-on preview"><div><b style="font-size:14px">Try-on preview attached</b><div style="font-size:12px;color:var(--muted)">Your artist will see where you want it.</div></div><button type="button" id="rm-tryon">Remove</button></div>`;
      $("rm-tryon").onclick = () => { st.tryon = null; $("tryon-preview").innerHTML = ""; try { sessionStorage.removeItem("vinci_tryon"); } catch (e) {} };
    }
  } catch (e) {}

  /* ---------- reference upload (compressed before sending) ---------- */
  $("b-ref").onchange = e => {
    const f = e.target.files[0]; if (!f) return;
    if (!/^image\//.test(f.type) || f.size > 15e6) { alertRef("Please choose an image under 15 MB."); return; }
    const url = URL.createObjectURL(f), im = new Image();
    im.onload = () => {
      const k = Math.min(1, 1400 / Math.max(im.width, im.height)), cv = document.createElement("canvas");
      cv.width = Math.round(im.width * k); cv.height = Math.round(im.height * k);
      cv.getContext("2d").drawImage(im, 0, 0, cv.width, cv.height);
      st.refImg = cv.toDataURL("image/jpeg", .8); URL.revokeObjectURL(url);
      $("ref-preview").innerHTML = `<div class="ref"><img src="${st.refImg}" alt="Your reference"><div><b style="font-size:14px">${esc(f.name)}</b><div style="font-size:12px;color:var(--muted)">Ready to send</div></div><button type="button" id="rm-ref">Remove</button></div>`;
      $("rm-ref").onclick = () => { st.refImg = null; $("ref-preview").innerHTML = ""; $("b-ref").value = ""; };
    };
    im.onerror = () => alertRef("That image couldn't be opened — try a JPG or PNG.");
    im.src = url;
  };
  const alertRef = m => $("ref-preview").innerHTML = `<p class="form-note" style="color:var(--err);margin-top:10px">${esc(m)}</p>`;

  /* ---------- step III: live calendar or request picker ---------- */
  function renderWhen() {
    const a = st.artist, w = $("when"), btn = $("submit-btn");
    if (a && a.calendarUrl) {
      const first = a.name.split(" ")[0];
      $("s3-title").textContent = `Book a live time with ${first}`;
      $("s3-sub").textContent = `Pick an open slot on ${first}'s calendar and pay the $${D.amount} deposit there. Then send your tattoo details below.`;
      if (/calendly\.com/.test(a.calendarUrl)) {
        const u = new URL(a.calendarUrl);
        u.searchParams.set("hide_gdpr_banner", "1"); u.searchParams.set("background_color", "12100e"); u.searchParams.set("text_color", "f1ebdf"); u.searchParams.set("primary_color", "c6a466");
        u.searchParams.set("embed_domain", location.hostname); u.searchParams.set("embed_type", "Inline");
        w.innerHTML = `<div class="embed"><iframe src="${esc(u.toString())}" title="${esc(a.name)} booking calendar" loading="lazy"></iframe></div>`;
      } else {
        w.innerHTML = `<div class="cal" style="text-align:center;padding:36px"><p style="color:var(--muted);margin:0 0 18px">${esc(first)} books through an online calendar.</p><a class="btn" href="${esc(a.calendarUrl)}" target="_blank" rel="noopener">Open ${esc(first)}'s calendar</a></div>`;
      }
      st.date = null; st.time = "Booked on artist calendar";
      btn.textContent = `Send my details to ${first}`;
    } else {
      $("s3-title").textContent = "Pick a date & time";
      $("s3-sub").textContent = a && a.id !== "any" ? `Choose your preferred day — ${a.name.split(" ")[0]} confirms the exact time by text.` : "Choose your preferred day — the studio confirms the exact time by text.";
      if (st.time === "Booked on artist calendar") st.time = null;
      w.innerHTML = `<div class="cal"><div class="cal-h"><button type="button" id="prev" aria-label="Previous month">‹</button><strong id="mlabel"></strong><button type="button" id="next" aria-label="Next month">›</button></div>
        <div class="dow">${["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => `<span>${d}</span>`).join("")}</div><div class="days" id="days"></div>
        <div id="slot-wrap"></div></div>`;
      $("prev").onclick = () => { st.month.setMonth(st.month.getMonth() - 1); drawMonth(); };
      $("next").onclick = () => { st.month.setMonth(st.month.getMonth() + 1); drawMonth(); };
      drawMonth();
      btn.textContent = "Request my appointment";
    }
    summary();
  }
  function drawMonth() {
    const m = st.month, today = new Date(); today.setHours(0, 0, 0, 0);
    const max = new Date(today); max.setMonth(max.getMonth() + 4);
    $("mlabel").textContent = m.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    $("prev").disabled = m.getFullYear() === today.getFullYear() && m.getMonth() <= today.getMonth();
    $("next").disabled = m > max;
    const start = new Date(m.getFullYear(), m.getMonth(), 1), days = new Date(m.getFullYear(), m.getMonth() + 1, 0).getDate();
    let h = Array(start.getDay()).fill("<span></span>").join("");
    for (let d = 1; d <= days; d++) {
      const dt = new Date(m.getFullYear(), m.getMonth(), d), ds = iso(dt);
      const off = dt < today || !S.openDays.includes(dt.getDay()) || dt > max;
      h += `<button type="button" data-d="${ds}" ${off ? "disabled" : ""} class="${st.date === ds ? "on" : ""} ${+dt === +today ? "today" : ""}" aria-label="${dt.toDateString()}">${d}</button>`;
    }
    $("days").innerHTML = h;
    $("days").querySelectorAll("button[data-d]").forEach(b => b.onclick = () => { st.date = b.dataset.d; st.time = null; drawMonth(); summary(); });
    drawSlots();
  }
  function drawSlots() {
    const w = $("slot-wrap"); if (!w) return;
    if (!st.date) { w.innerHTML = `<p class="form-note" style="margin-top:14px">Closed Sundays. Select a day to see times.</p>`; return; }
    const now = new Date(), isToday = st.date === iso(now);
    const slots = S.slotTimes.filter(t => { if (!isToday) return true; const [h, ap] = [parseInt(t), /PM/.test(t)]; const hr = (h % 12) + (ap ? 12 : 0); return hr > now.getHours() + 1; });
    w.innerHTML = `<div class="slots">${slots.map(t => `<button type="button" class="${st.time === t ? "on" : ""}">${t}</button>`).join("") || '<p class="form-note">No times left today — pick another day.</p>'}<button type="button" class="${st.time === "Flexible" ? "on" : ""}">Flexible</button></div>`;
    w.querySelectorAll("button").forEach(b => b.onclick = () => { st.time = b.textContent; drawSlots(); summary(); });
  }
  const fmtDate = v => v ? new Date(v + "T12:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }) : "—";
  function summary() {
    $("sum-artist").textContent = st.artist ? st.artist.name : "—";
    $("sum-place").textContent = $("b-place").value || "—";
    $("sum-size").textContent = $("b-size").value || "—";
    $("sum-date").textContent = st.artist && st.artist.calendarUrl ? "On artist calendar" : fmtDate(st.date);
    $("sum-time").textContent = st.time && !(st.artist && st.artist.calendarUrl) ? st.time : (st.artist && st.artist.calendarUrl ? "On artist calendar" : "—");
  }
  ["b-place", "b-size"].forEach(id => $(id).addEventListener("change", summary));

  /* ---------- submit ---------- */
  form.addEventListener("submit", async e => {
    e.preventDefault();
    const status = form.querySelector(".status");
    const bad = (msg, el) => { status.className = "status err show"; status.textContent = msg; (el || status).scrollIntoView({ behavior: "smooth", block: "center" }); return false; };
    if (!st.artist) return bad("Please choose an artist (or “Any artist”).", $("s1"));
    if (!$("b-place").value || !$("b-size").value || !$("b-idea").value.trim()) return bad("Please add the placement, size and a short description of your idea.", $("s2"));
    if (!st.artist.calendarUrl && (!st.date || !st.time)) return bad("Please pick a preferred date and time.", $("s3"));
    const f = new FormData(form);
    if (!f.get("name") || !f.get("phone") || !/\S+@\S+\.\S+/.test(f.get("email") || "")) return bad("Please add your name, mobile number and a valid email.");
    if (!f.get("ageOk") || !f.get("depositOk")) return bad("Please confirm you're 18+ and agree to the $" + D.amount + " deposit.");
    const ok = await window.vinciSubmit(form, {
      type: "booking", artist: st.artist.name, artistId: st.artist.id, artistInstagram: st.artist.instagram || "",
      date: st.artist.calendarUrl ? "Booked on artist calendar" : fmtDate(st.date), time: st.time || "",
      reference: undefined, referenceImage: st.refImg || "", tryonImage: st.tryon || "", deposit: D.amount
    });
    if (ok) done();
  });
  // the shared submitter deletes `reference` (file field); images are passed explicitly
  function done() {
    const a = st.artist, payBtn = D.depositUrl ? `<a class="btn" href="${esc(D.depositUrl)}" target="_blank" rel="noopener">Pay $${D.amount} deposit now</a>` : "";
    form.innerHTML = `<div class="step done">
      <img class="seal" src="/assets/img/logo-badge.png" alt="">
      <div class="eyebrow" style="justify-content:center">Request received</div>
      <h2 style="margin-top:14px">Thank you — you're on the books.</h2>
      <p class="lede" style="margin:16px auto 0">${a.id === "any" ? "The studio" : esc(a.name.split(" ")[0])} will text you to confirm your time${a.calendarUrl ? "" : ` for ${esc(fmtDate(st.date))}`}.</p>
      <p style="color:var(--muted);max-width:520px;margin:18px auto 28px">${D.depositUrl ? `Your appointment is confirmed once the $${D.amount} deposit is paid.` : `You'll receive a secure link to pay your $${D.amount} deposit — your appointment is confirmed once it's paid.`}</p>
      <div class="hero-cta" style="justify-content:center;margin-top:0">${payBtn}<a class="btn ghost" href="/try-on">Try another design</a></div>
    </div>`;
    try { sessionStorage.removeItem("vinci_tryon"); } catch (e) {}
    scrollTo({ top: 0, behavior: "smooth" });
  }

  renderWhen();
})();
