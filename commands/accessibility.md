---
description: Auditoría de accesibilidad (a11y)
agent: MiniMax-M3
---

Realiza una auditoría de accesibilidad (WCAG 2.1 AA) del componente/página en @$ARGUMENTS (o del proyecto completo si no se especifica).

Analiza:
1. Uso correcto de elementos semánticos (button, nav, main, header, etc.).
2. Atributos ARIA: labels, roles, alt text en imágenes.
3. Contraste de colores y tamaño de fuentes.
4. Navegación por teclado y focus management.
5. Formularios: labels asociados, mensajes de error accesibles.
6. Textos alternativos y contenido multimedia.
7. Manejo de estados (loading, error) accesible.

Entrega una lista de problemas por severidad (Crítico, Alto, Medio, Bajo) con la ubicación exacta y la solución recomendada, además de sugerencias para cumplir con WCAG 2.1 AA.