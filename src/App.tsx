import { useState, useMemo, useCallback, useRef } from 'react';
import { CONSTANTES_2026, calcularPeriodo } from './lib/calculos/index';
import type { JornadaPactada, Turno, ConfiguracionPeriodo, ResultadoPeriodo as ResultadoPeriodoType } from './lib/calculos/index';
import { validarSalario } from './lib/validaciones/validarInputs';
import { Layout } from './components/Layout';
import { ErrorBoundary } from './components/ErrorBoundary';
import { FormularioJornada } from './components/Calculadora/FormularioJornada';
import { FormularioTurno } from './components/Calculadora/FormularioTurno';
import { FormularioPeriodo } from './components/Calculadora/FormularioPeriodo';
import { DesgloseHoras } from './components/Calculadora/DesgloseHoras';
import { ResumenTotales } from './components/Calculadora/ResumenTotales';
import { TotalPagar } from './components/Calculadora/TotalPagar';
import { Advertencias } from './components/Calculadora/Advertencias';
import { NotaLimitaciones } from './components/Calculadora/NotaLimitaciones';
import { ResultadoPeriodo } from './components/Calculadora/ResultadoPeriodo';
import { CalculadoraBasica } from './components/Calculadora/CalculadoraBasica';
import { SeccionEducativa } from './components/SeccionEducativa';
import { useCalculo } from './hooks/useCalculo';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useTheme } from './hooks/useTheme';
import { trackEvent } from './lib/analytics';

type Seccion = 'turno' | 'periodo' | 'calculadora';

const ORDEN_TABS: Record<Seccion, number> = {
  turno: 0,
  periodo: 1,
  calculadora: 2,
} as const;

function ajustarFranja(franja: { inicio: string; fin: string }, minutosDescanso: number): { inicio: string; fin: string } {
  if (minutosDescanso === 0) return franja;
  const [hFin, mFin] = franja.fin.split(':').map(Number);
  const totalMinutos = hFin * 60 + mFin - minutosDescanso;
  if (totalMinutos < 0) return franja;
  const horas = Math.floor(totalMinutos / 60);
  const minutos = totalMinutos % 60;
  return { ...franja, fin: `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}` };
}

