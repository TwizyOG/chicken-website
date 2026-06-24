import React from 'react';

const CSS = `
.rvx-iconbtn{display:inline-flex;align-items:center;justify-content:center;flex:none;
  border:var(--bw-1) solid transparent;border-radius:var(--radius-sm);cursor:pointer;
  color:var(--text-mid);background:transparent;
  transition:background var(--dur-fast) ease,color var(--dur-fast) ease,
    border-color var(--dur-fast) ease,transform var(--dur-fast) var(--ease-out)}
.rvx-iconbtn:active{transform:translateY(1px)}
.rvx-iconbtn:focus-visible{outline:2px solid var(--focus-ring);outline-offset:2px}
.rvx-iconbtn[aria-disabled=true]{opacity:.45;pointer-events:none}
.rvx-iconbtn--sm{width:34px;height:34px}
.rvx-iconbtn--md{width:42px;height:42px}
.rvx-iconbtn--lg{width:52px;height:52px}
.rvx-iconbtn svg,.rvx-iconbtn img{width:50%;height:50%;display:block}
.rvx-iconbtn--ghost:hover{background:var(--surface-3);color:var(--text-hi)}
.rvx-iconbtn--solid{background:var(--surface-3);color:var(--text-hi);border-color:var(--border-default)}
.rvx-iconbtn--solid:hover{background:var(--asphalt-700);border-color:var(--border-strong)}
.rvx-iconbtn--accent{background:var(--accent);color:var(--text-onaccent)}
.rvx-iconbtn--accent:hover{background:var(--accent-hover)}
`;

function ensureStyles() {
  if (typeof document === 'undefined') return;
  if (document.getElementById('rvx-iconbtn-css')) return;
  const el = document.createElement('style');
  el.id = 'rvx-iconbtn-css';
  el.textContent = CSS;
  document.head.appendChild(el);
}

/**
 * IconButton — square, icon-only control for toolbars, players and close/nav actions.
 */
export function IconButton({
  icon,
  label,
  variant = 'ghost',
  size = 'md',
  disabled = false,
  href,
  className = '',
  ...rest
}) {
  ensureStyles();
  const cls = ['rvx-iconbtn', `rvx-iconbtn--${variant}`, `rvx-iconbtn--${size}`, className]
    .filter(Boolean).join(' ');
  const Tag = href ? 'a' : 'button';
  const tagProps = href ? { href } : { type: 'button' };
  return (
    <Tag
      className={cls}
      aria-label={label}
      aria-disabled={disabled ? 'true' : undefined}
      {...tagProps}
      {...rest}
    >
      {icon}
    </Tag>
  );
}
