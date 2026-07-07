import { describe, it, expect } from 'vitest';
import { CONSTANTES_2026, RECARGO_PORCENTAJES, LEGAL_LIMITS } from './constantes';

describe('CONSTANTES_2026', () => {
  it('salario mínimo 2026 es 1.750.905', () => {
    expect(CONSTANTES_2026.SALARIO_MINIMO).toBe(1_750_905);
  });

  it('jornada semanal es 42 horas', () => {
    expect(CONSTANTES_2026.JORNADA_SEMANAL_HORAS).toBe(42);
  });

  it('divisor mensual es 210', () => {
    expect(CONSTANTES_2026.DIVISOR_MENSUAL).toBe(210);
  });

  it('inicio diurno es 6', () => {
    expect(CONSTANTES_2026.HORA_INICIO_DIURNA).toBe(6);
  });

  it('fin diurno es 19', () => {
    expect(CONSTANTES_2026.HORA_FIN_DIURNA).toBe(19);
  });

  it('recargo dominical/festivo es 0.90', () => {
    expect(CONSTANTES_2026.RECARGO_DOMINICAL_FESTIVO).toBe(0.90);
  });
});

describe('RECARGO_PORCENTAJES', () => {
  it('nocturno 35%', () => expect(RECARGO_PORCENTAJES.NOCTURNO).toBe(0.35));
  it('dominical/festivo diurno 90%', () => expect(RECARGO_PORCENTAJES.DOMINICAL_FESTIVO_DIURNO).toBe(0.90));
  it('dominical/festivo nocturno 125%', () => expect(RECARGO_PORCENTAJES.DOMINICAL_FESTIVO_NOCTURNO).toBe(1.25));
  it('extra diurna 25%', () => expect(RECARGO_PORCENTAJES.EXTRA_DIURNA).toBe(0.25));
  it('extra nocturna 75%', () => expect(RECARGO_PORCENTAJES.EXTRA_NOCTURNA).toBe(0.75));
  it('extra dominical diurna 115%', () => expect(RECARGO_PORCENTAJES.EXTRA_DOMINICAL_FESTIVA_DIURNA).toBe(1.15));
  it('extra dominical nocturna 165%', () => expect(RECARGO_PORCENTAJES.EXTRA_DOMINICAL_FESTIVA_NOCTURNA).toBe(1.65));
});

describe('LEGAL_LIMITS', () => {
  it('máximo 2 horas extra por día', () => expect(LEGAL_LIMITS.MAX_HORAS_EXTRA_DIARIAS).toBe(2));
  it('máximo 12 horas extra por semana', () => expect(LEGAL_LIMITS.MAX_HORAS_EXTRA_SEMANALES).toBe(12));
  it('turno máximo 24h', () => expect(LEGAL_LIMITS.MAX_HORAS_TURNO).toBe(24));
  it('máximo 4 franjas por día', () => expect(LEGAL_LIMITS.MAX_FRANJAS_POR_DIA).toBe(4));
  it('rango festivos mínimo 2020', () => expect(LEGAL_LIMITS.FESTIVOS_AÑO_MIN).toBe(2020));
  it('rango festivos máximo 2037', () => expect(LEGAL_LIMITS.FESTIVOS_AÑO_MAX).toBe(2037));
});
