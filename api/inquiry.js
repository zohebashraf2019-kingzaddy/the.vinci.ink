/* Vercel serverless function — emails contact questions and booking requests to the studio.
   Set these in Vercel → Project → Settings → Environment Variables:
     RESEND_API_KEY   your key from resend.com (free tier is fine)
     STUDIO_EMAIL     where requests go, e.g. thevinciink@gmail.com (comma-separate for several)
     FROM_EMAIL       optional, a verified sender, e.g. "The Vinci Ink <bookings@yourdomain.com>"
   Without RESEND_API_KEY the form tells visitors to call or text instead. */

const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const clip = (s, n) => String(s ?? "").trim().slice(0, n);

function dataUrlToAttachment(dataUrl, name) {
  const m = /^data:(image\/(png|jpe?g|webp));base64,([A-Za-z0-9+/=]+)$/.exec(String(dataUrl || ""));
  if (!m || m[3].length > 3_000_000) return null;
  return { filename: `${name}.${m[2] === "png" ? "png" : m[2] === "webp" ? "webp" : "jpg"}`, content: m[3] };
}

module.exports = async (req, res) => {
  if (req.method !== "POST") { res.setHeader("Allow", "POST"); return res.status(405).json({ ok: false, error: "Method not allowed" }); }
  let b = req.body;
  if (typeof b === "string") { try { b = JSON.parse(b); } catch { b = {}; } }
  b = b || {};

  if (b.company) return res.status(200).json({ ok: true }); // honeypot: silently drop bots

  const name = clip(b.name, 120), phone = clip(b.phone, 40), email = clip(b.email, 160);
  if (!name || !phone) return res.status(400).json({ ok: false, error: "Name and phone are required." });
  if (email && !/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ ok: false, error: "Invalid email." });

  const key = process.env.RESEND_API_KEY, to = process.env.STUDIO_EMAIL;
  if (!key || !to) return res.status(503).json({ ok: false, error: "Email is not configured yet." });

  const isBooking = b.type === "booking";
  const rows = isBooking
    ? [["Artist", b.artist], ["Placement", b.placement], ["Size", b.size], ["Style", b.style], ["First tattoo", b.firstTattoo],
       ["Preferred date", b.date], ["Preferred time", b.time], ["Name", name], ["Phone", phone], ["Email", email], ["Instagram", b.instagram],
       ["18+ with ID", b.ageOk ? "Confirmed" : "—"], ["$" + (b.deposit || 80) + " deposit", b.depositOk ? "Agreed — send deposit link" : "—"]]
    : [["Topic", b.topic], ["Name", name], ["Phone", phone], ["Email", email]];
  const body = isBooking ? clip(b.idea, 4000) : clip(b.message, 4000);

  const html = `
  <div style="font-family:Georgia,serif;max-width:620px;margin:auto;background:#0a0908;color:#f1ebdf;padding:28px;border:1px solid #8d7444">
    <h2 style="color:#c6a466;letter-spacing:2px;font-weight:normal;margin:0 0 4px">THE VINCI INK</h2>
    <p style="margin:0 0 20px;color:#a69c8b;font-family:Arial,sans-serif;font-size:13px">${isBooking ? "New booking request" : "New question from the website"}</p>
    <table style="width:100%;border-collapse:collapse;font-family:Arial,sans-serif;font-size:14px">
      ${rows.filter(r => r[1]).map(r => `<tr><td style="padding:8px 0;color:#a69c8b;border-bottom:1px solid #2c2620;width:150px">${esc(r[0])}</td><td style="padding:8px 0;border-bottom:1px solid #2c2620">${esc(r[1])}</td></tr>`).join("")}
    </table>
    <h3 style="color:#c6a466;font-weight:normal;margin:22px 0 8px">${isBooking ? "Tattoo idea" : "Message"}</h3>
    <p style="font-family:Arial,sans-serif;font-size:14px;line-height:1.6;white-space:pre-wrap;margin:0">${esc(body)}</p>
    <p style="font-family:Arial,sans-serif;font-size:13px;margin-top:24px"><a style="color:#c6a466" href="sms:${esc(phone.replace(/[^\d+]/g, ""))}">Text ${esc(name.split(" ")[0])}</a> · <a style="color:#c6a466" href="tel:${esc(phone.replace(/[^\d+]/g, ""))}">Call</a></p>
  </div>`;

  const attachments = [dataUrlToAttachment(b.referenceImage, "reference"), dataUrlToAttachment(b.tryonImage, "try-on-preview")].filter(Boolean);
  const subject = isBooking
    ? `Booking request: ${clip(b.artist, 60) || "Any artist"} · ${clip(b.placement, 40)} · ${clip(b.date, 40)}`
    : `Website question: ${clip(b.topic, 60) || "General"} — ${name}`;

  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.FROM_EMAIL || "The Vinci Ink Website <onboarding@resend.dev>",
        to: to.split(",").map(s => s.trim()).filter(Boolean),
        reply_to: email || undefined,
        subject, html, attachments
      })
    });
    if (!r.ok) { console.error("Resend error", r.status, await r.text()); return res.status(502).json({ ok: false, error: "Email service error." }); }
    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ ok: false, error: "Could not send." });
  }
};
