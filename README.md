# Calculadora Laboral Colombiana

Herramienta web interactiva para calcular horas extra, recargos nocturnos,
dominicales y festivos según la legislación laboral colombiana vigente
(Ley 2466 de 2025 y Ley 2101 de 2021, efectiva desde el 15 de julio de 2026).

## ¿Para quién es?

Trabajadores colombianos que necesitan verificar cuánto dinero les deben pagar
por concepto de recargos y horas extra, sin necesidad de conocimientos
matemáticos o legales.

## Funcionalidades

- Cálculo de recargos por turno individual
- Cálculo por período (quincena o mes completo)
- Detección automática de festivos colombianos (Ley Emiliani)
- Soporte de turnos que cruzan medianoche
- Calculadora básica integrada

## Legislación aplicada

- Jornada máxima semanal: 42 horas (Ley 2101 de 2021)
- Horario nocturno: 7:00 p.m. a 6:00 a.m.
- Recargo dominical/festivo: 90%
- Recargo hora extra diurna: 25%
- Recargo hora extra nocturna: 75%

## Stack tecnológico

- React + Vite + TypeScript
- Tailwind CSS
- festivos-colombia (cálculo de festivos con Ley Emiliani)
- Despliegue: Vercel

## Instalación y desarrollo local

```bash
# Instalar dependencias
npm install

# Variables de entorno
cp .env.example .env.local
# (editar .env.local con los valores correspondientes si aplica)

# Servidor de desarrollo
npm run dev

# Build de producción
npm run build

# Generar iconos PWA (192, 512, maskable)
npm run generate-icons

# Vista previa del build de producción
npm run preview

# Tests unitarios y de componentes
npm test

# Tests E2E (Playwright)
npm run test:e2e

# Auditoría de seguridad
npm audit
```

## PWA

La aplicación es instalable como Progressive Web App:

- Service Worker con precaching de todos los assets
- Manifest con iconos 192×192, 512×512 y maskable
- Actualización automática del SW (autoUpdate)
- Offline: la app carga desde la caché tras la primera visita

## Despliegue en Vercel

Conectar el repositorio a Vercel. La configuración está en `vercel.json`:

- Build command: `npm run build`
- Output directory: `dist`
- Headers de seguridad: CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy
- Cacheo de assets con hash (max-age 1 año)
- Service Worker con cacheo manual (no-cache)
- Rewrites SPA a index.html

Variables de entorno necesarias en Vercel:

| Variable | Descripción |
|----------|-------------|
| `VITE_GA_ID` | Measurement ID de Google Analytics 4 (opcional) |

## Limitaciones conocidas

- Aplica únicamente el esquema legal vigente desde el 15 de julio de 2026.
- Los turnos que cruzan medianoche se calculan correctamente hora por hora.
- El límite de horas extra se valida a nivel diario (no acumula entre días).
- El período máximo de cálculo es 31 días.

## Licencia

Copyright (c) 2026 Jhonier Stiven Montaño Castillo. Todos los derechos reservados.
Ver archivo LICENSE para más detalles.
