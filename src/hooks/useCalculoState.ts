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
  diaDescanso: number
) {
  const { resultado, error, calcular } = useCalculo();
  const [periodoResultado, setPeriodoResultado] = useState<ResultadoPeriodoType | null>(null);

  const handleCalcular = useCallback(() => {
    calcular(salario, jornada, turno, auxilio || undefined, tipoJornada, diaDescanso);
  }, [calcular, salario, jornada, turno, auxilio, tipoJornada, diaDescanso]);

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