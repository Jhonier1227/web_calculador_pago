import { useState, useCallback } from 'react';
import { calcularTurno } from '../lib/calculos/index';
import type { JornadaPactada, Turno, ResultadoCalculo } from '../lib/calculos/index';

interface UseCalculoReturn {
  resultado: ResultadoCalculo | null;
  error: string | null;
  loading: boolean;
  calcular: (salario: number, jornada: JornadaPactada, turno: Turno, auxilio?: number) => void;
  reset: () => void;
}

export function useCalculo(): UseCalculoReturn {
  const [resultado, setResultado] = useState<ResultadoCalculo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const calcular = useCallback(
    (salario: number, jornada: JornadaPactada, turno: Turno, auxilio?: number) => {
      setLoading(true);
      setError(null);
      try {
        const res = calcularTurno(salario, jornada, turno, auxilio);
        setResultado(res);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Error inesperado al calcular');
        setResultado(null);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const reset = useCallback(() => {
    setResultado(null);
    setError(null);
    setLoading(false);
  }, []);

  return { resultado, error, loading, calcular, reset };
}
