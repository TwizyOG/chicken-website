/* Crew — the cast of the RV. Profile cards with expandable photos + socials
   (socials hydrate live from each member's Kick profile). */
import React from 'react';
import D from '../data.js';
import { CastCard } from '../ds/index.js';

export function Crew({ onExpand }) {
  const active = D.CAST.filter((m) => !m.departed);
  const departed = D.CAST.filter((m) => m.departed);
  return (
    <section className="screen" data-screen-label="Crew">
      <header className="screen__head">
        <div>
          <div className="rvx-eyebrow">The cast of the RV</div>
          <h2 className="screen__title">Crew</h2>
        </div>
        <p className="screen__sub">
          Six on the rig right now. Tap a photo to expand it; every link is live.
        </p>
      </header>
      <div className="crew-grid">
        {active.map((m) => (
          <div key={m.id} className="crew-cell">
            <CastCard name={m.name} role={m.role} live={m.live} photo={m.photo}
              socials={m.socials} onExpand={() => onExpand && onExpand(m)} />
            <p className="crew-bio">{m.bio}</p>
          </div>
        ))}
      </div>
      {departed.length > 0 && (
        <>
          <div className="crew-past-label">Past crew</div>
          <div className="crew-grid">
            {departed.map((m) => (
              <div key={m.id} className="crew-cell">
                <CastCard name={m.name} role={m.role} live={false} photo={m.photo}
                  socials={m.socials} departed onExpand={() => onExpand && onExpand(m)} />
                <p className="crew-bio">{m.bio}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}

