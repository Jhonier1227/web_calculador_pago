import { describe, it, expect } from 'vitest';
import { validarConfiguracionPeriodo } from './periodo';
import { LEGAL_LIMITS } from './constantes';
import type { ConfiguracionPeriodo } from './tipos';

function crearConfig(overrides?: Partial<ConfiguracionPeriodo>): ConfiguracionPeriodo {
  return {
    fechaInicio: '2026-07-06',
    fechaFin: '2026-07-10',
    bloques: [{
      id: 'b1',
      fechaInicio: '2026-07-06',
      fechaFin: '2026-07-10',
      horariosPorDia: {
        1: { inicio: '08:00', fin: '17:00' },
        2: { inicio: '08:00', fin: '17:00' },
        3: { inicio: '08:00', fin: '17:00' },
        4: { inicio: '08:00', fin: '17:00' },
        5: { inicio: '08:00', fin: '17:00' },
      },
      tipoJornada: 'estandar',
      diasDescanso: [0],
    }],
    ...overrides,
  };
}

describe('validarConfiguracionPeriodo', () => {
  it('acepta configuración válida con un bloque', () => {
    const config = crearConfig();
    const errores = validarConfiguracionPeriodo(config);
    expect(errores.filter((e) => e.severidad === 'error')).toHaveLength(0);
  });

  it('acepta configuración válida con múltiples bloques', () => {
    const config = crearConfig({
      fechaInicio: '2026-07-01',
      fechaFin: '2026-07-31',
      bloques: [
        {
          id: 'b1', fechaInicio: '2026-07-06', fechaFin: '2026-07-10',
          horariosPorDia: { 1: { inicio: '08:00', fin: '17:00' } },
          tipoJornada: 'estandar', diasDescanso: [0],
        },
        {
          id: 'b2', fechaInicio: '2026-07-13', fechaFin: '2026-07-17',
          horariosPorDia: { 1: { inicio: '09:00', fin: '18:00' } },
          tipoJornada: 'estandar', diasDescanso: [0],
        },
      ],
    });
    const errores = validarConfiguracionPeriodo(config);
    expect(errores.filter((e) => e.severidad === 'error')).toHaveLength(0);
  });

  it('rechaza fecha fin anterior a fecha inicio', () => {
    const config = crearConfig({ fechaInicio: '2026-07-10', fechaFin: '2026-07-06' });
    const errores = validarConfiguracionPeriodo(config);
    expect(errores.some((e) => e.codigo === 'RANGO_FECHA_INVALIDO')).toBe(true);
  });

  it('rechaza período sin bloques', () => {
    const config = crearConfig({ bloques: [] });
    const errores = validarConfiguracionPeriodo(config);
    expect(errores.some((e) => e.codigo === 'PERIODO_SIN_DIAS')).toBe(true);
  });

  it('rechaza bloques solapados', () => {
    const config = crearConfig({
      bloques: [
        {
          id: 'b1', fechaInicio: '2026-07-06', fechaFin: '2026-07-10',
          horariosPorDia: { 1: { inicio: '08:00', fin: '17:00' } },
          tipoJornada: 'estandar', diasDescanso: [0],
        },
        {
          id: 'b2', fechaInicio: '2026-07-08', fechaFin: '2026-07-12',
          horariosPorDia: { 1: { inicio: '09:00', fin: '18:00' } },
          tipoJornada: 'estandar', diasDescanso: [0],
        },
      ],
    });
    const errores = validarConfiguracionPeriodo(config);
    expect(errores.some((e) => e.codigo === 'BLOQUES_SOLAPADOS')).toBe(true);
  });

  it('rechaza bloque fuera del rango del período', () => {
    const config = crearConfig({
      bloques: [{
        id: 'b1', fechaInicio: '2026-07-01', fechaFin: '2026-07-05',
        horariosPorDia: { 1: { inicio: '08:00', fin: '17:00' } },
        tipoJornada: 'estandar', diasDescanso: [0],
      }],
    });
    const errores = validarConfiguracionPeriodo(config);
    expect(errores.some((e) => e.codigo === 'BLOQUE_FUERA_RANGO')).toBe(true);
  });

  it('genera warning si período excede límite de días', () => {
    const inicio = '2026-07-01';
    const fin = '2026-08-15';
    const config = crearConfig({ fechaInicio: inicio, fechaFin: fin });
    const errores = validarConfiguracionPeriodo(config);
    const diffMs = new Date(fin + 'T12:00:00').getTime() - new Date(inicio + 'T12:00:00').getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;
    expect(diffDays).toBeGreaterThan(LEGAL_LIMITS.MAX_DIAS_PERIODO);
    expect(errores.some((e) => e.codigo === 'RANGO_EXCEDE_31_DIAS')).toBe(true);
    expect(errores.some((e) => e.mensaje.includes(String(LEGAL_LIMITS.MAX_DIAS_PERIODO)))).toBe(true);
  });
});