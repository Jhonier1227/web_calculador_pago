export const TipoHora = {
  ORDINARIA_DIURNA: 'ORDINARIA_DIURNA',
  ORDINARIA_NOCTURNA: 'ORDINARIA_NOCTURNA',
  RECARGO_NOCTURNO: 'RECARGO_NOCTURNO',
  RECARGO_DOMINICAL_DIURNO: 'RECARGO_DOMINICAL_DIURNO',
  RECARGO_DOMINICAL_NOCTURNO: 'RECARGO_DOMINICAL_NOCTURNO',
  EXTRA_DIURNA: 'EXTRA_DIURNA',
  EXTRA_NOCTURNA: 'EXTRA_NOCTURNA',
  EXTRA_DOMINICAL_DIURNA: 'EXTRA_DOMINICAL_DIURNA',
  EXTRA_DOMINICAL_NOCTURNA: 'EXTRA_DOMINICAL_NOCTURNA',
} as const;

export type TipoHora = (typeof TipoHora)[keyof typeof TipoHora];

export interface HorarioDia {
  inicio: string;
  fin: string;
}

export interface JornadaPactada {
  dias: number[];
  horariosPorDia: Record<number, HorarioDia>;
}

export interface FranjaHoraria {
  inicio: string;
  fin: string;
}

export interface Turno {
  fecha: Date;
  franjas: FranjaHoraria[];
}

export interface HoraCalculada {
  horaInicio: Date;
  horaFin: Date;
  tipoHora: TipoHora;
  esFestivo: boolean;
  esNocturna: boolean;
  dentroDeJornada: boolean;
  valorHora: number;
  recargoAplicado: number;
  esHoraExtra: boolean;
}

export interface ResumenTipo {
  tipoHora: TipoHora;
  cantidadHoras: number;
  valorTotal: number;
  recargoPromedio: number;
}

export type SeveridadAdvertencia = 'info' | 'warning' | 'error';

export interface Advertencia {
  codigo: string;
  mensaje: string;
  severidad: SeveridadAdvertencia;
}

export interface ResultadoCalculo {
  desgloseHoras: HoraCalculada[];
  resumenPorTipo: ResumenTipo[];
  totalPagar: number;
  advertencias: Advertencia[];
}

export type CodigosAdvertencia =
  | 'HORAS_EXTRA_DIARIA_EXCEDIDA'
  | 'JORNADA_SEMANAL_EXCEDE_42H'
  | 'SALARIO_BAJO_MINIMO'
  | 'LIMITE_SEMANAL_NO_VALIDADO'
  | 'AÑO_FESTIVOS_FUERA_RANGO'
  | 'FRANJAS_SOLAPADAS'
  | 'TURNOS_CRUZA_MEDIANOCHE'
  | 'HORA_FIN_IGUAL_INICIO'
  | 'DURACION_EXCEDE_24H'
  | 'SIN_DIAS_JORNADA'
  | 'DIA_INVALIDO';