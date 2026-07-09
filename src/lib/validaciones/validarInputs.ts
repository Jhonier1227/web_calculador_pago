import { CONSTANTES_2026 } from '../calculos/constantes';

export interface ResultadoValidacion {
  esValido: boolean;
  mensaje: string | null;
}

const SALARIO_MAXIMO = 50_000_000;
const FECHA_VIGENCIA = new Date(2026, 6, 15); // 15 de julio de 2026

export function validarSalario(valor: number): ResultadoValidacion {
  if (isNaN(valor) || valor <= 0) {
    return { esValido: false, mensaje: 'El salario debe ser un número positivo.' };
  }
  if (!Number.isInteger(valor)) {
    return { esValido: false, mensaje: 'El salario debe ser un número entero sin decimales.' };
  }
  if (valor < 1_000_000) {
    return {
      esValido: false,
      mensaje: `El salario ingresado es menor al salario mínimo legal vigente (${CONSTANTES_2026.SALARIO_MINIMO.toLocaleString('es-CO')})`,
    };
  }
  if (valor > SALARIO_MAXIMO) {
    return { esValido: false, mensaje: 'Por favor verifica el salario ingresado.' };
  }
  return { esValido: true, mensaje: null };
}

export function validarHoras(inicio: string, fin: string): ResultadoValidacion {
  if (!inicio || !fin) {
    return { esValido: false, mensaje: 'Todos los campos de hora deben estar diligenciados.' };
  }

  const horaRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  if (!horaRegex.test(inicio) || !horaRegex.test(fin)) {
    return { esValido: false, mensaje: 'La hora debe estar en formato HH:mm (ej: 08:00).' };
  }

  if (inicio === fin) {
    return { esValido: false, mensaje: 'La hora de inicio y la hora de fin no pueden ser iguales.' };
  }

  return { esValido: true, mensaje: null };
}

export function validarFecha(fecha: Date): ResultadoValidacion {
  if (isNaN(fecha.getTime())) {
    return { esValido: false, mensaje: 'La fecha ingresada no es válida.' };
  }
  return { esValido: true, mensaje: null };
}

export function validarFechaNoAnterior(fecha: Date): ResultadoValidacion {
  const val = validarFecha(fecha);
  if (!val.esValido) return val;

  const inicioVigencia = new Date(FECHA_VIGENCIA);
  inicioVigencia.setHours(0, 0, 0, 0);
  const fechaNorm = new Date(fecha);
  fechaNorm.setHours(0, 0, 0, 0);

  if (fechaNorm < inicioVigencia) {
    return {
      esValido: true,
      mensaje: 'Esta calculadora aplica la legislación vigente desde el 15 de julio de 2026. Para fechas anteriores, los recargos pueden ser diferentes.',
    };
  }
  return { esValido: true, mensaje: null };
}

export function validarRangoPeriodo(inicio: Date, fin: Date): ResultadoValidacion {
  const valInicio = validarFecha(inicio);
  if (!valInicio.esValido) return valInicio;
  const valFin = validarFecha(fin);
  if (!valFin.esValido) return valFin;

  const inicioNorm = new Date(inicio);
  inicioNorm.setHours(0, 0, 0, 0);
  const finNorm = new Date(fin);
  finNorm.setHours(0, 0, 0, 0);

  if (finNorm < inicioNorm) {
    return { esValido: false, mensaje: 'La fecha de fin no puede ser anterior a la fecha de inicio.' };
  }

  const diffMs = finNorm.getTime() - inicioNorm.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;

  if (diffDays > 31) {
    return {
      esValido: false,
      mensaje: 'El período no puede superar 31 días. Divide el cálculo en dos períodos.',
    };
  }

  return { esValido: true, mensaje: null };
}
