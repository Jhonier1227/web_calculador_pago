import { describe, it, expect } from 'vitest';
import { clasificarHora, esDiaConRecargoDominical, esHoraNocturna, estaDentroDeJornada, esDiaLaboralHabitual } from './clasificacion';
import { TipoHora } from './tipos';
import type { JornadaPactada } from './tipos';

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

function localDate(anio: number, mes: number, dia: number, hora = 12, min = 0): Date {
  return new Date(anio, mes, dia, hora, min);
}

describe('clasificarHora — Nueva lógica: acumulador semanal 42h (CB-01)', () => {
  // Julio 2026: 6=Lun, 11=Sáb, 12=Dom (sin festivos)
  const LUNES_NO_FESTIVO = localDate(2026, 6, 6);    // 6 jul 2026 = Lunes
  const SABADO_NO_FESTIVO = localDate(2026, 6, 11);  // 11 jul 2026 = Sábado
  const DOMINGO_NO_FESTIVO = localDate(2026, 6, 12); // 12 jul 2026 = Domingo
  const MARTES_NO_FESTIVO = localDate(2026, 6, 7);   // 7 jul 2026 = Martes
  const VIERNES_NO_FESTIVO = localDate(2026, 6, 10); // 10 jul 2026 = Viernes

  const diasDescansoEstandar: number[] = [0]; // Domingo
  const tipoEstandar: 'estandar' | 'rotativo' = 'estandar';

  it('Horas 0-41 (dentro de 42h): ordinaria diurna → 0%', () => {
    const r = clasificarHora(10, LUNES_NO_FESTIVO, 0, diasDescansoEstandar, tipoEstandar); // Lunes 10am, 0h acumuladas
    expect(r.tipoHora).toBe(TipoHora.ORDINARIA_DIURNA);
    expect(r.recargo).toBe(0);
    expect(r.esHoraExtra).toBe(false);
  });

  it('Horas 0-41 (dentro de 42h): ordinaria nocturna → 35%', () => {
    const r = clasificarHora(22, LUNES_NO_FESTIVO, 0, diasDescansoEstandar, tipoEstandar); // Lunes 10pm, 0h acumuladas
    expect(r.tipoHora).toBe(TipoHora.ORDINARIA_NOCTURNA);
    expect(r.recargo).toBe(0.35);
    expect(r.esHoraExtra).toBe(false);
  });

  it('Horas 0-41 (dentro de 42h): ordinaria dominical diurna → 90%', () => {
    const r = clasificarHora(10, DOMINGO_NO_FESTIVO, 0, diasDescansoEstandar, tipoEstandar); // Domingo 10am, 0h acumuladas
    expect(r.tipoHora).toBe(TipoHora.ORDINARIA_DOMINICAL);
    expect(r.recargo).toBe(0.9);
    expect(r.esHoraExtra).toBe(false);
  });

  it('Horas 0-41 (dentro de 42h): ordinaria dominical nocturna → 125% (35% + 90%)', () => {
    const r = clasificarHora(22, DOMINGO_NO_FESTIVO, 0, diasDescansoEstandar, tipoEstandar); // Domingo 10pm, 0h acumuladas
    expect(r.tipoHora).toBe(TipoHora.ORDINARIA_NOCTURNA_DOMINICAL);
    expect(r.recargo).toBe(1.25);
    expect(r.esHoraExtra).toBe(false);
  });

  it('Hora 42 en adelante (>= 42h): extra diurna → 25%', () => {
    const r = clasificarHora(10, SABADO_NO_FESTIVO, 42, diasDescansoEstandar, tipoEstandar); // Sábado 10am, 42h acumuladas
    expect(r.tipoHora).toBe(TipoHora.EXTRA_DIURNA);
    expect(r.recargo).toBe(0.25);
    expect(r.esHoraExtra).toBe(true);
  });

  it('Hora 42 en adelante (>= 42h): extra nocturna → 75%', () => {
    const r = clasificarHora(22, SABADO_NO_FESTIVO, 42, diasDescansoEstandar, tipoEstandar); // Sábado 10pm, 42h acumuladas
    expect(r.tipoHora).toBe(TipoHora.EXTRA_NOCTURNA);
    expect(r.recargo).toBe(0.75);
    expect(r.esHoraExtra).toBe(true);
  });

  it('Hora 42 en adelante (>= 42h): extra dominical diurna → 115% (25% + 90%)', () => {
    const r = clasificarHora(10, DOMINGO_NO_FESTIVO, 42, diasDescansoEstandar, tipoEstandar); // Domingo 10am, 42h acumuladas
    expect(r.tipoHora).toBe(TipoHora.EXTRA_DIURNA_DOMINICAL);
    expect(r.recargo).toBe(1.15);
    expect(r.esHoraExtra).toBe(true);
  });

  it('Hora 42 en adelante (>= 42h): extra dominical nocturna → 165% (75% + 90%)', () => {
    const r = clasificarHora(22, DOMINGO_NO_FESTIVO, 42, diasDescansoEstandar, tipoEstandar); // Domingo 10pm, 42h acumuladas
    expect(r.tipoHora).toBe(TipoHora.EXTRA_NOCTURNA_DOMINICAL);
    expect(r.recargo).toBe(1.65);
    expect(r.esHoraExtra).toBe(true);
  });

  it('Turno rotativo con día de descanso martes (2): martes es dominical', () => {
    const diasDescansoRotativo: number[] = [2]; // Martes
    const tipoRotativo: 'estandar' | 'rotativo' = 'rotativo';
    const r = clasificarHora(10, MARTES_NO_FESTIVO, 0, diasDescansoRotativo, tipoRotativo); // Martes 10am
    expect(r.tipoHora).toBe(TipoHora.ORDINARIA_DOMINICAL);
    expect(r.recargo).toBe(0.9);
    expect(r.esHoraExtra).toBe(false);
  });

  it('Turno rotativo con 2 días descanso (martes y viernes): viernes es dominical', () => {
    const diasDescansoRotativo: number[] = [2, 5]; // Martes y viernes
    const tipoRotativo: 'estandar' | 'rotativo' = 'rotativo';
    const r = clasificarHora(10, VIERNES_NO_FESTIVO, 0, diasDescansoRotativo, tipoRotativo); // Viernes 10am
    expect(r.tipoHora).toBe(TipoHora.ORDINARIA_DOMINICAL);
    expect(r.recargo).toBe(0.9);
    expect(r.esHoraExtra).toBe(false);
  });
});

