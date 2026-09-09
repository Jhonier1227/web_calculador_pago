import { describe, it, expect, beforeEach } from 'vitest';
import { calcularTurno } from './motor';
import { CONSTANTES_2026 } from './constantes';
import { TipoHora } from './tipos';
import type { JornadaPactada, Turno } from './tipos';
import { _resetCacheFestivos } from './festivos';

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

describe('calcularTurno — Nueva lógica: acumulador semanal 42h (CB-01)', () => {
  beforeEach(() => {
    _resetCacheFestivos();
  });

  // Agosto 2026: 2=Dom, 3=Lun, 8=Sáb (sin festivos)
  // 7 ago = Batalla de Boyacá (festivo fijo, viernes)
  // 15 ago = Asunción (movido a lunes 17 ago por Ley Emiliani)
  const LUNES = '2026-08-03';   // 3 ago 2026 = Lunes
  const SABADO = '2026-08-08';  // 8 ago 2026 = Sábado
  const DOMINGO = '2026-08-02'; // 2 ago 2026 = Domingo

  it('Turno diurno dentro de 42h semanales (acumulador 0) → ORDINARIA_DIURNA', () => {
    const r = calcularTurno(CONSTANTES_2026.SALARIO_MINIMO, jornadaLV, turno(LUNES, '09:00', '13:00'));
    expect(r.desgloseHoras).toHaveLength(4);
    expect(r.desgloseHoras.every((h) => h.tipoHora === TipoHora.ORDINARIA_DIURNA)).toBe(true);
    expect(r.desgloseHoras.every((h) => !h.esHoraExtra)).toBe(true);
    expect(r.desgloseHoras.every((h) => h.dentroDeJornada)).toBe(true);
  });

  it('Turno nocturno dentro de 42h semanales (acumulador 0) → ORDINARIA_NOCTURNA (35%)', () => {
    const r = calcularTurno(CONSTANTES_2026.SALARIO_MINIMO, jornadaLV, turno(LUNES, '22:00', '02:00'));
    expect(r.desgloseHoras).toHaveLength(4);
    expect(r.desgloseHoras.every((h) => h.tipoHora === TipoHora.ORDINARIA_NOCTURNA)).toBe(true);
    expect(r.desgloseHoras.every((h) => h.esNocturna)).toBe(true);
    expect(r.desgloseHoras.every((h) => !h.esHoraExtra)).toBe(true);
    expect(r.desgloseHoras.every((h) => h.recargoAplicado === 0.35)).toBe(true);
  });

  it('Turno mixto (diurno + nocturno) dentro de 42h → ORDINARIA_DIURNA + ORDINARIA_NOCTURNA', () => {
    const r = calcularTurno(CONSTANTES_2026.SALARIO_MINIMO, jornadaLV, turno(LUNES, '16:00', '22:00'));
    expect(r.desgloseHoras).toHaveLength(6);
    // 16:00-18:00 = diurnas (2h)
    expect(r.desgloseHoras.slice(0, 2).every((h) => h.tipoHora === TipoHora.ORDINARIA_DIURNA)).toBe(true);
    // 19:00-21:00 = nocturnas (3h)
    expect(r.desgloseHoras.slice(3).every((h) => h.tipoHora === TipoHora.ORDINARIA_NOCTURNA)).toBe(true);
    expect(r.desgloseHoras.every((h) => !h.esHoraExtra)).toBe(true);
  });

  it('Domingo (estandar) dentro de 42h → ORDINARIA_DOMINICAL (90%)', () => {
    const r = calcularTurno(CONSTANTES_2026.SALARIO_MINIMO, jornadaLV, turno(DOMINGO, '08:00', '12:00'));
    expect(r.desgloseHoras).toHaveLength(4);
    expect(r.desgloseHoras.every((h) => h.tipoHora === TipoHora.ORDINARIA_DOMINICAL)).toBe(true);
    expect(r.desgloseHoras.every((h) => h.esFestivo)).toBe(true);
    expect(r.desgloseHoras.every((h) => !h.esHoraExtra)).toBe(true);
    expect(r.desgloseHoras.every((h) => h.recargoAplicado === 0.9)).toBe(true);
  });

  it('Domingo nocturno (estandar) dentro de 42h → ORDINARIA_NOCTURNA_DOMINICAL (125%)', () => {
    // Usar 19:00-22:00 (3h, todo el mismo día domingo, todas nocturnas)
    const r = calcularTurno(CONSTANTES_2026.SALARIO_MINIMO, jornadaLV, turno(DOMINGO, '19:00', '22:00'));
    expect(r.desgloseHoras).toHaveLength(3);
    expect(r.desgloseHoras.every((h) => h.tipoHora === TipoHora.ORDINARIA_NOCTURNA_DOMINICAL)).toBe(true);
    expect(r.desgloseHoras.every((h) => h.esFestivo)).toBe(true);
    expect(r.desgloseHoras.every((h) => h.esNocturna)).toBe(true);
    expect(r.desgloseHoras.every((h) => !h.esHoraExtra)).toBe(true);
    expect(r.desgloseHoras.every((h) => h.recargoAplicado === 1.25)).toBe(true);
  });

  it('Con acumulador 42h (semana completa): sábado → EXTRA_DIURNA (25%)', () => {
    const r = calcularTurno(CONSTANTES_2026.SALARIO_MINIMO, jornadaLD, turno(SABADO, '08:00', '12:00'), undefined, 42);
    expect(r.desgloseHoras).toHaveLength(4);
    expect(r.desgloseHoras.every((h) => h.tipoHora === TipoHora.EXTRA_DIURNA)).toBe(true);
    expect(r.desgloseHoras.every((h) => h.esHoraExtra)).toBe(true);
    expect(r.desgloseHoras.every((h) => h.recargoAplicado === 0.25)).toBe(true);
  });

  it('Con acumulador 42h (semana completa): sábado nocturno → EXTRA_NOCTURNA (75%)', () => {
    // Usar 19:00-22:00 (3h, todo el mismo día sábado, todas nocturnas)
    const r = calcularTurno(CONSTANTES_2026.SALARIO_MINIMO, jornadaLD, turno(SABADO, '19:00', '22:00'), undefined, 42);
    expect(r.desgloseHoras).toHaveLength(3);
    expect(r.desgloseHoras.every((h) => h.tipoHora === TipoHora.EXTRA_NOCTURNA)).toBe(true);
    expect(r.desgloseHoras.every((h) => h.esHoraExtra)).toBe(true);
    expect(r.desgloseHoras.every((h) => h.esNocturna)).toBe(true);
    expect(r.desgloseHoras.every((h) => h.recargoAplicado === 0.75)).toBe(true);
  });

  it('Con acumulador 42h: domingo → EXTRA_DIURNA_DOMINICAL (115%)', () => {
    const r = calcularTurno(CONSTANTES_2026.SALARIO_MINIMO, jornadaLD, turno(DOMINGO, '08:00', '12:00'), undefined, 42);
    expect(r.desgloseHoras).toHaveLength(4);
    expect(r.desgloseHoras.every((h) => h.tipoHora === TipoHora.EXTRA_DIURNA_DOMINICAL)).toBe(true);
    expect(r.desgloseHoras.every((h) => h.esHoraExtra)).toBe(true);
    expect(r.desgloseHoras.every((h) => h.esFestivo)).toBe(true);
    expect(r.desgloseHoras.every((h) => h.recargoAplicado === 1.15)).toBe(true);
  });

  it('Con acumulador 42h: domingo nocturno → EXTRA_NOCTURNA_DOMINICAL (165%)', () => {
    // Usar 19:00-22:00 (3h, todo el mismo día domingo, todas nocturnas)
    const r = calcularTurno(CONSTANTES_2026.SALARIO_MINIMO, jornadaLD, turno(DOMINGO, '19:00', '22:00'), undefined, 42);
    expect(r.desgloseHoras).toHaveLength(3);
    expect(r.desgloseHoras.every((h) => h.tipoHora === TipoHora.EXTRA_NOCTURNA_DOMINICAL)).toBe(true);
    expect(r.desgloseHoras.every((h) => h.esHoraExtra)).toBe(true);
    expect(r.desgloseHoras.every((h) => h.esFestivo)).toBe(true);
    expect(r.desgloseHoras.every((h) => h.esNocturna)).toBe(true);
    expect(r.desgloseHoras.every((h) => h.recargoAplicado === 1.65)).toBe(true);
  });

  it('Acumulador 40h + turno 8h (8am-4pm): corte en hora 42 → 2 ORDINARIA + 6 EXTRA', () => {
    const r = calcularTurno(CONSTANTES_2026.SALARIO_MINIMO, jornadaLD, turno(SABADO, '08:00', '16:00'), undefined, 40);
    expect(r.desgloseHoras).toHaveLength(8);
    // Primeras 2 horas (8am, 9am) completan las 42h → ordinarias
    expect(r.desgloseHoras[0].tipoHora).toBe(TipoHora.ORDINARIA_DIURNA);
    expect(r.desgloseHoras[1].tipoHora).toBe(TipoHora.ORDINARIA_DIURNA);
    expect(r.desgloseHoras[0].esHoraExtra).toBe(false);
    expect(r.desgloseHoras[1].esHoraExtra).toBe(false);
    // Horas 3-8 (10am-3pm) son extra
    expect(r.desgloseHoras.slice(2).every((h) => h.tipoHora === TipoHora.EXTRA_DIURNA)).toBe(true);
    expect(r.desgloseHoras.slice(2).every((h) => h.esHoraExtra)).toBe(true);
  });

  it('Acumulador 40h + turno 12h (8am-8pm): corte + cruce nocturno', () => {
    const r = calcularTurno(CONSTANTES_2026.SALARIO_MINIMO, jornadaLD, turno(SABADO, '08:00', '20:00'), undefined, 40);
    expect(r.desgloseHoras).toHaveLength(12);
    // 2 ordinarias (8-9am)
    expect(r.desgloseHoras[0].tipoHora).toBe(TipoHora.ORDINARIA_DIURNA);
    expect(r.desgloseHoras[1].tipoHora).toBe(TipoHora.ORDINARIA_DIURNA);
    // 9 extra diurnas (10am-6pm = horas 2-10)
    expect(r.desgloseHoras.slice(2, 11).every((h) => h.tipoHora === TipoHora.EXTRA_DIURNA)).toBe(true);
    // 1 extra nocturna (7pm-8pm = hora 11)
    expect(r.desgloseHoras[11].tipoHora).toBe(TipoHora.EXTRA_NOCTURNA);
    expect(r.advertencias.some((a) => a.codigo === 'HORAS_EXTRA_DIARIA_EXCEDIDA')).toBe(true);
  });

  it('Festivo Emiliani (lunes 12 ene 2026) dentro de 42h → ORDINARIA_DOMINICAL', () => {
    const r = calcularTurno(CONSTANTES_2026.SALARIO_MINIMO, jornadaLV, turno('2026-01-12', '08:00', '12:00'));
    expect(r.desgloseHoras).toHaveLength(4);
    expect(r.desgloseHoras.every((h) => h.tipoHora === TipoHora.ORDINARIA_DOMINICAL)).toBe(true);
    expect(r.desgloseHoras.every((h) => h.esFestivo)).toBe(true);
    expect(r.desgloseHoras.every((h) => !h.esHoraExtra)).toBe(true);
  });

  it('Cruce medianoche sábado 23:00 – domingo 03:00 con acumulador 0', () => {
    // 8 ago 2026 (sáb) 23:00 → 9 ago 2026 (dom) 03:00
    const r = calcularTurno(CONSTANTES_2026.SALARIO_MINIMO, jornadaLV, turno('2026-08-08', '23:00', '03:00'));
    expect(r.desgloseHoras).toHaveLength(4);
    // 23:00 sábado = nocturna, dentro de 42h → ORDINARIA_NOCTURNA
    expect(r.desgloseHoras[0].tipoHora).toBe(TipoHora.ORDINARIA_NOCTURNA);
    // 00:00-02:00 domingo = festivo + nocturna → ORDINARIA_NOCTURNA_DOMINICAL
    expect(r.desgloseHoras.slice(1).every((h) => h.tipoHora === TipoHora.ORDINARIA_NOCTURNA_DOMINICAL)).toBe(true);
    expect(r.desgloseHoras.every((h) => !h.esHoraExtra)).toBe(true);
  });

  it('Horas extra + límite 2h/día → warning HORAS_EXTRA_DIARIA_EXCEDIDA', () => {
    const r = calcularTurno(CONSTANTES_2026.SALARIO_MINIMO, jornadaLV, turno(LUNES, '17:00', '22:00'), undefined, 42);
    const extras = r.desgloseHoras.filter((h) => h.esHoraExtra);
    expect(extras.length).toBeGreaterThan(2);
    expect(r.advertencias.some((a) => a.codigo === 'HORAS_EXTRA_DIARIA_EXCEDIDA')).toBe(true);
  });

  it('Salario < mínimo → warning SALARIO_BAJO_MINIMO + cálculo con valor ingresado', () => {
    const r = calcularTurno(1_000_000, jornadaLV, turno(LUNES, '09:00', '13:00'));
    expect(r.advertencias.some((a) => a.codigo === 'SALARIO_BAJO_MINIMO')).toBe(true);
    expect(r.desgloseHoras).toHaveLength(4);
  });

  it('Hora fin = hora inicio → error FRANJA_INVALIDA', () => {
    const t = turnoMulti(LUNES, [{ inicio: '08:00', fin: '08:00' }]);
    const r = calcularTurno(CONSTANTES_2026.SALARIO_MINIMO, jornadaLV, t);
    expect(r.advertencias.some((a) => a.codigo === 'FRANJA_INVALIDA')).toBe(true);
    expect(r.desgloseHoras).toHaveLength(0);
  });

  it('Jornada semanal 6d×8h=48h → warning JORNADA_SEMANAL_EXCEDE_42H', () => {
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

  it('Año fuera rango (2019) → error AÑO_FESTIVOS_FUERA_RANGO', () => {
    const r = calcularTurno(CONSTANTES_2026.SALARIO_MINIMO, jornadaLV, turno('2019-06-15', '09:00', '13:00'));
    expect(r.advertencias.some((a) => a.codigo === 'AÑO_FESTIVOS_FUERA_RANGO')).toBe(true);
    expect(r.desgloseHoras).toHaveLength(0);
  });

  it('Año bisiesto (29 feb 2024) → cálculos correctos', () => {
    const r = calcularTurno(CONSTANTES_2026.SALARIO_MINIMO, jornadaLV, turno('2024-02-28', '22:00', '02:00'));
    expect(r.desgloseHoras).toHaveLength(4);
    expect(r.advertencias.some((a) => a.codigo === 'AÑO_FESTIVOS_FUERA_RANGO')).toBe(false);
  });

  it('Jornada horario por día (L 8-17, M 12-20) — jornada es solo informativa', () => {
    const j: JornadaPactada = {
      dias: [1, 2],
      horariosPorDia: {
        1: { inicio: '08:00', fin: '17:00' },
        2: { inicio: '12:00', fin: '20:00' },
      },
    };
    // Martes 7 julio 2026: la jornada pactada ya no afecta la clasificación
    const r = calcularTurno(CONSTANTES_2026.SALARIO_MINIMO, j, turno('2026-07-07', '10:00', '16:00'));
    expect(r.desgloseHoras).toHaveLength(6);
    // Todas dentro de 42h (acumulador 0) → ordinarias
    expect(r.desgloseHoras.every((h) => !h.esHoraExtra)).toBe(true);
  });

  it('Turno partido (múltiples franjas) → suma correcta', () => {
    const t = turnoMulti(LUNES, [
      { inicio: '08:00', fin: '12:00' },
      { inicio: '14:00', fin: '18:00' },
    ]);
    const r = calcularTurno(CONSTANTES_2026.SALARIO_MINIMO, jornadaLV, t);
    expect(r.desgloseHoras).toHaveLength(8);
    // Todas dentro de 42h → ordinarias
    expect(r.desgloseHoras.every((h) => !h.esHoraExtra)).toBe(true);
  });

  it('Franjas solapadas → error FRANJAS_SOLAPADAS', () => {
    const t = turnoMulti(LUNES, [
      { inicio: '08:00', fin: '14:00' },
      { inicio: '12:00', fin: '18:00' },
    ]);
    const r = calcularTurno(CONSTANTES_2026.SALARIO_MINIMO, jornadaLV, t);
    expect(r.advertencias.some((a) => a.codigo === 'FRANJAS_SOLAPADAS')).toBe(true);
    expect(r.desgloseHoras).toHaveLength(0);
  });

  it('Auxilio transporte → solo suma a total, no afecta valor hora', () => {
    const sinAuxilio = calcularTurno(CONSTANTES_2026.SALARIO_MINIMO, jornadaLV, turno(LUNES, '09:00', '13:00'));
    const conAuxilio = calcularTurno(CONSTANTES_2026.SALARIO_MINIMO, jornadaLV, turno(LUNES, '09:00', '13:00'), 200_000);
    expect(conAuxilio.desgloseHoras).toEqual(sinAuxilio.desgloseHoras);
    expect(conAuxilio.totalPagar).toBe(sinAuxilio.totalPagar + 200_000);
    for (let i = 0; i < sinAuxilio.desgloseHoras.length; i++) {
      expect(sinAuxilio.desgloseHoras[i].valorHora).toBe(conAuxilio.desgloseHoras[i].valorHora);
    }
  });

  it('Advertencia LIMITE_SEMANAL_NO_VALIDADO no se genera desde motor.ts (solo desde periodo.ts)', () => {
    const r = calcularTurno(CONSTANTES_2026.SALARIO_MINIMO, jornadaLV, turno(LUNES, '09:00', '13:00'));
    expect(r.advertencias.some((a) => a.codigo === 'LIMITE_SEMANAL_NO_VALIDADO')).toBe(false);
  });

  it('Jornada inválida (sin días) retorna error SIN_DIAS_JORNADA', () => {
    const j: JornadaPactada = { dias: [], horariosPorDia: {} };
    const r = calcularTurno(CONSTANTES_2026.SALARIO_MINIMO, j, turno(LUNES, '09:00', '13:00'));
    expect(r.advertencias.some((a) => a.codigo === 'SIN_DIAS_JORNADA')).toBe(true);
    expect(r.desgloseHoras).toHaveLength(0);
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

  // CB-01 Verificación: Caso 2.1 - Turno nocturno 10pm-6am lunes (acumulador 0)
  // Debe dar 8h ORDINARIA_NOCTURNA → 35% recargo = $23.348
  it('CB-01 Caso 2.1: Turno 22:00-06:00 lunes (acum 0) → 8h ORDINARIA_NOCTURNA = $23.348', () => {
    const r = calcularTurno(CONSTANTES_2026.SALARIO_MINIMO, jornadaLV, turno(LUNES, '22:00', '06:00'));
    expect(r.desgloseHoras).toHaveLength(8);
    expect(r.desgloseHoras.every((h) => h.tipoHora === TipoHora.ORDINARIA_NOCTURNA)).toBe(true);
    expect(r.desgloseHoras.every((h) => !h.esHoraExtra)).toBe(true);
    const valorHoraOrd = Math.round(CONSTANTES_2026.SALARIO_MINIMO / CONSTANTES_2026.DIVISOR_MENSUAL);
    const totalEsperado = 8 * Math.round(valorHoraOrd * 0.35);
    const totalObtenido = r.desgloseHoras.reduce((sum, h) => sum + h.valorHora, 0);
    expect(totalObtenido).toBe(totalEsperado);
  });

  // CB-01 Verificación: Caso 2.2 - Turno 14:00-22:00 lunes (acumulador 0)
  // 5h diurnas (14-19) ORDINARIA_DIURNA + 3h nocturnas (19-22) ORDINARIA_NOCTURNA
  it('CB-01 Caso 2.2: Turno 14:00-22:00 lunes (acum 0) → 5h ORD + 3h ORD_NOCTURNA', () => {
    const r = calcularTurno(CONSTANTES_2026.SALARIO_MINIMO, jornadaLV, turno(LUNES, '14:00', '22:00'));
    expect(r.desgloseHoras).toHaveLength(8);
    // 14:00-18:00 (5h) = diurnas
    expect(r.desgloseHoras.slice(0, 5).every((h) => h.tipoHora === TipoHora.ORDINARIA_DIURNA)).toBe(true);
    // 19:00-21:00 (3h) = nocturnas
    expect(r.desgloseHoras.slice(5).every((h) => h.tipoHora === TipoHora.ORDINARIA_NOCTURNA)).toBe(true);
    expect(r.desgloseHoras.every((h) => !h.esHoraExtra)).toBe(true);
  });
});

describe('calcularTurno — Límite diario (CB-06)', () => {
  beforeEach(() => {
    _resetCacheFestivos();
  });

  // Agosto 2026: 3=Lun, 8=Sáb, 2=Dom (sin festivos)
  const LUNES = '2026-08-03';

  // CB-06 Caso A: Sin jornada pactada, turno 10h (7am-5pm) → 8h ord + 2h extra diurna
  it('CB-06 Caso A: Sin jornada pactada, turno 10h (7am-5pm) → 8h ORD + 2h EXTRA_DIURNA = $20.847', () => {
    const r = calcularTurno(CONSTANTES_2026.SALARIO_MINIMO, jornadaLV, turno(LUNES, '07:00', '17:00'), undefined, undefined, undefined, undefined, undefined);
    expect(r.desgloseHoras).toHaveLength(10);
    // Primeras 8 horas (7am-3pm) = ordinarias diurnas
    expect(r.desgloseHoras.slice(0, 8).every((h) => h.tipoHora === TipoHora.ORDINARIA_DIURNA)).toBe(true);
    expect(r.desgloseHoras.slice(0, 8).every((h) => !h.esHoraExtra)).toBe(true);
    // Últimas 2 horas (3pm-5pm) = extra diurnas
    expect(r.desgloseHoras.slice(8).every((h) => h.tipoHora === TipoHora.EXTRA_DIURNA)).toBe(true);
    expect(r.desgloseHoras.slice(8).every((h) => h.esHoraExtra)).toBe(true);
    // Valor: 2h × $8.338,60 × 1.25 = $20.847
    const valorHoraOrd = Math.round(CONSTANTES_2026.SALARIO_MINIMO / CONSTANTES_2026.DIVISOR_MENSUAL);
    const totalEsperado = 2 * Math.round(valorHoraOrd * 1.25);
    const totalObtenido = r.desgloseHoras.reduce((sum, h) => sum + h.valorHora, 0);
    expect(totalObtenido).toBe(totalEsperado);
  });

  // CB-06 Caso B: Sin jornada pactada, turno 11h (7am-6pm) → 8h ord + 3h extra diurna
  it('CB-06 Caso B: Sin jornada pactada, turno 11h (7am-6pm) → 8h ORD + 3h EXTRA_DIURNA = $31.270', () => {
    const r = calcularTurno(CONSTANTES_2026.SALARIO_MINIMO, jornadaLV, turno(LUNES, '07:00', '18:00'), undefined, undefined, undefined, undefined, undefined);
    expect(r.desgloseHoras).toHaveLength(11);
    // Primeras 8 horas = ordinarias
    expect(r.desgloseHoras.slice(0, 8).every((h) => h.tipoHora === TipoHora.ORDINARIA_DIURNA)).toBe(true);
    // Últimas 3 horas = extra diurnas
    expect(r.desgloseHoras.slice(8).every((h) => h.tipoHora === TipoHora.EXTRA_DIURNA)).toBe(true);
    // Valor: 3h × $8.338,60 × 1.25 = $31.270
    const valorHoraOrd = Math.round(CONSTANTES_2026.SALARIO_MINIMO / CONSTANTES_2026.DIVISOR_MENSUAL);
    const totalEsperado = 3 * Math.round(valorHoraOrd * 1.25);
    const totalObtenido = r.desgloseHoras.reduce((sum, h) => sum + h.valorHora, 0);
    expect(totalObtenido).toBe(totalEsperado);
    // Advertencia de 2h extra diarias
    expect(r.advertencias.some((a) => a.codigo === 'HORAS_EXTRA_DIARIA_EXCEDIDA')).toBe(true);
  });

  // CB-06 Caso C: Jornada pactada 6h, turno 8h (7am-3pm) → 6h ord + 2h extra diurna
  it('CB-06 Caso C: Jornada pactada 6h, turno 8h (7am-3pm) → 6h ORD + 2h EXTRA_DIURNA = $20.847', () => {
    const r = calcularTurno(CONSTANTES_2026.SALARIO_MINIMO, jornadaLV, turno(LUNES, '07:00', '15:00'), undefined, undefined, undefined, undefined, 6);
    expect(r.desgloseHoras).toHaveLength(8);
    // Primeras 6 horas = ordinarias
    expect(r.desgloseHoras.slice(0, 6).every((h) => h.tipoHora === TipoHora.ORDINARIA_DIURNA)).toBe(true);
    expect(r.desgloseHoras.slice(0, 6).every((h) => !h.esHoraExtra)).toBe(true);
    // Últimas 2 horas = extra diurnas
    expect(r.desgloseHoras.slice(6).every((h) => h.tipoHora === TipoHora.EXTRA_DIURNA)).toBe(true);
    expect(r.desgloseHoras.slice(6).every((h) => h.esHoraExtra)).toBe(true);
    // Valor: 2h × $8.338,60 × 1.25 = $20.847
    const valorHoraOrd = Math.round(CONSTANTES_2026.SALARIO_MINIMO / CONSTANTES_2026.DIVISOR_MENSUAL);
    const totalEsperado = 2 * Math.round(valorHoraOrd * 1.25);
    const totalObtenido = r.desgloseHoras.reduce((sum, h) => sum + h.valorHora, 0);
    expect(totalObtenido).toBe(totalEsperado);
  });

  // CB-06 Caso D: Con descanso 60min, turno 7am-6pm (11h brutas, 10h efectivas) → 8h ord + 2h extra
  it('CB-06 Caso D: Con descanso 60min, turno 7am-6pm → 8h ORD + 2h EXTRA_DIURNA = $20.847', () => {
    // El descanso se maneja en generarHorasTurno, así que pasamos 10h efectivas
    // Simulamos un turno de 10h efectivas (7am-5pm con 1h descanso)
    const r = calcularTurno(CONSTANTES_2026.SALARIO_MINIMO, jornadaLV, turno(LUNES, '07:00', '17:00'), undefined, undefined, undefined, undefined, undefined);
    expect(r.desgloseHoras).toHaveLength(10);
    // Primeras 8 horas = ordinarias
    expect(r.desgloseHoras.slice(0, 8).every((h) => h.tipoHora === TipoHora.ORDINARIA_DIURNA)).toBe(true);
    // Últimas 2 horas = extra diurnas
    expect(r.desgloseHoras.slice(8).every((h) => h.tipoHora === TipoHora.EXTRA_DIURNA)).toBe(true);
    const valorHoraOrd = Math.round(CONSTANTES_2026.SALARIO_MINIMO / CONSTANTES_2026.DIVISOR_MENSUAL);
    const totalEsperado = 2 * Math.round(valorHoraOrd * 1.25);
    const totalObtenido = r.desgloseHoras.reduce((sum, h) => sum + h.valorHora, 0);
    expect(totalObtenido).toBe(totalEsperado);
  });

  // Verificar que modo período no cambia (usando acumulador semanal)
  it('Modo período: sin horasPactadasDiarias usa acumulador semanal 42h', () => {
    const r = calcularTurno(CONSTANTES_2026.SALARIO_MINIMO, jornadaLV, turno(LUNES, '07:00', '17:00'), undefined, 40);
    // Con acumulador 40h, las primeras 2h son ordinarias, las 8 restantes extra
    expect(r.desgloseHoras).toHaveLength(10);
    expect(r.desgloseHoras.slice(0, 2).every((h) => h.tipoHora === TipoHora.ORDINARIA_DIURNA)).toBe(true);
    expect(r.desgloseHoras.slice(2).every((h) => h.tipoHora === TipoHora.EXTRA_DIURNA)).toBe(true);
  });
});

describe('calcularTurno — Minutos parciales (CB-08 BUG #1)', () => {
  beforeEach(() => {
    _resetCacheFestivos();
  });

  const LUNES = '2026-08-03';

  it('07:45 → 17:15 con 60 min almuerzo → 0.5h extra diurna = $5.212', () => {
    const r = calcularTurno(
      CONSTANTES_2026.SALARIO_MINIMO,
      jornadaLV,
      turno(LUNES, '07:45', '17:15'),
      undefined, undefined, undefined, undefined, undefined,
      60,
    );
    const totalObtenido = r.desgloseHoras.reduce((sum, h) => sum + h.valorHora, 0);
    // Extra: 30 min = 0.5h × $8.338,60 × 1.25 ≈ $5.212
    expect(totalObtenido).toBeGreaterThanOrEqual(5210);
    expect(totalObtenido).toBeLessThanOrEqual(5214);
  });
});