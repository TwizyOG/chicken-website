/* RoadTrip — the animated roadtrip scene behind the Home hero.
   A side-view RV rolls down a desert highway at dusk while three parallax
   layers (mesas → trees/houses/wildlife → roadside scrub) drift past and the
   center-line dashes race by. Pure SVG + CSS keyframes (site.css), silhouette
   art in the brand palette. Everything freezes under prefers-reduced-motion. */
import React from 'react';
import { useReducedMotion } from 'framer-motion';

/* ScrollRV — a little RV that drives along the bottom of the screen,
   tracking your scroll progress through the page (wheels spinning).
   Hidden under prefers-reduced-motion. */
export function ScrollRV() {
  const reduce = useReducedMotion();
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (reduce) return;
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const d = document.documentElement;
        const p = d.scrollTop / Math.max(1, d.scrollHeight - d.clientHeight);
        el.style.transform = `translateX(${p * Math.max(0, d.clientWidth - 110)}px)`;
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(raf);
    };
  }, [reduce]);
  if (reduce) return null;
  return (
    <div className="scroll-rv" aria-hidden="true">
      <div className="scroll-rv__rv" ref={ref}>
        <svg viewBox="0 0 120 60">
          <g className="rt-rv-body">
            <path d="M6 12 h66 a3 3 0 0 1 3 3 v33 a3 3 0 0 1 -3 3 H9 a3 3 0 0 1 -3 -3 Z" fill="#EDE3CB" />
            <path d="M68 6 h28 a4 4 0 0 1 4 4 v10 H68 Z" fill="#EDE3CB" />
            <path d="M75 20 h21 c6.5 0 11 3.5 13.5 8.5 L112 36 a4 4 0 0 1 4 4 v7 a4 4 0 0 1 -4 4 H75 Z" fill="#E3D6B6" />
            <path d="M96 22.5 c5 0 8.6 2.6 10.8 6.8 l1.4 3.2 H96 Z" fill="#3A4A52" />
            <rect x="11" y="17" width="14" height="9" rx="1.4" fill="#3A4A52" />
            <rect x="29" y="17" width="14" height="9" rx="1.4" fill="#3A4A52" />
            <rect x="48" y="20" width="13" height="29" rx="1.6" fill="#D8C7A2" />
            <path d="M6 30 H72 v4.5 H6 Z" fill="#E8853A" />
            <path d="M75 34 h37 l2 4 h-39 Z" fill="#E8853A" opacity="0.92" />
          </g>
          <g className="rt-wheel">
            <circle cx="26" cy="50" r="8" fill="#16130F" />
            <circle cx="26" cy="50" r="3.8" fill="#6B6052" />
            <path d="M26 46.8 v6.4 M22.8 50 h6.4" stroke="#2A2620" strokeWidth="1.1" />
          </g>
          <g className="rt-wheel">
            <circle cx="92" cy="50" r="8" fill="#16130F" />
            <circle cx="92" cy="50" r="3.8" fill="#6B6052" />
            <path d="M92 46.8 v6.4 M88.8 50 h6.4" stroke="#2A2620" strokeWidth="1.1" />
          </g>
        </svg>
      </div>
    </div>
  );
}

