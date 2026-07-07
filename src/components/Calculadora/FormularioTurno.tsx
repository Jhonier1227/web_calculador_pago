import { useMemo } from 'react';
import { validarTurno } from '../../lib/calculos/index';
import type { Turno } from '../../lib/calculos/index';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Alert';

interface FormularioTurnoProps {
  fecha: string;
  franjas: { inicio: string; fin: string }[];
  onFechaChange: (v: string) => void;
  onFranjaChange: (i: number, campo: 'inicio' | 'fin', valor: string) => void;
  onAgregarFranja: () => void;
  onEliminarFranja: (i: number) => void;
  turno: Turno;
  onCalcular: () => void;
  jornadaValida: boolean;
}

export function FormularioTurno({
  fecha,
  franjas,
  onFechaChange,
  onFranjaChange,
  onAgregarFranja,
  onEliminarFranja,
  turno,
  onCalcular,
  jornadaValida,
}: FormularioTurnoProps) {
  const errores = useMemo(() => validarTurno(turno), [turno]);
  const erroresBloqueantes = errores.filter((a) => a.severidad === 'error');
  const info = errores.filter((a) => a.severidad === 'info');

  const puedeCalcular = jornadaValida && erroresBloqueantes.length === 0;

  return (
    <section className="mb-8">
      <h2 className="mb-3 text-lg font-semibold text-emerald-600 dark:text-emerald-400">Turno a calcular</h2>

      <div className="mb-4">
        <label htmlFor="fecha-turno" className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">
          Fecha del turno
        </label>
        <input
          id="fecha-turno"
          type="date"
          value={fecha}
          onChange={(e) => onFechaChange(e.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
        />
      </div>

      <div className="mb-4 space-y-2">
        <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Franjas horarias</p>
        {franjas.map((f, i) => {
          const inicioId = `turno-inicio-${i}`;
          const finId = `turno-fin-${i}`;
          return (
            <div key={i} className="flex flex-wrap items-center gap-2">
              <label htmlFor={inicioId} className="sr-only">Franja {i + 1} inicio</label>
              <input
                id={inicioId}
                type="time"
                value={f.inicio}
                onChange={(e) => onFranjaChange(i, 'inicio', e.target.value)}
                className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
              <span className="text-slate-400 dark:text-slate-500" aria-hidden="true">a</span>
              <label htmlFor={finId} className="sr-only">Franja {i + 1} fin</label>
              <input
                id={finId}
                type="time"
                value={f.fin}
                onChange={(e) => onFranjaChange(i, 'fin', e.target.value)}
                className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
              {franjas.length > 1 && (
                <button
                  type="button"
                  onClick={() => onEliminarFranja(i)}
                  aria-label={`Eliminar franja ${i + 1}`}
                  className="text-xs text-red-500 hover:text-red-400"
                >
                  Eliminar
                </button>
              )}
            </div>
          );
        })}
        {franjas.length < 4 && (
          <Button variant="ghost" size="sm" onClick={onAgregarFranja}>
            + Añadir franja
          </Button>
        )}
      </div>

      {erroresBloqueantes.map((e, i) => (
        <Alert key={i} severity="error">{e.mensaje}</Alert>
      ))}
      {info.map((a, i) => (
        <Alert key={i} severity="info">{a.mensaje}</Alert>
      ))}

      <Button
        onClick={onCalcular}
        disabled={!puedeCalcular}
        className="mt-4 w-full sm:w-auto"
        size="lg"
      >
        Calcular
      </Button>
    </section>
  );
}
