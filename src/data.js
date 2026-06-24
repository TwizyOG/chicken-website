/* =============================================================================
   RV X — site data model v2 (mock, shaped like the real integrations)
   - Clips/VODs mirror Kick's shapes (kick.com/chickenandy/clips · /videos).
   - Kick only retains the most recent ~30 VODs per channel → older VODs carry
     source:'youtube' pointing at the archival channel (placeholder URLs until
     the real YouTube channel is linked).
   - EVENTS: past trips (RV 7, RV 8) + the current one (RV X).
   - Profile pictures: tryKickProfiles() attempts a live pull from Kick's
     channel endpoint so site avatars match Kick; falls back silently.
   ============================================================================= */

/* ---- events --------------------------------------------------------------- */
const EVENTS = [
  {
    id: 'rv7', name: 'RV 7', year: '2024', status: 'past',
    premise: 'The first run — Los Angeles to Las Vegas and back, 21 days.',
    route: ['Los Angeles, CA', 'Barstow, CA', 'Las Vegas, NV', 'Los Angeles, CA'],
    start: '06/02/24', end: '06/23/24', vodCount: 19, clipCount: 84,
    archive: 'youtube', archiveNote: 'Full VODs live on the archive channel.',
  },
  {
    id: 'rv8', name: 'RV 8', year: '2025', status: 'past',
    premise: 'Pacific Northwest loop — Seattle to Portland to the coast.',
    route: ['Seattle, WA', 'Portland, OR', 'Cannon Beach, OR', 'Seattle, WA'],
    start: '07/12/25', end: '08/09/25', vodCount: 26, clipCount: 122,
    archive: 'youtube', archiveNote: 'Full VODs live on the archive channel.',
  },
  {
    id: 'rvx', name: 'RV X', year: '2026', status: 'live',
    premise: 'The 2026 Gulf Run — Austin to Orlando, streamed 24/7.',
    route: ['Austin, TX', 'New Orleans, LA', 'Tampa, FL', 'Orlando, FL'],
    start: '04/10/26', end: null, vodCount: null, clipCount: null,
  },
];

/* ---- cities (RV X route) --------------------------------------------------- */
const CITIES = [
  {
    id: 'austin', stop: 1, name: 'Austin', region: 'TX',
    lon: -97.7431, lat: 30.2672,
    start: '04/10/26', end: '04/13/26', status: 'done',
    blurb: 'Where the wheels started turning. Three days of setup, send-offs and 6th Street chaos.',
  },
  {
    id: 'nola', stop: 2, name: 'New Orleans', region: 'LA',
    lon: -90.0715, lat: 29.9511,
    start: '04/14/26', end: '04/30/26', status: 'done',
    blurb: 'Seventeen days in the Quarter — brass bands, beignets and one towed RV.',
  },
  {
    id: 'tampa', stop: 3, name: 'Tampa', region: 'FL',
    lon: -82.4572, lat: 27.9506,
    start: '04/30/26', end: '06/01/26', status: 'done',
    blurb: 'A full month on the Gulf side. Beach days, boat day, and the great generator failure.',
  },
  {
    id: 'orlando', stop: 4, name: 'Orlando', region: 'FL',
    lon: -81.3792, lat: 28.5383,
    start: '06/01/26', end: null, status: 'current',
    blurb: 'Current stop. Theme-park week with the whole crew.',
  },
];

/* ---- helpers ------------------------------------------------------------ */
const TRIP_START = new Date(2026, 3, 10); // 04/10/26
const TODAY = new Date(2026, 5, 10);      // 06/10/26
const MS_DAY = 86400000;
const pad = (n) => String(n).padStart(2, '0');
const fmt = (d) => `${pad(d.getMonth() + 1)}/${pad(d.getDate())}/${String(d.getFullYear()).slice(2)}`;
const parse = (s) => { const [m, d, y] = s.split('/').map(Number); return new Date(2000 + y, m - 1, d); };
const dayNum = (date) => Math.floor((date - TRIP_START) / MS_DAY) + 1;
const cityOn = (date) => {
  for (let i = CITIES.length - 1; i >= 0; i--) {
    if (date >= parse(CITIES[i].start)) return CITIES[i];
  }
  return CITIES[0];
};
const seededTime = (n) => `${pad(9 + ((n * 5) % 11))}:${pad((n * 17) % 60)}`; // start time HH:MM

/* ---- crew (roles only — the card title already shows the name; socials
        hydrate from each member's real Kick profile, see src/kick.js) ------- */
