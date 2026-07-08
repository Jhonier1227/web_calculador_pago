import { useState, useMemo } from 'react';
import { validarConfiguracionPeriodo } from '../../lib/calculos/index';
import type { ConfiguracionPeriodo, BloqueHorario } from '../../lib/calculos/index';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Alert';
import { PlusIcon, TrashIcon } from '../ui/Icons';

const diaLabels: Record<number, string> = {
  1: 'Lun', 2: 'Mar', 3: 'Mié', 4: 'Jue', 5: 'Vie', 6: 'Sáb', 7: 'Dom',
};

function hoy() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function defaultBloque(inicio: string, fin: string): BloqueHorario {
  return {
    id: `bloque-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    fechaInicio: inicio,
    fechaFin: fin,
    horariosPorDia: {
      1: { inicio: '08:00', fin: '17:00' },
      2: { inicio: '08:00', fin: '17:00' },
      3: { inicio: '08:00', fin: '17:00' },
      4: { inicio: '08:00', fin: '17:00' },
      5: { inicio: '08:00', fin: '17:00' },
    },
  };
}

function calcFinMes(inicio: string): string {
  const [y, m] = inicio.split('-').map(Number);
  return `${y}-${String(m).padStart(2, '0')}-${new Date(y, m, 0).getDate()}`;
}

interface FormularioPeriodoProps {
  onCalcular: (config: ConfiguracionPeriodo) => void;
}

export function FormularioPeriodo({ onCalcular }: FormularioPeriodoProps) {
  const today = hoy();
  const [fechaInicio, setFechaInicio] = useState(today);
  const [fechaFin, setFechaFin] = useState(calcFinMes(today));
  const [bloques, setBloques] = useState<BloqueHorario[]>(() => [defaultBloque(today, calcFinMes(today))]);

  const toggleDia = (bloqueIndex: number, d: number) => {
    setBloques((prev) =>
      prev.map((b, i) => {
        if (i !== bloqueIndex) return b;
        const next = { ...b.horariosPorDia };
        if (next[d]) {
          delete next[d];
          return { ...b, horariosPorDia: next };
        }
        return { ...b, horariosPorDia: { ...next, [d]: { inicio: '08:00', fin: '17:00' } } };
      }),
    );
  };

  const updateHorarioBloque = (bloqueIndex: number, dia: number, campo: 'inicio' | 'fin', valor: string) => {
    setBloques((prev) =>
      prev.map((b, i) => {
        if (i !== bloqueIndex) return b;
        const actual = b.horariosPorDia[dia] ?? { inicio: '08:00', fin: '17:00' };
        return {
          ...b,
          horariosPorDia: { ...b.horariosPorDia, [dia]: { ...actual, [campo]: valor } },
        };
      }),
    );
  };

  const updateBloqueFecha = (bloqueIndex: number, campo: 'fechaInicio' | 'fechaFin', valor: string) => {
    setBloques((prev) =>
      prev.map((b, i) => (i === bloqueIndex ? { ...b, [campo]: valor } : b)),
    );
  };

  const agregarBloque = () => {
    setBloques((prev) => [...prev, defaultBloque(fechaInicio, fechaFin)]);
  };

  const eliminarBloque = (bloqueIndex: number) => {
    setBloques((prev) => prev.filter((_, i) => i !== bloqueIndex));
  };

  const config: ConfiguracionPeriodo = useMemo(
    () => ({ fechaInicio, fechaFin, bloques }),
    [fechaInicio, fechaFin, bloques],
  );

  const errores = useMemo(() => validarConfiguracionPeriodo(config), [config]);
  const erroresBloqueantes = errores.filter((e) => e.severidad === 'error');
  const warnings = errores.filter((e) => e.severidad === 'warning' || e.severidad === 'info');
  const puedeCalcular = erroresBloqueantes.length === 0 && bloques.length > 0;

  const handleCalcular = () => {
    if (!puedeCalcular) return;
    onCalcular(config);
  };

  return (
    <section className="mb-8">
      <h2 className="mb-3 text-lg font-semibold text-emerald-600 dark:text-emerald-400">Período a calcular</h2>

      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="periodo-inicio" className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">
            Fecha de inicio
          </label>
          <input
            id="periodo-inicio"
            type="date"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
        </div>
        <div>
          <label htmlFor="periodo-fin" className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">
            Fecha de fin
          </label>
          <input
            id="periodo-fin"
            type="date"
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
        </div>
      </div>

      <div className="mb-4 space-y-4">
        <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Bloques de horario</p>
        {bloques.map((bloque, i) => (
          <div key={bloque.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-900/50">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Bloque {i + 1}</span>
              {bloques.length > 1 && (
                <button
                  type="button"
                  onClick={() => eliminarBloque(i)}
                  aria-label={`Eliminar bloque ${i + 1}`}
                  className="inline-flex items-center gap-1 text-xs text-red-500 hover:text-red-400"
                >
                  <TrashIcon className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Eliminar</span>
                </button>
              )}
            </div>

            <div className="mb-3 grid gap-2 sm:grid-cols-2">
              <div>
                <label htmlFor={`bloque-${i}-inicio`} className="mb-0.5 block text-xs text-slate-500 dark:text-slate-400">Desde</label>
                <input
                  id={`bloque-${i}-inicio`}
                  type="date"
                  value={bloque.fechaInicio}
                  onChange={(e) => updateBloqueFecha(i, 'fechaInicio', e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label htmlFor={`bloque-${i}-fin`} className="mb-0.5 block text-xs text-slate-500 dark:text-slate-400">Hasta</label>
                <input
                  id={`bloque-${i}-fin`}
                  type="date"
                  value={bloque.fechaFin}
                  onChange={(e) => updateBloqueFecha(i, 'fechaFin', e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="mb-2 flex flex-wrap gap-1.5">
              {[1, 2, 3, 4, 5, 6, 7].map((d) => {
                const activo = !!bloque.horariosPorDia[d];
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => toggleDia(i, d)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                      activo
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
                    }`}
                  >
                    {diaLabels[d]}
                  </button>
                );
              })}
            </div>

            {[1, 2, 3, 4, 5, 6, 7].map((d) => {
              if (!bloque.horariosPorDia[d]) return null;
              const inicioId = `bloque-${i}-dia-${d}-inicio`;
              const finId = `bloque-${i}-dia-${d}-fin`;
              return (
                <div key={d} className="mb-1 flex items-center gap-2">
                  <span className="w-8 text-xs font-medium text-slate-600 dark:text-slate-300">{diaLabels[d]}</span>
                  <label htmlFor={inicioId} className="sr-only">{diaLabels[d]} inicio</label>
                  <input
                    id={inicioId}
                    type="time"
                    value={bloque.horariosPorDia[d].inicio}
                    onChange={(e) => updateHorarioBloque(i, d, 'inicio', e.target.value)}
                    className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                  <span className="text-xs text-slate-400 dark:text-slate-500" aria-hidden="true">a</span>
                  <label htmlFor={finId} className="sr-only">{diaLabels[d]} fin</label>
                  <input
                    id={finId}
                    type="time"
                    value={bloque.horariosPorDia[d].fin}
                    onChange={(e) => updateHorarioBloque(i, d, 'fin', e.target.value)}
                    className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                </div>
              );
            })}
          </div>
        ))}

        <Button variant="ghost" size="sm" onClick={agregarBloque}>
          <PlusIcon className="mr-1 h-3.5 w-3.5" />
          Añadir bloque
        </Button>
      </div>

      {erroresBloqueantes.map((e, i) => (
        <Alert key={i} severity="error">{e.mensaje}</Alert>
      ))}
      {warnings.map((w, i) => (
        <Alert key={i} severity="warning">{w.mensaje}</Alert>
      ))}

      <Button
        onClick={handleCalcular}
        disabled={!puedeCalcular}
        className="mt-4 w-full sm:w-auto"
        size="lg"
      >
        Calcular período
      </Button>
    </section>
  );
}
