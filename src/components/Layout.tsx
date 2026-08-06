import type { ReactNode } from 'react';
import { SunIcon, MoonIcon, ClockIcon, CalendarIcon, CalculatorIcon } from './ui/Icons';
import { NavBar } from './NavBar';
import { UpdatePrompt } from './ui/UpdatePrompt';
import { HojasIzquierda, HojasDerecha, MacetaIzquierda, MacetaDerecha } from './decoracion';

type Seccion = 'turno' | 'periodo' | 'calculadora';

interface LayoutProps {
  children: ReactNode;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  seccionActiva: Seccion;
  onCambiarSeccion: (s: Seccion) => void;
  animando: boolean;
}

const items: { id: Seccion; label: string; Icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'turno', label: 'Turno', Icon: ClockIcon },
  { id: 'periodo', label: 'Período', Icon: CalendarIcon },
  { id: 'calculadora', label: 'Calculadora', Icon: CalculatorIcon },
];

export function Layout({ children, theme, onToggleTheme, seccionActiva, onCambiarSeccion, animando }: LayoutProps) {
  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-emerald-600 focus:px-4 focus:py-2 focus:text-white"
      >
        Saltar al contenido principal
      </a>
      <div className="flex min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        {/* Laterales decorativos — solo desktop */}
        <aside
          className="relative hidden shrink-0 md:block"
          style={{ width: '88px', alignSelf: 'stretch' }}
          aria-hidden="true"
          tabIndex={-1}
        >
          <HojasIzquierda animandoTransicion={animando} />
        </aside>

        {/* Contenido principal */}
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="mx-auto w-full max-w-4xl px-4 pb-16 pt-4 sm:px-8 md:pb-0">
            <header className="mb-6 flex items-start justify-between md:mb-4">
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

            {/* Tabs de navegación — solo desktop */}
            <nav className="mb-8 hidden gap-2 md:flex" aria-label="Secciones">
              {items.map(({ id, label, Icon }) => (
                <button
                  key={id}
                  onClick={() => onCambiarSeccion(id)}
                  className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                    seccionActiva === id
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
            </nav>

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

          {/* Macetas decorativas — emergen desde el borde inferior */}
          <footer className="relative h-0 overflow-visible" aria-hidden="true" tabIndex={-1}>
            <div className="mx-auto hidden w-full max-w-4xl items-end justify-between px-4 md:flex" style={{ marginTop: '-130px' }}>
              <MacetaIzquierda />
              <MacetaDerecha />
            </div>
          </footer>
        </div>

        {/* Lateral decorativo derecho — solo desktop */}
        <aside
          className="relative hidden shrink-0 md:block"
          style={{ width: '88px', alignSelf: 'stretch' }}
          aria-hidden="true"
          tabIndex={-1}
        >
          <HojasDerecha animandoTransicion={animando} />
        </aside>

        <NavBar activa={seccionActiva} onChange={onCambiarSeccion} />
        <UpdatePrompt />
      </div>
    </>
  );
}
