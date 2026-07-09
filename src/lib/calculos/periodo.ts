import type { ConfiguracionPeriodo, ResultadoPeriodo, JornadaPactada, Turno, ResumenTipo, Advertencia, TipoHora, DetalleDominicalFestivo, MotivoRecargoDominical } from './tipos';
import { validarJornadaPactada, validarAñoFestivos, diaSemanaJSaISO } from './utilidades';
import { calcularTurno } from './motor';
import { nombreFestivo } from './festivos';

export function validarConfiguracionPeriodo(config: ConfiguracionPeriodo): Advertencia[] {
  const advertencias: Advertencia[] = [];

  if (config.fechaInicio > config.fechaFin) {
    advertencias.push({
      codigo: 'RANGO_FECHA_INVALIDO',
      mensaje: 'La fecha de fin debe ser posterior o igual a la fecha de inicio.',
      severidad: 'error',
    });
    return advertencias;
  }

  const diffMs = new Date(config.fechaFin + 'T12:00:00').getTime() - new Date(config.fechaInicio + 'T12:00:00').getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;
  if (diffDays > 31) {
    advertencias.push({
      codigo: 'RANGO_EXCEDE_31_DIAS',
      mensaje: 'El período no puede superar 31 días. Divide el cálculo en dos períodos separados.',
      severidad: 'warning',
    });
  }

  if (config.bloques.length === 0) {
    advertencias.push({
      codigo: 'PERIODO_SIN_DIAS',
      mensaje: 'Agrega al menos un bloque de horario para calcular el período.',
      severidad: 'error',
    });
    return advertencias;
  }

  for (const bloque of config.bloques) {
    if (bloque.fechaInicio > bloque.fechaFin) {
      advertencias.push({
        codigo: 'RANGO_FECHA_INVALIDO',
        mensaje: 'La fecha de fin del bloque debe ser posterior o igual a la fecha de inicio.',
        severidad: 'error',
      });
    }
    if (bloque.fechaInicio < config.fechaInicio || bloque.fechaFin > config.fechaFin) {
      advertencias.push({
        codigo: 'BLOQUE_FUERA_RANGO',
        mensaje: `El bloque "${bloque.id}" tiene fechas fuera del rango del período.`,
        severidad: 'error',
      });
    }
  }

  for (let i = 0; i < config.bloques.length; i++) {
    for (let j = i + 1; j < config.bloques.length; j++) {
      const a = config.bloques[i];
      const b = config.bloques[j];
      if (a.fechaInicio <= b.fechaFin && b.fechaInicio <= a.fechaFin) {
        advertencias.push({
          codigo: 'BLOQUES_SOLAPADOS',
          mensaje: 'Hay bloques con fechas solapadas. Cada día debe pertenecer a un solo bloque.',
          severidad: 'error',
        });
      }
    }
  }

  return advertencias;
}

function emptyResult(advertencias: Advertencia[]): ResultadoPeriodo {
  return {
    totalAPagar: 0,
    resumenPorTipo: [],
    totalHorasOrdinarias: 0,
    totalHorasExtras: 0,
    totalHorasNocturnas: 0,
    totalHorasDominicalesFestivas: 0,
    advertencias,
    diasCalculados: 0,
    diasOmitidos: 0,
    detalleDominicalFestivo: [],
  };
}

