interface PropPageProps {
  onVolver: () => void;
}

const secciones = [
  {
    titulo: '¿Qué datos recolectamos?',
    contenido: `Esta herramienta NO recolecta datos personales. Los valores que ingresas
(salario, horarios, fechas) se procesan únicamente en tu navegador y nunca
se envían a ningún servidor.`,
  },
  {
    titulo: 'Cookies analíticas (Google Tag Manager)',
    contenido: `Si aceptas las cookies, usamos Google Tag Manager y Google Analytics para
recolectar datos anónimos de uso: páginas visitadas, tiempo en el sitio,
país de origen y tipo de dispositivo. Esta información nos ayuda a mejorar
la herramienta. No se asocia a ninguna identidad personal.

Si rechazas las cookies, Google Analytics no se activa y no se recolecta
ningún dato de tu visita.`,
  },
  {
    titulo: 'Base legal (Ley 1581 de 2012 — Colombia)',
    contenido: `El tratamiento de datos analíticos anónimos se realiza con base en tu
consentimiento explícito, que puedes revocar en cualquier momento limpiando
las cookies de tu navegador o visitando esta página y cambiando tu preferencia.`,
  },
  {
    titulo: '¿Quién es el responsable?',
    contenido: `Jhonier Stiven Montaño Castillo
Empresa: SoftwareJM
Contacto: jhonisoftware@gmail.com`,
  },
  {
    titulo: 'Cambios a esta política',
    contenido: `Cualquier cambio será publicado en esta misma página con la fecha de
actualización correspondiente.`,
  },
];

export function Privacidad({ onVolver }: PropPageProps) {
  return (
    <div className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-8">
        <button
          type="button"
          onClick={onVolver}
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-emerald-600 transition-colors hover:text-emerald-500 dark:text-emerald-400 dark:hover:text-emerald-300"
        >
          <span aria-hidden="true">←</span> Volver a la calculadora
        </button>

        <h1 className="mb-1 text-2xl font-bold text-slate-900 dark:text-emerald-400 sm:text-3xl">
          Política de Privacidad
        </h1>
        <p className="mb-8 text-sm text-slate-500 dark:text-slate-400">
          Calculadora de Horas Extra Colombia — Última actualización: septiembre de 2026
        </p>

        <div className="space-y-8">
          {secciones.map((s) => (
            <div key={s.titulo}>
              <h2 className="mb-2 text-base font-semibold text-slate-800 dark:text-slate-200">
                {s.titulo}
              </h2>
              <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400 whitespace-pre-line">
                {s.contenido}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-10 border-t border-slate-200 pt-6 dark:border-slate-800">
          <button
            type="button"
            onClick={() => {
              localStorage.removeItem('cookieConsent');
              window.location.reload();
            }}
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Cambiar mi preferencia de cookies
          </button>
        </div>
      </div>
    </div>
  );
}