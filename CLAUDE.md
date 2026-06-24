# ChickenAndy Site — Claude Code context

## What this project is

The official site for IRL streamer **ChickenAndy** (kick.com/ChickenAndy). A trip-hub for his RV road trips: interactive route map, day-by-day timeline, Kick-powered VOD+clip browsers, photo gallery, crew cards, and about page.

**Stack:** Vite + React 18 + MapLibre GL JS + Framer Motion + hls.js (lazy-loaded)
**Deploy:** Static build. The included GitHub Actions workflow auto-builds and deploys to GitHub Pages on push to `main` (~1-2 min). No secrets or env vars needed. Not tied to any account — connect your own remote and deploy.

---

## Architecture

### Single-page shell (`src/App.jsx`)

Client-side routing via plain `useState` (no react-router). Routes:

| `route.page` | Renders |
|---|---|
| `home` | Home.jsx |
| `vods` | Vods.jsx (ChickenAndy-only, `scope='main'`) |
| `clips` | Clips.jsx (ChickenAndy-only, `scope='main'`) |
| `events` | EventsIndex → EventHub per-event (Map · VODs · Clips · Timeline · Gallery · Crew tabs) |
| `about` | About.jsx |
| `event` | EventHub with `route.eventId` + `route.tab` |

**Event hubs** are the main pattern. Each trip (RV X / RV 8 / RV 7) has its own hub. RV X is `status: 'live'` → full interactive experience. Past trips → ArchivePanel.

### Data flow

1. **`src/data.js`** — module singleton (`export default RVX_DATA`). Contains EVENTS, CITIES, CAST, CLIPS, VODS, DAYS, SPONSORS, LINKS, ABOUT, SUB. Mock data shaped exactly like the real Kick API. Exported helpers: `fmtViews`, `rebuildDays`, `mediaOn`, `months`, `_helpers`.

2. **`src/kick.js`** — live hydration at startup. Calls `kick.com/api/v2/` (browser CORS allowed, no key). Mutates `D` (the data singleton) in place. App re-renders via `useReducer` force-update in `App.jsx`.
   - **Phase 1** (awaited): identity, live status, VODs, first clip page per channel — enough to paint
   - **Phase 2** (background): full clip history via cursor pagination (up to 400 pages for ChickenAndy, 5 for crew). Calls `D.rebuildDays()` + `onProgress` as batches land so rolls keep growing.

3. All components `import D from '../data.js'` and read directly from the singleton.

### Pages

| File | Notes |
|---|---|
| `Home.jsx` | Hero, featured clips/VODs, events teaser |
| `Vods.jsx` | Grid + calendar; `scope='main'` = ChickenAndy only; `scope='event'` = all crew |
| `Clips.jsx` | Search + dropdowns (channel, city, date); same scope pattern |
| `Timeline.jsx` | Day-by-day log; `initialCity` prop scrolls to a stop on open |
| `RouteMap.jsx` | MapLibre interactive map (see Map section below) |
| `Gallery.jsx` | Photo grid — placeholder frames (real photos TODO) |
| `Crew.jsx` | Active crew + past crew (`departed: true`) |
| `Events.jsx` | EventsIndex + EventHub shell + ArchivePanel for past trips |
| `About.jsx` | Bio, donate, ContactCard, SponsorsSection (reused on Home) |
| `CityMenu.jsx` | Stop detail modal — clips/VODs for that city |
| `LiveCam.jsx` | Embeds `player.kick.com/chickenandytv` (24/7 RV cam) |
| `Subscribe.jsx` | Subscription CTA |

### Shared UI (`src/ui.jsx`)

`Slider` (arrow paging + scroll-reset), `Select` (styled dropdown), `SkeletonTile` (loading placeholder).

### Animations (`src/motion.jsx`)

- `TiltCard` — pointer-tracking 3D tilt. Disabled on `pointer: coarse` and `prefers-reduced-motion`.
- `Reveal` — scroll-triggered fade+rise. Use `delay` prop for staggered groups.