export default function App() {
  const { theme, toggle: toggleTheme } = useTheme();
  const [seccionActiva, setSeccionActiva] = useState<Seccion>('periodo');
  const [direccionSlide, setDireccionSlide] = useState<'izquierda' | 'derecha'>('derecha');
  const [animando, setAnimando] = useState(false);

  const handleToggleTheme = useCallback(() => {
    const next = theme === 'dark' ? 'light' : 'dark';
    toggleTheme();
    trackEvent('theme_toggle', { theme: next });
  }, [theme, toggleTheme]);

  const cambiarSeccion = useCallback((nueva: Seccion) => {
    if (nueva === seccionActiva || animando) return;

    const direccion = ORDEN_TABS[nueva] > ORDEN_TABS[seccionActiva] ? 'derecha' : 'izquierda';

    setDireccionSlide(direccion);
    setAnimando(true);
    setSeccionActiva(nueva);
    trackEvent('navegar', { seccion: nueva });

    setTimeout(() => {
      setAnimando(false);
    }, 350);
  }, [seccionActiva, animando]);
  const [salario, setSalario] = useLocalStorage<number>('salario', CONSTANTES_2026.SALARIO_MINIMO);
  const [salarioStr, setSalarioStr] = useState(() => salario.toLocaleString('es-CO'));
  const [salarioError, setSalarioError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const auxilioRef = useRef<HTMLInputElement>(null);

  const formatearSalario = (n: number) => n.toLocaleString('es-CO');

  const handleSalarioFocus = () => {
    if (salario === 0) setSalarioStr('');
  };

  const handleSalarioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    const cursor = e.target.selectionStart ?? 0;
    const digitsBefore = e.target.value.slice(0, cursor).replace(/\D/g, '').length;
    const num = raw === '' ? 0 : Number(raw);
    const formatted = raw === '' ? '' : formatearSalario(num);
    setSalario(num);
    setSalarioStr(formatted);
    const validacion = num > 0 ? validarSalario(num) : { esValido: true, mensaje: null };
    setSalarioError(validacion.mensaje);
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
      setSalarioError(null);
    } else {
      setSalarioStr(formatearSalario(salario));
      const validacion = validarSalario(salario);
      setSalarioError(validacion.mensaje);
    }
  };

  const [auxilio, setAuxilio] = useState(0);
  const [auxilioStr, setAuxilioStr] = useState('0');
  const handleAuxilioFocus = () => {
    if (auxilio === 0) setAuxilioStr('');
  };

  const handleAuxilioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    const cursor = e.target.selectionStart ?? 0;
    const digitsBefore = e.target.value.slice(0, cursor).replace(/\D/g, '').length;
    const num = raw === '' ? 0 : Number(raw);
    const formatted = raw === '' ? '' : formatearSalario(num);
    setAuxilio(num);
    setAuxilioStr(formatted);
    requestAnimationFrame(() => {
      const el = auxilioRef.current;
      if (!el) return;
      let pos = 0;
      for (let i = 0, d = 0; i < formatted.length && d < digitsBefore; i++) {
        if (formatted[i] !== '.') d++;
        pos = i + 1;
      }
      el.setSelectionRange(pos, pos);
    });
  };

  const handleAuxilioBlur = () => {
    setAuxilioStr(auxilio === 0 ? '' : formatearSalario(auxilio));
  };

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
  const [minutosDescanso, setMinutosDescanso] = useState(0);
  const [tipoJornada, setTipoJornada] = useState<'estandar' | 'rotativo'>('estandar');
  const [diaDescanso, setDiaDescanso] = useState(0);
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
    const val = validarSalario(salario);
    if (!val.esValido) return;
    const franjasAjustadas = minutosDescanso > 0
      ? franjas.map((f) => ajustarFranja(f, minutosDescanso))
      : franjas;
    const turnoAjustado: Turno = { ...turno, franjas: franjasAjustadas };
    calcular(salario, jornada, turnoAjustado, auxilio || undefined, tipoJornada, diaDescanso);
    trackEvent('calcular', { salario, jornada_dias: dias.length, franjas: franjas.length, descanso: minutosDescanso, tipoJornada, diaDescanso });
  }, [calcular, salario, jornada, turno, auxilio, dias, franjas, minutosDescanso, tipoJornada, diaDescanso]);

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
      <Layout theme={theme} onToggleTheme={handleToggleTheme} seccionActiva={seccionActiva} onCambiarSeccion={cambiarSeccion} animando={animando}>
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
                aria-describedby={salarioError ? 'salario-error' : 'salario-helper'}
                aria-invalid={!!salarioError}
                className={`w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 dark:bg-slate-900 dark:text-white ${
                  salarioError
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-slate-300 focus:ring-emerald-500 dark:border-slate-700'
                }`}
              />
              {salarioError && (
                <p id="salario-error" className="mt-1 text-xs text-red-600 dark:text-red-400" role="alert">
                  {salarioError}
                </p>
              )}
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
                ref={auxilioRef}
                type="text"
                inputMode="numeric"
                value={auxilioStr}
                onChange={handleAuxilioChange}
                onFocus={handleAuxilioFocus}
                onBlur={handleAuxilioBlur}
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

        {/* Contenedor del slide — solo contenido específico de sección */}
        <div className="flex-1 min-w-0 overflow-hidden relative">
          <div
            key={seccionActiva}
            className={
              animando
                ? direccionSlide === 'derecha'
                  ? 'slide-in-right'
                  : 'slide-in-left'
                : ''
            }
          >
            {seccionActiva === 'turno' && (
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
                  minutosDescanso={minutosDescanso}
                  onMinutosDescansoChange={setMinutosDescanso}
                  tipoJornada={tipoJornada}
                  onTipoJornadaChange={setTipoJornada}
                  diaDescanso={diaDescanso}
                  onDiaDescansoChange={setDiaDescanso}
                />

                {error && (
                  <div role="alert" aria-live="polite" className="mb-6 rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
                    {error}
                  </div>
                )}

                {resultado && (
                  <div aria-live="polite" className="mb-8 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
                    {minutosDescanso > 0 && (
                      <p className="mb-2 text-xs text-slate-500 dark:text-slate-400">
                        Descuento por descanso aplicado: <strong>{minutosDescanso} min</strong> (Art. 167 CST)
                      </p>
                    )}
                    <TotalPagar total={resultado.totalPagar} auxilioTransporte={auxilio || undefined} />
                    <ResumenTotales resumen={resultado.resumenPorTipo} />
                    <DesgloseHoras horas={resultado.desgloseHoras} />
                    <Advertencias advertencias={resultado.advertencias} />
                    <NotaLimitaciones />
                  </div>
                )}
              </>
            )}

            {seccionActiva === 'periodo' && (
              <>
                <FormularioPeriodo onCalcular={handleCalcularPeriodo} />
                {periodoResultado && <ResultadoPeriodo resultado={periodoResultado} />}
              </>
            )}

            {seccionActiva === 'calculadora' && (
              <section aria-labelledby="calculadora-section">
                <h2 id="calculadora-section" className="mb-2 text-center text-lg font-bold text-slate-700 dark:text-slate-200">
                  Calculadora básica
                </h2>
                <p className="mb-6 text-center text-xs text-slate-400">
                  Herramienta auxiliar para operaciones aritméticas simples
                </p>
                <CalculadoraBasica />
              </section>
            )}
          </div>
        </div>

        <SeccionEducativa />
      </Layout>
    </ErrorBoundary>
  );
}
