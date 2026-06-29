// @ts-expect-error - festivos-colombia no tiene tipos de TypeScript
import fc from 'festivos-colombia';

interface Festivo {
  date: string;   // formato "DD/MM/YYYY"
  name: string;
  static: boolean;
}

/**
 * Convierte un objeto Date al formato "DD/MM/YYYY" que usa la librería.
 */
function formatearComoDDMMYYYY(fecha: Date): string {
  const dia = String(fecha.getDate()).padStart(2, '0');
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const anio = fecha.getFullYear();
  return `${dia}/${mes}/${anio}`;
}

/**
 * Indica si una fecha dada es festivo en Colombia.
 */
export function esFestivo(fecha: Date): boolean {
  const anio = fecha.getFullYear();
  const festivos: Festivo[] = fc.getHolidaysByYear(anio);
  const fechaStr = formatearComoDDMMYYYY(fecha);
  return festivos.some((f) => f.date === fechaStr);
}

/**
 * Devuelve el nombre del festivo si la fecha lo es, o null si no lo es.
 */
export function nombreFestivo(fecha: Date): string | null {
  const anio = fecha.getFullYear();
  const festivos: Festivo[] = fc.getHolidaysByYear(anio);
  const fechaStr = formatearComoDDMMYYYY(fecha);
  const encontrado = festivos.find((f) => f.date === fechaStr);
  return encontrado ? encontrado.name : null;
}