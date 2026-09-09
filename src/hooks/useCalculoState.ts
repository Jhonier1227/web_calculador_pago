import { useCallback, useState } from 'react';
import { useCalculo } from './useCalculo';
import { calcularPeriodo } from '../lib/calculos/index';
import type { JornadaPactada, Turno, ConfiguracionPeriodo, ResultadoPeriodo as ResultadoPeriodoType } from '../lib/calculos/index';
import { trackEvent } from '../lib/analytics';

export function useCalculoState(
  salario: number,
  jornada: JornadaPactada,
  auxilio: number,
  turno: Turno,
  tipoJornada: 'estandar' | 'rotativo',
  diasDescanso: number[],
  horasPactadasDiarias: number | '',
  minutosDescanso: number
) {
  const { resultado, error, calcular } = useCalculo();
  const [periodoResultado, setPeriodoResultado] = useState<ResultadoPeriodoType | null>(null);

  const handleCalcular = useCallback(() => {
    // Convertir string vacío a null para el motor
    const horasPactadasParaMotor = horasPactadasDiarias === '' ? null : horasPactadasDiarias;
    calcular(salario, jornada, turno, auxilio || undefined, tipoJornada, diasDescanso, horasPactadasParaMotor, minutosDescanso);
  }, [calcular, salario, jornada, turno, auxilio, tipoJornada, diasDescanso, horasPactadasDiarias, minutosDescanso]);

  const handleCalcularPeriodo = useCallback(
    (config: ConfiguracionPeriodo) => {
      setPeriodoResultado(null);
      const res = calcularPeriodo(salario, jornada, config, auxilio || undefined);
      setPeriodoResultado(res);
      trackEvent('calcular_periodo', { salario, dias_en_rango: res.diasCalculados, bloques: config.bloques.length });
    },
    [salario, jornada, auxilio],
  );

  return {
    resultado,
    error,
    periodoResultado,
    handleCalcular,
    handleCalcularPeriodo,
    setPeriodoResultado,
  };
}