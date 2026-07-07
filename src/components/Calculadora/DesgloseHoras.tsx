import type { HoraCalculada } from '../../lib/calculos/index';
import { Badge } from '../ui/Badge';

interface DesgloseHorasProps {
  horas: HoraCalculada[];
}

export function DesgloseHoras({ horas }: DesgloseHorasProps) {
  if (horas.length === 0) return null;

  return (
    <div className="mt-4 overflow-x-auto">
      <h3 className="mb-2 text-sm font-semibold text-slate-600 dark:text-slate-300">Desglose por hora</h3>
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-slate-200 text-left dark:border-slate-700">
            <th scope="col" className="pb-1 pr-2 font-medium text-slate-500">Hora</th>
            <th scope="col" className="pb-1 pr-2 font-medium text-slate-500">Día</th>
            <th scope="col" className="pb-1 pr-2 font-medium text-slate-500">Tipo</th>
            <th scope="col" className="pb-1 pr-2 font-medium text-slate-500">Noche</th>
            <th scope="col" className="pb-1 pr-2 font-medium text-slate-500">Festivo</th>
            <th scope="col" className="pb-1 pr-2 font-medium text-slate-500">Jornada</th>
            <th scope="col" className="pb-1 font-medium text-slate-500">Valor</th>
          </tr>
        </thead>
        <tbody>
          {horas.map((h, i) => (
            <tr key={i} className="border-b border-slate-100 dark:border-slate-800">
              <td className="py-1.5 pr-2 font-mono text-slate-600 dark:text-slate-300">
                {h.horaInicio.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: false })}
              </td>
              <td className="py-1.5 pr-2 text-slate-500">
                {h.horaInicio.toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric', month: 'short' })}
              </td>
              <td className="py-1.5 pr-2">
                <Badge tipo={h.tipoHora} />
              </td>
              <td className="py-1.5 pr-2 text-slate-500">{h.esNocturna ? '🌙' : ''}</td>
              <td className="py-1.5 pr-2 text-slate-500">{h.esFestivo ? '🔴' : ''}</td>
              <td className="py-1.5 pr-2 text-slate-500">{h.dentroDeJornada ? '✔' : ''}</td>
              <td className="py-1.5 font-mono text-slate-600 dark:text-slate-300">
                ${h.valorHora.toLocaleString('es-CO')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
