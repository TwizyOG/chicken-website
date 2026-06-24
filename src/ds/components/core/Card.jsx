import React from 'react';

const CSS = `
.rvx-card{background:var(--surface-1);border:var(--bw-1) solid var(--border-subtle);
  border-radius:var(--radius-card);color:var(--text-mid);position:relative;
  transition:transform var(--dur-base) var(--ease-out),border-color var(--dur-base) ease,
    box-shadow var(--dur-base) ease}
.rvx-card--raised{background:var(--surface-2);box-shadow:var(--shadow-md)}
.rvx-card--inset{background:var(--surface-sunken);border-color:var(--border-subtle)}
.rvx-card--pad-sm{padding:var(--space-3)}
.rvx-card--pad-md{padding:var(--space-5)}
.rvx-card--pad-lg{padding:var(--space-8)}
.rvx-card--pad-none{padding:0}
.rvx-card--interactive{cursor:pointer}
.rvx-card--interactive:hover{transform:translateY(-3px);border-color:var(--border-strong);
  box-shadow:var(--shadow-lg)}
.rvx-card--interactive:focus-visible{outline:2px solid var(--focus-ring);outline-offset:2px}
.rvx-card--interactive:active{transform:translateY(-1px)}
`;

function ensureStyles() {
  if (typeof document === 'undefined') return;
  if (document.getElementById('rvx-card-css')) return;
  const el = document.createElement('style');
  el.id = 'rvx-card-css';
  el.textContent = CSS;
  document.head.appendChild(el);
}

/**
 * Card — the base surface for everything boxed: VODs, days, crew, panels.
 */
export function Card({
  children,
  variant = 'flat',
  padding = 'md',
  interactive = false,
  href,
  className = '',
  ...rest
}) {
  ensureStyles();
  const cls = [
    'rvx-card',
    variant !== 'flat' ? `rvx-card--${variant}` : '',
    `rvx-card--pad-${padding}`,
    interactive ? 'rvx-card--interactive' : '',
    className,
  ].filter(Boolean).join(' ');

  if (href) {
    return <a className={cls} href={href} {...rest}>{children}</a>;
  }
  const Tag = interactive ? 'button' : 'div';
  const extra = interactive ? { type: 'button' } : {};
  return <Tag className={cls} {...extra} {...rest}>{children}</Tag>;
}
