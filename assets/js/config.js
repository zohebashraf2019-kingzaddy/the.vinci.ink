/* =========================================================================
   THE VINCI INK — SITE CONFIG
   Edit this one file to update the team, booking calendars, deposit and prices.
   Everything on the site (artists page, booking hub, footer) reads from here.
   ========================================================================= */
window.VINCI = {
  studio: {
    name: "The Vinci Ink",
    tagline: "Luxury ink crafted with Da Vinci precision.",
    phone: "(775) 558-6132",
    phoneRaw: "+17755586132",
    textLines: ["(775) 453-6185", "(775) 559-4894", "(775) 519-8349"],
    address: "1016 N Rock Blvd, Suite 102",
    city: "Sparks, NV 89431",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=The+Vinci+Ink+1016+N+Rock+Blvd+Suite+102+Sparks+NV+89431",
    instagram: "https://www.instagram.com/the.vinci.ink/",
    tiktok: "https://www.tiktok.com/discover/the-vinci-ink-tattoo",
    hours: [
      ["Monday – Saturday", "12:00 PM – 7:00 PM"],
      ["Sunday", "Closed"]
    ],
    openDays: [1, 2, 3, 4, 5, 6],          // 0 = Sunday … 6 = Saturday
    slotTimes: ["12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM", "6:00 PM"]
  },

  /* Deposit — required for every booking.
     depositUrl: paste a Square / Stripe / Clover payment link for $80 here.
     Leave it empty and the site tells clients the shop will text them a deposit link. */
  deposit: {
    amount: 80,
    depositUrl: "",
    policy: [
      "An $80 deposit is required to lock in every appointment.",
      "Your deposit goes toward the final price of your tattoo.",
      "Deposits are non-refundable. Reschedule at least 48 hours ahead and it carries over.",
      "Clients must be 18+ with a valid government ID."
    ]
  },

  /* THE TEAM
     calendarUrl: paste each artist's Calendly (or Square Appointments / Setmore …) link.
       - If it's a Calendly link it is embedded right inside the booking page.
       - Any other link opens in a new tab.
       - Leave it empty and clients send a request with their preferred date and time instead.
     styles: short tags shown on the artist card (add or change any time). */
  artists: [
    {
      id: "danny",
      name: "Danny Sanchez",
      role: "Owner · Artist",
      handle: "tat_2_danny",
      instagram: "https://www.instagram.com/tat_2_danny/",
      styles: ["Black & grey", "Custom realism"],
      bio: "Owner of The Vinci Ink. Custom pieces, sleeves and collabs with the team.",
      calendarUrl: "",
      owner: true
    },
    {
      id: "juliana",
      name: "Juliana Picazo",
      role: "Artist",
      handle: "picazito_",
      instagram: "https://www.instagram.com/picazito_/",
      styles: ["Custom work"],
      bio: "",
      calendarUrl: ""
    },
    {
      id: "juan",
      name: "Juan Peña",
      role: "Artist",
      handle: "jupeart_",
      instagram: "https://www.instagram.com/jupeart_/",
      styles: ["Black & grey", "Custom work"],
      bio: "",
      calendarUrl: ""
    },
    {
      id: "luke",
      name: "Luke",
      role: "Artist",
      handle: "limpincowboy_art",
      instagram: "https://www.instagram.com/limpincowboy_art/",
      styles: ["Custom work"],
      bio: "",
      calendarUrl: ""
    },
    {
      id: "christian",
      name: "Christian Hartel",
      role: "Artist",
      handle: "itslucids.art",
      instagram: "https://www.instagram.com/itslucids.art/",
      styles: ["Black & grey", "All-day sessions"],
      bio: "Black and grey specialist. Ask about $700 all-day sessions and gift cards.",
      calendarUrl: ""
    },
    {
      id: "agility",
      name: "Agility",
      role: "Artist",
      handle: "agility_ink",
      instagram: "https://www.instagram.com/agility_ink/",
      styles: ["Black & grey", "Cover-ups"],
      bio: "Black and grey work and cover-ups — bring the old piece, leave with a new one.",
      calendarUrl: ""
    },
    {
      id: "kurt",
      name: "Kurt",
      role: "Artist",
      handle: "tattoosbykurt",
      instagram: "https://www.instagram.com/tattoosbykurt/",
      styles: ["Custom work"],
      bio: "",
      calendarUrl: ""
    }
  ],

  /* PRICES — fill these in when the shop confirms. Rows with price "" show "Ask the artist". */
  services: [
    { name: "Flash tattoo (3–5 in)", price: "$110", note: "Two flash pieces for $190" },
    { name: "All-day session", price: "$700", note: "Gift cards available" },
    { name: "Custom black & grey realism", price: "", note: "Quoted per piece" },
    { name: "Cover-ups & reworks", price: "", note: "Consultation recommended" },
    { name: "Sleeves (multi-session)", price: "", note: "Planned with your artist" },
    { name: "Hourly rate", price: "", note: "Varies by artist" }
  ]
};
