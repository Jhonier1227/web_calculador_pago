import { useMemo } from 'react';
import { validarJornadaPactada } from '../../lib/calculos/index';
import type { JornadaPactada } from '../../lib/calculos/index';
import { Alert } from '../ui/Alert';

const diaLabels: Record<number, string> = {
  1: 'Lun', 2: 'Mar', 3: 'Mié', 4: 'Jue', 5: 'Vie', 6: 'Sáb', 7: 'Dom',
  0: 'Dom',
};

interface FormularioJornadaProps {
  dias: number[];
  horarios: Record<number, { inicio: string; fin: string }>;
  onToggleDia: (d: number) => void;
  onUpdateHorario: (dia: number, campo: 'inicio' | 'fin', valor: string) => void;
  jornada: JornadaPactada;
  tipoJornada: 'estandar' | 'rotativo';
  diasDescanso: number[];
  minutosDescanso: number;
  onMinutosDescansoChange: (v: number) => void;
  horasPactadasDiarias: number | '';
  onHorasPactadasDiariasChange: (v: number | '') => void;
}

export function FormularioJornada({ dias, horarios, onToggleDia, onUpdateHorario, jornada, tipoJornada, diasDescanso, minutosDescanso, onMinutosDescansoChange, horasPactadasDiarias, onHorasPactadasDiariasChange }: FormularioJornadaProps) {
  const errores = useMemo(() => validarJornadaPactada(jornada), [jornada]);
  const erroresBloqueantes = errores.filter((a) => a.severidad === 'error');
  const warnings = errores.filter((a) => a.severidad === 'warning');

  const diaDescansoPrimero = diasDescanso[0] ?? 0;

  // Calcular horas brutas y efectivas por semana
  const horasBrutasSemana = useMemo(() => {
    return dias.reduce((sum, d) => {
      const h = horarios[d];
      if (!h) return sum;
      const [hi, mi] = h.inicio.split(':').map(Number);
      const [hf, mf] = h.fin.split(':').map(Number);
      let diff = hf * 60 + mf - (hi * 60 + mi);
      if (diff <= 0) diff += 24 * 60;
      return sum + diff / 60;
    }, 0);
  }, [dias, horarios]);

  const horasEfectivasSemana = useMemo(() => {
    if (minutosDescanso <= 0) return horasBrutasSemana;
    const minutosTotalesDescanso = minutosDescanso * dias.length;
    const horasEfectivas = horasBrutasSemana - minutosTotalesDescanso / 60;
    return Math.max(0, horasEfectivas);
  }, [horasBrutasSemana, minutosDescanso, dias.length]);

  return (
    <section className="mb-8">
      <h2 className="mb-3 text-lg font-semibold text-emerald-600 dark:text-emerald-400">Jornada pactada</h2>
      <p className="mb-3 text-xs text-slate-400 dark:text-slate-500">
        Selecciona los días que trabajas habitualmente y tu horario por día.
      </p>

      <div className="mb-4 p-3 rounded-lg bg-blue-950/30 border border-blue-800/40">
        <div className="flex items-start gap-2">
          <span className="text-blue-400 text-lg leading-none mt-0.5">ℹ️</span>
          <p className="text-xs text-blue-300 leading-relaxed">
            <strong>Referencial.</strong> Si tienes un acuerdo escrito con tu
            empleador de trabajar menos de 8h diarias, indícalo aquí. De lo
            contrario, se usará el máximo legal de 8h.
          </p>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-2 opacity-70">
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
          <div key={d} className="mb-2 flex items-center gap-2 opacity-70">
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

      {/* Selector de descanso (almuerzo) */}
      <div className="mb-4 flex flex-col gap-1">
        <label htmlFor="descanso-jornada" className="text-sm font-medium text-slate-600 dark:text-slate-300">
          Descanso diario (almuerzo u otro)
        </label>
        <select
          id="descanso-jornada"
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
          Se descuenta de las horas efectivas — Art. 167 CST
        </p>
      </div>

      {/* Horas diarias pactadas (opcional) */}
      <div className="mb-4 flex flex-col gap-1">
        <label htmlFor="horas-pactadas-diarias" className="text-sm font-medium text-slate-600 dark:text-slate-300">
          Horas diarias pactadas (opcional)
        </label>
        <input
          id="horas-pactadas-diarias"
          type="number"
          min="4"
          max="8"
          step="0.5"
          value={horasPactadasDiarias}
          onChange={(e) => onHorasPactadasDiariasChange(e.target.value === '' ? '' : Number(e.target.value))}
          placeholder="8 (máximo legal)"
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
        />
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Si no lo llenas, se usarán 8h como límite ordinario diario
        </p>
      </div>

      <div className="mt-3 space-y-1">
        {erroresBloqueantes.map((e, i) => (
          <Alert key={i} severity="error">{e.mensaje}</Alert>
        ))}
        {warnings.map((w, i) => (
          <Alert key={i} severity="warning">{w.mensaje}</Alert>
        ))}
        {dias.length > 0 && erroresBloqueantes.length === 0 && (
          <>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Horas brutas/semana:{' '}
              <span className="font-medium text-slate-600 dark:text-slate-300">
                {horasBrutasSemana}
                h
              </span>
              {minutosDescanso > 0 && (
                <>
                  {' · '}
                  Horas efectivas:{' '}
                  <span className="font-medium text-emerald-400">
                    {horasEfectivasSemana.toFixed(1)}
                    h
                  </span>
                  {' '}
                  <span className="text-slate-500">
                    (descontando {minutosDescanso} min/día)
                  </span>
                </>
              )}
              {dias.some((d) => d === 7) && (
                <span className="ml-2 text-emerald-600 dark:text-emerald-500">
                  {tipoJornada === 'estandar'
                    ? '(domingo incluido en jornada → sin recargo dominical)'
                    : `(descanso pactado: ${diaLabels[diaDescansoPrimero]} → domingo es día hábil ordinario)`}
                </span>
              )}
              {dias.some((d) => diasDescanso.includes(d)) && tipoJornada === 'rotativo' && diaDescansoPrimero !== 7 && (
                <span className="ml-2 text-emerald-600 dark:text-emerald-500">
                  ({diaLabels[diaDescansoPrimero]} incluido en jornada → sin recargo por descanso obligatorio)
                </span>
              )}
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-500 italic mt-1">
              ℹ️ Este dato es orientativo — no afecta el cálculo de recargos
            </p>
          </>
        )}
      </div>
    </section>
  );
}