# PROYECTO.md — web_calculador_precio

## 1. Qué es el proyecto y para quién

**web_calculador_precio** es una calculadora web interactiva que permite a cualquier trabajador en Colombia ingresar su horario de trabajo y salario, y obtener de forma inmediata y clara el desglose de cuánto le deben pagar por horas extra, recargos nocturnos, dominicales y festivos, **sin necesidad de conocer fórmulas matemáticas ni la legislación laboral**.

**Público objetivo:** Personas sin conocimientos matemáticos ni legales (trabajadores informales, empleados, estudiantes, empleadores pequeños) que necesitan verificar su liquidación de nómina o entender cuánto vale su tiempo trabajado bajo la legislación colombiana vigente.

**Problema que resuelve:** La legislación laboral colombiana tiene múltiples recargos que se combinan (nocturno + dominical + extra) y reglas complejas (festivos ley Emiliani, turnos que cruzan medianoche, diferencia entre "recargo" y "hora extra"). Hoy no existe una herramienta sencilla, gratuita y confiable que haga este cálculo por hora y muestre el desglose entendible.

---

## 2. Objetivo del MVP

Entregar una **calculadora client-side (sin backend, sin base de datos, sin login)** que:

- Reciba: salario mensual, jornada pactada (días + horario habitual), y un turno específico (fecha + hora inicio/fin).
- Calcule: clasificación hora por hora (ordinaria, extra, nocturna, dominical/festiva, combinaciones).
- Muestre: desglose detallado por hora, resumen agrupado por tipo, total a pagar, y advertencias legales.
- Funcione 100% en el navegador, instalable como PWA, desplegada en Vercel/Netlify.

**Fuera de alcance del MVP:**
- Backend, base de datos, autenticación, historial guardado.
- Esquema legal anterior a 15 julio 2026 (Ley 2101 de 2021 + Ley 2466 de 2025).
- Validación de límite semanal de horas extra (solo validación diaria en MVP).
- Prestaciones sociales, seguridad social.
- Exportación PDF/CSV/URL (solo copiar total al portapapeles).
- Analytics avanzados (solo GA4 básico).

---

## 3. Stack tecnológico y justificación

| Tecnología | Versión | Por qué se eligió |
|------------|---------|-------------------|
| **React** | 19.x | Ecosistema maduro, componentes reutilizables, buen DX, amplio soporte PWA. |
| **Vite** | 8.x | Build ultrarrápido, HMR instantáneo, configuración mínima, salida estática optimizada. |
| **TypeScript** | 6.x | Tipado estricto para lógica de cálculo crítica (evita bugs en fórmulas legales), autocompletado, refactoring seguro. |
| **Tailwind CSS** | 4.x | Utility-first, sin CSS personalizado, responsive nativo, modo oscuro fácil, bundle pequeño. |
| **festivos-colombia** | 0.0.1 | Única librería npm confiable para festivos Colombia con Ley Emiliani (festivos trasladados al lunes). |
| **ESLint + TypeScript ESLint** | LTS | Calidad de código, detección temprana de errores, consistencia en equipo de 1 persona. |

**Decisiones de arquitectura clave:**
- **Lógica pura separada de UI:** Todo el motor de cálculo vive en `src/lib/calculos/` como funciones puras (sin side effects, sin React). Esto permite testear unitariamente al 100%, reutilizar en futuro backend, y auditar la lógica legal independientemente de la interfaz.
- **Client-side only:** `localStorage` opcional para preferencias (tema, último salario), pero **cero persistencia de datos sensibles**.
- **PWA-ready desde el inicio:** `vite-plugin-pwa` se añadirá en fase de despliegue; `manifest.json` y service worker para funcionamiento offline.

---

## 4. Arquitectura general y estructura de carpetas

```
src/
├── lib/
│   └── calculos/
│       ├── festivos.ts           # Ya existe: wrapper festivos-colombia
│       ├── constantes.ts         # Constantes legales 2026 (salario mínimo, divisor, recargos, horarios)
│       ├── tipos.ts              # TypeScript types: TipoHora, JornadaPactada, Turno, ResultadoCalculo, etc.
│       ├── utilidades.ts         # Funciones puras: redondeo, formateo fechas/horas, validaciones auxiliares
│       ├── clasificacion.ts      # Motor: clasificarHora(dentroJornada, esFestivo, esNocturna) → TipoHora
│       ├── motor.ts              # Orquestador: calcularTurno(jornadaPactada, turno) → ResultadoCalculo
│       └── index.ts              # Barrel export público
├── components/
│   ├── Calculadora/              # Componente principal: formulario + resultados
│   │   ├── FormularioJornada.tsx
│   │   ├── FormularioTurno.tsx
│   │   ├── DesgloseHoras.tsx
│   │   ├── ResumenTotales.tsx
│   │   └── Advertencias.tsx
│   ├── ui/                       # Primitivas reutilizables (Button, Input, Select, Card, Badge, Table)
│   └── Educativo/                # Sección explicativa: "Cómo se calcula", "Tus derechos", FAQ
├── hooks/
│   ├── useCalculo.ts             # Hook que orquesta motor + estado UI
│   └── useLocalStorage.ts        # Persistencia preferencias (tema, último salario)
├── styles/
│   └── globals.css               # Tailwind imports + utilidades globales
├── App.tsx                       # Layout principal + providers
├── main.tsx                      # Entry point
└── vite-env.d.ts                 # Tipos Vite
```

