/* Timeline — day-by-day trip log. Each day expands to Description / VODs /
   Clips (VODs first). Everything plays in the in-site player. */
import React from 'react';
import D from '../data.js';
import { Tag } from '../ds/index.js';

function MediaRow({ m, onPlay, srcLabel }) {
  return (
    <button type="button" className="tl-clip" onClick={() => onPlay && onPlay(m)}>
      <span className="mini-vod__thumb" style={{ '--h': m.thumbHue }}>
        <span className="mini-vod__rv">RV✕</span>
        {m.thumbnail && <img className="thumb-img" src={m.thumbnail} alt="" loading="lazy" />}
        <span className="mini-vod__dur">{m.duration}</span>
      </span>
      <span className="tl-clip__body">
        <span className="tl-clip__title">{m.title}</span>
        <span className="tl-clip__meta">{srcLabel} · {m.channel} · {D.fmtViews(m.views)} views</span>
      </span>
    </button>
  );
}

export function Timeline({ initialCity, onPlay }) {
  const [range, setRange] = React.useState(0); // index of 10-day chunk
  const [cityFilter, setCityFilter] = React.useState(initialCity || null);
  const [openDay, setOpenDay] = React.useState(null);

  const chunks = [];
  for (let i = 0; i < D.DAYS.length; i += 10) {
    chunks.push({ from: D.DAYS[i].day, to: D.DAYS[Math.min(i + 9, D.DAYS.length - 1)].day });
  }

  let days = D.DAYS;
  if (cityFilter) days = days.filter((d) => d.cityId === cityFilter);
  else days = days.filter((d) => d.day >= chunks[range].from && d.day <= chunks[range].to);

  React.useEffect(() => { setCityFilter(initialCity || null); }, [initialCity]);

  return (
    <section className="screen" data-screen-label="Timeline">
      <header className="screen__head">
        <div>
          <div className="rvx-eyebrow">Day by day</div>
          <h2 className="screen__title">Timeline</h2>
        </div>
        <p className="screen__sub">
          Every day on the road — what happened, the full VODs, then the clips from that date.
        </p>
      </header>

      <div className="tl-filters">
        <div className="tl-filters__row">
          {chunks.map((c, i) => (
            <Tag key={i} size="sm" active={!cityFilter && range === i}
              onClick={() => { setRange(i); setCityFilter(null); }}>
              Days {c.from}–{c.to}
            </Tag>
          ))}
        </div>
        <div className="tl-filters__row">
          {D.CITIES.map((c) => (
            <Tag key={c.id} size="sm" active={cityFilter === c.id}
              onClick={() => setCityFilter(cityFilter === c.id ? null : c.id)}>
              {c.name}, {c.region}
            </Tag>
          ))}
        </div>
      </div>

      <div className="tl-list">
        {days.map((d) => {
          const open = openDay === d.day;
          return (
            <article key={d.day} className={`tl-day${open ? ' tl-day--open' : ''}`} data-screen-label={`Day ${d.day}`}>
              <button type="button" className="tl-day__row" onClick={() => setOpenDay(open ? null : d.day)}>
                <span className="tl-day__num">Day {d.day}</span>
                <span className="tl-day__date">{d.date}</span>
                <span className="tl-day__city">/ {d.city}</span>
                <span className="tl-day__counts">
                  {d.vods.length > 0 && <span>{d.vods.length} VOD</span>}
                  {d.clips.length > 0 && <span>{d.clips.length} clips</span>}
                </span>
                <span className="tl-day__chev" aria-hidden="true">{open ? '–' : '+'}</span>
              </button>

              {open && (
                <div className="tl-day__detail">
                  <div className="tl-sec">
                    <div className="tl-sec__label">Description</div>
                    <p className="tl-day__note">
                      {d.note || 'No recap written for this day yet — the VOD has the whole story.'}
                    </p>
                  </div>

                  <div className="tl-sec">
                    <div className="tl-sec__label">VODs <span className="tl-sec__src">full streams from this date</span></div>
                    {d.vods.length === 0
                      ? <p className="tl-empty">This day is covered by the neighboring VOD.</p>
                      : (
                        <div className="tl-clips">
                          {d.vods.map((v) => (
                            <MediaRow key={v.id} m={{ ...v, kind: 'vod' }} onPlay={onPlay}
                              srcLabel={v.source === 'kick' ? 'Kick VOD' : 'YT archive'} />
                          ))}
                        </div>
                      )}
                  </div>

                  <div className="tl-sec">
                    <div className="tl-sec__label">Clips <span className="tl-sec__src">from kick.com/chickenandy/clips · {d.date}</span></div>
                    {d.clips.length === 0
                      ? <p className="tl-empty">No clips were made on this date.</p>
                      : (
                        <div className="tl-clips">
                          {d.clips.map((c) => (
                            <MediaRow key={c.id} m={{ ...c, kind: 'clip' }} onPlay={onPlay} srcLabel="Kick clip" />
                          ))}
                        </div>
                      )}
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
