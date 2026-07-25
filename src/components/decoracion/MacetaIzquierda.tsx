import React from 'react';

export const MacetaIzquierda = React.memo(() => {
  return (
    <svg
      role="img"
      aria-hidden="true"
      focusable="false"
      width="140"
      height="200"
      viewBox="0 0 140 200"
      style={{ overflow: 'visible' }}
    >
      {/* Maceta — sin animación */}
      <g className="maceta-enter">
        <ellipse cx="70" cy="142" rx="42" ry="6" fill="#0d1a0d" opacity="0.6" />
        <path d="M28 148 L36 195 L104 195 L112 148 Z" fill="#111827" stroke="#1e3a5f" strokeWidth="1.5" />
        <rect x="32" y="165" width="76" height="3" rx="1.5" fill="#1e3a5f" opacity="0.7" />
        <rect x="22" y="140" width="96" height="10" rx="4" fill="#1e3a5f" stroke="#2a4a6f" strokeWidth="1" />
      </g>

      {/* Tallo principal */}
      <g className="maceta-enter">
        <path d="M70 140 Q68 110 65 75 Q62 40 60 5 Q58 -20 56 -45" stroke="#1e3a5f" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.8" />
      </g>

      {/* Hojas nivel 1 — y: 120–130 */}
      <g className="maceta-enter">
        <path d="M70 125 Q50 118 30 115" stroke="#1e3a5f" strokeWidth="1.8" strokeLinecap="round" fill="none" opacity="0.7" />
        <g className="sw-leaf-1" style={{ willChange: 'transform' }}>
          <ellipse cx="28" cy="112" rx="22" ry="10" fill="#0f6e56" opacity="0.75" transform="rotate(-30 28 112)" />
          <ellipse cx="28" cy="112" rx="15" ry="6" fill="#1D9E75" opacity="0.5" transform="rotate(-30 28 112)" />
          <line x1="70" y1="125" x2="12" y2="105" stroke="#085041" strokeWidth="1" opacity="0.5" />
        </g>
        <path d="M70 120 Q88 112 108 108" stroke="#1e3a5f" strokeWidth="1.8" strokeLinecap="round" fill="none" opacity="0.7" />
        <g className="sw-leaf-2" style={{ willChange: 'transform' }}>
          <ellipse cx="110" cy="105" rx="20" ry="9" fill="#0f6e56" opacity="0.7" transform="rotate(25 110 105)" />
          <ellipse cx="110" cy="105" rx="13" ry="5" fill="#1D9E75" opacity="0.45" transform="rotate(25 110 105)" />
          <line x1="70" y1="120" x2="125" y2="100" stroke="#085041" strokeWidth="1" opacity="0.5" />
        </g>
      </g>

      {/* Hojas nivel 2 — y: 90–100 */}
      <g className="maceta-enter">
        <path d="M67 98 Q48 90 26 85" stroke="#1e3a5f" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.65" />
        <g className="sw-leaf-3" style={{ willChange: 'transform' }}>
          <ellipse cx="24" cy="82" rx="18" ry="8" fill="#0f6e56" opacity="0.65" transform="rotate(-20 24 82)" />
          <ellipse cx="24" cy="82" rx="12" ry="4.5" fill="#1D9E75" opacity="0.4" transform="rotate(-20 24 82)" />
          <line x1="67" y1="98" x2="10" y2="76" stroke="#085041" strokeWidth="0.8" opacity="0.45" />
        </g>
        <path d="M67 92 Q90 84 112 80" stroke="#1e3a5f" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.65" />
        <g className="sw-leaf-4" style={{ willChange: 'transform' }}>
          <ellipse cx="114" cy="77" rx="16" ry="7" fill="#1D9E75" opacity="0.5" transform="rotate(22 114 77)" />
          <ellipse cx="114" cy="77" rx="10" ry="4" fill="#4ade80" opacity="0.25" transform="rotate(22 114 77)" />
        </g>
        <circle cx="120" cy="88" r="3" fill="#4ade80" opacity="0.55" />
        <circle cx="120" cy="88" r="1.5" fill="#0a0f1a" opacity="0.70" />
      </g>

      {/* Hojas nivel 3 — y: 60–70 */}
      <g className="maceta-enter">
        <path d="M64 70 Q44 62 22 58" stroke="#1e3a5f" strokeWidth="1.3" strokeLinecap="round" fill="none" opacity="0.6" />
        <g className="sw-leaf-5" style={{ willChange: 'transform' }}>
          <ellipse cx="20" cy="55" rx="15" ry="6" fill="#0f6e56" opacity="0.55" transform="rotate(-25 20 55)" />
          <ellipse cx="20" cy="55" rx="10" ry="3.5" fill="#1D9E75" opacity="0.35" transform="rotate(-25 20 55)" />
        </g>
        <path d="M64 65 Q86 56 108 52" stroke="#1e3a5f" strokeWidth="1.3" strokeLinecap="round" fill="none" opacity="0.6" />
        <g className="sw-leaf-6" style={{ willChange: 'transform' }}>
          <ellipse cx="110" cy="49" rx="14" ry="5.5" fill="#0f6e56" opacity="0.5" transform="rotate(18 110 49)" />
          <ellipse cx="110" cy="49" rx="9" ry="3" fill="#4ade80" opacity="0.2" transform="rotate(18 110 49)" />
        </g>
      </g>

      {/* Hojas nivel 4 — y: 20–40 */}
      <g className="maceta-enter">
        <path d="M62 40 Q44 30 24 22" stroke="#1e3a5f" strokeWidth="1.1" strokeLinecap="round" fill="none" opacity="0.55" />
        <g className="sw-leaf-1" style={{ willChange: 'transform' }}>
          <ellipse cx="22" cy="19" rx="13" ry="5" fill="#0f6e56" opacity="0.5" transform="rotate(-15 22 19)" />
          <ellipse cx="22" cy="19" rx="8" ry="3" fill="#1D9E75" opacity="0.3" transform="rotate(-15 22 19)" />
        </g>
        <path d="M62 35 Q86 26 108 20" stroke="#1e3a5f" strokeWidth="1.1" strokeLinecap="round" fill="none" opacity="0.55" />
        <g className="sw-leaf-3" style={{ willChange: 'transform' }}>
          <ellipse cx="110" cy="17" rx="12" ry="4.5" fill="#1D9E75" opacity="0.4" transform="rotate(20 110 17)" />
          <ellipse cx="110" cy="17" rx="7" ry="2.5" fill="#4ade80" opacity="0.2" transform="rotate(20 110 17)" />
        </g>
      </g>

      {/* Hojas nivel 5 — y: -20 a 0, casi fuera del viewBox */}
      <g className="maceta-enter">
        <path d="M59 0 Q40 -10 18 -18" stroke="#1e3a5f" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.45" />
        <g className="sw-leaf-5" style={{ willChange: 'transform' }}>
          <ellipse cx="16" cy="-20" rx="11" ry="4" fill="#0f6e56" opacity="0.4" transform="rotate(-12 16 -20)" />
          <ellipse cx="16" cy="-20" rx="7" ry="2.5" fill="#4ade80" opacity="0.15" transform="rotate(-12 16 -20)" />
        </g>
        <path d="M59 -5 Q82 -14 104 -18" stroke="#1e3a5f" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.4" />
        <g className="sw-leaf-6" style={{ willChange: 'transform' }}>
          <ellipse cx="106" cy="-20" rx="10" ry="3.5" fill="#0f6e56" opacity="0.35" transform="rotate(15 106 -20)" />
        </g>
      </g>
    </svg>
  );
});

MacetaIzquierda.displayName = 'MacetaIzquierda';
