# REQUERIMIENTOS.md — web_calculador_precio

## 1. Historia y contexto de la idea

En Colombia, la liquidación de nómina incluye múltiples recargos que se combinan de forma compleja:
- Recargo nocturno (35%)
- Recargo dominical/festivo (90%)
- Horas extra diurnas (25%), nocturnas (75%), y sus combinaciones con dominical/festivo
- Ley Emiliani: festivos que caen entre semana se trasladan al lunes siguiente
- Jornada semanal reducida progresivamente (42h desde julio 2026)
- Diferencia crítica: **recargo** (solo el % adicional, hora base ya está en salario) vs **hora extra** (hora completa + %)

La mayoría de trabajadores no sabe calcular esto. Las calculadoras existentes son: de pago, incompletas, con publicidad invasiva, o no explican el desglose hora por hora. Este proyecto nace para **democratizar el acceso a un cálculo correcto, transparente y gratuito**, permitiendo a cualquier persona verificar su liquidación o simular cuánto vale un turno extra.

---

## 2. Requerimientos funcionales

### RF-01: Ingreso de salario mensual
- Campo numérico (COP), sin separadores de miles obligatorios.
- Botón/checkbox "Usar salario mínimo 2026" → autollenar $1.750.905.
- Validación: número > 0. Si < $1.750.905 → **warning visible** "Valor inferior al salario mínimo legal 2026", pero permitir calcular.
- Aclaración visible: "Ingrese salario base **sin auxilio de transporte**".
- **Campo opcional:** "Auxilio de transporte" (numérico COP). **Solo se suma al total final mostrado**, no afecta valor hora ordinaria.

### RF-02: Definición de jornada pactada (semanal habitual)
- Selector de días de la semana: 7 checkboxes (Lunes a Domingo).
- Al menos 1 día debe estar seleccionado.
- **Por cada día seleccionado:** 2 inputs de hora (24h): "Hora inicio" y "Hora fin" para ese día específico (ej: Lunes 06:00–14:00, Martes 06:00–14:00, etc.).
- Validación: hora fin ≠ hora inicio por día (error si iguales).
- Cálculo automático de horas semanales: suma de `(horaFin - horaInicio)` por cada día seleccionado.
- Si horas semanales > 42 → **warning visible** "Jornada semanal excede el límite legal de 42 horas", pero permitir continuar.
- **Regla de negocio:** Si domingo está seleccionado → domingo se trata como día **ordinario** (sin recargo 90%). Solo hay recargo dominical si domingo NO está en jornada pactada.

### RF-03: Ingreso del turno específico a calcular
- Selector de fecha (date picker): día calendario del turno.
- **Múltiples franjas horarias (turnos partidos):** Botón "Añadir franja" para agregar pares hora inicio/fin en la misma fecha (ej: 08:00–12:00 y 14:00–18:00). Mínimo 1 franja, máximo 4 por día.
- Por cada franja: 2 inputs `type="time"`: "Hora inicio" y "Hora fin".
- Validaciones por franja:
  - Hora fin ≠ hora inicio (error).
  - Duración ≤ 24 horas (error si > 24h).
  - No solapamiento entre franjas del mismo día (error si se solapan).
- Duración total del día (suma de franjas) ≤ 24h.
- Fecha no futura excesiva (opcional: warning si > 30 días futuro).
- **Turnos que cruzan medianoche:** Soportados nativamente. La fecha del turno es la de **inicio de la primera franja**; cada hora individual se evalúa con su día calendario real.

