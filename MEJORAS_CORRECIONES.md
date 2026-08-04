# PLAN DE MEJORAS — web_calculador_pago
## Tareas organizadas por prioridad para ejecución incremental

> **Instrucción para el agente:** Ejecutar UNA tarea a la vez.
> Después de cada tarea: correr `npm run build` + `npm test`.
> Solo avanzar a la siguiente si ambos comandos pasan sin errores.
> Si una tarea falla, reportar el problema antes de continuar.
>
> **Leyenda de checkboxes:**
> - `[ ]` = Pendiente
> - `[x]` = Completada y verificada
> - `[~]` = En progreso
> - `[!]` = Bloqueada / requiere atención

---

## 🔴 BLOQUE 1 — Correcciones críticas de lógica y precisión legal
*Estas tareas afectan la exactitud del cálculo. Máxima prioridad.*

### Progreso del Bloque 1: `[6/6]` tareas completadas

- [x] Tarea 1.1 — Constante de salario mínimo en validación
- [x] Tarea 1.2 — Límite de 31 días en el período
- [x] Tarea 1.3 — Bug de 26 días omitidos en período hasta fin de mes
- [x] Tarea 1.4 — Bug de horas extra incorrectas en bloque vs jornada pactada
- [x] Tarea 1.5 — Caché de festivos persiste entre tests
- [x] Tarea 1.6 — Typing de festivos-colombia

---

### [x] TAREA 1.1 — Constante de salario mínimo en validación
**Archivo:** `src/lib/validaciones/validarInputs.ts` línea ~18
**Problema:** El número `1_000_000` está hardcodeado en vez de usar `CONSTANTES_2026.SALARIO_MINIMO`.
**Riesgo:** Si cambia el salario mínimo en 2027, hay que actualizar dos lugares en vez de uno.

**Qué hacer:**
```typescript
// ANTES (incorrecto):
if (salario < 1_000_000)

// DESPUÉS (correcto):
import { CONSTANTES_2026 } from '../calculos/constantes'
if (salario < CONSTANTES_2026.SALARIO_MINIMO)
```

**Verificación:** `npm run build` + `npm test` — todos los tests pasan.

---

### [x] TAREA 1.2 — Límite de 31 días en el período
**Archivo:** `src/lib/calculos/periodo.ts` línea ~20
**Problema:** El límite de 31 días está hardcodeado arbitrariamente. Algunos meses tienen 28, 29, 30 o 31 días y el límite debería ser al menos 31 o calcularse dinámicamente según el mes real.

