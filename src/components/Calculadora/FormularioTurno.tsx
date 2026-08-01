import { useMemo } from 'react';
import { validarTurno } from '../../lib/calculos/index';
import type { Turno } from '../../lib/calculos/index';
import { validarFechaNoAnterior } from '../../lib/validaciones/validarInputs';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Alert';
import { PlusIcon, TrashIcon, ClockIcon } from '../ui/Icons';

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
  minutosDescanso: number;
  onMinutosDescansoChange: (v: number) => void;
  tipoJornada: 'estandar' | 'rotativo';
  onTipoJornadaChange: (v: 'estandar' | 'rotativo') => void;
  diaDescanso: number;
  onDiaDescansoChange: (v: number) => void;
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
  minutosDescanso,
  onMinutosDescansoChange,
  tipoJornada,
  onTipoJornadaChange,
  diaDescanso,
  onDiaDescansoChange,
}: FormularioTurnoProps) {
  const errores = useMemo(() => validarTurno(turno), [turno]);
  const erroresBloqueantes = errores.filter((a) => a.severidad === 'error');
  const info = errores.filter((a) => a.severidad === 'info');

  const puedeCalcular = jornadaValida && erroresBloqueantes.length === 0;
  const cruzaMedianoche = franjas.some((f) => f.fin < f.inicio);

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
        {(() => {
          const f = new Date(fecha + 'T12:00:00');
          const aviso = validarFechaNoAnterior(f);
          if (aviso.mensaje) {
            return (
              <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">{aviso.mensaje}</p>
            );
          }
          return null;
        })()}
      </div>

      {cruzaMedianoche && (
        <Alert severity="info">
          <ClockIcon className="mr-1 inline h-3.5 w-3.5 align-text-bottom" />
          Turno cruza medianoche. Cada hora se clasifica según su día calendario real.
        </Alert>
      )}

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
                  className="inline-flex items-center gap-1 text-xs text-red-500 hover:text-red-400"
                >
                  <TrashIcon className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Eliminar</span>
                </button>
              )}
            </div>
          );
        })}
        {franjas.length < 4 && (
          <Button variant="ghost" size="sm" onClick={onAgregarFranja}>
            <PlusIcon className="mr-1 h-3.5 w-3.5" />
            Añadir franja
          </Button>
        )}
      </div>

      {/* Selector de tipo de jornada */}
      <div className="mb-4 flex flex-col gap-2">
        <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
          Tipo de jornada
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onTipoJornadaChange('estandar')}
            className={`flex-1 rounded-lg border px-3 py-2 text-sm transition-all ${
              tipoJornada === 'estandar'
                ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:border-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
                : 'border-slate-300 bg-white text-slate-500 hover:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400'
            }`}
          >
            Jornada estándar
            <span className="mt-0.5 block text-xs opacity-60">Descanso el domingo</span>
          </button>
          <button
            type="button"
            onClick={() => onTipoJornadaChange('rotativo')}
            className={`flex-1 rounded-lg border px-3 py-2 text-sm transition-all ${
              tipoJornada === 'rotativo'
                ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:border-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
                : 'border-slate-300 bg-white text-slate-500 hover:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400'
            }`}
          >
            Turno rotativo
            <span className="mt-0.5 block text-xs opacity-60">Elegir día de descanso</span>
          </button>
        </div>
        {tipoJornada === 'rotativo' && (
          <div className="flex flex-col gap-1">
            <label htmlFor="dia-descanso-turno" className="text-xs text-slate-400">
              ¿Cuál es tu día de descanso semanal?
            </label>
            <select
              id="dia-descanso-turno"
              value={diaDescanso}
              onChange={(e) => onDiaDescansoChange(Number(e.target.value))}
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

      {/* Campo de descanso */}
      <div className="mb-4 flex flex-col gap-1">
        <label htmlFor="descanso-turno" className="text-sm font-medium text-slate-600 dark:text-slate-300">
          Descanso (almuerzo u otro)
        </label>
        <select
          id="descanso-turno"
          value={minutosDescanso}
          onChange={(e) => onMinutosDescansoChange(Number(e.target.value))}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
        >
          <option value={0}>Sin descanso (0 min)</option>
          <option value={15}>15 minutos</option>
          <option value={30}>30 minutos</option>
          <option value={45}>45 minutos</option>
          <option value={60}>1 hora (60 min)</option>
          <option value={90}>1 hora 30 min (90 min)</option>
        </select>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Se descuenta del total trabajado — Art. 167 CST
        </p>
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
