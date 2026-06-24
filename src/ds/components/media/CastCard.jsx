import React from 'react';
import { Avatar } from '../core/Avatar.jsx';
import { SocialRow } from './SocialRow.jsx';

const CSS = `
.rvx-cast{display:flex;flex-direction:column;align-items:center;text-align:center;
  background:var(--surface-1);border:var(--bw-1) solid var(--border-subtle);
  border-radius:var(--radius-lg);padding:var(--space-5) var(--space-4) var(--space-4);
  gap:var(--space-2);width:100%;
  transition:border-color var(--dur-base) ease,transform var(--dur-base) var(--ease-out),box-shadow var(--dur-base) ease}
.rvx-cast:hover{border-color:var(--border-default);box-shadow:var(--shadow-md)}
.rvx-cast__name{font-family:var(--font-heading);font-weight:var(--fw-bold);text-transform:uppercase;
  letter-spacing:.02em;font-size:21px;line-height:1;color:var(--text-hi);margin:var(--space-2) 0 0}
.rvx-cast__role{font-family:var(--font-mono);font-size:11px;letter-spacing:.06em;color:var(--text-low);
  text-transform:uppercase;margin-bottom:var(--space-2)}
.rvx-cast__hint{font-family:var(--font-mono);font-size:9px;letter-spacing:.08em;color:var(--text-faint);
  text-transform:uppercase;margin-top:-2px}
.rvx-cast--departed{opacity:.55}
.rvx-cast--departed:hover{opacity:.75}
.rvx-cast__left{font-family:var(--font-mono);font-size:9px;letter-spacing:.06em;text-transform:uppercase;
  color:var(--text-faint);border:1px solid var(--border-subtle);border-radius:999px;
  padding:2px 8px;margin-top:var(--space-1)}
`;

function ensureStyles() {
  if (typeof document === 'undefined') return;
  if (document.getElementById('rvx-cast-css')) return;
  const el = document.createElement('style');
  el.id = 'rvx-cast-css';
  el.textContent = CSS;
  document.head.appendChild(el);
}

/**
 * CastCard — crew profile: centered avatar (click to expand the photo), name,
 * role/handle and a row of social links. The hero of the map header + Crew page.
 */
export function CastCard({
  name,
  role,
  photo,
  socials = [],
  live = false,
  avatarSize = 'xl',
  onExpand,
  departed = false,
  className = '',
  ...rest
}) {
  ensureStyles();
  const cls = ['rvx-cast', departed ? 'rvx-cast--departed' : '', className].filter(Boolean).join(' ');
  return (
    <div className={cls} {...rest}>
      <Avatar
        src={photo}
        name={name}
        size={avatarSize}
        live={live}
        ring={live ? 'live' : 'accent'}
        onClick={onExpand ? () => onExpand({ name, photo, role }) : undefined}
      />
      {onExpand && <span className="rvx-cast__hint">Tap to expand</span>}
      <h3 className="rvx-cast__name">{name}</h3>
      {role && <div className="rvx-cast__role">{role}</div>}
      {departed && <div className="rvx-cast__left">Left RV X</div>}
      {socials.length > 0 && <SocialRow links={socials} size="sm" />}
    </div>
  );
}
