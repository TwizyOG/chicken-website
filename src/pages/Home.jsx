/* Home — the main ChickenAndy page. The live trip leads: a full-width
   cinematic "RV X IS ON THE ROAD" billboard (real stream art) opens the page,
   the CHICKENANDY brand block + Kick/Donate CTAs follow, then the animated
   roadtrip band. Below it every section rides on its own full-bleed roadside
   backdrop (dusk wires, night sky, route doodle, campfire, billboards) so the
   scroll keeps the highway feeling instead of flat black. */
import React from 'react';
import D from '../data.js';
import { Badge, Button, KickButton } from '../ds/index.js';
import { VodGridCard } from './Vods.jsx';
import { ClipTile } from './Clips.jsx';
import { TiltCard, Reveal } from '../motion.jsx';
import { Slider, SkeletonTile } from '../ui.jsx';
import { RoadTrip, ScrollRV } from '../RoadTrip.jsx';
import { ContactCard, SponsorsSection } from './About.jsx';
import { KickSubscribe } from './Subscribe.jsx';

/* ChickenAndy's offline banner from Kick — fallback art for the billboard
   until a real stream thumbnail has hydrated. */
const OFFLINE_BANNER = 'https://files.kick.com/images/channel/411439/offline_banner/conversion/ad3566d8-9942-47b8-aeea-b438bc18aa32-fullsize.jpg';

/* ---------- full-bleed scene band (backdrop + content) ---------- */
function Band({ variant, art, label, children }) {
  return (
    <section className={`band band--${variant}`} data-screen-label={label}>
      {art && <div className="band__art" aria-hidden="true">{art}</div>}
      <Reveal className="band__in">{children}</Reveal>
    </section>
  );
}

/* ---------- backdrop art (silhouette SVGs in the brand palette) ---------- */

/* dusk roadside: telephone poles, sagging wires, birds */
const VodsArt = (
  <svg viewBox="0 0 1440 240" preserveAspectRatio="xMidYMax slice">
    <g fill="#241C12">
      {[90, 410, 730, 1050, 1370].map((x) => (
        <g key={x}>
          <rect x={x} y="64" width="6" height="176" rx="2" />
          <rect x={x - 34} y="74" width="74" height="5" rx="2" />
          <rect x={x - 22} y="92" width="50" height="4" rx="2" />
        </g>
      ))}
    </g>
    <path d="M96 80 Q 250 130 416 80 Q 570 130 736 80 Q 890 130 1056 80 Q 1210 130 1376 80"
      fill="none" stroke="#241C12" strokeWidth="2.4" />
    <path d="M96 98 Q 250 142 416 98 Q 570 142 736 98 Q 890 142 1056 98 Q 1210 142 1376 98"
      fill="none" stroke="#241C12" strokeWidth="2" />
    <g fill="#1E1812">
      <path d="M330 96 q4 -7 8 0 l-3 -2 z" /><path d="M352 95 q4 -7 8 0 l-3 -2 z" />
      <path d="M905 114 q4 -7 8 0 l-3 -2 z" />
    </g>
    <rect x="0" y="236" width="1440" height="4" fill="#1E1812" />
  </svg>
);

/* night sky: stars, moon, a shooting star, low skyline */
const ClipsArt = (
  <svg viewBox="0 0 1440 240" preserveAspectRatio="xMidYMax slice">
    <g fill="#F6E7C8">
      {[[60, 40, 1.4], [180, 90, 1], [300, 30, 1.2], [430, 70, 1], [560, 24, 1.5], [690, 88, 1],
        [820, 44, 1.2], [950, 18, 1], [1080, 64, 1.4], [1210, 36, 1], [1330, 80, 1.2], [1410, 26, 1]]
        .map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} opacity={0.14 + (i % 3) * 0.08} />)}
    </g>
    <path d="M1150 30 a26 26 0 1 0 18 44 a22 22 0 1 1 -18 -44" fill="#F6E7C8" opacity="0.12" />
    <path d="M260 26 l110 54" stroke="#F2A65A" strokeWidth="2" opacity="0.3" strokeLinecap="round" />
    <circle cx="260" cy="26" r="2.2" fill="#F2A65A" opacity="0.5" />
    <g fill="#1E1812">
      <path d="M0 240 v-36 h46 v-18 h30 v54 Z" />
      <path d="M120 240 v-26 h38 v26 Z" />
      <path d="M620 240 v-30 h26 v-14 h22 v44 Z" />
      <path d="M1240 240 v-40 h34 v40 Z" />
      <path d="M1330 240 v-24 h44 v24 Z" />
    </g>
  </svg>
);

