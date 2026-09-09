# correcciones_caja_negra.md
## Registro de correcciones derivadas de pruebas de caja negra
### Proyecto: web_calculador_pago

> **Instrucción para el agente:**
> Este archivo se actualiza cada vez que se encuentran fallas en las pruebas
> de caja negra. Cada sección tiene un PROMPT específico para ti.
> Ejecuta UNA corrección a la vez. Después de cada una: `npm run build` + `npm test`.
> Solo avanza si ambos comandos pasan sin errores nuevos.

---

## RONDA 1 — Pruebas Nivel 1 y Nivel 2 (Agosto 2026)

---

## CORRECCIÓN CB-01 — Jornada pactada pasa a ser solo informativa

### Problema detectado
**Caso 2.1 falló:** Turno nocturno dentro de jornada muestra $116.736
en vez de $23.348. El motor aplica factor ×1.75 (hora extra nocturna)
en vez de ×0.35 (recargo nocturno dentro de jornada).

**Causa raíz:** El motor usa la jornada pactada para clasificar si una
hora es "dentro de jornada" (recargo) o "fuera de jornada" (extra).
Cuando la jornada pactada y el turno son nocturnos, el motor falla al
comparar horarios que cruzan medianoche.

**Decisión de diseño tomada:**
La jornada pactada se convierte en un campo **solo informativo** — el motor
ya no la usa para clasificar horas. La nueva regla de clasificación es:

```
Primeras 42h acumuladas en la semana → ordinarias o con recargo
  (nocturno 35% si están en franja 7pm-6am)
  (dominical 90% si es día de descanso obligatorio o festivo)

A partir de la hora 43 semanal → hora extra
  (extra diurna 25% si están en franja 6am-7pm)
  (extra nocturna 75% si están en franja 7pm-6am)
  (extra diurna dominical 115% = 25%+90%)
  (extra nocturna dominical 165% = 75%+90%)
```

### Lo que debes cambiar

**En el motor de cálculo (`src/lib/calculos/motor.ts`):**

Eliminar toda lógica que compare la hora del turno contra
`jornadaPactada.horaInicio` / `jornadaPactada.horaFin` para determinar
si una hora es "dentro" o "fuera" de jornada.

Reemplazar por la lógica de acumulador semanal:

```typescript
/**
 * NUEVA LÓGICA DE CLASIFICACIÓN (sin jornada pactada)
 *
 * Una hora es "ordinaria con posible recargo" si el acumulado semanal
 * aún no supera 42h. Es "hora extra" cuando supera las 42h semanales.
 *
 * Los recargos nocturno y dominical/festivo aplican independientemente
 * de si la hora es ordinaria o extra — se suman según corresponda.
 */
function clasificarHora(
  hora: number,          // 0-23
  fecha: Date,
  horasAcumuladasSemana: number,
  diaDescanso: number,
  tipoJornada: 'estandar' | 'rotativo'
): TipoHora {

  const JORNADA_MAX = 42
  const esNocturna = hora >= 19 || hora < 6
  const esDominicalFestivo =
    esDiaConRecargoDominical(fecha, diaDescanso, tipoJornada) ||
    esFestivo(fecha)

  const esExtra = horasAcumuladasSemana >= JORNADA_MAX

  if (!esExtra) {
    // Dentro de las 42h semanales — hora ordinaria con posibles recargos
    if (esDominicalFestivo && esNocturna)  return 'ORDINARIA_NOCTURNA_DOMINICAL'  // 35% + 90%
    if (esDominicalFestivo)               return 'ORDINARIA_DOMINICAL'             // 90%
    if (esNocturna)                       return 'ORDINARIA_NOCTURNA'              // 35%
    return 'ORDINARIA'                                                              // 0%
  } else {
    // Superó las 42h — hora extra con posibles recargos adicionales
    if (esDominicalFestivo && esNocturna)  return 'EXTRA_NOCTURNA_DOMINICAL'       // 75% + 90%
    if (esDominicalFestivo)               return 'EXTRA_DIURNA_DOMINICAL'          // 25% + 90%
    if (esNocturna)                       return 'EXTRA_NOCTURNA'                  // 75%
    return 'EXTRA_DIURNA'                                                           // 25%
  }
}
```

**En la UI (`src/components/FormularioJornada.tsx` o equivalente):**

1. Mantener visible el selector de días laborales y horarios de la jornada.
2. Agregar un badge o texto claramente visible que diga:

