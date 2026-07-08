# TAREAS.md — web_calculador_precio

Lista de tareas accionables, organizadas en 4 categorías secuenciales. Cada tarea es una unidad de trabajo testeable y completable independientemente.

---

## 1. LÓGICA — Motor de cálculo (funciones puras, TypeScript strict, 100% testeable)

### 1.1 Constantes y tipos base
- [x] **1.1.1** Crear `src/lib/calculos/constantes.ts` con `CONSTANTES_2026` (salario mínimo, divisor 210, jornada 42h, horarios diurno/nocturno, recargos tabla).
- [x] **1.1.2** Crear `src/lib/calculos/tipos.ts` con todos los tipos TypeScript:
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
- [x] **1.2.1** Crear `src/lib/calculos/utilidades.ts` con:
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
- [x] **1.3.1** Revisar `src/lib/calculos/festivos.ts`: confirmar que exporta `esFestivo(fecha: Date): boolean` (sync), y `obtenerFestivosAño(año: number): Date[]`. → ✅ sync confirmado. `obtenerFestivosAño` no exportado (se usa internamente `obtenerFestivos` con cache).
- [x] **1.3.2** Añadir cache en memoria del año consultado `Map<number, Festivo[]>` (evita 24-48 llamadas por cálculo). ✅ implementado en sesión anterior.
- [x] **1.3.3** Test manual: verificar que festivos 2026 incluyen Ley Emiliani — ✅ Sagrado Corazón 15/06/2026 (lunes), Reyes Magos 12/01/2026 (lunes).

### 1.4 Clasificación de hora individual (núcleo del motor)
- [x] **1.4.1** Crear `src/lib/calculos/clasificacion.ts` con función pura:
  ```typescript
  function clasificarHora(
    hora: Date,
    jornadaPactada: JornadaPactada,
    esFestivo: boolean,
    dentroDeJornada: boolean
  ): { tipoHora: TipoHora; recargo: number; esHoraExtra: boolean }
  ```
  Implementar tabla de decisión completa (8 casos) según RF-05.
- [x] **1.4.2** Función auxiliar `estaDentroDeJornada(hora: Date, jornada: JornadaPactada): boolean` que maneje cruce medianoche en jornada pactada.
- [x] **1.4.3** Función auxiliar `esDiaLaboralHabitual(fecha: Date, jornada: JornadaPactada): boolean`.

### 1.5 Motor principal de cálculo
- [x] **1.5.1** Crear `src/lib/calculos/motor.ts` con:
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
- [x] **1.6.1** Crear `src/lib/calculos/index.ts` exportando todo lo público.

### 1.7 Tests unitarios del motor (Vitest)
- [x] **1.7.1** Configurar Vitest + @testing-library/jest-dom en `package.json`.
- [x] **1.7.2** Test `constantes.ts`: valores correctos 2026 (19 tests).
- [x] **1.7.3** Test `utilidades.ts`: redondeo, parsing horas, generación horas cruce medianoche, validación año festivos, validación franjas solapadas (35 tests).
- [x] **1.7.4** Test `clasificacion.ts`: **8 casos de la tabla** + edge cases (festivo en jornada pactada, noche cruce 19:00/06:00, jornada nocturna cruce medianoche) (18 tests).
- [x] **1.7.5** Test `motor.ts` — **casos críticos end-to-end** (18 tests):
  - Caso 1: Turno ordinario diurno 4h → 4 ORDINARIA_DIURNA.
  - Caso 2: Turno fuera jornada con horas nocturnas → EXTRA_DIURNA + EXTRA_NOCTURNA.
  - Caso 3: Domingo no laboral diurno → EXTRA_DOMINICAL_DIURNA.
  - Caso 4: Domingo EN jornada pactada → ORDINARIA_DIURNA (sin 90%).
  - Caso 5: Festivo Emiliani (lunes) → RECARGO_DOMINICAL_DIURNO.
  - Caso 6: **Turno cruza medianoche Sáb 23:00 – Dom 03:00** → 1h EXTRA_NOCTURNA + 3h EXTRA_DOMINICAL_NOCTURNA.
  - Caso 7: Horas extra + límite 2h/día → warning.
  - Caso 8: Salario < mínimo → warning + cálculo con valor ingresado.
  - Caso 9: Hora fin = hora inicio → error FRANJA_INVALIDA.
  - Caso 10: Jornada semanal 6 días × 8h = 48h → warning.
  - Caso 11: Año festivos fuera rango (2019) → error AÑO_FESTIVOS_FUERA_RANGO (bloquea).
  - Caso 12: Año bisiesto (29 feb 2024) → festivos correctos.
  - Caso 13: Jornada horario por día (L 8-17, M 12-20) → cada día usa su horario.
  - Caso 14: Turno partido (múltiples franjas) → suma correcta horas.
  - Caso 15: Franjas solapadas → error FRANJAS_SOLAPADAS.
  - Caso 16: Auxilio transporte → solo suma a total, no afecta valor hora.
