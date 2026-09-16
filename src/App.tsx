import { useCallback } from 'react';
import { CONSTANTES_2026 } from './lib/calculos/index';
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
import { Privacidad } from './pages/Privacidad';
import { Terminos } from './pages/Terminos';
import { BannerCookies } from './components/legal/BannerCookies';
import { useTheme } from './hooks/useTheme';
import { useNavigation } from './hooks/useNavigation';
import { useJornadaState } from './hooks/useJornadaState';
import { useCalculoState } from './hooks/useCalculoState';
import { trackEvent } from './lib/analytics';

export default function App() {
  const { theme, toggle: toggleTheme } = useTheme();
  const { seccionActiva, direccionSlide, animando, cambiarSeccion, volverAAnterior } = useNavigation();

  const handleAceptarCookies = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: 'consent_accepted' });
  };

  const handleRechazarCookies = () => {
    localStorage.setItem('cookieConsent', 'rejected');
  };

  const jornadaState = useJornadaState();
  const {
    salario,
    setSalario,
    salarioStr,
    setSalarioStr,
    salarioError,
    inputRef,
    handleSalarioFocus,
    handleSalarioChange,
    handleSalarioBlur,
    auxilio,
    auxilioStr,
    auxilioRef,
    handleAuxilioFocus,
    handleAuxilioChange,
    handleAuxilioBlur,
    dias,
    horarios,
    toggleDia,
    updateHorario,
    jornada,
    jornadaValida,
    fecha,
    setFecha,
    franjas,
    updateFranja,
    agregarFranja,
    eliminarFranja,
    turno,
    tipoJornada,
    setTipoJornada,
    diasDescanso,
    setDiasDescanso,
    minutosDescanso,
    setMinutosDescanso,
    horasPactadasDiarias,
    setHorasPactadasDiarias,
  } = jornadaState;

  const calculoState = useCalculoState(
    salario,
    jornada,
    auxilio,
    turno,
    tipoJornada,
    diasDescanso,
    horasPactadasDiarias,
    minutosDescanso
  );
  const { resultado, error, periodoResultado, handleCalcular, handleCalcularPeriodo } = calculoState;

  const handleToggleTheme = useCallback(() => {
    const next = theme === 'dark' ? 'light' : 'dark';
    toggleTheme();
    trackEvent('theme_toggle', { theme: next });
  }, [theme, toggleTheme]);

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
                  setSalarioStr(CONSTANTES_2026.SALARIO_MINIMO.toLocaleString('es-CO'));
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
          tipoJornada={tipoJornada}
          diasDescanso={diasDescanso}
          minutosDescanso={minutosDescanso}
          onMinutosDescansoChange={setMinutosDescanso}
          horasPactadasDiarias={horasPactadasDiarias}
          onHorasPactadasDiariasChange={setHorasPactadasDiarias}
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
                  diasDescanso={diasDescanso}
                  onDiasDescansoChange={setDiasDescanso}
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
                    <TotalPagar
                      totalRecargos={resultado.totalRecargos}
                      totalReferencial={resultado.totalReferencial}
                      auxilioTransporte={resultado.auxilioTransporte}
                      horasOrdinarias={resultado.horasOrdinarias}
                      horasExtra={resultado.horasExtra}
                      horasNocturnas={resultado.horasNocturnas}
                      horasDominicalesFestivas={resultado.horasDominicalesFestivas}
                    />
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

            {seccionActiva === 'privacidad' && (
              <Privacidad onVolver={volverAAnterior} />
            )}

            {seccionActiva === 'terminos' && (
              <Terminos onVolver={volverAAnterior} />
            )}
          </div>
        </div>

        <SeccionEducativa />
        <BannerCookies onAceptar={handleAceptarCookies} onRechazar={handleRechazarCookies} onCambiarSeccion={cambiarSeccion} />
      </Layout>
    </ErrorBoundary>
  );
}