```tsx
<div className="flex items-start gap-2 mt-2 p-3 rounded-lg
                bg-blue-950/30 border border-blue-800/40">
  <span className="text-blue-400 text-lg leading-none mt-0.5">ℹ️</span>
  <p className="text-xs text-blue-300 leading-relaxed">
    <strong>Solo informativo.</strong> Esta sección te ayuda a visualizar
    tu jornada habitual, pero no afecta el cálculo. El motor determina
    horas extra según las 42 horas semanales acumuladas (Art. 161 CST).
  </p>
</div>
```

3. Los campos de jornada pactada quedan visibles pero con opacidad reducida
   para indicar que son referenciales:
   - Agregar `opacity-70` al contenedor de días y horarios de jornada
   - Mantener interactividad para que el usuario pueda llenarlos si quiere

**En el modo Período (`src/lib/calculos/periodo.ts`):**
El bloque ya no necesita comparar contra jornada pactada para clasificar
horas — solo necesita el acumulador semanal que ya existe.
Verificar que el acumulador se reinicia cada lunes (ya implementado).

### Verificación

Con la corrección aplicada, el Caso 2.1 debe dar:
```
Turno 10pm-6am (8h) un lunes, acumulado semanal = 0h
→ 8h dentro de las 42h semanales
→ todas nocturnas (10pm-6am en franja nocturna)
→ tipo: ORDINARIA_NOCTURNA → recargo 35%
→ 8h × $8.338,60 × 0.35 = $23.348 ✅
```

Y el Caso 2.2 debe seguir dando:
```
Turno 2pm-10pm (8h), acumulado semanal = 0h
→ 5h diurnas (2pm-7pm): ORDINARIA → $0 recargo
→ 3h nocturnas (7pm-10pm): ORDINARIA_NOCTURNA → 35%
→ 3h × $8.338,60 × 0.35 = $8.755 ✅
```

Ejecutar: `npm run build` + `npm test`
Todos los tests existentes deben pasar. Si algún test falla porque
verificaba el comportamiento antiguo de jornada pactada, actualizar
ese test para reflejar la nueva lógica.

---

## CORRECCIÓN CB-02 — Auxilio de transporte separado del cálculo de recargos

### Problema detectado
**Caso 1.3 observación:** El auxilio de transporte se suma al total de
recargos, distorsionando el valor real de las horas extra calculadas.
El usuario quiere ver los recargos por separado del auxilio.

### Lo que debes cambiar

**En el resultado del turno y período:**

Separar visualmente el resultado en dos bloques:

```
BLOQUE 1 — Recargos y horas extra (el cálculo principal):
  ┌─────────────────────────────────────────┐
  │ Total recargos y horas extra            │
  │ $62.540                                 │
  │                                         │
  │ Ordinarias: 2h    Nocturnas: 0h         │
  │ Extra:      6h    Dominicales: 0h       │
  └─────────────────────────────────────────┘

BLOQUE 2 — Referencia adicional (solo si auxilio > 0):
  ┌─────────────────────────────────────────┐
  │ 📋 Referencia de pago completo          │
  │ Recargos calculados:   $62.540          │
  │ Auxilio de transporte: $200.000         │
  │ ─────────────────────────────────────── │
  │ Total referencial:     $262.540         │
  │                                         │
  │ ⚠️ El auxilio no hace parte del cálculo │
  │ de recargos — se muestra como referencia│
  └─────────────────────────────────────────┘
```

**En el motor de cálculo:**
El campo `auxilioTransporte` NO debe entrar en ninguna fórmula de
cálculo de recargos. Solo debe aparecer en la visualización del resultado
como dato adicional cuando su valor es mayor a 0.

**En el tipo de resultado:**
```typescript
interface ResultadoCalculo {
  // Cálculo principal — sin auxilio
  totalRecargos: number
  horasOrdinarias: number
  horasExtra: number
  horasNocturnas: number
  horasDominicalesFestivas: number

  // Referencia separada
  auxilioTransporte: number        // solo para mostrar
  totalReferencial: number         // totalRecargos + auxilioTransporte
}
```

### Verificación
Caso 1.3 con esta corrección:
```
Recargos: $0
Bloque 1 muestra: $0 (correcto — no hay extras ni recargos)
Bloque 2 muestra: Auxilio: $200.000 / Total referencial: $200.000
```

Ejecutar: `npm run build` + `npm test`

---

## CORRECCIÓN CB-03 — Animación de carga y confirmación visual al calcular

### Problema detectado
**Caso 1.2 observación:** Cuando el resultado es $0, el usuario no sabe
si la calculadora procesó el turno nuevo o si sigue mostrando el resultado
anterior. No hay feedback visual del proceso de cálculo.

