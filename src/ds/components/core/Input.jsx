import React from 'react';

const CSS = `
.rvx-field{display:inline-flex;align-items:center;gap:9px;width:100%;
  background:var(--surface-sunken);border:var(--bw-1) solid var(--border-default);
  border-radius:var(--radius-sm);color:var(--text-hi);
  transition:border-color var(--dur-fast) ease,box-shadow var(--dur-fast) ease}
.rvx-field--sm{height:36px;padding:0 10px}
.rvx-field--md{height:44px;padding:0 13px}
.rvx-field--lg{height:52px;padding:0 16px}
.rvx-field:focus-within{border-color:var(--accent);box-shadow:0 0 0 3px var(--accent-soft)}
.rvx-field__ic{display:inline-flex;color:var(--text-low);flex:none}
.rvx-field__ic svg,.rvx-field__ic img{width:18px;height:18px;display:block}
.rvx-field input{flex:1;min-width:0;background:transparent;border:0;outline:0;color:var(--text-hi);
  font-family:var(--font-body);font-size:15px}
.rvx-field input::placeholder{color:var(--text-faint)}
.rvx-field--disabled{opacity:.5;pointer-events:none}
`;

function ensureStyles() {
  if (typeof document === 'undefined') return;
  if (document.getElementById('rvx-field-css')) return;
  const el = document.createElement('style');
  el.id = 'rvx-field-css';
  el.textContent = CSS;
  document.head.appendChild(el);
}

/**
 * Input — text field with optional leading/trailing icon. Used for clip search.
 */
export function Input({
  iconLeft,
  iconRight,
  size = 'md',
  disabled = false,
  className = '',
  ...rest
}) {
  ensureStyles();
  const cls = ['rvx-field', `rvx-field--${size}`, disabled ? 'rvx-field--disabled' : '', className]
    .filter(Boolean).join(' ');
  return (
    <div className={cls}>
      {iconLeft && <span className="rvx-field__ic">{iconLeft}</span>}
      <input disabled={disabled} {...rest} />
      {iconRight && <span className="rvx-field__ic">{iconRight}</span>}
    </div>
  );
}
