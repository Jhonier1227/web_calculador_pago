import { describe, it, expect } from 'vitest';
import { calcularTurno } from '../../lib/calculos/index';
import type { JornadaPactada, Turno } from '../../lib/calculos/index';
import { TipoHora } from '../../lib/calculos/index';

describe('Integración: nueva lógica acumulador semanal 42h (CB-01)', () => {
  const jornadaLV: JornadaPactada = {
    dias: [1, 2, 3, 4, 5],
    horariosPorDia: {
      1: { inicio: '08:00', fin: '16:00' },
      2: { inicio: '08:00', fin: '16:00' },
      3: { inicio: '08:00', fin: '16:00' },
      4: { inicio: '08:00', fin: '16:00' },
      5: { inicio: '08:00', fin: '16:00' },
    },
  };

  // Julio 2026: 6=Lun, 11=Sáb, 12=Dom (sin festivos)
  const LUNES = new Date('2026-07-06T12:00:00');

  it('turno diurno con acumulador 0 → ORDINARIA_DIURNA', () => {
    const turno: Turno = {
      fecha: LUNES,
      franjas: [{ inicio: '09:00', fin: '13:00' }],
    };

    const resultado = calcularTurno(1_750_905, jornadaLV, turno);

    expect(resultado.desgloseHoras).toHaveLength(4);
    resultado.desgloseHoras.forEach((h) => {
      expect(h.tipoHora).toBe(TipoHora.ORDINARIA_DIURNA);
      expect(h.dentroDeJornada).toBe(true);
      expect(h.esHoraExtra).toBe(false);
    });
  });

  it('turno nocturno con acumulador 0 → ORDINARIA_NOCTURNA (35%)', () => {
    const turno: Turno = {
      fecha: LUNES,
      franjas: [{ inicio: '19:00', fin: '22:00' }],
    };

    const resultado = calcularTurno(2_000_000, jornadaLV, turno);

    expect(resultado.desgloseHoras).toHaveLength(3);
    resultado.desgloseHoras.forEach((h) => {
      expect(h.tipoHora).toBe(TipoHora.ORDINARIA_NOCTURNA);
      expect(h.dentroDeJornada).toBe(true);
      expect(h.esNocturna).toBe(true);
      expect(h.recargoAplicado).toBe(0.35);
    });
  });

  it('turno con acumulador 42h → EXTRA_DIURNA (25%)', () => {
    const turno: Turno = {
      fecha: LUNES,
      franjas: [{ inicio: '09:00', fin: '13:00' }],
    };

    const resultado = calcularTurno(1_750_905, jornadaLV, turno, undefined, 42);

    expect(resultado.desgloseHoras).toHaveLength(4);
    resultado.desgloseHoras.forEach((h) => {
      expect(h.tipoHora).toBe(TipoHora.EXTRA_DIURNA);
      expect(h.dentroDeJornada).toBe(false);
      expect(h.esHoraExtra).toBe(true);
      expect(h.recargoAplicado).toBe(0.25);
    });
  });

  it('turno nocturno con acumulador 42h → EXTRA_NOCTURNA (75%)', () => {
    const turno: Turno = {
      fecha: LUNES,
      franjas: [{ inicio: '19:00', fin: '22:00' }],
    };

    const resultado = calcularTurno(2_000_000, jornadaLV, turno, undefined, 42);

    expect(resultado.desgloseHoras).toHaveLength(3);
    resultado.desgloseHoras.forEach((h) => {
      expect(h.tipoHora).toBe(TipoHora.EXTRA_NOCTURNA);
      expect(h.dentroDeJornada).toBe(false);
      expect(h.esHoraExtra).toBe(true);
      expect(h.esNocturna).toBe(true);
      expect(h.recargoAplicado).toBe(0.75);
    });
  });

  it('turno con 5 horas extra (acum 42h) → advertencia HORAS_EXTRA_DIARIA_EXCEDIDA', () => {
    const turno: Turno = {
      fecha: LUNES,
      franjas: [{ inicio: '09:00', fin: '14:00' }], // 5 horas extra
    };

    const resultado = calcularTurno(1_750_905, jornadaLV, turno, undefined, 42);

    const tieneAdvertencia = resultado.advertencias.some(
      (a) => a.codigo === 'HORAS_EXTRA_DIARIA_EXCEDIDA',
    );
    expect(tieneAdvertencia).toBe(true);
  });

  it('turno con auxilio transporte → total incluye auxilio', () => {
    const turno: Turno = {
      fecha: LUNES,
      franjas: [{ inicio: '09:00', fin: '13:00' }],
    };

    const resultado = calcularTurno(1_750_905, jornadaLV, turno, 200_000);

    expect(resultado.totalPagar).toBe(
      resultado.desgloseHoras.reduce((s, h) => s + h.valorHora, 0) + 200_000,
    );
  });
});