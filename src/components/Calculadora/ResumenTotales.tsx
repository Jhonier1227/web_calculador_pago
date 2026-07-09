import type { ResumenTipo, DetalleDominicalFestivo } from '../../lib/calculos/index';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';

const TIPOS_DOMINICALES = new Set([
  'RECARGO_DOMINICAL_DIURNO',
  'RECARGO_DOMINICAL_NOCTURNO',
  'EXTRA_DOMINICAL_DIURNA',
  'EXTRA_DOMINICAL_NOCTURNA',
]);

interface ResumenTotalesProps {
  resumen: ResumenTipo[];
  detalleDominicalFestivo?: DetalleDominicalFestivo[];
}

function formatearFechaLocal(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const fecha = new Date(y, m - 1, d);
  return fecha.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

export function ResumenTotales({ resumen, detalleDominicalFestivo }: ResumenTotalesProps) {
  if (resumen.length === 0) return null;

  const resumenNoDominical = resumen.filter((r) => !TIPOS_DOMINICALES.has(r.tipoHora));
  const totalDominicales = resumen.filter((r) => TIPOS_DOMINICALES.has(r.tipoHora));

  return (
    <div className="mt-4">
      <h3 className="mb-2 text-sm font-semibold text-slate-600 dark:text-slate-300">Resumen por tipo</h3>

      {resumenNoDominical.length > 0 && (
        <div className="mb-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {resumenNoDominical.map((r) => (
            <Card key={r.tipoHora}>
              <div className="flex items-center justify-between">
                <Badge tipo={r.tipoHora} />
                <span className="text-lg font-bold text-slate-700 dark:text-slate-200">
                  ${r.valorTotal.toLocaleString('es-CO')}
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                {r.cantidadHoras}h × recargo {Math.round(r.recargoPromedio * 100)}%
              </p>
            </Card>
          ))}
        </div>
      )}

      {detalleDominicalFestivo && detalleDominicalFestivo.length > 0 && (
        <div className="rounded-lg border border-rose-200 bg-white p-3 dark:border-rose-900 dark:bg-slate-800">
          <div className="mb-2 flex items-center justify-between">
            <Badge tipo="RECARGO_DOMINICAL_DIURNO" />
          </div>
          <div className="space-y-1.5">
            {detalleDominicalFestivo.map((dd, i) => (
              <div key={i} className="flex items-center justify-between rounded bg-rose-50/50 px-2 py-1.5 text-xs dark:bg-rose-950/20">
                <div className="flex flex-col">
                  <span className="font-medium text-slate-700 dark:text-slate-200">
                    {dd.motivo.esDomingo && dd.motivo.nombreFestivo
                      ? `Domingo · ${dd.motivo.nombreFestivo}`
                      : dd.motivo.nombreFestivo || 'Domingo'}
                  </span>
                  <span className="text-slate-400">{formatearFechaLocal(dd.fecha)}</span>
                </div>
                <div className="text-right">
                  <span className="font-semibold text-slate-700 dark:text-slate-200">
                    ${dd.valorTotal.toLocaleString('es-CO')}
                  </span>
                  <span className="ml-2 text-slate-400">
                    {dd.cantidadHoras}h × {Math.round(dd.recargoPromedio * 100)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
          {totalDominicales.length > 0 && (
            <p className="mt-2 text-center text-xs font-medium text-rose-600 dark:text-rose-400">
              Total dominicales/festivas:{' '}
              {totalDominicales.reduce((s, r) => s + r.cantidadHoras, 0)}h → $
              {totalDominicales.reduce((s, r) => s + r.valorTotal, 0).toLocaleString('es-CO')}
            </p>
          )}
        </div>
      )}

      {totalDominicales.length > 0 && (!detalleDominicalFestivo || detalleDominicalFestivo.length === 0) && (
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {totalDominicales.map((r) => (
            <Card key={r.tipoHora}>
              <div className="flex items-center justify-between">
                <Badge tipo={r.tipoHora} />
                <span className="text-lg font-bold text-slate-700 dark:text-slate-200">
                  ${r.valorTotal.toLocaleString('es-CO')}
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                {r.cantidadHoras}h × recargo {Math.round(r.recargoPromedio * 100)}%
              </p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