### Home scene (`src/RoadTrip.jsx`)

Animated parallax RV scene on the home hero. `ScrollRV` = scroll-progress RV at viewport bottom.

---

## Design system (`src/ds/`)

All design tokens are CSS custom properties, never JS objects.

```
src/ds/tokens/
  base.css        motion tokens, radius, shadow
  colors.css      oklch palette (amber/sand/asphalt/signal scales + semantic)
  fonts.css       Google Fonts imports
  spacing.css     space scale
  typography.css  type scale + utility classes

src/ds/components/
  core/     Avatar, Badge, Button, Card, IconButton, Input, Tag
  media/    CastCard, SocialRow, VodCard
  site/     KickButton

src/ds/index.js   barrel export for all components
src/ds/styles.css @imports all token files
```

**Type:** Anton (display headings) / Barlow Condensed (sub-headings) / Barlow (body) / Space Mono (mono/meta)
**Colors:** oklch — amber accent, asphalt darks, sand lights, signal (live/status)
**Import pattern:** `import { Button, Badge, SocialRow } from '../ds/index.js'`

---

## Map (`src/pages/RouteMap.jsx`)

MapLibre GL JS. Three modes — all sources keyless:

| Mode | Source |
|---|---|
| Dark 2D | CARTO dark raster (`basemaps.cartocdn.com`) |
| Light 2D | OpenFreeMap liberty vector (`tiles.openfreemap.org/styles/liberty`) |
| Satellite | EOX Sentinel-2 cloudless (`tiles.maps.eox.at`) |
| 3D terrain | Satellite base + Mapterhorn DEM (`tiles.mapterhorn.com`) |

Route via OSRM public router (`router.project-osrm.org/route/v1/driving`). Cached in `localStorage` under key `'rvx-osrm-v3'`. Falls back to straight-line arcs if offline.

City labels = GL symbol layer, glyphs from `tiles.openfreemap.org/fonts/`.

### Critical MapLibre gotchas

1. **`map.setStyle()` must pass `{ diff: false }`** — without it, custom layers (route line, markers) silently vanish after every style switch.
2. **Overlay re-attachment must poll `isStyleLoaded()`**, NOT listen for `style.load` events. The `style.load` event is consumed by the initial mount `setStyle`, causing a silent race where overlays attach before the new style is ready.
3. **The 3D orbit** (cinematic camera sweep on entering 3D mode) is one-shot per session — tracked with a ref so it only fires once.

---

## Data model reference

### CITIES
```js
{ id, stop, name, region, lon, lat, start, end, status, blurb }
// status: 'done' | 'current'
```
Adding a stop: append to `CITIES` array. Route line, RV marker, popups, timeline, and clip-scoping all derive from it automatically.

### CAST
```js
{ id, slug, name, role, live, departed, bio, photo, socials }
// slug: Kick channel slug (null for non-streamers)
// departed: true moves member to "Past crew" section
// photo: null → initials fallback; hydrated from Kick API at startup
```

### EVENTS
```js
{ id, name, year, status, premise, route, start, end, vodCount, clipCount }
// status: 'live' | 'past'
```

### VODS / CLIPS
Shaped like Kick API responses. Key fields: `id, kind, source ('kick'|'youtube'), url, title, channel, duration, views, thumbnail, playbackUrl, date, time, day, cityId, thumbHue`.

---

## Security posture

This is a **static, client-side site** — there is no backend, no database, no SQL, and no server-side auth. Implications for any future work:

- **Do NOT add a backend/database (Supabase, PostgreSQL, etc.) unless a real feature requires it.** The site stores no user data and serves no protected content. A backend would add attack surface for no functional gain.
- There is **no IDOR / SQL-injection / endpoint-auth surface** because nothing runs server-side. Reviews framed around those controls do not apply here.
- The **"Login with Kick" flow is a mock** (`LoginModal` in `App.jsx`, `setTimeout` → fake user). It performs no real OAuth. Its copy currently implies real authorization — fix or remove before treating it as real. Real Kick login = OAuth 2.1 + PKCE via `id.kick.com` **with a serverless token-exchange proxy** (never ship secrets in the static bundle).
- External calls are all to **public, keyless, read-only APIs** (Kick, OSRM, map tiles) from the browser. No secrets in the repo.
- **CI security gates:** `.github/workflows/security.yml` runs Gitleaks (secrets), Semgrep (JS/React SAST), and OSV-Scanner (dependency CVEs) on every push/PR.