const CAST = [
  /* ---- active crew ---- */
  {
    id: 'chickenandy', slug: 'chickenandy', name: 'ChickenAndy', role: 'Driver', live: true,
    bio: 'The man behind the wheel. Streaming the whole ride on Kick.',
    photo: null,
    socials: [
      { platform: 'kick', href: 'https://kick.com/ChickenAndy' },
      { platform: 'instagram', href: 'https://instagram.com/chickenandy_' },
      { platform: 'x', href: 'https://x.com/chickenandy_' },
      { platform: 'discord', href: 'https://discord.gg/CKN' },
      { platform: 'powerchat', href: 'https://powerchat.live/chickenandy' },
    ],
  },
  {
    id: 'krispyw', slug: 'krispyw', name: 'KrispyW', role: 'Chaos dept.', live: false,
    bio: 'If a bet exists, Krispy has already lost it.', photo: null,
    socials: [{ platform: 'kick', href: 'https://kick.com/krispyw' }],
  },
  {
    id: 'ryanheinz', slug: 'ryanheinz', name: 'Ryan Heinz', role: 'Camera', live: false,
    bio: 'Second angle, drone shots, beignet records.', photo: null,
    socials: [{ platform: 'kick', href: 'https://kick.com/ryanheinz' }],
  },
  {
    id: 'cam', slug: null, name: 'Cam', role: 'Logistics', live: false,
    bio: 'Keeps the rig rolling and the cooler full.', photo: null,
    socials: [],
  },
  {
    id: 'kikikrazy', slug: 'kikikrazy', name: 'KikiKrazy', role: 'Crew', live: false,
    bio: 'IRL streamer bringing her own lens to the road trip.', photo: null,
    socials: [{ platform: 'kick', href: 'https://kick.com/kikikrazy' }],
  },
  {
    id: 'chicagokev', slug: 'chicagokev', name: 'Chicago Kev', role: 'Crew', live: false,
    bio: 'Chicago energy on a Gulf Coast road trip.', photo: null,
    socials: [{ platform: 'kick', href: 'https://kick.com/chicagokev' }],
  },
  /* ---- past crew (departed the trip; VODs/clips/timeline still include them) ---- */
  {
    id: 'toneirl', slug: 'toneirl', name: 'Tone', role: 'Navigator', live: false, departed: true,
    bio: 'Reads the maps, picks the detours, owns the aux.', photo: null,
    socials: [{ platform: 'kick', href: 'https://kick.com/toneirl' }],
  },
  {
    id: 'sainttenn', slug: 'sainttenn', name: 'Saint Tenn', role: 'Guest', live: false, departed: true,
    bio: 'Rolled with the crew through the early legs of the trip.', photo: null,
    socials: [{ platform: 'kick', href: 'https://kick.com/sainttenn' }],
  },
  {
    id: 'suziesmalls', slug: 'suziesmalls', name: 'Suzie Smalls', role: 'Guest', live: false, departed: true,
    bio: 'Joined the rig for a stretch of the trip and brought the energy.', photo: null,
    socials: [{ platform: 'kick', href: 'https://kick.com/suziesmalls' }],
  },
];

/* ---- about + contact (extracted from kick.com/chickenandy/about, 06/26) ---- */
const ABOUT = {
  bio: 'My name’s David — 25 years old, IRL streamer born and raised in Los Angeles, California, now out here living in Austin, Texas. I’ve been streaming since 2018, mainly doing real-life adventure streams, traveling around, and linking up with other Kick streamers for collabs and chaos. If you want to get a feel for what I do, check out my recent VODs or search me up on YouTube — my past content speaks for itself.',
  donate: 'Donate $2 for your name and message read out on stream via Text-To-Speech, or $4 for TTS plus a video/song of your choosing. All cards via Stripe, PayPal and Crypto accepted. Kick subscriptions are also appreciated.',
  contact: {
    instagram: '@ChickenAndy_',
    discord: '@ChickenAndy',
    email: 'Team@chickenandy.com',
    pobox: 'Chicken Andy, P.O. Box 2094, Pflugerville, TX 78691',
    poboxNote: 'All packages opened on stream unless requested otherwise.',
  },
};

