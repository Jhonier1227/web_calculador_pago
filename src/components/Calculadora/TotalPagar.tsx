import { CopyIcon } from '../ui/Icons';

interface TotalPagarProps {
  totalRecargos: number;
  totalReferencial: number;
  auxilioTransporte: number;
  horasOrdinarias?: number;
  horasExtra?: number;
  horasNocturnas?: number;
  horasDominicalesFestivas?: number;
}

export function TotalPagar({
  totalRecargos,
  totalReferencial,
  auxilioTransporte,
  horasOrdinarias,
  horasExtra,
  horasNocturnas,
  horasDominicalesFestivas,
}: TotalPagarProps) {
  const handleCopiarRecargos = () => {
    navigator.clipboard.writeText(`$${totalRecargos.toLocaleString('es-CO')}`);
  };

  const handleCopiarTotal = () => {
    navigator.clipboard.writeText(`$${totalReferencial.toLocaleString('es-CO')}`);
  };

  return (
    <div className="space-y-4">
      {/* BLOQUE 1 — Recargos y horas extra (el cálculo principal) */}
      <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 dark:border-emerald-900/50 dark:bg-emerald-950/20">
        <p className="text-sm text-emerald-700 dark:text-emerald-400 font-medium">
          Recargos y horas extra
        </p>
        <p className="mt-1 text-4xl font-bold text-emerald-600 dark:text-emerald-400">
          ${totalRecargos.toLocaleString('es-CO')}
        </p>
        {(horasOrdinarias !== undefined || horasExtra !== undefined || horasNocturnas !== undefined || horasDominicalesFestivas !== undefined) && (
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {horasOrdinarias !== undefined && (
              <div className="rounded-lg border border-slate-200 bg-white p-2 text-center dark:border-slate-700 dark:bg-slate-800">
                <p className="text-xs text-slate-500 dark:text-slate-400">Ordinarias</p>
                <p className="text-lg font-bold text-slate-700 dark:text-slate-200">{horasOrdinarias}h</p>
              </div>
            )}
            {horasExtra !== undefined && (
              <div className="rounded-lg border border-slate-200 bg-white p-2 text-center dark:border-slate-700 dark:bg-slate-800">
                <p className="text-xs text-slate-500 dark:text-slate-400">Extra</p>
                <p className="text-lg font-bold text-amber-600 dark:text-amber-400">{horasExtra}h</p>
              </div>
            )}
            {horasNocturnas !== undefined && (
              <div className="rounded-lg border border-slate-200 bg-white p-2 text-center dark:border-slate-700 dark:bg-slate-800">
                <p className="text-xs text-slate-500 dark:text-slate-400">Nocturnas</p>
                <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">{horasNocturnas}h</p>
              </div>
            )}
            {horasDominicalesFestivas !== undefined && (
              <div className="rounded-lg border border-slate-200 bg-white p-2 text-center dark:border-slate-700 dark:bg-slate-800">
                <p className="text-xs text-slate-500 dark:text-slate-400">Dominicales/Festivas</p>
                <p className="text-lg font-bold text-rose-600 dark:text-rose-400">{horasDominicalesFestivas}h</p>
              </div>
            )}
          </div>
        )}
        <button
          type="button"
          onClick={handleCopiarRecargos}
          aria-label="Copiar recargos al portapapeles"
          className="mt-3 inline-flex items-center gap-1 text-xs text-emerald-600 underline hover:text-emerald-500 dark:text-emerald-500 dark:hover:text-emerald-400"
        >
          <CopyIcon className="h-3.5 w-3.5" />
          Copiar recargos
        </button>
      </div>

      {/* BLOQUE 2 — Referencia adicional (solo si auxilio > 0) */}
      {auxilioTransporte > 0 && (
        <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4 dark:border-blue-900/50 dark:bg-blue-950/20">
          <div className="flex items-start gap-2">
            <span className="text-blue-400 text-lg leading-none mt-0.5" aria-hidden="true">📋</span>
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-700 dark:text-blue-400">
                Referencia de pago completo
              </p>
              <div className="mt-2 space-y-1.5 text-sm">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Recargos calculados:</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    ${totalRecargos.toLocaleString('es-CO')}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Auxilio de transporte:</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    ${auxilioTransporte.toLocaleString('es-CO')}
                  </span>
                </div>
                <div className="border-t border-blue-200 pt-1.5 flex justify-between">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Total referencial:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    ${totalReferencial.toLocaleString('es-CO')}
                  </span>
                </div>
              </div>
              <p className="mt-2 text-xs text-blue-600 dark:text-blue-500">
                ⚠️ El auxilio no hace parte del cálculo de recargos — se muestra como referencia
              </p>
              <button
                type="button"
                onClick={handleCopiarTotal}
                aria-label="Copiar total referencial al portapapeles"
                className="mt-3 inline-flex items-center gap-1 text-xs text-blue-600 underline hover:text-blue-500 dark:text-blue-500 dark:hover:text-blue-400"
              >
                <CopyIcon className="h-3.5 w-3.5" />
                Copiar total referencial
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}