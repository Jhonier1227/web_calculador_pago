---
description: Revisión de rendimiento del frontend
agent: MiniMax-M3
---

Realiza una revisión de rendimiento del frontend.

Contexto del proyecto:
!`cat package.json 2>/dev/null`

Analiza y reporta:
1. Renders innecesarios y oportunidades de memoización (React.memo, useMemo, useCallback).
2. Bundle size: dependencias pesadas, imports innecesarios, tree-shaking.
3. Carga de imágenes y assets (lazy loading, formatos modernos).
4. Code splitting y lazy loading de rutas/componentes.
5. Estilos y animaciones que afecten el rendimiento (reflows, repaints).
6. Posibles memory leaks (event listeners, subscriptions, timers).
7. Estrategias de caché y fetching de datos.

Prioriza las mejoras por impacto y esfuerzo. Incluye ejemplos de código cuando sea relevante.