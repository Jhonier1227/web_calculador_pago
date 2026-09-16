---
description: Crea un custom hook
agent: MiniMax-M3
---

Crea un custom hook llamado `use$1` siguiendo las convenciones del proyecto.

Revisa hooks existentes para mantener consistencia:
!`find . -maxdepth 4 -type f -name 'use*.ts' -o -name 'use*.js' -o -name 'use*.tsx' -not -path '*/node_modules/*' | head -20`

El hook debe incluir:
1. Tipo de retorno correctamente definido.
2. Manejo de estados, efectos y limpieza de efectos.
3. Manejo de errores y estados de carga.
4. Documentación de uso con un ejemplo en comentarios JSDoc.
5. Tests unitarios del hook.

Qué hace el hook: $2