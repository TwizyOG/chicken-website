/* Vods — the VOD library. Calendar and grid live on ONE page now:
   the calendar (with its day panel, VODs listed before clips) sits up top,
   the channel rolls follow as arrow sliders. Newest/oldest sorting snaps
   the sliders back to the start. */
import React from 'react';
import D from '../data.js';
import { Input, Badge } from '../ds/index.js';
import { TiltCard } from '../motion.jsx';
import { Slider, Select, SkeletonTile, CalCount } from '../ui.jsx';

const SORT_OPTS = [['new', 'Newest first'], ['old', 'Oldest first']];

function vodSearchMatch(v, q) {
  if (!q.trim()) return true;
  const s = q.trim().toLowerCase();
  return v.date.includes(s) || v.title.toLowerCase().includes(s) || v.channel.includes(s);
}

export function VodGridCard({ v, onPlay }) {
  return (
    <button type="button" className="vod-tile" onClick={() => onPlay({ ...v, kind: 'vod' })} title={v.title}>
      <TiltCard className="vod-tile__in">
        <span className="vod-tile__thumb" style={{ '--h': v.thumbHue }}>
          <span className="mini-vod__rv">RV✕</span>
          {v.thumbnail && <img className="thumb-img" src={v.thumbnail} alt="" loading="lazy" />}
          {v.thumbnail && <span className="thumb-shade" aria-hidden="true" />}
          <span className="vod-tile__badges">
            {v.source === 'kick'
              ? <Badge variant="kick" size="sm">Kick</Badge>
              : <Badge variant="neutral" size="sm">YT archive</Badge>}
          </span>
          <span className="mini-vod__dur">{v.duration}</span>
          <span className="vod-tile__play" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 4v16l13-8z" /></svg>
          </span>
        </span>
        <span className="vod-tile__title">{v.title}</span>
        <span className="vod-tile__meta">{v.date} · {v.time} CT · {D.fmtViews(v.views)} views · {v.channel}</span>
      </TiltCard>
    </button>
  );
}

