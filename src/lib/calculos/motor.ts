// Copyright (c) 2026 Jhonier Stiven Montaño Castillo. Todos los derechos reservados.
// Uso no autorizado de este código está estrictamente prohibido.

import { CONSTANTES_2026, LEGAL_LIMITS } from './constantes';
import type { Turno, JornadaPactada, ResultadoCalculo, HoraCalculada, ResumenTipo, Advertencia } from './tipos';
import { TipoHora } from './tipos';
import { esFestivo } from './festivos';
import {
  redondearCOP,
  generarIntervalosTurno,
  validarTurno,
  validarJornadaPactada,
  validarAñoFestivos,
  esHoraNocturna,
  calcularDuracionEnMinutos,
} from './utilidades';
import { esDiaConRecargoDominical } from './clasificacion';

const LIMITE_LEGAL_DIARIO = 8;
const LIMITE_SEMANAL_HORAS = 42;

/**
 * Calcula el límite ordinario diario del trabajador.
 * Si tiene jornada pactada definida, usa esa.
 * Si no, usa 8h (máximo legal Art. 161 CST).
 */
function getLimiteDiario(jornadaPactadaHoras: number | null): number {
  if (jornadaPactadaHoras === null || jornadaPactadaHoras <= 0) {
    return LIMITE_LEGAL_DIARIO;
  }
  // No permitir jornada pactada mayor al límite legal
  return Math.min(jornadaPactadaHoras, LIMITE_LEGAL_DIARIO);
}

/**
 * Clasifica una porción de hora (ordinaria o extra) según su franja horaria.
 */
function clasificarPorcion(
  horaDelDia: number,
  fecha: Date,
  esExtra: boolean,
  diasDescanso: number[],
  tipoJornada: 'estandar' | 'rotativo'
): { tipoHora: TipoHora; recargo: number; esHoraExtra: boolean } {
  const esNocturna = esHoraNocturna(horaDelDia);
  const esDominicalFestivo =
    esDiaConRecargoDominical(fecha, diasDescanso, tipoJornada) ||
    esFestivo(fecha);

  if (!esExtra) {
    if (esDominicalFestivo && esNocturna) return { tipoHora: TipoHora.ORDINARIA_NOCTURNA_DOMINICAL, recargo: 1.25, esHoraExtra: false };
    if (esDominicalFestivo) return { tipoHora: TipoHora.ORDINARIA_DOMINICAL, recargo: 0.9, esHoraExtra: false };
    if (esNocturna) return { tipoHora: TipoHora.ORDINARIA_NOCTURNA, recargo: 0.35, esHoraExtra: false };
    return { tipoHora: TipoHora.ORDINARIA_DIURNA, recargo: 0, esHoraExtra: false };
  } else {
    if (esDominicalFestivo && esNocturna) return { tipoHora: TipoHora.EXTRA_NOCTURNA_DOMINICAL, recargo: 1.65, esHoraExtra: true };
    if (esDominicalFestivo) return { tipoHora: TipoHora.EXTRA_DIURNA_DOMINICAL, recargo: 1.15, esHoraExtra: true };
    if (esNocturna) return { tipoHora: TipoHora.EXTRA_NOCTURNA, recargo: 0.75, esHoraExtra: true };
    return { tipoHora: TipoHora.EXTRA_DIURNA, recargo: 0.25, esHoraExtra: true };
  }
}

function addMinutos(fecha: Date, minutos: number): Date {
  return new Date(fecha.getTime() + minutos * 60 * 1000);
}

