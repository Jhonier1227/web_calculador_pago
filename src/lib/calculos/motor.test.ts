import { describe, it, expect } from 'vitest';
import { calcularTurno } from './motor';
import { CONSTANTES_2026 } from './constantes';
import { TipoHora } from './tipos';
import type { JornadaPactada, Turno } from './tipos';

const jornadaLV: JornadaPactada = {
  dias: [1, 2, 3, 4, 5],
  horariosPorDia: {
    1: { inicio: '08:00', fin: '17:00' },
    2: { inicio: '08:00', fin: '17:00' },
    3: { inicio: '08:00', fin: '17:00' },
    4: { inicio: '08:00', fin: '17:00' },
    5: { inicio: '08:00', fin: '17:00' },
  },
};

const jornadaLD: JornadaPactada = {
  dias: [1, 2, 3, 4, 5, 6, 7],
  horariosPorDia: {
    1: { inicio: '08:00', fin: '17:00' },
    2: { inicio: '08:00', fin: '17:00' },
    3: { inicio: '08:00', fin: '17:00' },
    4: { inicio: '08:00', fin: '17:00' },
    5: { inicio: '08:00', fin: '17:00' },
    6: { inicio: '08:00', fin: '17:00' },
    7: { inicio: '08:00', fin: '17:00' },
  },
};

function turno(fecha: string, inicio: string, fin: string): Turno {
  return { fecha: new Date(fecha + 'T12:00:00'), franjas: [{ inicio, fin }] };
}

function turnoMulti(fecha: string, franjas: { inicio: string; fin: string }[]): Turno {
  return { fecha: new Date(fecha + 'T12:00:00'), franjas };
}

