import React from 'react';

const CSS = `
.rvx-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;
  font-family:var(--font-heading);font-weight:var(--fw-bold);text-transform:uppercase;
  letter-spacing:.04em;border:var(--bw-1) solid transparent;border-radius:var(--radius-sm);
  cursor:pointer;text-decoration:none;white-space:nowrap;line-height:1;
  transition:transform var(--dur-fast) var(--ease-out),background var(--dur-fast) ease,
    border-color var(--dur-fast) ease,color var(--dur-fast) ease,box-shadow var(--dur-fast) ease;
  -webkit-user-select:none;user-select:none}
.rvx-btn:active{transform:translateY(1px)}
.rvx-btn:focus-visible{outline:2px solid var(--focus-ring);outline-offset:2px}
.rvx-btn[aria-disabled=true]{opacity:.45;pointer-events:none}
.rvx-btn--sm{height:34px;padding:0 14px;font-size:13px}
.rvx-btn--md{height:42px;padding:0 20px;font-size:15px}
.rvx-btn--lg{height:52px;padding:0 28px;font-size:18px}
.rvx-btn--primary{background:var(--accent);color:var(--text-onaccent)}
.rvx-btn--primary:hover{background:var(--accent-hover)}
.rvx-btn--secondary{background:var(--surface-3);color:var(--text-hi);border-color:var(--border-default)}
.rvx-btn--secondary:hover{background:var(--asphalt-700);border-color:var(--border-strong)}
.rvx-btn--outline{background:transparent;color:var(--text-hi);border-color:var(--border-strong)}
.rvx-btn--outline:hover{border-color:var(--accent);color:var(--accent-text)}
.rvx-btn--ghost{background:transparent;color:var(--text-mid)}
.rvx-btn--ghost:hover{background:var(--surface-3);color:var(--text-hi)}
.rvx-btn--donate{background:var(--donate);color:#fff}
.rvx-btn--donate:hover{background:var(--donate-hover)}
.rvx-btn--full{width:100%}
.rvx-btn__ic{display:inline-flex;align-items:center;justify-content:center}
.rvx-btn__ic svg,.rvx-btn__ic img{width:1.15em;height:1.15em;display:block}
.rvx-btn__spin{width:1.05em;height:1.05em;border-radius:50%;
  border:2px solid currentColor;border-top-color:transparent;animation:rvx-spin .7s linear infinite}
@keyframes rvx-spin{to{transform:rotate(360deg)}}
`;

function ensureStyles() {
  if (typeof document === 'undefined') return;
  if (document.getElementById('rvx-btn-css')) return;
  const el = document.createElement('style');
  el.id = 'rvx-btn-css';
  el.textContent = CSS;
  document.head.appendChild(el);
}

/**
 * Button — the primary RV X action. Condensed, uppercase, road-sign energy.
 */
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  iconLeft,
  iconRight,
  fullWidth = false,
  loading = false,
  disabled = false,
  href,
  className = '',
  ...rest
}) {
  ensureStyles();
  const Tag = href ? 'a' : 'button';
  const cls = [
    'rvx-btn',
    `rvx-btn--${variant}`,
    `rvx-btn--${size}`,
    fullWidth ? 'rvx-btn--full' : '',
    className,
  ].filter(Boolean).join(' ');

  const tagProps = href ? { href } : { type: rest.type || 'button' };
  const isDisabled = disabled || loading;

  return (
    <Tag
      className={cls}
      aria-disabled={isDisabled ? 'true' : undefined}
      {...tagProps}
      {...rest}
    >
      {loading && <span className="rvx-btn__spin" aria-hidden="true" />}
      {!loading && iconLeft && <span className="rvx-btn__ic">{iconLeft}</span>}
      {children}
      {!loading && iconRight && <span className="rvx-btn__ic">{iconRight}</span>}
    </Tag>
  );
}