export function VodCalendar({ media, onPickDay, picked }) {
  const monthsList = D.months();
  const [mi, setMi] = React.useState(monthsList.length - 1);
  const { y, m, label } = monthsList[mi];

  const first = new Date(y, m, 1);
  const startDow = first.getDay();
  const daysIn = new Date(y, m + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= daysIn; d++) cells.push(d);

  const countFor = (d) => {
    const ds = `${String(m + 1).padStart(2, '0')}/${String(d).padStart(2, '0')}/${String(y).slice(2)}`;
    const items = media.filter((x) => x.date === ds);
    return { ds, vods: items.filter((x) => x.kind === 'vod').length, clips: items.filter((x) => x.kind === 'clip').length };
  };

  return (
    <div className="cal">
      <div className="cal__head">
        <button type="button" className="city-pop__navbtn" aria-label="Previous month"
          disabled={mi === 0} onClick={() => setMi(Math.max(0, mi - 1))}>‹</button>
        <span className="cal__month">{label}</span>
        <button type="button" className="city-pop__navbtn" aria-label="Next month"
          disabled={mi === monthsList.length - 1} onClick={() => setMi(Math.min(monthsList.length - 1, mi + 1))}>›</button>
      </div>
      <div className="cal__grid">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => <span key={i} className="cal__dow">{d}</span>)}
        {cells.map((d, i) => {
          if (d === null) return <span key={`e${i}`} />;
          const { ds, vods, clips } = countFor(d);
          const has = vods + clips > 0;
          return (
            <button key={ds} type="button"
              className={`cal__day${has ? ' cal__day--has' : ''}${picked === ds ? ' cal__day--on' : ''}`}
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
    </div>
  );
}

/* DayRow — one VOD or clip in the picked-day panel. VOD rows run bigger and
   carry the amber tag; clip rows are denser with the Kick-green tag. */
function DayRow({ x, onPlay }) {
  return (
    <button type="button" className={`day-row day-row--${x.kind}`} onClick={() => onPlay(x)} title={x.title}>
      <span className="mini-vod__thumb" style={{ '--h': x.thumbHue }}>
        <span className="mini-vod__rv">RV✕</span>
        {x.thumbnail && <img className="thumb-img" src={x.thumbnail} alt="" loading="lazy" />}
        <span className="mini-vod__dur">{x.duration}</span>
      </span>
      <span className="day-row__body">
        <span className="day-row__tag">{x.kind === 'vod' ? (x.source === 'youtube' ? 'VOD · YT' : 'VOD') : 'CLIP'}</span>
        <span className="day-row__title">{x.title}</span>
        <span className="day-row__meta">{x.time} CT · {D.fmtViews(x.views)} views · {x.channel}</span>
      </span>
    </button>
  );
}

export function Vods({ onPlay, loading, scope = 'main' }) {
  const [sort, setSort] = React.useState('new');
  const [q, setQ] = React.useState('');
  const [pickedDay, setPickedDay] = React.useState(null);

  const sortFn = (a, b) => (sort === 'new' ? b.day - a.day : a.day - b.day);
  const andyVods = D.VODS.filter((v) => v.channel === 'chickenandy' && vodSearchMatch(v, q)).sort(sortFn);
  /* crew rolls belong to the event hubs — the main page is ChickenAndy only */
  const crewRolls = scope !== 'event' ? [] : D.CAST
    .filter((c) => c.slug && c.slug !== 'chickenandy')
    .map((c) => ({ cast: c, vods: D.VODS.filter((v) => v.channel === c.slug && vodSearchMatch(v, q)).sort(sortFn) }))
    .filter((r) => r.vods.length > 0);
  /* calendar follows the scope too: main page counts ChickenAndy only */
  const inScope = (x) => scope === 'event' || x.channel === 'chickenandy';
  const allMedia = D.VODS.filter(inScope).map((v) => ({ ...v, kind: 'vod' }))
    .concat(D.CLIPS.filter(inScope).map((c) => ({ ...c, kind: 'clip' })));
  /* day panel: VODs lead in their own section, clips follow in theirs */
  const dayItems = pickedDay ? allMedia.filter((x) => x.date === pickedDay) : [];
  const dayVods = dayItems.filter((x) => x.kind === 'vod').sort((a, b) => b.day - a.day);
  const dayClips = dayItems.filter((x) => x.kind === 'clip').sort((a, b) => b.views - a.views);

  const resetKey = `${sort}|${q}`;

  const SearchIc = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" />
    </svg>
  );

  return (
    <section className="screen" data-screen-label="VODs">
      <header className="screen__head">
        <div>
          <div className="rvx-eyebrow">Every stream, archived</div>
          <h2 className="screen__title">VODs</h2>
        </div>
        <p className="screen__sub">
          Recent VODs play right here and link back to <a href={D.LINKS.videos} target="_blank" rel="noopener noreferrer">kick.com/chickenandy/videos</a>.
          Kick keeps the last 30 — everything older lives on the YouTube archive.
        </p>
      </header>

      <div className="clip-bar">
        <div className="clip-bar__search clip-bar__search--lead">
          <Input size="sm" iconLeft={<SearchIc />} placeholder="Search VODs… title, channel or date"
            value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div className="clip-bar__selects">
          <Select label="Sort by" value={sort} onChange={setSort} options={SORT_OPTS} />
        </div>
      </div>

      {/* ---- calendar + day panel (always on, front and center) ---- */}
      <div className="cal-layout">
        <VodCalendar media={allMedia} picked={pickedDay} onPickDay={setPickedDay} />
        <div className="cal-day-panel">
          {!pickedDay && (
            <p className="tl-empty">
              Pick a highlighted day to see everything from that date — VODs first, then clips.
            </p>
          )}
          {pickedDay && (
            <>
              <div className="day-head">
                <span className="day-head__date">{pickedDay}</span>
                <span className="day-head__counts">
                  <CalCount kind="vod" n={dayVods.length} />
                  <CalCount kind="clip" n={dayClips.length} />
                </span>
              </div>

              <section className="day-sec day-sec--vod">
                <h3 className="day-sec__label">VODs</h3>
                {dayVods.length === 0
                  ? <p className="tl-empty">No VODs archived on this date.</p>
                  : (
                    <div className="day-list">
                      {dayVods.map((x) => <DayRow key={`v_${x.id}`} x={x} onPlay={onPlay} />)}
                    </div>
                  )}
              </section>

              <section className="day-sec day-sec--clip">
                <h3 className="day-sec__label">Clips</h3>
                {dayClips.length === 0
                  ? <p className="tl-empty">No clips on this date.</p>
                  : (
                    <div className="day-list">
                      {dayClips.map((x) => <DayRow key={`c_${x.id}`} x={x} onPlay={onPlay} />)}
                    </div>
                  )}
              </section>
            </>
          )}
        </div>
      </div>

      {/* ---- channel rolls ---- */}
      <div className="roll">
        <div className="roll__head">
          <span className="roll__title">ChickenAndy — main channel</span>
          {D.CAST[0].live && <Badge variant="live" size="sm">Live</Badge>}
          <a className="roll__link" href={D.LINKS.videos} target="_blank" rel="noopener noreferrer">kick.com/chickenandy/videos →</a>
        </div>
        <Slider resetKey={resetKey}>
          {loading
            ? [...Array(6)].map((_, i) => <SkeletonTile key={i} />)
            : andyVods.map((v) => <VodGridCard key={v.id} v={v} onPlay={onPlay} />)}
          {!loading && andyVods.length === 0 && <p className="tl-empty">No VODs match that search.</p>}
        </Slider>
      </div>

      {crewRolls.map(({ cast, vods }) => (
        <div className="roll" key={cast.id}>
          <div className="roll__head">
            <span className="roll__title">{cast.name}</span>
            {cast.live && <Badge variant="live" size="sm">Live</Badge>}
            <a className="roll__link" href={`https://kick.com/${cast.slug}/videos`} target="_blank" rel="noopener noreferrer">kick.com/{cast.slug}/videos →</a>
          </div>
          <Slider resetKey={resetKey}>
            {vods.map((v) => <VodGridCard key={v.id} v={v} onPlay={onPlay} />)}
          </Slider>
        </div>
      ))}
    </section>
  );
}