export function RoadTrip() {
  return (
    <div className="roadtrip" aria-hidden="true">
      <svg viewBox="0 0 1200 360" preserveAspectRatio="xMinYMax slice">
        <defs>
          <linearGradient id="rt-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#16130F" />
            <stop offset="0.72" stopColor="#2A1D12" />
            <stop offset="1" stopColor="#41281466" />
          </linearGradient>
          <linearGradient id="rt-sun" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#F2A65A" />
            <stop offset="1" stopColor="#C75B28" />
          </linearGradient>

          {/* ---- far: mesas + ridgeline (1200px repeating set) ---- */}
          <g id="rt-far-set">
            <path d="M0 268 L70 240 140 268 Z" fill="#1E1812" />
            <path d="M150 268 h90 l-12 -34 h-64 Z" fill="#221A12" />
            <path d="M320 268 L400 226 470 268 Z" fill="#1E1812" />
            <path d="M540 268 h120 l-16 -42 h-86 Z" fill="#221A12" />
            <path d="M730 268 L800 238 860 268 Z" fill="#1E1812" />
            <path d="M920 268 h80 l-10 -28 h-58 Z" fill="#221A12" />
            <path d="M1050 268 L1120 234 1190 268 Z" fill="#1E1812" />
          </g>

          {/* ---- mid: trees, houses, wildlife (1200px repeating set) ---- */}
          <g id="rt-mid-set" fill="#241C12">
            {/* pines */}
            <g transform="translate(40 0)">
              <path d="M20 282 l14 -30 14 30 Z M20 268 l14 -26 14 26 Z M31 282 h6 v12 h-6 Z" />
            </g>
            <g transform="translate(150 6) scale(0.8)">
              <path d="M20 282 l14 -30 14 30 Z M20 268 l14 -26 14 26 Z M31 282 h6 v12 h-6 Z" />
            </g>
            {/* house */}
            <g transform="translate(250 0)">
              <rect x="0" y="262" width="54" height="30" />
              <path d="M-6 264 L27 240 60 264 Z" />
              <rect x="22" y="274" width="12" height="18" fill="#16130F" />
              <rect x="8" y="268" width="9" height="8" fill="#3A2A18" />
            </g>
            {/* saguaro cactus */}
            <g transform="translate(390 0)">
              <path d="M14 294 v-44 a7 7 0 0 1 14 0 v44 Z" />
              <path d="M5 268 a5 5 0 0 1 10 0 v10 h-4 v6 h8 M37 258 a5 5 0 0 0 -10 0 v8 h4 v6 h-8"
                stroke="#241C12" strokeWidth="9" fill="none" />
            </g>
            {/* deer silhouette */}
            <g transform="translate(500 0)">
              <path d="M10 294 v-14 l4 -8 h18 l6 8 v14 h-4 v-10 h-2 v10 h-4 v-10 h-8 v10 h-4 v-10 h-2 v10 Z" />
              <path d="M34 274 l5 -10 m-2 4 l5 -3 m-6 -3 l-1 -5 m0 5 l-4 -3" stroke="#241C12" strokeWidth="2" fill="none" />
              <circle cx="38" cy="266" r="3.4" />
            </g>
            {/* barn */}
            <g transform="translate(640 0)">
              <rect x="0" y="258" width="64" height="34" />
              <path d="M-4 260 L32 236 68 260 Z" />
              <rect x="24" y="270" width="16" height="22" fill="#16130F" />
            </g>
            {/* water tower */}
            <g transform="translate(800 0)">
              <ellipse cx="26" cy="234" rx="22" ry="14" />
              <rect x="6" y="232" width="40" height="12" rx="4" />
              <path d="M12 244 L6 294 M40 244 L46 294 M26 244 V294 M9 270 h34" stroke="#241C12" strokeWidth="4" fill="none" />
            </g>
            {/* billboard */}
            <g transform="translate(930 0)">
              <rect x="0" y="238" width="86" height="34" rx="2" fill="#221A12" />
              <rect x="3" y="241" width="80" height="28" fill="#16130F" />
              <text x="43" y="262" textAnchor="middle" fontFamily="Anton, sans-serif" fontSize="19" fill="#E8853A">RV ✕</text>
              <path d="M22 272 v22 M64 272 v22" stroke="#241C12" strokeWidth="5" />
            </g>
            {/* cow */}
            <g transform="translate(1090 0)">
              <rect x="6" y="272" width="30" height="14" rx="6" />
              <path d="M10 286 v8 M18 286 v8 M26 286 v8 M33 286 v8" stroke="#241C12" strokeWidth="3" />
              <rect x="32" y="266" width="12" height="10" rx="4" />
            </g>
          </g>

          {/* ---- near: scrub, posts, rocks (1200px repeating set) ---- */}
          <g id="rt-near-set" fill="#2A2014">
            <ellipse cx="60" cy="304" rx="20" ry="8" />
            <ellipse cx="84" cy="306" rx="12" ry="5" />
            <rect x="190" y="284" width="6" height="22" rx="2" />
            <rect x="330" y="284" width="6" height="22" rx="2" />
            <path d="M186 290 h152" stroke="#2A2014" strokeWidth="3" />
            <ellipse cx="480" cy="306" rx="16" ry="6" />
            <path d="M600 308 l10 -16 12 16 Z" />
            <rect x="760" y="284" width="6" height="22" rx="2" />
            <rect x="900" y="284" width="6" height="22" rx="2" />
            <path d="M756 290 h152" stroke="#2A2014" strokeWidth="3" />
            <ellipse cx="1040" cy="306" rx="22" ry="8" />
            <ellipse cx="1150" cy="304" rx="13" ry="5" />
          </g>
        </defs>

        {/* sky, sun, clouds */}
        <rect x="0" y="0" width="1200" height="300" fill="url(#rt-sky)" />
        <circle cx="330" cy="252" r="46" fill="url(#rt-sun)" opacity="0.85" />
        <g className="rt-clouds" fill="#F6E7C8" opacity="0.05">
          <ellipse cx="180" cy="80" rx="90" ry="14" />
          <ellipse cx="640" cy="120" rx="120" ry="16" />
          <ellipse cx="1040" cy="64" rx="80" ry="12" />
          <ellipse cx="1380" cy="100" rx="100" ry="14" />
          <ellipse cx="1840" cy="70" rx="90" ry="13" />
          <ellipse cx="2240" cy="120" rx="110" ry="15" />
        </g>
        <g fill="#F6E7C8" opacity="0.25">
          <circle cx="140" cy="40" r="1.4" /><circle cx="420" cy="64" r="1" /><circle cx="700" cy="30" r="1.3" />
          <circle cx="960" cy="56" r="1" /><circle cx="1120" cy="26" r="1.4" />
        </g>

        {/* parallax layers (each = set + duplicate, scrolled left forever) */}
        <g className="rt-far"><use href="#rt-far-set" /><use href="#rt-far-set" x="1200" /></g>
        <rect x="0" y="266" width="1200" height="40" fill="#211912" />
        <g className="rt-mid"><use href="#rt-mid-set" /><use href="#rt-mid-set" x="1200" /></g>

        {/* the highway */}
        <rect x="0" y="300" width="1200" height="60" fill="#1C1813" />
        <rect x="0" y="300" width="1200" height="3" fill="#3A2F22" opacity="0.6" />
        <path className="rt-dashes" d="M0 331 H1200" stroke="#F2A65A" strokeWidth="4" strokeDasharray="42 58" opacity="0.85" />

        {/* near scrub in front of the road edge */}
        <g className="rt-near"><use href="#rt-near-set" /><use href="#rt-near-set" x="1200" /></g>

        {/* ---- the RV (body bobs; wheels spin; exhaust puffs) ---- */}
        <g className="rt-rv" transform="translate(120 180) scale(2)">
          <g className="rt-puffs">
            <circle className="rt-puff" cx="2" cy="50" r="4" fill="#8A7B5C" />
            <circle className="rt-puff rt-puff--2" cx="2" cy="50" r="3" fill="#8A7B5C" />
            <circle className="rt-puff rt-puff--3" cx="2" cy="50" r="5" fill="#8A7B5C" />
          </g>
          <g className="rt-rv-body">
            <path d="M6 14 h66 a3 3 0 0 1 3 3 v33 a3 3 0 0 1 -3 3 H9 a3 3 0 0 1 -3 -3 Z" fill="#EDE3CB" />
            <path d="M68 8 h28 a4 4 0 0 1 4 4 v10 H68 Z" fill="#EDE3CB" />
            <path d="M68 8 h28 a4 4 0 0 1 4 4 v3 H68 Z" fill="#F6EFDC" />
            <path d="M75 22 h21 c6.5 0 11 3.5 13.5 8.5 L112 38 a4 4 0 0 1 4 4 v7 a4 4 0 0 1 -4 4 H75 Z" fill="#E3D6B6" />
            <path d="M96 24.5 c5 0 8.6 2.6 10.8 6.8 l1.4 3.2 H96 Z" fill="#3A4A52" />
            <rect x="84" y="25" width="9" height="9" rx="1.2" fill="#3A4A52" />
            <rect x="72" y="12" width="10" height="6" rx="1" fill="#3A4A52" />
            <rect x="11" y="19" width="14" height="9" rx="1.4" fill="#3A4A52" />
            <rect x="29" y="19" width="14" height="9" rx="1.4" fill="#3A4A52" />
            <rect x="48" y="22" width="13" height="29" rx="1.6" fill="#D8C7A2" />
            <rect x="50" y="24" width="9" height="8" rx="1" fill="#3A4A52" />
            <path d="M6 32 H72 v4.5 H6 Z" fill="#E8853A" />
            <path d="M6 38.5 H72 v2.6 H6 Z" fill="#B4552D" />
            <path d="M75 36 h37 l2 4 h-39 Z" fill="#E8853A" opacity="0.92" />
            <rect x="16" y="9" width="15" height="5.5" rx="1.6" fill="#CFC1A0" />
            <rect x="38" y="10.5" width="7" height="4" rx="1" fill="#CFC1A0" />
            <path d="M8 16 v32 M13 16 v32" stroke="#8A7B5C" strokeWidth="1.6" strokeLinecap="round" />
            <path d="M8 22 h5 M8 29 h5 M8 36 h5 M8 43 h5" stroke="#8A7B5C" strokeWidth="1.4" strokeLinecap="round" />
            <rect x="106" y="46" width="10" height="4.5" rx="2" fill="#3A352D" />
            <rect x="111.5" y="39.5" width="3.4" height="4" rx="1.2" fill="#FBE2A0" />
            <rect x="99" y="18.5" width="3" height="4.6" rx="1" fill="#3A352D" />
            <rect x="4" y="49" width="5" height="2.4" rx="1.2" fill="#3A352D" />
          </g>
          <g className="rt-wheel">
            <circle cx="26" cy="52" r="8.4" fill="#16130F" />
            <circle cx="26" cy="52" r="4" fill="#6B6052" />
            <path d="M26 48.6 v6.8 M22.6 52 h6.8" stroke="#2A2620" strokeWidth="1.1" />
          </g>
          <g className="rt-wheel">
            <circle cx="92" cy="52" r="8.4" fill="#16130F" />
            <circle cx="92" cy="52" r="4" fill="#6B6052" />
            <path d="M92 48.6 v6.8 M88.6 52 h6.8" stroke="#2A2620" strokeWidth="1.1" />
          </g>
        </g>
      </svg>
    </div>
  );
}