### Lo que debes cambiar

Agregar un estado de "calculando" de 500ms antes de mostrar el resultado:

```typescript
const [calculando, setCalculando] = useState(false)
const [resultadoMostrado, setResultadoMostrado] = useState(false)

const handleCalcular = async () => {
  setCalculando(true)
  setResultadoMostrado(false)

  // Simular procesamiento mínimo para dar feedback visual
  await new Promise(resolve => setTimeout(resolve, 500))

  const resultado = calcularTurno(/* params */)

  setCalculando(false)
  setResultadoMostrado(true)
  setResultado(resultado)
}
```

**UI durante el cálculo (500ms):**
```tsx
{calculando && (
  <div className="flex items-center justify-center gap-3 py-8">
    {/* Spinner animado */}
    <div className="w-6 h-6 border-2 border-emerald-400 border-t-transparent
                    rounded-full animate-spin" />
    <span className="text-emerald-400 text-sm font-medium">
      Calculando tu turno...
    </span>
  </div>
)}
```

**UI al mostrar resultado (aparece con fade):**
```tsx
{resultadoMostrado && !calculando && (
  <div className="animate-[fadeIn_0.3s_ease_both]">
    {/* Chip de confirmación que desaparece en 2 segundos */}
    <ConfirmacionCalculo />
    {/* Resultado normal */}
    <ResultadoTurno resultado={resultado} />
  </div>
)}
```

**Componente ConfirmacionCalculo:**
```tsx
function ConfirmacionCalculo() {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 2000)
    return () => clearTimeout(timer)
  }, [])

  if (!visible) return null

  return (
    <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-lg
                    bg-emerald-950/50 border border-emerald-700/50
                    animate-[fadeIn_0.2s_ease_both]">
      <span className="text-emerald-400">✓</span>
      <span className="text-xs text-emerald-300">Turno calculado correctamente</span>
    </div>
  )
}
```

Aplicar el mismo patrón en el botón "Calcular período" del modo Período.

### Verificación
1. Calcular un turno que da $0
2. Cambiar algún parámetro y calcular de nuevo
3. Verificar que aparece el spinner 500ms y luego el chip verde de confirmación
4. Verificar que el chip desaparece a los 2 segundos

Ejecutar: `npm run build` + `npm test`

---

## CORRECCIÓN CB-04 — Soporte de 1 o 2 días de descanso en turno rotativo

### Problema detectado
**Observación adicional:** Los turnos rotativos pueden tener 1 o 2 días
de descanso por semana. Actualmente solo se soporta 1 día de descanso.

### Lo que debes cambiar

**En el modelo de datos:**
```typescript
interface ConfiguracionJornada {
  tipoJornada: 'estandar' | 'rotativo'
  // Cambia de un solo día a un array de 1 o 2 días
  diasDescanso: number[]   // [0] = solo domingo, [2,5] = martes y viernes
                            // Mínimo 1, máximo 2 elementos
                            // Valores: 0=dom, 1=lun, 2=mar, 3=mié, 4=jue, 5=vie, 6=sáb
}
```

**En la UI del selector de turno rotativo:**