- [x] **1.7.6** Cobertura objetivo: ≥ 90% en `src/lib/calculos/` — ✅ **96.79% lines**.

---

## 2. DISEÑO — UI de la calculadora (React + Tailwind, mobile-first)

### 2.1 Setup y componentes base (UI primitives)
- [x] **2.1.1** Instalar/Configurar `tailwindcss` v4 (ya en package.json), verificar `index.css` con `@import "tailwindcss"` y `@tailwindcss/vite` en `vite.config.ts`. ✅ verificado.
- [x] **2.1.2** Crear componentes en `src/components/ui/`:
  - [x] `Button.tsx` (variant: primary, secondary, ghost; size: sm, md, lg)
  - [x] `Input.tsx` (label, error, helperText, type=number|text|time)
   - [x] `Select.tsx` / ~~`CheckboxGroup.tsx`~~ (días semana ya integrado en FormularioJornada)
   - [x] `Card.tsx`
   - [x] `Badge.tsx` (tipos de hora con colores semánticos — 9 colores)
   - [x] `Table.tsx` / `DataList.tsx` (tablas inline en DesgloseHoras y SeccionEducativa)
   - [x] `Alert.tsx` (advertencias: info/warning/error)
   - [x] `Tabs.tsx` (para sección educativa)
- [x] **2.1.3** Crear `src/components/ui/index.ts` — barrel export

### 2.2 Layout y tema
- [x] **2.2.1** `src/components/Layout.tsx`: header (título + subtítulo), main, footer (disclaimer legal).
- [x] **2.2.2** Tema claro/oscuro: `useTheme` hook + `localStorage` + `class="dark"` en `<html>`. Tailwind `dark:` variants en componentes.
- [x] **2.2.3** Responsive breakpoints: `< 640px` (mobile), `640-1024` (tablet), `>1024` (desktop). Formularios apilados en mobile.

### 2.3 Formulario: Jornada Pactada
- [x] **2.3.1** Componente `FormularioJornada.tsx`:
  - [x] Checkbox group L-D (labels cortos: Lu, Ma, Mi, Ju, Vi, Sá, Do).
  - [x] **Por cada día seleccionado:** 2 inputs `type="time"`: inicio, fin para ese día (se muestran/ocultan dinámicamente).
  - [x] Validación en tiempo real: al menos 1 día, hora fin ≠ inicio por día.
  - [x] Display calculado: "Horas/semana: Y" + warning si Y > 42.
  - [x] Botón "Guardar jornada" → guarda en estado global / localStorage (via useLocalStorage).

### 2.4 Formulario: Turno a calcular
- [x] **2.4.1** Componente `FormularioTurno.tsx`:
  - [x] Input `type="date"` (fecha turno, default hoy).
  - [x] **Múltiples franjas:** Lista de pares hora inicio/fin. Botón "Añadir franja" (máx 4). Botón "Eliminar" por franja.
  - [x] Validación por franja: fin ≠ inicio, duración ≤ 24h.
  - [x] Validación global: sin solapamiento entre franjas, duración total ≤ 24h.
  - [x] Indicador "Turno cruza medianoche" (auto-detectado si fin < inicio en alguna franja, muestra alert info).
  - [x] Campo opcional "Auxilio de transporte" (numérico COP, helper: "Solo suma al total final"). — ✅ en App.tsx, no en FormularioTurno.
  - [x] Botón "Calcular" (disabled si jornada no guardada o turno inválido).