### RF-04: Motor de cálculo (lógica pura, client-side)
**Entrada:** `JornadaPactada` + `Turno` (fecha + array de franjas) + `salarioMensual` + `auxilioTransporte` (opcional).
**Salida:** `ResultadoCalculo` con:
- `desgloseHoras: HoraCalculada[]` — array de 1 entrada por hora trabajada:
  - `horaInicio: Date` (inicio de esa hora individual)
  - `horaFin: Date`
  - `tipoHora: TipoHora` (enum: ORDINARIA_DIURNA, ORDINARIA_NOCTURNA, RECARGO_NOCTURNO, RECARGO_DOMINICAL_DIURNO, RECARGO_DOMINICAL_NOCTURNO, EXTRA_DIURNA, EXTRA_NOCTURNA, EXTRA_DOMINICAL_DIURNA, EXTRA_DOMINICAL_NOCTURNA)
  - `esFestivo: boolean`
  - `esNocturna: boolean` (7:00 PM – 6:00 AM)
  - `dentroDeJornada: boolean`
  - `valorHora: number` (COP, redondeado Math.round)
  - `recargoAplicado: number` (porcentaje, ej: 0.35, 0.90, 1.25, etc.)
  - `esHoraExtra: boolean`
- `resumenPorTipo: ResumenTipo[]` — agrupado por `tipoHora`:
  - `tipoHora`
  - `cantidadHoras: number`
  - `valorTotal: number`
  - `recargoPromedio: number`
- `totalPagar: number` (suma de `valorHora` de todas las horas + `auxilioTransporte` si se ingresó)
- `advertencias: Advertencia[]`:
  - `HORAS_EXTRA_DIARIA_EXCEDIDA` si horas extra en el turno > 2
  - `JORNADA_SEMANAL_EXCEDE_42H` si jornada pactada > 42h/sem
  - `SALARIO_BAJO_MINIMO` si salario < $1.750.905
  - `LIMITE_SEMANAL_NO_VALIDADO` (siempre presente en MVP)
  - `AÑO_FESTIVOS_FUERA_RANGO` si año del turno fuera de 2020-2037 → **bloquear cálculo**
  - `FRANJAS_SOLAPADAS` si hay solapamiento entre franjas del mismo día
  - `TURNOS_CRUZA_MEDIANOCHE` (info, si aplica)

### RF-05: Clasificación de cada hora (regla de negocio completa)

**Paso 1: Determinar día calendario real de la hora**
- Para cada hora de cada franja del turno (ej: 22:00–23:00, 23:00–00:00, 00:00–01:00...), crear `Date` con su fecha real.

**Paso 2: Es festivo/dominical?**
- `esFestivo = esFestivo(fecha) || fecha.getDay() === 0` (domingo = 0).
- **Excepción:** Si ese día de semana está en `jornadaPactada.dias` → **NO es festivo/dominical para recargos** (se trata como día ordinario).

**Paso 3: Es nocturna?**
- `esNocturna = hora >= 19:00 || hora < 6:00` (19:00–05:59 inclusive).

**Paso 4: Está dentro de jornada pactada?**
- El día de semana de la hora coincide con algún día en `jornadaPactada.dias` **Y** la hora está entre `jornadaPactada.horariosPorDia[dia].inicio` y `jornadaPactada.horariosPorDia[dia].fin` (considerando cruce medianoche en jornada pactada también).

**Paso 5: Clasificar → TipoHora + recargo**
| Dentro jornada | Festivo/Dom | Nocturna | TipoHora | Recargo | Fórmula |
|----------------|-------------|----------|----------|---------|---------|
| Sí | No | No | ORDINARIA_DIURNA | 0% | `valorHoraOrd × 1.00` |
| Sí | No | Sí | RECARGO_NOCTURNO | 35% | `valorHoraOrd × 0.35` |
| Sí | Sí | No | RECARGO_DOMINICAL_DIURNO | 90% | `valorHoraOrd × 0.90` |
| Sí | Sí | Sí | RECARGO_DOMINICAL_NOCTURNO | 125% | `valorHoraOrd × 1.25` |
| No | No | No | EXTRA_DIURNA | 25% | `valorHoraOrd × 1.25` |
| No | No | Sí | EXTRA_NOCTURNA | 75% | `valorHoraOrd × 1.75` |
| No | Sí | No | EXTRA_DOMINICAL_DIURNA | 115% | `valorHoraOrd × 2.15` |
| No | Sí | Sí | EXTRA_DOMINICAL_NOCTURNA | 165% | `valorHoraOrd × 2.65` |

