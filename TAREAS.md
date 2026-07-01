# TAREAS.md — web_calculador_precio

Lista de tareas accionables, organizadas en 4 categorías secuenciales. Cada tarea es una unidad de trabajo testeable y completable independientemente.

---

## 1. LÓGICA — Motor de cálculo (funciones puras, TypeScript strict, 100% testeable)

### 1.1 Constantes y tipos base
- [ ] **1.1.1** Crear `src/lib/calculos/constantes.ts` con `CONSTANTES_2026` (salario mínimo, divisor 210, jornada 42h, horarios diurno/nocturno, recargos tabla).
- [ ] **1.1.2** Crear `src/lib/calculos/tipos.ts` con todos los tipos TypeScript:
  - `TipoHora` (enum con 9 valores)
  - `HorarioDia` { inicio: string, fin: string } // "HH:mm"
  - `JornadaPactada` { dias: number[], horariosPorDia: Record<number, HorarioDia> } // key = día 1-7 (1=Lun...7=Dom)
  - `FranjaHoraria` { inicio: string, fin: string }
  - `Turno` { fecha: Date, franjas: FranjaHoraria[] }
  - `HoraCalculada` { horaInicio: Date, horaFin: Date, tipoHora: TipoHora, esFestivo: boolean, esNocturna: boolean, dentroDeJornada: boolean, valorHora: number, recargoAplicado: number, esHoraExtra: boolean }
  - `ResumenTipo` { tipoHora: TipoHora, cantidadHoras: number, valorTotal: number, recargoPromedio: number }
  - `Advertencia` { codigo: string, mensaje: string, severidad: 'info' | 'warning' | 'error' }
  - `ResultadoCalculo` { desgloseHoras: HoraCalculada[], resumenPorTipo: ResumenTipo[], totalPagar: number, advertencias: Advertencia[] }

### 1.2 Utilidades puras
- [ ] **1.2.1** Crear `src/lib/calculos/utilidades.ts` con:
  - `redondearCOP(n: number): number` → `Math.round`
  - `parseHora(hora: string): { horas: number, minutos: number }` (formato "HH:mm")
  - `horaANumero(horas: number, minutos: number): number` (decimal, ej 19.5 = 19:30)
  - `generarHorasTurno(turno: Turno): Date[]` → array de `Date` inicio de cada hora individual de TODAS las franjas (maneja cruce medianoche, max 24h total).
  - `esHoraNocturna(fecha: Date): boolean` (19:00–05:59).
  - `diaSemanaJSaISO(dia: number): number` (0=Dom → 7=Dom para comparación con array jornada).
  - `validarTurno(turno: Turno): Advertencia[]` (franjas válidas, fin ≠ inicio, duración total ≤ 24h, sin solapamiento entre franjas).
  - `validarJornadaPactada(jornada: JornadaPactada): Advertencia[]` (al menos 1 día, horas semanales ≤ 42h → warning).
  - `validarAñoFestivos(año: number): Advertencia[]` → error si año < 2020 o > 2037.

### 1.3 Festivos (ya existe `festivos.ts`, completar)
- [ ] **1.3.1** Revisar `src/lib/calculos/festivos.ts`: confirmar que exporta `esFestivo(fecha: Date): Promise<boolean>` o sync, y `obtenerFestivosAño(año: number): Date[]`.
- [ ] **1.3.2** Añadir wrapper síncrono `esFestivoSync(fecha: Date): boolean` que use cache en memoria del año consultado (para no llamar async en bucle de horas).
- [ ] **1.3.3** Test manual: verificar que festivos 2026 incluyen Ley Emiliani (ej: 19 junio 2026 = Sagrado Corazón → lunes 22 junio).

