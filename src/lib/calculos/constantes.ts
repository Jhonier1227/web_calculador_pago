// Copyright (c) 2026 Jhonier Stiven Montaño Castillo. Todos los derechos reservados.
// Uso no autorizado de este código está estrictamente prohibido.

export const CONSTANTES_2026 = {
  SALARIO_MINIMO: 1_750_905,
  JORNADA_SEMANAL_HORAS: 42,
  DIVISOR_MENSUAL: 210,
  HORA_INICIO_DIURNA: 6,
  HORA_FIN_DIURNA: 19,
  RECARGO_DOMINICAL_FESTIVO: 0.90,
} as const;

export const RECARGO_PORCENTAJES = {
  NOCTURNO: 0.35,
  DOMINICAL_FESTIVO_DIURNO: 0.90,
  DOMINICAL_FESTIVO_NOCTURNO: 1.25,
  EXTRA_DIURNA: 0.25,
  EXTRA_NOCTURNA: 0.75,
  EXTRA_DOMINICAL_FESTIVA_DIURNA: 1.15,
  EXTRA_DOMINICAL_FESTIVA_NOCTURNA: 1.65,
} as const;

export const LEGAL_LIMITS = {
  MAX_HORAS_EXTRA_DIARIAS: 2,
  MAX_HORAS_EXTRA_SEMANALES: 12,
  MAX_HORAS_TURNO: 24,
  MAX_FRANJAS_POR_DIA: 4,
  FESTIVOS_AÑO_MIN: 2020,
  FESTIVOS_AÑO_MAX: 2037,
} as const;

export type Constantes2026 = typeof CONSTANTES_2026;
export type RecargoPorcentajes = typeof RECARGO_PORCENTAJES;
export type LegalLimits = typeof LEGAL_LIMITS;