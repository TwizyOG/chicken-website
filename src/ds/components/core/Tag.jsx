import React from 'react';

const CSS = `
.rvx-tag{display:inline-flex;align-items:center;gap:7px;font-family:var(--font-heading);
  font-weight:var(--fw-semibold);text-transform:uppercase;letter-spacing:.05em;line-height:1;
  border-radius:var(--radius-pill);border:var(--bw-1) solid var(--border-default);
  background:var(--surface-2);color:var(--text-mid);cursor:pointer;white-space:nowrap;
  transition:background var(--dur-fast) ease,border-color var(--dur-fast) ease,color var(--dur-fast) ease;
  -webkit-user-select:none;user-select:none}
.rvx-tag--sm{font-size:12px;padding:6px 12px}
.rvx-tag--md{font-size:13px;padding:8px 15px}
.rvx-tag:hover{border-color:var(--border-strong);color:var(--text-hi)}
.rvx-tag:focus-visible{outline:2px solid var(--focus-ring);outline-offset:2px}
.rvx-tag[aria-pressed=true]{background:var(--accent);border-color:var(--accent);color:var(--text-onaccent)}
.rvx-tag--static{cursor:default}
.rvx-tag--static:hover{border-color:var(--border-default);color:var(--text-mid)}
.rvx-tag__count{font-family:var(--font-mono);font-size:.85em;opacity:.8;letter-spacing:0}
.rvx-tag__ic{display:inline-flex}.rvx-tag__ic svg,.rvx-tag__ic img{width:1.1em;height:1.1em;display:block}
`;

function ensureStyles() {
  if (typeof document === 'undefined') return;
  if (document.getElementById('rvx-tag-css')) return;
  const el = document.createElement('style');
  el.id = 'rvx-tag-css';
  el.textContent = CSS;
  document.head.appendChild(el);
}

/**
 * Tag — pill chip used for clip filters, day-range pagers and location labels.
 * Toggleable when `onClick`/`active` are provided; otherwise a static label.
 */
export function Tag({
  children,
  active = false,
  size = 'md',
  icon,
  count,
  onClick,
  className = '',
  ...rest
}) {
  ensureStyles();
  const interactive = typeof onClick === 'function';
  const cls = ['rvx-tag', `rvx-tag--${size}`, interactive ? '' : 'rvx-tag--static', className]
    .filter(Boolean).join(' ');
  return (
    <button
      type="button"
      className={cls}
      aria-pressed={interactive ? (active ? 'true' : 'false') : undefined}
      onClick={onClick}
      {...rest}
    >
      {icon && <span className="rvx-tag__ic">{icon}</span>}
      {children}
      {count != null && <span className="rvx-tag__count">{count}</span>}
    </button>
  );
}
