/* CityMenu — the "stop sheet" that opens when you tap a leg chip under the
   route map. Left: a calendar of the stay — every date of the stop is
   highlighted, days with media carry V/C counts and are tappable. Right:
   that stop's VODs and clips; picking a day filters the list to that date. */
import React from 'react';
import D from '../data.js';
import { Badge } from '../ds/index.js';
import { CalCount } from '../ui.jsx';

const pad2 = (n) => String(n).padStart(2, '0');

function CityCal({ city, media, picked, onPickDay }) {
  const stayStart = D.parseDate(city.start);
  const stayEnd = city.end ? D.parseDate(city.end) : D.TODAY;

  const months = [];
  for (let d = new Date(stayStart.getFullYear(), stayStart.getMonth(), 1);
    d <= stayEnd; d = new Date(d.getFullYear(), d.getMonth() + 1, 1)) {
    months.push({
      y: d.getFullYear(), m: d.getMonth(),
      label: d.toLocaleString('en-US', { month: 'long', year: 'numeric' }),
    });
  }
  const [mi, setMi] = React.useState(0);
  const { y, m, label } = months[Math.min(mi, months.length - 1)];

  const first = new Date(y, m, 1);
  const startDow = first.getDay();
  const daysIn = new Date(y, m + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= daysIn; d++) cells.push(d);

  return (
    <div className="cal cal--stay">
      <div className="cal__head">
        <button type="button" className="city-pop__navbtn" aria-label="Previous month"
          disabled={mi === 0} onClick={() => setMi(Math.max(0, mi - 1))}>‹</button>
        <span className="cal__month">{label}</span>
        <button type="button" className="city-pop__navbtn" aria-label="Next month"
          disabled={mi >= months.length - 1} onClick={() => setMi(Math.min(months.length - 1, mi + 1))}>›</button>
      </div>
      <div className="cal__grid">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => <span key={i} className="cal__dow">{d}</span>)}
        {cells.map((d, i) => {
          if (d === null) return <span key={`e${i}`} />;
          const date = new Date(y, m, d);
          const ds = `${pad2(m + 1)}/${pad2(d)}/${String(y).slice(2)}`;
          const inStay = date >= stayStart && date <= stayEnd;
          const items = media.filter((x) => x.date === ds);
          const vods = items.filter((x) => x.kind === 'vod').length;
          const clips = items.filter((x) => x.kind === 'clip').length;
          const has = vods + clips > 0;
          return (
            <button key={ds} type="button"
              className={`cal__day${inStay ? ' cal__day--stay' : ''}${has ? ' cal__day--has' : ''}${picked === ds ? ' cal__day--on' : ''}`}
              disabled={!has}
              onClick={() => onPickDay(picked === ds ? null : ds)}>
              <span className="cal__num">{d}</span>
              {has && (
                <span className="cal__counts">
                  {vods > 0 && <CalCount kind="vod" n={vods} />}
                  {clips > 0 && <CalCount kind="clip" n={clips} />}
                </span>
              )}
            </button>
          );
        })}
      </div>
      <p className="cal__hint rvx-meta">Amber days = parked at this stop · tap a day with counts to filter</p>
    </div>
  );
}

function MediaRow({ x, onPlay }) {
  return (
    <button type="button" className="tl-clip" onClick={() => onPlay(x)} title={x.title}>
      <span className="mini-vod__thumb" style={{ '--h': x.thumbHue }}>
        <span className="mini-vod__rv">RV✕</span>
        {x.thumbnail && <img className="thumb-img" src={x.thumbnail} alt="" loading="lazy" />}
        <span className="mini-vod__dur">{x.duration}</span>
      </span>
      <span className="tl-clip__body">
        <span className="tl-clip__title">{x.title}</span>
        <span className="tl-clip__meta">
          {x.kind === 'vod' ? (x.source === 'kick' ? 'Kick VOD' : 'YT archive') : 'Kick clip'} · {x.date} · {x.time} CT · {x.channel}
        </span>
      </span>
    </button>
  );
}

export function CityMenu({ cityId, onPlay, onOpenTimeline }) {
  const city = D.CITIES.find((c) => c.id === cityId);
  const [picked, setPicked] = React.useState(null);
  if (!city) return null;

  const vods = D.vodsForCity(cityId).map((v) => ({ ...v, kind: 'vod' }));
  const clips = D.clipsForCity(cityId).map((c) => ({ ...c, kind: 'clip' }));
  const media = [...vods, ...clips];

  const shown = picked ? media.filter((x) => x.date === picked) : media;
  const shownVods = shown.filter((x) => x.kind === 'vod').sort((a, b) => b.day - a.day);
  const shownClips = shown.filter((x) => x.kind === 'clip').sort((a, b) => b.views - a.views);

  return (
    <div className="city-menu" data-screen-label={`Stop menu — ${city.name}`}>
      <header className="city-menu__head">
        <div>
          <div className="rvx-eyebrow">Stop {pad2(city.stop)} · {city.start} → {city.end || 'now'}</div>
          <h3 className="city-menu__title">{city.name}, {city.region}</h3>
          <p className="city-menu__blurb">{city.blurb}</p>
        </div>
        {city.status === 'current' && <Badge variant="live">Live here</Badge>}
      </header>

      <div className="city-menu__grid">
        <CityCal city={city} media={media} picked={picked} onPickDay={setPicked} />

        <div className="city-menu__media">
          <div className="city-menu__bar">
            <span className="city-menu__count">
              {picked || 'Entire stay'} — {shownVods.length} VODs · {shownClips.length} clips
            </span>
            {picked && (
              <button type="button" className="city-menu__clear" onClick={() => setPicked(null)}>
                Show all ✕
              </button>
            )}
          </div>

          <div className="city-menu__list">
            {shownVods.length > 0 && (
              <>
                <div className="tl-sec__label">VODs</div>
                {shownVods.map((x) => <MediaRow key={`v_${x.id}`} x={x} onPlay={onPlay} />)}
              </>
            )}
            {shownClips.length > 0 && (
              <>
                <div className="tl-sec__label">Clips</div>
                {shownClips.map((x) => <MediaRow key={`c_${x.id}`} x={x} onPlay={onPlay} />)}
              </>
            )}
            {shown.length === 0 && <p className="tl-empty">Nothing archived on that date.</p>}
          </div>

          <button type="button" className="city-pop__all" onClick={() => onOpenTimeline(cityId)}>
            Open the day-by-day timeline →
          </button>
        </div>
      </div>
    </div>
  );
}
