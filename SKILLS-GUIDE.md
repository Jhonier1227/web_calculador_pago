# Guia Completa de Skills - Referencia Rápida

> Archivo de referencia para conocer todas las skills disponibles en el proyecto, cuando usarlas y como aplicarlas correctamente.

---

## Tabla de Contenidos

1. [Frontend & UI](#1-frontend--ui)
   - [frontend-design](#frontend-design)
   - [tailwind-css-patterns](#tailwind-css-patterns)
   - [accessibility](#accessibility)
   - [seo](#seo)
2. [Backend & Node.js](#2-backend--nodejs)
   - [nodejs-backend-patterns](#nodejs-backend-patterns)
   - [nodejs-best-practices](#nodejs-best-practices)
3. [TypeScript](#3-typescript)
   - [typescript-advanced-types](#typescript-advanced-types)
4. [React & Next.js](#4-react--nextjs)
   - [vercel-react-best-practices](#vercel-react-best-practices)
   - [vercel-composition-patterns](#vercel-composition-patterns)
5. [Build Tools](#5-build-tools)
   - [vite](#vite)
6. [Configuracion de opencode](#6-configuracion-de-opencode)
   - [customize-opencode](#customize-opencode)

---

## 1. Frontend & UI

### frontend-design

**Ubicacion:** `.agents/skills/frontend-design/SKILL.md`

**Para que sirve:**
Crear interfaces frontend distintivas, con calidad de produccion, evitando esteticas genericas tipicas de IA. Genera codigo creativo y pulido con diseno innovador.

**Cuando usarla:**
- Construir componentes web, paginas, artefactos o aplicaciones
- Crear landing pages, dashboards, layouts HTML/CSS
- Estilizar o embellecer cualquier interfaz web
- Cuando se necesita un diseno unico y memorable

**Ejemplo de uso:**
```
"Disena una pagina de inicio para una tienda de electronica con estética retro-futurista"
"Crea un componente de dashboard con tematica oscura y tipografia distintiva"
"Estiliza este formulario para que sea visualmente impactante"
```

**Caracteristicas clave:**
- Elige una direccion estetica clara (brutalista, retro, organico, luxury, etc.)
- Usa tipografia unica y distintiva (nunca fuentes genericas como Arial o Inter)
- Color y tema cohesivo con acentos pronunciados
- Animaciones y micro-interacciones significativas
- Composicion espacial inesperada (asimetria, overlap, diagonal)

---

### tailwind-css-patterns

**Ubicacion:** `.agents/skills/tailwind-css-patterns/SKILL.md`

**Para que sirve:**
Guia experta para construir interfaces modernas y responsivas con Tailwind CSS v4.1+. Cubre composicion de utilidades, dark mode, patrones de componentes y optimizacion de rendimiento.

**Cuando usarla:**
- Estilizar componentes React/Vue/Svelte con Tailwind CSS
- Construir layouts responsivos y grid
- Implementar sistemas de disenos
- Agregar soporte dark mode
- Optimizar el flujo de trabajo de CSS

**Ejemplo de uso:**
```
"Estiliza este componente de tarjeta con Tailwind CSS"
"Crea un layout responsivo para el dashboard usando grid de Tailwind"
"Agrega dark mode a toda la aplicacion con Tailwind"
```

**Referencia rapida de breakpoints:**
| Prefijo | Ancho Minimo | Descripcion |
|---------|--------------|-------------|
| `sm:` | 640px | Pantallas pequenas |
| `md:` | 768px | Tablets |
| `lg:` | 1024px | Escritorios |
| `xl:` | 1280px | Pantallas grandes |
| `2xl:` | 1536px | Extra grande |

**Patron basico:**
```html
<!-- Grid responsivo -->
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
  <!-- Items -->
</div>
```

---

### accessibility

**Ubicacion:** `.agents/skills/accessibility/SKILL.md`

**Para que sirve:**
Auditar y mejorar la accesibilidad web siguiendo las directrices WCAG 2.2. Hace que el contenido sea utilizable por todos, incluyendo personas con discapacidades.

**Cuando usarla:**
- Cuando se pide "mejorar accesibilidad", "auditoria a11y", "cumplimiento WCAG"
- Soporte para lectores de pantalla
- Navegacion por teclado
- "Hacer accesible" cualquier interfaz

**Ejemplo de uso:**
```
"Haz que este formulario sea accesible para lectores de pantalla"
"Audita la accesibilidad de esta pagina"
"Agrega soporte de navegacion por teclado a este componente"
```

**Principios WCAG (POUR):**
| Principio | Descripcion |
|-----------|-------------|
| **P**ercebible | El contenido puede ser percibido por diferentes sentidos |
| **O**perable | La interfaz puede ser operada por todos los usuarios |
| **U**nderstandable | El contenido y la interfaz son comprensibles |
| **R**obusto | El contenido funciona con tecnologias asistivas |

**Niveles de conformidad:**
- **A**: Accesibilidad minima (debe pasar)
- **AA**: Cumplimiento estandar (debe pasar, requisito legal en muchas jurisdicciones)
- **AAA**: Accesibilidad mejorada (deseable)

**Problemas criticos a corregir inmediatamente:**
1. Formularios sin etiquetas
2. Imagenes sin texto alternativo
3. Contraste de color insuficiente
4. Trampas de teclado
5. Sin indicadores de enfoque (focus)

---

### seo

**Ubicacion:** `.agents/skills/seo/SKILL.md`

**Para que sirve:**
Optimizacion para motores de busqueda basada en auditorias Lighthouse SEO y directrices de Google Search. Se enfoca en SEO tecnico, optimizacion on-page y datos estructurados.

**Cuando usarla:**
- Cuando se pide "mejorar SEO", "optimizar para busqueda"
- Corregir meta tags
- Agregar datos estructurados (JSON-LD)
- Optimizacion de sitemap
- "Search engine optimization"

**Ejemplo de uso:**
```
"Optimiza el SEO de esta pagina de producto"
"Agrega datos estructurados JSON-LD para FAQ"
"Crea un sitemap XML para el sitio"
```

**Factores de ranking (aproximados):**
| Factor | Influencia |
|--------|------------|
| Calidad y relevancia del contenido | ~40% |
| Backlinks y autoridad | ~25% |
| SEO tecnico | ~15% |
| Experiencia de pagina (Core Web Vitals) | ~10% |
| SEO on-page | ~10% |

**Checklist critico:**
- [ ] HTTPS habilitado
- [ ] robots.txt permite rastreo
- [ ] Tags de titulo presentes y unicos
- [ ] Un solo `<h1>` por pagina
- [ ] Meta descripciones presentes
- [ ] Sitemap enviado
- [ ] URLs canonicas configuradas
- [ ] Diseno responsivo para movil

---

## 2. Backend & Node.js

### nodejs-backend-patterns

**Ubicacion:** `.agents/skills/nodejs-backend-patterns/SKILL.md`

**Para que sirve:**
Guia integral para construir aplicaciones backend de Node.js escalables, mantenibles y listas para produccion con frameworks modernos, patrones arquitectonicos y mejores practicas.

**Cuando usarla:**
- Construir APIs REST o servidores GraphQL
- Crear microservicios con Node.js
- Implementar autenticacion y autorizacion
- Disenar arquitecturas backend escalables
- Configurar middleware y manejo de errores
- Integrar bases de datos (SQL y NoSQL)
- Construir aplicaciones en tiempo real con WebSockets
- Implementar procesamiento de jobs en segundo plano

**Ejemplo de uso:**
```
"Crea un API REST con Express para gestion de usuarios"
"Implementa autenticacion JWT con refresh tokens"
"Configura rate limiting y logging para la API"
```

**Frameworks principales:**
| Framework | Mejor para |
|-----------|------------|
| **Express** | Legado, ecosistema maximo, aprendizaje |
| **Fastify** | Alto rendimiento (2-3x mas rapido que Express) |
| **Hono** | Edge/Serverless, cold starts rapidos |
| **NestJS** | Enterprise, DI, decoradores |

**Arquitectura en capas:**
```
Request Flow:
├── Controller/Route Layer (HTTP specifics, validacion)
├── Service Layer (logica de negocio)
└── Repository Layer (acceso a datos)
```

**Patrones clave:**
- Middleware de autenticacion (JWT)
- Middleware de validacion (Zod)
- Rate limiting
- Logging estructurado
- Manejo de errores personalizado
- Connection pooling para BD

---

### nodejs-best-practices

**Ubicacion:** `.agents/skills/nodejs-best-practices/SKILL.md`

**Para que sirve:**
Principios y toma de decisiones para desarrollo Node.js en 2025. Ensenia a PENSAR, no a copiar patrones de codigo.

**Cuando usarla:**
- Tomar decisiones de arquitectura Node.js
- Elegir frameworks
- Disenar patrones asincronos
- Aplicar mejores practicas de seguridad y despliegue

**Ejemplo de uso:**
```
"Que framework debo usar para una API serverless en Cloudflare?"
"Cual es la mejor forma de manejar errores en Node.js?"
"Como optimizar el rendimiento de la aplicacion?"
```

**Arbol de decision para frameworks:**
```
Que estas construyendo?
├── Edge/Serverless → Hono
├── API de Alto Rendimiento → Fastify
├── Enterprise/Familiaridad del equipo → NestJS
├── Legado/Estable/Ecosistema maximo → Express
└── Full-stack con frontend → Next.js API Routes o tRPC
```

**Consideraciones de Runtime:**
| Runtime | Mejor para |
|---------|-----------|
| **Node.js** | proposito general, ecosistema mas grande |
| **Bun** | Rendimiento, bundler integrado |
| **Deno** | Seguridad, TypeScript integrado |

**Anti-patrones a evitar:**
- Usar Express para proyectos edge nuevos
- Usar metodos sincronos en produccion
- Poner logica de negocio en controllers
- Saltar validacion de entradas
- Hardcodear secretos
- Confiar en datos externos sin validacion

---

## 3. TypeScript

### typescript-advanced-types

**Ubicacion:** `.agents/skills/typescript-advanced-types/SKILL.md`

**Para que sirve:**
Guia integral para dominar el sistema de tipos avanzado de TypeScript incluyendo genericos, tipos condicionales, tipos mapeados, tipos de template literal y tipos de utilidad.

**Cuando usarla:**
- Construir bibliotecas o frameworks type-safe
- Crear componentes genericos reutilizables
- Implementar logica compleja de inferencia de tipos
- Disenar clientes API type-safe
- Construir sistemas de validacion de formularios
- Migrar codebases JavaScript a TypeScript

**Ejemplo de uso:**
```
"Crea un tipo que extraiga el tipo de retorno de una funcion"
"Implementa un emitter de eventos tipado"
"Disena un builder pattern con seguridad de tipos"
```

**Conceptos clave:**
- **Genericos**: Crear componentes reutilizables con flexibilidad de tipos
- **Tipos Condicionales**: Tipos que dependen de condiciones
- **Tipos Mapeados**: Transformar tipos existentes iterando propiedades
- **Tipos Template Literal**: Tipos basados en strings con pattern matching
- **Tipos de Utilidad**: Partial, Required, Readonly, Pick, Omit, etc.

**Patrones avanzados:**
1. Event Emitter tipado
2. Cliente API type-safe
3. Builder Pattern con seguridad de tipos
4. Deep Readonly/Partial
5. Validacion de formularios type-safe
6. Discriminated Unions

**Mejores practicas:**
- Usar `unknown` en lugar de `any`
- Preferir `interface` para formas de objetos
- Usar `type` para uniones y tipos complejos
- Aprovechar la inferencia de tipos
- Crear tipos auxiliares reutilizables
- Usar const assertions
- Evitar aserciones de tipo, usar type guards

---

## 4. React & Next.js

### vercel-react-best-practices

**Ubicacion:** `.agents/skills/react-best-practices/SKILL.md`

**Para que sirve:**
Guia integral de optimizacion de rendimiento para aplicaciones React y Next.js, mantenida por Vercel. Contiene 70 reglas en 8 categorias, priorizadas por impacto.

**Cuando usarla:**
- Escribir nuevos componentes React o paginas Next.js
- Implementar obtencion de datos (client o server-side)
- Revisar codigo por problemas de rendimiento
- Refactorizar codigo React/Next.js existente
- Optimizar bundle size o tiempos de carga

**Ejemplo de uso:**
```
"Optimiza el rendimiento de este componente React"
"Implementa server-side data fetching con Next.js"
"Refactoriza este componente para evitar re-renders innecesarios"
```

**Categorias por prioridad:**
| Prioridad | Categoria | Impacto |
|-----------|-----------|---------|
| 1 | Eliminar Waterfalls | CRITICO |
| 2 | Optimizacion de Bundle Size | CRITICO |
| 3 | Rendimiento Server-Side | ALTO |
| 4 | Data Fetching Client-Side | MEDIO-ALTO |
| 5 | Optimizacion de Re-renders | MEDIO |
| 6 | Rendimiento de Renderizado | MEDIO |
| 7 | Rendimiento JavaScript | BAJO-MEDIO |
| 8 | Patrones Avanzados | BAJO |

**Reglas criticas destacadas:**
- `async-parallel`: Usar Promise.all() para operaciones independientes
- `bundle-barrel-imports`: Importar directamente, evitar barrel files
- `bundle-dynamic-imports`: Usar next/dynamic para componentes pesados
- `rerender-memo`: Extraer trabajo costoso en componentes memoizados
- `rerender-no-inline-components`: No definir componentes dentro de componentes

---

### vercel-composition-patterns

**Ubicacion:** `.agents/skills/composition-patterns/SKILL.md`

**Para que sirve:**
Patrones de composicion para construir componentes React flexibles y mantenibles. Evita la proliferacion de boolean props usando componentes compuestos, elevando estado y componiendo internamente.

**Cuando usarla:**
- Refactorizar componentes con muchas boolean props
- Construir bibliotecas de componentes reutilizables
- Disenar APIs de componentes flexibles
- Revisar arquitectura de componentes
- Trabajar con componentes compuestos o context providers

**Ejemplo de uso:**
```
"Refactoriza este componente que tiene 10 boolean props"
"Crea un componente compound para un dropdown"
"Implementa un provider para manejar el estado del formulario"
```

**Categorias de reglas:**
| Prioridad | Categoria | Impacto |
|-----------|-----------|---------|
| 1 | Arquitectura de Componentes | ALTO |
| 2 | Gestion de Estado | MEDIO |
| 3 | Patrones de Implementacion | MEDIO |
| 4 | APIs de React 19 | MEDIO |

**Patrones clave:**
- **Avoid Boolean Props**: No agregar props booleanas para personalizar comportamiento
- **Compound Components**: Estructurar componentes complejos con contexto compartido
- **Lift State**: Mover estado dentro de providers para acceso entre hermanos
- **Explicit Variants**: Crear componentes variantes explicitos en lugar de modos booleanos
- **Children over Render Props**: Usar children para composicion en lugar de renderX props

**React 19+ (si aplica):**
- No usar `forwardRef`, usar `use()` en lugar de `useContext()`

---

## 5. Build Tools

### vite

**Ubicacion:** `.agents/skills/vite/SKILL.md`

**Para que sirve:**
Configuracion de la herramienta de build Vite 8 beta (basada en Rolldown). Vite 8 usa el bundler Rolldown y el transformador Oxc para dev server rapido (ESM nativo + HMR) y builds de produccion optimizados.

**Cuando usarla:**
- Trabajar con proyectos Vite
- Configurar `vite.config.ts`
- Usar plugins de Vite
- Construir aplicaciones SSR con Vite
- Migrar a Vite 8 Rolldown

**Ejemplo de uso:**
```
"Configura proxy de API en vite.config.ts"
"Agrega el plugin de React al proyecto Vite"
"Optimiza la configuracion de build para produccion"
```

**Comandos CLI:**
```bash
vite              # Iniciar dev server
vite build        # Build de produccion
vite preview      # Previsualizar build de produccion
vite build --ssr  # Build SSR
```

**Configuracion comun:**
```ts
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [],
  resolve: { alias: { '@': '/src' } },
  server: { port: 3000, proxy: { '/api': 'http://localhost:8080' } },
  build: { target: 'esnext', outDir: 'dist' },
})
```

**Plugins oficiales:**
- `@vitejs/plugin-vue` - Soporte Vue 3 SFC
- `@vitejs/plugin-react` - React con Oxc/Babel
- `@vitejs/plugin-react-swc` - React con SWC
- `@vitejs/plugin-legacy` - Soporte navegadores legacy

---

## 6. Configuracion de opencode

### customize-opencode

**Ubicacion:** `opencode.json` o `.opencode/opencode.json`

**Para que sirve:**
Configurar y personalizar opencode: agentes, skills, plugins, servidores MCP, permisos y configuracion general del CLI.

**Cuando usarla:**
- Editar o crear `opencode.json`, `opencode.jsonc`
- Crear o arreglar agentes de opencode
- Crear o arreglar skills de opencode
- Configurar plugins de opencode
- Configurar servidores MCP
- Establecer reglas de permisos

**Ejemplo de uso:**
```
"Crea un agente personalizado para revisar PRs"
"Agrega un plugin de autenticacion a opencode"
"Configura permisos para el tool de bash"
```

**Ubicaciones de archivos:**
| Ambito | Ruta |
|--------|------|
| Config del proyecto | `./opencode.json` o `.opencode/opencode.json` |
| Config global | `~/.config/opencode/opencode.json` |
| Agentes del proyecto | `.opencode/agent/<nombre>.md` |
| Agentes globales | `~/.config/opencode/agent(s)/<nombre>.md` |
| Skills del proyecto | `.opencode/skill(s)/<nombre>/SKILL.md` |
| Skills globales | `~/.config/opencode/skill(s)/<nombre>/SKILL.md` |
| Skills externas (auto-cargadas) | `~/.claude/skills/<nombre>/SKILL.md`, `~/.agents/skills/<nombre>/SKILL.md` |

**Elementos de configuracion principales:**
- `model`: Modelo a usar (con prefijo de proveedor)
- `agent`: Definir agentes personalizados
- `plugin`: Plugins a cargar
- `mcp`: Servidores MCP configurados
- `permission`: Reglas de permisos por tool
- `skills`: Rutas y URLs de skills

**Nota importante:** Los cambios de configuracion requieren reiniciar opencode para tomar efecto.

---

## Matriz de Decision Rapida

> Usa esta tabla para decidir que skill cargar segun tu tarea:

| Si necesitas... | Usa esta skill |
|-----------------|----------------|
| Crear un UI con diseno unico | `frontend-design` |
| Estilizar con Tailwind CSS | `tailwind-css-patterns` |
| Hacer accesible una interfaz | `accessibility` |
| Optimizar para buscadores | `seo` |
| Construir un API REST/GraphQL | `nodejs-backend-patterns` |
| Tomar decisiones de arquitectura Node.js | `nodejs-best-practices` |
| Tipos avanzados de TypeScript | `typescript-advanced-types` |
| Optimizar rendimiento React/Next.js | `vercel-react-best-practices` |
| Mejorar arquitectura de componentes React | `vercel-composition-patterns` |
| Configurar Vite o builds | `vite` |
| Configurar opencode | `customize-opencode` |

---

## Notas Finales

- **No todas las skills se usan en todo momento.** Elige la skill correcta segun la tarea.
- **Algunas skills se complementan.** Por ejemplo, `frontend-design` + `tailwind-css-patterns` para un proyecto frontend completo.
- **Lee la skill completa** antes de implementar para entender todos los patrones disponibles.
- **Referencia los archivos de referencia** dentro de cada skill para ejemplos detallados.
- **Esta guia es un resumen.** Cada skill contiene documentacion mucho mas extensa en su SKILL.md.

---

*Ultima actualizacion: 2026-06-30*
