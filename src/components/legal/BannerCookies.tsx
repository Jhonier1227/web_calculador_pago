import { useState } from 'react';
import type { Seccion } from '../../hooks/useNavigation';

interface BannerCookiesProps {
  onAceptar: () => void;
  onRechazar: () => void;
  onCambiarSeccion: (s: Seccion) => void;
}

export function BannerCookies({ onAceptar, onRechazar, onCambiarSeccion }: BannerCookiesProps) {
  const [visible, setVisible] = useState(() => !localStorage.getItem('cookieConsent'));

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-labelledby="cookie-banner-title"
      aria-describedby="cookie-banner-desc"
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-700/50 bg-slate-900 px-4 py-3 shadow-2xl md:px-8"
    >
      <div className="mx-auto flex max-w-2xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1">
          <h2 id="cookie-banner-title" className="text-sm font-semibold text-slate-200">
            Uso de cookies
          </h2>
          <p id="cookie-banner-desc" className="mt-1 text-xs leading-relaxed text-slate-400">
            Esta herramienta usa cookies analíticas de Google para medir el uso del sitio
            (páginas visitadas, tiempo de sesión, país). No recolectamos datos personales
            ni información de tus cálculos. ¿Aceptas el uso de cookies analíticas?
          </p>
          <button
            type="button"
            onClick={() => {
              onCambiarSeccion('privacidad');
              setVisible(false);
            }}
            className="mt-1.5 text-xs text-emerald-400 underline underline-offset-2 hover:text-emerald-300"
          >
            Ver política de privacidad
          </button>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:gap-2">
          <button
            type="button"
            onClick={() => {
              onRechazar();
              setVisible(false);
            }}
            className="rounded-lg border border-slate-600 px-4 py-2 text-xs font-medium text-slate-300 transition-colors hover:bg-slate-800"
          >
            Rechazar
          </button>
          <button
            type="button"
            onClick={() => {
              onAceptar();
              setVisible(false);
            }}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-emerald-500"
          >
            Aceptar
          </button>
        </div>
      </div>
      <div className="h-16 md:hidden" aria-hidden="true" />
    </div>
  );
}