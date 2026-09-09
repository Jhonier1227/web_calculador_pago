import { describe, it, expect, beforeEach } from 'vitest';
import { diaSemanaJSaISO, esHoraNocturna, validarAñoFestivos, validarJornadaPactada, validarTurno, generarHorasTurno } from './utilidades';
import { esFestivo, nombreFestivo } from './festivos';
import { _resetCacheFestivos } from './festivos';
import type { JornadaPactada, Turno } from './tipos';

function localDate(anio: number, mes: number, dia: number, hora = 12, min = 0): Date {
  return new Date(anio, mes, dia, hora, min);
}

describe('diaSemanaJSaISO', () => {
  it('domingo (0) → 7', () => expect(diaSemanaJSaISO(0)).toBe(7));
  it('lunes (1) → 1', () => expect(diaSemanaJSaISO(1)).toBe(1));
  it('martes (2) → 2', () => expect(diaSemanaJSaISO(2)).toBe(2));
  it('miércoles (3) → 3', () => expect(diaSemanaJSaISO(3)).toBe(3));
  it('jueves (4) → 4', () => expect(diaSemanaJSaISO(4)).toBe(4));
  it('viernes (5) → 5', () => expect(diaSemanaJSaISO(5)).toBe(5));
  it('sábado (6) → 6', () => expect(diaSemanaJSaISO(6)).toBe(6));
});

describe('esHoraNocturna', () => {
  it('00:00 es nocturna', () => expect(esHoraNocturna(0)).toBe(true));
  it('05:59 es nocturna', () => expect(esHoraNocturna(5)).toBe(true));
  it('06:00 NO es nocturna (inicio diurna)', () => expect(esHoraNocturna(6)).toBe(false));
  it('12:00 NO es nocturna', () => expect(esHoraNocturna(12)).toBe(false));
  it('18:59 NO es nocturna', () => expect(esHoraNocturna(18)).toBe(false));
  it('19:00 es nocturna', () => expect(esHoraNocturna(19)).toBe(true));
  it('23:59 es nocturna', () => expect(esHoraNocturna(23)).toBe(true));
});

describe('validarAñoFestivos', () => {
  it('2026 es válido (retorna array vacío)', () => {
    expect(validarAñoFestivos(2026)).toEqual([]);
  });
  it('2025 es válido', () => {
    expect(validarAñoFestivos(2025)).toEqual([]);
  });
  it('número negativo retorna error', () => {
    const r = validarAñoFestivos(-1);
    expect(r.some((a) => a.codigo === 'AÑO_FESTIVOS_FUERA_RANGO')).toBe(true);
    expect(r.some((a) => a.severidad === 'error')).toBe(true);
  });
  it('NaN retorna error', () => {
    const r = validarAñoFestivos(NaN);
    expect(r.some((a) => a.codigo === 'AÑO_FESTIVOS_FUERA_RANGO')).toBe(true);
  });
  it('fracción en rango SÍ es válida (no se valida entero)', () => {
    expect(validarAñoFestivos(2026.5)).toEqual([]);
  });
  it('2000 está fuera del rango (min 2020)', () => {
    const r = validarAñoFestivos(2000);
    expect(r.some((a) => a.codigo === 'AÑO_FESTIVOS_FUERA_RANGO')).toBe(true);
  });
});

describe('esFestivo', () => {
  beforeEach(() => {
    _resetCacheFestivos();
  });

  it('1 ene (Año Nuevo) es festivo', () => {
    expect(esFestivo(localDate(2026, 0, 1))).toBe(true);
  });
  it('22 jun (lunes cualquiera sin festivo) NO es festivo', () => {
    expect(esFestivo(localDate(2026, 5, 22))).toBe(false);
  });
  it('15 jun (Sagrado Corazón) SÍ es festivo', () => {
    expect(esFestivo(localDate(2026, 5, 15))).toBe(true);
  });
  it('12 ene (Reyes Magos) es festivo', () => {
    expect(esFestivo(localDate(2026, 0, 12))).toBe(true);
  });
});

describe('nombreFestivo', () => {
  it('devuelve nombre para Año Nuevo', () => {
    expect(nombreFestivo(localDate(2026, 0, 1))).toBe('Año Nuevo');
  });
  it('devuelve null para día no festivo', () => {
    expect(nombreFestivo(localDate(2026, 5, 22))).toBeNull();
  });
  it('devuelve null para fecha inválida', () => {
    expect(nombreFestivo(new Date(NaN))).toBeNull();
  });
});