/* ---- clips (Kick clip shape; multiple channels for per-streamer rolls) ---- */
const CLIP_TITLES = [
  ['Andy vs the parallel park', 'chickenandy', '1:12', 48200],
  ['"WE LIVE IN A VAN" — full meltdown', 'chickenandy', '0:58', 36900],
  ['Saint Tenn cooks in the RV kitchen', 'sainttenn', '1:14', 11200],        // early — NOLA
  ['Krispy loses the bet on Frenchmen St', 'krispyw', '2:04', 28800],
  ['Cop knocks on the RV at 2AM', 'chickenandy', '1:47', 95400],
  ['Saint Tenn vs the inflatable pool', 'sainttenn', '0:44', 9800],           // early — NOLA
  ['Tone backflips off the dock', 'toneirl', '0:41', 22100],
  ['Generator dies mid-stream', 'chickenandy', '1:25', 18700],
  ['Ryan orders 40 beignets', 'ryanheinz', '1:03', 15400],
  ['Gator on the road??', 'chickenandy', '0:52', 67300],
  ['The Tampa boat day disaster', 'chickenandy', '3:18', 41200],
  ['Cam finally drives', 'chickenandy', '1:36', 12800],
  ['Brass band takes over the stream', 'chickenandy', '2:22', 19600],
  ['Andy tries to merge for 9 minutes', 'krispyw', '1:54', 30500],
  ['Free ice cream from a viewer', 'toneirl', '0:47', 9400],
  ['RV almost gets towed AGAIN', 'chickenandy', '2:09', 52600],
  ['6th Street send-off', 'chickenandy', '1:31', 24300],
  ['Sunset drive into Orlando', 'chickenandy', '0:59', 14100],
  ['Tone vs the GPS', 'toneirl', '1:18', 11200],
  ['Krispy karaoke at the truck stop', 'krispyw', '2:41', 17800],
  ['Drone shot over the causeway', 'ryanheinz', '0:44', 21500],
  ['Ryan loses the drone (briefly)', 'ryanheinz', '1:51', 13600],
  ['Krispy reads superchats wrong', 'krispyw', '1:09', 8800],
  ['Tone navigates us into a cul-de-sac', 'toneirl', '1:33', 16400],
  ['Kiki finds a possum under the rig', 'kikikrazy', '0:51', 19400],          // late — Tampa/Orlando
  ['Chicago Kev does the voice', 'chicagokev', '1:23', 14700],
  ['Kiki rates all the gas station snacks', 'kikikrazy', '2:07', 21300],
  ['Kev navigates downtown in a golf cart', 'chicagokev', '1:38', 16500],
];
const CLIPS = CLIP_TITLES.map(([title, channel, duration, views], i) => {
  const offset = Math.floor((i / CLIP_TITLES.length) * ((TODAY - TRIP_START) / MS_DAY));
  const date = new Date(TRIP_START.getTime() + offset * MS_DAY);
  const city = cityOn(date);
  const n = dayNum(date);
  return {
    id: `clip_${String(i + 1).padStart(3, '0')}`,
    url: `https://kick.com/${channel}/clips/clip_${String(i + 1).padStart(3, '0')}`,
    title, channel, duration, views,
    date: fmt(date), time: seededTime(n + i), day: n, cityId: city.id,
    thumbHue: 30 + ((i * 37) % 60),
  };
});

/* ---- VODs (Kick keeps ~30 most recent → older fall back to YouTube) ------- */
const RAW_VODS = [];
for (let d = new Date(TRIP_START); d <= TODAY; d = new Date(d.getTime() + MS_DAY)) {
  const n = dayNum(d);
  if (n % 2 === 0 && n % 6 !== 0) continue;
  const city = cityOn(d);
  const hrs = 3 + ((n * 7) % 6);
  RAW_VODS.push({
    id: `vod_${pad(n)}`,
    title: `Day ${n} — ${city.name}, ${city.region}`,
    channel: 'chickenandy',
    date: fmt(d), time: seededTime(n), day: n, cityId: city.id,
    duration: `${hrs}:${pad((n * 13) % 60)}:${pad((n * 29) % 60)}`,
    views: 2400 + ((n * 997) % 9000),
    thumbHue: 30 + ((n * 23) % 60),
  });
}
// Crew VODs (their own channels stream parts of the trip)
[['toneirl', 5], ['krispyw', 4], ['ryanheinz', 3], ['sainttenn', 2], ['kikikrazy', 3], ['chicagokev', 2]].forEach(([ch, count], ci) => {
  for (let k = 0; k < count; k++) {
    const n = 6 + k * 12 + ci * 4;
    const d = new Date(TRIP_START.getTime() + (n - 1) * MS_DAY);
    if (d > TODAY) continue;
    const city = cityOn(d);
    RAW_VODS.push({
      id: `vod_${ch}_${pad(n)}`,
      title: `${city.name} ride-along — ${ch} POV`,
      channel: ch,
      date: fmt(d), time: seededTime(n + k), day: n, cityId: city.id,
      duration: `${2 + (k % 3)}:${pad((n * 11) % 60)}:${pad((n * 7) % 60)}`,
      views: 900 + ((n * 311) % 4000),
      thumbHue: 30 + ((n * 31) % 60),
    });
  }
});
RAW_VODS.sort((a, b) => a.day - b.day || a.channel.localeCompare(b.channel));
// Kick retention: most recent 30 per channel stay on Kick; older → YouTube archive.
const byChannel = {};
RAW_VODS.forEach((v) => { (byChannel[v.channel] = byChannel[v.channel] || []).push(v); });
Object.values(byChannel).forEach((list) => {
  list.forEach((v, idx) => {
    const fromEnd = list.length - 1 - idx;
    if (fromEnd < 30) {
      v.source = 'kick';
      v.url = `https://kick.com/${v.channel}/videos/${v.id}`;
    } else {
      v.source = 'youtube';
      v.url = 'https://youtube.com/@ARCHIVE_CHANNEL_PLACEHOLDER'; // TODO: real archive link
      v.placeholder = true;
    }
  });
});
const VODS = RAW_VODS;