describe('calcularTurno — casos end-to-end', () => {
  // June 22, 2026 is a regular Monday (no holiday)
  const LUNES = '2026-06-22';

  it('Caso 1: 4h diurnas dentro jornada → 4 ORDINARIA_DIURNA', () => {
    const r = calcularTurno(CONSTANTES_2026.SALARIO_MINIMO, jornadaLV, turno(LUNES, '09:00', '13:00'));
    expect(r.desgloseHoras).toHaveLength(4);
    expect(r.desgloseHoras.every((h) => h.tipoHora === TipoHora.ORDINARIA_DIURNA)).toBe(true);
    expect(r.desgloseHoras.every((h) => h.dentroDeJornada)).toBe(true);
    expect(r.desgloseHoras.every((h) => h.esHoraExtra)).toBe(false);
  });

  it('Caso 2: Turno fuera jornada con horas nocturnas', () => {
    const r = calcularTurno(CONSTANTES_2026.SALARIO_MINIMO, jornadaLV, turno(LUNES, '18:00', '22:00'));
    expect(r.desgloseHoras).toHaveLength(4);
    expect(r.desgloseHoras[0].tipoHora).toBe(TipoHora.EXTRA_DIURNA);
    expect(r.desgloseHoras[1].tipoHora).toBe(TipoHora.EXTRA_NOCTURNA);
    expect(r.desgloseHoras[2].tipoHora).toBe(TipoHora.EXTRA_NOCTURNA);
    expect(r.desgloseHoras[3].tipoHora).toBe(TipoHora.EXTRA_NOCTURNA);
    expect(r.desgloseHoras.every((h) => h.dentroDeJornada)).toBe(false);
  });

  it('Caso 3: Domingo fuera jornada → EXTRA_DOMINICAL_DIURNA', () => {
    const r = calcularTurno(CONSTANTES_2026.SALARIO_MINIMO, jornadaLV, turno('2026-06-21', '08:00', '12:00'));
    expect(r.desgloseHoras).toHaveLength(4);
    expect(r.desgloseHoras.every((h) => h.tipoHora === TipoHora.EXTRA_DOMINICAL_DIURNA)).toBe(true);
    expect(r.desgloseHoras.every((h) => h.dentroDeJornada)).toBe(false);
    expect(r.desgloseHoras.every((h) => h.esHoraExtra)).toBe(true);
  });

  it('Caso 4: Domingo dentro jornada (L-D) → ORDINARIA_DIURNA', () => {
    const r = calcularTurno(CONSTANTES_2026.SALARIO_MINIMO, jornadaLD, turno('2026-06-21', '08:00', '12:00'));
    expect(r.desgloseHoras).toHaveLength(4);
    expect(r.desgloseHoras.every((h) => h.tipoHora === TipoHora.ORDINARIA_DIURNA)).toBe(true);
    expect(r.desgloseHoras.every((h) => h.dentroDeJornada)).toBe(true);
    expect(r.desgloseHoras.every((h) => h.esHoraExtra)).toBe(false);
  });

  it('Caso 5: Festivo Emiliani (lunes) → RECARGO_DOMINICAL_DIURNO', () => {
    const r = calcularTurno(CONSTANTES_2026.SALARIO_MINIMO, jornadaLV, turno('2026-01-12', '08:00', '12:00'));
    expect(r.desgloseHoras).toHaveLength(4);
    expect(r.desgloseHoras.every((h) => h.tipoHora === TipoHora.RECARGO_DOMINICAL_DIURNO)).toBe(true);
    expect(r.desgloseHoras.every((h) => h.esFestivo)).toBe(true);
  });

  it('Caso 6: Cruza medianoche Sáb 23:00 – Dom 03:00', () => {
    const r = calcularTurno(CONSTANTES_2026.SALARIO_MINIMO, jornadaLV, turno('2026-06-20', '23:00', '03:00'));
    expect(r.desgloseHoras).toHaveLength(4);
    expect(r.desgloseHoras[0].tipoHora).toBe(TipoHora.EXTRA_NOCTURNA);
    expect(r.desgloseHoras[1].tipoHora).toBe(TipoHora.EXTRA_DOMINICAL_NOCTURNA);
    expect(r.desgloseHoras[2].tipoHora).toBe(TipoHora.EXTRA_DOMINICAL_NOCTURNA);
    expect(r.desgloseHoras[3].tipoHora).toBe(TipoHora.EXTRA_DOMINICAL_NOCTURNA);
  });

  it('Caso 7: Horas extra + límite 2h/día → warning', () => {
    const r = calcularTurno(CONSTANTES_2026.SALARIO_MINIMO, jornadaLV, turno(LUNES, '17:00', '22:00'));
    const extras = r.desgloseHoras.filter((h) => h.esHoraExtra);
    expect(extras.length).toBeGreaterThan(2);
    expect(r.advertencias.some((a) => a.codigo === 'HORAS_EXTRA_DIARIA_EXCEDIDA')).toBe(true);
  });

  it('Caso 8: Salario < mínimo → warning + cálculo con valor ingresado', () => {
    const r = calcularTurno(1_000_000, jornadaLV, turno(LUNES, '09:00', '13:00'));
    expect(r.advertencias.some((a) => a.codigo === 'SALARIO_BAJO_MINIMO')).toBe(true);
    expect(r.desgloseHoras).toHaveLength(4);
  });

  it('Caso 9: Hora fin = hora inicio → error FRANJA_INVALIDA', () => {
    const t = turnoMulti(LUNES, [{ inicio: '08:00', fin: '08:00' }]);
    const r = calcularTurno(CONSTANTES_2026.SALARIO_MINIMO, jornadaLV, t);
    expect(r.advertencias.some((a) => a.codigo === 'FRANJA_INVALIDA')).toBe(true);
  });

  it('Caso 10: Jornada semanal 6d×8h=48h → warning JORNADA_SEMANAL_EXCEDE_42H', () => {
    const j: JornadaPactada = {
      dias: [1, 2, 3, 4, 5, 6],
      horariosPorDia: {
        1: { inicio: '08:00', fin: '17:00' },
        2: { inicio: '08:00', fin: '17:00' },
        3: { inicio: '08:00', fin: '17:00' },
        4: { inicio: '08:00', fin: '17:00' },
        5: { inicio: '08:00', fin: '17:00' },
        6: { inicio: '08:00', fin: '17:00' },
      },
    };
    const r = calcularTurno(CONSTANTES_2026.SALARIO_MINIMO, j, turno(LUNES, '09:00', '13:00'));
    expect(r.advertencias.some((a) => a.codigo === 'JORNADA_SEMANAL_EXCEDE_42H')).toBe(true);
  });

  it('Caso 11: Año fuera rango (2019) → error AÑO_FESTIVOS_FUERA_RANGO', () => {
    const r = calcularTurno(CONSTANTES_2026.SALARIO_MINIMO, jornadaLV, turno('2019-06-15', '09:00', '13:00'));
    expect(r.advertencias.some((a) => a.codigo === 'AÑO_FESTIVOS_FUERA_RANGO')).toBe(true);
    expect(r.desgloseHoras).toHaveLength(0);
  });

  it('Caso 12: Año bisiesto (29 feb 2024) → cálculos correctos', () => {
    const r = calcularTurno(CONSTANTES_2026.SALARIO_MINIMO, jornadaLV, turno('2024-02-28', '22:00', '02:00'));
    expect(r.desgloseHoras).toHaveLength(4);
    expect(r.advertencias.some((a) => a.codigo === 'AÑO_FESTIVOS_FUERA_RANGO')).toBe(false);
  });

  it('Caso 13: Jornada horario por día (L 8-17, M 12-20)', () => {
    const j: JornadaPactada = {
      dias: [1, 2],
      horariosPorDia: {
        1: { inicio: '08:00', fin: '17:00' },
        2: { inicio: '12:00', fin: '20:00' },
      },
    };
    // Martes 16 junio 2026: jornada 12-20
    const r = calcularTurno(CONSTANTES_2026.SALARIO_MINIMO, j, turno('2026-06-16', '10:00', '16:00'));
    expect(r.desgloseHoras).toHaveLength(6);
    expect(r.desgloseHoras[0].tipoHora).toBe(TipoHora.EXTRA_DIURNA);
    expect(r.desgloseHoras[0].dentroDeJornada).toBe(false);
    expect(r.desgloseHoras[2].tipoHora).toBe(TipoHora.ORDINARIA_DIURNA);
    expect(r.desgloseHoras[2].dentroDeJornada).toBe(true);
  });

  it('Caso 14: Turno partido (múltiples franjas) → suma correcta', () => {
    const t = turnoMulti(LUNES, [
      { inicio: '08:00', fin: '12:00' },
      { inicio: '14:00', fin: '18:00' },
    ]);
    const r = calcularTurno(CONSTANTES_2026.SALARIO_MINIMO, jornadaLV, t);
    expect(r.desgloseHoras).toHaveLength(8);
    expect(r.desgloseHoras.slice(0, 4).every((h) => h.dentroDeJornada)).toBe(true);
    expect(r.desgloseHoras[4].dentroDeJornada).toBe(true);
    expect(r.desgloseHoras[5].dentroDeJornada).toBe(true);
    expect(r.desgloseHoras[6].dentroDeJornada).toBe(true);
    expect(r.desgloseHoras[7].tipoHora).toBe(TipoHora.EXTRA_DIURNA);
  });

  it('Caso 15: Franjas solapadas → error FRANJAS_SOLAPADAS', () => {
    const t = turnoMulti(LUNES, [
      { inicio: '08:00', fin: '14:00' },
      { inicio: '12:00', fin: '18:00' },
    ]);
    const r = calcularTurno(CONSTANTES_2026.SALARIO_MINIMO, jornadaLV, t);
    expect(r.advertencias.some((a) => a.codigo === 'FRANJAS_SOLAPADAS')).toBe(true);
    expect(r.desgloseHoras).toHaveLength(0);
  });

  it('Caso 16: Auxilio transporte → solo suma a total, no afecta valor hora', () => {
    const sinAuxilio = calcularTurno(CONSTANTES_2026.SALARIO_MINIMO, jornadaLV, turno(LUNES, '09:00', '13:00'));
    const conAuxilio = calcularTurno(CONSTANTES_2026.SALARIO_MINIMO, jornadaLV, turno(LUNES, '09:00', '13:00'), 200_000);
    expect(conAuxilio.desgloseHoras).toEqual(sinAuxilio.desgloseHoras);
    expect(conAuxilio.totalPagar).toBe(sinAuxilio.totalPagar + 200_000);
    for (let i = 0; i < sinAuxilio.desgloseHoras.length; i++) {
      expect(sinAuxilio.desgloseHoras[i].valorHora).toBe(conAuxilio.desgloseHoras[i].valorHora);
    }
  });

  it('Advertencia LIMITE_SEMANAL_NO_VALIDADO siempre presente', () => {
    const r = calcularTurno(CONSTANTES_2026.SALARIO_MINIMO, jornadaLV, turno(LUNES, '09:00', '13:00'));
    expect(r.advertencias.some((a) => a.codigo === 'LIMITE_SEMANAL_NO_VALIDADO')).toBe(true);
  });

  it('Jornada inválida (sin días) retorna error SIN_DIAS_JORNADA', () => {
    const j: JornadaPactada = { dias: [], horariosPorDia: {} };
    const r = calcularTurno(CONSTANTES_2026.SALARIO_MINIMO, j, turno(LUNES, '09:00', '13:00'));
    expect(r.advertencias.some((a) => a.codigo === 'SIN_DIAS_JORNADA')).toBe(true);
    expect(r.desgloseHoras).toHaveLength(0);
  });
});