describe('validarJornadaPactada', () => {
  it('sin días retorna error', () => {
    const j: JornadaPactada = { dias: [], horariosPorDia: {} };
    const r = validarJornadaPactada(j);
    expect(r.some((a) => a.codigo === 'SIN_DIAS_JORNADA')).toBe(true);
  });

  it('día sin horario retorna error DIA_INVALIDO', () => {
    const j: JornadaPactada = { dias: [1], horariosPorDia: {} };
    const r = validarJornadaPactada(j);
    expect(r.some((a) => a.codigo === 'DIA_INVALIDO')).toBe(true);
  });

  it('inicio = fin retorna error HORA_FIN_IGUAL_INICIO', () => {
    const j: JornadaPactada = {
      dias: [1],
      horariosPorDia: { 1: { inicio: '08:00', fin: '08:00' } },
    };
    const r = validarJornadaPactada(j);
    expect(r.some((a) => a.codigo === 'HORA_FIN_IGUAL_INICIO')).toBe(true);
  });

  it('jornada válida retorna array vacío', () => {
    const j: JornadaPactada = {
      dias: [1],
      horariosPorDia: { 1: { inicio: '08:00', fin: '17:00' } },
    };
    expect(validarJornadaPactada(j)).toEqual([]);
  });
});

describe('validarTurno', () => {
  function turno(fecha: string, franjas: { inicio: string; fin: string }[]): Turno {
    return { fecha: new Date(fecha + 'T12:00:00'), franjas };
  }

  it('sin franjas retorna error SIN_FRANJAS', () => {
    const r = validarTurno(turno('2026-06-22', []));
    expect(r.some((a) => a.codigo === 'SIN_FRANJAS')).toBe(true);
  });

  it('duración total > 24h retorna error DURACION_EXCEDE_24H', () => {
    const r = validarTurno(turno('2026-06-22', [{ inicio: '08:00', fin: '22:00' }, { inicio: '23:00', fin: '12:00' }]));
    expect(r.some((a) => a.codigo === 'DURACION_EXCEDE_24H')).toBe(true);
  });

  it('turno que cruza medianoche (sin error) retorna info TURNOS_CRUZA_MEDIANOCHE', () => {
    const r = validarTurno(turno('2026-06-22', [{ inicio: '23:00', fin: '02:00' }]));
    expect(r.some((a) => a.codigo === 'TURNOS_CRUZA_MEDIANOCHE')).toBe(true);
  });

  it('varias franjas válidas retorna array vacío', () => {
    const r = validarTurno(turno('2026-06-22', [{ inicio: '08:00', fin: '12:00' }, { inicio: '14:00', fin: '18:00' }]));
    expect(r).toEqual([]);
  });
});

describe('generarHorasTurno', () => {
  function turno(fecha: string, inicio: string, fin: string): Turno {
    return { fecha: new Date(fecha + 'T12:00:00'), franjas: [{ inicio, fin }] };
  }

  it('genera 10 horas para turno 7am-5pm sin descanso', () => {
    const t = turno('2026-08-03', '07:00', '17:00');
    const horas = generarHorasTurno(t, 0);
    expect(horas).toHaveLength(10);
    expect(horas[0].getHours()).toBe(7);
    expect(horas[9].getHours()).toBe(16);
  });

  it('genera 9 horas para turno 7am-5pm con 60min descanso', () => {
    const t = turno('2026-08-03', '07:00', '17:00');
    const horas = generarHorasTurno(t, 60);
    expect(horas).toHaveLength(9);
    expect(horas[0].getHours()).toBe(7);
    expect(horas[8].getHours()).toBe(16);
  });

  it('genera 8 horas para turno 7am-5pm con 120min descanso', () => {
    const t = turno('2026-08-03', '07:00', '17:00');
    const horas = generarHorasTurno(t, 120);
    expect(horas).toHaveLength(8);
  });

  it('saltea la hora de almuerzo correctamente (12:00-13:00)', () => {
    const t = turno('2026-08-03', '07:00', '17:00');
    const horas = generarHorasTurno(t, 60);
    // Verificar que NO hay hora a las 12:00 (es la hora de almuerzo)
    const horasValues = horas.map(h => h.getHours());
    expect(horasValues).not.toContain(12);
    // Verificar que SÍ hay 7, 8, 9, 10, 11, 13, 14, 15, 16
    expect(horasValues).toEqual([7, 8, 9, 10, 11, 13, 14, 15, 16]);
  });

  it('turno que cruza medianoche SIN hora 12:00 → no aplica descanso', () => {
    const t = turno('2026-08-08', '22:00', '06:00'); // 8h brutas, no incluye 12:00
    const horas = generarHorasTurno(t, 60);
    // Al no incluir la hora 12:00, no se saltea ninguna hora
    expect(horas).toHaveLength(8);
    expect(horas[0].getHours()).toBe(22);
    expect(horas[7].getHours()).toBe(5);
  });
});