```tsx
{tipoJornada === 'rotativo' && (
  <div className="flex flex-col gap-2 mt-2">
    <label className="text-xs text-slate-400">
      ¿Cuántos días de descanso tienes por semana?
    </label>

    {/* Selector de cantidad */}
    <div className="flex gap-2">
      <button
        onClick={() => setCantidadDescansos(1)}
        className={`flex-1 py-2 rounded-lg text-sm border transition-all ${
          cantidadDescansos === 1
            ? 'bg-[#1e3a5f] border-[#2a4a6f] text-emerald-400'
            : 'bg-[#111827] border-[#1e3a5f] text-slate-400'
        }`}
      >
        1 día de descanso
      </button>
      <button
        onClick={() => setCantidadDescansos(2)}
        className={`flex-1 py-2 rounded-lg text-sm border transition-all ${
          cantidadDescansos === 2
            ? 'bg-[#1e3a5f] border-[#2a4a6f] text-emerald-400'
            : 'bg-[#111827] border-[#1e3a5f] text-slate-400'
        }`}
      >
        2 días de descanso
      </button>
    </div>

    {/* Selector del primer día de descanso */}
    <div className="flex flex-col gap-1">
      <label className="text-xs text-slate-400">
        {cantidadDescansos === 1
          ? '¿Cuál es tu día de descanso?'
          : 'Primer día de descanso:'}
      </label>
      <select
        value={diasDescanso[0]}
        onChange={(e) => setDiasDescanso([Number(e.target.value),
                          diasDescanso[1] ?? -1])}
        className="bg-[#111827] border border-[#1e3a5f] rounded-md
                   px-3 py-2 text-sm text-slate-200 w-full"
      >
        <option value={0}>Domingo</option>
        <option value={1}>Lunes</option>
        <option value={2}>Martes</option>
        <option value={3}>Miércoles</option>
        <option value={4}>Jueves</option>
        <option value={5}>Viernes</option>
        <option value={6}>Sábado</option>
      </select>
    </div>

    {/* Selector del segundo día — solo si cantidadDescansos === 2 */}
    {cantidadDescansos === 2 && (
      <div className="flex flex-col gap-1">
        <label className="text-xs text-slate-400">
          Segundo día de descanso:
        </label>
        <select
          value={diasDescanso[1] ?? ''}
          onChange={(e) => setDiasDescanso([diasDescanso[0],
                            Number(e.target.value)])}
          className="bg-[#111827] border border-[#1e3a5f] rounded-md
                     px-3 py-2 text-sm text-slate-200 w-full"
        >
          {/* Excluir el primer día ya seleccionado */}
          {[0,1,2,3,4,5,6]
            .filter(d => d !== diasDescanso[0])
            .map(d => (
              <option key={d} value={d}>
                {['Domingo','Lunes','Martes','Miércoles',
                  'Jueves','Viernes','Sábado'][d]}
              </option>
            ))
          }
        </select>
        <p className="text-xs text-slate-500">
          Ambos días generarán recargo del 90% si se trabajan — Art. 179 CST
        </p>
      </div>
    )}
  </div>
)}
```

**Validación:**
- Los dos días de descanso no pueden ser iguales (mostrar error si lo son)
- El segundo día no puede ser igual al primero (el select ya lo filtra)

**En el motor de cálculo:**
Actualizar `esDiaConRecargoDominical` para recibir el array:

```typescript
function esDiaConRecargoDominical(
  fecha: Date,
  diasDescanso: number[],   // ahora es array
  tipoJornada: 'estandar' | 'rotativo'
): boolean {
  const diaSemana = fecha.getDay()

  if (tipoJornada === 'estandar') {
    return diaSemana === 0  // siempre domingo
  }

  // Rotativo: cualquiera de los días de descanso pactados
  return diasDescanso.includes(diaSemana)
}
```

Actualizar todas las llamadas a esta función para pasar el array
en vez del valor individual.

### Verificación

**Con 1 día de descanso (martes):**
- Martes trabajado → recargo 90% ✅
- Domingo trabajado → sin recargo (día hábil) ✅

**Con 2 días de descanso (martes y viernes):**
- Martes trabajado → recargo 90% ✅
- Viernes trabajado → recargo 90% ✅
- Domingo trabajado → sin recargo (día hábil) ✅
- Lunes trabajado → sin recargo (día hábil) ✅

Ejecutar: `npm run build` + `npm test`

---

## CORRECCIÓN CB-05 — Aclarar el conteo de horas en la jornada pactada (informativa)

### Problema detectado
**Observación adicional:** Al ingresar jornada 8am-5pm L-V, la app
muestra "45h/semana" cuando debería mostrar 40h (descontando 1h
de almuerzo si se configura) o 45h brutas con una nota aclaratoria.

### Lo que debes cambiar

El indicador de "Horas/semana" en la sección de jornada pactada debe
mostrar dos valores si hay descanso configurado:

```tsx
{/* Antes: */}
<p>Horas/semana: <strong>45h</strong></p>

{/* Después: */}
<p className="text-xs text-slate-400">
  Horas brutas/semana: <strong className="text-slate-200">45h</strong>
  {minutosDescanso > 0 && (
    <>
      {' · '}
      Horas efectivas: <strong className="text-emerald-400">
        {horasEfectivasSemana}h
      </strong>
      {' '}
      <span className="text-slate-500">
        (descontando {minutosDescanso}min/día de descanso)
      </span>
    </>
  )}
</p>
```

Donde `horasEfectivasSemana` se calcula:
```typescript
const minutosEfectivosPorDia = horasBrutasPorDia * 60 - minutosDescanso
const horasEfectivasPorDia = minutosEfectivosPorDia / 60
const horasEfectivasSemana = horasEfectivasPorDia * diasLaborales.length
```

Agregar también una nota debajo del indicador recordando que es informativo:
```tsx
<p className="text-xs text-slate-600 italic mt-1">
  ℹ️ Este dato es orientativo — no afecta el cálculo de recargos
</p>
```

