/* RouteMap v3 — MapLibre GL interactive map (free/open sources, no API key):
   · Map (2D)   — dark CARTO raster (brand default) or light OpenFreeMap liberty
   · Satellite  — EOX Sentinel-2 cloudless imagery
   · 3D terrain — satellite + Mapterhorn DEM, tilted camera + cinematic orbit
   The route follows REAL STREETS via the public OSRM router (cached in
   localStorage; falls back to gentle arcs offline). The line itself is
   interactive: hover lights it up, clicking a leg opens its destination stop.
   Overlays re-attach on every style change, so all three modes carry the route. */
import React from 'react';
import maplibregl from 'maplibre-gl';
import D from '../data.js';
import rvMarkerUrl from '../assets/rv-marker.svg';

const RVX_MAP = {
  satTiles: 'https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless-2020_3857/default/g/{z}/{y}/{x}.jpg',
  satAttrib: 'Sentinel-2 cloudless © EOX IT Services GmbH',
  demUrl: 'https://tiles.mapterhorn.com/tilejson.json',
  vectorLight: 'https://tiles.openfreemap.org/styles/liberty',
  darkTiles: 'https://basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
  darkAttrib: '© OpenStreetMap contributors © CARTO',
  osrm: 'https://router.project-osrm.org/route/v1/driving',
};

/* glyphs let our custom raster styles draw GL text (city labels) */
const GLYPHS = 'https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf';

function rvxSatStyle(withTerrain) {
  const style = {
    version: 8,
    glyphs: GLYPHS,
    sources: {
      sat: { type: 'raster', tiles: [RVX_MAP.satTiles], tileSize: 256, attribution: RVX_MAP.satAttrib },
    },
    layers: [
      { id: 'bg', type: 'background', paint: { 'background-color': '#16130f' } },
      { id: 'sat', type: 'raster', source: 'sat', paint: { 'raster-saturation': -0.12, 'raster-contrast': 0.06 } },
    ],
  };
  if (withTerrain) {
    style.sources.dem = { type: 'raster-dem', url: RVX_MAP.demUrl, attribution: 'Mapterhorn' };
    style.terrain = { source: 'dem', exaggeration: 1.6 };
    style.layers.push({
      id: 'hills', type: 'hillshade', source: 'dem',
      paint: { 'hillshade-shadow-color': '#241c12', 'hillshade-exaggeration': 0.45 },
    });
  }
  return style;
}

function rvxDarkStyle() {
  return {
    version: 8,
    glyphs: GLYPHS,
    sources: {
      dark: { type: 'raster', tiles: [RVX_MAP.darkTiles], tileSize: 256, attribution: RVX_MAP.darkAttrib },
    },
    layers: [
      { id: 'bg', type: 'background', paint: { 'background-color': '#16130f' } },
      { id: 'dark', type: 'raster', source: 'dark' },
    ],
  };
}

/* Fallback when the router is unreachable: gentle land-hugging arcs. */
function bezierLeg(a, b) {
  const ARC = { 'austin>nola': 1.1, 'nola>tampa': 2.4, 'tampa>orlando': 0.5 };
  const arc = ARC[`${a.id}>${b.id}`] ?? 1;
  const c = [(a.lon + b.lon) / 2, (a.lat + b.lat) / 2 + arc];
  const pts = [];
  for (let t = 0; t <= 1.0001; t += 1 / 48) {
    const u = 1 - t;
    pts.push([
      u * u * a.lon + 2 * u * t * c[0] + t * t * b.lon,
      u * u * a.lat + 2 * u * t * c[1] + t * t * b.lat,
    ]);
  }
  return pts;
}

/* Real driving geometry per leg from the public OSRM demo router. */
async function fetchDrivingLegs(cities) {
  const KEY = 'rvx-osrm-v3';
  try {
    const cached = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (Array.isArray(cached) && cached.length === cities.length - 1) return { legs: cached, source: 'roads (cached)' };
  } catch (e) { /* re-fetch */ }
  const legs = await Promise.all(cities.slice(1).map(async (b, i) => {
    const a = cities[i];
    const url = `${RVX_MAP.osrm}/${a.lon},${a.lat};${b.lon},${b.lat}?overview=full&geometries=geojson`;
    const r = await fetch(url);
    if (!r.ok) throw new Error(`osrm ${r.status}`);
    const j = await r.json();
    const coords = j.routes?.[0]?.geometry?.coordinates;
    if (!coords || coords.length < 2) throw new Error('osrm empty leg');
    return coords;
  }));
  try { localStorage.setItem(KEY, JSON.stringify(legs)); } catch (e) { /* quota — fine */ }
  return { legs, source: 'roads' };
}

