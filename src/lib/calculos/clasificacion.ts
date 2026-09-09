import { TipoHora } from './tipos';
import { esFestivo } from './festivos';

const JORNADA_SEMANAL_MAX = 42;

export function esHoraNocturna(hora: number): boolean {
  return hora >= 19 || hora < 6;
}

export function esDiaConRecargoDominical(
  fecha: Date,
  diasDescanso: number[],
  tipoJornada: 'estandar' | 'rotativo'
): boolean {
  const diaSemana = fecha.getDay();

  if (tipoJornada === 'estandar') {
    return diaSemana === 0;
  }

  return diasDescanso.includes(diaSemana);
}

export function clasificarHora(
  hora: number,
  fecha: Date,
  horasAcumuladasSemana: number,
  diasDescanso: number[],
  tipoJornada: 'estandar' | 'rotativo'
): { tipoHora: TipoHora; recargo: number; esHoraExtra: boolean } {
  const esNocturna = esHoraNocturna(hora);
  const esDominicalFestivo =
    esDiaConRecargoDominical(fecha, diasDescanso, tipoJornada) ||
    esFestivo(fecha);

  const esExtra = horasAcumuladasSemana >= JORNADA_SEMANAL_MAX;

  if (!esExtra) {
    if (esDominicalFestivo && esNocturna) {
      return { tipoHora: TipoHora.ORDINARIA_NOCTURNA_DOMINICAL, recargo: 1.25, esHoraExtra: false };
    }
    if (esDominicalFestivo) {
      return { tipoHora: TipoHora.ORDINARIA_DOMINICAL, recargo: 0.9, esHoraExtra: false };
    }
    if (esNocturna) {
      return { tipoHora: TipoHora.ORDINARIA_NOCTURNA, recargo: 0.35, esHoraExtra: false };
    }
    return { tipoHora: TipoHora.ORDINARIA_DIURNA, recargo: 0, esHoraExtra: false };
  } else {
    if (esDominicalFestivo && esNocturna) {
      return { tipoHora: TipoHora.EXTRA_NOCTURNA_DOMINICAL, recargo: 1.65, esHoraExtra: true };
    }
    if (esDominicalFestivo) {
      return { tipoHora: TipoHora.EXTRA_DIURNA_DOMINICAL, recargo: 1.15, esHoraExtra: true };
    }
    if (esNocturna) {
      return { tipoHora: TipoHora.EXTRA_NOCTURNA, recargo: 0.75, esHoraExtra: true };
    }
    return { tipoHora: TipoHora.EXTRA_DIURNA, recargo: 0.25, esHoraExtra: true };
  }
}

export function estaDentroDeJornada(_hora: Date, _jornada: any): boolean {
  return true;
}

export function esDiaLaboralHabitual(_fecha: Date, _jornada: any): boolean {
  return true;
}