### 1.4 Clasificación de hora individual (núcleo del motor)
- [ ] **1.4.1** Crear `src/lib/calculos/clasificacion.ts` con función pura:
  ```typescript
  function clasificarHora(
    hora: Date,
    jornadaPactada: JornadaPactada,
    esFestivo: boolean,
    dentroDeJornada: boolean
  ): { tipoHora: TipoHora; recargo: number; esHoraExtra: boolean }
  ```
  Implementar tabla de decisión completa (8 casos) según RF-05.
- [ ] **1.4.2** Función auxiliar `estaDentroDeJornada(hora: Date, jornada: JornadaPactada): boolean` que maneje cruce medianoche en jornada pactada.
- [ ] **1.4.3** Función auxiliar `esDiaLaboralHabitual(fecha: Date, jornada: JornadaPactada): boolean`.

### 1.5 Motor principal de cálculo
- [ ] **1.5.1** Crear `src/lib/calculos/motor.ts` con:
  ```typescript
  export async function calcularTurno(
    salarioMensual: number,
    jornadaPactada: JornadaPactada,
    turno: Turno,
    auxilioTransporte?: number
  ): Promise<ResultadoCalculo>
  ```
  Flujo:
  1. Validar entradas → advertencias iniciales (incl. `validarAñoFestivos` → error si fuera de rango).
  2. `valorHoraOrd = redondearCOP(salarioMensual / 210)`.
  3. `horas = generarHorasTurno(turno)`.
  4. Para cada hora:
     - `esFestivo = esFestivoSync(hora) || hora.getDay() === 0`
     - `esFestivoReal = esFestivo && !esDiaLaboralHabitual(hora, jornadaPactada)`
     - `esNocturna = esHoraNocturna(hora)`
     - `dentroJornada = estaDentroDeJornada(hora, jornadaPactada)`
     - `clasificacion = clasificarHora(hora, jornadaPactada, esFestivoReal, dentroJornada)`
     - `valorHora = dentroJornada ? valorHoraOrd * clasificacion.recargo : valorHoraOrd * (1 + clasificacion.recargo)`
     - Construir `HoraCalculada`.
  5. Agrupar por `tipoHora` → `resumenPorTipo`.
  6. `totalPagar = sum(h.valorHora) + (auxilioTransporte || 0)`.
  7. Generar advertencias: extra > 2h/día, jornada > 42h/sem, salario < mínimo, límite semanal no validado, año fuera rango (bloquea), franjas solapadas.
  8. Retornar `ResultadoCalculo`.

### 1.6 Barrel export y tipos públicos
- [ ] **1.6.1** Crear `src/lib/calculos/index.ts` exportando todo lo público.

### 1.7 Tests unitarios del motor (Vitest)
- [ ] **1.7.1** Configurar Vitest + @testing-library/jest-dom en `package.json`.
- [ ] **1.7.2** Test `constantes.ts`: valores correctos 2026.
- [ ] **1.7.3** Test `utilidades.ts`: redondeo, parsing horas, generación horas cruce medianoche, validación año festivos, validación franjas solapadas.
- [ ] **1.7.4** Test `clasificacion.ts`: **8 casos de la tabla** + edge cases (festivo en jornada pactada, noche cruce 19:00/06:00).
- [ ] **1.7.5** Test `motor.ts` — **casos críticos end-to-end**:
  - Caso 1: Turno ordinario diurno 4h → 4 ORDINARIA_DIURNA.
  - Caso 2: Recargo nocturno dentro jornada.
  - Caso 3: Domingo no laboral diurno → RECARGO_DOMINICAL_DIURNO.
  - Caso 4: Domingo EN jornada pactada → ORDINARIA_DIURNA (sin 90%).
  - Caso 5: Festivo Emiliani (lunes) → RECARGO_DOMINICAL_DIURNO.
  - Caso 6: **Turno cruza medianoche Sáb 23:00 – Dom 03:00** → 1h RECARGO_NOCTURNO (sáb) + 3h RECARGO_DOMINICAL_NOCTURNO (dom).
  - Caso 7: Horas extra diurnas + nocturnas + límite 2h/día → warning.
  - Caso 8: Salario < mínimo → warning + cálculo con valor ingresado.
  - Caso 9: Hora fin = hora inicio → error validación.
  - Caso 10: Jornada semanal 6 días × 8h = 48h → warning.
  - Caso 11: Año festivos fuera rango (2019) → error AÑO_FESTIVOS_FUERA_RANGO (bloquea).
  - Caso 12: Año bisiesto (29 feb 2024) → festivos correctos.
  - Caso 13: Jornada horario por día (L 8-17, M 12-20) → cada día usa su horario.
  - Caso 14: Turno partido (múltiples franjas) → suma correcta horas.
  - Caso 15: Franjas solapadas → error FRANJAS_SOLAPADAS.
  - Caso 16: Auxilio transporte → solo suma a total, no afecta valor hora.
