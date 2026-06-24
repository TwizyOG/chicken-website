/* Gallery — photos from the road, grouped by stop. Tiles open a lightbox.
   (In production these are uploaded photos; here they are placeholder frames.) */
import React from 'react';
import D from '../data.js';
import { Tag } from '../ds/index.js';

export function Gallery({ onLightbox }) {
  const [cityFilter, setCityFilter] = React.useState(null);

  // Deterministic placeholder set per city: varying warm tones + aspect spans.
  const TILES = [];
  D.CITIES.forEach((c, ci) => {
    const n = c.id === 'orlando' ? 4 : 6;
    for (let i = 0; i < n; i++) {
      TILES.push({
        id: `${c.id}_${i}`, cityId: c.id, city: `${c.name}, ${c.region}`,
        hue: 40 + ci * 14 + i * 6,
        big: (i + ci) % 5 === 0,
        label: `${c.name} ${String(i + 1).padStart(2, '0')}`,
      });
    }
  });
  const tiles = cityFilter ? TILES.filter((t) => t.cityId === cityFilter) : TILES;

  return (
    <section className="screen" data-screen-label="Gallery">
      <header className="screen__head">
        <div>
          <div className="rvx-eyebrow">Photos from the road</div>
          <h2 className="screen__title">Gallery</h2>
        </div>
        <p className="screen__sub">
          Shots from every stop — crew uploads land here. Click any photo to view it full size.
        </p>
      </header>

      <div className="tl-filters__row" style={{ marginBottom: 'var(--space-5)' }}>
        <Tag size="sm" active={!cityFilter} onClick={() => setCityFilter(null)}>All stops</Tag>
        {D.CITIES.map((c) => (
          <Tag key={c.id} size="sm" active={cityFilter === c.id}
            onClick={() => setCityFilter(cityFilter === c.id ? null : c.id)}>
            {c.name}
          </Tag>
        ))}
      </div>

      <div className="gal-grid">
        {tiles.map((t) => (
          <button key={t.id} type="button"
            className={`gal-tile${t.big ? ' gal-tile--big' : ''}`}
            style={{ '--h': t.hue }}
            onClick={() => onLightbox && onLightbox(t)}>
            <span className="gal-tile__ph" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <circle cx="9" cy="10" r="1.6" />
                <path d="m5 17 5-5 4 4 2.5-2.5L21 17" />
              </svg>
            </span>
            <span className="gal-tile__cap">{t.label}</span>
          </button>
        ))}
      </div>
      <p className="gal-note rvx-meta">Placeholder frames — drop in real photos per stop when wiring up uploads.</p>
    </section>
  );
}