### Verificación
Con jornada 8am-5pm L-V y descanso 60 min:
```
Horas brutas/semana: 45h · Horas efectivas: 40h (descontando 60min/día)
```

Con jornada 8am-4pm L-V sin descanso:
```
Horas brutas/semana: 40h
```

Ejecutar: `npm run build` + `npm test`

---

## Orden de ejecución obligatorio para esta ronda

```
CB-01 → CB-02 → CB-03 → CB-04 → CB-05

Después de CB-01: volver a probar Caso 2.1 y 2.2 manualmente
Después de CB-02: volver a probar Caso 1.3 manualmente
Después de CB-03: volver a probar Casos 1.1 y 1.2 manualmente
Después de CB-04: probar turno rotativo con 2 días de descanso
Después de CB-05: verificar el indicador de horas con jornada 8am-5pm
```

---

## Estado de esta ronda

| Corrección | Estado | Verificado |
|---|---|---|
| CB-01 Jornada informativa + fix nocturno | ⏳ Pendiente | ☐ |
| CB-02 Auxilio separado del cálculo | ⏳ Pendiente | ☐ |
| CB-03 Animación de carga | ⏳ Pendiente | ☐ |
| CB-04 Dos días de descanso rotativo | ⏳ Pendiente | ☐ |
| CB-05 Indicador horas jornada informativa | ⏳ Pendiente | ☐ |

---

## RONDA 3 — Pruebas de caja negra v3 (CB-08)

---

## CORRECCIÓN CB-08 — Corrección de 5 bugs de precisión y validación

### BUG #1 — Minutos parciales producen valor exactamente a la mitad del esperado

- **Caso fallido:** Caso 3.5 (turno 07:45 → 17:15, almuerzo 60 min)
- **Resultado obtenido:** $2.606 (0.25h extra en vez de 0.5h)
- **Resultado esperado:** $5.212 (±$2)
- **Causa raíz:** El motor clasificaba cada intervalo usando el "punto medio" del
  intervalo contra el límite, perdiendo los minutos que cruzan la frontera del límite.
- **Fix aplicado (`motor.ts`):** Se reescribió el loop de cálculo para dividir cada
  intervalo con precisión de minutos en la frontera del límite (diario o semanal),
  calculando `minutosOrd` y `minutosExtra` por separado en vez de clasificar por punto medio.
- **Verificación:** ✅ $5.212

### BUG #2 — Período con minutos parciales no detecta horas extra semanales

- **Caso fallido:** Caso 6.2 (L-V, 07:45→17:15, almuerzo 60 min/día)
- **Resultado obtenido:** ~48h ordinarias, $65.144, sin detectar extras
- **Resultado esperado:** 42h ordinarias + 0.5h extra = $5.212
- **Causa raíz:** El acumulador semanal en `periodo.ts` sumaba la **cantidad de
  intervalos** (`desgloseHoras.length`) en vez de las **horas efectivas** (decimal).
- **Fix aplicado (`periodo.ts`):** Se cambió la acumulación a
  `calcularDuracionEnMinutos(horario.inicio, horario.fin, 0) / 60`, sumando horas
  efectivas decimales.
- **Verificación:** ✅ acumulador correcto

### BUG #3 — Turno rotativo en período: el domingo no suma al acumulador semanal

- **Caso fallido:** Caso 6.5 (Dom-Sáb, rotativo descanso martes)
- **Causa raíz:** El reset del acumulador semanal estaba hardcodeado a `diaISO === 1`
  (lunes), lo que borraba el domingo del acumulador en períodos que empiezan en domingo.
- **Fix aplicado (`periodo.ts`):** El reset del acumulador ahora solo aplica para
  jornada estándar (`bloque.tipoJornada === 'estandar'`). En turno rotativo el acumulador
  no se reinicia en lunes, permitiendo que el domingo (día hábil) se sume correctamente.
- **Verificación:** ✅ acumulado llega a 40h antes del sábado

### BUG #4 — Validación de descanso >= duración del turno no funciona

- **Caso fallido:** Caso 7.4 (turno 08:00→09:00, descanso 60 min)
- **Resultado obtenido:** cálculo normal sin error
- **Resultado esperado:** mensaje de error visible sin cálculo
- **Causa raíz:** No existía validación que comparara `minutosDescanso` contra la
  duración bruta del turno.