export function calcularTurno(
  salarioMensual: number,
  jornadaPactada: JornadaPactada,
  turno: Turno,
  auxilioTransporte?: number,
  horasAcumuladasLV?: number,
  tipoJornada?: 'estandar' | 'rotativo',
  diasDescanso?: number[],
  horasPactadasDiarias?: number | null,
  minutosDescanso?: number,
): ResultadoCalculo {
  const advertencias: Advertencia[] = [];

  const erroresJornada = validarJornadaPactada(jornadaPactada);
  advertencias.push(...erroresJornada);
  if (erroresJornada.some((a) => a.severidad === 'error')) {
    return {
      desgloseHoras: [],
      resumenPorTipo: [],
      totalRecargos: 0,
      horasOrdinarias: 0,
      horasExtra: 0,
      horasNocturnas: 0,
      horasDominicalesFestivas: 0,
      auxilioTransporte: auxilioTransporte ?? 0,
      totalReferencial: auxilioTransporte ?? 0,
      totalPagar: auxilioTransporte ?? 0,
      advertencias,
    };
  }

  const erroresTurno = validarTurno(turno);
  advertencias.push(...erroresTurno);
  if (erroresTurno.some((a) => a.severidad === 'error')) {
    return {
      desgloseHoras: [],
      resumenPorTipo: [],
      totalRecargos: 0,
      horasOrdinarias: 0,
      horasExtra: 0,
      horasNocturnas: 0,
      horasDominicalesFestivas: 0,
      auxilioTransporte: auxilioTransporte ?? 0,
      totalReferencial: auxilioTransporte ?? 0,
      totalPagar: auxilioTransporte ?? 0,
      advertencias,
    };
  }

  // Validar que el descanso no sea igual o mayor a la duración bruta del turno
  const minutosBrutosTurno = turno.franjas.reduce((sum, f) => sum + calcularDuracionEnMinutos(f.inicio, f.fin, 0), 0);
  if ((minutosDescanso ?? 0) > 0 && (minutosDescanso ?? 0) >= minutosBrutosTurno) {
    advertencias.push({
      codigo: 'DESCANSO_EXCEDE_TURNO',
      mensaje: `El tiempo de descanso (${minutosDescanso} min) no puede ser igual o mayor al total del turno (${minutosBrutosTurno} min).`,
      severidad: 'error',
    });
    return {
      desgloseHoras: [],
      resumenPorTipo: [],
      totalRecargos: 0,
      horasOrdinarias: 0,
      horasExtra: 0,
      horasNocturnas: 0,
      horasDominicalesFestivas: 0,
      auxilioTransporte: auxilioTransporte ?? 0,
      totalReferencial: auxilioTransporte ?? 0,
      totalPagar: auxilioTransporte ?? 0,
      advertencias,
    };
  }

  const anoErrores = validarAñoFestivos(turno.fecha.getFullYear());
  advertencias.push(...anoErrores);
  if (anoErrores.some((a) => a.severidad === 'error')) {
    return {
      desgloseHoras: [],
      resumenPorTipo: [],
      totalRecargos: 0,
      horasOrdinarias: 0,
      horasExtra: 0,
      horasNocturnas: 0,
      horasDominicalesFestivas: 0,
      auxilioTransporte: auxilioTransporte ?? 0,
      totalReferencial: auxilioTransporte ?? 0,
      totalPagar: auxilioTransporte ?? 0,
      advertencias,
    };
  }

  if (salarioMensual < CONSTANTES_2026.SALARIO_MINIMO) {
    advertencias.push({
      codigo: 'SALARIO_BAJO_MINIMO',
      mensaje: `El salario ($${salarioMensual.toLocaleString('es-CO')}) es inferior al salario mínimo legal 2026 ($${CONSTANTES_2026.SALARIO_MINIMO.toLocaleString('es-CO')}).`,
      severidad: 'warning',
    });
  }

  const valorHoraOrd = redondearCOP(salarioMensual / CONSTANTES_2026.DIVISOR_MENSUAL);
  const intervalos = generarIntervalosTurno(turno, minutosDescanso ?? 0);
  const desgloseHoras: HoraCalculada[] = [];

  const diasDescansoArray: number[] = tipoJornada === 'rotativo' && diasDescanso !== undefined
    ? diasDescanso
    : [];

  const esModoTurnoIndividual = horasAcumuladasLV === undefined;

  // Acumulador semanal en minutos (para precisión decimal)
  const acumuladorSemanaMin = (horasAcumuladasLV ?? 0) * 60;
  let minutosAcumuladosTurno = 0;

  let horasOrdinarias = 0;
  let horasExtra = 0;
  let horasNocturnas = 0;
  let horasDominicalesFestivas = 0;

  const agrupado = new Map<TipoHora, { cantidadHoras: number; valorTotal: number; recargos: number[] }>();

  const registrar = (
    tipoHora: TipoHora,
    recargo: number,
    valor: number,
    horas: number,
    esNocturna: boolean,
    esFestivo: boolean,
  ) => {
    const grupo = agrupado.get(tipoHora);
    if (grupo) {
      grupo.cantidadHoras += horas;
      grupo.valorTotal += valor;
      grupo.recargos.push(recargo);
    } else {
      agrupado.set(tipoHora, { cantidadHoras: horas, valorTotal: valor, recargos: [recargo] });
    }
    if (esNocturna) horasNocturnas += horas;
    if (esFestivo) horasDominicalesFestivas += horas;
  };

  for (const intervalo of intervalos) {
    const esNocturna = esHoraNocturna(intervalo.horaCalendar);
    const esFestivoReal = esFestivo(intervalo.horaInicio) || esDiaConRecargoDominical(intervalo.horaInicio, diasDescansoArray, tipoJornada ?? 'estandar');

    const inicioTurnoMin = minutosAcumuladosTurno;
    const finTurnoMin = minutosAcumuladosTurno + intervalo.minutos;

    let minutosOrd = 0;
    let minutosExtra = 0;

    if (esModoTurnoIndividual) {
      const limiteDiarioMin = getLimiteDiario(horasPactadasDiarias ?? null) * 60;
      if (finTurnoMin <= limiteDiarioMin) {
        minutosOrd = intervalo.minutos;
      } else if (inicioTurnoMin >= limiteDiarioMin) {
        minutosExtra = intervalo.minutos;
      } else {
        minutosOrd = limiteDiarioMin - inicioTurnoMin;
        minutosExtra = finTurnoMin - limiteDiarioMin;
      }
    } else {
      const limiteSemanalMin = LIMITE_SEMANAL_HORAS * 60;
      const inicioGlobalMin = acumuladorSemanaMin + minutosAcumuladosTurno;
      const finGlobalMin = inicioGlobalMin + intervalo.minutos;
      if (finGlobalMin <= limiteSemanalMin) {
        minutosOrd = intervalo.minutos;
      } else if (inicioGlobalMin >= limiteSemanalMin) {
        minutosExtra = intervalo.minutos;
      } else {
        minutosOrd = limiteSemanalMin - inicioGlobalMin;
        minutosExtra = finGlobalMin - limiteSemanalMin;
      }
    }

    if (minutosOrd > 0) {
      const clas = clasificarPorcion(intervalo.horaCalendar, intervalo.horaInicio, false, diasDescansoArray, tipoJornada ?? 'estandar');
      const horas = minutosOrd / 60;
      const valor = redondearCOP(valorHoraOrd * clas.recargo * horas);
      desgloseHoras.push({
        horaInicio: intervalo.horaInicio,
        horaFin: addMinutos(intervalo.horaInicio, minutosOrd),
        tipoHora: clas.tipoHora,
        esFestivo: esFestivoReal,
        esNocturna,
        dentroDeJornada: true,
        valorHora: valor,
        recargoAplicado: clas.recargo,
        esHoraExtra: false,
      });
      horasOrdinarias += horas;
      registrar(clas.tipoHora, clas.recargo, valor, horas, esNocturna, esFestivoReal);
    }

    if (minutosExtra > 0) {
      const clas = clasificarPorcion(intervalo.horaCalendar, intervalo.horaInicio, true, diasDescansoArray, tipoJornada ?? 'estandar');
      const horas = minutosExtra / 60;
      const valor = redondearCOP(valorHoraOrd * (1 + clas.recargo) * horas);
      desgloseHoras.push({
        horaInicio: addMinutos(intervalo.horaInicio, minutosOrd),
        horaFin: intervalo.horaFin,
        tipoHora: clas.tipoHora,
        esFestivo: esFestivoReal,
        esNocturna,
        dentroDeJornada: false,
        valorHora: valor,
        recargoAplicado: clas.recargo,
        esHoraExtra: true,
      });
      horasExtra += horas;
      registrar(clas.tipoHora, clas.recargo, valor, horas, esNocturna, esFestivoReal);
    }

    minutosAcumuladosTurno += intervalo.minutos;
  }

  if (horasExtra > LEGAL_LIMITS.MAX_HORAS_EXTRA_DIARIAS) {
    advertencias.push({
      codigo: 'HORAS_EXTRA_DIARIA_EXCEDIDA',
      mensaje: `El turno tiene ${horasExtra} horas extra, superando el límite legal de ${LEGAL_LIMITS.MAX_HORAS_EXTRA_DIARIAS} horas extra por día.`,
      severidad: 'warning',
    });
  }

  const resumenPorTipo: ResumenTipo[] = [];
  for (const [tipoHora, datos] of agrupado) {
    const recargoPromedio = datos.recargos.reduce((a, b) => a + b, 0) / datos.recargos.length;
    resumenPorTipo.push({
      tipoHora,
      cantidadHoras: datos.cantidadHoras,
      valorTotal: datos.valorTotal,
      recargoPromedio: Math.round(recargoPromedio * 100) / 100,
    });
  }

  resumenPorTipo.sort((a, b) => a.tipoHora.localeCompare(b.tipoHora));

  const totalRecargos = desgloseHoras.reduce((sum, h) => sum + h.valorHora, 0);
  const auxilio = auxilioTransporte ?? 0;
  const totalReferencial = totalRecargos + auxilio;
  const totalPagar = totalReferencial; // compatibilidad

  return {
    desgloseHoras,
    resumenPorTipo,
    totalRecargos,
    horasOrdinarias,
    horasExtra,
    horasNocturnas,
    horasDominicalesFestivas,
    auxilioTransporte: auxilio,
    totalReferencial,
    totalPagar,
    advertencias,
  };
}