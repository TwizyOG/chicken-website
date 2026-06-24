/* ChickenAndy site shell — events bar, main nav (Home · VODs · Clips ·
   Events · About), view router, event hubs, modals, footer.
   Each event (RV X / RV 8 / RV 7) is its own hub with Map, VODs, Clips,
   Timeline, Gallery and Crew tabs; the main pages cover the channel itself. */
import React from 'react';
import { motion, AnimatePresence, MotionConfig } from 'framer-motion';
import D from './data.js';
import { hydrateKick } from './kick.js';
import { Reveal } from './motion.jsx';
import { Badge, Button, KickButton, CastCard, SocialRow } from './ds/index.js';
import { RouteMap } from './pages/RouteMap.jsx';
import { Home } from './pages/Home.jsx';
import { Vods } from './pages/Vods.jsx';
import { Clips } from './pages/Clips.jsx';
import { Timeline } from './pages/Timeline.jsx';
import { Gallery } from './pages/Gallery.jsx';
import { Crew } from './pages/Crew.jsx';
import { About } from './pages/About.jsx';
import { EventsIndex, EventHub, ArchivePanel } from './pages/Events.jsx';
import { CityMenu } from './pages/CityMenu.jsx';
import { LiveCam } from './pages/LiveCam.jsx';
import emblemUrl from './assets/rvx-emblem.svg';

const NAV = ['Home', 'VODs', 'Clips', 'Events', 'About'];

/* Royalty-free sample so mock VODs still play if Kick hydration fails;
   real VODs/clips stream their actual Kick HLS URLs (see src/kick.js). */
const SAMPLE_MP4 = 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4';

function Logo({ onClick }) {
  return (
    <button type="button" className="logo" onClick={onClick} aria-label="ChickenAndy home">
      <img src={emblemUrl} alt="" />
      <span className="logo__wm">CHICKENANDY</span>
    </button>
  );
}

function Header({ page, onNav, user, onLogin, onLogout, liveEvent, goLive }) {
  const Bolt = () => (<svg viewBox="0 0 24 24" fill="currentColor"><path d="M13 2 4 14h6l-1 8 9-12h-6z" /></svg>);
  return (
    <header className="hdr" data-screen-label="Header">
      <Logo onClick={() => onNav('Home')} />
      <nav className="hdr__nav" aria-label="Site">
        {NAV.map((v) => (
          <button key={v} type="button"
            className={`hdr__tab${page === v.toLowerCase() ? ' hdr__tab--on' : ''}`}
            onClick={() => onNav(v)}>
            {v}
          </button>
        ))}
      </nav>
      <div className="hdr__actions">
        {liveEvent && (
          <button type="button" className="hdr__live" onClick={goLive}
            aria-label={`${liveEvent.name} is live — open the live map`}>
            <span className="hdr__live-dot" aria-hidden="true" />
            {liveEvent.name}
            <span className="hdr__live-tag">Live</span>
          </button>
        )}
        <Button variant="donate" size="sm" className="hdr__donate" iconLeft={<Bolt />} aria-label="Donate"
          href={D.LINKS.powerchat} target="_blank" rel="noopener noreferrer">
          <span className="hide-xs">Donate</span>
        </Button>
        {user
          ? <KickButton size="sm" variant="outline" user={user} onClick={onLogout} title="Sign out" />
          : (
            <KickButton size="sm" onClick={onLogin}>
              <span className="hide-xs">Login with Kick</span>
              <span className="show-xs">Kick</span>
            </KickButton>
          )}
      </div>
    </header>
  );
}

