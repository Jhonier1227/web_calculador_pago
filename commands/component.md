---
description: Crea un componente reutilizable
agent: MiniMax-M3
---

Crea un componente de $1 llamado $2 en el framework del proyecto.

Antes de escribir código, revisa los componentes existentes para seguir las convenciones del proyecto (tipado, estilos, estructura de archivos, patrones):
!`find . -maxdepth 3 -type d \( -name 'components' -o -name 'Components' \) -not -path '*/node_modules/*' | head -20`

El componente debe incluir:
1. Tipado adecuado (TypeScript si el proyecto lo usa).
2. Props claramente definidas con valores por defecto cuando aplique.
3. Manejo de estados y efectos según sea necesario.
4. Estilos siguiendo el enfoque del proyecto (CSS Modules, styled-components, Tailwind, etc.).
5. Tests básicos del componente.
6. Exportación e index correctos.

Sigue siempre los patrones y librerías ya presentes en el código, no introduzcas nuevas dependencias sin necesidad.