interface PropPageProps {
  onVolver: () => void;
}

const secciones = [
  {
    titulo: 'Propósito de la herramienta',
    contenido: `Esta calculadora es una herramienta informativa que facilita la estimación
del pago de horas extra, recargos nocturnos, dominicales y festivos según
la legislación laboral colombiana vigente (CST, Ley 2101 de 2021,
Ley 2466 de 2025).`,
  },
  {
    titulo: 'Sin asesoría legal',
    contenido: `Los resultados de esta herramienta son estimativos y no constituyen asesoría
legal, contable ni laboral. Para situaciones específicas, consulta con un
abogado laboralista o contador certificado.`,
  },
  {
    titulo: 'Exactitud de los cálculos',
    contenido: `Hacemos nuestro mejor esfuerzo para mantener los cálculos actualizados con
la legislación vigente. Sin embargo, no garantizamos que los resultados sean
exactos en todos los casos. El usuario es responsable de verificar los
resultados con su empleador o asesor.`,
  },
  {
    titulo: 'Sin responsabilidad por decisiones',
    contenido: `SoftwareJM no se hace responsable de decisiones tomadas con base en los
resultados de esta calculadora.`,
  },
  {
    titulo: 'Propiedad intelectual',
    contenido: `El código fuente, diseño y lógica de esta herramienta son propiedad de
Jhonier Stiven Montaño Castillo — SoftwareJM. Todos los derechos reservados.
Uso no autorizado está estrictamente prohibido.`,
  },
  {
    titulo: 'Ley aplicable',
    contenido: `Estos términos se rigen por las leyes de la República de Colombia.`,
  },
  {
    titulo: 'Contacto',
    contenido: `Para preguntas sobre estos términos: jhonisoftware@gmail.com`,
  },
];

export function Terminos({ onVolver }: PropPageProps) {
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
          Términos y Condiciones
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
      </div>
    </div>
  );
}