/* route doodle: dashed highway line, location pins, topo contours */
const TripsArt = (
  <svg viewBox="0 0 1440 240" preserveAspectRatio="xMidYMax slice">
    <g fill="none" stroke="#241C12" strokeWidth="1.6">
      <ellipse cx="180" cy="200" rx="130" ry="44" />
      <ellipse cx="180" cy="200" rx="86" ry="26" />
      <ellipse cx="1280" cy="190" rx="150" ry="50" />
      <ellipse cx="1280" cy="190" rx="100" ry="30" />
    </g>
    <path d="M-20 190 C 220 110 420 220 660 150 S 1120 80 1460 150"
      fill="none" stroke="#E8853A" strokeWidth="3" strokeDasharray="14 16" opacity="0.22" strokeLinecap="round" />
    <g opacity="0.3" fill="#E8853A">
      {[[300, 152], [720, 142], [1180, 108]].map(([x, y], i) => (
        <g key={i}>
          <path d={`M${x} ${y} c -9 -13 -9 -24 0 -30 c 9 6 9 17 0 30`} />
          <circle cx={x} cy={y - 22} r="3.4" fill="#16130F" />
        </g>
      ))}
    </g>
  </svg>
);

/* campfire night: tent, cactus, fire glow, embers */
const AboutArt = (
  <svg viewBox="0 0 1440 240" preserveAspectRatio="xMidYMax slice">
    <g fill="#241C12">
      <path d="M120 238 l64 -86 64 86 Z" />
      <path d="M168 238 l16 -22 16 22 Z" fill="#16130F" />
      <path d="M1300 238 v-54 a8 8 0 0 1 16 0 v54 Z" />
      <path d="M1288 206 a6 6 0 0 1 12 0 v10 h-5 v8 h9 M1330 196 a6 6 0 0 0 -12 0 v8 h5 v8 h-9"
        stroke="#241C12" strokeWidth="8" fill="none" />
    </g>
    <g transform="translate(330 196)">
      <path d="M-22 42 l44 -10 M-22 32 l44 10" stroke="#241C12" strokeWidth="7" strokeLinecap="round" />
      <path d="M0 30 c -12 -8 -8 -24 0 -32 c 2 10 12 10 10 22 c 6 -4 6 -10 5 -14 c 8 10 4 20 -4 26 Z"
        fill="#E8853A" opacity="0.5" />
    </g>
    <g fill="#F2A65A">
      <circle cx="352" cy="150" r="1.6" opacity="0.4" /><circle cx="338" cy="128" r="1.2" opacity="0.3" />
      <circle cx="366" cy="112" r="1.4" opacity="0.25" /><circle cx="384" cy="140" r="1.1" opacity="0.3" />
    </g>
  </svg>
);

/* Kick-green sub motif: floating chat badges + emote bubbles */
const SubArt = (
  <svg viewBox="0 0 1440 240" preserveAspectRatio="xMidYMax slice">
    <g fill="#53FC18" opacity="0.07">
      {[[120, 150, 26], [340, 90, 18], [560, 170, 22], [780, 110, 30], [1010, 160, 20], [1230, 96, 26], [1380, 180, 16]]
        .map(([x, y, r], i) => (
          <g key={i}>
            <rect x={x - r} y={y - r} width={r * 2} height={r * 2} rx={r * 0.5} />
            <path d={`M${x - r * 0.4} ${y + r} l ${r * 0.4} ${r * 0.5} l ${r * 0.4} ${-r * 0.5} Z`} />
          </g>
        ))}
    </g>
    <g fill="none" stroke="#53FC18" strokeWidth="2" opacity="0.12" strokeLinecap="round">
      {[[230, 130], [650, 190], [900, 140], [1140, 200]].map(([x, y], i) => (
        <path key={i} d={`M${x} ${y} q -10 -14 4 -20 q 14 -6 18 6 q 4 12 -10 18 Z`} />
      ))}
    </g>
  </svg>
);

/* billboard row under soft uplights */
const SponsorsArt = (
  <svg viewBox="0 0 1440 240" preserveAspectRatio="xMidYMax slice">
    {[[80, 0.9], [620, 1], [1160, 0.85]].map(([x, s], i) => (
      <g key={i} transform={`translate(${x}) scale(${s})`}>
        <polygon points="30,236 130,236 110,150 50,150" fill="#F2A65A" opacity="0.05" />
        <rect x="40" y="176" width="9" height="60" fill="#1E1812" />
        <rect x="112" y="176" width="9" height="60" fill="#1E1812" />
        <rect x="10" y="120" width="140" height="58" rx="3" fill="#221A12" />
        <rect x="16" y="126" width="128" height="46" fill="#16130F" />
        <text x="80" y="156" textAnchor="middle" fontFamily="Anton, sans-serif" fontSize="20"
          fill="#E8853A" opacity="0.5">RV ✕</text>
      </g>
    ))}
  </svg>
);

