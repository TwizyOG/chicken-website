import React from 'react';

const CSS = `
.rvx-badge{display:inline-flex;align-items:center;gap:6px;font-family:var(--font-heading);
  font-weight:var(--fw-bold);text-transform:uppercase;letter-spacing:.07em;line-height:1;
  border-radius:var(--radius-xs);border:var(--bw-1) solid transparent;white-space:nowrap}
.rvx-badge--sm{font-size:10px;padding:3px 6px}
.rvx-badge--md{font-size:12px;padding:5px 8px}
.rvx-badge--live{background:var(--live);color:var(--text-onlive);box-shadow:var(--glow-live)}
.rvx-badge--replay{background:var(--surface-3);color:var(--text-mid);border-color:var(--border-default)}
.rvx-badge--soon{background:transparent;color:var(--accent-text);border-color:var(--accent)}
.rvx-badge--accent{background:var(--accent-soft);color:var(--accent-text);border-color:var(--accent)}
.rvx-badge--neutral{background:var(--surface-3);color:var(--text-mid);border-color:var(--border-default)}
.rvx-badge--kick{background:var(--kick);color:var(--kick-ink)}
.rvx-badge__dot{width:7px;height:7px;border-radius:50%;background:currentColor;flex:none}
.rvx-badge--live .rvx-badge__dot{background:#fff;animation:rvx-pulse 1.4s ease-in-out infinite}
@keyframes rvx-pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.35;transform:scale(.8)}}
`;

function ensureStyles() {
  if (typeof document === 'undefined') return;
  if (document.getElementById('rvx-badge-css')) return;
  const el = document.createElement('style');
  el.id = 'rvx-badge-css';
  el.textContent = CSS;
  document.head.appendChild(el);
}

/**
 * Badge — small status flag. LIVE pulses; others are quiet signage chips.
 */
export function Badge({
  children,
  variant = 'neutral',
  size = 'md',
  dot = false,
  className = '',
  ...rest
}) {
  ensureStyles();
  const showDot = dot || variant === 'live';
  const cls = ['rvx-badge', `rvx-badge--${variant}`, `rvx-badge--${size}`, className]
    .filter(Boolean).join(' ');
  return (
    <span className={cls} {...rest}>
      {showDot && <span className="rvx-badge__dot" aria-hidden="true" />}
      {children}
    </span>
  );
}
