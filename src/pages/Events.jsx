/* Events — the trips index (RV X first) + the per-event hub shell.
   Every event gets Map · VODs · Clips · Timeline · Gallery · Crew tabs;
   past events show their YouTube-archive panels until that channel exists. */
import React from 'react';
import D from '../data.js';
import { Badge, Button, CastCard } from '../ds/index.js';
import { TiltCard, Reveal } from '../motion.jsx';

export const EVENT_TABS = ['Map', 'VODs', 'Clips', 'Timeline', 'Gallery', 'Crew'];
/* the live event also carries the always-on in-RV camera */
export const LIVE_EVENT_TABS = ['Map', 'Live Cam', 'VODs', 'Clips', 'Timeline', 'Gallery', 'Crew'];

export function EventsIndex({ onOpenEvent }) {
  const eventsOrdered = [...D.EVENTS].reverse(); // RV X → RV 8 → RV 7
  return (
    <section className="screen" data-screen-label="Events">
      <header className="screen__head">
        <div>
          <div className="rvx-eyebrow">Every run so far</div>
          <h2 className="screen__title">Events</h2>
        </div>
        <p className="screen__sub">
          Each trip is its own little site — map, VODs, clips, timeline, gallery and crew.
        </p>
      </header>
      <div className="ev-index">
        {eventsOrdered.map((ev, i) => (
          <Reveal key={ev.id} delay={i * 0.07}>
            <button type="button" className={`ev-big${ev.status === 'live' ? ' ev-big--live' : ''}`}
              onClick={() => onOpenEvent(ev.id)}>
              <TiltCard max={3} className="ev-big__in">
                <span className="ev-big__head">
                  <span className="ev-big__name">{ev.name}</span>
                  {ev.status === 'live'
                    ? <Badge variant="live">Live now</Badge>
                    : <span className="ev-big__yr">{ev.year}</span>}
                </span>
                <span className="ev-big__premise">{ev.premise}</span>
                <span className="ev-route">
                  {ev.route.map((r, j) => (
                    <React.Fragment key={j}>
                      <span className="ev-route__stop">{r}</span>
                      {j < ev.route.length - 1 && <span className="ev-route__arr">→</span>}
                    </React.Fragment>
                  ))}
                </span>
                <span className="ev-big__meta rvx-meta">
                  {ev.start} → {ev.end || 'now'} · {ev.status === 'live'
                    ? `${D.VODS.length} VODs · ${D.CLIPS.length} clips and counting`
                    : `${ev.vodCount} VODs · ${ev.clipCount} clips`}
                </span>
                <span className="ev-big__cta">{ev.status === 'live' ? 'Open the live map →' : 'Open event →'}</span>
              </TiltCard>
            </button>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* Hub shell: event header + tab row; the active tab's content renders as
   children (composed in App so tabs share the site-wide player/modals). */
export function EventHub({ eventId, tab, setTab, children }) {
  const ev = D.EVENTS.find((e) => e.id === eventId);
  if (!ev) return null;
  return (
    <div className="hub" data-screen-label={`Event ${ev.name}`}>
      <div className="hub__head">
        <div>
          <div className="rvx-eyebrow">{ev.year} · {ev.status === 'live' ? 'Live now' : 'Past event'} · {ev.start} → {ev.end || 'now'}</div>
          <h2 className="hub__title">{ev.name}</h2>
          <p className="hub__premise">{ev.premise}</p>
        </div>
        {ev.status === 'live' && <Badge variant="live">Live</Badge>}
      </div>
      <nav className="hub__tabs" aria-label={`${ev.name} sections`}>
        {(ev.status === 'live' ? LIVE_EVENT_TABS : EVENT_TABS).map((t) => (
          <button key={t} type="button"
            className={`hub__tab${tab === t ? ' hub__tab--on' : ''}`}
            onClick={() => setTab(t)}>
            {t}
          </button>
        ))}
      </nav>
      {children}
    </div>
  );
}

/* Past-event tab content (RV 7 / RV 8) — archive placeholders + real crew. */
export function ArchivePanel({ ev, tab, onExpand }) {
  if (tab === 'Crew') {
    return (
      <section className="screen screen--hub">
        <div className="crew-grid">
          {D.CAST.map((m) => (
            <div key={m.id} className="crew-cell">
              <CastCard name={m.name} role={m.role} live={m.live} photo={m.photo}
                socials={m.socials} onExpand={() => onExpand && onExpand(m)} />
              <p className="crew-bio">{m.bio}</p>
            </div>
          ))}
        </div>
      </section>
    );
  }
  return (
    <section className="screen screen--hub screen--narrow">
      {tab === 'Map' && (
        <div className="ev-route ev-route--big">
          {ev.route.map((r, i) => (
            <React.Fragment key={i}>
              <span className="ev-route__stop">{r}</span>
              {i < ev.route.length - 1 && <span className="ev-route__arr">→</span>}
            </React.Fragment>
          ))}
        </div>
      )}
      <div className="ev-archive">
        <Badge variant="neutral" size="sm">YT archive</Badge>
        <span>
          {ev.name}&rsquo;s {tab.toLowerCase()} populate from the YouTube archive channel once it&rsquo;s linked.
          {ev.archiveNote ? ` ${ev.archiveNote}` : ''}
        </span>
      </div>
      <div className="ev-meta-row">
        <span><b>{ev.start}</b> → <b>{ev.end}</b></span>
        <span><b>{ev.vodCount}</b> VODs</span>
        <span><b>{ev.clipCount}</b> clips</span>
      </div>
      <div className="about-actions">
        <Button variant="secondary" href={D.LINKS.youtube} target="_blank" rel="noopener noreferrer">Open archive (placeholder)</Button>
      </div>
    </section>
  );
}
