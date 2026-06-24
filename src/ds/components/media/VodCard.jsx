import React from 'react';
import { Badge } from '../core/Badge.jsx';
import { Avatar } from '../core/Avatar.jsx';

const CSS = `
.rvx-vod{display:flex;flex-direction:column;text-align:left;width:100%;background:var(--surface-1);
  border:var(--bw-1) solid var(--border-subtle);border-radius:var(--radius-md);overflow:hidden;
  cursor:pointer;color:inherit;text-decoration:none;
  transition:transform var(--dur-base) var(--ease-out),border-color var(--dur-base) ease,box-shadow var(--dur-base) ease}
.rvx-vod:hover{transform:translateY(-3px);border-color:var(--border-strong);box-shadow:var(--shadow-lg)}
.rvx-vod:focus-visible{outline:2px solid var(--focus-ring);outline-offset:2px}
.rvx-vod__thumb{position:relative;aspect-ratio:16/9;background:var(--asphalt-800);overflow:hidden}
.rvx-vod__thumb img,.rvx-vod__thumb ::slotted(img){width:100%;height:100%;object-fit:cover;display:block}
.rvx-vod__thumb-fallback{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;
  font-family:var(--font-display);font-size:34px;color:var(--asphalt-600);
  background:radial-gradient(120% 120% at 50% 0%,var(--asphalt-700),var(--asphalt-900))}
.rvx-vod__shade{position:absolute;inset:0;background:linear-gradient(to top,rgba(10,8,6,.78),transparent 46%)}
.rvx-vod__top{position:absolute;top:9px;left:9px;display:flex;gap:6px}
.rvx-vod__dur{position:absolute;bottom:9px;right:9px;font-family:var(--font-mono);font-size:11px;
  background:rgba(10,8,6,.82);color:var(--sand-100);padding:2px 6px;border-radius:var(--radius-xs);letter-spacing:.02em}
.rvx-vod__play{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;opacity:0;
  transition:opacity var(--dur-base) ease}
.rvx-vod:hover .rvx-vod__play{opacity:1}
.rvx-vod__play span{width:52px;height:52px;border-radius:50%;background:var(--accent);color:var(--text-onaccent);
  display:flex;align-items:center;justify-content:center;box-shadow:var(--shadow-md)}
.rvx-vod__play svg{width:22px;height:22px;margin-left:3px}
.rvx-vod__body{padding:var(--space-3) var(--space-4) var(--space-4)}
.rvx-vod__title{font-family:var(--font-heading);font-weight:var(--fw-bold);font-size:18px;line-height:1.1;
  color:var(--text-hi);margin:0 0 7px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.rvx-vod__meta{font-family:var(--font-mono);font-size:11px;color:var(--text-low);letter-spacing:.03em;
  display:flex;gap:9px;align-items:center;margin-bottom:11px}
.rvx-vod__meta b{color:var(--text-mid);font-weight:400}
.rvx-vod__chan{display:flex;align-items:center;gap:8px}
.rvx-vod__chan-name{font-family:var(--font-heading);font-weight:var(--fw-semibold);font-size:13px;
  text-transform:uppercase;letter-spacing:.04em;color:var(--text-mid)}
.rvx-vod--compact .rvx-vod__body{padding:var(--space-2) var(--space-3) var(--space-3)}
.rvx-vod--compact .rvx-vod__title{font-size:15px}
`;

function ensureStyles() {
  if (typeof document === 'undefined') return;
  if (document.getElementById('rvx-vod-css')) return;
  const el = document.createElement('style');
  el.id = 'rvx-vod-css';
  el.textContent = CSS;
  document.head.appendChild(el);
}

const PlayGlyph = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 4v16l13-8z" /></svg>
);

/**
 * VodCard — media tile for VODs and Kick clips. Thumbnail with status + duration,
 * title, mono meta (date · views), and a channel row.
 */
export function VodCard({
  thumbnail,
  title,
  channel,
  dateLabel,
  views,
  duration,
  status,
  variant = 'default',
  href,
  onClick,
  className = '',
  ...rest
}) {
  ensureStyles();
  const cls = ['rvx-vod', variant === 'compact' ? 'rvx-vod--compact' : '', className]
    .filter(Boolean).join(' ');
  const Tag = href ? 'a' : 'button';
  const tagProps = href ? { href } : { type: 'button' };

  return (
    <Tag className={cls} onClick={onClick} {...tagProps} {...rest}>
      <div className="rvx-vod__thumb">
        {thumbnail
          ? <img src={thumbnail} alt="" />
          : <div className="rvx-vod__thumb-fallback">RV&#10005;</div>}
        <div className="rvx-vod__shade" />
        <div className="rvx-vod__top">
          {status === 'live' && <Badge variant="live" size="sm">Live</Badge>}
          {status === 'replay' && <Badge variant="replay" size="sm">VOD</Badge>}
          {status === 'clip' && <Badge variant="kick" size="sm">Clip</Badge>}
        </div>
        {duration && <span className="rvx-vod__dur">{duration}</span>}
        <div className="rvx-vod__play"><span><PlayGlyph /></span></div>
      </div>
      <div className="rvx-vod__body">
        <h3 className="rvx-vod__title">{title}</h3>
        <div className="rvx-vod__meta">
          {dateLabel && <b>{dateLabel}</b>}
          {views != null && <span>{views} views</span>}
        </div>
        {channel && (
          <div className="rvx-vod__chan">
            <Avatar src={channel.avatar} name={channel.name} size="xs" />
            <span className="rvx-vod__chan-name">{channel.name}</span>
          </div>
        )}
      </div>
    </Tag>
  );
}