- **Fix aplicado (`motor.ts` + `tipos.ts`):** Se agregó la validación en `calcularTurno`
  usando `calcularDuracionEnMinutos`, y el código de advertencia `DESCANSO_EXCEDE_TURNO`.
- **Verificación:** ✅ error visible con 08:00→09:00 y 60 min de descanso

### BUG #5 — Calculadora básica: separador decimal aparece en posición incorrecta

- **Caso fallido:** Caso 7.6 (presionar `,` después de `12`)
- **Resultado obtenido:** `,12`
- **Resultado esperado:** `12,`
- **Causa raíz:** El atributo `dir="rtl"` en el display invertía el orden visual de los
  caracteres, colocando la coma al inicio.
- **Fix aplicado (`CalculadoraBasica.tsx`):** Se reemplazó `dir="rtl"` por
  `text-right` para alinear a la derecha sin invertir el orden de los caracteres.
- **Verificación:** ✅ `12,` visible al presionar `,` después de `12`

---

### Actualización del estado en este archivo

| Corrección | Estado | Verificado |
|---|---|---|
| CB-01 Jornada informativa + fix nocturno | ✅ Aplicada | ✅ |
| CB-02 Auxilio separado del cálculo | ✅ Aplicada | ✅ |
| CB-03 Animación de carga | ✅ Aplicada | ✅ |
| CB-04 Dos días de descanso rotativo | ✅ Aplicada | ✅ |
| CB-05 Indicador horas jornada informativa | ✅ Aplicada | ✅ |
| CB-06 Límite diario turno individual | ✅ Aplicada | ✅ |
| CB-07 Mejora en el Motor del calculo | ✅ Aplicada | ✅ |
| **CB-08 Bugs de precisión y validación** | ✅ Aplicada | ✅ |

---

## Instrucción para próximas rondas

Cuando encuentres nuevas fallas en pruebas de caja negra, agrega una
nueva sección al final de este archivo con el formato:
 
```markdown
## RONDA N — Pruebas Nivel X (Fecha)
 
### CORRECCIÓN CB-NN — [Nombre del problema]
**Caso fallido:** CASO X.X
**Resultado obtenido:** [lo que mostró la calculadora]
**Resultado esperado:** [lo que debería mostrar]
**Observación del usuario:** [comentario textual de la prueba]
 
[Especificación técnica de la corrección]
```
 
---
 
## RONDA 2 — Análisis legal post-pruebas Nivel 3 (Agosto 2026)
 
---
 
## CORRECCIÓN CB-06 — Límite diario de horas en Turno Individual
 
### Ronda 2 — Derivada del análisis legal post-pruebas Nivel 3
 
---
 
### Contexto legal
 
El Art. 161 del CST establece DOS límites independientes para horas extra:
- **Diario:** máximo 8 horas ordinarias por día (o las pactadas si son menos)
- **Semanal:** máximo 42 horas ordinarias por semana
Cualquiera de los dos que se supere genera horas extra. Son independientes.
 
Con la corrección CB-01 (jornada informativa), el motor perdió la referencia
diaria y solo detecta extras semanales. Esto es correcto para el **modo Período**
(donde se acumula la semana completa), pero incorrecto para el **modo Turno
Individual** (donde se calcula un solo día y no hay contexto semanal).
 
### Decisión de diseño confirmada
 
```
MODO TURNO INDIVIDUAL:
  Límite ordinario diario = jornada pactada por el usuario
  Si el usuario NO llenó la jornada pactada = 8h por defecto (máximo legal)
  Lo que exceda ese límite = hora extra
 
MODO PERÍODO:
  Sin cambios — sigue usando acumulador semanal de 42h
  El límite diario en período se valida solo como ADVERTENCIA (ya implementado)
  pero no corta el cálculo
```
 
---
 
### Lo que debes cambiar
 
#### En el motor de cálculo del turno individual (`src/lib/calculos/motor.ts`)
 
Agregar la lógica de límite diario para clasificar horas extra:
 
