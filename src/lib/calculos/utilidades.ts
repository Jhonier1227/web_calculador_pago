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

/**
 * Convierte "HH:MM" a minutos desde medianoche.
 */
export function horaAMinutos(hora: string): number {
  const [h, m] = hora.split(':').map(Number);
  return h * 60 + m;
}

/**
 * Calcula la duración efectiva de un turno en MINUTOS.
 *
 * Regla fundamental: una hora de trabajo es un INTERVALO entre dos puntos,
 * no un punto en el tiempo. El punto de inicio no representa tiempo trabajado.
 *
 * Ejemplos:
 *   07:00 → 15:00 = 480 min = 8h (NO 9h)
 *   07:00 → 17:00, almuerzo 60min = 540 min = 9h efectivos
 *   07:45 → 17:15, almuerzo 60min = 510 min = 8.5h efectivos
 *   22:00 → 06:00 (cruza medianoche) = 480 min = 8h
 *
 * @param horaInicio - formato "HH:MM" en 24h, ej: "07:00", "22:30"
 * @param horaFin    - formato "HH:MM" en 24h, puede ser del día siguiente
 * @param minutosDescanso - minutos de almuerzo/descanso a descontar (default 0)
 * @returns minutos efectivos trabajados (ya descontado el descanso)
 */
export function calcularDuracionEnMinutos(
  horaInicio: string,
  horaFin: string,
  minutosDescanso: number = 0
): number {
  const [hIni, mIni] = horaInicio.split(':').map(Number);
  const [hFin, mFin] = horaFin.split(':').map(Number);

  const minutosInicio = hIni * 60 + mIni;
  let minutosFin = hFin * 60 + mFin;

  // Si el turno cruza medianoche (fin <= inicio), sumar 24h al fin
  if (minutosFin <= minutosInicio) {
    minutosFin += 24 * 60; // 1440 minutos = 24 horas
  }

  // Duración bruta = diferencia entre intervalos (fin - inicio)
  // NO se suma +1 porque estamos midiendo intervalos, no contando puntos
  const minutosBrutos = minutosFin - minutosInicio;

  // Descontar el almuerzo del total bruto
  const minutosEfectivos = minutosBrutos - minutosDescanso;

  // Nunca retornar negativo (validación debería haberlo capturado antes)
  return Math.max(0, minutosEfectivos);
}

/**
 * Convierte minutos a horas con decimales.
 * Ej: 510 min → 8.5h, 480 min → 8.0h, 90 min → 1.5h
 */
export function minutosAHoras(minutos: number): number {
  return minutos / 60;
}

export function esHoraNocturna(hora: number): boolean {
  return hora >= CONSTANTES_2026.HORA_FIN_DIURNA || hora < CONSTANTES_2026.HORA_INICIO_DIURNA;
}

export function diaSemanaJSaISO(dia: number): number {
  return dia === 0 ? 7 : dia;
}

export interface IntervaloTrabajo {
  horaInicio: Date;
  horaFin: Date;
  minutos: number; // minutos efectivos en este intervalo (max 60)
  horaCalendar: number; // 0-23 hora calendario para clasificación
}

/**
 * Genera los intervalos de trabajo de un turno, manejando correctamente:
 * - Minutos parciales en inicio y fin
 * - Almuerzo como salto de hora(s) fija(s) a las 12:00 (no resta del total)
 * - Cruce de medianoche
 * - Múltiples franjas
 *
 * Retorna array de intervalos de trabajo con información para clasificación.
 */
export function generarIntervalosTurno(turno: Turno, minutosDescanso: number = 0): IntervaloTrabajo[] {
  const intervalos: IntervaloTrabajo[] = [];
  const horasAlmuerzo = Math.floor(minutosDescanso / 60);
  const horaInicioAlmuerzo = 12; // Almuerzo típico a las 12:00

  for (const franja of turno.franjas) {
    const inicioMin = horaAMinutos(franja.inicio);
    let finMin = horaAMinutos(franja.fin);

    // Si cruza medianoche
    if (finMin <= inicioMin) {
      finMin += 24 * 60;
    }

    // Validar que no sea negativo
    if (finMin <= inicioMin) {
      continue; // turno sin tiempo efectivo
    }

    let minActual = inicioMin;

    while (minActual < finMin) {
      // Si hay descanso configurado, saltar las horas de almuerzo (empezando a las 12:00)
      const horaCursor = Math.floor(minActual / 60) % 24;
      const esHoraAlmuerzo = horasAlmuerzo > 0 && horaCursor >= horaInicioAlmuerzo && horaCursor < horaInicioAlmuerzo + horasAlmuerzo;

      if (esHoraAlmuerzo) {
        // Saltar la(s) hora(s) de almuerzo
        minActual += 60;
        continue;
      }

      // Calcular el final de esta hora calendar (siguiente hora en punto)
      const horaCalendar = Math.floor(minActual / 60) % 24;
      const inicioHoraCalendarMin = Math.floor(minActual / 60) * 60;

      // El bloque termina al menor entre: fin de hora calendar, o fin del turno
      const finBloqueMin = Math.min(inicioHoraCalendarMin + 60, finMin);
      const minutosBloque = finBloqueMin - minActual;

      intervalos.push({
        horaInicio: new Date(
          new Date(turno.fecha).getFullYear(),
          new Date(turno.fecha).getMonth(),
          new Date(turno.fecha).getDate() + Math.floor(minActual / (24 * 60)),
          Math.floor(minActual / 60) % 24,
          minActual % 60
        ),
        horaFin: new Date(
          new Date(turno.fecha).getFullYear(),
          new Date(turno.fecha).getMonth(),
          new Date(turno.fecha).getDate() + Math.floor((Math.min(Math.floor(minActual / 60) * 60 + 60, finMin)) / (24 * 60)),
          Math.floor(Math.min(Math.floor(minActual / 60) * 60 + 60, finMin) / 60) % 24,
          Math.min(Math.floor(minActual / 60) * 60 + 60, finMin) % 60
        ),
        minutos: minutosBloque,
        horaCalendar,
      });

      minActual = Math.min(Math.floor(minActual / 60) * 60 + 60, finMin);
    }
  }

  return intervalos;
}

/**
 * Wrapper de compatibilidad hacia atrás para generarHorasTurno.
 * Convierte los intervalos al formato anterior (array de Date en puntos de hora).
 * @deprecated Usar generarIntervalosTurno para nuevos desarrollos.
 */
export function generarHorasTurno(turno: Turno, minutosDescanso: number = 0): Date[] {
  const intervalos = generarIntervalosTurno(turno, minutosDescanso);
  return intervalos.map(i => i.horaInicio);
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