**Donde:** `valorHoraOrd = salarioMensual / 210` (divisor mensual legal 2026).

**Diferencia clave recargo vs extra:**
- **Recargo (dentro jornada):** Se paga solo el % adicional (`valorHoraOrd × recargo`). La hora base ya está cubierta por el salario mensual.
- **Hora extra (fuera jornada):** Se paga hora completa + % (`valorHoraOrd × (1 + recargo)`).

### RF-06: Visualización de resultados
- **Desglose hora por hora:** Tabla/lista con cada hora, su tipo (badge color), día real, festivo?, nocturna?, dentro jornada?, valor.
- **Resumen agrupado:** Cards por tipo de hora: "3 horas extra nocturnas: $X", "2 recargos dominicales diurnos: $Y".
- **Total a pagar:** Grande, destacado. Formato COP con separadores de miles (`$1.234.567`).
- **Auxilio de transporte:** Si se ingresó, mostrar línea separada: "+ Auxilio transporte: $X" → Total final.
- **Advertencias:** Sección visible con iconos (warning/error/info) listando todas las `advertencias` del resultado.
- **Nota de limitaciones:** Siempre visible al final: "⚠ Esta calculadora valida solo límite diario de horas extra (máx 2h/día). El límite semanal de 12h extra/semana **no se valida**. No incluye prestaciones ni seguridad social."
- **Botón "Copiar total al portapapeles":** Copia el valor total formateado.

### RF-07: Sección educativa (informativa, no interactiva)
- "¿Cómo se calcula tu pago?" — explicación paso a paso en lenguaje llano.
- Tabla de recargos vigentes 2026.
- "Diferencia entre recargo y hora extra" — con ejemplos.
- "¿Qué es la Ley Emiliani?" — festivos trasladados al lunes.
- "Límites legales de horas extra" — 2h/día, 12h/semana.
- FAQ: "Mi jefe me paga menos", "Trabajo domingo habitual", "Turno noche cruza festivo", etc.

### RF-08: Persistencia ligera (opcional, UX)
- `localStorage`: último salario ingresado, jornada pactada, tema (claro/oscuro).
- **No** guardar historial de cálculos ni datos sensibles.

### RF-09: Manejo de errores (Error Boundary)
- React Error Boundary que capture errores del motor de cálculo y muestre UI amable: "Ocurrió un error en el cálculo. Por favor, verifica tus datos e inténtalo de nuevo." + botón "Reintentar" / "Limpiar formulario".
- Log del error en consola para debugging.

### RF-10: Analytics (GA4)
- Integración básica Google Analytics 4 (Measurement ID configurable via env var).
- Eventos clave: `calculo_completado`, `error_calculo`, `copiar_total`, `cambio_tema`.
- Respetar `doNotTrack` y consentimiento del usuario (banner cookie simple si aplica).

---

## 3. Requerimientos no funcionales

| Categoría | Requerimiento |
|-----------|---------------|
| **Rendimiento** | Cálculo de turno (máx 24h) < 50ms en móvil medio. Bundle JS < 150KB gzip. |
| **Accesibilidad** | WCAG 2.1 AA básico: contraste, foco visible, labels en inputs, navegación teclado, aria-live en resultados. |
| **Responsive / Mobile-first** | Diseño principal para < 480px (celular). Breakpoints: 640px, 1024px. Formularios apilados, tablas con scroll horizontal. |
| **PWA** | `manifest.json` (name, icons, start_url, display: standalone). Service worker (Workbox) para cache estático + offline. Instalable en Android/iOS. |
| **Navegadores** | Últimas 2 versiones: Chrome, Firefox, Safari, Edge. Sin IE11. |
| **Internacionalización** | Solo español (CO) en MVP. Fechas/horas en locale `es-CO`, moneda COP. |
| **Analytics** | GA4 básico (Measurement ID via env var). Eventos: calculo_completado, error_calculo, copiar_total, cambio_tema. Respetar doNotTrack. |
| **Mantenibilidad** | Lógica pura 100% testeable. Cobertura unitaria objetivo ≥ 90% en `src/lib/calculos/`. TypeScript strict mode. Error Boundary en UI. |
| **Despliegue** | `npm run build` → carpeta `dist/` lista para Vercel/Netlify. Zero-config deploy. |

