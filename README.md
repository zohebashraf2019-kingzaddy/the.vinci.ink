# The Vinci Ink — website

Static site + one Vercel serverless function. No build step.

| Page | URL |
|---|---|
| Home (portfolio, artists, services, visit, contact) | `/` |
| Booking hub for every artist ($80 deposit) | `/book` (deep link: `/book?artist=christian`) |
| Free tattoo try-on | `/try-on` |

## Update content — everything lives in `assets/js/config.js`
- **Artists**: name, role, Instagram, style tags, bio.
- **Booking calendars**: paste each artist's Calendly link into `calendarUrl`. Calendly links embed right in `/book`; other links open in a new tab; empty = date/time request form.
  - Tip: in Calendly, connect Stripe and set an $80 payment on the event to collect the deposit at booking.
- **Deposit**: `deposit.depositUrl` — paste a Square/Stripe $80 payment link. Empty = "we'll text you a deposit link".
- **Prices**: `services` — leave `price: ""` to show "Ask the artist".
- **Hours / open days / time slots**: `studio`.

## Email for the contact + booking forms (Vercel → Settings → Environment Variables)
- `RESEND_API_KEY` — from resend.com
- `STUDIO_EMAIL` — inbox that receives requests (comma-separate several)
- `FROM_EMAIL` — optional verified sender

Until these are set, forms show visitors a call/text fallback.

## Media
- Photos: `assets/img/` · Reels: `assets/video/` (540p, web-optimized, with `.jpg` posters)
- Add a gallery tile in `index.html` → `#work` (copy any `<button class="tile">`).