### 2.5 Visualización de resultados
- [x] **2.5.1** `DesgloseHoras.tsx`: tabla con columnas: Hora, Día real, Tipo (Badge color), Nocturna, Festivo, Dentro jornada, Valor.
- [x] **2.5.2** `ResumenTotales.tsx`: grid de cards por `tipoHora` (solo los >0): "3h Extra nocturna • $45.210".
- [x] **2.5.3** `TotalPagar.tsx`: número grande, formato COP con separadores de miles. Auxilio transporte línea separada.
- [x] **2.5.4** `Advertencias.tsx`: lista de advertencias con Alert (info/warning/error).
- [x] **2.5.5** `NotaLimitaciones.tsx`: separado en componente propio con Alert info + disclaimer legal.
- [x] **2.5.6** Botón "Copiar total al portapapeles" → copia valor total formateado.

### 2.6 Sección educativa (informativa)
- [x] **2.6.1** Componente `SeccionEducativa.tsx` con Tabs + FAQ acordeón:
  - "¿Cómo se calcula?" (paso a paso lenguaje llano).
  - "Tabla de recargos 2026" (tabla visual con Badge).
  - "Recargo vs Hora extra" (ejemplo numérico comparativo).
  - "Ley Emiliani: festivos al lunes" (lista completa 2026).
  - "Límites legales horas extra".
  - "Preguntas frecuentes" (6 FAQ con acordeón details/summary).
- [x] **2.6.2** Iconos SVG inline (Icons.tsx con 12 componentes: Sun, Moon, AlertTriangle, Info, XCircle, Copy, Check, ChevronDown, Clock, Plus, Trash, Calendar).

### 2.7 Integración y estado global
- [x] **2.7.1** Hook `useCalculo.ts`: orquesta `motor.calcularTurno()`, maneja loading/error/resultado, expone `calcular()`, `reset()`.
- [x] **2.7.2** Hook `useLocalStorage.ts` genérico para preferencias.
- [x] **2.7.3** `ErrorBoundary.tsx`: componente clase que captura errores, muestra UI amable + botón "Reintentar", log en consola.
- [x] **2.7.4** `analytics.ts`: inicialización `gtag` con Measurement ID desde `import.meta.env.VITE_GA_ID`, helper `trackEvent(nombre, params)`, respeta `doNotTrack` y GPC.
- [x] **2.7.5** `App.tsx` refactorizado: compone Layout → ErrorBoundary → FormularioJornada + FormularioTurno → Resultados + SeccionEducativa + NotaLimitaciones + useTheme toggle.

### 2.8 Accesibilidad y pulido
- [x] **2.8.1** Labels asociados a inputs, `aria-describedby` en salario, `aria-live="polite"` en resultados/errores, `role="alert"` en ErrorBoundary.
- [x] **2.8.2** Contraste AA en ambos temas, focus-visible ring en inputs, skip link, dark mode verificado.
- [x] **2.8.3** Navegación teclado completa (Tab, Enter, Escape) — inputs nativos tabbables, botones accessibles.
- [x] **2.8.4** Formato moneda COP: `Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 })` en TotalPagar.

---

## 3. TESTING — Pruebas automatizadas

### 3.1 Configuración
- [x] **3.1.1** Vitest configurado (`vitest.config.ts`), coverage con `v8`.
- [x] **3.1.2** Scripts `test`, `test:run`, `test:coverage` en `package.json`.

### 3.2 Tests unitarios (lógica pura) — ya listados en 1.7
- [x] **3.2.1** Ejecutar y pasar todos los tests de 1.7.2–1.7.6 (90 tests, 96.79% cobertura).
- [x] **3.2.2** Añadidos tests de regresión para bugs: esHoraNocturna, esFestivoReal, FRANJA_INVALIDA, timezone UTC-5.