```typescript
/**
 * Calcula el límite ordinario diario del trabajador.
 * Si tiene jornada pactada definida, usa esa.
 * Si no, usa 8h (máximo legal Art. 161 CST).
 *
 * @param jornadaPactadaHoras - horas diarias pactadas, null si no se definió
 */
function getLimiteDiario(jornadaPactadaHoras: number | null): number {
  const LIMITE_LEGAL_DIARIO = 8
  if (jornadaPactadaHoras === null || jornadaPactadaHoras <= 0) {
    return LIMITE_LEGAL_DIARIO
  }
  // No permitir jornada pactada mayor al límite legal
  return Math.min(jornadaPactadaHoras, LIMITE_LEGAL_DIARIO)
}
 
/**
 * Clasifica cada hora del turno individual.
 * Usa el límite diario (pactado o legal) para determinar si es extra.
 *
 * Regla:
 *   Horas 1 hasta limiteDiario → ordinarias (con posible recargo nocturno/dominical)
 *   Horas limiteDiario+1 en adelante → extra (diurna, nocturna, dominical según franja)
 */
function clasificarHoraTurnoIndividual(
  horaDelDia: number,           // 0-23, la hora calendar en que ocurre
  fecha: Date,
  numeroDeHoraEnElTurno: number, // 1, 2, 3... (posición en el turno, post-descanso)
  limiteDiario: number,          // resultado de getLimiteDiario()
  diasDescanso: number[],
  tipoJornada: 'estandar' | 'rotativo'
): TipoHora {
 
  const esNocturna = horaDelDia >= 19 || horaDelDia < 6
  const esDominicalFestivo =
    esDiaConRecargoDominical(fecha, diasDescanso, tipoJornada) ||
    esFestivo(fecha)
 
  // ¿Esta hora supera el límite diario?
  const esExtra = numeroDeHoraEnElTurno > limiteDiario
 
  if (!esExtra) {
    // Dentro del límite diario → ordinaria con posibles recargos
    if (esDominicalFestivo && esNocturna)  return 'ORDINARIA_NOCTURNA_DOMINICAL'  // 35% + 90%
    if (esDominicalFestivo)               return 'ORDINARIA_DOMINICAL'             // 90%
    if (esNocturna)                       return 'ORDINARIA_NOCTURNA'              // 35%
    return 'ORDINARIA'                                                              // 0%
  } else {
    // Superó el límite diario → hora extra
    if (esDominicalFestivo && esNocturna)  return 'EXTRA_NOCTURNA_DOMINICAL'       // 75% + 90%
    if (esDominicalFestivo)               return 'EXTRA_DIURNA_DOMINICAL'          // 25% + 90%
    if (esNocturna)                       return 'EXTRA_NOCTURNA'                  // 75%
    return 'EXTRA_DIURNA'                                                           // 25%
  }
}
```
 
**Cómo calcular `numeroDeHoraEnElTurno`:**
Es la posición secuencial de la hora dentro del turno, **después de aplicar
el descuento de descanso**. Si el turno es 7am-6pm con 60min de almuerzo,
las horas efectivas son 10, pero se cuentan así:
 
```typescript
// En el loop que itera hora por hora del turno:
let horaEfectiva = 0 // contador de horas efectivas (post-descanso)
 
for (const horaDelTurno of horasDelTurno) {
  // Si esta hora está dentro del descanso, saltarla
  if (esHoraDeDescanso(horaDelTurno, configDescanso)) continue
 
  horaEfectiva++
 
  const tipo = clasificarHoraTurnoIndividual(
    horaDelTurno.horaCalendar,
    horaDelTurno.fecha,
    horaEfectiva,        // ← posición en el turno (1, 2, 3...)
    limiteDiario,
    diasDescanso,
    tipoJornada
  )
}
```
 
#### En la UI (`src/components/FormularioJornada.tsx` o equivalente)
 
La sección de jornada pactada debe quedar con este comportamiento:
 
1. **Campo de horas diarias pactadas:** input numérico opcional (no obligatorio)
```
   Label: "Horas diarias pactadas (opcional)"
   Placeholder: "8 (máximo legal)"
   Tipo: número, mínimo 4, máximo 8
   Default: vacío (no pre-llenado)
   Nota: "Si no lo llenas, se usarán 8h como límite ordinario diario"
```
 
2. **El badge informativo** de CB-01 se mantiene pero con texto actualizado:
```tsx
   <p className="text-xs text-blue-300">
     <strong>Referencial.</strong> Si tienes un acuerdo escrito con tu
     empleador de trabajar menos de 8h diarias, indícalo aquí. De lo
     contrario, se usará el máximo legal de 8h.
   </p>
```
 
3. **Los días laborales** del formulario de jornada pactada siguen siendo
   informativos en el modo Turno Individual — NO se usan para clasificar extras
   (el modo Turno evalúa un solo día por vez, así que el día de la semana
   del turno es lo que importa, no los días pactados).
#### Cómo leer el valor de jornada pactada en el turno individual
 
```typescript
// En el componente que dispara el cálculo:
const limiteDiario = getLimiteDiario(
  jornadaPactadaHoras !== '' && jornadaPactadaHoras !== null
    ? Number(jornadaPactadaHoras)
    : null
)
```
 