describe('esDiaConRecargoDominical', () => {
  // Julio 2026
  const DOMINGO = localDate(2026, 6, 12); // 12 jul = Domingo
  const LUNES = localDate(2026, 6, 6);    // 6 jul = Lunes
  const MARTES = localDate(2026, 6, 7);   // 7 jul = Martes
  const VIERNES = localDate(2026, 6, 10); // 10 jul = Viernes

  it('estandar: domingo (0) → true', () => {
    expect(esDiaConRecargoDominical(DOMINGO, [0], 'estandar')).toBe(true);
  });

  it('estandar: lunes (1) → false', () => {
    expect(esDiaConRecargoDominical(LUNES, [0], 'estandar')).toBe(false);
  });

  it('rotativo: día descanso martes (2) → true', () => {
    expect(esDiaConRecargoDominical(MARTES, [2], 'rotativo')).toBe(true);
  });

  it('rotativo: día no descanso → false', () => {
    expect(esDiaConRecargoDominical(LUNES, [2], 'rotativo')).toBe(false);
  });

  it('rotativo: 2 días descanso (martes y viernes) → ambos true', () => {
    expect(esDiaConRecargoDominical(MARTES, [2, 5], 'rotativo')).toBe(true);
    expect(esDiaConRecargoDominical(VIERNES, [2, 5], 'rotativo')).toBe(true);
  });
});

describe('esHoraNocturna', () => {
  it('19:00 (7pm) → true', () => {
    expect(esHoraNocturna(19)).toBe(true);
  });

  it('05:00 (5am) → true', () => {
    expect(esHoraNocturna(5)).toBe(true);
  });

  it('06:00 (6am) → false', () => {
    expect(esHoraNocturna(6)).toBe(false);
  });

  it('18:00 (6pm) → false', () => {
    expect(esHoraNocturna(18)).toBe(false);
  });

  it('00:00 (medianoche) → true', () => {
    expect(esHoraNocturna(0)).toBe(true);
  });
});

describe('estaDentroDeJornada — legacy (always true)', () => {
  it('always returns true for backward compatibility', () => {
    expect(estaDentroDeJornada(localDate(2026, 5, 15), jornadaLV)).toBe(true);
  });
});

describe('esDiaLaboralHabitual — legacy (always true)', () => {
  it('always returns true for backward compatibility', () => {
    expect(esDiaLaboralHabitual(localDate(2026, 5, 15), jornadaLV)).toBe(true);
  });
});