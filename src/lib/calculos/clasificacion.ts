import { TipoHora } from './tipos';
import type { JornadaPactada } from './tipos';
import { diaSemanaJSaISO, parseHora } from './utilidades';

export function esDiaLaboralHabitual(fecha: Date, jornada: JornadaPactada): boolean {
  const diaISO = diaSemanaJSaISO(fecha.getDay());
  return jornada.dias.includes(diaISO);
}

export function estaDentroDeJornada(hora: Date, jornada: JornadaPactada): boolean {
  const diaISO = diaSemanaJSaISO(hora.getDay());
  const horario = jornada.horariosPorDia[diaISO];
  if (!horario) return false;

  const { horas: hi, minutos: mi } = parseHora(horario.inicio);
  const { horas: hf, minutos: mf } = parseHora(horario.fin);
  const horaMinutos = hora.getHours() * 60 + hora.getMinutes();

  let inicioMinutos = hi * 60 + mi;
  let finMinutos = hf * 60 + mf;

  if (finMinutos <= inicioMinutos) {
    finMinutos += 24 * 60;
  }

  if (finMinutos - inicioMinutos > 24 * 60) return false;

  if (finMinutos > 24 * 60 && horaMinutos < finMinutos - 24 * 60) {
    return true;
  }

  return horaMinutos >= inicioMinutos && horaMinutos < finMinutos;
}

function festivoORecargo(esFestivo: boolean, esNocturna: boolean): { tipoHora: TipoHora; recargo: number } {
  if (!esFestivo && !esNocturna) return { tipoHora: TipoHora.ORDINARIA_DIURNA, recargo: 0 };
  if (!esFestivo && esNocturna) return { tipoHora: TipoHora.RECARGO_NOCTURNO, recargo: 0.35 };
  if (esFestivo && !esNocturna) return { tipoHora: TipoHora.RECARGO_DOMINICAL_DIURNO, recargo: 0.90 };
  return { tipoHora: TipoHora.RECARGO_DOMINICAL_NOCTURNO, recargo: 1.25 };
}

function extraORecargo(esFestivo: boolean, esNocturna: boolean): { tipoHora: TipoHora; recargo: number } {
  if (!esFestivo && !esNocturna) return { tipoHora: TipoHora.EXTRA_DIURNA, recargo: 0.25 };
  if (!esFestivo && esNocturna) return { tipoHora: TipoHora.EXTRA_NOCTURNA, recargo: 0.75 };
  if (esFestivo && !esNocturna) return { tipoHora: TipoHora.EXTRA_DOMINICAL_DIURNA, recargo: 1.15 };
  return { tipoHora: TipoHora.EXTRA_DOMINICAL_NOCTURNA, recargo: 1.65 };
}

export function clasificarHora(
  esFestivo: boolean,
  dentroDeJornada: boolean,
  esNocturna: boolean,
): { tipoHora: TipoHora; recargo: number; esHoraExtra: boolean } {
  if (dentroDeJornada) {
    const r = festivoORecargo(esFestivo, esNocturna);
    return { ...r, esHoraExtra: false };
  }
  const r = extraORecargo(esFestivo, esNocturna);
  return { ...r, esHoraExtra: true };
}