/* ---- timeline day notes ---------------------------------------------------- */
const DAY_NOTES = {
  1:  'Wheels up. Andy picks up the rig, the crew loads in, and Austin sends us off from 6th Street. First Powerchat goal cleared before the first tank of gas.',
  3:  'Last full Austin day — BBQ crawl, a failed parallel park outside Franklin, and packing the roof rack in the rain.',
  5:  'I-10 East. Eight hours of highway, gas-station roulette, and the first "WE LIVE IN A VAN" meltdown. Rolled into New Orleans after dark.',
  9:  'Quarter day. Brass band took over the stream on Frenchmen St; Krispy lost the bet and ate the ghost pepper. Cop knocked on the RV at 2AM — all good.',
  14: 'Swamp tour. A gator followed the boat for half a mile. Tone got told off for leaning out. Beignet count: 40 (Ryan, alone).',
  21: 'Goodbye NOLA → hello Gulf. The long bridge run to Tampa with the sunset behind us.',
  33: 'Boat day. Everything that could go wrong did — engine, anchor, Cam’s phone. Greatest stream of the leg.',
  47: 'Generator died mid-stream, crew streamed by powerbank candle-light. Starlink held the line.',
  53: 'Tampa wrap → I-4 to Orlando. The rig hit 10,000 trip miles outside Lakeland.',
  57: 'Theme-park week begins. Andy vs the teacup ride. Cam finally drives (a golf cart).',
  62: 'Today. Live most evenings from the Orlando lot — map updates as we roll.',
};
const DAYS = [];
/* (Re)derives the day-by-day log from CLIPS/VODS. Runs once at load and again
   after live Kick data hydrates, so real media lands on its real dates (and
   the log extends past the mock TODAY if newer media exists). */
function rebuildDays() {
  let end = TODAY;
  [...VODS, ...CLIPS].forEach((m) => { const d = parse(m.date); if (d > end) end = d; });
  DAYS.length = 0;
  for (let d = new Date(TRIP_START); d <= end; d = new Date(d.getTime() + MS_DAY)) {
    const n = dayNum(d);
    const city = cityOn(d);
    DAYS.push({
      day: n, date: fmt(d), cityId: city.id,
      city: `${city.name}, ${city.region}`,
      note: DAY_NOTES[n] || null,
      clips: CLIPS.filter((c) => c.day === n),
      vods: VODS.filter((v) => v.day === n),
    });
  }
}
rebuildDays();

/* Sponsor panels mirror kick.com/chickenandy/about — images cached locally
   in public/sponsors/ (320×320, 1200×785, 300×163 webp). */
const SPONSORS = [
  {
    id: 'stake', name: 'Stake', img: 'sponsors/stake.webp',
    href: 'https://stake.us/?offer=chicken&c=ChickenAndy',
    tagline: 'Stake Social Casino Bonus',
    desc: 'Sign up to STAKE.US using my link and get $25 Stake Cash, 250k GC and 5% Rakeback! Offer valid for new users only.',
  },
  {
    id: 'starlink', name: 'Starlink', img: 'sponsors/starlink.webp',
    href: 'https://www.starlink.com/residential?referral=RC-2915042-24191-55',
    tagline: 'Starlink Internet Discount',
    desc: 'Sign up to Starlink and you’ll receive a discount — and we’ll both receive a free month of service!',
  },
  {
    id: 'antiscuff', name: 'AntiScuff', img: 'sponsors/antiscuff.webp',
    href: 'https://antiscuff.com/clients/aff.php?aff=91',
    tagline: 'Anti Scuff Host',
    desc: '#1 hosting platform — trust, I wrote this.',
  },
];

