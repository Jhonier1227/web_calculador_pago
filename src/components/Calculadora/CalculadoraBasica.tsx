import { useState, useCallback, useEffect, useRef } from 'react';

type Operacion = '+' | '−' | '×' | '÷';

function formatearNumero(n: number): string {
  if (!isFinite(n)) return 'Error';
  const partes = n.toFixed(10).replace(/0+$/, '').replace(/\.$/, '').split('.');
  const entero = partes[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return partes[1] ? entero + ',' + partes[1] : entero;
}

function parsearNumero(str: string): number {
  return Number(str.replace(/\./g, '').replace(',', '.'));
}

function formatearInput(raw: string): string {
  if (raw === '' || raw === '0') return '0';
  const negativo = raw.startsWith('-');
  const sinSigno = negativo ? raw.slice(1) : raw;
  const commaIdx = sinSigno.indexOf(',');
  let intPart = sinSigno;
  let decPart = '';
  if (commaIdx !== -1) {
    intPart = sinSigno.slice(0, commaIdx);
    decPart = sinSigno.slice(commaIdx + 1);
  }
  const formattedInt = parseInt(intPart, 10).toLocaleString('es-CO');
  const result = decPart ? `${formattedInt},${decPart}` : formattedInt;
  return negativo ? '-' + result : result;
}

export function CalculadoraBasica() {
  const [display, setDisplay] = useState('0');
  const [prevValue, setPrevValue] = useState(0);
  const [operation, setOperation] = useState<Operacion | null>(null);
  const [waiting, setWaiting] = useState(false);
  const [error, setError] = useState(false);
  const displayRef = useRef<HTMLDivElement>(null);

  const inputDigito = useCallback((digito: string) => {
    if (error) return;
    setDisplay((prev) => {
      if (waiting) {
        setWaiting(false);
        return digito;
      }
      let raw = prev.replace(/\./g, '');
      if (raw.length >= 14) return prev;
      raw = raw === '0' ? digito : raw + digito;
      return formatearInput(raw);
    });
  }, [error, waiting]);

  const inputDecimal = useCallback(() => {
    if (error || waiting) {
      if (waiting) setWaiting(false);
      setDisplay('0,');
      return;
    }
    setDisplay((prev) => (prev.includes(',') ? prev : prev + ','));
  }, [error, waiting]);

  const inputOperacion = useCallback((op: Operacion) => {
    if (error) return;
    const current = parsearNumero(display);
    if (operation && !waiting) {
      const result = evaluar(prevValue, current, operation);
      if (!isFinite(result)) {
        setDisplay('Error');
        setError(true);
        return;
      }
      setDisplay(formatearNumero(result));
      setPrevValue(result);
    } else {
      setPrevValue(current);
    }
    setOperation(op);
    setWaiting(true);
  }, [error, display, operation, waiting, prevValue]);

  const inputIgual = useCallback(() => {
    if (error || !operation) return;
    const current = parsearNumero(display);
    const result = evaluar(prevValue, current, operation);
    if (!isFinite(result)) {
      setDisplay('Error');
      setError(true);
      setOperation(null);
      setWaiting(false);
      return;
    }
    setDisplay(formatearNumero(result));
    setPrevValue(result);
    setOperation(null);
    setWaiting(true);
  }, [error, display, operation, prevValue]);

  const limpiar = useCallback(() => {
    setDisplay('0');
    setPrevValue(0);
    setOperation(null);
    setWaiting(false);
    setError(false);
  }, []);

  const cambiarSigno = useCallback(() => {
    if (error) return;
    setDisplay((prev) => {
      if (prev === '0') return prev;
      return prev.startsWith('-') ? prev.slice(1) : '-' + prev;
    });
  }, [error]);

  const retroceder = useCallback(() => {
    if (error) return;
    setDisplay((prev) => {
      if (prev === '0' || prev === 'Error' || prev.length <= 1) return '0';
      let raw = prev.replace(/\./g, '');
      raw = raw.slice(0, -1);
      if (raw === '' || raw === '-') return '0';
      if (raw.endsWith(',')) raw = raw.slice(0, -1);
      return formatearInput(raw);
    });
  }, [error]);

  const porcentaje = useCallback(() => {
    if (error) return;
    const n = parsearNumero(display) / 100;
    setDisplay(formatearNumero(n));
  }, [error, display]);

  function evaluar(a: number, b: number, op: Operacion): number {
    switch (op) {
      case '+': return a + b;
      case '−': return a - b;
      case '×': return a * b;
      case '÷': return b === 0 ? Infinity : a / b;
    }
  }

  // Animar display al cambiar
  useEffect(() => {
    const el = displayRef.current;
    if (!el) return;
    el.classList.remove('animate-pulse-once');
    void el.offsetWidth;
    el.classList.add('animate-pulse-once');
  }, [display]);

  // Soporte para teclado físico
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.ctrlKey || e.altKey || e.metaKey) return;
      if (e.key >= '0' && e.key <= '9') { inputDigito(e.key); return; }
      if (e.key === ',' || e.key === '.') { e.preventDefault(); inputDecimal(); return; }
      if (e.key === '+') { inputOperacion('+'); return; }
      if (e.key === '-') { inputOperacion('−'); return; }
      if (e.key === '*') { inputOperacion('×'); return; }
      if (e.key === '/') { e.preventDefault(); inputOperacion('÷'); return; }
      if (e.key === 'Enter' || e.key === '=') { inputIgual(); return; }
      if (e.key === 'Escape' || e.key === 'c' || e.key === 'C') { limpiar(); return; }
      if (e.key === 'Delete') { limpiar(); return; }
      if (e.key === 'Backspace') { e.preventDefault(); retroceder(); return; }
      if (e.key === '%') { porcentaje(); return; }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [inputDigito, inputDecimal, inputOperacion, inputIgual, limpiar, retroceder, porcentaje]);

  const btnCls = 'flex items-center justify-center rounded-lg text-lg font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[56px] select-none';

  const operadorTexto: Record<Operacion, string> = { '+': '+', '−': '−', '×': '×', '÷': '÷' };

  return (
    <div className="mx-auto w-full max-w-[320px]">
      {/* Pantalla */}
      <div className="mb-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
        {operation && (
          <div className="text-right text-sm text-slate-400 dark:text-slate-500" dir="rtl">
            {formatearNumero(prevValue)} {operadorTexto[operation]}
          </div>
        )}
        <div
          ref={displayRef}
          className="min-h-[3rem] overflow-hidden text-3xl font-bold text-slate-800 dark:text-white"
          dir="rtl"
        >
          {display}
        </div>
      </div>

      {/* Botones */}
      <div className="grid grid-cols-4 gap-2">
        {/* Fila 1 */}
        <button onClick={limpiar} className={`${btnCls} bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/40 dark:text-red-300 dark:hover:bg-red-900/60`}>
          C
        </button>
        <button onClick={retroceder} className={`${btnCls} bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700`}>
          ⌫
        </button>
        <button onClick={cambiarSigno} className={`${btnCls} bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700`}>
          ±
        </button>
        <button onClick={() => inputOperacion('÷')} className={`${btnCls} bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:hover:bg-emerald-900/60 ${operation === '÷' ? 'ring-2 ring-emerald-500' : ''}`}>
          ÷
        </button>

        {/* Fila 2 */}
        <button onClick={() => inputDigito('7')} className={`${btnCls} bg-slate-50 text-slate-800 hover:bg-slate-100 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700`}>7</button>
        <button onClick={() => inputDigito('8')} className={`${btnCls} bg-slate-50 text-slate-800 hover:bg-slate-100 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700`}>8</button>
        <button onClick={() => inputDigito('9')} className={`${btnCls} bg-slate-50 text-slate-800 hover:bg-slate-100 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700`}>9</button>
        <button onClick={() => inputOperacion('×')} className={`${btnCls} bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:hover:bg-emerald-900/60 ${operation === '×' ? 'ring-2 ring-emerald-500' : ''}`}>
          ×
        </button>

        {/* Fila 3 */}
        <button onClick={() => inputDigito('4')} className={`${btnCls} bg-slate-50 text-slate-800 hover:bg-slate-100 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700`}>4</button>
        <button onClick={() => inputDigito('5')} className={`${btnCls} bg-slate-50 text-slate-800 hover:bg-slate-100 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700`}>5</button>
        <button onClick={() => inputDigito('6')} className={`${btnCls} bg-slate-50 text-slate-800 hover:bg-slate-100 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700`}>6</button>
        <button onClick={() => inputOperacion('−')} className={`${btnCls} bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:hover:bg-emerald-900/60 ${operation === '−' ? 'ring-2 ring-emerald-500' : ''}`}>
          −
        </button>

        {/* Fila 4 */}
        <button onClick={() => inputDigito('1')} className={`${btnCls} bg-slate-50 text-slate-800 hover:bg-slate-100 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700`}>1</button>
        <button onClick={() => inputDigito('2')} className={`${btnCls} bg-slate-50 text-slate-800 hover:bg-slate-100 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700`}>2</button>
        <button onClick={() => inputDigito('3')} className={`${btnCls} bg-slate-50 text-slate-800 hover:bg-slate-100 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700`}>3</button>
        <button onClick={() => inputOperacion('+')} className={`${btnCls} bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:hover:bg-emerald-900/60 ${operation === '+' ? 'ring-2 ring-emerald-500' : ''}`}>
          +
        </button>

        {/* Fila 5 */}
        <button onClick={() => inputDigito('0')} className={`${btnCls} col-span-2 bg-slate-50 text-slate-800 hover:bg-slate-100 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700`}>
          0
        </button>
        <button onClick={inputDecimal} className={`${btnCls} bg-slate-50 text-slate-800 hover:bg-slate-100 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700`}>
          ,
        </button>
        <button onClick={inputIgual} className={`${btnCls} bg-emerald-600 text-white hover:bg-emerald-500 dark:bg-emerald-500 dark:hover:bg-emerald-400 text-xl`}>
          =
        </button>
      </div>
    </div>
  );
}