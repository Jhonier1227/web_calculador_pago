import { describe, it, expect } from 'vitest';
import { calcularTurno } from '../../lib/calculos/index';
import type { JornadaPactada, Turno } from '../../lib/calculos/index';
import { TipoHora } from '../../lib/calculos/index';

describe('Integración: flujo completo jornada + turno → resultados', () => {
  it('turno ordinario diurno dentro de jornada → ORDINARIA_DIURNA', () => {
    const jornada: JornadaPactada = {
      dias: [1, 2, 3, 4, 5],
      horariosPorDia: {
        1: { inicio: '08:00', fin: '16:00' },
        2: { inicio: '08:00', fin: '16:00' },
        3: { inicio: '08:00', fin: '16:00' },
        4: { inicio: '08:00', fin: '16:00' },
        5: { inicio: '08:00', fin: '16:00' },
      },
    };

    const turno: Turno = {
      fecha: new Date('2026-06-24T12:00:00'),
      franjas: [{ inicio: '09:00', fin: '13:00' }],
    };

    const resultado = calcularTurno(1_750_905, jornada, turno);

    expect(resultado.desgloseHoras).toHaveLength(4);
    resultado.desgloseHoras.forEach((h) => {
      expect(h.tipoHora).toBe(TipoHora.ORDINARIA_DIURNA);
      expect(h.dentroDeJornada).toBe(true);
      expect(h.esHoraExtra).toBe(false);
    });
    const limiteWarning = resultado.advertencias.filter((a) => a.codigo === 'LIMITE_SEMANAL_NO_VALIDADO');
    expect(limiteWarning).toHaveLength(1);
  });

  it('turno extra nocturno fuera de jornada → EXTRA_NOCTURNA', () => {
    const jornada: JornadaPactada = {
      dias: [1, 2, 3, 4, 5],
      horariosPorDia: {
        1: { inicio: '08:00', fin: '16:00' },
        2: { inicio: '08:00', fin: '16:00' },
        3: { inicio: '08:00', fin: '16:00' },
        4: { inicio: '08:00', fin: '16:00' },
        5: { inicio: '08:00', fin: '16:00' },
      },
    };

    const turno: Turno = {
      fecha: new Date('2026-06-24T12:00:00'),
      franjas: [{ inicio: '19:00', fin: '22:00' }],
    };

    const resultado = calcularTurno(2_000_000, jornada, turno);

    expect(resultado.desgloseHoras).toHaveLength(3);
    resultado.desgloseHoras.forEach((h) => {
      expect(h.tipoHora).toBe(TipoHora.EXTRA_NOCTURNA);
      expect(h.dentroDeJornada).toBe(false);
      expect(h.esNocturna).toBe(true);
    });
  });

  it('turno con 5 horas extra → advertencia HORAS_EXTRA_DIARIA_EXCEDIDA', () => {
    const jornada: JornadaPactada = {
      dias: [1, 2, 3, 4, 5],
      horariosPorDia: {
        1: { inicio: '08:00', fin: '16:00' },
        2: { inicio: '08:00', fin: '16:00' },
        3: { inicio: '08:00', fin: '16:00' },
        4: { inicio: '08:00', fin: '16:00' },
        5: { inicio: '08:00', fin: '16:00' },
      },
    };

    const turno: Turno = {
      fecha: new Date('2026-06-24T12:00:00'),
      franjas: [{ inicio: '17:00', fin: '22:00' }],
    };

    const resultado = calcularTurno(1_750_905, jornada, turno);

    const tieneAdvertencia = resultado.advertencias.some(
      (a) => a.codigo === 'HORAS_EXTRA_DIARIA_EXCEDIDA',
    );
    expect(tieneAdvertencia).toBe(true);
  });

  it('turno con auxilio transporte → total incluye auxilio', () => {
    const jornada: JornadaPactada = {
      dias: [1, 2, 3, 4, 5],
      horariosPorDia: {
        1: { inicio: '08:00', fin: '16:00' },
        2: { inicio: '08:00', fin: '16:00' },
        3: { inicio: '08:00', fin: '16:00' },
        4: { inicio: '08:00', fin: '16:00' },
        5: { inicio: '08:00', fin: '16:00' },
      },
    };

    const turno: Turno = {
      fecha: new Date('2026-06-24T12:00:00'),
      franjas: [{ inicio: '09:00', fin: '13:00' }],
    };

    const resultado = calcularTurno(1_750_905, jornada, turno, 200_000);

    expect(resultado.totalPagar).toBe(
      resultado.desgloseHoras.reduce((s, h) => s + h.valorHora, 0) + 200_000,
    );
  });
});
