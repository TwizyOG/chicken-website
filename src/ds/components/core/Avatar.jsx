import React from 'react';

const CSS = `
.rvx-avatar{position:relative;display:inline-flex;align-items:center;justify-content:center;
  border-radius:50%;background:var(--surface-3);color:var(--text-mid);overflow:hidden;
  font-family:var(--font-heading);font-weight:var(--fw-bold);text-transform:uppercase;
  flex:none;line-height:1;border:var(--bw-2) solid transparent}
.rvx-avatar img{width:100%;height:100%;object-fit:cover;display:block}
.rvx-avatar--xs{width:28px;height:28px;font-size:11px}
.rvx-avatar--sm{width:40px;height:40px;font-size:14px}
.rvx-avatar--md{width:56px;height:56px;font-size:18px}
.rvx-avatar--lg{width:88px;height:88px;font-size:28px}
.rvx-avatar--xl{width:128px;height:128px;font-size:40px}
.rvx-avatar--ring-accent{border-color:var(--accent);box-shadow:0 0 0 3px var(--accent-soft)}
.rvx-avatar--ring-live{border-color:var(--live);box-shadow:var(--glow-live)}
.rvx-avatar--clickable{cursor:pointer;transition:transform var(--dur-fast) var(--ease-out)}
.rvx-avatar--clickable:hover{transform:scale(1.04)}
.rvx-avatar--clickable:focus-visible{outline:2px solid var(--focus-ring);outline-offset:3px}
.rvx-avatar__live{position:absolute;bottom:-3px;left:50%;transform:translateX(-50%);
  background:var(--live);color:#fff;font-family:var(--font-heading);font-weight:var(--fw-bold);
  font-size:9px;letter-spacing:.08em;text-transform:uppercase;padding:2px 6px;border-radius:var(--radius-pill);
  border:2px solid var(--bg-canvas);line-height:1}
`;

function ensureStyles() {
  if (typeof document === 'undefined') return;
  if (document.getElementById('rvx-avatar-css')) return;
  const el = document.createElement('style');
  el.id = 'rvx-avatar-css';
  el.textContent = CSS;
  document.head.appendChild(el);
}

function initialsFrom(name = '') {
  return name.trim().split(/\s+/).slice(0, 2).map((w) => w[0] || '').join('');
}

/**
 * Avatar — circular profile image with optional live ring + LIVE flag.
 * Becomes a button when `onClick` is supplied (used to expand a cast photo).
 */
export function Avatar({
  src,
  name = '',
  alt,
  size = 'md',
  ring = 'none',
  live = false,
  onClick,
  className = '',
  ...rest
}) {
  ensureStyles();
  const effectiveRing = live ? 'live' : ring;
  const clickable = typeof onClick === 'function';
  const cls = [
    'rvx-avatar',
    `rvx-avatar--${size}`,
    effectiveRing !== 'none' ? `rvx-avatar--ring-${effectiveRing}` : '',
    clickable ? 'rvx-avatar--clickable' : '',
    className,
  ].filter(Boolean).join(' ');

  const inner = src
    ? <img src={src} alt={alt || name} />
    : <span aria-hidden="true">{initialsFrom(name)}</span>;

  const content = (
    <>
      {inner}
      {live && <span className="rvx-avatar__live">Live</span>}
    </>
  );

  if (clickable) {
    return (
      <button type="button" className={cls} onClick={onClick} aria-label={alt || name} {...rest}>
        {content}
      </button>
    );
  }
  return <span className={cls} {...rest}>{content}</span>;
}
