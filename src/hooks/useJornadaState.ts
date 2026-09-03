import { useState, useMemo, useCallback, useRef } from 'react';
import { CONSTANTES_2026 } from '../lib/calculos/constantes';
import { validarSalario } from '../lib/validaciones/validarInputs';
import { useLocalStorage } from './useLocalStorage';
import type { JornadaPactada, Turno } from '../lib/calculos/index';

export function useJornadaState() {
  // Salario
  const [salario, setSalario] = useLocalStorage<number>('salario', CONSTANTES_2026.SALARIO_MINIMO);
  const [salarioStr, setSalarioStr] = useState(() => salario.toLocaleString('es-CO'));
  const [salarioError, setSalarioError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auxilio de transporte
  const [auxilio, setAuxilio] = useState(0);
  const [auxilioStr, setAuxilioStr] = useState('0');
  const auxilioRef = useRef<HTMLInputElement>(null);

  // Jornada pactada
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

  // Turno individual
  const [fecha, setFecha] = useState(() => new Date().toISOString().slice(0, 10));
  const [franjas, setFranjas] = useState<{ inicio: string; fin: string }[]>([
    { inicio: '18:00', fin: '22:00' },
  ]);

  // Tipo de jornada
  const [tipoJornada, setTipoJornada] = useState<'estandar' | 'rotativo'>('estandar');
  const [diasDescanso, setDiasDescanso] = useState<number[]>([0]);

  // Horas diarias pactadas (opcional)
  const [horasPactadasDiarias, setHorasPactadasDiarias] = useState<number | ''>('');

  // Descanso
  const [minutosDescanso, setMinutosDescanso] = useState(0);

  // Helpers
  const formatearSalario = (n: number) => n.toLocaleString('es-CO');

  // Salario handlers
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

  // Auxilio handlers
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

  // Jornada handlers
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

  // Franja handlers
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

  // Memoized values
  const jornada: JornadaPactada = useMemo(
    () => ({ dias, horariosPorDia: horarios }),
    [dias, horarios],
  );

  const turno: Turno = useMemo(
    () => ({ fecha: new Date(fecha + 'T12:00:00'), franjas }),
    [fecha, franjas],
  );

  const jornadaValida = dias.length > 0;

  return {
    // Salario
    salario,
    setSalario,
    salarioStr,
    setSalarioStr,
    salarioError,
    setSalarioError,
    inputRef,
    handleSalarioFocus,
    handleSalarioChange,
    handleSalarioBlur,
    // Auxilio
    auxilio,
    setAuxilio,
    auxilioStr,
    setAuxilioStr,
    auxilioRef,
    handleAuxilioFocus,
    handleAuxilioChange,
    handleAuxilioBlur,
    // Jornada
    dias,
    setDias,
    horarios,
    setHorarios,
    toggleDia,
    updateHorario,
    jornada,
    jornadaValida,
    // Turno
    fecha,
    setFecha,
    franjas,
    setFranjas,
    updateFranja,
    agregarFranja,
    eliminarFranja,
    turno,
    // Tipo jornada
    tipoJornada,
    setTipoJornada,
    diasDescanso,
    setDiasDescanso,
    // Horas diarias pactadas
    horasPactadasDiarias,
    setHorasPactadasDiarias,
    // Descanso
    minutosDescanso,
    setMinutosDescanso,
  };
}