- [ ] **1.7.6** Cobertura objetivo: ≥ 90% en `src/lib/calculos/`.

---

## 2. DISEÑO — UI de la calculadora (React + Tailwind, mobile-first)

### 2.1 Setup y componentes base (UI primitives)
- [ ] **2.1.1** Instalar/Configurar `tailwindcss` v4 (ya en package.json), verificar `index.css` con `@import "tailwindcss"`.
- [ ] **2.1.2** Crear componentes en `src/components/ui/`:
  - `Button.tsx` (variant: primary, secondary, ghost; size: sm, md, lg)
  - `Input.tsx` (label, error, helperText, type=number|text|time)
  - `Select.tsx` / `CheckboxGroup.tsx` (para días semana)
  - `Card.tsx`, `Badge.tsx` (tipos de hora con colores semánticos)
  - `Table.tsx` / `DataList.tsx` (desglose hora por hora, responsive con scroll-x)
  - `Alert.tsx` (advertencias: info/warning/error)
  - `Tabs.tsx` (para separar "Calculadora" / "Cómo funciona" / "Tus derechos")

### 2.2 Layout y tema
- [ ] **2.2.1** `src/components/Layout.tsx`: header (logo + título), main, footer (enlace repo, versión, disclaimer legal).
- [ ] **2.2.2** Tema claro/oscuro: `useTheme` hook + `localStorage` + `class="dark"` en `<html>`. Tailwind `dark:` variants en componentes.
- [ ] **2.2.3** Responsive breakpoints: `< 640px` (mobile), `640-1024` (tablet), `>1024` (desktop). Formularios apilados en mobile.

### 2.3 Formulario: Jornada Pactada
- [ ] **2.3.1** Componente `FormularioJornada.tsx`:
  - Checkbox group L-D (labels cortos: Lu, Ma, Mi, Ju, Vi, Sá, Do).
  - **Por cada día seleccionado:** 2 inputs `type="time"`: inicio, fin para ese día (se muestran/ocultan dinámicamente).
  - Validación en tiempo real: al menos 1 día, hora fin ≠ inicio por día.
  - Display calculado: "Horas/semana: Y" + warning si Y > 42.
  - Botón "Guardar jornada" → guarda en estado global / localStorage.

### 2.4 Formulario: Turno a calcular
- [ ] **2.4.1** Componente `FormularioTurno.tsx`:
  - Input `type="date"` (fecha turno, default hoy).
  - **Múltiples franjas:** Lista de pares hora inicio/fin. Botón "Añadir franja" (máx 4). Botón "Eliminar" por franja.
  - Validación por franja: fin ≠ inicio, duración ≤ 24h.
  - Validación global: sin solapamiento entre franjas, duración total ≤ 24h.
  - Checkbox rápido "Turno noche cruza medianoche" (auto-detectado si fin < inicio en alguna franja).
  - Campo opcional "Auxilio de transporte" (numérico COP, helper: "Solo suma al total final").
  - Botón "Calcular" (disabled si jornada no guardada o turno inválido).

