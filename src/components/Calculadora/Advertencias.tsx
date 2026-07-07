import type { Advertencia as AdvertenciaType } from '../../lib/calculos/index';
import { Alert } from '../ui/Alert';

interface AdvertenciasProps {
  advertencias: AdvertenciaType[];
}

export function Advertencias({ advertencias }: AdvertenciasProps) {
  if (advertencias.length === 0) return null;

  return (
    <div className="mt-4 space-y-1">
      <h3 className="mb-1 text-sm font-semibold text-slate-600 dark:text-slate-300">Advertencias</h3>
      {advertencias.map((a, i) => (
        <Alert key={i} severity={a.severidad}>
          <span className="font-medium">{a.codigo}:</span> {a.mensaje}
        </Alert>
      ))}
    </div>
  );
}
