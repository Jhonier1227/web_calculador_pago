import type { ResultadoPeriodo as ResultadoPeriodoType, ResumenTipo } from '../../lib/calculos/index';
import { ResumenTotales } from './ResumenTotales';
import { Advertencias } from './Advertencias';
import { Alert } from '../ui/Alert';
import { useState } from 'react';
import { ChevronDownIcon } from '../ui/Icons';

interface ResultadoPeriodoProps {
  resultado: ResultadoPeriodoType;
}

function ResumenDetallado({ resumen }: { resumen: ResumenTipo[] }) {
  const [expandido, setExpandido] = useState(false);

  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={() => setExpandido(!expandido)}
        className="w-full flex items-center justify-between text-left p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        aria-expanded={expandido}
      >
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Ver desglose detallado por tipo (COP)
        </span>
        <ChevronDownIcon className={`h-5 w-5 text-slate-500 transition-transform ${expandido ? 'rotate-180' : ''}`} />
      </button>

      {expandido && (
        <div className="mt-2 space-y-2 border-l-2 border-emerald-500 pl-3 ml-2">
          {resumen.map((r) => (
            <div key={r.tipoHora} className="py-1.5 border-b border-slate-100 dark:border-slate-800 last:border-0">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  {r.tipoHora.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase())}
                </span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  ${r.valorTotal.toLocaleString('es-CO')}
                </span>
              </div>
              <div className="text-xs text-slate-500 ml-4">
                {r.cantidadHoras}h × recargo {Math.round(r.recargoPromedio * 100)}%
              </div>
            </div>
          ))}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between text-sm font-semibold">
            <span className="text-slate-700 dark:text-slate-300">Total</span>
            <span className="text-emerald-600 dark:text-emerald-400">
              ${resumen.reduce((s, r) => s + r.valorTotal, 0).toLocaleString('es-CO')}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export function ResultadoPeriodo({ resultado }: ResultadoPeriodoProps) {
  const sinDias = resultado.diasCalculados === 0;

  return (
    <div aria-live="polite" className="mb-8 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
      {sinDias ? (
        <div className="space-y-3">
          <Alert severity="warning">
            No se encontraron días trabajados en el período. Revisa la configuración de los bloques.
          </Alert>
          <p className="text-center text-xs text-slate-500">
            Días omitidos: {resultado.diasOmitidos}
          </p>
        </div>
      ) : (
        <>
          <div className="text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">Total recargos y horas extra del período</p>
            <p className="text-4xl font-bold text-emerald-600 dark:text-emerald-400">
              ${resultado.totalAPagar.toLocaleString('es-CO')}
            </p>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-lg border border-slate-200 bg-white p-3 text-center dark:border-slate-700 dark:bg-slate-800">
              <p className="text-xs text-slate-500 dark:text-slate-400">Ordinarias</p>
              <p className="text-lg font-bold text-slate-700 dark:text-slate-200">{resultado.totalHorasOrdinarias}h</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-3 text-center dark:border-slate-700 dark:bg-slate-800">
              <p className="text-xs text-slate-500 dark:text-slate-400">Extra</p>
              <p className="text-lg font-bold text-amber-600 dark:text-amber-400">{resultado.totalHorasExtras}h</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-3 text-center dark:border-slate-700 dark:bg-slate-800">
              <p className="text-xs text-slate-500 dark:text-slate-400">Nocturnas</p>
              <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">{resultado.totalHorasNocturnas}h</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-3 text-center dark:border-slate-700 dark:bg-slate-800">
              <p className="text-xs text-slate-500 dark:text-slate-400">Dominicales/Festivas</p>
              <p className="text-lg font-bold text-rose-600 dark:text-rose-400">{resultado.totalHorasDominicalesFestivas}h</p>
            </div>
          </div>

          <div className="mt-3 flex justify-center gap-4 text-xs text-slate-500 dark:text-slate-400">
            <span>Días calculados: <strong className="text-slate-700 dark:text-slate-200">{resultado.diasCalculados}</strong></span>
            <span>Días omitidos: <strong className="text-slate-700 dark:text-slate-200">{resultado.diasOmitidos}</strong></span>
          </div>

          <ResumenDetallado resumen={resultado.resumenPorTipo} />

          <ResumenTotales resumen={resultado.resumenPorTipo} detalleDominicalFestivo={resultado.detalleDominicalFestivo} />

          <Advertencias advertencias={resultado.advertencias} />

          <div className="mt-4 space-y-2">
            <Alert severity="info">
              Este cálculo corresponde solo a recargos y horas extra. El salario base del período no está incluido.
            </Alert>
          </div>
        </>
      )}
    </div>
  );
}
