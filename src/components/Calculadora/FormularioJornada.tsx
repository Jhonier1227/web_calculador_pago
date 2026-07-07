import { useMemo } from 'react';
import { validarJornadaPactada } from '../../lib/calculos/index';
import type { JornadaPactada } from '../../lib/calculos/index';
import { Alert } from '../ui/Alert';

const diaLabels: Record<number, string> = {
  1: 'Lun', 2: 'Mar', 3: 'Mié', 4: 'Jue', 5: 'Vie', 6: 'Sáb', 7: 'Dom',
};

interface FormularioJornadaProps {
  dias: number[];
  horarios: Record<number, { inicio: string; fin: string }>;
  onToggleDia: (d: number) => void;
  onUpdateHorario: (dia: number, campo: 'inicio' | 'fin', valor: string) => void;
  jornada: JornadaPactada;
}

export function FormularioJornada({ dias, horarios, onToggleDia, onUpdateHorario, jornada }: FormularioJornadaProps) {
  const errores = useMemo(() => validarJornadaPactada(jornada), [jornada]);
  const erroresBloqueantes = errores.filter((a) => a.severidad === 'error');
  const warnings = errores.filter((a) => a.severidad === 'warning');

  return (
    <section className="mb-8">
      <h2 className="mb-3 text-lg font-semibold text-emerald-600 dark:text-emerald-400">Jornada pactada</h2>
      <p className="mb-3 text-xs text-slate-400 dark:text-slate-500">
        Selecciona los días que trabajas habitualmente y tu horario por día.
      </p>

      <div className="mb-4 flex flex-wrap gap-2">
        {[1, 2, 3, 4, 5, 6, 7].map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => onToggleDia(d)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              dias.includes(d)
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
            }`}
          >
            {diaLabels[d]}
          </button>
        ))}
      </div>

      {dias.map((d) => {
        const inicioId = `jornada-inicio-${d}`;
        const finId = `jornada-fin-${d}`;
        return (
          <div key={d} className="mb-2 flex items-center gap-2">
            <span className="w-10 text-sm font-medium text-slate-600 dark:text-slate-300">{diaLabels[d]}</span>
            <label htmlFor={inicioId} className="sr-only">{diaLabels[d]} inicio</label>
            <input
              id={inicioId}
              type="time"
              value={horarios[d]?.inicio ?? '08:00'}
              onChange={(e) => onUpdateHorario(d, 'inicio', e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
            <span className="text-slate-400 dark:text-slate-500" aria-hidden="true">a</span>
            <label htmlFor={finId} className="sr-only">{diaLabels[d]} fin</label>
            <input
              id={finId}
              type="time"
              value={horarios[d]?.fin ?? '17:00'}
              onChange={(e) => onUpdateHorario(d, 'fin', e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
          </div>
        );
      })}

      <div className="mt-3 space-y-1">
        {erroresBloqueantes.map((e, i) => (
          <Alert key={i} severity="error">{e.mensaje}</Alert>
        ))}
        {warnings.map((w, i) => (
          <Alert key={i} severity="warning">{w.mensaje}</Alert>
        ))}
        {dias.length > 0 && erroresBloqueantes.length === 0 && (
          <p className="text-xs text-slate-400 dark:text-slate-500">
            Horas/semana:{' '}
            <span className="font-medium text-slate-600 dark:text-slate-300">
              {dias.reduce((sum, d) => {
                const h = horarios[d];
                if (!h) return sum;
                const [hi, mi] = h.inicio.split(':').map(Number);
                const [hf, mf] = h.fin.split(':').map(Number);
                let diff = hf * 60 + mf - (hi * 60 + mi);
                if (diff <= 0) diff += 24 * 60;
                return sum + diff / 60;
              }, 0)}
              h
            </span>
            {dias.some((d) => d === 7) && (
              <span className="ml-2 text-emerald-600 dark:text-emerald-500">
                (domingo incluido en jornada → sin recargo dominical)
              </span>
            )}
          </p>
        )}
      </div>
    </section>
  );
}
