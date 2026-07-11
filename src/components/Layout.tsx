import type { ReactNode } from 'react';
import { SunIcon, MoonIcon } from './ui/Icons';
import { NavBar } from './NavBar';

type Seccion = 'turno' | 'periodo' | 'calculadora';

interface LayoutProps {
  children: ReactNode;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  seccionActiva: Seccion;
  onCambiarSeccion: (s: Seccion) => void;
}

export function Layout({ children, theme, onToggleTheme, seccionActiva, onCambiarSeccion }: LayoutProps) {
  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-emerald-600 focus:px-4 focus:py-2 focus:text-white"
      >
        Saltar al contenido principal
      </a>
      <div className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        <div className="mx-auto max-w-4xl px-4 pb-16 pt-4 sm:px-8 md:pb-0 md:pr-20">
          <header className="mb-8 flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 sm:text-3xl">
                Calculadora de Horas Extra
              </h1>
              <p className="mt-1 text-sm text-slate-400 dark:text-slate-500">
                Colombia — Legislación 2026
              </p>
            </div>
            <button
              type="button"
              onClick={onToggleTheme}
              aria-label={theme === 'dark' ? 'Activar modo claro' : 'Activar modo oscuro'}
              className="rounded-lg border border-slate-300 bg-slate-100 p-2 text-slate-600 transition-colors hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
            >
              {theme === 'dark' ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
            </button>
          </header>
          <main id="main-content" role="main">
            {children}
          </main>
          <footer className="mt-12 border-t border-slate-200 pt-4 text-center text-xs text-slate-600 dark:border-slate-800 dark:text-slate-400">
            <p>Versión MVP — Solo validación diaria de horas extra.</p>
            <p className="mt-1">
              Esta herramienta no constituye asesoría legal. Verifica con tu
              empleador o un contador.
            </p>
          </footer>
        </div>
      </div>
      <NavBar activa={seccionActiva} onChange={onCambiarSeccion} />
    </>
  );
}
