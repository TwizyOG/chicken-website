/* KickSubscribe — main-page "Subscribe on Kick" section.
   Kick's Public API has no subscribe endpoint (subscriptions are a paid action
   that completes in Kick's own checkout), so the CTA deep-links to the channel
   where Kick's native Subscribe button + checkout live. The click is in our UI;
   the subscription itself finishes on Kick.
   The loyalty badges and channel emotes are the REAL ones, hydrated live from
   kick.com into D.SUB (see kick.js) — badges fall back to numbered placeholders
   and the emote rail hides itself if the API is blocked. */
import React from 'react';
import D from '../data.js';
import { KickButton } from '../ds/index.js';
import { Slider } from '../ui.jsx';

const KICK_SRC = 'https://cdn.simpleicons.org/kick';

/* standard Kick subscription perks (badge, emotes, ad-free, direct support) */
const PERKS = [
  { t: 'Sub badge', d: 'A loyalty badge next to your name in chat.' },
  { t: 'Custom emotes', d: 'Unlock ChickenAndy channel emotes everywhere on Kick.' },
  { t: 'Ad-free', d: 'Watch the live trip and VODs without ads.' },
  { t: 'Back the trips', d: 'Subs keep the RV fueled and the stream rolling 24/7.' },
];

const CheckIc = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"
    strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

const moLabel = (m) => (m === 1 ? '1 mo' : `${m} mo`);

export function KickSubscribe() {
  const badges = D.SUB.badges;
  const emotes = D.SUB.emotes;
  const [pickedId, setPickedId] = React.useState(null);
  const picked = emotes.find((e) => e.id === pickedId) || emotes[0] || null;

  return (
    <div className="ksub" data-screen-label="Subscribe on Kick">
      <div className="ksub__grid">
        <div className="ksub__copy">
          <div className="ksub__eyebrow">
            <span className="ksub__ic" style={{ '--src': `url("${KICK_SRC}")` }} aria-hidden="true" />
            Support on Kick
          </div>
          <h2 className="ksub__title">Subscribe to ChickenAndy</h2>
          <p className="ksub__sub">
            A monthly Kick sub is the most direct way to keep the rig on the road —
            you get the perks, the stream gets the fuel. Checkout finishes safely on Kick.
          </p>

          <ul className="ksub__perks">
            {PERKS.map((p) => (
              <li key={p.t} className="ksub__perk">
                <span className="ksub__check"><CheckIc /></span>
                <span>
                  <strong>{p.t}</strong>
                  <span className="ksub__perk-d">{p.d}</span>
                </span>
              </li>
            ))}
          </ul>

          <div className="ksub__actions">
            <KickButton size="lg" href={D.LINKS.subscribe} target="_blank" rel="noopener noreferrer">
              Subscribe on Kick
            </KickButton>
            <KickButton size="lg" variant="outline" href={D.LINKS.subscribe} target="_blank" rel="noopener noreferrer">
              Gift a sub
            </KickButton>
          </div>
          <p className="ksub__fine rvx-meta">
            Opens kick.com/ChickenAndy · subscription &amp; payment handled by Kick
          </p>
        </div>

        {/* real loyalty badges — every milestone unlocks a new one */}
        <div className="ksub__card">
          <span className="ksub__card-glow" aria-hidden="true" />
          <div className="ksub__tier">Loyalty badges</div>
          <div className="ksub__badges">
            {badges.map((b) => (
              <span className="ksub__badge" key={b.months} title={`${moLabel(b.months)} subscriber badge`}>
                <span className="ksub__badge-img">
                  {b.src
                    ? <img src={b.src} alt={`${moLabel(b.months)} sub badge`} loading="lazy" />
                    : <span className="ksub__badge-num">{b.months}</span>}
                </span>
                <span className="ksub__badge-mo"><b>{b.months}</b><span>mo</span></span>
              </span>
            ))}
          </div>
          <div className="ksub__card-label">Every milestone unlocks a new badge by your name.</div>
          <a className="ksub__card-cta" href={D.LINKS.subscribe} target="_blank" rel="noopener noreferrer">
            <span className="ksub__ic ksub__ic--lg" style={{ '--src': `url("${KICK_SRC}")` }} aria-hidden="true" />
            Subscribe now →
          </a>
        </div>
      </div>

      {/* channel emotes — clickable, scroll through everything offered */}
      {emotes.length > 0 && (
        <div className="ksub__emotes" data-screen-label="Channel emotes">
          <div className="ksub__emotes-head">
            <span className="ksub__emotes-title">Channel emotes</span>
            <span className="ksub__emotes-meta rvx-meta">{emotes.length} offered · tap one to preview, use the arrows to browse</span>
          </div>

          <div className="ksub__emotes-body">
            {picked && (
              <div className="ksub__emote-preview">
                <span className="ksub__emote-stage">
                  <img src={picked.src} alt={picked.name} />
                </span>
                <div className="ksub__emote-info">
                  <span className="ksub__emote-name">:{picked.name}:</span>
                  <span className={`ksub__emote-tag ksub__emote-tag--${picked.subOnly ? 'sub' : 'free'}`}>
                    {picked.subOnly ? 'Sub-only' : 'Free to all'}
                  </span>
                </div>
              </div>
            )}

            <Slider className="emote-slider" resetKey={emotes.length}>
              {emotes.map((e) => (
                <button key={e.id} type="button"
                  className={`emote-tile${picked && picked.id === e.id ? ' emote-tile--on' : ''}${e.subOnly ? ' emote-tile--sub' : ''}`}
                  onClick={() => setPickedId(e.id)} title={`:${e.name}:${e.subOnly ? ' (sub-only)' : ''}`}>
                  <img src={e.src} alt={e.name} loading="lazy" />
                </button>
              ))}
            </Slider>
          </div>
        </div>
      )}
    </div>
  );
}