export function Home({ onOpenEvent, onPlay, goLive, onAbout, loading }) {
  const live = D.EVENTS.find((e) => e.status === 'live');
  const recent = D.VODS.filter((v) => v.channel === 'chickenandy').sort((a, b) => b.day - a.day).slice(0, 16);
  const topClips = D.CLIPS.filter((c) => c.channel === 'chickenandy').sort((a, b) => b.views - a.views).slice(0, 16);
  const liveArt = recent.find((v) => v.thumbnail)?.thumbnail || OFFLINE_BANNER;
  const eventsOrdered = [...D.EVENTS].reverse(); // RV X first, then RV 8, RV 7

  return (
    <section className="screen home" data-screen-label="Home">
      <ScrollRV />

      <div className="home-hero">
        {/* ---- the main event: RV X live billboard ---- */}
        {live && (
          <Reveal className="hero-bill__wrap">
            <button type="button" className="hero-bill" onClick={goLive} data-screen-label="RV X live billboard">
              <span className="hero-bill__bg" aria-hidden="true">
                <img src={liveArt} alt="" />
                <span className="hero-bill__shade" />
              </span>
              <TiltCard max={2.5} className="hero-bill__in">
                <span className="hero-bill__top">
                  <Badge variant="live">Live now</Badge>
                  <span className="hero-bill__meta rvx-meta">{live.name} · {live.year} · streamed 24/7</span>
                </span>
                <span className="hero-bill__title">
                  <span className="hero-bill__name">{live.name}</span>
                  <span className="hero-bill__rest">is on the road</span>
                </span>
                <span className="hero-bill__sub">{live.premise}</span>
                <span className="hero-bill__cta">Open the live map →</span>
              </TiltCard>
            </button>
          </Reveal>
        )}

        {/* ---- brand block ---- */}
        <Reveal delay={0.12} className="home-brand">
          <div className="home-brand__copy">
            <div className="rvx-eyebrow">IRL streamer · live on Kick</div>
            <h1 className="home-hero__title">CHICKENANDY</h1>
            <p className="home-hero__sub">
              One guy, one beat-up RV, the whole country. Every trip streamed 24/7 and
              archived forever. Between runs this is home base — catch up on VODs, dig
              through clips, and gear up for the next route.
            </p>
          </div>
          <div className="home-hero__actions">
            <Button variant="primary" size="lg" className="home-cta" href={D.LINKS.kick} target="_blank" rel="noopener noreferrer">Watch on Kick</Button>
            <KickButton size="lg" className="home-cta home-cta--sub" href={D.LINKS.subscribe} target="_blank" rel="noopener noreferrer">
              Subscribe
            </KickButton>
            <Button variant="donate" size="lg" className="home-cta home-cta--donate" href={D.LINKS.powerchat} target="_blank" rel="noopener noreferrer">
              Donate
            </Button>
          </div>
        </Reveal>

        <RoadTrip />
      </div>

      <Band variant="vods" art={VodsArt} label="Latest VODs band">
        <div className="roll__head">
          <span className="roll__title">Latest VODs</span>
          <a className="roll__link" href={D.LINKS.videos} target="_blank" rel="noopener noreferrer">kick.com/chickenandy/videos →</a>
        </div>
        <Slider resetKey="home-vods">
          {loading
            ? [...Array(6)].map((_, i) => <SkeletonTile key={i} />)
            : recent.map((v) => <VodGridCard key={v.id} v={v} onPlay={onPlay} />)}
        </Slider>
      </Band>

      <Band variant="clips" art={ClipsArt} label="Top clips band">
        <div className="roll__head">
          <span className="roll__title">Top clips</span>
          <a className="roll__link" href={D.LINKS.clips} target="_blank" rel="noopener noreferrer">kick.com/chickenandy/clips →</a>
        </div>
        <Slider resetKey="home-clips">
          {loading
            ? [...Array(6)].map((_, i) => <SkeletonTile key={i} />)
            : topClips.map((c) => <ClipTile key={c.id} c={c} onPlay={onPlay} />)}
        </Slider>
      </Band>

      <Band variant="sub" art={SubArt} label="Subscribe band">
        <KickSubscribe />
      </Band>

      <Band variant="trips" art={TripsArt} label="The trips band">
        <div className="roll__head"><span className="roll__title">The trips</span></div>
        <div className="ev-cards">
          {eventsOrdered.map((ev) => (
            <button key={ev.id} type="button" className={`ev-card${ev.status === 'live' ? ' ev-card--live' : ''}`}
              onClick={() => onOpenEvent(ev.id)}>
              <TiltCard max={4} className="ev-card__in">
                <span className="ev-card__top">
                  <span className="ev-card__name">{ev.name}</span>
                  {ev.status === 'live'
                    ? <Badge variant="live" size="sm">Live</Badge>
                    : <span className="ev-card__yr">{ev.year}</span>}
                </span>
                <span className="ev-card__premise">{ev.premise}</span>
                <span className="ev-card__route">{ev.route.join('  ·  ')}</span>
                <span className="ev-card__stats rvx-meta">
                  {ev.status === 'live' ? 'In progress' : `${ev.vodCount} VODs · ${ev.clipCount} clips`}
                </span>
              </TiltCard>
            </button>
          ))}
        </div>
      </Band>

      <Band variant="about" art={AboutArt} label="About band">
        <div className="roll__head">
          <span className="roll__title">About ChickenAndy</span>
          <button type="button" className="roll__link roll__link--btn" onClick={onAbout}>Full about →</button>
        </div>
        <div className="about-grid">
          <div className="about-main">
            <p className="about-lead">{D.ABOUT.bio}</p>
          </div>
          <ContactCard />
        </div>
      </Band>

      <Band variant="sponsors" art={SponsorsArt} label="Sponsors band">
        <SponsorsSection />
      </Band>
    </section>
  );
}