---

## 4. Especificación legal / de negocio completa (fuente de verdad)

### 4.1 Constantes legales 2026 (vigentes desde 15 julio 2026)
```typescript
const CONSTANTES_2026 = {
  SALARIO_MINIMO: 1_750_905,      // COP
  JORNADA_SEMANAL_HORAS: 42,      // horas
  DIVISOR_MENSUAL: 210,           // salario / 210 = valor hora ordinaria
  HORA_INICIO_DIURNA: 6,          // 06:00
  HORA_FIN_DIURNA: 19,            // 19:00 (7 PM)
  RECARGO_DOMINICAL_FESTIVO: 0.90 // 90%
} as const;
```

### 4.2 Tabla de recargos (porcentajes sobre `valorHoraOrd = salario / 210`)

| Tipo de hora | Recargo % | Fórmula de pago |
|--------------|-----------|-----------------|
| Ordinaria diurna (base) | 0% | `valorHoraOrd × 1.00` |
| **Recargo nocturno** (dentro jornada) | **35%** | `valorHoraOrd × 0.35` |
| **Recargo dominical/festivo diurno** (dentro jornada) | **90%** | `valorHoraOrd × 0.90` |
| **Recargo dominical/festivo nocturno** (dentro jornada) | **125%** (35%+90%) | `valorHoraOrd × 1.25` |
| **Hora extra diurna** | **25%** | `valorHoraOrd × 1.25` |
| **Hora extra nocturna** | **75%** | `valorHoraOrd × 1.75` |
| **Hora extra diurna dominical/festiva** | **115%** (25%+90%) | `valorHoraOrd × 2.15` |
| **Hora extra nocturna dominical/festiva** | **165%** (75%+90%) | `valorHoraOrd × 2.65` |

### 4.3 Reglas de clasificación (decisión canónica)

1. **Día festivo/dominical** = domingo calendario **O** fecha en lista `festivos-colombia` para ese año (incluye Ley Emiliani: festivos lunes trasladados).
2. **Excepción jornada pactada:** Si el día de semana está en `jornadaPactada.dias` → **no es festivo/dominical para recargos** (día ordinario).
3. **Horario nocturno** = 19:00 (7 PM) a 05:59 (6 AM exclusive). Cada hora se evalúa individualmente.
4. **Dentro de jornada** = día de semana coincide con jornada pactada **Y** hora está en rango habitual (manejar cruce medianoche en jornada pactada).
5. **Recargo vs Hora extra:**
   - Dentro de jornada → paga **solo recargo** (`valorHoraOrd × %`).
   - Fuera de jornada → paga **hora completa + recargo** (`valorHoraOrd × (1 + %)`).
6. **Turnos que cruzan medianoche:** Cada hora individual se clasifica con su **día calendario real**. Ej: Turno Sáb 23:00 – Dom 03:00 → hora 23-00 es sábado, horas 00-03 son domingo.

### 4.4 Límites legales de horas extra (Art. 174 CST + Ley 2101/2021)
- **Máximo 2 horas extra por día.**
- **Máximo 12 horas extra por semana.**
- **MVP:** Solo validación **diaria** (por turno individual). Si horas extra en el turno > 2 → advertencia `HORAS_EXTRA_DIARIA_EXCEDIDA`. **No** se acumulan días de la semana.
- **Nota visible obligatoria:** "⚠ Límite semanal de 12h extra/semana no validado en esta versión."