## External APIs — all public, no auth keys

| Service | Endpoint | Used for |
|---|---|---|
| Kick (unofficial) | `kick.com/api/v2/channels/{slug}` | Profile pic, live status, sub badges |
| Kick (unofficial) | `kick.com/api/v2/channels/{slug}/clips` | Clip history (cursor paged) |
| Kick (unofficial) | `kick.com/api/v2/channels/{slug}/videos` | ~30 most recent VODs |
| Kick emotes | `kick.com/emotes/{slug}` | Channel emote set (different base from api/v2) |
| OSRM | `router.project-osrm.org/route/v1/driving` | Street routing for map line |
| OpenFreeMap | `tiles.openfreemap.org` | Vector tiles + glyph fonts |
| EOX | `tiles.maps.eox.at` | Satellite imagery |
| Mapterhorn | `tiles.mapterhorn.com` | DEM terrain |
| CARTO | `basemaps.cartocdn.com` | Dark raster basemap |

Kick's unofficial API allows browser CORS — no proxy needed for a static site. These endpoints are unofficial and may change; the official API (`api.kick.com`, OAuth at `id.kick.com`) is the long-term path for any auth-gated features.

---

## Known TODOs / placeholders

| Location | Placeholder | What to do |
|---|---|---|
| `src/data.js` + `src/App.jsx` | `ARCHIVE_CHANNEL_PLACEHOLDER` | Replace with real YouTube archive channel slug once it exists |
| `src/App.jsx` line 28 | `SAMPLE_MP4` (MDN cc0 flower.mp4) | Fallback for mock VODs; real Kick VODs/clips stream their actual HLS URLs |
| `src/pages/Gallery.jsx` | Placeholder photo frames | Replace with real uploaded photos |
| `src/App.jsx` `LoginModal` | Mock OAuth flow (setTimeout) | Real Kick OAuth 2.1 + PKCE via `id.kick.com`; token exchange needs a serverless proxy |
| `src/data.js` VODS | `source: 'youtube'` for older VODs | Kick only keeps ~30 VODs per channel; older ones point to archive URL above |

---

## Dev commands

```bash
npm install          # restore packages
npm run dev          # dev server → http://localhost:5173
npm run build        # production build → dist/
npm run preview      # serve dist/ → http://localhost:4173
```

## File tree (source only)

```
index.html
vite.config.js
package.json
public/
  favicon.svg
  sponsors/          antiscuff.webp · stake.webp · starlink.webp
src/
  main.jsx           React entry point
  App.jsx            Shell — nav, routing, modals, footer
  RoadTrip.jsx       Animated home scene + ScrollRV
  kick.js            Live Kick hydration (phases 1 + 2)
  data.js            Mock data singleton + helpers
  motion.jsx         TiltCard, Reveal
  ui.jsx             Slider, Select, SkeletonTile
  site.css           Page-level styles
  assets/
    rv-marker.svg    MapLibre RV icon
    rvx-emblem.svg   Site logo
  ds/
    index.js         Component barrel
    styles.css       Token @imports
    tokens/          base · colors · fonts · spacing · typography
    components/
      core/          Avatar Badge Button Card IconButton Input Tag
      media/         CastCard SocialRow VodCard
      site/          KickButton
  pages/
    About.jsx        CityMenu.jsx  Clips.jsx   Crew.jsx
    Events.jsx       Gallery.jsx   Home.jsx    LiveCam.jsx
    RouteMap.jsx     Subscribe.jsx Timeline.jsx Vods.jsx
.github/
  workflows/deploy.yml   GitHub Actions → Pages on push to main
```
