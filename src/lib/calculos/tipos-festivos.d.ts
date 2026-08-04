declare module 'festivos-colombia' {
  export interface FestivoInfo {
    date: string;     // formato "DD/MM/YYYY"
    name: string;
    static: boolean;
  }

  export function getHolidaysByYear(year: number): FestivoInfo[];

  const fc: {
    getHolidaysByYear: typeof getHolidaysByYear;
  };
  export default fc;
}