### 3.3 Tests de componentes (React Testing Library)
- [x] **3.3.1** `FormularioJornada`: render, validaciones, guardado en localStorage, horario por día dinámico.
- [x] **3.3.2** `FormularioTurno`: validaciones, múltiples franjas, detección cruce medianoche, auxilio transporte.
- [x] **3.3.3** `DesgloseHoras`: render correcto de 24 horas, badges correctos.
- [x] **3.3.4** `ResumenTotales`: agrupación correcta, totales coinciden con motor.
- [x] **3.3.5** `Advertencias`: muestra warnings/errors/info con iconos correctos.
- [x] **3.3.6** `ErrorBoundary`: captura error, muestra UI fallback, botón reintentar funciona.
- [x] **3.3.7** `GA4`: trackEvent llama gtag (mock), respeta doNotTrack.
- [x] **3.3.8** Integración: flujo completo jornada + turno → resultados → coinciden con motor puro.

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

### 3.5 E2E (Playwright)
- [x] **3.5.1** Setup Playwright en `package.json` + `playwright.config.ts`.
- [x] **3.5.2** Test happy path: carga página → llena jornada → llena turno → calcula → verifica total.
- [x] **3.5.3** Test PWA: meta tags, manifest link, theme-color, viewport, title descriptivo.

---

## 4. DESPLIEGUE — Build, PWA, Deploy, Verificación

### 4.1 Build de producción
- [x] **4.1.1** Verificar `npm run build` genera `dist/` sin errores TypeScript ni ESLint. ✅ verificado (build exitoso, JS 60KB gzip, CSS 6KB gzip).
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

## ✅ RESUMEN DE LO REALIZADO

**Fase 1 — LÓGICA (100% completada)**

| Tarea | Archivo | Estado |
|-------|---------|--------|
| 1.1.1 | `constantes.ts` | ✅ Creado — CONSTANTES_2026, RECARGO_PORCENTAJES, LEGAL_LIMITS |
| 1.1.2 | `tipos.ts` | ✅ Creado — TipoHora, interfaces, types (convertido a const+type por compatibilidad TS6) |
| 1.2.1 | `utilidades.ts` | ✅ Creado — 9 funciones puras (redondeo, parsing, validaciones, generación horas) |
| 1.3.1-2 | `festivos.ts` | ✅ Corregido — `'static'` en interface, cache Map, validación Invalid Date + null |
| 1.4.1-3 | `clasificacion.ts` | ✅ Creado — tabla 8 casos, `estaDentroDeJornada` (cruce medianoche), `esDiaLaboralHabitual` |
| 1.5.1 | `motor.ts` | ✅ Creado — orquestador completo con validaciones, cálculo hora a hora, agrupación, advertencias |
| 1.6.1 | `index.ts` | ✅ Creado — barrel export público |
| 1.7.1-6 | Tests unitarios | ✅ 90 tests, 4 archivos, 96.79% cobertura línea |

**Configuración corregida:**
- `tsconfig.app.json`: agregado `"strict": true`
- `index.html`: `lang="en"` → `lang="es-CO"`, título descriptivo
- `package.json`: dependencias verificadas sin conflictos

**Errores de lógica corregidos en tests:**
- `esHoraNocturna`: lógica invertida (usaba `>= 6` en vez de `>= 19 \|\| < 6`)
- `esFestivoReal`: festivos no-dominicales perdían condición si el día estaba en jornada pactada
- Tests usaban `new Date('YYYY-MM-DD')` (UTC) → error por zona horaria UTC-5
- `validarTurno`: faltaba validación para franjas con `inicio === fin`