### 2.5 Visualización de resultados
- [ ] **2.5.1** `DesgloseHoras.tsx`: tabla/lista virtualizada (máx 24 rows) con columnas: Hora (ej "22:00–23:00"), Día real, Tipo (badge color), Festivo, Nocturna, Dentro jornada, Valor.
- [ ] **2.5.2** `ResumenTotales.tsx`: grid de cards por `tipoHora` (solo los >0): "3h Extra nocturna • $45.210".
- [ ] **2.5.3** `TotalPagar.tsx`: número grande, formato COP con separadores de miles (`$1.234.567`). Si hay auxilio transporte: línea "+ Auxilio transporte: $X" → Total final.
- [ ] **2.5.4** `Advertencias.tsx`: lista de `Advertencia` con iconos (info/warning/error), siempre visible si hay alguna.
- [ ] **2.5.5** `NotaLimitaciones.tsx`: fijo al pie de resultados con texto estándar del MVP (límite semanal no validado, sin prestaciones/seguridad social).
- [ ] **2.5.6** Botón "Copiar total al portapapeles" → copia valor total formateado.

### 2.6 Sección educativa (informativa)
- [ ] **2.6.1** Componente `SeccionEducativa.tsx` con tabs/acordeón:
  - "¿Cómo se calcula?" (paso a paso lenguaje llano).
  - "Tabla de recargos 2026" (tabla visual).
  - "Recargo vs Hora extra" (ejemplo numérico comparativo).
  - "Ley Emiliani: festivos al lunes".
  - "Límites legales horas extra".
  - "Preguntas frecuentes" (5-6 FAQ).
- [ ] **2.6.2** Iconos SVG inline (lucide-react o heroicons) para legibilidad.

### 2.7 Integración y estado global
- [ ] **2.7.1** Hook `useCalculo.ts`: orquesta `motor.calcularTurno()`, maneja loading/error/resultado, expone `calcular()`, `reset()`.
- [ ] **2.7.2** Hook `useLocalStorage.ts` genérico para preferencias.
- [ ] **2.7.3** `ErrorBoundary.tsx`: componente clase que captura errores en subárbol, muestra UI amable + botón "Reintentar" / "Limpiar", log en consola.
- [ ] **2.7.4** `GA4.tsx`: inicialización `gtag` con Measurement ID desde `import.meta.env.VITE_GA_ID`, helpers `trackEvent(nombre, params)`, respetar `doNotTrack`.
- [ ] **2.7.5** `App.tsx`: compone Layout → ErrorBoundary → (FormularioJornada + FormularioTurno) → Resultados → SeccionEducativa. Incluye GA4.

### 2.8 Accesibilidad y pulido
- [ ] **2.8.1** Labels asociados a inputs, `aria-describedby` para errores, `aria-live="polite"` en resultados.
- [ ] **2.8.2** Contraste AA en ambos temas, focus-visible visible.
- [ ] **2.8.3** Navegación teclado completa (Tab, Enter, Escape).
- [ ] **2.8.4** Formato moneda COP: `new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 })`.

---

## 3. TESTING — Pruebas automatizadas

### 3.1 Configuración
- [ ] **3.1.1** Vitest configurado (`vitest.config.ts`), coverage con `v8`.
- [ ] **3.1.2** Scripts `test`, `test:run`, `test:coverage` en `package.json`.

### 3.2 Tests unitarios (lógica pura) — ya listados en 1.7
- [ ] **3.2.1** Ejecutar y pasar todos los tests de 1.7.2–1.7.6.
- [ ] **3.2.2** Añadir tests de regresión para bugs encontrados en QA manual.