/* Kick subscriber badges + channel emotes — hydrated live from kick.com in
   kick.js (badges from the channel object, emotes from kick.com/emotes/<slug>).
   Falls back to numbered placeholder badges + no emotes if the API is blocked. */
const SUB = {
  badges: [{ months: 1 }, { months: 3 }, { months: 6 }, { months: 12 }],
  emotes: [],
};

const LINKS = {
  kick: 'https://kick.com/ChickenAndy',
  /* The always-on in-RV camera streams 24/7 on its own Kick channel.
     player.kick.com/<slug> is Kick's embeddable player (verified: ACAO *, no
     X-Frame-Options / CSP frame-ancestors, autoplays the live IVS stream). */
  rvcam: 'https://kick.com/chickenandytv',
  /* Subscriptions are a paid action that must complete in Kick's own checkout —
     the Public API exposes no subscribe endpoint/scope (only read-only
     subscription webhook events), so this deep-links to the channel where
     Kick's native Subscribe button + checkout live. Swap to a dedicated
     subscribe deep-link here if Kick ever ships one. */
  subscribe: 'https://kick.com/ChickenAndy',
  clips: 'https://kick.com/chickenandy/clips',
  videos: 'https://kick.com/chickenandy/videos',
  powerchat: 'https://powerchat.live/chickenandy',
  discord: 'https://discord.gg/CKN',
  instagram: 'https://instagram.com/chickenandy_',
  x: 'https://x.com/chickenandy_',
  youtube: 'https://youtube.com/@ARCHIVE_CHANNEL_PLACEHOLDER', // TODO: real archive link
};

/* ---- live Kick profile pictures (graceful) --------------------------------
   Pulls each crew member's avatar from Kick so the site matches Kick exactly.
   Browser CORS may block this on some hosts; production should proxy or
   build-time fetch (see research/integration-handoff.md). */
async function tryKickProfiles() {
  const out = {};
  await Promise.all(CAST.filter((c) => c.slug).map(async (c) => {
    try {
      const r = await fetch(`https://kick.com/api/v2/channels/${c.slug}`, { mode: 'cors' });
      if (!r.ok) return;
      const j = await r.json();
      const pic = j && j.user && (j.user.profile_pic || j.user.profilepic);
      if (pic) { c.photo = pic; out[c.id] = pic; }
    } catch (e) { /* CORS or offline — keep initials fallback */ }
  }));
  return out;
}

/* ---- date utilities for calendar / search ---------------------------------- */
const allMedia = () => [...VODS.map((v) => ({ ...v, kind: 'vod' })), ...CLIPS.map((c) => ({ ...c, kind: 'clip' }))];
const mediaOn = (dateStr) => allMedia().filter((m) => m.date === dateStr);
const months = () => {
  // months spanned by the trip: returns [{y, m(0-based), label}]
  const out = []; const seen = new Set();
  for (let d = new Date(TRIP_START); d <= TODAY; d = new Date(d.getTime() + MS_DAY)) {
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    if (!seen.has(key)) {
      seen.add(key);
      out.push({ y: d.getFullYear(), m: d.getMonth(), label: d.toLocaleString('en-US', { month: 'long', year: 'numeric' }) });
    }
  }
  return out;
};

const RVX_DATA = {
  EVENTS, CITIES, CLIPS, VODS, DAYS, CAST, SPONSORS, LINKS, ABOUT, SUB,
  TRIP_START, TODAY,
  vodsForCity: (cityId) => VODS.filter((v) => v.cityId === cityId),
  clipsForCity: (cityId) => CLIPS.filter((c) => c.cityId === cityId),
  fmtViews: (n) => (n >= 1000 ? `${(n / 1000).toFixed(1)}K` : String(n)),
  fmtDate: fmt, parseDate: parse,
  mediaOn, months,
  tryKickProfiles,
  rebuildDays,
  _helpers: { fmt, parse, dayNum, cityOn, seededTime, pad },
};

export default RVX_DATA;