function CastStrip({ onExpand }) {
  const active = D.CAST.filter((m) => !m.departed);
  const departed = D.CAST.filter((m) => m.departed);
  return (
    <div className="cast-strip" data-screen-label="Cast strip">
      <div className="cast-strip__active">
        {active.map((m) => (
          <CastCard key={m.id} name={m.name} role={m.role} live={m.live} photo={m.photo}
            avatarSize="lg" socials={m.socials} onExpand={() => onExpand(m)} />
        ))}
      </div>
      {departed.length > 0 && (
        <div className="cast-strip__past">
          <div className="cast-strip__past-label">Past crew</div>
          <div className="cast-strip__past-cards">
            {departed.map((m) => (
              <CastCard key={m.id} name={m.name} role={m.role} live={false} photo={m.photo}
                avatarSize="lg" socials={m.socials} departed onExpand={() => onExpand(m)} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* MultiKickBar — "watch the whole crew at once" CTA. Like ourempirex.com/multi,
   it reads who's live (D.CAST[i].live, hydrated from Kick in kick.js) and builds
   a MultiKick multiview URL — verified pattern: multikick.com/<slug1>/<slug2>/…,
   one path segment per channel. Live crew lead the URL so their players open
   first; if nobody's live it still opens the full crew grid. */
const MULTIKICK = 'https://multikick.com';
function MultiKickBar() {
  const crew = D.CAST.filter((c) => c.slug && !c.departed);
  const live = crew.filter((c) => c.live);
  const order = live.length ? [...live, ...crew.filter((c) => !c.live)] : crew;
  const url = `${MULTIKICK}/${order.map((c) => c.slug).join('/')}`;
  const GridIc = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <rect x="3" y="3" width="8" height="8" rx="1.5" /><rect x="13" y="3" width="8" height="8" rx="1.5" />
      <rect x="3" y="13" width="8" height="8" rx="1.5" /><rect x="13" y="13" width="8" height="8" rx="1.5" />
    </svg>
  );
  return (
    <div className="multikick" data-screen-label="MultiKick bar">
      <div className="multikick__lead">
        <span className="multikick__ic"><GridIc /></span>
        <div className="multikick__text">
          <span className="multikick__title">
            {live.length
              ? `${live.length} of the crew ${live.length === 1 ? 'is' : 'are'} live right now`
              : 'Watch the whole crew at once'}
          </span>
          <span className="multikick__sub">
            Every POV in one grid on MultiKick — drivers, navigator, cameras, all live side by side.
          </span>
        </div>
      </div>
      <div className="multikick__right">
        {live.length > 0 && (
          <div className="multikick__avs" aria-hidden="true">
            {live.slice(0, 5).map((c) => (
              <span key={c.id} className="multikick__av" title={`${c.name} — live`}>
                {c.photo ? <img src={c.photo} alt="" loading="lazy" /> : <span className="multikick__av-i">{c.name[0]}</span>}
                <span className="multikick__av-dot" />
              </span>
            ))}
          </div>
        )}
        <a className="multikick__btn" href={url} target="_blank" rel="noopener noreferrer">
          {live.length ? `Watch ${live.length} live on MultiKick` : 'Open the crew on MultiKick'}
          <span aria-hidden="true"> →</span>
        </a>
      </div>
    </div>
  );
}

function MapScreen({ event, onExpand, onOpenTimeline, onOpenCity, onOpenCam }) {
  return (
    <section className="screen screen--map" data-screen-label="Map home">
      <header className="map-hero">
        <Reveal>
          <div className="rvx-eyebrow">{event ? event.premise : 'The 2026 Gulf Run'} · live on Kick</div>
          <h1 className="map-hero__title">RV X</h1>
          <p className="screen__sub">
            One rig, six people, the whole thing streamed. Scroll to zoom, drag to pan,
            hover a stop — or the route itself — for its VODs.
          </p>
          <button type="button" className="map-cam-cta" onClick={onOpenCam}>
            <span className="map-cam-cta__dot" aria-hidden="true" />
            Watch the 24/7 RV cam
            <span aria-hidden="true"> →</span>
          </button>
        </Reveal>
        <Reveal delay={0.12}>
          <dl className="map-stats">
            <div><dt>Days out</dt><dd>62</dd></div>
            <div><dt>Miles</dt><dd>1,460</dd></div>
            <div><dt>Stops</dt><dd>{D.CITIES.length}</dd></div>
            <div><dt>VODs</dt><dd>{D.VODS.length}</dd></div>
          </dl>
        </Reveal>
      </header>
      <Reveal delay={0.08}>
        <CastStrip onExpand={onExpand} />
      </Reveal>
      <Reveal delay={0.06}>
        <MultiKickBar />
      </Reveal>
      <RouteMap onOpenTimeline={onOpenTimeline} />
      <div className="legs">
        {D.CITIES.map((c) => (
          <button key={c.id} type="button"
            className={`leg${c.status === 'current' ? ' leg--now' : ''}`}
            onClick={() => onOpenCity(c.id)}
            aria-label={`Stop ${c.stop}: ${c.name}, ${c.region} — open calendar, VODs and clips`}>
            <span className="leg__stop">{String(c.stop).padStart(2, '0')}</span>
            <span className="leg__city">{c.name}, {c.region}</span>
            <span className="leg__dates">{c.start} → {c.end || 'now'}</span>
            <span className="leg__go" aria-hidden="true">›</span>
          </button>
        ))}
      </div>
    </section>
  );
}

/* ---------- modals ---------- */

function Modal({ onClose, children, label, wide, className }) {
  React.useEffect(() => {
    const fn = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [onClose]);
  return (
    <motion.div className="modal-veil" onClick={onClose} role="dialog" aria-label={label}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.12, ease: 'easeOut' }}>
      <motion.div className={`modal${wide ? ' modal--wide' : ''}${className ? ` ${className}` : ''}`} onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}>
        <button type="button" className="modal__close" aria-label="Close" onClick={onClose}>✕</button>
        {children}
      </motion.div>
    </motion.div>
  );
}

function LoginModal({ onClose, onDone }) {
  const [busy, setBusy] = React.useState(false);
  const go = () => { setBusy(true); setTimeout(() => { onDone({ name: 'roadwatcher' }); }, 900); };
  return (
    <Modal onClose={onClose} label="Login with Kick">
      <div className="login">
        <img src={emblemUrl} alt="" className="login__emblem" />
        <h3 className="login__title">Ride along</h3>
        <p className="login__sub">
          Sign in with your Kick account to chat, vote on detours and get stop alerts.
          You&rsquo;ll be sent to kick.com to authorize — we never see your password.
        </p>
        {busy
          ? <div className="login__busy rvx-meta">Connecting to kick.com…</div>
          : <KickButton size="lg" onClick={go}>Continue with Kick</KickButton>}
        <p className="login__fine rvx-meta">OAuth via id.kick.com · revoke anytime in Kick settings</p>
      </div>
    </Modal>
  );
}

function PhotoLightbox({ item, onClose }) {
  const isCast = !!item.role;
  const initials = (item.name || '').split(/\s+/).map((w) => w[0]).slice(0, 2).join('');
  return (
    <Modal onClose={onClose} label={isCast ? item.name : item.label} wide>
      <div className="lightbox">
        <div className={`lightbox__photo${isCast ? ' lightbox__photo--cast' : ''}`}
          style={item.hue ? { '--h': item.hue } : null}>
          {isCast && item.photo
            ? <img src={item.photo} alt={item.name} className="lightbox__img" />
            : isCast
              ? <span className="lightbox__initials">{initials}</span>
              : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="lightbox__ph">
                  <rect x="3" y="5" width="18" height="14" rx="2" /><circle cx="9" cy="10" r="1.6" />
                  <path d="m5 17 5-5 4 4 2.5-2.5L21 17" />
                </svg>
              )}
        </div>
        <div className="lightbox__cap">
          <strong>{isCast ? item.name : item.label}</strong>
          <span className="rvx-meta">{isCast ? item.role : item.city}</span>
        </div>
      </div>
    </Modal>
  );
}

/* In-site player. Real Kick VODs and clips play their HLS streams via hls.js
   (lazy-loaded; Safari plays them natively); mock VODs fall back to the
   sample MP4. If a stream's CDN refuses, the framed placeholder +
   "Open on Kick" link takes over. */
function MediaPlayer({ media, onClose }) {
  const isVod = media.kind === 'vod' || media.duration?.length > 5; // VODs are h:mm:ss
  const isYouTube = media.source === 'youtube';
  const src = media.playbackUrl || (isVod && !isYouTube ? SAMPLE_MP4 : null);
  const videoRef = React.useRef(null);
  const [streamFailed, setStreamFailed] = React.useState(false);
  const [buffering, setBuffering] = React.useState(true);
  const canPlay = !!src && !isYouTube && !streamFailed;

  React.useEffect(() => {
    if (!canPlay) return;
    const v = videoRef.current;
    if (!v) return;
    let hls;
    let cancelled = false;
    if (src.includes('.m3u8')) {
      if (v.canPlayType('application/vnd.apple.mpegurl')) {
        v.src = src;
        v.play?.().catch(() => {});
      } else {
        import('hls.js').then(({ default: Hls }) => {
          if (cancelled) return;
          if (!Hls.isSupported()) { setStreamFailed(true); return; }
          hls = new Hls();
          hls.loadSource(src);
          hls.attachMedia(v);
          hls.on(Hls.Events.ERROR, (_, data) => {
            if (data.fatal) { setStreamFailed(true); hls.destroy(); }
          });
          v.play?.().catch(() => {});
        });
      }
    } else {
      v.src = src;
      v.play?.().catch(() => {});
    }
    return () => { cancelled = true; if (hls) hls.destroy(); };
  }, [src, canPlay]);

  const srcLabel = media.kind === 'vod'
    ? (media.source === 'kick' ? 'Kick VOD' : 'YouTube archive')
    : 'Kick clip';

  return (
    <Modal onClose={onClose} label={`Playing: ${media.title}`} wide>
      <div className="player">
        <div className="player__frame" style={{ '--h': media.thumbHue }}>
          {canPlay ? (
            <>
              <video ref={videoRef} className="player__video" controls playsInline
                poster={media.thumbnail || ''}
                onWaiting={() => setBuffering(true)}
                onPlaying={() => setBuffering(false)}
                onCanPlay={() => setBuffering(false)}>
                Your browser can’t play this VOD.
              </video>
              {buffering && <span className="player__buffer" aria-hidden="true" />}
            </>
          ) : isYouTube ? (
            <div className="player__placeholder">
              <span className="player__play" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 4v16l13-8z" /></svg>
              </span>
              <span className="player__note rvx-meta">YouTube archive embed · channel link pending</span>
            </div>
          ) : (
            <div className="player__placeholder">
              <span className="player__play" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 4v16l13-8z" /></svg>
              </span>
              <span className="player__note rvx-meta">
                {streamFailed ? 'Stream blocked here — watch it on Kick' : `Kick clip embed · ${media.id}`}
              </span>
            </div>
          )}
        </div>
        <div className="player__row">
          <div>
            <h3 className="player__title">{media.title}</h3>
            <div className="rvx-meta">{media.channel} · {media.date}{media.time ? ` · ${media.time} CT` : ''} · {D.fmtViews(media.views)} views</div>
          </div>
          <div className="player__actions">
            <Badge variant={media.source === 'youtube' ? 'neutral' : 'kick'} size="sm">{srcLabel}</Badge>
            <Button variant="outline" size="sm" href={media.url} target="_blank" rel="noopener noreferrer">
              {media.source === 'youtube' ? 'Open archive' : 'Open on Kick'}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

function Footer({ onNav }) {
  return (
    <footer className="ftr" data-screen-label="Footer">
      <div className="ftr__inner">
        <div className="ftr__socials">
          <span className="ftr__socials-label rvx-eyebrow">Follow the ride</span>
          <SocialRow size="lg" links={[
            { platform: 'kick', href: D.LINKS.kick },
            { platform: 'youtube', href: D.LINKS.youtube },
            { platform: 'discord', href: D.LINKS.discord },
            { platform: 'x', href: D.LINKS.x },
            { platform: 'instagram', href: D.LINKS.instagram },
          ]} />
        </div>
        <div className="ftr__row">
          <span className="ftr__copy">© 2026 ChickenAndy</span>
          <button type="button" className="ftr__link" onClick={() => onNav('About')}>About the streamer</button>
          <a className="ftr__link" href={D.LINKS.youtube} target="_blank" rel="noopener noreferrer">VOD archive</a>
        </div>
      </div>
    </footer>
  );
}

/* ---------- app ---------- */

export default function App() {
  const liveEvent = D.EVENTS.find((e) => e.status === 'live');
  const [route, setRoute] = React.useState({ page: 'home', eventId: null, tab: 'Map' });
  const [user, setUser] = React.useState(null);
  const [login, setLogin] = React.useState(false);
  const [photo, setPhoto] = React.useState(null);
  const [media, setMedia] = React.useState(null);
  const [tlCity, setTlCity] = React.useState(null);
  const [cityMenu, setCityMenu] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  // Hydrate live Kick data (clips, VODs, avatars, socials, live status);
  // the full clip history keeps paging in afterwards, growing the rolls.
  const [, force] = React.useReducer((x) => x + 1, 0);
  React.useEffect(() => { hydrateKick(() => force()).then(() => { setLoading(false); force(); }); }, []);

  const go = (routeNext) => { setTlCity(null); setRoute(routeNext); window.scrollTo(0, 0); };
  const onNav = (v) => go({ page: v.toLowerCase(), eventId: null, tab: 'Map' });
  const openEvent = (id) => go({ page: 'event', eventId: id, tab: 'Map' });
  const setTab = (tab) => { setTlCity(null); setRoute((r) => ({ ...r, tab })); };
  const goLive = () => openEvent(liveEvent ? liveEvent.id : 'rvx');
  const openTimeline = (cityId) => {
    setTlCity(cityId);
    setRoute((r) => ({ ...r, page: 'event', eventId: r.eventId || 'rvx', tab: 'Timeline' }));
    window.scrollTo(0, 0);
  };

  const ev = route.page === 'event' ? D.EVENTS.find((e) => e.id === route.eventId) : null;
  const isLiveHub = ev && ev.status === 'live';

  const hubContent = ev && (isLiveHub ? (
    <>
      {route.tab === 'Map' && <MapScreen event={ev} onExpand={setPhoto} onOpenTimeline={openTimeline} onOpenCity={setCityMenu} onOpenCam={() => setTab('Live Cam')} />}
      {route.tab === 'Live Cam' && <LiveCam />}
      {route.tab === 'VODs' && <Vods onPlay={setMedia} loading={loading} scope="event" />}
      {route.tab === 'Clips' && <Clips onPlay={setMedia} loading={loading} scope="event" />}
      {route.tab === 'Timeline' && <Timeline initialCity={tlCity} onPlay={setMedia} />}
      {route.tab === 'Gallery' && <Gallery onLightbox={setPhoto} />}
      {route.tab === 'Crew' && <Crew onExpand={setPhoto} />}
    </>
  ) : (
    <ArchivePanel ev={ev} tab={route.tab} onExpand={setPhoto} />
  ));

  return (
    <MotionConfig reducedMotion="user">
      <div className="site">
        <Header page={route.page} onNav={onNav} user={user}
          onLogin={() => setLogin(true)} onLogout={() => setUser(null)}
          liveEvent={liveEvent} goLive={goLive} />
        <main className="main">
          {route.page === 'home' && (
            <Home onOpenEvent={openEvent} onPlay={setMedia} goLive={goLive}
              onAbout={() => onNav('About')} loading={loading} />
          )}
          {route.page === 'vods' && <Vods onPlay={setMedia} loading={loading} />}
          {route.page === 'clips' && <Clips onPlay={setMedia} loading={loading} />}
          {route.page === 'events' && <EventsIndex onOpenEvent={openEvent} />}
          {route.page === 'about' && <About />}
          {route.page === 'event' && (
            <EventHub eventId={route.eventId} tab={route.tab} setTab={setTab}>
              {hubContent}
            </EventHub>
          )}
        </main>
        <Footer onNav={onNav} />
        <AnimatePresence>
          {login && <LoginModal key="login" onClose={() => setLogin(false)}
            onDone={(u) => { setUser(u); setLogin(false); }} />}
          {photo && <PhotoLightbox key="photo" item={photo} onClose={() => setPhoto(null)} />}
          {cityMenu && (
            <Modal key="city" onClose={() => setCityMenu(null)} className="modal--menu"
              label={`Stop details — ${D.CITIES.find((c) => c.id === cityMenu)?.name || ''}`}>
              <CityMenu cityId={cityMenu} onPlay={setMedia}
                onOpenTimeline={(id) => { setCityMenu(null); openTimeline(id); }} />
            </Modal>
          )}
          {media && <MediaPlayer key="media" media={media} onClose={() => setMedia(null)} />}
        </AnimatePresence>
      </div>
    </MotionConfig>
  );
}
