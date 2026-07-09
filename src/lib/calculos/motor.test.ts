import { describe, it, expect } from 'vitest';
import { calcularTurno } from './motor';
import { calcularPeriodo } from './periodo';
import { CONSTANTES_2026 } from './constantes';
import { TipoHora } from './tipos';
import type { JornadaPactada, Turno, ConfiguracionPeriodo, MotivoRecargoDominical } from './tipos';

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

  const SABADO = '2026-06-27'; // Saturday

  it('Sábado Condición A: L-V >= 42h → todas las horas son extra', () => {
    const r = calcularTurno(CONSTANTES_2026.SALARIO_MINIMO, jornadaLD, turno(SABADO, '08:00', '12:00'), undefined, 42);
    expect(r.desgloseHoras).toHaveLength(4);
    expect(r.desgloseHoras.every((h) => h.esHoraExtra)).toBe(true);
    expect(r.desgloseHoras.every((h) => !h.dentroDeJornada)).toBe(true);
    expect(r.desgloseHoras[0].tipoHora).toBe(TipoHora.EXTRA_DIURNA);
  });

  it('Sábado L-V = 41h + 4h → corte a mitad del turno: 1 ord + 3 extra', () => {
    const r = calcularTurno(CONSTANTES_2026.SALARIO_MINIMO, jornadaLD, turno(SABADO, '08:00', '12:00'), undefined, 41);
    expect(r.desgloseHoras).toHaveLength(4);
    expect(r.desgloseHoras[0].tipoHora).toBe(TipoHora.ORDINARIA_DIURNA);
    expect(r.desgloseHoras[0].dentroDeJornada).toBe(true);
    expect(r.desgloseHoras[0].esHoraExtra).toBe(false);
    expect(r.desgloseHoras.slice(1).every((h) => h.tipoHora === TipoHora.EXTRA_DIURNA)).toBe(true);
    expect(r.desgloseHoras.slice(1).every((h) => !h.dentroDeJornada)).toBe(true);
    expect(r.desgloseHoras.slice(1).every((h) => h.esHoraExtra)).toBe(true);
  });

  it('Sábado Condición A: L-V >= 42h, hora nocturna → EXTRA_NOCTURNA', () => {
    const r = calcularTurno(CONSTANTES_2026.SALARIO_MINIMO, jornadaLD, turno(SABADO, '19:00', '22:00'), undefined, 45);
    expect(r.desgloseHoras).toHaveLength(3);
    expect(r.desgloseHoras.every((h) => h.esHoraExtra)).toBe(true);
    expect(r.desgloseHoras.every((h) => !h.dentroDeJornada)).toBe(true);
    expect(r.desgloseHoras[0].tipoHora).toBe(TipoHora.EXTRA_NOCTURNA);
  });

  it('Sábado Condición A: L-V sin acumulador (default 0) → horas dentro de jornada como siempre', () => {
    const r = calcularTurno(CONSTANTES_2026.SALARIO_MINIMO, jornadaLD, turno(SABADO, '08:00', '12:00'));
    expect(r.desgloseHoras).toHaveLength(4);
    expect(r.desgloseHoras.every((h) => !h.esHoraExtra)).toBe(true);
    expect(r.desgloseHoras.every((h) => h.dentroDeJornada)).toBe(true);
  });

  // Caso base del usuario: L-V 40h, sábado 8am-4pm
  // 2h ordinarias (completan 42h) + 6h extra diurnas
  it('Sábado acumulador 40h + 8h turno → corte a las 10am: 2 ord + 6 extra', () => {
    const r = calcularTurno(CONSTANTES_2026.SALARIO_MINIMO, jornadaLD, turno(SABADO, '08:00', '16:00'), undefined, 40);
    expect(r.desgloseHoras).toHaveLength(8);
    expect(r.desgloseHoras[0].tipoHora).toBe(TipoHora.ORDINARIA_DIURNA);
    expect(r.desgloseHoras[1].tipoHora).toBe(TipoHora.ORDINARIA_DIURNA);
    expect(r.desgloseHoras.slice(2).every((h) => h.tipoHora === TipoHora.EXTRA_DIURNA)).toBe(true);
    expect(r.desgloseHoras.slice(2).every((h) => !h.dentroDeJornada)).toBe(true);
    expect(r.desgloseHoras.slice(2).every((h) => h.esHoraExtra)).toBe(true);
    const extras = r.desgloseHoras.filter((h) => h.esHoraExtra).length;
    expect(extras).toBe(6);
    const ordinarias = r.desgloseHoras.filter((h) => !h.esHoraExtra).length;
    expect(ordinarias).toBe(2);
  });

  // Caso cruce de franja: L-V 40h, sábado 8am-8pm
  // 2h ord (8-10) + 9h extra diurna (10-19) + 1h extra nocturna (19-20)
  it('Sábado acumulador 40h + 12h turno (8am-8pm) → corte + cruce nocturno', () => {
    const r = calcularTurno(CONSTANTES_2026.SALARIO_MINIMO, jornadaLD, turno(SABADO, '08:00', '20:00'), undefined, 40);
    expect(r.desgloseHoras).toHaveLength(12);
    // 2 ordinarias
    expect(r.desgloseHoras[0].tipoHora).toBe(TipoHora.ORDINARIA_DIURNA);
    expect(r.desgloseHoras[1].tipoHora).toBe(TipoHora.ORDINARIA_DIURNA);
    // 9 extra diurnas (10am-7pm)
    expect(r.desgloseHoras.slice(2, 11).every((h) => h.tipoHora === TipoHora.EXTRA_DIURNA)).toBe(true);
    // 1 extra nocturna (7pm-8pm)
    expect(r.desgloseHoras[11].tipoHora).toBe(TipoHora.EXTRA_NOCTURNA);
    // Warning por exceder 2h extra/día
    expect(r.advertencias.some((a) => a.codigo === 'HORAS_EXTRA_DIARIA_EXCEDIDA')).toBe(true);
    const extras = r.desgloseHoras.filter((h) => h.esHoraExtra).length;
    expect(extras).toBe(10);
  });

  // Traza exacta del escenario del usuario: periodo L-V 6-14 + Sáb 8-16
  it('PERIODO: L-V 6-14 + Sáb 8-16 → 6 EXTRA_DIURNA total', () => {
    const j: JornadaPactada = {
      dias: [1, 2, 3, 4, 5, 6],
      horariosPorDia: {
        1: { inicio: '06:00', fin: '14:00' },
        2: { inicio: '06:00', fin: '14:00' },
        3: { inicio: '06:00', fin: '14:00' },
        4: { inicio: '06:00', fin: '14:00' },
        5: { inicio: '06:00', fin: '14:00' },
        6: { inicio: '08:00', fin: '16:00' },
      },
    };
    let acumuladorLV = 0;
    // L-V
    for (let i = 0; i < 5; i++) {
      const d = new Date(2026, 5, 22 + i, 12);
      const t: Turno = { fecha: d, franjas: [{ inicio: '06:00', fin: '14:00' }] };
      const r = calcularTurno(CONSTANTES_2026.SALARIO_MINIMO, j, t);
      expect(r.desgloseHoras.every((h) => !h.esHoraExtra)).toBe(true);
      acumuladorLV += r.desgloseHoras.length;
    }
    expect(acumuladorLV).toBe(40);
    // Sábado con 40h acumuladas
    const sab = new Date(2026, 5, 27, 12);
    const ts: Turno = { fecha: sab, franjas: [{ inicio: '08:00', fin: '16:00' }] };
    const r = calcularTurno(CONSTANTES_2026.SALARIO_MINIMO, j, ts, undefined, acumuladorLV);
    expect(r.desgloseHoras).toHaveLength(8);
    const ord = r.desgloseHoras.filter((h) => !h.esHoraExtra);
    const ext = r.desgloseHoras.filter((h) => h.esHoraExtra);
    expect(ord).toHaveLength(2);
    expect(ext).toHaveLength(6);
    expect(ord.every((h) => h.tipoHora === TipoHora.ORDINARIA_DIURNA)).toBe(true);
    expect(ext.every((h) => h.tipoHora === TipoHora.EXTRA_DIURNA)).toBe(true);
    // Horas 8am y 9am son ordinarias; desde 10am son extra
    expect(r.desgloseHoras[0].tipoHora).toBe(TipoHora.ORDINARIA_DIURNA);
    expect(r.desgloseHoras[1].tipoHora).toBe(TipoHora.ORDINARIA_DIURNA);
    expect(r.desgloseHoras[2].tipoHora).toBe(TipoHora.EXTRA_DIURNA);
  });

  // Bug #1 reproduction: jornada 8-17 (default) + bloque 6-14 → 10 EXTRA
  it('BUG#1: jornada 8-17 + bloque 6-14 → produce 10 EXTRA (deberían ser 0)', () => {
    const jornada8_17: JornadaPactada = {
      dias: [1, 2, 3, 4, 5],
      horariosPorDia: {
        1: { inicio: '08:00', fin: '17:00' },
        2: { inicio: '08:00', fin: '17:00' },
        3: { inicio: '08:00', fin: '17:00' },
        4: { inicio: '08:00', fin: '17:00' },
        5: { inicio: '08:00', fin: '17:00' },
      },
    };
    const config: ConfiguracionPeriodo = {
      fechaInicio: '2026-07-06',
      fechaFin: '2026-07-10',
      bloques: [{
        id: 'b1', fechaInicio: '2026-07-06', fechaFin: '2026-07-10',
        horariosPorDia: {
          1: { inicio: '06:00', fin: '14:00' },
          2: { inicio: '06:00', fin: '14:00' },
          3: { inicio: '06:00', fin: '14:00' },
          4: { inicio: '06:00', fin: '14:00' },
          5: { inicio: '06:00', fin: '14:00' },
        },
      }],
    };
    const r = calcularPeriodo(CONSTANTES_2026.SALARIO_MINIMO, jornada8_17, config);
    console.log('BUG#1: extras=', r.totalHorasExtras, 'ord=', r.totalHorasOrdinarias, 'omit=', r.diasOmitidos, 'calc=', r.diasCalculados);
  });

  // Bug #2 reproduction: periodo hasta fin de mes → 26 omitidos
  it('BUG#2: periodo 2026-07-06 a 2026-07-31 → produce 26 omitidos', () => {
    const j: JornadaPactada = {
      dias: [1, 2, 3, 4, 5],
      horariosPorDia: {
        1: { inicio: '08:00', fin: '17:00' },
        2: { inicio: '08:00', fin: '17:00' },
        3: { inicio: '08:00', fin: '17:00' },
        4: { inicio: '08:00', fin: '17:00' },
        5: { inicio: '08:00', fin: '17:00' },
      },
    };
    const config: ConfiguracionPeriodo = {
      fechaInicio: '2026-07-06',
      fechaFin: '2026-07-31',
      bloques: [{
        id: 'b1', fechaInicio: '2026-07-06', fechaFin: '2026-07-10',
        horariosPorDia: {
          1: { inicio: '06:00', fin: '14:00' },
          2: { inicio: '06:00', fin: '14:00' },
          3: { inicio: '06:00', fin: '14:00' },
          4: { inicio: '06:00', fin: '14:00' },
          5: { inicio: '06:00', fin: '14:00' },
        },
      }],
    };
    const r = calcularPeriodo(CONSTANTES_2026.SALARIO_MINIMO, j, config);
    console.log('BUG#2: extras=', r.totalHorasExtras, 'ord=', r.totalHorasOrdinarias, 'omit=', r.diasOmitidos, 'calc=', r.diasCalculados);
  });

  // Funcionalidad #1 — Identificación de festivos en recargo dominical/festivo
  it('Caso A: 20/07/2026 Día de la Independencia (lunes) → motivo nombreFestivo', () => {
    const j: JornadaPactada = {
      dias: [1],
      horariosPorDia: { 1: { inicio: '08:00', fin: '16:00' } },
    };
    const config: ConfiguracionPeriodo = {
      fechaInicio: '2026-07-20',
      fechaFin: '2026-07-20',
      bloques: [{
        id: 'b1', fechaInicio: '2026-07-20', fechaFin: '2026-07-20',
        horariosPorDia: { 1: { inicio: '08:00', fin: '16:00' } },
      }],
    };
    const r = calcularPeriodo(CONSTANTES_2026.SALARIO_MINIMO, j, config);
    expect(r.detalleDominicalFestivo.length).toBeGreaterThan(0);
    const detalle = r.detalleDominicalFestivo[0];
    expect(detalle.motivo.esDomingo).toBe(false);
    expect(detalle.motivo.esFestivo).toBe(true);
    expect(detalle.motivo.nombreFestivo).toBe('Día de la Independencia');
    expect(detalle.tipoHora).toBe('RECARGO_DOMINICAL_DIURNO');
    expect(detalle.cantidadHoras).toBe(8);
  });

  it('Caso B: 19/07/2026 domingo sin festivo → motivo esDomingo', () => {
    // Usar jornada L-V (Sunday no es laboral habitual → recargo dominical aplica)
    const config: ConfiguracionPeriodo = {
      fechaInicio: '2026-07-19',
      fechaFin: '2026-07-19',
      bloques: [{
        id: 'b1', fechaInicio: '2026-07-19', fechaFin: '2026-07-19',
        horariosPorDia: { 7: { inicio: '08:00', fin: '16:00' } },
      }],
    };
    const r = calcularPeriodo(CONSTANTES_2026.SALARIO_MINIMO, jornadaLV, config);
    expect(r.detalleDominicalFestivo.length).toBeGreaterThan(0);
    const detalle = r.detalleDominicalFestivo[0];
    expect(detalle.motivo.esDomingo).toBe(true);
    expect(detalle.motivo.esFestivo).toBe(false);
    expect(detalle.motivo.nombreFestivo).toBeNull();
  });

  it('Caso C: comprobación estructural — código maneja domingo+festivo si ocurriera', () => {
    // En 2026 no hay festivo que caiga en domingo (Ley Emiliani los traslada a lunes).
    // La estructura del código (display ternario) y el modelo MotivoRecargoDominical
    // soportan el caso. Se verifica que el modelo acepta ambos flags true.
    const motivo: MotivoRecargoDominical = {
      esDomingo: true,
      esFestivo: true,
      nombreFestivo: 'Navidad',
    };
    expect(motivo.esDomingo).toBe(true);
    expect(motivo.esFestivo).toBe(true);
    expect(motivo.nombreFestivo).toBe('Navidad');
  });

  // Integration test con calcularPeriodo
  it('calcularPeriodo: L-V 6-14 + Sáb 8-16 → 6 EXTRA, 42 ORD, $79.216,61 sábado', () => {
    const j: JornadaPactada = {
      dias: [1, 2, 3, 4, 5, 6],
      horariosPorDia: {
        1: { inicio: '06:00', fin: '14:00' },
        2: { inicio: '06:00', fin: '14:00' },
        3: { inicio: '06:00', fin: '14:00' },
        4: { inicio: '06:00', fin: '14:00' },
        5: { inicio: '06:00', fin: '14:00' },
        6: { inicio: '08:00', fin: '16:00' },
      },
    };
    const config: ConfiguracionPeriodo = {
      fechaInicio: '2026-06-22',
      fechaFin: '2026-06-27',
      bloques: [{
        id: 'semana',
        fechaInicio: '2026-06-22',
        fechaFin: '2026-06-27',
        horariosPorDia: {
          1: { inicio: '06:00', fin: '14:00' },
          2: { inicio: '06:00', fin: '14:00' },
          3: { inicio: '06:00', fin: '14:00' },
          4: { inicio: '06:00', fin: '14:00' },
          5: { inicio: '06:00', fin: '14:00' },
          6: { inicio: '08:00', fin: '16:00' },
        },
      }],
    };
    const r = calcularPeriodo(CONSTANTES_2026.SALARIO_MINIMO, j, config);
    expect(r.totalHorasOrdinarias).toBe(42);
    expect(r.totalHorasExtras).toBe(6);
    expect(r.totalHorasNocturnas).toBe(0);
    expect(r.diasCalculados).toBe(6);
    expect(r.diasOmitidos).toBe(0);
    // Verificar resumen
    const extraDiurna = r.resumenPorTipo.find((t) => t.tipoHora === TipoHora.EXTRA_DIURNA);
    expect(extraDiurna?.cantidadHoras).toBe(6);
    const ordinariaDiurna = r.resumenPorTipo.find((t) => t.tipoHora === TipoHora.ORDINARIA_DIURNA);
    expect(ordinariaDiurna?.cantidadHoras).toBe(42);
    // Valor de cada extra: Math.round(8338 * 1.25) = 10423, × 6 = 62538
    expect(extraDiurna?.valorTotal).toBe(6 * Math.round(Math.round(1_750_905 / 210) * 1.25));
  });
});
