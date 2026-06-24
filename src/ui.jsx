/* Shared site UI: slider rolls with arrows, DS-styled dropdowns, skeletons. */
import React from 'react';

/* Slider — horizontal media roll with arrow paging. `resetKey` snaps the
   track back to the start whenever sorting/filtering changes (otherwise a
   re-sort leaves you stranded mid-track, which reads as "it just scrolled"). */
export function Slider({ children, resetKey, className = '' }) {
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (ref.current) ref.current.scrollTo({ left: 0 });
  }, [resetKey]);
  const by = (dir) => ref.current?.scrollBy({ left: dir * ref.current.clientWidth * 0.85, behavior: 'smooth' });
  return (
    <div className={`slider ${className}`}>
      <button type="button" className="slider__btn slider__btn--l" aria-label="Scroll left" onClick={() => by(-1)}>‹</button>
      <div className="roll__track slider__track" ref={ref}>{children}</div>
      <button type="button" className="slider__btn slider__btn--r" aria-label="Scroll right" onClick={() => by(1)}>›</button>
    </div>
  );
}

/* Select — native dropdown in design-system clothes (keyboard + mobile safe). */
export function Select({ label, value, onChange, options, className = '' }) {
  return (
    <label className={`rvx-select ${className}`}>
      {label && <span className="rvx-select__label">{label}</span>}
      <span className="rvx-select__box">
        <select value={value} onChange={(e) => onChange(e.target.value)}>
          {options.map(([v, t]) => <option key={v} value={v}>{t}</option>)}
        </select>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </span>
    </label>
  );
}

/* SkeletonTile — shimmer placeholder while live Kick data hydrates. */
export function SkeletonTile() {
  return (
    <div className="sk-tile" aria-hidden="true">
      <span className="sk sk--thumb" />
      <span className="sk sk--line" />
      <span className="sk sk--line sk--short" />
    </div>
  );
}

/* CalCount — color-coded VOD/clip count pill for the calendars (amber = VOD,
   Kick green = clip). Shows the full word where there's room; tight contexts
   (phones, the stop menu) collapse it to V / C via CSS. */
export function CalCount({ kind, n }) {
  return (
    <span className={`cal__c cal__c--${kind}`}>
      {n}
      <span className="cal__c-word">&nbsp;{kind === 'vod' ? 'VOD' : 'CLIP'}{n === 1 ? '' : 'S'}</span>
      <span className="cal__c-abbr">{kind === 'vod' ? 'V' : 'C'}</span>
    </span>
  );
}

