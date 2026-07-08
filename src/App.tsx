import { useState, useMemo, useCallback, useRef } from 'react';
import { CONSTANTES_2026, calcularPeriodo } from './lib/calculos/index';
import type { JornadaPactada, Turno, ConfiguracionPeriodo, ResultadoPeriodo as ResultadoPeriodoType } from './lib/calculos/index';
import { Layout } from './components/Layout';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Tabs } from './components/ui/Tabs';
import { FormularioJornada } from './components/Calculadora/FormularioJornada';
import { FormularioTurno } from './components/Calculadora/FormularioTurno';
import { FormularioPeriodo } from './components/Calculadora/FormularioPeriodo';
import { DesgloseHoras } from './components/Calculadora/DesgloseHoras';
import { ResumenTotales } from './components/Calculadora/ResumenTotales';
import { TotalPagar } from './components/Calculadora/TotalPagar';
import { Advertencias } from './components/Calculadora/Advertencias';
import { NotaLimitaciones } from './components/Calculadora/NotaLimitaciones';
import { ResultadoPeriodo } from './components/Calculadora/ResultadoPeriodo';
import { SeccionEducativa } from './components/SeccionEducativa';
import { useCalculo } from './hooks/useCalculo';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useTheme } from './hooks/useTheme';
import { trackEvent } from './lib/analytics';

