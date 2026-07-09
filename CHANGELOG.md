# Changelog

## v0.1.0 (2026-07-09)

### MVP inicial — Calculadora Laboral Colombiana

#### Features
- Cálculo de recargos por turno individual con 9 tipos de hora
- Cálculo por período (quincena o mes completo) con acumulador semanal
- Detección automática de festivos colombianos (Ley Emiliani) con cache
- Soporte de turnos con múltiples franjas (máx 4) y cruce de medianoche
- Jornada pactada con horario distinto por día de la semana
- Desglose hora por hora con badges de tipo de hora, nocturnidad y festivo
- Resumen por tipo de hora con totales agrupados
- Advertencias: salario bajo mínimo, horas extra excedidas, límite semanal no validado
- Nota de limitaciones legales siempre visible
- Sección educativa con tabs: cómo se calcula, tabla de recargos, FAQ
- Calculadora básica integrada con soporte de teclado físico
- Tema claro/oscuro con persistencia en localStorage
- Formato COP con separadores de miles (es-CO)
- Copia de total al portapapeles
- Google Analytics 4 (opt-in, respeta Do Not Track y GPC)
- PWA: service worker con precache, manifest, iconos 192/512/maskable
- Diseño responsive mobile-first con Tailwind CSS v4

#### Seguridad y calidad
- Validación de inputs: salario (rango $1M–$50M), horas, fechas, período máx 31 días
- Error Boundary con UI de fallback y botón reintentar
- TypeScript strict mode, 0 errores de compilación
- 150 tests unitarios y de componentes (Vitest + RTL)
- 2 tests E2E (Playwright): happy path + PWA meta tags
- 0 vulnerabilidades en dependencias (npm audit)
- Licencia privada con derechos reservados
- Archivo LICENSE y comentarios de copyright en archivos clave
- README con documentación de instalación, uso y limitaciones

#### Bugs corregidos
- Jornada 8-17 + bloque 6-14 producía 10 horas EXTRA (debían ser 0) — acumulador semanal extendido a todos los días
- 21 omitidos en rango de 26 días — normalización con setHours(0,0,0,0) en el iterador de fechas
