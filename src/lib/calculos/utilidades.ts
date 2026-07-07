import { CONSTANTES_2026, LEGAL_LIMITS } from './constantes';
import type { Advertencia, Turno, JornadaPactada } from './tipos';

export function redondearCOP(n: number): number {
  return Math.round(n);
}

export function parseHora(hora: string): { horas: number; minutos: number } {
  const [h, m] = hora.split(':').map(Number);
  return { horas: h, minutos: m ?? 0 };
}

export function horaANumero(horas: number, minutos: number): number {
  return horas + minutos / 60;
}

export function esHoraNocturna(fecha: Date): boolean {
  const h = fecha.getHours();
  return h >= CONSTANTES_2026.HORA_FIN_DIURNA || h < CONSTANTES_2026.HORA_INICIO_DIURNA;
}

export function diaSemanaJSaISO(dia: number): number {
  return dia === 0 ? 7 : dia;
}

export function generarHorasTurno(turno: Turno): Date[] {
  const horas: Date[] = [];

  for (const franja of turno.franjas) {
    const inicio = new Date(turno.fecha);
    const { horas: hi, minutos: mi } = parseHora(franja.inicio);
    inicio.setHours(hi, mi, 0, 0);

    const fin = new Date(turno.fecha);
    const { horas: hf, minutos: mf } = parseHora(franja.fin);
    fin.setHours(hf, mf, 0, 0);

    if (fin <= inicio) {
      fin.setDate(fin.getDate() + 1);
    }

    let cursor = new Date(inicio);
    while (cursor < fin && horas.length < LEGAL_LIMITS.MAX_HORAS_TURNO) {
      horas.push(new Date(cursor));
      cursor.setHours(cursor.getHours() + 1);
    }
  }

  return horas;
}

export function validarTurno(turno: Turno): Advertencia[] {
  const advertencias: Advertencia[] = [];
  const franjas = turno.franjas;

  if (franjas.length === 0) {
    advertencias.push({
      codigo: 'SIN_FRANJAS',
      mensaje: 'Debe haber al menos una franja horaria.',
      severidad: 'error',
    });
    return advertencias;
  }

  if (franjas.length > LEGAL_LIMITS.MAX_FRANJAS_POR_DIA) {
    advertencias.push({
      codigo: 'DEMASIADAS_FRANJAS',
      mensaje: `Máximo ${LEGAL_LIMITS.MAX_FRANJAS_POR_DIA} franjas por día.`,
      severidad: 'error',
    });
    return advertencias;
  }

  let duracionTotalMinutos = 0;
  const intervalos: { inicio: number; fin: number }[] = [];

  for (const franja of franjas) {
    const { horas: hi, minutos: mi } = parseHora(franja.inicio);
    const { horas: hf, minutos: mf } = parseHora(franja.fin);
    const inicioMin = hi * 60 + mi;
    let finMin = hf * 60 + mf;

    if (finMin === inicioMin) {
      advertencias.push({
        codigo: 'FRANJA_INVALIDA',
        mensaje: 'La hora de fin no puede ser igual a la hora de inicio.',
        severidad: 'error',
      });
      return advertencias;
    }

    if (finMin < inicioMin) {
      finMin += 24 * 60;
    }

    if (finMin - inicioMin > 24 * 60) {
      advertencias.push({
        codigo: 'DURACION_EXCEDE_24H',
        mensaje: 'Una franja no puede durar más de 24 horas.',
        severidad: 'error',
      });
      return advertencias;
    }

    duracionTotalMinutos += finMin - inicioMin;
    intervalos.push({ inicio: inicioMin, fin: finMin });
  }

  for (let i = 0; i < intervalos.length; i++) {
    for (let j = i + 1; j < intervalos.length; j++) {
      if (intervalos[i].inicio < intervalos[j].fin && intervalos[j].inicio < intervalos[i].fin) {
        advertencias.push({
          codigo: 'FRANJAS_SOLAPADAS',
          mensaje: 'Las franjas horarias no pueden solaparse.',
          severidad: 'error',
        });
        return advertencias;
      }
    }
  }

  if (duracionTotalMinutos > LEGAL_LIMITS.MAX_HORAS_TURNO * 60) {
    advertencias.push({
      codigo: 'DURACION_EXCEDE_24H',
      mensaje: 'La duración total del turno no puede exceder 24 horas.',
      severidad: 'error',
    });
    return advertencias;
  }

  if (franjas.some((f) => f.fin < f.inicio)) {
    advertencias.push({
      codigo: 'TURNOS_CRUZA_MEDIANOCHE',
      mensaje: 'El turno cruza la medianoche. Cada hora se evaluará con su día calendario real.',
      severidad: 'info',
    });
  }

  return advertencias;
}

export function validarJornadaPactada(jornada: JornadaPactada): Advertencia[] {
  const advertencias: Advertencia[] = [];

  if (jornada.dias.length === 0) {
    advertencias.push({
      codigo: 'SIN_DIAS_JORNADA',
      mensaje: 'Selecciona al menos un día de la semana para la jornada pactada.',
      severidad: 'error',
    });
    return advertencias;
  }

  let horasSemanales = 0;
  for (const dia of jornada.dias) {
    const horario = jornada.horariosPorDia[dia];
    if (!horario) {
      advertencias.push({
        codigo: 'DIA_INVALIDO',
        mensaje: `El día ${dia} no tiene horario definido.`,
        severidad: 'error',
      });
      return advertencias;
    }

    if (horario.inicio === horario.fin) {
      advertencias.push({
        codigo: 'HORA_FIN_IGUAL_INICIO',
        mensaje: `La hora de fin no puede ser igual a la hora de inicio en el día ${dia}.`,
        severidad: 'error',
      });
      return advertencias;
    }

    const { horas: hi, minutos: mi } = parseHora(horario.inicio);
    const { horas: hf, minutos: mf } = parseHora(horario.fin);
    let diffMinutos = (hf * 60 + mf) - (hi * 60 + mi);
    if (diffMinutos <= 0) diffMinutos += 24 * 60;
    horasSemanales += diffMinutos / 60;
  }

  if (horasSemanales > CONSTANTES_2026.JORNADA_SEMANAL_HORAS) {
    advertencias.push({
      codigo: 'JORNADA_SEMANAL_EXCEDE_42H',
      mensaje: `La jornada semanal (${horasSemanales}h) excede el límite legal de ${CONSTANTES_2026.JORNADA_SEMANAL_HORAS} horas.`,
      severidad: 'warning',
    });
  }

  return advertencias;
}

export function validarAñoFestivos(año: number): Advertencia[] {
  if (isNaN(año) || año < LEGAL_LIMITS.FESTIVOS_AÑO_MIN || año > LEGAL_LIMITS.FESTIVOS_AÑO_MAX) {
    return [
      {
        codigo: 'AÑO_FESTIVOS_FUERA_RANGO',
        mensaje: `El año ${año} está fuera del rango soportado (${LEGAL_LIMITS.FESTIVOS_AÑO_MIN}-${LEGAL_LIMITS.FESTIVOS_AÑO_MAX}). No se puede calcular.`,
        severidad: 'error',
      },
    ];
  }
  return [];
}
