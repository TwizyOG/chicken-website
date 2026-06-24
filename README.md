# ChickenAndy — official site

The official site for IRL streamer [ChickenAndy](https://kick.com/ChickenAndy): an interactive USA route map, day-by-day timeline, Kick-powered VOD and clip browsers, a photo gallery, crew cards, and an about page — with a Powerchat donate link always in reach.

## Run it

```bash
npm install
npm run dev       # dev server → http://localhost:5173
npm run build     # production build → dist/
npm run preview   # serve the production build → http://localhost:4173
```

## Stack

- **Vite + React 18** — precompiled JSX, no in-browser Babel
- **MapLibre GL JS** — keyless sources: OpenFreeMap (light 2D), CARTO (dark 2D), EOX Sentinel-2 (satellite), Mapterhorn DEM (3D terrain) + a one-shot cinematic orbit on entering 3D
- **Framer Motion** — pointer-tracking 3D tilt on media/event cards, scroll reveals, modal enter/exit — inert under `prefers-reduced-motion` and on touch pointers
- **hls.js** (lazy-loaded) — plays Kick VOD/clip HLS streams in the in-site player
- **Design system** — `src/ds/` (oklch color tokens, Anton/Barlow Condensed/Barlow/Space Mono type, 11 components)
- **Mobile-first responsive** — breakpoints at 1080/860/640px plus `pointer: coarse` touch targets

## Live Kick data (no key required)

`src/kick.js` hydrates the site from Kick's `api/v2` endpoints — they allow browser CORS, so a static site gets real data with no proxy:

- Real **clips + VODs** (titles, thumbnails, durations, views, dates) for the whole crew
- Real **live status** (LIVE rings/badges follow whoever is actually streaming)
- Real **profile pictures**
- Real **in-site playback** via hls.js, with an "Open on Kick" fallback if a stream's CDN refuses

Everything degrades gracefully: any channel or endpoint that fails keeps its mock data from `src/data.js`. These are unofficial endpoints and can change without notice — the official API (`api.kick.com`, OAuth at `id.kick.com`) is the long-term path for auth-gated features.

## Structure

```
src/
  ds/            design system: tokens/ (CSS custom properties) + components/ + index.js barrel
  pages/         Home, Vods (grid+calendar), Clips (search+filters), Timeline,
                 Gallery, Crew, About (bio/contact/sponsors),
                 Events (index + per-event hub: Map·VODs·Clips·Timeline·Gallery·Crew),
                 RouteMap (OSRM street routing, dark/light 2D + satellite + 3D terrain)
  App.jsx        shell: nav, event hub routing, modals, footer
  RoadTrip.jsx   animated parallax roadtrip scene (spinning wheels, scenery layers)
  kick.js        live Kick hydration: clips/VODs/avatars/socials/live status
  ui.jsx         Slider (arrow paging + scroll reset), Select, SkeletonTile
  data.js        mock fallback data + CITIES/events/crew definitions
  site.css       page-level styles (consumes the design tokens)
public/
  sponsors/      sponsor banner images (antiscuff · stake · starlink)
```

## Deploy to GitHub Pages

This folder ships with **no git history and no remote** — it's tied to no account. Connect it to your own:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

Then in your repo: **Settings → Pages → Source: GitHub Actions**. `vite.config.js` uses `base: './'` so the build works at any Pages subpath. The included workflow (`.github/workflows/deploy.yml`) builds and deploys automatically on every push to `main`. No secrets or environment variables required.

## Security

This is a **static, client-side site** — no server, no database, no SQL, and no server-side auth. All content is public, and the only external calls are to public, keyless, read-only APIs (Kick, OSRM, map tiles) made from the browser. There is no backend attack surface (no SQL injection, no protected endpoints, no IDOR surface) because there is no backend.

Continuous scanning runs in CI via `.github/workflows/security.yml` on every push and PR:

- **Gitleaks** — secret scanning across full git history
- **Semgrep** — JS/React SAST + secret rules
- **OSV-Scanner** — dependency CVEs from `package-lock.json`

`npm audit` reports 0 known vulnerabilities. No API keys or secrets live in the repo.

> **Note on the login button:** the "Login with Kick" flow is currently a **mock** ([App.jsx](src/App.jsx), `LoginModal`). It does not perform real OAuth. Wire it to real Kick OAuth 2.1 + PKCE (which requires a serverless token-exchange proxy) before presenting it as a working sign-in, or remove it.

## Open TODOs

| Item | Location |
|---|---|
| YouTube VOD archive | Replace `ARCHIVE_CHANNEL_PLACEHOLDER` in `src/data.js` and `src/App.jsx` once the archive channel exists |
| Gallery photos | Replace placeholder frames in `src/pages/Gallery.jsx` with real photos |
| Kick OAuth login | `LoginModal` in `src/App.jsx` is a mock flow — real implementation needs OAuth 2.1 + PKCE via `id.kick.com` with a serverless token-exchange proxy |
| Add a trip stop | Append to `CITIES` in `src/data.js`; the route, map, timeline, and clip-scoping follow automatically |