### 4.5 Festivos y Ley Emiliani (Ley 51 de 1983)
- Festivos fijos: 1 Enero, 20 Julio, 7 Agosto, 8 Diciembre, 25 Diciembre.
- Festivos variables (Ley Emiliani → lunes siguiente): Reyes, San José, Jueves Santo, Viernes Santo, Ascensión, Corpus Christi, Sagrado Corazón, San Pedro y Pablo, Asunción, Todos los Santos, Independencia Cartagena.
- `festivos-colombia` retorna lista correcta por año. `festivos.ts` ya implementado.

### 4.6 Divisor mensual y valor hora ordinaria
- **210** (legal desde 2026 con jornada 42h/sem). No 240, no 235.
- `valorHoraOrd = salarioMensual / 210`.
- **Redondeo:** `Math.round(valorHoraOrd)` por hora individual. Total = suma de horas redondeadas.

---

## 5. Casos de prueba críticos (para validar motor)

| Caso | Entrada | Esperado |
|------|---------|----------|
| Turno ordinario diurno | Jornada L-V 8-17, turno Mié 9-13 | 4h ORDINARIA_DIURNA |
| Turno con recargo nocturno | Jornada L-V 8-17, turno Mié 18-22 | 1h ORDINARIA_DIURNA (18-19) + 3h RECARGO_NOCTURNO (19-22) |
| Domingo NO laboral + turno diurno | Jornada L-V, turno Dom 8-12 | 4h RECARGO_DOMINICAL_DIURNO |
| Domingo laboral (en jornada) + turno | Jornada L-D 8-17, turno Dom 8-12 | 4h ORDINARIA_DIURNA (sin recargo 90%) |
| Festivo (lunes Emiliani) + turno | Jornada L-V, turno Lun festivo 8-12 | 4h RECARGO_DOMINICAL_DIURNO |
| Turno cruza medianoche Sáb→Dom | Jornada L-V, turno Sáb 22:00 – Dom 02:00 | 1h RECARGO_NOCTURNO (sáb) + 2h RECARGO_DOMINICAL_NOCTURNO (dom) |
| Hora extra diurna + nocturna | Jornada L-V 8-17, turno Mié 17-22 | 2h EXTRA_DIURNA (17-19) + 3h EXTRA_NOCTURNA (19-22) |
| Límite 2h extra/día | Jornada L-V 8-17, turno Mié 17-22 | 5h extra → warning HORAS_EXTRA_DIARIA_EXCEDIDA |
| Salario mínimo exacto | Salario 1.750.905, 1h extra diurna | valorHoraOrd = 8.338 → 1h EXTRA_DIURNA = 8.338 × 1.25 = 10.422 |
| Salario < mínimo | Salario 1.000.000, 1h extra diurna | Warning + cálculo con 1M |
| Jornada semanal 6 días × 8h = 48h | Jornada L-S 8-17 | Warning JORNADA_SEMANAL_EXCEDE_42H |
| Hora fin = hora inicio | Turno 08:00–08:00 | Error validación |
| Turno 25h | Turno 08:00–09:00 día siguiente | Error duración |
| Año festivos fuera rango (2019) | Turno fecha 2019 | **Bloquear cálculo** error AÑO_FESTIVOS_FUERA_RANGO |
| Año bisiesto (29 feb) | Turno 28 feb 2024 22:00 – 1 mar 2024 02:00 | Festivos correctos, clasificación correcta |
| Jornada horario por día | L-M-V 8-17, Ma-J 12-20, S 8-12 | Cada día usa su horario propio para "dentro de jornada" |
| Turno partido (múltiples franjas) | Jornada L-V 8-17, turno Mié: 08-12 + 14-18 | 8h totales, 4h dentro (8-12, 14-17) + 1h extra (17-18) |
| Franjas solapadas | Turno Mié: 08-14 + 12-18 | Error FRANJAS_SOLAPADAS |
| Auxilio transporte | Salario 2M, auxilio 200.000, 1h ord diurna | valorHoraOrd = 9.524, total = 9.524 + 200.000 = 209.524 |