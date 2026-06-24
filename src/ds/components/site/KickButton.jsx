import React from 'react';

const KICK_SRC = 'https://cdn.simpleicons.org/kick';

const CSS = `
.rvx-kick{display:inline-flex;align-items:center;justify-content:center;gap:9px;
  font-family:var(--font-heading);font-weight:var(--fw-bold);text-transform:uppercase;letter-spacing:.04em;
  height:42px;padding:0 18px;border-radius:var(--radius-sm);border:var(--bw-1) solid transparent;
  cursor:pointer;text-decoration:none;white-space:nowrap;line-height:1;
  transition:background var(--dur-fast) ease,border-color var(--dur-fast) ease,transform var(--dur-fast) var(--ease-out)}
.rvx-kick:active{transform:translateY(1px)}
.rvx-kick:focus-visible{outline:2px solid var(--kick);outline-offset:2px}
.rvx-kick--sm{height:34px;padding:0 14px;font-size:13px}
.rvx-kick--md{height:42px;font-size:15px}
.rvx-kick--lg{height:52px;padding:0 24px;font-size:18px}
.rvx-kick--solid{background:var(--kick);color:var(--kick-ink)}
.rvx-kick--solid:hover{background:var(--kick-600)}
.rvx-kick--outline{background:transparent;color:var(--text-hi);border-color:var(--border-strong)}
.rvx-kick--outline:hover{border-color:var(--kick);color:var(--kick)}
.rvx-kick__ic{display:block;width:1.15em;height:1.15em;flex:none;
  -webkit-mask:var(--src) center/contain no-repeat;mask:var(--src) center/contain no-repeat;background:currentColor}
.rvx-kick--solid .rvx-kick__ic{background:var(--kick-ink)}
.rvx-kick__av{width:24px;height:24px;border-radius:50%;object-fit:cover;display:block;margin-left:-4px}
`;

function ensureStyles() {
  if (typeof document === 'undefined') return;
  if (document.getElementById('rvx-kick-css')) return;
  const el = document.createElement('style');
  el.id = 'rvx-kick-css';
  el.textContent = CSS;
  document.head.appendChild(el);
}

/**
 * KickButton — the branded "Login with Kick" CTA. Flips to a signed-in pill
 * (avatar + handle) when `user` is supplied.
 */
export function KickButton({
  user,
  variant = 'solid',
  size = 'md',
  href,
  onClick,
  children,
  className = '',
  ...rest
}) {
  ensureStyles();
  const cls = ['rvx-kick', `rvx-kick--${variant}`, `rvx-kick--${size}`, className]
    .filter(Boolean).join(' ');
  const Tag = href ? 'a' : 'button';
  const tagProps = href ? { href } : { type: 'button' };

  return (
    <Tag className={cls} onClick={onClick} {...tagProps} {...rest}>
      {user
        ? <>
            {user.avatar
              ? <img className="rvx-kick__av" src={user.avatar} alt="" />
              : <span className="rvx-kick__ic" style={{ '--src': `url("${KICK_SRC}")` }} aria-hidden="true" />}
            {user.name}
          </>
        : <>
            <span className="rvx-kick__ic" style={{ '--src': `url("${KICK_SRC}")` }} aria-hidden="true" />
            {children || 'Login with Kick'}
          </>}
    </Tag>
  );
}