**Qué hacer:**
- Cambiar la constante hardcodeada de 31 días por una constante nombrada `LIMITE_DIAS_PERIODO = 31` en `constantes.ts`.
- Actualizar el mensaje de error para que diga exactamente cuántos días permite.
- Verificar que el test de período hasta fin de mes (#2 del informe del agente) pase correctamente.

**Verificación:** `npm run build` + `npm test` — validar específicamente el test `motor.test.ts:346`.

---

### [x] TAREA 1.3 — Bug de 26 días omitidos en período hasta fin de mes
**Archivo:** `src/lib/calculos/periodo.ts` líneas ~150-153
**Problema (BUG#2 del informe):** Cuando el bloque termina el día 10 pero el período llega al 31, los días 11-31 se marcan como omitidos. El acumulador `horasAcumuladasLV` no está contando correctamente qué días pertenecen al bloque activo vs. qué días no tienen bloque asignado.

**Qué hacer:**
1. Leer el test fallido `motor.test.ts:346` para entender exactamente el input que produce el bug.
2. Trazar el flujo en `periodo.ts` para el rango del 1 al 31 con un bloque que termina el 10.
3. Corregir la lógica que cuenta días omitidos: un día sin bloque activo debe marcarse como omitido, pero sin afectar el contador de días que SÍ tienen bloque.
4. Verificar que `diasOmitidos` solo cuenta días dentro del rango del período sin bloque asignado.

**Verificación:** `npm run build` + `npm test` — el test `motor.test.ts:346` debe pasar.

---

### [x] TAREA 1.4 — Bug de horas extra incorrectas en bloque vs jornada pactada
**Archivo:** `src/lib/calculos/motor.ts` líneas ~100-107
**Problema (BUG#1 del informe):** Con jornada pactada 8-17 y bloque 6-14, el motor produce 10 horas extra cuando debería producir 2 (las horas 6-8 que están fuera de la jornada pactada). Las horas 8-14 están dentro de la jornada y son ordinarias.

**Qué hacer:**
1. Leer el test fallido `motor.test.ts:315` para entender el input exacto.
2. Revisar cómo el motor determina si una hora está "dentro o fuera de jornada".
3. La condición `dentroDeJornada` debe comparar la hora individual contra el horario pactado del día, no contra el horario del bloque.
4. Corregir sin afectar los demás casos de prueba existentes.

**Verificación:** `npm run build` + `npm test` — el test `motor.test.ts:315` debe pasar. Todos los demás tests deben seguir pasando.

---

### [x] TAREA 1.5 — Caché de festivos persiste entre tests
**Archivo:** `src/lib/calculos/festivos.ts` línea ~13
**Problema:** `cacheFestivos` es un `Map` global mutable. En el entorno de tests, la caché persiste entre pruebas y puede causar resultados incorrectos si una prueba modifica o consulta festivos de un año y la siguiente asume un estado limpio.

**Qué hacer:**
```typescript
// Opción A — Exponer función de reset solo para tests:
export function _resetCacheFestivos(): void {
  cacheFestivos.clear()
}

// Opción B — Crear un wrapper con tipos que encapsule la caché:
// Crear src/lib/calculos/tipos-festivos.d.ts con la declaración del módulo
```

Usar Opción A para el MVP — más simple y sin cambiar la API pública.
Agregar `_resetCacheFestivos()` en el `beforeEach` de los tests que usen festivos.

**Verificación:** `npm run build` + `npm test` — ningún test debe fallar por estado compartido.

---

### [x] TAREA 1.6 — Typing de festivos-colombia
**Archivo:** `src/lib/calculos/festivos.ts` línea ~4
**Problema:** `@ts-expect-error` suprime errores de TypeScript para la librería sin tipos. Si la API de `festivos-colombia` cambia, el error se silencia y puede romper silenciosamente en runtime.

**Qué hacer:**
Crear archivo `src/lib/calculos/tipos-festivos.d.ts`:
```typescript
declare module 'festivos-colombia' {
  export interface FestivoInfo {
    date: string     // formato "DD/MM/YYYY"
    name: string
    static: boolean
  }

  export function getHolidaysByYear(year: number): FestivoInfo[]

  const fc: {
    getHolidaysByYear: typeof getHolidaysByYear
  }
  export default fc
}
```

Eliminar el `@ts-expect-error` en `festivos.ts` una vez creado el archivo de tipos.

**Verificación:** `npm run build` sin warnings de TypeScript en ese archivo. `npm test` pasa.

---

## 🟡 BLOQUE 2 — Mejoras de arquitectura y mantenibilidad
*Importante para el largo plazo pero no afectan funcionalidad actual.*

### Progreso del Bloque 2: `[0/4]` tareas completadas

- [ ] Tarea 2.1 — Duplicación de warning LIMITE_SEMANAL_NO_VALIDADO
- [ ] Tarea 2.2 — Tests unitarios para validarConfiguracionPeriodo
- [ ] Tarea 2.3 — Notificación de actualización PWA
- [ ] Tarea 2.4 — Extracción de custom hooks desde App.tsx

---

### [ ] TAREA 2.1 — Duplicación de warning LIMITE_SEMANAL_NO_VALIDADO
**Archivos:** `src/lib/calculos/motor.ts` línea ~82 y `src/lib/calculos/periodo.ts` línea ~129
**Problema:** El mismo warning se genera desde dos lugares. Aunque `periodo.ts` lo deduplica con `seenCodes`, el origen correcto es solo `periodo.ts` (que maneja la semana completa).

**Qué hacer:**
1. Eliminar el warning de `motor.ts:82`.
2. Verificar que `periodo.ts:129` sigue generando el warning correctamente.
3. Actualizar los tests que verifican warnings para reflejar el nuevo origen.

**Verificación:** `npm run build` + `npm test` — tests de warnings pasan desde un solo origen.

---

### [ ] TAREA 2.2 — Tests unitarios para validarConfiguracionPeriodo
**Archivo:** Crear `src/lib/calculos/periodo.validacion.test.ts`
**Problema:** `validarConfiguracionPeriodo` no tiene tests unitarios propios — solo se prueba indirectamente a través de `calcularPeriodo`.

**Qué hacer:**
Agregar tests para los casos:
```typescript
describe('validarConfiguracionPeriodo', () => {
  it('rechaza período mayor a 31 días')
  it('rechaza fecha fin anterior a fecha inicio')
  it('rechaza bloques solapados')
  it('rechaza bloque fuera del rango del período')
  it('acepta configuración válida con un bloque')
  it('acepta configuración válida con múltiples bloques')
  it('rechaza salario menor al mínimo')
  it('rechaza período sin bloques')
})
```

**Verificación:** `npm run build` + `npm test` — nuevos tests pasan. Cobertura sube.

---

### [ ] TAREA 2.3 — Notificación de actualización PWA
**Archivo:** `src/main.tsx` o donde esté el registro del service worker
**Problema:** El service worker usa `autoUpdate` pero no hay UI que informe al usuario que hay una nueva versión disponible. El usuario puede estar usando una versión desactualizada sin saberlo.

**Qué hacer:**
Implementar un toast de actualización usando `vite-plugin-pwa`:
```typescript
import { useRegisterSW } from 'virtual:pwa-register/react'

const { needRefresh, updateServiceWorker } = useRegisterSW()

// Mostrar cuando needRefresh[0] === true:
// "Hay una nueva versión disponible. [Actualizar]"
```

El toast debe:
- Aparecer en la parte inferior de la pantalla (no interferir con la barra de navegación móvil)
- Tener un botón "Actualizar ahora" que llame a `updateServiceWorker(true)`
- Poder cerrarse sin actualizar
- Respetar los colores del diseño actual

**Verificación:** `npm run build` + verificar que el manifest PWA sigue siendo válido.

---

### [ ] TAREA 2.4 — Extracción de custom hooks desde App.tsx
**Archivo:** `src/App.tsx` (actualmente ~250 líneas)
**Problema:** `App.tsx` mezcla estado de inputs, lógica de cálculo, animación de navegación, tema y persistencia. Con 17 props en `FormularioTurno` hay prop drilling excesivo.

**Qué hacer — en este orden estricto:**

**Paso 1:** Crear `src/hooks/useNavigation.ts`:
```typescript
// Estado: seccionActiva, seccionAnterior, direccionSlide, animando
// Funciones: cambiarSeccion
```

**Paso 2:** Crear `src/hooks/useJornadaState.ts`:
```typescript
// Estado: salario, auxilio, diasLaborales, horariosPorDia
// Estado: tipoJornada, diaDescanso, minutosDescanso
```

**Paso 3:** Crear `src/hooks/useCalculoState.ts`:
```typescript
// Estado: resultado, error, calculando
// Funciones: calcular, limpiar
```

**Paso 4:** Actualizar `App.tsx` para usar los tres hooks.

**Regla crítica:** Hacer un commit después de cada paso y verificar que `npm test` pasa antes del siguiente paso. Si algo se rompe, revertir ese paso y reportarlo.

**Verificación:** `npm run build` + `npm test` — todos los tests pasan. App.tsx debe tener menos de 100 líneas.

---

## 🔵 BLOQUE 3 — Mejoras de UX y diseño
*Mejoran la experiencia pero no afectan la lógica de cálculo.*

### Progreso del Bloque 3: `[0/4]` tareas completadas

- [ ] Tarea 3.1 — Accesibilidad en DesgloseHoras
- [ ] Tarea 3.2 — Indicador visual de días activos en header de bloque
- [ ] Tarea 3.3 — Desglose expandible en ResultadoPeriodo
- [ ] Tarea 3.4 — Mensaje del tipo de jornada más claro

---

### [ ] TAREA 3.1 — Accesibilidad en DesgloseHoras
**Archivo:** `src/components/Calculadora/DesgloseHoras.tsx`
**Problema:** Se usan emojis (🌙, 🔴, ✔) como indicadores visuales sin alternativa para lectores de pantalla.

**Qué hacer:**
```tsx
// ANTES:
<span>🌙</span>

// DESPUÉS:
<span aria-hidden="true">🌙</span>
<span className="sr-only">Nocturno</span>
```

O reemplazar por badges de texto con `role="img"` y `aria-label`:
```tsx
<span
  role="img"
  aria-label="Hora nocturna"
  className="badge-nocturno"
>
  Noc.
</span>
```

**Verificación:** `npm run build` + `npm test` — sin regresiones visuales.

---

### [ ] TAREA 3.2 — Indicador visual de días activos en header de bloque
**Archivo:** `src/components/Calculadora/FormularioPeriodo.tsx`
**Problema:** El usuario no puede ver qué días están activos en un bloque sin expandirlo o revisar los checkboxes.

**Qué hacer:**
Agregar en el header de cada bloque (colapsado o expandido) un indicador compacto:
```tsx
<span className="text-xs text-emerald-400">
  {diasActivosDelBloque.join('-')}
  {/* Ejemplo: "Lun-Vie" o "Lun, Mié, Vie" */}
</span>
```

**Verificación:** `npm run build` + `npm test` — sin regresiones.

---

### [ ] TAREA 3.3 — Desglose expandible en ResultadoPeriodo
**Archivo:** `src/components/Calculadora/ResultadoPeriodo.tsx`
**Problema:** El resumen de 4 tarjetas (ordinarias, extra, nocturnas, dominicales) no muestra el valor en COP por cada categoría — solo las horas.

**Qué hacer:**
Agregar debajo de cada tarjeta (o en un acordeón expandible) el valor en COP correspondiente:
```
Ordinarias     30h    → $250.157
Extra          6h     → $62.539
Nocturnas      0h     → $0
Dominicales    8h     → $120.074
```

**Verificación:** `npm run build` + `npm test` — los valores mostrados coinciden con los del motor de cálculo.

---

### [ ] TAREA 3.4 — Mensaje del tipo de jornada más claro
**Archivo:** `src/components/Calculadora/FormularioJornada.tsx` (línea ~96-100)
**Problema:** El mensaje `(domingo incluido en jornada → sin recargo dominical)` es confuso con el nuevo tipo rotativo implementado.

**Qué hacer:**
Actualizar el mensaje según el tipo de jornada activo. Esto requiere pasar la info de `tipoJornada` y `diaDescanso` al componente `FormularioJornada` desde `App.tsx` (que ya los tiene como estado).

**Verificación:** `npm run build` + `npm test` — sin regresiones.

---

## 🟢 BLOQUE 4 — Optimización de rendimiento
*Solo aplicar cuando los bloques anteriores estén completos.*

### Progreso del Bloque 4: `[0/2]` tareas completadas

- [ ] Tarea 4.1 — Optimizar cálculo de período por tipo de día
- [ ] Tarea 4.2 — Actualizar vitest a happy-dom

---

### [ ] TAREA 4.1 — Optimizar cálculo de período por tipo de día
**Archivo:** `src/lib/calculos/periodo.ts`
**Problema:** Para 31 días con 8h cada uno = 248 llamadas a `calcularTurno`. Si el horario es el mismo para todos los lunes, se puede calcular una vez y multiplicar.

**Qué hacer:**
```typescript
// En vez de iterar día por día siempre:
// 1. Agrupar días por "tipo" (mismo día de semana + mismo horario + mismo contexto festivo)
// 2. Calcular una vez por tipo
// 3. Multiplicar por la cantidad de días de ese tipo en el período

// EXCEPCIÓN: los festivos siempre se calculan individualmente
// ya que son únicos por fecha (nombre del festivo, etc.)
```

**Condición para aplicar:** Solo si los tests de rendimiento muestran que el cálculo tarda más de 100ms para un período de 31 días.

**Verificación:** `npm run build` + `npm test` — resultados idénticos a los actuales. Tiempo de cálculo reducido.

---

### [ ] TAREA 4.2 — Actualizar vitest a happy-dom
**Archivo:** `vitest.config.ts`
**Problema:** Los tests de componentes usan jsdom que es lento en Windows (~500ms por test de componente).

**Qué hacer:**
```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    environment: 'happy-dom', // más rápido que jsdom
    // resto de config sin cambios
  }
})
```

Instalar: `npm install -D happy-dom`

**Condición para aplicar:** Verificar primero que todos los tests pasan con happy-dom. Algunos tests con APIs del DOM muy específicas pueden comportarse diferente.

**Verificación:** `npm run build` + `npm test` — todos los tests pasan. Tiempo total de test suite reducido.

---

## Resumen de ejecución recomendada

```
SEMANA 1 — Bloque 1 (crítico):
  [x] Tarea 1.1 → commit
  [x] Tarea 1.2 → commit
  [x] Tarea 1.3 → commit  (bug más complejo, puede tomar más tiempo)
  [x] Tarea 1.4 → commit  (bug más complejo, puede tomar más tiempo)
  [x] Tarea 1.5 → commit
  [x] Tarea 1.6 → commit

SEMANA 2 — Bloque 2 (arquitectura):
  [ ] Tarea 2.1 → commit
  [ ] Tarea 2.2 → commit
  [ ] Tarea 2.3 → commit
  [ ] Tarea 2.4 → commit  (la más larga — múltiples pasos con commits intermedios)

SEMANA 3 — Bloque 3 (UX):
  [ ] Tarea 3.1 → commit
  [ ] Tarea 3.2 → commit
  [ ] Tarea 3.3 → commit
  [ ] Tarea 3.4 → commit

CUANDO EL RESTO ESTÉ COMPLETO — Bloque 4 (optimización):
  [ ] Tarea 4.1 → commit (solo si hay problema de rendimiento real)
  [ ] Tarea 4.2 → commit (solo si los tests con happy-dom son compatibles)
```

---

## Tablero de progreso general

| Bloque | Progreso | Estado |
|--------|----------|--------|
| 🔴 Bloque 1 — Crítico | `6/6` | **Completado** |
| 🟡 Bloque 2 — Arquitectura | `0/4` | Pendiente |
| 🔵 Bloque 3 — UX/Diseño | `0/4` | Pendiente |
| 🟢 Bloque 4 — Optimización | `0/2` | Pendiente |
| **TOTAL** | **`6/16`** | **En progreso** |

---

## Puntos del informe original que NO se incluyen aquí y por qué

| # | Razón de exclusión |
|---|---|
| #10 Responsive SVG | Ya implementado con `hidden md:block` — verificar en producción antes de reabrir |
| #11 NavBar botones pequeños | Prioridad baja — diseño actual es funcional |
| #14 Unificar tipos | Refactor de bajo impacto — dejar para cuando se estabilice la arquitectura |
| #19 Analytics | Ya implementado con `VITE_GA_ID` y GA4 según el README |
| #22 Tailwind @apply | Preferencia de estilo — no afecta funcionalidad ni rendimiento |
| #23 useCallback | Micro-optimización — solo si el profiler muestra problema real |
| #24 Tests lentos | Incluido en Tarea 4.2 con condición de verificación previa |