**Fase 2 — DISEÑO (100% completada)**:
- ✅ 2.1.1 Tailwind v4 setup
- ✅ 2.1.2 Componentes ui/ (Button, Input, Select, Card, Badge, Alert, Tabs, Icons)
- ✅ 2.1.3 barrel index.ts para componentes ui/
- ✅ 2.2.1 Layout.tsx (con skip link + theme toggle + dark: variant)
- ✅ 2.2.2 Tema claro/oscuro (useTheme localStorage + Tailwind dark: variant)
- ✅ 2.2.3 Responsive breakpoints (grid sm:grid-cols-2, sm:p-8, flex-wrap)
- ✅ 2.3.1 FormularioJornada.tsx (validación + localStorage + theme-aware + labels sr-only)
- ✅ 2.4.1 FormularioTurno.tsx (múltiples franjas, validación, cruce medianoche auto-detect, icons, labels)
- ✅ 2.5.1-4,6 Resultados (DesgloseHoras, ResumenTotales, TotalPagar, Advertencias, Copiar — theme-aware)
- ✅ 2.5.5 NotaLimitaciones.tsx (componente separado con Alert info + disclaimer)
- ✅ 2.6.1 Sección educativa (Tabs con: Cómo se calcula, Tabla recargos, Recargo vs Extra, Ley Emiliani, Límites legales, FAQ con acordeón + ChevronDownIcon)
- ✅ 2.6.2 Iconos SVG inline (Icons.tsx con 12 componentes SVG inline)
- ✅ 2.7.1-3 Hooks (useCalculo, useLocalStorage, useTheme) + ErrorBoundary (role="alert")
- ✅ 2.7.4 analytics.ts (gtag + env var + doNotTrack + GPC)
- ✅ 2.7.5 App.tsx refactorizado con SeccionEducativa, NotaLimitaciones, theme toggle, trackEvent
- ✅ 2.8 Accesibilidad (labels, aria, contraste, teclado, COP formateado, prefers-reduced-motion)

**Fase 3 — TESTING (100% completada)**:
- ✅ 3.1 Configuración (Vitest + v8 coverage + scripts + jsdom + @testing-library + Playwright)
- ✅ 3.2 Tests unitarios — 90 tests, 96.79% cobertura línea
- ✅ 3.3 Component tests (React Testing Library) — 47 tests nuevos:
  - ✅ 3.3.1 FormularioJornada (7 tests: render, días, toggle, inputs, update, horas, domingo)
  - ✅ 3.3.2 FormularioTurno (13 tests: render, fecha, franjas, añadir/eliminar, calcular disabled/enabled, cruce medianoche)
  - ✅ 3.3.3 DesgloseHoras (6 tests: null, headers, valores, nocturna/festivo/jornada, badge, múltiples)
  - ✅ 3.3.4 ResumenTotales (4 tests: null, título, badge+valor, horas+recargo)
  - ✅ 3.3.5 Advertencias (3 tests: null, render, múltiples severidades)
  - ✅ 3.3.6 ErrorBoundary (5 tests: children, captura, retry, fallback personalizado, role alert)
  - ✅ 3.3.7 analytics.test.ts (5 tests: doNotTrack, GPC, tracking allowed, trackEvent sin GA, trackEvent con GA)
  - ✅ 3.3.8 Integración (4 tests: ordinario diurno, extra nocturna, horas extra excedidas, auxilio transporte)
- ✅ 3.4 Casos límite checklist (verificados en tests unitarios — cobertura 96.79%)
- ✅ 3.5 E2E Playwright (2 tests: happy path + PWA meta tags — ambos pasando)
  - `e2e/happy-path.spec.ts` — flujo completo UI → calcular → verificar resultados
  - `e2e/pwa.spec.ts` — manifest link, theme-color, viewport meta, title
  - Playwright config con `webServer` auto (npm run dev en port 5173)
  - Scripts: `npm run test:e2e`, `npm run test:e2e:ui`
- ✅ **Total: 12 test files, 137 unit/component + 2 e2e tests, todos pasando**

**Fase 4 — DESPLIEGUE (~10%)**:
- ✅ 4.1.1 Build verificado (JS 60KB gzip, CSS 6KB gzip)
- ✅ theme-color meta tag agregado en index.html
- ✅ manifest link en index.html (href /manifest.json, content pending PWA plugin)
- ⬜ 4.1.2 Preview local (npm run preview)
- ⬜ 4.1.3 Bundle analysis
- ⬜ 4.2 PWA (vite-plugin-pwa + workbox + manifest + icons + offline)
- ⬜ 4.3 Despliegue Vercel/Netlify + env vars + security headers
- ⬜ 4.4 Verificación post-despliegue (Lighthouse ≥90, móvil real)
- ⬜ 4.5 Documentación (README, CHANGELOG v0.1.0, release tag Git)