export default function App() {
  const { theme, toggle: toggleTheme } = useTheme();
  const handleToggleTheme = useCallback(() => {
    const next = theme === 'dark' ? 'light' : 'dark';
    toggleTheme();
    trackEvent('theme_toggle', { theme: next });
  }, [theme, toggleTheme]);
  const [salario, setSalario] = useLocalStorage<number>('salario', CONSTANTES_2026.SALARIO_MINIMO);
  const [salarioStr, setSalarioStr] = useState(() => salario.toLocaleString('es-CO'));
  const inputRef = useRef<HTMLInputElement>(null);

  const formatearSalario = (n: number) => n.toLocaleString('es-CO');

  const handleSalarioFocus = () => setSalarioStr('');

  const handleSalarioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    const cursor = e.target.selectionStart ?? 0;
    const digitsBefore = e.target.value.slice(0, cursor).replace(/\D/g, '').length;
    const num = raw === '' ? 0 : Number(raw);
    const formatted = raw === '' ? '' : formatearSalario(num);
    setSalario(num);
    setSalarioStr(formatted);
    requestAnimationFrame(() => {
      const el = inputRef.current;
      if (!el) return;
      let pos = 0;
      for (let i = 0, d = 0; i < formatted.length && d < digitsBefore; i++) {
        if (formatted[i] !== '.') d++;
        pos = i + 1;
      }
      el.setSelectionRange(pos, pos);
    });
  };

  const handleSalarioBlur = () => {
    if (salario === 0) {
      setSalario(CONSTANTES_2026.SALARIO_MINIMO);
      setSalarioStr(formatearSalario(CONSTANTES_2026.SALARIO_MINIMO));
    } else {
      setSalarioStr(formatearSalario(salario));
    }
  };

  const [auxilio, setAuxilio] = useState(0);
  const [dias, setDias] = useLocalStorage<number[]>('jornada_dias', [1, 2, 3, 4, 5]);
  const [horarios, setHorarios] = useLocalStorage<Record<number, { inicio: string; fin: string }>>(
    'jornada_horarios',
    {
      1: { inicio: '08:00', fin: '17:00' },
      2: { inicio: '08:00', fin: '17:00' },
      3: { inicio: '08:00', fin: '17:00' },
      4: { inicio: '08:00', fin: '17:00' },
      5: { inicio: '08:00', fin: '17:00' },
    },
  );
  const [fecha, setFecha] = useState(() => new Date().toISOString().slice(0, 10));
  const [franjas, setFranjas] = useState<{ inicio: string; fin: string }[]>([
    { inicio: '18:00', fin: '22:00' },
  ]);
  const { resultado, error, calcular } = useCalculo();
  const [periodoResultado, setPeriodoResultado] = useState<ResultadoPeriodoType | null>(null);

  const toggleDia = useCallback(
    (d: number) => {
      setDias((prev) => {
        if (prev.includes(d)) return prev.filter((x) => x !== d);
        return [...prev, d].sort();
      });
      setHorarios((prev) => {
        if (prev[d]) return prev;
        return { ...prev, [d]: { inicio: '08:00', fin: '17:00' } };
      });
    },
    [setDias, setHorarios],
  );

  const updateHorario = useCallback(
    (dia: number, campo: 'inicio' | 'fin', valor: string) => {
      setHorarios((prev) => ({
        ...prev,
        [dia]: { ...(prev[dia] ?? { inicio: '08:00', fin: '17:00' }), [campo]: valor },
      }));
    },
    [setHorarios],
  );

  const updateFranja = useCallback(
    (i: number, campo: 'inicio' | 'fin', valor: string) => {
      setFranjas((prev) => prev.map((f, idx) => (idx === i ? { ...f, [campo]: valor } : f)));
    },
    [],
  );

  const agregarFranja = useCallback(() => {
    setFranjas((prev) => [...prev, { inicio: '00:00', fin: '00:00' }]);
  }, []);

  const eliminarFranja = useCallback((i: number) => {
    setFranjas((prev) => prev.filter((_, idx) => idx !== i));
  }, []);

  const jornada: JornadaPactada = useMemo(
    () => ({ dias, horariosPorDia: horarios }),
    [dias, horarios],
  );

  const turno: Turno = useMemo(
    () => ({ fecha: new Date(fecha + 'T12:00:00'), franjas }),
    [fecha, franjas],
  );

  const jornadaValida = dias.length > 0;

  const handleCalcular = useCallback(() => {
    calcular(salario, jornada, turno, auxilio || undefined);
    trackEvent('calcular', { salario, jornada_dias: dias.length, franjas: franjas.length });
  }, [calcular, salario, jornada, turno, auxilio, dias, franjas]);

  const handleCalcularPeriodo = useCallback(
    (config: ConfiguracionPeriodo) => {
      setPeriodoResultado(null);
      const res = calcularPeriodo(salario, jornada, config, auxilio || undefined);
      setPeriodoResultado(res);
      trackEvent('calcular_periodo', { salario, dias_en_rango: res.diasCalculados, bloques: config.bloques.length });
    },
    [salario, jornada, auxilio],
  );

  return (
    <ErrorBoundary>
      <Layout theme={theme} onToggleTheme={handleToggleTheme}>
        <section aria-labelledby="datos-section">
          <h2 id="datos-section" className="sr-only">Datos del cálculo</h2>
          <div className="mb-8 grid gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/50 sm:grid-cols-2">
            <div>
              <label htmlFor="salario-input" className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">
                Salario mensual (COP)
              </label>
              <input
                id="salario-input"
                ref={inputRef}
                type="text"
                inputMode="numeric"
                value={salarioStr}
                onChange={handleSalarioChange}
                onFocus={handleSalarioFocus}
                onBlur={handleSalarioBlur}
                aria-describedby="salario-helper"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
              <button
                type="button"
                onClick={() => {
                  setSalario(CONSTANTES_2026.SALARIO_MINIMO);
                  setSalarioStr(formatearSalario(CONSTANTES_2026.SALARIO_MINIMO));
                }}
                className="mt-1 text-xs text-emerald-600 underline hover:text-emerald-500 dark:text-emerald-500 dark:hover:text-emerald-400"
              >
                Usar salario mínimo ($ {CONSTANTES_2026.SALARIO_MINIMO.toLocaleString('es-CO')})
              </button>
            </div>
            <div>
              <label htmlFor="auxilio-input" className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">
                Auxilio de transporte (opcional)
              </label>
              <input
                id="auxilio-input"
                type="number"
                value={auxilio}
                onChange={(e) => setAuxilio(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
              <p id="salario-helper" className="mt-1 text-xs text-slate-400 dark:text-slate-500">Solo suma al total final</p>
            </div>
          </div>
        </section>

        <FormularioJornada
          dias={dias}
          horarios={horarios}
          onToggleDia={toggleDia}
          onUpdateHorario={updateHorario}
          jornada={jornada}
        />

        <Tabs
          className="mb-8"
          tabs={[
            {
              id: 'individual',
              label: 'Turno individual',
              content: (
                <>
                  <FormularioTurno
                    fecha={fecha}
                    franjas={franjas}
                    onFechaChange={setFecha}
                    onFranjaChange={updateFranja}
                    onAgregarFranja={agregarFranja}
                    onEliminarFranja={eliminarFranja}
                    turno={turno}
                    onCalcular={handleCalcular}
                    jornadaValida={jornadaValida}
                  />

                  {error && (
                    <div role="alert" aria-live="polite" className="mb-6 rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
                      {error}
                    </div>
                  )}

                  {resultado && (
                    <div aria-live="polite" className="mb-8 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
                      <TotalPagar total={resultado.totalPagar} auxilioTransporte={auxilio || undefined} />
                      <ResumenTotales resumen={resultado.resumenPorTipo} />
                      <DesgloseHoras horas={resultado.desgloseHoras} />
                      <Advertencias advertencias={resultado.advertencias} />
                      <NotaLimitaciones />
                    </div>
                  )}
                </>
              ),
            },
            {
              id: 'periodo',
              label: 'Cálculo por período',
              content: (
                <>
                  <FormularioPeriodo onCalcular={handleCalcularPeriodo} />
                  {periodoResultado && <ResultadoPeriodo resultado={periodoResultado} />}
                </>
              ),
            },
          ]}
        />

        <SeccionEducativa />
      </Layout>
    </ErrorBoundary>
  );
}
