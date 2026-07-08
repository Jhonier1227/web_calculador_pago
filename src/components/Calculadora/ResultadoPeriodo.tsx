import type { ResultadoPeriodo as ResultadoPeriodoType } from '../../lib/calculos/index';
import { ResumenTotales } from './ResumenTotales';
import { Advertencias } from './Advertencias';
import { Alert } from '../ui/Alert';

interface ResultadoPeriodoProps {
  resultado: ResultadoPeriodoType;
  auxilioTransporte?: number;
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

          <ResumenTotales resumen={resultado.resumenPorTipo} />

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