const legsToFC = (legs, cities) => ({
  type: 'FeatureCollection',
  features: legs.map((coords, i) => ({
    type: 'Feature',
    properties: { to: cities[i + 1].id, from: cities[i].id },
    geometry: { type: 'LineString', coordinates: coords },
  })),
});

const citiesFC = () => ({
  type: 'FeatureCollection',
  features: D.CITIES.map((c) => ({
    type: 'Feature',
    properties: { name: c.name },
    geometry: { type: 'Point', coordinates: [c.lon, c.lat] },
  })),
});

export function RouteMap({ onOpenTimeline }) {
  const wrapRef = React.useRef(null);
  const mapRef = React.useRef(null);
  const legsRef = React.useRef(null);
  const rvMarkerRef = React.useRef(null);
  const rvElRef = React.useRef(null);
  const animRef = React.useRef(null);
  const hoverTimer = React.useRef(null);
  const drivenRef = React.useRef(false);
  const lineClickAt = React.useRef(0);

  const [mode, setMode] = React.useState('sat');        // '2d' | 'sat' | '3d'
  const [mapTheme, setMapTheme] = React.useState('dark'); // 2D flavor: 'dark' | 'light'
  const modeRef = React.useRef('sat');
  const themeRef = React.useRef('dark');
  const [legs, setLegs] = React.useState(null);
  const [activeCity, setActiveCity] = React.useState(null);
  const [pinned, setPinned] = React.useState(false);
  const [popPos, setPopPos] = React.useState(null);
  const [failed, setFailed] = React.useState(false);

  /* ---- route geometry: real streets, cached; arcs as fallback ------------- */
  React.useEffect(() => {
    let alive = true;
    fetchDrivingLegs(D.CITIES)
      .then(({ legs: l }) => { if (alive) setLegs(l); })
      .catch(() => { if (alive) setLegs(D.CITIES.slice(1).map((b, i) => bezierLeg(D.CITIES[i], b))); });
    return () => { alive = false; };
  }, []);

  const addOverlays = React.useCallback((map) => {
    const l = legsRef.current;
    if (import.meta.env.DEV) console.info('[rvx] addOverlays', { legs: !!l, route: !!map.getSource('rvx-route'), loaded: map.isStyleLoaded() });
    if (!l || map.getSource('rvx-route')) return;
    if (map.getSource('rvx-cities')) return;
    map.addSource('rvx-route', { type: 'geojson', data: legsToFC(l, D.CITIES) });
    map.addLayer({
      id: 'rvx-route-glow', type: 'line', source: 'rvx-route',
      paint: { 'line-color': '#E8853A', 'line-width': 10, 'line-blur': 8, 'line-opacity': 0.55 },
    });
    map.addLayer({
      id: 'rvx-route-line', type: 'line', source: 'rvx-route',
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: { 'line-color': '#E8853A', 'line-width': 3.2 },
    });
    map.addLayer({
      id: 'rvx-route-dash', type: 'line', source: 'rvx-route',
      paint: { 'line-color': '#F6E7C8', 'line-width': 1.1, 'line-dasharray': [0.4, 3.2] },
    });
    /* fat invisible hit area so the route is easy to hover/tap */
    map.addLayer({
      id: 'rvx-route-hit', type: 'line', source: 'rvx-route',
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: { 'line-color': '#000000', 'line-width': 18, 'line-opacity': 0.01 },
    });
    /* city names drawn BY the GL engine at the exact coordinates — they can't
       drift from their cities at any zoom or pitch. Black text on the light map. */
    const lightLabels = modeRef.current === '2d' && themeRef.current === 'light';
    map.addSource('rvx-cities', { type: 'geojson', data: citiesFC() });
    map.addLayer({
      id: 'rvx-city-labels', type: 'symbol', source: 'rvx-cities',
      layout: {
        'text-field': ['get', 'name'],
        'text-font': ['Noto Sans Bold'],
        'text-size': 13.5,
        'text-letter-spacing': 0.08,
        'text-transform': 'uppercase',
        'text-anchor': 'bottom',
        'text-offset': [0, -0.85],
        'text-allow-overlap': true,
        'text-ignore-placement': true,
      },
      paint: lightLabels
        ? { 'text-color': '#16130F', 'text-halo-color': '#FFFFFF', 'text-halo-width': 1.8 }
        : { 'text-color': '#F6EFDC', 'text-halo-color': '#16130F', 'text-halo-width': 1.8 },
    });
  }, []);

  /* ---- init ---------------------------------------------------------------- */
  React.useEffect(() => {
    let map;
    try {
      map = new maplibregl.Map({
        container: wrapRef.current,
        style: rvxSatStyle(false),
        center: [-89.5, 29.6],
        zoom: 5.1,
        attributionControl: { compact: true, customAttribution: 'Routing © OSRM' },
      });
    } catch (e) { setFailed(true); return; }
    mapRef.current = map;
    if (import.meta.env.DEV) window.__rvxMap = map;
    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'top-left');

    /* overlays re-attach after every style swap (Map/Satellite/3D all carry the route) */
    map.on('style.load', () => addOverlays(map));

    /* city markers — dot sits ON the city, label floats right above it */
    D.CITIES.forEach((c) => {
      const el = document.createElement('button');
      el.type = 'button';
      el.className = `gl-city${c.status === 'current' ? ' gl-city--now' : ''}`;
      el.setAttribute('aria-label', `${c.name}, ${c.region}`);
      el.innerHTML = `<span class="gl-city__pulse"></span><span class="gl-city__dot"></span>`;
      el.addEventListener('click', (e) => { e.stopPropagation(); setActiveCity(c.id); setPinned(true); });
      el.addEventListener('mouseenter', () => { clearTimeout(hoverTimer.current); setActiveCity(c.id); });
      el.addEventListener('mouseleave', () => scheduleClose());
      new maplibregl.Marker({ element: el, anchor: 'center' }).setLngLat([c.lon, c.lat]).addTo(map);
    });

    /* RV marker (placed + driven once the route geometry is in).
       Offset rides it ~30px above its coordinate so at a stop it sits ON TOP
       of the GL city label (dot → name → RV) instead of covering the word. */
    const rvEl = document.createElement('div');
    rvEl.className = 'gl-rv';
    rvEl.innerHTML = `<img src="${rvMarkerUrl}" alt="" draggable="false">`;
    rvElRef.current = rvEl;
    rvMarkerRef.current = new maplibregl.Marker({ element: rvEl, anchor: 'bottom', offset: [0, -36] })
      .setLngLat([D.CITIES[D.CITIES.length - 1].lon, D.CITIES[D.CITIES.length - 1].lat]).addTo(map);

    /* interactive route line: hover lights it up, click opens the leg's stop */
    map.on('mouseenter', 'rvx-route-hit', () => {
      map.getCanvas().style.cursor = 'pointer';
      if (map.getLayer('rvx-route-line')) map.setPaintProperty('rvx-route-line', 'line-width', 4.8);
      if (map.getLayer('rvx-route-glow')) map.setPaintProperty('rvx-route-glow', 'line-opacity', 0.85);
    });
    map.on('mouseleave', 'rvx-route-hit', () => {
      map.getCanvas().style.cursor = '';
      if (map.getLayer('rvx-route-line')) map.setPaintProperty('rvx-route-line', 'line-width', 3.2);
      if (map.getLayer('rvx-route-glow')) map.setPaintProperty('rvx-route-glow', 'line-opacity', 0.55);
    });
    map.on('click', 'rvx-route-hit', (e) => {
      lineClickAt.current = Date.now();
      const to = e.features?.[0]?.properties?.to;
      if (to) { setActiveCity(to); setPinned(true); }
    });
    map.on('click', () => {
      if (Date.now() - lineClickAt.current < 250) return; // the line handled it
      setPinned(false); setActiveCity(null);
    });

    return () => { cancelAnimationFrame(animRef.current); map.remove(); mapRef.current = null; };
  }, []);

  /* ---- when the street route lands: draw it, fit it, drive the last leg ---- */
  React.useEffect(() => {
    const map = mapRef.current;
    if (!map || !legs) return;
    legsRef.current = legs;
    /* style readiness is racy (mount setStyle restarts the load and consumes
       'style.load' before the route arrives) — poll until attachable instead */
    let ensureTimer;
    const ensure = () => {
      if (!mapRef.current) return;
      if (map.isStyleLoaded()) { addOverlays(map); return; }
      ensureTimer = setTimeout(ensure, 150);
    };
    ensure();

    const flat = legs.flat();
    const b = new maplibregl.LngLatBounds();
    flat.forEach((p) => b.extend(p));
    map.fitBounds(b, { padding: { top: 70, bottom: 60, left: 70, right: 70 }, duration: drivenRef.current ? 600 : 0 });

    const home = D.CITIES[D.CITIES.length - 1]; // park exactly on the current stop
    if (drivenRef.current) {
      rvMarkerRef.current?.setLngLat([home.lon, home.lat]);
      return;
    }
    drivenRef.current = true;
    const lastLeg = legs[legs.length - 1];
    const seg = lastLeg.slice(-Math.min(120, lastLeg.length));
    const rvMarker = rvMarkerRef.current;
    const rvEl = rvElRef.current;
    if (!rvMarker || seg.length < 2) return;
    const t0 = performance.now(); const DUR = 2800;
    const ease = (t) => 1 - Math.pow(1 - t, 3);
    const step = (now) => {
      const t = Math.min(1, (now - t0) / DUR);
      const f = ease(t) * (seg.length - 1);
      const i = Math.max(0, Math.min(seg.length - 2, Math.floor(f)));
      const a = seg[i]; const c = seg[i + 1] || a;
      if (!a) return;
      const frac = f - i;
      rvMarker.setLngLat([a[0] + (c[0] - a[0]) * frac, a[1] + (c[1] - a[1]) * frac]);
      if (rvEl.firstChild) rvEl.firstChild.style.transform = c[0] < a[0] ? 'scaleX(-1)' : '';
      if (t < 1) animRef.current = requestAnimationFrame(step);
      else { rvMarker.setLngLat([home.lon, home.lat]); if (rvEl.firstChild) rvEl.firstChild.style.transform = ''; }
    };
    animRef.current = requestAnimationFrame(step);
    return () => { cancelAnimationFrame(animRef.current); clearTimeout(ensureTimer); };
  }, [legs, addOverlays]);

  /* ---- mode + theme switching ----------------------------------------------
     setStyle() is async and aborts in-flight camera animations, so camera
     moves wait for 'style.load'; the 3D fly-in retries + orbits on 'idle'. */
  React.useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    modeRef.current = mode;
    themeRef.current = mapTheme;
    let orbitTimer;
    const handlers = [];
    const once = (ev, fn) => { map.once(ev, fn); handlers.push([ev, fn]); };

    /* diff:false forces a full style reload so 'style.load' ALWAYS fires and
       the route overlays re-attach — a successful style diff would silently
       strip our layers without ever emitting the event. */
    if (mode === '3d') {
      map.setStyle(rvxSatStyle(true), { diff: false });
      once('style.load', () => {
        map.easeTo({ pitch: 58, bearing: -12, zoom: Math.max(map.getZoom(), 6.4), duration: 900 });
      });
      once('idle', () => {
        if (map.getPitch() < 50) map.easeTo({ pitch: 58, bearing: -12, duration: 700 });
        if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
          orbitTimer = setTimeout(() => map.rotateTo(16, { duration: 9000 }), 900);
        }
      });
    } else if (mode === 'sat') {
      map.setStyle(rvxSatStyle(false), { diff: false });
      once('style.load', () => map.easeTo({ pitch: 0, bearing: 0, duration: 700 }));
    } else {
      map.setStyle(mapTheme === 'light' ? RVX_MAP.vectorLight : rvxDarkStyle(), { diff: false });
      once('style.load', () => map.easeTo({ pitch: 0, bearing: 0, duration: 700 }));
    }
    return () => { handlers.forEach(([ev, fn]) => map.off(ev, fn)); clearTimeout(orbitTimer); };
  }, [mode, mapTheme]);

  /* ---- popup projection ------------------------------------------------------ */
  React.useEffect(() => {
    const map = mapRef.current;
    if (!map || !activeCity) { setPopPos(null); return; }
    const c = D.CITIES.find((x) => x.id === activeCity);
    const update = () => {
      const p = map.project([c.lon, c.lat]);
      setPopPos({ x: p.x, y: p.y });
    };
    update();
    map.on('move', update);
    return () => map.off('move', update);
  }, [activeCity]);

  const scheduleClose = () => {
    clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => {
      setActiveCity((cur) => (pinnedRef.current ? cur : null));
    }, 280);
  };
  const pinnedRef = React.useRef(pinned);
  React.useEffect(() => { pinnedRef.current = pinned; }, [pinned]);

  const stepCity = (dir) => {
    const idx = D.CITIES.findIndex((c) => c.id === activeCity);
    const next = D.CITIES[(idx + dir + D.CITIES.length) % D.CITIES.length];
    setActiveCity(next.id); setPinned(true);
    const map = mapRef.current;
    if (map) map.easeTo({ center: [next.lon, next.lat], duration: 600 });
  };

  const active = activeCity ? D.CITIES.find((c) => c.id === activeCity) : null;

  if (failed) {
    return (
      <div className="map-wrap map-wrap--failed rvx-meta">
        Map engine unavailable here — the route runs Austin → New Orleans → Tampa → Orlando.
      </div>
    );
  }

  return (
    <div className="map-wrap" data-screen-label="RV X map">
      <div ref={wrapRef} className="gl-canvas" />

      <div className="map-ctrls">
        <div className="map-modes" role="group" aria-label="Map view">
          {[['2d', 'Map'], ['sat', 'Satellite'], ['3d', '3D']].map(([m, label]) => (
            <button key={m} type="button"
              className={`map-mode${mode === m ? ' map-mode--on' : ''}`}
              onClick={() => setMode(m)}>
              {label}
            </button>
          ))}
        </div>
        {mode === '2d' && (
          <div className="map-modes" role="group" aria-label="Map theme">
            {[['dark', 'Dark'], ['light', 'Light']].map(([t, label]) => (
              <button key={t} type="button"
                className={`map-mode${mapTheme === t ? ' map-mode--on' : ''}`}
                onClick={() => setMapTheme(t)}>
                {label}
              </button>
            ))}
          </div>
        )}
      </div>

      {!legs && (
        <div className="map-loading rvx-meta">
          <span className="map-loading__spin" aria-hidden="true" />
          Plotting the route along real roads…
        </div>
      )}

      {active && popPos && (
        <div
          className="city-pop"
          style={{ left: popPos.x, top: popPos.y }}
          onMouseEnter={() => clearTimeout(hoverTimer.current)}
          onMouseLeave={scheduleClose}
          data-screen-label={`City popup — ${active.name}`}
        >
          <div className="city-pop__head">
            <div>
              <div className="rvx-eyebrow" style={{ fontSize: 11 }}>
                Stop {String(active.stop).padStart(2, '0')}{active.status === 'current' ? ' · Current' : ''}
              </div>
              <div className="city-pop__name">{active.name}, {active.region}</div>
              <div className="rvx-meta" style={{ fontSize: 11 }}>{active.start} → {active.end || 'now'}</div>
            </div>
            <div className="city-pop__nav">
              <button className="city-pop__navbtn" aria-label="Previous stop" onClick={() => stepCity(-1)}>‹</button>
              <button className="city-pop__navbtn" aria-label="Next stop" onClick={() => stepCity(1)}>›</button>
              <button className="city-pop__navbtn" aria-label="Close" onClick={() => { setPinned(false); setActiveCity(null); }}>✕</button>
            </div>
          </div>

          <div className="city-pop__vods">
            {D.vodsForCity(active.id).filter((v) => v.channel === 'chickenandy').slice(0, 4).map((v) => (
              <button key={v.id} className="mini-vod" type="button" title={v.title}>
                <span className="mini-vod__thumb" style={{ '--h': v.thumbHue }}>
                  <span className="mini-vod__rv">RV✕</span>
                  {v.thumbnail && <img className="thumb-img" src={v.thumbnail} alt="" loading="lazy" />}
                  <span className="mini-vod__dur">{v.duration}</span>
                </span>
                <span className="mini-vod__title">{v.title}</span>
                <span className="mini-vod__meta">{v.date} · {D.fmtViews(v.views)} views</span>
              </button>
            ))}
          </div>

          <button className="city-pop__all" type="button"
            onClick={() => onOpenTimeline && onOpenTimeline(active.id)}>
            All {D.vodsForCity(active.id).length} VODs &amp; {D.clipsForCity(active.id).length} clips →
          </button>
        </div>
      )}
    </div>
  );
}
