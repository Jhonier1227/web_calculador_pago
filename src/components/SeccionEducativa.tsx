import { CONSTANTES_2026, RECARGO_PORCENTAJES, LEGAL_LIMITS } from '../lib/calculos/index';
import { Tabs } from './ui/Tabs';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { ChevronDownIcon } from './ui/Icons';
import { TipoHora } from '../lib/calculos/index';

const recargoRows = [
  { tipo: TipoHora.ORDINARIA_DIURNA, desc: 'Ordinaria diurna', recargo: '0%' },
  { tipo: TipoHora.RECARGO_NOCTURNO, desc: 'Recargo nocturno', recargo: `${Math.round(RECARGO_PORCENTAJES.NOCTURNO * 100)}%` },
  { tipo: TipoHora.RECARGO_DOMINICAL_DIURNO, desc: 'Recargo dominical diurno', recargo: `${Math.round(RECARGO_PORCENTAJES.DOMINICAL_FESTIVO_DIURNO * 100)}%` },
  { tipo: TipoHora.RECARGO_DOMINICAL_NOCTURNO, desc: 'Recargo dominical nocturno', recargo: `${Math.round(RECARGO_PORCENTAJES.DOMINICAL_FESTIVO_NOCTURNO * 100)}%` },
  { tipo: TipoHora.EXTRA_DIURNA, desc: 'Extra diurna', recargo: `${Math.round(RECARGO_PORCENTAJES.EXTRA_DIURNA * 100)}%` },
  { tipo: TipoHora.EXTRA_NOCTURNA, desc: 'Extra nocturna', recargo: `${Math.round(RECARGO_PORCENTAJES.EXTRA_NOCTURNA * 100)}%` },
  { tipo: TipoHora.EXTRA_DOMINICAL_DIURNA, desc: 'Extra dominical diurna', recargo: `${Math.round(RECARGO_PORCENTAJES.EXTRA_DOMINICAL_FESTIVA_DIURNA * 100)}%` },
  { tipo: TipoHora.EXTRA_DOMINICAL_NOCTURNA, desc: 'Extra dominical nocturna', recargo: `${Math.round(RECARGO_PORCENTAJES.EXTRA_DOMINICAL_FESTIVA_NOCTURNA * 100)}%` },
];

const faq = [
  {
    q: '¿Cuál es la diferencia entre recargo y hora extra?',
    a: 'Un recargo se aplica cuando trabajas dentro de tu jornada pactada pero en horario nocturno, dominical o festivo. Una hora extra ocurre cuando trabajas FUERA de tu jornada pactada. Las horas extra pueden tener también recargos nocturnos/dominicales.',
  },
  {
    q: '¿Cómo sé si una hora es nocturna?',
    a: `Según la ley colombiana, el horario diurno es de ${CONSTANTES_2026.HORA_INICIO_DIURNA}:00 a ${CONSTANTES_2026.HORA_FIN_DIURNA - 1}:59. El horario nocturno es de ${CONSTANTES_2026.HORA_FIN_DIURNA}:00 a ${CONSTANTES_2026.HORA_INICIO_DIURNA - 1}:59 del día siguiente.`,
  },
  {
    q: '¿Qué dice la Ley Emiliani?',
    a: 'La Ley Emiliani (Ley 51 de 1983) traslada la mayoría de festivos al lunes siguiente para promover el turismo. Festivos como Reyes Magos (6 de enero), San José, Ascensión, Corpus Christi, Sagrado Corazón, San Pedro, Asunción, Día de la Raza, Todos los Santos e Independencia de Cartagena se celebran el lunes más cercano.',
  },
  {
    q: '¿Cuántas horas extra se pueden hacer al día?',
    a: `Máximo ${LEGAL_LIMITS.MAX_HORAS_EXTRA_DIARIAS} horas extra diarias y ${LEGAL_LIMITS.MAX_HORAS_EXTRA_SEMANALES} horas extra a la semana. La jornada máxima semanal es de ${CONSTANTES_2026.JORNADA_SEMANAL_HORAS} horas.`,
  },
  {
    q: '¿El auxilio de transporte afecta el valor de la hora?',
    a: 'No. El auxilio de transporte no es salario, por lo tanto no afecta el valor de la hora ordinaria ni de las horas extra. Solo se suma al total a pagar.',
  },
  {
    q: '¿Por qué el divisor es 210?',
    a: `El divisor mensual de 210 horas corresponde al promedio de horas trabajadas al mes según la ley colombiana (${CONSTANTES_2026.JORNADA_SEMANAL_HORAS} horas semanales × 52 semanas / 12 meses ≈ ${Math.round(CONSTANTES_2026.JORNADA_SEMANAL_HORAS * 52 / 12)}h, redondeado a 210). Se usa para calcular el valor de la hora ordinaria: salario mensual ÷ 210.`,
  },
];

