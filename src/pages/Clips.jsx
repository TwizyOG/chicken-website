/* Clips — Kick-powered clips browser.
   Search bar + dropdown filters: timeframe (2w/1m/3m/6m/all), sort
   (most/least viewed, newest/oldest) and minimum view count. ChickenAndy's
   main roll on top, per-streamer rolls below, all in arrow sliders that snap
   back to the start when the filters change. */
import React from 'react';
import D from '../data.js';
import { Input, Badge } from '../ds/index.js';
import { TiltCard } from '../motion.jsx';
import { Slider, Select, SkeletonTile } from '../ui.jsx';

const WINDOW_DAYS = { '2w': 14, '1m': 31, '3m': 92, '6m': 183, all: Infinity };
const WINDOW_OPTS = [['all', 'All time'], ['2w', 'Last 2 weeks'], ['1m', 'Last month'], ['3m', 'Last 3 months'], ['6m', 'Last 6 months']];
const SORT_OPTS = [['new', 'Newest'], ['old', 'Oldest'], ['views-desc', 'Most viewed'], ['views-asc', 'Least viewed']];
const VIEWS_OPTS = [['0', 'Any views'], ['100', '100+ views'], ['500', '500+ views'], ['1000', '1,000+ views'], ['5000', '5,000+ views']];

export function ClipTile({ c, onPlay }) {
  return (
    <button type="button" className="vod-tile vod-tile--clip" onClick={() => onPlay({ ...c, kind: 'clip' })} title={c.title}>
      <TiltCard className="vod-tile__in">
        <span className="vod-tile__thumb" style={{ '--h': c.thumbHue }}>
          <span className="mini-vod__rv">RV✕</span>
          {c.thumbnail && <img className="thumb-img" src={c.thumbnail} alt="" loading="lazy" />}
          {c.thumbnail && <span className="thumb-shade" aria-hidden="true" />}
          <span className="vod-tile__badges"><Badge variant="kick" size="sm">Clip</Badge></span>
          <span className="mini-vod__dur">{c.duration}</span>
          <span className="vod-tile__play" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 4v16l13-8z" /></svg>
          </span>
        </span>
        <span className="vod-tile__title">{c.title}</span>
        <span className="vod-tile__meta">{c.date} · {D.fmtViews(c.views)} views · {c.channel}</span>
      </TiltCard>
    </button>
  );
}

function clipSearchMatch(c, q) {
  if (!q.trim()) return true;
  const s = q.trim().toLowerCase();
  return c.date.includes(s) || c.title.toLowerCase().includes(s) || c.channel.includes(s);
}

/* Heavy histories stay snappy: rolls render at most this many tiles. */
const ROLL_CAP = 120;

export function Clips({ onPlay, loading, scope = 'main' }) {
  const [win, setWin] = React.useState('all');
  const [sort, setSort] = React.useState('new');
  const [minViews, setMinViews] = React.useState('0');
  const [q, setQ] = React.useState('');

  const now = Date.now();
  const passes = (c) => {
    if (+minViews && c.views < +minViews) return false;
    if (win !== 'all' && (now - D.parseDate(c.date).getTime()) / 86400000 > WINDOW_DAYS[win]) return false;
    return clipSearchMatch(c, q);
  };
  const sortFn = {
    'new': (a, b) => b.day - a.day,
    'old': (a, b) => a.day - b.day,
    'views-desc': (a, b) => b.views - a.views,
    'views-asc': (a, b) => a.views - b.views,
  }[sort];

  const andyAll = D.CLIPS.filter((c) => c.channel === 'chickenandy' && passes(c)).sort(sortFn);
  const andyClips = andyAll.slice(0, ROLL_CAP);
  /* crew rolls belong to the event hubs — the main page is ChickenAndy only */
  const crewRolls = scope !== 'event' ? [] : D.CAST
    .filter((c) => c.slug && c.slug !== 'chickenandy')
    .map((c) => ({ cast: c, clips: D.CLIPS.filter((x) => x.channel === c.slug && passes(x)).sort(sortFn).slice(0, ROLL_CAP) }))
    .filter((r) => r.clips.length > 0);

  const resetKey = `${win}|${sort}|${minViews}|${q}`;

  const SearchIc = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" />
    </svg>
  );

  return (
    <section className="screen" data-screen-label="Clips">
      <header className="screen__head">
        <div>
          <div className="rvx-eyebrow">From Kick, watchable here</div>
          <h2 className="screen__title">Clips</h2>
        </div>
        <p className="screen__sub">
          Pulled live from <a href={D.LINKS.clips} target="_blank" rel="noopener noreferrer">kick.com/chickenandy/clips</a> and
          each crew channel — playable without leaving the site.
        </p>
      </header>

      <div className="clip-bar">
        <div className="clip-bar__search clip-bar__search--lead">
          <Input size="sm" iconLeft={<SearchIc />} placeholder="Search clips… title, channel or date"
            value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div className="clip-bar__selects">
          <Select label="Timeframe" value={win} onChange={setWin} options={WINDOW_OPTS} />
          <Select label="Sort by" value={sort} onChange={setSort} options={SORT_OPTS} />
          <Select label="View count" value={minViews} onChange={setMinViews} options={VIEWS_OPTS} />
        </div>
      </div>

      <div className="roll">
        <div className="roll__head">
          <span className="roll__title">ChickenAndy — main channel</span>
          <a className="roll__link" href={D.LINKS.clips} target="_blank" rel="noopener noreferrer">kick.com/chickenandy/clips →</a>
        </div>
        <Slider resetKey={resetKey}>
          {loading
            ? [...Array(6)].map((_, i) => <SkeletonTile key={i} />)
            : andyClips.map((c) => <ClipTile key={c.id} c={c} onPlay={onPlay} />)}
          {!loading && andyClips.length === 0 && <p className="tl-empty">No clips match — loosen the filters.</p>}
        </Slider>
        {andyAll.length > ROLL_CAP && (
          <p className="roll__note rvx-meta">
            Showing {ROLL_CAP} of {andyAll.length} clips — tighten the timeframe, views or search to dig deeper.
          </p>
        )}
      </div>

      {crewRolls.map(({ cast, clips }) => (
        <div className="roll" key={cast.id}>
          <div className="roll__head">
            <span className="roll__title">{cast.name}</span>
            <a className="roll__link" href={`https://kick.com/${cast.slug}/clips`} target="_blank" rel="noopener noreferrer">kick.com/{cast.slug}/clips →</a>
          </div>
          <Slider resetKey={resetKey}>
            {clips.map((c) => <ClipTile key={c.id} c={c} onPlay={onPlay} />)}
          </Slider>
        </div>
      ))}
    </section>
  );
}
