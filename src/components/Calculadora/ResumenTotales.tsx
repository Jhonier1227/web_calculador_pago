import type { ResumenTipo } from '../../lib/calculos/index';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';

interface ResumenTotalesProps {
  resumen: ResumenTipo[];
}

export function ResumenTotales({ resumen }: ResumenTotalesProps) {
  if (resumen.length === 0) return null;

  return (
    <div className="mt-4">
      <h3 className="mb-2 text-sm font-semibold text-slate-600 dark:text-slate-300">Resumen por tipo</h3>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {resumen.map((r) => (
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
    </div>
  );
}