**Flujo de datos:**
```
Usuario → Formularios (JornadaPactada + Turno) → useCalculo hook
                                              ↓
                                    motor.calcularTurno()
                                              ↓
                                    ResultadoCalculo (tipado)
                                              ↓
                                    UI: DesgloseHoras + ResumenTotales + Advertencias
```

---

## 5. Restricciones y decisiones de alcance ya tomadas

| Aspecto | Decisión |
|---------|----------|
| **Vigencia legal** | Solo esquema post-15-julio-2026 (Ley 2101/2021 + Ley 2466/2025). Jornada 42h/sem. Divisor 210. |
| **Backend / BD / Auth** | **Ninguno**. MVP 100% client-side, sitio estático. |
| **Despliegue** | Vercel / Netlify (static hosting). PWA instalable. |
| **Validación horas extra** | Solo **diaria** (máx 2h extra/día). **No** se acumula semana en MVP. → Mostrar advertencia visible al usuario. |
| **Festivos** | `festivos-colombia` maneja Ley Emiliani. Domingo = festivo calendario. |
| **Turnos medianoche** | **Cada hora se evalúa con su día calendario real** (no hereda día de inicio). Ej: Sáb 23:00 – Dom 03:00 → 1h sáb + 3h dom. |
| **Jornada pactada** | Usuario selecciona días (L-D) + **horario por día** (inicio/fin por cada día seleccionado). **Si domingo está en jornada pactada → NO hay recargo dominical** (día ordinario). |
| **Salario** | Input numérico COP. Opción rápida "Usar salario mínimo 2026 ($1.750.905)". **Si ingresan < mínimo → warning, pero calcular con valor ingresado**. Campo opcional "Auxilio de transporte" que **solo suma al total final**, no afecta valor hora. |
| **Redondeo monetario** | **Math.round** a peso entero (COP sin centavos). Por hora individual; total = suma de horas redondeadas. |
| **Hora fin = hora inicio** | **Inválido / error** (no 0h, no 24h). |
| **Jornada semanal > 42h** | **Warning visible**, no bloquear. |
| **Auxilio de transporte** | Campo opcional en UI. **Solo se suma al total mostrado**, no afecta valor hora ordinaria. |
| **Festivos años fuera de rango** | **Bloquear cálculo** si año del turno fuera de 2020-2037 (rango `festivos-colombia`). |
| **Turnos partidos** | Soportados: múltiples franjas horarias en el mismo día (ej: 08:00–12:00 y 14:00–18:00). |

---

## 6. Limitaciones conocidas del cálculo (para mostrar al usuario)

1. **Validación solo diaria:** El límite legal de 12 horas extra/semana **no se valida** en el MVP. La calculadora muestra advertencia si un día supera 2h extra, pero no suma varios días.
2. **Auxilio de transporte:** No se incluye en el valor hora. Campo opcional en UI que **solo suma al total final**.
3. **Sin prestaciones ni seguridad social:** Solo calcula valor hora trabajada (ordinarias + recargos + extras). No incluye prima, cesantías, intereses, EPS, pensión, ARL.
4. **Festivos ley Emiliani:** Depende de `festivos-colombia`. Si la librería tiene error en un año específico, el cálculo de ese festivo será incorrecto.
5. **Turnos > 24h:** No soportados (turno inválido si dura más de 24h).
6. **Festivos años fuera de 2020-2037:** `festivos-colombia` no cubre esos años → cálculo bloqueado con error.
7. **Redondeo por hora vs total:** Se redondea cada hora individual (Math.round) y el total es suma de horas redondeadas. Puede diferir ± pocos pesos vs redondear solo el total final.
8. **Jornada pactada con horarios por día:** Soportado en MVP. El usuario define inicio/fin para cada día seleccionado.