### 3.3 Tests de componentes (React Testing Library)
- [ ] **3.3.1** `FormularioJornada`: render, validaciones, guardado en localStorage, horario por día dinámico.
- [ ] **3.3.2** `FormularioTurno`: validaciones, múltiples franjas, detección cruce medianoche, auxilio transporte.
- [ ] **3.3.3** `DesgloseHoras`: render correcto de 24 horas, badges correctos.
- [ ] **3.3.4** `ResumenTotales`: agrupación correcta, totales coinciden con motor.
- [ ] **3.3.5** `Advertencias`: muestra warnings/errors/info con iconos correctos.
- [ ] **3.3.6** `ErrorBoundary`: captura error, muestra UI fallback, botón reintentar funciona.
- [ ] **3.3.7** `GA4`: trackEvent llama gtag (mock), respeta doNotTrack.
- [ ] **3.3.8** Integración: flujo completo jornada + turno → resultados → coinciden con motor puro.

### 3.4 Casos límite a validar (checklist manual + automatizado)
| Caso | Qué validar |
|------|-------------|
| Turno 23:00–07:00 (cruza medianoche + noche) | 8 horas, clasificación correcta por franja horaria |
| Festivo Emiliani (lunes) + turno nocturno | RECARGO_DOMINICAL_NOCTURNO (125%) |
| Domingo en jornada pactada + turno nocturno | ORDINARIA_NOCTURNA (solo 35%, sin 90%) |
| Salario = 1.750.905 (mínimo exacto) | valorHoraOrd = 8.338, redondeo correcto |
| Salario = 1.000.000 (< mínimo) | Warning + cálculo con 1M |
| Jornada 7 días × 6h = 42h exactas | Sin warning semanal |
| Jornada 6 días × 8h = 48h | Warning semanal visible |
| Hora fin = hora inicio (08:00–08:00) | Error, no calcula |
| Turno 25h | Error duración |
| Año festivos fuera rango (2019) | **Bloquear cálculo** error AÑO_FESTIVOS_FUERA_RANGO |
| Año bisiesto (29 feb) | Turno 28 feb 22:00 – 1 mar 02:00, festivos correctos |
| Jornada horario por día (L-M-V 8-17, Ma-J 12-20) | Cada día usa su horario para "dentro de jornada" |
| Turno partido (2 franjas: 08-12 + 14-18) | 8h totales, clasificación correcta por franja |
| Franjas solapadas (08-14 + 12-18) | Error FRANJAS_SOLAPADAS |
| Auxilio transporte | Solo suma al total, no afecta valor hora |
| Múltiples cálculos seguidos | Estado limpio, sin fuga de memoria |

### 3.5 E2E (opcional, Playwright)
- [ ] **3.5.1** Setup Playwright en `package.json`.
- [ ] **3.5.2** Test happy path: carga página → llena jornada → llena turno → calcula → verifica total.
- [ ] **3.5.3** Test PWA: `manifest.json` válido, service worker registrado, funciona offline.

---

## 4. DESPLIEGUE — Build, PWA, Deploy, Verificación

### 4.1 Build de producción
- [ ] **4.1.1** Verificar `npm run build` genera `dist/` sin errores TypeScript ni ESLint.
- [ ] **4.1.2** `npm run preview` sirve `dist/` correctamente en local.
- [ ] **4.1.3** Bundle analysis: `npm run build && npx vite-bundle-analyzer dist` → JS < 150KB gzip, CSS < 20KB.

### 4.2 PWA (Progressive Web App)
- [ ] **4.2.1** Instalar `vite-plugin-pwa` + `workbox`.
- [ ] **4.2.2** Configurar `vite.config.ts`:
  - `manifest: { name, short_name, description, theme_color, background_color, display: 'standalone', icons: [...] }`
  - `workbox: { globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'], runtimeCaching: [...] }`
- [ ] **4.2.3** Generar icons (192, 512, maskable) en `public/icons/`.
- [ ] **4.2.4** Registrar SW en `main.tsx`: `if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js')`.
- [ ] **4.2.5** Test offline: `npm run preview`, abrir en Chrome, DevTools → Application → Service Workers → Offline → reload → app funciona.

