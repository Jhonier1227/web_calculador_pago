// Copyright (c) 2026 Jhonier Stiven Montaño Castillo. Todos los derechos reservados.
// Uso no autorizado de este código está estrictamente prohibido.

import { CONSTANTES_2026, LEGAL_LIMITS } from './constantes';
import type { Turno, JornadaPactada, ResultadoCalculo, HoraCalculada, ResumenTipo, Advertencia, TipoHora } from './tipos';
import { esFestivo } from './festivos';
import {
  redondearCOP,
  esHoraNocturna,
  generarHorasTurno,
  validarTurno,
  validarJornadaPactada,
  validarAñoFestivos,
} from './utilidades';
import { clasificarHora, estaDentroDeJornada, esDiaLaboralHabitual } from './clasificacion';

export function calcularTurno(
  salarioMensual: number,
  jornadaPactada: JornadaPactada,
  turno: Turno,
  auxilioTransporte?: number,
  horasAcumuladasLV?: number,
): ResultadoCalculo {
  const advertencias: Advertencia[] = [];

  const erroresJornada = validarJornadaPactada(jornadaPactada);
  advertencias.push(...erroresJornada);
  if (erroresJornada.some((a) => a.severidad === 'error')) {
    return {
      desgloseHoras: [],
      resumenPorTipo: [],
      totalPagar: 0,
      advertencias,
    };
  }

  const erroresTurno = validarTurno(turno);
  advertencias.push(...erroresTurno);
  if (erroresTurno.some((a) => a.severidad === 'error')) {
    return {
      desgloseHoras: [],
      resumenPorTipo: [],
      totalPagar: 0,
      advertencias,
    };
  }

  const anoErrores = validarAñoFestivos(turno.fecha.getFullYear());
  advertencias.push(...anoErrores);
  if (anoErrores.some((a) => a.severidad === 'error')) {
    return {
      desgloseHoras: [],
      resumenPorTipo: [],
      totalPagar: 0,
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

  advertencias.push({
    codigo: 'LIMITE_SEMANAL_NO_VALIDADO',
    mensaje: 'Esta calculadora solo valida el límite diario de horas extra (máx 2h/día). El límite semanal de 12h extra no se valida en esta versión.',
    severidad: 'info',
  });

  const valorHoraOrd = redondearCOP(salarioMensual / CONSTANTES_2026.DIVISOR_MENSUAL);
  const horas = generarHorasTurno(turno);
  const desgloseHoras: HoraCalculada[] = [];

  for (const hora of horas) {
    const esDomingo = hora.getDay() === 0;
    const esFestivoReal = esFestivo(hora) || (esDomingo && !esDiaLaboralHabitual(hora, jornadaPactada));
    const esNocturna = esHoraNocturna(hora);
    let dentroDeJornada = estaDentroDeJornada(hora, jornadaPactada);
    // Acumulador semanal (solo aplica en contexto de período con calcularPeriodo):
    // dentro de las 42h legales → toda hora es ordinaria (Art. 161 CST, Ley 2101)
    // al superar las 42h → toda hora subsiguiente es extra
    if (horasAcumuladasLV !== undefined) {
      if (horasAcumuladasLV < CONSTANTES_2026.JORNADA_SEMANAL_HORAS) {
        dentroDeJornada = true;
      } else {
        dentroDeJornada = false;
      }
      horasAcumuladasLV++;
    }
    const clasificacion = clasificarHora(esFestivoReal, dentroDeJornada, esNocturna);

    const horaFin = new Date(hora);
    horaFin.setHours(hora.getHours() + 1);

    const valorHora = dentroDeJornada
      ? redondearCOP(valorHoraOrd * clasificacion.recargo)
      : redondearCOP(valorHoraOrd * (1 + clasificacion.recargo));

    desgloseHoras.push({
      horaInicio: hora,
      horaFin,
      tipoHora: clasificacion.tipoHora,
      esFestivo: esFestivoReal,
      esNocturna,
      dentroDeJornada,
      valorHora,
      recargoAplicado: clasificacion.recargo,
      esHoraExtra: clasificacion.esHoraExtra,
    });
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

  const totalHoras = desgloseHoras.reduce((sum, h) => sum + h.valorHora, 0);
  const totalPagar = totalHoras + (auxilioTransporte ?? 0);

  return {
    desgloseHoras,
    resumenPorTipo,
    totalPagar,
    advertencias,
  };
}
