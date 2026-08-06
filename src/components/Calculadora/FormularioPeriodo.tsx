import { useState, useMemo } from 'react';
import { validarConfiguracionPeriodo } from '../../lib/calculos/index';
import type { ConfiguracionPeriodo, BloqueHorario } from '../../lib/calculos/index';
import { validarFechaNoAnterior } from '../../lib/validaciones/validarInputs';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Alert';
import { PlusIcon, TrashIcon } from '../ui/Icons';

function formatearDiasActivos(horariosPorDia: BloqueHorario['horariosPorDia']): string {
  const diasActivos = Object.keys(horariosPorDia)
    .map(Number)
    .filter((d) => horariosPorDia[d])
    .sort((a, b) => a - b);
  if (diasActivos.length === 0) return 'Sin días';
  if (diasActivos.length === 7) return 'Todos';
  if (
    diasActivos.length >= 3 &&
    diasActivos.every((d, i) => i === 0 || d === diasActivos[i - 1] + 1)
  ) {
    return `${diaLabels[diasActivos[0]]}-${diaLabels[diasActivos[diasActivos.length - 1]]}`;
  }
  return diasActivos.map((d) => diaLabels[d]).join(', ');
}

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
    tipoJornada: 'estandar',
    diaDescanso: 0,
  };
}

function calcFinMes(inicio: string): string {
  const [y, m] = inicio.split('-').map(Number);
  return `${y}-${String(m).padStart(2, '0')}-${new Date(y, m, 0).getDate()}`;
}

function ajustarHorario(horario: { inicio: string; fin: string }, minutosDescanso: number): { inicio: string; fin: string } {
  if (minutosDescanso === 0) return horario;
  const [hFin, mFin] = horario.fin.split(':').map(Number);
  const totalMinutos = hFin * 60 + mFin - minutosDescanso;
  if (totalMinutos < 0) return horario;
  const horas = Math.floor(totalMinutos / 60);
  const minutos = totalMinutos % 60;
  return { ...horario, fin: `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}` };
}

function ajustarBloque(bloque: BloqueHorario, minutosDescanso: number): BloqueHorario {
  if (minutosDescanso === 0) return bloque;
  const horariosPorDia: Record<number, { inicio: string; fin: string }> = {};
  for (const [dia, horario] of Object.entries(bloque.horariosPorDia)) {
    horariosPorDia[Number(dia)] = ajustarHorario(horario, minutosDescanso);
  }
  return { ...bloque, horariosPorDia };
}

interface FormularioPeriodoProps {
  onCalcular: (config: ConfiguracionPeriodo) => void;
}