### 4.3 Despliegue en Vercel / Netlify
- [ ] **4.3.1** Conectar repo GitHub a Vercel (o Netlify).
- [ ] **4.3.2** Configurar build command: `npm run build`, output: `dist`.
- [ ] **4.3.3** Variables de entorno en Vercel: `VITE_GA_ID=G-XXXXXXXXXX` (GA4 Measurement ID).
- [ ] **4.3.4** Headers de seguridad en `vercel.json` / `_headers`:
  - `Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:; connect-src 'self' https://www.google-analytics.com https://region1.google-analytics.com;`
  - `X-Frame-Options: DENY`
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: strict-origin-when-cross-origin`
- [ ] **4.3.5** Deploy preview en PR, deploy production en merge a main.

### 4.4 Verificación post-despliegue
- [ ] **4.4.1** Abrir URL producción → verificar HTTPS, PWA installable (prompt "Instalar app").
- [ ] **4.4.2** Probar flujo completo en móvil real (Android Chrome + iOS Safari).
- [ ] **4.4.3** Lighthouse CI (performance ≥ 90, accessibility ≥ 95, best practices ≥ 90, PWA ≥ 90).
- [ ] **4.4.4** Verificar `manifest.json` y `sw.js` servidos con headers correctos (`Cache-Control: max-age=31536000` para assets hasheados).
- [ ] **4.4.5** Probar caso real: jornada L-V 8-17, turno sáb 22–dom 2 → verificar desglose y total.

### 4.5 Documentación final y handoff
- [ ] **4.5.1** Actualizar `README.md` con: descripción, stack, cómo desarrollar (`npm run dev`), cómo testear (`npm run test`), cómo desplegar, arquitectura lógica/UI.
- [ ] **4.5.2** `CHANGELOG.md` v0.1.0 con features MVP.
- [ ] **4.5.3** Etiquetar release `v0.1.0` en Git.

---

## 📋 DECISIONES CONFIRMADAS (omisiones resueltas)

| # | Decisión | Implementación en tareas |
|---|----------|--------------------------|
| 1 | **Auxilio de transporte**: campo opcional que **solo suma al total final** (no afecta valor hora) | RF-01, tipos.ts, motor.ts, FormularioTurno, TotalPagar |
| 2 | **Festivos años fuera de rango (2020-2037)**: **Bloquear cálculo** con error | validarAñoFestivos en utilidades, motor, test caso 11 |
| 3 | **Jornada pactada con horario por día**: **Soportado en MVP** (horario distinto por día seleccionado) | tipos.ts (HorarioDia + Record), FormularioJornada dinámico, estaDentroDeJornada |
| 4 | **Turnos partidos (múltiples franjas/día)**: **Soportado en MVP** (botón "Añadir franja", máx 4) | tipos.ts (FranjaHoraria[]), FormularioTurno, generarHorasTurno, validarTurno |
| 5 | **Exportar resultado**: **Solo copiar total al portapapeles** (MVP) | TotalPagar.tsx botón copiar |
| 6 | **Analytics**: **GA4** (Measurement ID via env var VITE_GA_ID) | GA4.tsx, vercel.json CSP, deploy env var |
| 7 | **Error Boundary React**: **Sí, en fase UI** (clase, UI fallback + reintentar) | ErrorBoundary.tsx, App.tsx wrapper |
| 8 | **Año bisiesto (29 feb)**: **Incluir test específico** caso 12 | Test motor.ts caso 12 |
| 9 | **Redondeo**: **Confirmado Math.round por hora individual** | utilidades.redondearCOP, motor aplica por hora |
| 10 | **Nota límite semanal**: **Siempre visible** (fija en pie de resultados) | NotaLimitaciones.tsx siempre renderizada |

---

## 🎯 PRÓXIMO PASO RECOMENDADO

Todas las decisiones están confirmadas. **Podemos arrancar Fase 1 (Lógica)** con las tareas 1.1 → 1.7 en orden.

¿Empezamos con `src/lib/calculos/constantes.ts` y `tipos.ts`?