function TablaRecargos() {
  return (
    <div className="w-full overflow-x-auto md:overflow-visible">
      {/* Tabla — desktop */}
      <table className="hidden w-full text-sm md:table">
        <thead>
            <tr className="border-b border-slate-700 text-left text-xs text-slate-600 dark:text-slate-500">
             <th scope="col" className="pb-2 pr-4 font-medium">Tipo</th>
             <th scope="col" className="pb-2 pr-4 font-medium">Descripción</th>
             <th scope="col" className="pb-2 font-medium">Recargo</th>
          </tr>
        </thead>
        <tbody>
          {recargoRows.map((r) => (
            <tr key={r.tipo} className="border-b border-slate-800 last:border-0">
              <td className="py-2 pr-4">
                <Badge tipo={r.tipo} />
              </td>
              <td className="py-2 pr-4 text-slate-700 dark:text-slate-300">{r.desc}</td>
              <td className="py-2 font-mono text-slate-700 dark:text-slate-300">{r.recargo}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Tarjetas — móvil */}
      <div className="flex flex-col gap-3 md:hidden">
        {recargoRows.map((r) => (
          <div key={r.tipo} className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800">
            <div className="mb-2">
              <Badge tipo={r.tipo} />
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500 dark:text-slate-400">Descripción</span>
              <span className="text-right text-slate-800 dark:text-slate-200">{r.desc}</span>
            </div>
            <div className="mt-1 flex justify-between text-sm">
              <span className="text-slate-500 dark:text-slate-400">Recargo</span>
              <span className="font-mono font-medium text-emerald-600 dark:text-emerald-400">{r.recargo}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ComoSeCalcula() {
  return (
    <ol className="list-inside list-decimal space-y-2 text-sm text-slate-700 dark:text-slate-300">
      <li>Se calcula el <strong>valor de la hora ordinaria</strong>: salario mensual ÷ 210.</li>
      <li>Se genera una hora por cada hora del turno (incluyendo cruce de medianoche).</li>
      <li>Por cada hora se determina:
          <ul className="ml-5 mt-1 list-disc space-y-1 text-slate-600 dark:text-slate-400">
          <li><strong>Dentro/fuera</strong> de jornada pactada (día + horario).</li>
          <li><strong>Nocturna</strong> (19:00 - 05:59) o diurna.</li>
          <li><strong>Festivo</strong> (domingo no laborable o festivo nacional).</li>
        </ul>
      </li>
      <li>Con esas 3 condiciones se aplica la <strong>tabla de 8 casos</strong> para determinar el tipo de hora y su recargo.</li>
      <li>El <strong>valor por hora</strong> se calcula como:
          <ul className="ml-5 mt-1 list-disc space-y-1 text-slate-600 dark:text-slate-400">
          <li>Dentro de jornada: <code>valorHoraOrd × recargo</code></li>
          <li>Fuera de jornada: <code>valorHoraOrd × (1 + recargo)</code></li>
        </ul>
      </li>
      <li>Se suman todas las horas y se agrega el auxilio de transporte (si aplica).</li>
    </ol>
  );
}

function RecargoVsExtra() {
  const horaOrd = 8_338;
  return (
    <div className="space-y-3 text-sm">
      <p className="text-slate-700 dark:text-slate-300">
        Con salario mínimo 2026 ($ {CONSTANTES_2026.SALARIO_MINIMO.toLocaleString('es-CO')}):
        <br />
        Valor hora ordinaria = $ {horaOrd.toLocaleString('es-CO')} ({CONSTANTES_2026.SALARIO_MINIMO.toLocaleString('es-CO')} ÷ 210)
      </p>
      <div className="w-full overflow-x-auto md:overflow-visible">
        {/* Tabla — desktop */}
        <table className="hidden w-full text-sm md:table">
          <thead>
            <tr className="border-b border-slate-700 text-left text-xs text-slate-500">
              <th scope="col" className="pb-2 pr-4 font-medium">Situación</th>
              <th scope="col" className="pb-2 pr-4 font-medium">Cálculo</th>
              <th scope="col" className="pb-2 font-medium">Valor por hora</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-slate-800">
              <td className="py-2 pr-4 text-slate-700 dark:text-slate-300">Hora ordinaria diurna</td>
              <td className="py-2 pr-4 font-mono text-slate-600 dark:text-slate-400">$8.338 × 0%</td>
              <td className="py-2 font-mono text-emerald-400">$8.338</td>
            </tr>
            <tr className="border-b border-slate-800">
              <td className="py-2 pr-4 text-slate-700 dark:text-slate-300">Recargo nocturno (35%)</td>
              <td className="py-2 pr-4 font-mono text-slate-600 dark:text-slate-400">$8.338 × 35%</td>
              <td className="py-2 font-mono text-amber-400">$11.257</td>
            </tr>
            <tr className="border-b border-slate-800">
              <td className="py-2 pr-4 text-slate-700 dark:text-slate-300">Extra diurna (25%)</td>
              <td className="py-2 pr-4 font-mono text-slate-600 dark:text-slate-400">$8.338 × (1 + 25%)</td>
              <td className="py-2 font-mono text-amber-400">$10.423</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 text-slate-700 dark:text-slate-300">Extra nocturna (75%)</td>
              <td className="py-2 pr-4 font-mono text-slate-600 dark:text-slate-400">$8.338 × (1 + 75%)</td>
              <td className="py-2 font-mono text-red-400">$14.592</td>
            </tr>
          </tbody>
        </table>

        {/* Tarjetas — móvil */}
        <div className="flex flex-col gap-3 md:hidden">
          {[
            { situacion: 'Hora ordinaria diurna', calculo: '$8.338 × 0%', valor: '$8.338', colorValor: 'text-emerald-600 dark:text-emerald-400' },
            { situacion: 'Recargo nocturno (35%)', calculo: '$8.338 × 35%', valor: '$11.257', colorValor: 'text-amber-600 dark:text-amber-400' },
            { situacion: 'Extra diurna (25%)', calculo: '$8.338 × (1 + 25%)', valor: '$10.423', colorValor: 'text-amber-600 dark:text-amber-400' },
            { situacion: 'Extra nocturna (75%)', calculo: '$8.338 × (1 + 75%)', valor: '$14.592', colorValor: 'text-red-600 dark:text-red-400' },
          ].map((r, i) => (
            <div key={i} className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800">
              <p className="mb-2 font-medium text-slate-800 dark:text-slate-200">{r.situacion}</p>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400">Cálculo</span>
                <span className="font-mono text-slate-600 dark:text-slate-400">{r.calculo}</span>
              </div>
              <div className="mt-1 flex justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400">Valor por hora</span>
                <span className={`font-mono font-medium ${r.colorValor}`}>{r.valor}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <p className="text-xs text-slate-500">
        Los recargos se aplican sobre el valor de la hora ordinaria.
        Las horas extra pagan <strong>1 + recargo</strong> porque incluyen el valor de la hora base.
      </p>
    </div>
  );
}

function LeyEmiliani() {
  return (
    <div className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
      <p>
        La <strong>Ley Emiliani</strong> (Ley 51 de 1983) establece que la mayoría de los festivos
        nacionales se trasladan al lunes siguiente para incentivar el turismo y el descanso.
      </p>
      <p>Festivos que se rigen por esta ley en 2026:</p>
      <ul className="ml-5 list-disc space-y-1 text-slate-600 dark:text-slate-400">
        <li>Reyes Magos (6 ene → lunes 12 ene)</li>
        <li>San José (19 mar → lunes 23 mar)</li>
        <li>Ascensión del Señor (→ lunes 25 may)</li>
        <li>Corpus Christi (→ lunes 8 jun)</li>
        <li>Sagrado Corazón de Jesús (→ lunes 15 jun)</li>
        <li>San Pedro y San Pablo (29 jun → lunes 29 jun)</li>
        <li>Asunción de la Virgen (15 ago → lunes 17 ago)</li>
        <li>Día de la Raza (12 oct → lunes 12 oct)</li>
        <li>Todos los Santos (1 nov → lunes 2 nov)</li>
        <li>Independencia de Cartagena (11 nov → lunes 16 nov)</li>
      </ul>
      <p className="text-xs text-slate-500">
        Festivos fijos (no se trasladan): Año Nuevo (1 ene), Día del Trabajo (1 may),
        Independencia (20 jul), Batalla de Boyacá (7 ago), Inmaculada Concepción (8 dic),
        Navidad (25 dic).
      </p>
    </div>
  );
}

function LimitesLegales() {
  return (
    <div className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
      <ul className="ml-5 list-disc space-y-2">
        <li>
          <strong>Jornada máxima semanal:</strong>{' '}
          {CONSTANTES_2026.JORNADA_SEMANAL_HORAS} horas (art. 161 CST).
        </li>
        <li>
          <strong>Horas extra diarias:</strong> Máximo {LEGAL_LIMITS.MAX_HORAS_EXTRA_DIARIAS} horas.
        </li>
        <li>
          <strong>Horas extra semanales:</strong> Máximo {LEGAL_LIMITS.MAX_HORAS_EXTRA_SEMANALES} horas.
        </li>
        <li>
          <strong>Recargo nocturno:</strong> {Math.round(RECARGO_PORCENTAJES.NOCTURNO * 100)}%
          sobre la hora ordinaria (22:00 a 05:59 antes de la reforma, 19:00 a 05:59 con Ley 2101 de 2021).
        </li>
        <li>
          <strong>Recargo dominical/festivo:</strong> {Math.round(RECARGO_PORCENTAJES.DOMINICAL_FESTIVO_DIURNO * 100)}%
          sobre la hora ordinaria.
        </li>
        <li>
          <strong>Salario mínimo 2026:</strong> $ {CONSTANTES_2026.SALARIO_MINIMO.toLocaleString('es-CO')} mensuales.
        </li>
      </ul>
    </div>
  );
}

function FAQ() {
  return (
    <div className="space-y-3">
      {faq.map((item, i) => (
        <details key={i} className="group rounded-lg border border-slate-800">
          <summary className="cursor-pointer px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:text-emerald-400 dark:text-slate-300 [&::-webkit-details-marker]:hidden">
            <span className="flex items-center gap-2">
              <span className="text-xs text-emerald-500">{i + 1}.</span>
              <span className="flex-1">{item.q}</span>
              <ChevronDownIcon className="h-4 w-4 text-slate-500 transition-transform group-open:rotate-180" />
            </span>
          </summary>
          <p className="border-t border-slate-800 px-3 py-2 text-sm text-slate-600 dark:text-slate-400">
            {item.a}
          </p>
        </details>
      ))}
    </div>
  );
}

export function SeccionEducativa() {
  const tabs = [
    { id: 'como-se-calcula', label: 'Cómo se calcula', content: <ComoSeCalcula /> },
    { id: 'tabla-recargos', label: 'Tabla de recargos', content: <TablaRecargos /> },
    { id: 'recargo-vs-extra', label: 'Recargo vs Extra', content: <RecargoVsExtra /> },
    { id: 'ley-emiliani', label: 'Ley Emiliani', content: <LeyEmiliani /> },
    { id: 'limites', label: 'Límites legales', content: <LimitesLegales /> },
    { id: 'faq', label: 'Preguntas frecuentes', content: <FAQ /> },
  ];

  return (
    <section>
      <h2 className="mb-4 text-lg font-semibold text-emerald-400">
        Cómo funciona el cálculo
      </h2>
      <Card>
        <Tabs tabs={tabs} />
      </Card>
    </section>
  );
}