---
 
### Casos de verificación
 
**Caso A — Sin jornada pactada, turno de 10h (7am-5pm, 0 descanso):**
```
Límite diario: 8h (por defecto)
Horas 1-8 (7am-3pm): ORDINARIAS DIURNAS → $0 recargo
Horas 9-10 (3pm-5pm): EXTRA DIURNAS → 2h × $8.338,60 × 1.25 = $20.847
Total: $20.847 ✅ (coincide con Caso 3.1 original)
```
 
**Caso B — Sin jornada pactada, turno de 11h (7am-6pm, 0 descanso):**
```
Límite diario: 8h
Horas 1-8 (7am-3pm): ORDINARIAS DIURNAS
Horas 9-11 (3pm-6pm): EXTRA DIURNAS → 3h × $8.338,60 × 1.25 = $31.270
Total: $31.270 ✅ (coincide con Caso 3.2 original)
⚠️ Advertencia: supera 2h extra diarias
```
 
**Caso C — Jornada pactada 6h, turno de 8h (7am-3pm, 0 descanso):**
```
Límite diario: 6h (pactado por el usuario)
Horas 1-6 (7am-1pm): ORDINARIAS DIURNAS → $0
Horas 7-8 (1pm-3pm): EXTRA DIURNAS → 2h × $8.338,60 × 1.25 = $20.847
Total: $20.847
```
 
**Caso D — Con descanso de 60 min, turno 7am-6pm:**
```
Horas brutas: 11h
Descanso: 1h
Horas efectivas: 10h
Límite diario: 8h
Horas 1-8: ORDINARIAS
Horas 9-10: EXTRA DIURNAS → 2h × $8.338,60 × 1.25 = $20.847
Total: $20.847
```
 
**Caso E — Modo Período NO cambia (verificar que sigue igual):**
```
L-V 8h/día: acumulado 40h < 42h → todo ordinario
Sábado 8h: acumulado 48h, corte en hora 3 del sábado (42-40=2h ordinarias, 6h extra)
Total sábado: $79.217 ✅ (sin cambios)
```
 
---
 
### Ejecutar después de la corrección
 
```bash
npm run build   # debe pasar sin errores
npm test        # todos los tests deben pasar
 
# Tests específicos a verificar o crear:
# - turno 10h sin jornada pactada → 2h extra diurna = $20.847
# - turno 11h sin jornada pactada → 3h extra diurna = $31.270
# - turno 8h con jornada pactada 6h → 2h extra diurna = $20.847
# - turno con descanso 60min, 7am-6pm → 2h extra diurna = $20.847
# - modo período: sin cambios respecto a antes de CB-06
```
 
---
 
### Actualización del estado en este archivo
 
| Corrección | Estado | Verificado |
|---|---|---|
| CB-01 Jornada informativa + fix nocturno | ✅ Aplicada | ⏳ Reverificar con CB-06 |
| CB-02 Auxilio separado del cálculo | ✅ Aplicada | ☐ |
| CB-03 Animación de carga | ✅ Aplicada | ☐ |
| CB-04 Dos días de descanso rotativo | ✅ Aplicada | ☐ |
| CB-05 Indicador horas jornada informativa | ✅ Aplicada | ☐ |
| **CB-06 Límite diario turno individual** | ✅ Aplicada | ☐ |
| **CB-07 Mejora en el Motor del calculo** | ✅ Aplicada | ☐ |
 
---
 
### Nota para las pruebas de caja negra
 
Después de aplicar CB-06, los casos 3.1 y 3.2 del archivo
`pruebas_caja_negra_v2.md` deben actualizarse con los valores
originales (ya que CB-06 los restaura):
 
```
Caso 3.1 — esperado: $20.847 (2h extra diurna)
Caso 3.2 — esperado: $31.270 (3h extra diurna)
```
 
El Caso 3.3 (modo período) no cambia — ya usaba acumulador semanal.
 
---
 
## Instrucción para próximas rondas
 
Cuando encuentres nuevas fallas en pruebas de caja negra, agrega una
nueva sección al final de este archivo con el formato:
 
```markdown
## RONDA N — Pruebas Nivel X (Fecha)
 
### CORRECCIÓN CB-NN — [Nombre del problema]
**Caso fallido:** CASO X.X
**Resultado obtenido:** [lo que mostró la calculadora]
**Resultado esperado:** [lo que debería mostrar]
**Observación del usuario:** [comentario textual de la prueba]
 
[Especificación técnica de la corrección]
```


