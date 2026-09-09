export const TipoHora = {
  ORDINARIA_DIURNA: 'ORDINARIA_DIURNA',
  ORDINARIA_NOCTURNA: 'ORDINARIA_NOCTURNA',
  ORDINARIA_DOMINICAL: 'ORDINARIA_DOMINICAL',
  ORDINARIA_NOCTURNA_DOMINICAL: 'ORDINARIA_NOCTURNA_DOMINICAL',
  RECARGO_NOCTURNO: 'RECARGO_NOCTURNO',
  RECARGO_DOMINICAL_DIURNO: 'RECARGO_DOMINICAL_DIURNO',
  RECARGO_DOMINICAL_NOCTURNO: 'RECARGO_DOMINICAL_NOCTURNO',
  EXTRA_DIURNA: 'EXTRA_DIURNA',
  EXTRA_NOCTURNA: 'EXTRA_NOCTURNA',
  EXTRA_DIURNA_DOMINICAL: 'EXTRA_DIURNA_DOMINICAL',
  EXTRA_NOCTURNA_DOMINICAL: 'EXTRA_NOCTURNA_DOMINICAL',
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
  // Cálculo principal — sin auxilio
  totalRecargos: number;
  horasOrdinarias: number;
  horasExtra: number;
  horasNocturnas: number;
  horasDominicalesFestivas: number;

  // Referencia separada (auxilio)
  auxilioTransporte: number;
  totalReferencial: number;

  // Compatibilidad hacia atrás
  totalPagar: number;
  advertencias: Advertencia[];
}

export interface MotivoRecargoDominical {
  esDomingo: boolean;
  esFestivo: boolean;
  nombreFestivo: string | null;
  tipoJornada: 'estandar' | 'rotativo';
  diasDescanso: number[]; // Array de 1 o 2 días (0=Dom, 1=Lun, ..., 6=Sáb)
}

export interface DetalleDominicalFestivo {
  fecha: string;
  tipoHora: TipoHora;
  cantidadHoras: number;
  valorTotal: number;
  recargoPromedio: number;
  motivo: MotivoRecargoDominical;
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
  | 'DIA_INVALIDO'
  | 'PERIODO_SIN_DIAS'
  | 'BLOQUES_SOLAPADOS'
  | 'DIAS_SIN_BLOQUE'
  | 'RANGO_EXCEDE_31_DIAS'
  | 'BLOQUE_FUERA_RANGO'
  | 'RANGO_FECHA_INVALIDO'
  | 'AUXILIO_PRORRATEADO'
  | 'ADR_OPCIONALIDAD_FRANJAS'
  | 'LUZ_FRANJAS_MULTIPLES'
  | 'FRANJA_INVALIDA'
  | 'DESCANSO_EXCEDE_TURNO'
  | 'SIN_FRANJAS'
  | 'DEMASIADAS_FRANJAS';

export interface BloqueHorario {
  id: string;
  fechaInicio: string;
  fechaFin: string;
  horariosPorDia: Record<number, { inicio: string; fin: string }>;
  tipoJornada: 'estandar' | 'rotativo';
  diasDescanso: number[]; // Array de 1 o 2 días (0=Dom, 1=Lun, ..., 6=Sáb)
}

export interface ConfiguracionPeriodo {
  fechaInicio: string;
  fechaFin: string;
  bloques: BloqueHorario[];
}

export interface ResultadoPeriodo {
  // Cálculo principal — sin auxilio
  totalRecargos: number;
  resumenPorTipo: ResumenTipo[];
  totalHorasOrdinarias: number;
  totalHorasExtras: number;
  totalHorasNocturnas: number;
  totalHorasDominicalesFestivas: number;

  // Referencia separada (auxilio)
  auxilioTransporte: number;
  totalReferencial: number;

  // Compatibilidad hacia atrás
  totalAPagar: number;
  advertencias: Advertencia[];
  diasCalculados: number;
  diasOmitidos: number;
  detalleDominicalFestivo: DetalleDominicalFestivo[];
}