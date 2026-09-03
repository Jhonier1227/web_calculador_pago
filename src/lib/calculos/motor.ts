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
} from './utilidades';
import { clasificarHora, esDiaConRecargoDominical } from './clasificacion';
import { esHoraNocturna } from './utilidades';

const LIMITE_LEGAL_DIARIO = 8;

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
 * Clasifica cada hora del turno individual.
 * Usa el límite diario (pactado o legal) para determinar si es extra.
 */
function clasificarHoraTurnoIndividual(
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
    // Dentro del límite diario → ordinaria con posibles recargos
    if (esDominicalFestivo && esNocturna) return { tipoHora: TipoHora.ORDINARIA_NOCTURNA_DOMINICAL, recargo: 1.25, esHoraExtra: false };
    if (esDominicalFestivo) return { tipoHora: TipoHora.ORDINARIA_DOMINICAL, recargo: 0.9, esHoraExtra: false };
    if (esNocturna) return { tipoHora: TipoHora.ORDINARIA_NOCTURNA, recargo: 0.35, esHoraExtra: false };
    return { tipoHora: TipoHora.ORDINARIA_DIURNA, recargo: 0, esHoraExtra: false };
  } else {
    // Superó el límite diario → hora extra
    if (esDominicalFestivo && esNocturna) return { tipoHora: TipoHora.EXTRA_NOCTURNA_DOMINICAL, recargo: 1.65, esHoraExtra: true };
    if (esDominicalFestivo) return { tipoHora: TipoHora.EXTRA_DIURNA_DOMINICAL, recargo: 1.15, esHoraExtra: true };
    if (esNocturna) return { tipoHora: TipoHora.EXTRA_NOCTURNA, recargo: 0.75, esHoraExtra: true };
    return { tipoHora: TipoHora.EXTRA_DIURNA, recargo: 0.25, esHoraExtra: true };
  }
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

  // Calcular límite diario para modo Turno Individual (cuando no hay acumulador semanal)
  const esModoTurnoIndividual = horasAcumuladasLV === undefined;

  let acumuladorSemana = horasAcumuladasLV ?? 0;
  let minutosAcumuladosTurno = 0; // minutos efectivos trabajados en este turno

  for (const intervalo of intervalos) {
    const esNocturna = esHoraNocturna(intervalo.horaCalendar);
    const esFestivoReal = esFestivo(intervalo.horaInicio) || esDiaConRecargoDominical(intervalo.horaInicio, diasDescansoArray, tipoJornada ?? 'estandar');

    // Calcular minutos efectivos ya trabajados ANTES de este intervalo
    const minutosAntesDeIntervalo = minutosAcumuladosTurno;

    let clasificacion;

    if (esModoTurnoIndividual) {
      // Modo Turno Individual: usar límite diario en minutos
      const limiteDiarioMin = getLimiteDiario(horasPactadasDiarias ?? null) * 60;

      // Determinar si este intervalo (o parte de él) es extra
      // Si todo el intervalo está dentro del límite → ordinario
      // Si todo está fuera → extra
      // Si cruza el límite → dividir (pero para simplicidad, clasificamos por el punto medio)
      const puntoMedioMin = minutosAntesDeIntervalo + intervalo.minutos / 2;
      const esExtra = puntoMedioMin > limiteDiarioMin;

      clasificacion = clasificarHoraTurnoIndividual(
        intervalo.horaCalendar,
        intervalo.horaInicio,
        esExtra,
        diasDescansoArray,
        tipoJornada ?? 'estandar'
      );
    } else {
      // Modo Período: usar acumulador semanal de 42h (en HORAS)
      const limiteSemanalHoras = 42;
      const puntoMedioHoras = acumuladorSemana + (intervalo.minutos / 2) / 60;
      const esExtra = puntoMedioHoras > limiteSemanalHoras;

      // Usar la función de clasificación original para modo período
      clasificacion = clasificarHora(
        intervalo.horaCalendar,
        intervalo.horaInicio,
        acumuladorSemana, // ya está en horas
        diasDescansoArray,
        tipoJornada ?? 'estandar'
      );
      // Sobrescribir esHoraExtra según nuestro cálculo en horas
      clasificacion = { ...clasificacion, esHoraExtra: esExtra };
      acumuladorSemana += intervalo.minutos / 60; // acumular en horas
    }

    // Calcular valor proporcional a los minutos del intervalo
    const proporcionMinutos = intervalo.minutos / 60; // fracción de hora
    const valorHoraBase = clasificacion.esHoraExtra
      ? valorHoraOrd * (1 + clasificacion.recargo)
      : valorHoraOrd * clasificacion.recargo;
    const valorIntervalo = redondearCOP(valorHoraBase * proporcionMinutos);

    desgloseHoras.push({
      horaInicio: intervalo.horaInicio,
      horaFin: intervalo.horaFin,
      tipoHora: clasificacion.tipoHora,
      esFestivo: esFestivoReal,
      esNocturna: esNocturna,
      dentroDeJornada: !clasificacion.esHoraExtra,
      valorHora: valorIntervalo,
      recargoAplicado: clasificacion.recargo,
      esHoraExtra: clasificacion.esHoraExtra,
    });

    minutosAcumuladosTurno += intervalo.minutos;
  }

  const extrasCount = desgloseHoras.filter((h) => h.esHoraExtra).length;
  if (extrasCount > LEGAL_LIMITS.MAX_HORAS_EXTRA_DIARIAS) {
    advertencias.push({
      codigo: 'HORAS_EXTRA_DIARIA_EXCEDIDA',
      mensaje: `El turno tiene ${extrasCount} horas extra, superando el límite legal de ${LEGAL_LIMITS.MAX_HORAS_EXTRA_DIARIAS} horas extra por día.`,
      severidad: 'warning',
    });
  }

  const agrupado = new Map<TipoHora, { cantidadHoras: number; valorTotal: number; recargos: number[] }>();

  let horasOrdinarias = 0;
  let horasExtra = 0;
  let horasNocturnas = 0;
  let horasDominicalesFestivas = 0;

  for (const h of desgloseHoras) {
    const key = h.tipoHora;
    const grupo = agrupado.get(key);
    if (grupo) {
      grupo.cantidadHoras++;
      grupo.valorTotal += h.valorHora;
      grupo.recargos.push(h.recargoAplicado);
    } else {
      agrupado.set(key, { cantidadHoras: 1, valorTotal: h.valorHora, recargos: [h.recargoAplicado] });
    }

    if (h.esHoraExtra) {
      horasExtra++;
    } else {
      horasOrdinarias++;
    }
    if (h.esNocturna) horasNocturnas++;
    if (h.esFestivo) horasDominicalesFestivas++;
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