import React from 'react';

export const HojasIzquierda = React.memo(({
  animandoTransicion = false,
  mirrored = false,
}: {
  animandoTransicion?: boolean;
  mirrored?: boolean;
}) => {
  const activeClass = animandoTransicion ? 'sw-leaf-active' : '';

  return (
    <svg
      role="img"
      aria-hidden="true"
      focusable="false"
      width="88"
      viewBox="0 0 88 900"
      preserveAspectRatio="xMinYMin meet"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '88px',
        height: '100%',
        overflow: 'visible',
        transform: mirrored ? 'scaleX(-1)' : undefined,
        transformOrigin: mirrored ? '44px 0' : undefined,
      }}
    >
      {/* Grupo A — Zona muy alta (y: 20–150) */}
      <g className={`plant-enter-1 ${activeClass}`}>
        <path d="M-12 30 Q18 45 42 55" stroke="#1e3a5f" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.7" />
        <g className={`sw-leaf-1 ${activeClass}`} style={{ willChange: 'transform' }}>
          <ellipse cx="44" cy="52" rx="22" ry="10" fill="#0f6e56" opacity="0.70" transform="rotate(25 44 52)" />
          <ellipse cx="44" cy="52" rx="15" ry="5.5" fill="#1D9E75" opacity="0.45" transform="rotate(25 44 52)" />
          <line x1="-12" y1="30" x2="60" y2="58" stroke="#085041" strokeWidth="1" opacity="0.5" />
        </g>
        <path d="M-8 85 Q22 95 46 88" stroke="#1e3a5f" strokeWidth="1.3" strokeLinecap="round" fill="none" opacity="0.65" />
        <g className={`sw-leaf-3 ${activeClass}`} style={{ willChange: 'transform' }}>
          <ellipse cx="48" cy="85" rx="18" ry="7.5" fill="#1D9E75" opacity="0.55" transform="rotate(-15 48 85)" />
          <ellipse cx="48" cy="85" rx="12" ry="4" fill="#4ade80" opacity="0.20" transform="rotate(-15 48 85)" />
          <line x1="-8" y1="85" x2="62" y2="82" stroke="#085041" strokeWidth="0.8" opacity="0.4" />
        </g>
        <path d="M-10 130 Q20 138 42 128" stroke="#1e3a5f" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.6" />
        <g className={`sw-leaf-5 ${activeClass}`} style={{ willChange: 'transform' }}>
          <ellipse cx="44" cy="125" rx="15" ry="6.5" fill="#0f6e56" opacity="0.55" transform="rotate(-20 44 125)" />
          <ellipse cx="44" cy="125" rx="10" ry="3.5" fill="#1D9E75" opacity="0.35" transform="rotate(-20 44 125)" />
          <line x1="-10" y1="130" x2="54" y2="122" stroke="#085041" strokeWidth="0.8" opacity="0.4" />
        </g>
      </g>

      {/* Grupo B — Zona alta (y: 180–300) */}
      <g className={`plant-enter-2 ${activeClass}`} style={{ opacity: 0.55 }}>
        <path d="M-14 190 Q20 205 48 212" stroke="#1e3a5f" strokeWidth="1.4" strokeLinecap="round" fill="none" opacity="0.7" />
        <g className={`sw-leaf-2 ${activeClass}`} style={{ willChange: 'transform' }}>
          <ellipse cx="50" cy="210" rx="24" ry="10" fill="#0f6e56" opacity="0.65" transform="rotate(18 50 210)" />
          <ellipse cx="50" cy="210" rx="16" ry="5.5" fill="#1D9E75" opacity="0.4" transform="rotate(18 50 210)" />
          <line x1="-14" y1="190" x2="68" y2="215" stroke="#085041" strokeWidth="1" opacity="0.5" />
        </g>
        <circle cx="62" cy="222" r="3" fill="#4ade80" opacity="0.55" />
        <circle cx="62" cy="222" r="1.5" fill="#0a0f1a" opacity="0.70" />

        <path d="M-6 255 Q24 268 52 260" stroke="#1e3a5f" strokeWidth="1.3" strokeLinecap="round" fill="none" opacity="0.65" />
        <g className={`sw-leaf-4 ${activeClass}`} style={{ willChange: 'transform' }}>
          <ellipse cx="54" cy="257" rx="20" ry="8" fill="#1D9E75" opacity="0.5" transform="rotate(-12 54 257)" />
          <ellipse cx="54" cy="257" rx="13" ry="4.5" fill="#4ade80" opacity="0.25" transform="rotate(-12 54 257)" />
          <line x1="-6" y1="255" x2="68" y2="252" stroke="#085041" strokeWidth="0.8" opacity="0.45" />
        </g>
        <circle cx="58" cy="270" r="2.5" fill="#4ade80" opacity="0.5" />
        <circle cx="58" cy="270" r="1.2" fill="#0a0f1a" opacity="0.70" />

        <path d="M-12 295 Q18 305 40 298" stroke="#1e3a5f" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.6" />
        <g className={`sw-leaf-6 ${activeClass}`} style={{ willChange: 'transform' }}>
          <ellipse cx="42" cy="295" rx="16" ry="6.5" fill="#0f6e56" opacity="0.55" transform="rotate(-22 42 295)" />
          <ellipse cx="42" cy="295" rx="11" ry="3.5" fill="#1D9E75" opacity="0.35" transform="rotate(-22 42 295)" />
        </g>
      </g>

      {/* Grupo C — Zona media alta (y: 330–450) */}
      <g className={`plant-enter-2 ${activeClass}`}>
        <path d="M-10 340 Q22 355 50 362" stroke="#1e3a5f" strokeWidth="1.3" strokeLinecap="round" fill="none" opacity="0.65" />
        <g className={`sw-leaf-1 ${activeClass}`} style={{ willChange: 'transform' }}>
          <ellipse cx="52" cy="360" rx="22" ry="9" fill="#0f6e56" opacity="0.6" transform="rotate(20 52 360)" />
          <ellipse cx="52" cy="360" rx="14" ry="5" fill="#1D9E75" opacity="0.4" transform="rotate(20 52 360)" />
          <line x1="-10" y1="340" x2="70" y2="365" stroke="#085041" strokeWidth="0.9" opacity="0.45" />
        </g>
        <circle cx="65" cy="372" r="2.5" fill="#4ade80" opacity="0.5" />
        <circle cx="65" cy="372" r="1.2" fill="#0a0f1a" opacity="0.70" />

        {/* Rama que sale del borde derecho (x > 88) */}
        <path d="M-4 395 Q38 410 84 402" stroke="#1e3a5f" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.6" />
        <g className={`sw-leaf-3 ${activeClass}`} style={{ willChange: 'transform' }}>
          <ellipse cx="86" cy="398" rx="18" ry="7" fill="#1D9E75" opacity="0.45" transform="rotate(25 86 398)" />
          <ellipse cx="86" cy="398" rx="11" ry="4" fill="#4ade80" opacity="0.2" transform="rotate(25 86 398)" />
        </g>

        <path d="M-12 425 Q14 435 36 428" stroke="#1e3a5f" strokeWidth="1.1" strokeLinecap="round" fill="none" opacity="0.55" />
        <g className={`sw-leaf-5 ${activeClass}`} style={{ willChange: 'transform' }}>
          <ellipse cx="38" cy="425" rx="14" ry="5.5" fill="#0f6e56" opacity="0.5" transform="rotate(-18 38 425)" />
          <ellipse cx="38" cy="425" rx="9" ry="3" fill="#1D9E75" opacity="0.3" transform="rotate(-18 38 425)" />
        </g>
      </g>

      {/* Grupo D — Zona media baja (y: 480–600) */}
      <g className={`plant-enter-2 ${activeClass}`} style={{ opacity: 0.5 }}>
        <path d="M-12 490 Q20 505 48 512" stroke="#1e3a5f" strokeWidth="1.3" strokeLinecap="round" fill="none" opacity="0.65" />
        <g className={`sw-leaf-2 ${activeClass}`} style={{ willChange: 'transform' }}>
          <ellipse cx="50" cy="510" rx="22" ry="9" fill="#0f6e56" opacity="0.6" transform="rotate(15 50 510)" />
          <ellipse cx="50" cy="510" rx="15" ry="5" fill="#1D9E75" opacity="0.4" transform="rotate(15 50 510)" />
          <line x1="-12" y1="490" x2="68" y2="515" stroke="#085041" strokeWidth="0.9" opacity="0.45" />
        </g>
        <circle cx="64" cy="522" r="2.5" fill="#4ade80" opacity="0.5" />
        <circle cx="64" cy="522" r="1.2" fill="#0a0f1a" opacity="0.70" />

        <path d="M-8 550 Q28 565 56 558" stroke="#1e3a5f" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.6" />
        <g className={`sw-leaf-4 ${activeClass}`} style={{ willChange: 'transform' }}>
          <ellipse cx="58" cy="555" rx="18" ry="7" fill="#1D9E75" opacity="0.45" transform="rotate(20 58 555)" />
          <ellipse cx="58" cy="555" rx="12" ry="4" fill="#4ade80" opacity="0.25" transform="rotate(20 58 555)" />
        </g>

        <path d="M-6 585 Q16 595 34 590" stroke="#1e3a5f" strokeWidth="1.1" strokeLinecap="round" fill="none" opacity="0.55" />
        <g className={`sw-leaf-6 ${activeClass}`} style={{ willChange: 'transform' }}>
          <ellipse cx="36" cy="587" rx="14" ry="5.5" fill="#0f6e56" opacity="0.45" transform="rotate(-15 36 587)" />
          <ellipse cx="36" cy="587" rx="9" ry="3" fill="#1D9E75" opacity="0.3" transform="rotate(-15 36 587)" />
        </g>
      </g>

      {/* Grupo E — Zona baja (y: 630–750) */}
      <g className={`plant-enter-3 ${activeClass}`}>
        <path d="M-10 640 Q18 655 40 662" stroke="#1e3a5f" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.6" />
        <g className={`sw-leaf-1 ${activeClass}`} style={{ willChange: 'transform' }}>
          <ellipse cx="42" cy="660" rx="20" ry="8" fill="#0f6e56" opacity="0.55" transform="rotate(18 42 660)" />
          <ellipse cx="42" cy="660" rx="13" ry="4.5" fill="#1D9E75" opacity="0.35" transform="rotate(18 42 660)" />
          <line x1="-10" y1="640" x2="56" y2="665" stroke="#085041" strokeWidth="0.8" opacity="0.4" />
        </g>
        <circle cx="56" cy="672" r="2.5" fill="#4ade80" opacity="0.5" />
        <circle cx="56" cy="672" r="1.2" fill="#0a0f1a" opacity="0.70" />

        <path d="M-6 700 Q24 715 50 708" stroke="#1e3a5f" strokeWidth="1.1" strokeLinecap="round" fill="none" opacity="0.55" />
        <g className={`sw-leaf-3 ${activeClass}`} style={{ willChange: 'transform' }}>
          <ellipse cx="52" cy="705" rx="16" ry="6.5" fill="#1D9E75" opacity="0.4" transform="rotate(-12 52 705)" />
          <ellipse cx="52" cy="705" rx="10" ry="3.5" fill="#4ade80" opacity="0.2" transform="rotate(-12 52 705)" />
        </g>
      </g>

      {/* Grupo F — Zona muy baja, transición al footer (y: 780–880) */}
      <g className={`plant-enter-3 ${activeClass}`} style={{ opacity: 0.45 }}>
        <path d="M-8 790 Q14 805 30 812" stroke="#1e3a5f" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.5" />
        <g className={`sw-leaf-2 ${activeClass}`} style={{ willChange: 'transform' }}>
          <ellipse cx="32" cy="810" rx="15" ry="5.5" fill="#0f6e56" opacity="0.45" transform="rotate(15 32 810)" />
          <ellipse cx="32" cy="810" rx="10" ry="3" fill="#1D9E75" opacity="0.3" transform="rotate(15 32 810)" />
          <line x1="-8" y1="790" x2="40" y2="815" stroke="#085041" strokeWidth="0.7" opacity="0.4" />
        </g>

        <path d="M-10 850 Q16 862 38 858" stroke="#1e3a5f" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.45" />
        <g className={`sw-leaf-4 ${activeClass}`} style={{ willChange: 'transform' }}>
          <ellipse cx="40" cy="855" rx="13" ry="5" fill="#0f6e56" opacity="0.4" transform="rotate(-10 40 855)" />
          <ellipse cx="40" cy="855" rx="8" ry="2.5" fill="#4ade80" opacity="0.2" transform="rotate(-10 40 855)" />
        </g>
      </g>
    </svg>
  );
});

HojasIzquierda.displayName = 'HojasIzquierda';