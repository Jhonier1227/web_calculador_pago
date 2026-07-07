import { Alert } from '../ui/Alert';

export function NotaLimitaciones() {
  return (
    <div className="mt-4 space-y-2">
      <Alert severity="info">
        Esta calculadora valida solo el límite diario de horas extra (máx 2h/día).
        El límite semanal de 12h extra no se valida en esta versión.
      </Alert>
      <p className="text-center text-xs text-slate-600">
        No incluye prestaciones sociales, seguridad social, ni provisiones.
        Consulta con un contador para cálculos formales de nómina.
      </p>
    </div>
  );
}
