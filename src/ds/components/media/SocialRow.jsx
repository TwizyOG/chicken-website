import React from 'react';

/* Brand icons come from the Simple Icons CDN as mask-images so we can recolor
   them (muted by default, brand color on hover). Powerchat has no Simple Icon,
   so it ships an inline lightning glyph. */
const PC = "data:image/svg+xml;utf8," + encodeURIComponent(
  "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path d='M13 2 4 14h6l-1 8 9-12h-6z'/></svg>"
);

const BRANDS = {
  kick:      { src: 'https://cdn.simpleicons.org/kick',      color: '#53FC18', label: 'Kick' },
  x:         { src: 'https://cdn.simpleicons.org/x',         color: '#f5f5f5', label: 'X' },
  twitter:   { src: 'https://cdn.simpleicons.org/x',         color: '#f5f5f5', label: 'X' },
  instagram: { src: 'https://cdn.simpleicons.org/instagram', color: '#E4405F', label: 'Instagram' },
  discord:   { src: 'https://cdn.simpleicons.org/discord',   color: '#5865F2', label: 'Discord' },
  youtube:   { src: 'https://cdn.simpleicons.org/youtube',   color: '#FF0000', label: 'YouTube' },
  tiktok:    { src: 'https://cdn.simpleicons.org/tiktok',    color: '#f5f5f5', label: 'TikTok' },
  twitch:    { src: 'https://cdn.simpleicons.org/twitch',    color: '#9146FF', label: 'Twitch' },
  powerchat: { src: PC,                                      color: 'var(--donate)', label: 'Powerchat' },
};

const CSS = `
.rvx-social{display:inline-flex;align-items:center;gap:var(--space-2)}
.rvx-social__link{display:inline-flex;align-items:center;justify-content:center;flex:none;
  border-radius:var(--radius-sm);border:var(--bw-1) solid var(--border-default);
  background:var(--surface-2);cursor:pointer;
  transition:border-color var(--dur-fast) ease,background var(--dur-fast) ease,transform var(--dur-fast) var(--ease-out)}
.rvx-social__link:hover{border-color:var(--border-strong);transform:translateY(-2px)}
.rvx-social__link:focus-visible{outline:2px solid var(--focus-ring);outline-offset:2px}
.rvx-social--sm .rvx-social__link{width:34px;height:34px}
.rvx-social--md .rvx-social__link{width:40px;height:40px}
.rvx-social--lg .rvx-social__link{width:46px;height:46px}
.rvx-social__ic{display:block;background:var(--text-low);
  -webkit-mask:var(--src) center/contain no-repeat;mask:var(--src) center/contain no-repeat;
  transition:background var(--dur-fast) ease}
.rvx-social--sm .rvx-social__ic{width:16px;height:16px}
.rvx-social--md .rvx-social__ic{width:18px;height:18px}
.rvx-social--lg .rvx-social__ic{width:21px;height:21px}
.rvx-social__link:hover .rvx-social__ic{background:var(--brand)}
.rvx-social--bare .rvx-social__link{border:0;background:transparent}
.rvx-social--bare .rvx-social__link:hover{background:transparent;transform:translateY(-2px)}
`;

function ensureStyles() {
  if (typeof document === 'undefined') return;
  if (document.getElementById('rvx-social-css')) return;
  const el = document.createElement('style');
  el.id = 'rvx-social-css';
  el.textContent = CSS;
  document.head.appendChild(el);
}

/**
 * SocialRow — row of brand-icon links (Kick, X, Instagram, Discord, YouTube,
 * Powerchat…). Icons are muted and light up to their brand color on hover.
 */
export function SocialRow({
  links = [],
  size = 'md',
  bare = false,
  className = '',
  ...rest
}) {
  ensureStyles();
  const cls = ['rvx-social', `rvx-social--${size}`, bare ? 'rvx-social--bare' : '', className]
    .filter(Boolean).join(' ');
  return (
    <div className={cls} {...rest}>
      {links.map((l, i) => {
        const b = BRANDS[l.platform] || {};
        const src = l.iconSrc || b.src;
        const label = l.label || b.label || l.platform;
        return (
          <a
            key={i}
            className="rvx-social__link"
            href={l.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            title={label}
            style={{ '--brand': b.color || 'var(--accent)' }}
          >
            <span className="rvx-social__ic" style={{ '--src': `url("${src}")` }} aria-hidden="true" />
          </a>
        );
      })}
    </div>
  );
}