export function calcularPeriodo(
  salarioMensual: number,
  jornadaPactada: JornadaPactada,
  config: ConfiguracionPeriodo,
  auxilioTransporte?: number,
): ResultadoPeriodo {
  const advertencias: Advertencia[] = [];

  const erroresConfig = validarConfiguracionPeriodo(config);
  advertencias.push(...erroresConfig);
  if (erroresConfig.some((e) => e.severidad === 'error')) {
    return emptyResult(advertencias);
  }

  const erroresJornada = validarJornadaPactada(jornadaPactada);
  advertencias.push(...erroresJornada);
  if (erroresJornada.some((e) => e.severidad === 'error')) {
    return emptyResult(advertencias);
  }

  const [y1, m1, d1] = config.fechaInicio.split('-').map(Number);
  const [y2, m2, d2] = config.fechaFin.split('-').map(Number);
  for (const anio of [y1, y2]) {
    const erroresAno = validarAñoFestivos(anio);
    advertencias.push(...erroresAno);
    if (erroresAno.some((e) => e.severidad === 'error')) {
      return emptyResult(advertencias);
    }
  }

  let totalAPagar = 0;
  let totalHorasOrdinarias = 0;
  let totalHorasExtras = 0;
  let totalHorasNocturnas = 0;
  let totalHorasDominicalesFestivas = 0;
  let diasCalculados = 0;
  let diasOmitidos = 0;
  let acumuladorLV = 0;
  const detalleDominicalFestivo: DetalleDominicalFestivo[] = [];
  const resumenMap = new Map<TipoHora, { cantidadHoras: number; valorTotal: number; recargos: number[] }>();
  const seenCodes = new Set<string>();

  seenCodes.add('LIMITE_SEMANAL_NO_VALIDADO');
  advertencias.push({
    codigo: 'LIMITE_SEMANAL_NO_VALIDADO',
    mensaje: 'Esta calculadora solo valida el límite diario de horas extra (máx 2h/día). El límite semanal de 12h extra no se valida en esta versión.',
    severidad: 'info',
  });

  const current = new Date(y1, m1 - 1, d1);
  current.setHours(0, 0, 0, 0);
  const fin = new Date(y2, m2 - 1, d2);
  fin.setHours(0, 0, 0, 0);

  while (current <= fin) {
    const dateStr = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}-${String(current.getDate()).padStart(2, '0')}`;
    const bloque = config.bloques.find((b) => dateStr >= b.fechaInicio && dateStr <= b.fechaFin);

    if (!bloque) {
      diasOmitidos++;
      current.setDate(current.getDate() + 1);
      continue;
    }

    const diaISO = diaSemanaJSaISO(current.getDay());

    if (diaISO === 1) {
      acumuladorLV = 0;
    }

    const horario = bloque.horariosPorDia[diaISO];

    if (!horario) {
      diasOmitidos++;
      current.setDate(current.getDate() + 1);
      continue;
    }

    const turno: Turno = {
      fecha: new Date(current.getFullYear(), current.getMonth(), current.getDate(), 12, 0, 0),
      franjas: [{ inicio: horario.inicio, fin: horario.fin }],
    };

    const resultado = calcularTurno(
      salarioMensual, jornadaPactada, turno, undefined,
      acumuladorLV,
    );

    totalAPagar += resultado.totalPagar;

    let diaTieneFestivo = false;
    for (const h of resultado.desgloseHoras) {
      if (h.esHoraExtra) totalHorasExtras++;
      else totalHorasOrdinarias++;
      if (h.esNocturna) totalHorasNocturnas++;
      if (h.esFestivo) totalHorasDominicalesFestivas++;
      if (h.esFestivo) diaTieneFestivo = true;
    }

    if (diaTieneFestivo) {
      const esDomingo = current.getDay() === 0;
      const nombre = nombreFestivo(current);
      const motivo: MotivoRecargoDominical = {
        esDomingo,
        esFestivo: nombre !== null,
        nombreFestivo: nombre,
      };
      for (const r of resultado.resumenPorTipo) {
        if (r.tipoHora === 'RECARGO_DOMINICAL_DIURNO' || r.tipoHora === 'RECARGO_DOMINICAL_NOCTURNO' ||
            r.tipoHora === 'EXTRA_DOMINICAL_DIURNA' || r.tipoHora === 'EXTRA_DOMINICAL_NOCTURNA') {
          detalleDominicalFestivo.push({
            fecha: dateStr,
            tipoHora: r.tipoHora,
            cantidadHoras: r.cantidadHoras,
            valorTotal: r.valorTotal,
            recargoPromedio: r.recargoPromedio,
            motivo,
          });
        }
      }
    }

    for (const r of resultado.resumenPorTipo) {
      const grupo = resumenMap.get(r.tipoHora);
      if (grupo) {
        grupo.cantidadHoras += r.cantidadHoras;
        grupo.valorTotal += r.valorTotal;
        grupo.recargos.push(r.recargoPromedio);
      } else {
        resumenMap.set(r.tipoHora, {
          cantidadHoras: r.cantidadHoras,
          valorTotal: r.valorTotal,
          recargos: [r.recargoPromedio],
        });
      }
    }

    for (const a of resultado.advertencias) {
      if (!seenCodes.has(a.codigo)) {
        seenCodes.add(a.codigo);
        advertencias.push(a);
      }
    }

    acumuladorLV += resultado.desgloseHoras.length;

    diasCalculados++;
    current.setDate(current.getDate() + 1);
  }

  if (auxilioTransporte && auxilioTransporte > 0) {
    const prorated = Math.round(auxilioTransporte * (diasCalculados / 30));
    totalAPagar += prorated;
    advertencias.push({
      codigo: 'AUXILIO_PRORRATEADO',
      mensaje: `Auxilio de transporte prorrateado: $${prorated.toLocaleString('es-CO')} ($${auxilioTransporte.toLocaleString('es-CO')} × ${diasCalculados}/30)`,
      severidad: 'info',
    });
  }

  const resumenPorTipo: ResumenTipo[] = [];
  for (const [tipoHora, datos] of resumenMap) {
    const recargoPromedio = datos.recargos.reduce((a, b) => a + b, 0) / datos.recargos.length;
    resumenPorTipo.push({
      tipoHora,
      cantidadHoras: datos.cantidadHoras,
      valorTotal: datos.valorTotal,
      recargoPromedio: Math.round(recargoPromedio * 100) / 100,
    });
  }

  if (diasCalculados === 0) {
    advertencias.push({
      codigo: 'PERIODO_SIN_DIAS',
      mensaje: 'No se encontraron días trabajados en el período. Revisa la configuración de los bloques.',
      severidad: 'warning',
    });
  }

  return {
    totalAPagar,
    resumenPorTipo,
    totalHorasOrdinarias,
    totalHorasExtras,
    totalHorasNocturnas,
    totalHorasDominicalesFestivas,
    advertencias,
    diasCalculados,
    diasOmitidos,
    detalleDominicalFestivo,
  };
}