export function FormularioPeriodo({ onCalcular }: FormularioPeriodoProps) {
  const today = hoy();
  const [fechaInicio, setFechaInicio] = useState(today);
  const [fechaFin, setFechaFin] = useState(calcFinMes(today));
  const [bloques, setBloques] = useState<BloqueHorario[]>(() => [defaultBloque(today, calcFinMes(today))]);
  const [descansoPorBloque, setDescansoPorBloque] = useState<number[]>([0]);

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

  const updateTipoJornadaBloque = (bloqueIndex: number, tipoJornada: 'estandar' | 'rotativo') => {
    setBloques((prev) =>
      prev.map((b, i) =>
        i === bloqueIndex ? { ...b, tipoJornada, diaDescanso: tipoJornada === 'estandar' ? 0 : b.diaDescanso } : b,
      ),
    );
  };

  const updateDiaDescansoBloque = (bloqueIndex: number, diaDescanso: number) => {
    setBloques((prev) =>
      prev.map((b, i) => (i === bloqueIndex ? { ...b, diaDescanso } : b)),
    );
  };

  const updateDescansoBloque = (bloqueIndex: number, valor: number) => {
    setDescansoPorBloque((prev) =>
      prev.map((v, i) => (i === bloqueIndex ? valor : v)),
    );
  };

  const agregarBloque = () => {
    setBloques((prev) => {
      const ultimo = prev[prev.length - 1];
      const nuevo = defaultBloque(fechaInicio, fechaFin);
      if (ultimo) {
        nuevo.horariosPorDia = { ...ultimo.horariosPorDia };
        nuevo.tipoJornada = ultimo.tipoJornada;
        nuevo.diaDescanso = ultimo.diaDescanso;
      }
      return [...prev, nuevo];
    });
    setDescansoPorBloque((prev) => [...prev, 0]);
  };

  const eliminarBloque = (bloqueIndex: number) => {
    setBloques((prev) => prev.filter((_, i) => i !== bloqueIndex));
    setDescansoPorBloque((prev) => prev.filter((_, i) => i !== bloqueIndex));
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
    const bloquesAjustados = bloques.map((b, i) => ajustarBloque(b, descansoPorBloque[i] ?? 0));
    onCalcular({ fechaInicio, fechaFin, bloques: bloquesAjustados });
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
          {(() => {
            const f = new Date(fechaInicio + 'T12:00:00');
            const aviso = validarFechaNoAnterior(f);
            if (aviso.mensaje) {
              return <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">{aviso.mensaje}</p>;
            }
            return null;
          })()}
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
          {(() => {
            const f = new Date(fechaFin + 'T12:00:00');
            const aviso = validarFechaNoAnterior(f);
            if (aviso.mensaje) {
              return <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">{aviso.mensaje}</p>;
            }
            return null;
          })()}
        </div>
      </div>

      <div className="mb-4 space-y-4">
        <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Bloques de horario</p>
        {bloques.map((bloque, i) => (
          <div key={bloque.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-900/50">
            <div className="mb-3 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Bloque {i + 1}</span>
                <span className="text-xs text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20 px-2 py-0.5 rounded">
                  {formatearDiasActivos(bloque.horariosPorDia)}
                </span>
              </div>
              <div className="flex items-center gap-2">
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

            {/* Selector de tipo de jornada */}
            <div className="mb-4 flex flex-col gap-2">
              <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                Tipo de jornada
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => updateTipoJornadaBloque(i, 'estandar')}
                  className={`flex-1 rounded-lg border px-3 py-2 text-sm transition-all ${
                    bloque.tipoJornada === 'estandar'
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:border-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
                      : 'border-slate-300 bg-white text-slate-500 hover:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400'
                  }`}
                >
                  Jornada estándar
                  <span className="mt-0.5 block text-xs opacity-60">Descanso el domingo</span>
                </button>
                <button
                  type="button"
                  onClick={() => updateTipoJornadaBloque(i, 'rotativo')}
                  className={`flex-1 rounded-lg border px-3 py-2 text-sm transition-all ${
                    bloque.tipoJornada === 'rotativo'
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:border-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
                      : 'border-slate-300 bg-white text-slate-500 hover:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400'
                  }`}
                >
                  Turno rotativo
                  <span className="mt-0.5 block text-xs opacity-60">Elegir día de descanso</span>
                </button>
              </div>
              {bloque.tipoJornada === 'rotativo' && (
                <div className="flex flex-col gap-1">
                  <label htmlFor={`dia-descanso-${i}`} className="text-xs text-slate-400">
                    ¿Cuál es tu día de descanso semanal?
                  </label>
                  <select
                    id={`dia-descanso-${i}`}
                    value={bloque.diaDescanso}
                    onChange={(e) => updateDiaDescansoBloque(i, Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  >
                    <option value={0}>Domingo</option>
                    <option value={1}>Lunes</option>
                    <option value={2}>Martes</option>
                    <option value={3}>Miércoles</option>
                    <option value={4}>Jueves</option>
                    <option value={5}>Viernes</option>
                    <option value={6}>Sábado</option>
                  </select>
                </div>
              )}
              <p className="text-xs text-slate-500">
                El recargo dominical aplica sobre el día de descanso obligatorio pactado, no necesariamente el domingo (Art. 179 CST).
              </p>
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

            {/* Descanso por bloque */}
            <div className="mt-3 flex flex-col gap-1">
              <label htmlFor={`descanso-bloque-${i}`} className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Descanso (almuerzo u otro)
              </label>
              <select
                id={`descanso-bloque-${i}`}
                value={descansoPorBloque[i] ?? 0}
                onChange={(e) => updateDescansoBloque(i, Number(e.target.value))}
                className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              >
                <option value={0}>Sin descanso (0 min)</option>
                <option value={15}>15 minutos</option>
                <option value={30}>30 minutos</option>
                <option value={45}>45 minutos</option>
                <option value={60}>1 hora (60 min)</option>
                <option value={90}>1 hora 30 min (90 min)</option>
              </select>
            </div>
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
