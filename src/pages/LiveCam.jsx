/* LiveCam — the always-on in-RV 24/7 camera. Embeds Kick's official player for
   the dedicated cam channel (chickenandytv) in a responsive 16:9 stage. The
   iframe only mounts while this tab is open, so nothing streams in the
   background. A light channel fetch surfaces the real stream title + live
   state, degrading silently to static copy if Kick blocks the request. */
import React from 'react';
import D from '../data.js';
import { Badge, Button } from '../ds/index.js';

const SLUG = 'chickenandytv';
const EMBED = `https://player.kick.com/${SLUG}?autoplay=true&muted=true`;

export function LiveCam() {
  const [info, setInfo] = React.useState(null); // { live, title, viewers }

  React.useEffect(() => {
    let alive = true;
    fetch(`https://kick.com/api/v2/channels/${SLUG}`, { mode: 'cors' })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (!alive || !j) return;
        setInfo({
          live: !!j.livestream,
          title: j.livestream?.session_title || null,
          viewers: j.livestream?.viewer_count ?? null,
        });
      })
      .catch(() => { /* CORS/offline — keep static copy */ });
    return () => { alive = false; };
  }, []);

  const offline = info && !info.live;

  return (
    <section className="screen screen--hub livecam" data-screen-label="Live Cam">
      <header className="livecam__head">
        <div>
          <div className="rvx-eyebrow">Inside the rig · always rolling</div>
          <h2 className="livecam__title">RV 24/7 Cam</h2>
          <p className="livecam__sub">
            {info?.title
              || 'The in-RV camera streams the whole trip around the clock, straight from ChickenAndyTV on Kick.'}
          </p>
        </div>
        <div className="livecam__meta">
          {offline
            ? <Badge variant="neutral">Offline</Badge>
            : <Badge variant="live">Live now</Badge>}
          {info?.viewers != null && !offline && (
            <span className="livecam__viewers rvx-meta">{D.fmtViews(info.viewers)} watching</span>
          )}
        </div>
      </header>

      <div className="livecam__stage">
        <iframe
          className="livecam__frame"
          src={EMBED}
          title="ChickenAndy RV 24/7 camera"
          allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>

      <div className="livecam__bar">
        <span className="livecam__note rvx-meta">
          Muted autoplay · use the player controls to unmute, go fullscreen, or pop it out.
        </span>
        <div className="livecam__actions">
          <Button variant="outline" href={`https://kick.com/${SLUG}/chatroom`} target="_blank" rel="noopener noreferrer">
            Open chat
          </Button>
          <Button variant="primary" href={D.LINKS.rvcam} target="_blank" rel="noopener noreferrer">
            Watch on Kick
          </Button>
        </div>
      </div>
    </section>
  );
}
