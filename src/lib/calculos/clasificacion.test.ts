import { describe, it, expect } from 'vitest';
import { clasificarHora, estaDentroDeJornada, esDiaLaboralHabitual } from './clasificacion';
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

describe('clasificarHora — Tabla de 8 casos (RF-05)', () => {
  it('Caso 1: Dentro jornada, NO festivo, NO nocturna → ORDINARIA_DIURNA (0%)', () => {
    const r = clasificarHora(false, true, false);
    expect(r.tipoHora).toBe(TipoHora.ORDINARIA_DIURNA);
    expect(r.recargo).toBe(0);
    expect(r.esHoraExtra).toBe(false);
  });

  it('Caso 2: Dentro jornada, NO festivo, SÍ nocturna → RECARGO_NOCTURNO (35%)', () => {
    const r = clasificarHora(false, true, true);
    expect(r.tipoHora).toBe(TipoHora.RECARGO_NOCTURNO);
    expect(r.recargo).toBe(0.35);
    expect(r.esHoraExtra).toBe(false);
  });

  it('Caso 3: Dentro jornada, SÍ festivo, NO nocturna → RECARGO_DOMINICAL_DIURNO (90%)', () => {
    const r = clasificarHora(true, true, false);
    expect(r.tipoHora).toBe(TipoHora.RECARGO_DOMINICAL_DIURNO);
    expect(r.recargo).toBe(0.90);
    expect(r.esHoraExtra).toBe(false);
  });

  it('Caso 4: Dentro jornada, SÍ festivo, SÍ nocturna → RECARGO_DOMINICAL_NOCTURNO (125%)', () => {
    const r = clasificarHora(true, true, true);
    expect(r.tipoHora).toBe(TipoHora.RECARGO_DOMINICAL_NOCTURNO);
    expect(r.recargo).toBe(1.25);
    expect(r.esHoraExtra).toBe(false);
  });

  it('Caso 5: Fuera jornada, NO festivo, NO nocturna → EXTRA_DIURNA (25%)', () => {
    const r = clasificarHora(false, false, false);
    expect(r.tipoHora).toBe(TipoHora.EXTRA_DIURNA);
    expect(r.recargo).toBe(0.25);
    expect(r.esHoraExtra).toBe(true);
  });

  it('Caso 6: Fuera jornada, NO festivo, SÍ nocturna → EXTRA_NOCTURNA (75%)', () => {
    const r = clasificarHora(false, false, true);
    expect(r.tipoHora).toBe(TipoHora.EXTRA_NOCTURNA);
    expect(r.recargo).toBe(0.75);
    expect(r.esHoraExtra).toBe(true);
  });

  it('Caso 7: Fuera jornada, SÍ festivo, NO nocturna → EXTRA_DOMINICAL_DIURNA (115%)', () => {
    const r = clasificarHora(true, false, false);
    expect(r.tipoHora).toBe(TipoHora.EXTRA_DOMINICAL_DIURNA);
    expect(r.recargo).toBe(1.15);
    expect(r.esHoraExtra).toBe(true);
  });

  it('Caso 8: Fuera jornada, SÍ festivo, SÍ nocturna → EXTRA_DOMINICAL_NOCTURNA (165%)', () => {
    const r = clasificarHora(true, false, true);
    expect(r.tipoHora).toBe(TipoHora.EXTRA_DOMINICAL_NOCTURNA);
    expect(r.recargo).toBe(1.65);
    expect(r.esHoraExtra).toBe(true);
  });
});

describe('esDiaLaboralHabitual', () => {
  it('lunes (15 jun) es laboral en jornada L-V', () => {
    expect(esDiaLaboralHabitual(localDate(2026, 5, 15), jornadaLV)).toBe(true);
  });

  it('sábado (20 jun) NO es laboral en jornada L-V', () => {
    expect(esDiaLaboralHabitual(localDate(2026, 5, 20), jornadaLV)).toBe(false);
  });

  it('domingo (21 jun) NO es laboral en jornada L-V', () => {
    expect(esDiaLaboralHabitual(localDate(2026, 5, 21), jornadaLV)).toBe(false);
  });

  it('domingo SÍ es laboral si está en jornada L-D', () => {
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
    expect(esDiaLaboralHabitual(localDate(2026, 5, 21), jornadaLD)).toBe(true);
  });
});

describe('estaDentroDeJornada', () => {
  it('10:00 lunes está dentro de jornada L-V 8-17', () => {
    expect(estaDentroDeJornada(localDate(2026, 5, 15, 10), jornadaLV)).toBe(true);
  });

  it('07:59 lunes NO está dentro de jornada L-V 8-17', () => {
    expect(estaDentroDeJornada(localDate(2026, 5, 15, 7, 59), jornadaLV)).toBe(false);
  });

  it('17:00 lunes NO está dentro (fin exclusivo)', () => {
    expect(estaDentroDeJornada(localDate(2026, 5, 15, 17), jornadaLV)).toBe(false);
  });

  it('sábado NO está dentro (no es día laboral)', () => {
    expect(estaDentroDeJornada(localDate(2026, 5, 20, 10), jornadaLV)).toBe(false);
  });

  it('jornada con horario por día', () => {
    const j: JornadaPactada = {
      dias: [1, 2],
      horariosPorDia: {
        1: { inicio: '08:00', fin: '17:00' },
        2: { inicio: '12:00', fin: '20:00' },
      },
    };
    expect(estaDentroDeJornada(localDate(2026, 5, 15, 10), j)).toBe(true); // Lun 10am
    expect(estaDentroDeJornada(localDate(2026, 5, 15, 18), j)).toBe(false); // Lun 6pm
    expect(estaDentroDeJornada(localDate(2026, 5, 16, 10), j)).toBe(false); // Mar 10am
    expect(estaDentroDeJornada(localDate(2026, 5, 16, 15), j)).toBe(true); // Mar 3pm
  });

  it('jornada nocturna que cruza medianoche (22:00-06:00) para un día', () => {
    const j: JornadaPactada = {
      dias: [1],
      horariosPorDia: {
        1: { inicio: '22:00', fin: '06:00' },
      },
    };
    // Las horas del LUNES antes de medianoche están dentro
    expect(estaDentroDeJornada(localDate(2026, 5, 15, 23), j)).toBe(true); // Lun 11pm
    expect(estaDentroDeJornada(localDate(2026, 5, 15, 22), j)).toBe(true); // Lun 10pm
    // Las horas del LUNES antes del inicio están fuera
    expect(estaDentroDeJornada(localDate(2026, 5, 15, 21), j)).toBe(false); // Lun 9pm
    // Madrugada del LUNES (ej. 05:00) también está dentro
    expect(estaDentroDeJornada(localDate(2026, 5, 15, 5), j)).toBe(true); // Lun 5am
    // Después de medianoche es MARTES (día 2) — sin horario → false
    expect(estaDentroDeJornada(localDate(2026, 5, 16, 2), j)).toBe(false); // Mar 2am
  });
});
