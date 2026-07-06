// @ts-expect-error - festivos-colombia no tiene tipos de TypeScript
import fc from 'festivos-colombia';

interface Festivo {
  date: string;
  name: string;
  'static': boolean;
}

const cacheFestivos = new Map<number, Festivo[]>();

function obtenerFestivos(anio: number): Festivo[] {
  if (cacheFestivos.has(anio)) {
    return cacheFestivos.get(anio)!;
  }
  const resultado = fc.getHolidaysByYear(anio);
  if (!Array.isArray(resultado)) {
    return [];
  }
  cacheFestivos.set(anio, resultado);
  return resultado;
}

function formatearComoDDMMYYYY(fecha: Date): string {
  const dia = String(fecha.getDate()).padStart(2, '0');
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const anio = fecha.getFullYear();
  return `${dia}/${mes}/${anio}`;
}

function fechaValida(fecha: Date): boolean {
  return fecha instanceof Date && !isNaN(fecha.getTime());
}

export function esFestivo(fecha: Date): boolean {
  if (!fechaValida(fecha)) return false;
  const anio = fecha.getFullYear();
  const festivos = obtenerFestivos(anio);
  const fechaStr = formatearComoDDMMYYYY(fecha);
  return festivos.some((f) => f.date === fechaStr);
}

export function nombreFestivo(fecha: Date): string | null {
  if (!fechaValida(fecha)) return null;
  const anio = fecha.getFullYear();
  const festivos = obtenerFestivos(anio);
  const fechaStr = formatearComoDDMMYYYY(fecha);
  const encontrado = festivos.find((f) => f.date === fechaStr);
  return encontrado ? encontrado.name : null;
}