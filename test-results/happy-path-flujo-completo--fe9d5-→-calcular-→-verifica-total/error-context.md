# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: happy-path.spec.ts >> flujo completo: carga → jornada → turno → calcular → verifica total
- Location: e2e\happy-path.spec.ts:3:1

# Error details

```
Error: locator.click: Error: strict mode violation: getByRole('button', { name: 'Sáb' }) resolved to 2 elements:
    1) <button type="button" class="rounded-lg px-3 py-1.5 text-sm font-medium transition-colors bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700">Sáb</button> aka getByRole('button', { name: 'Sáb' }).first()
    2) <button type="button" class="rounded-lg px-2.5 py-1 text-xs font-medium transition-colors bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700">Sáb</button> aka getByRole('button', { name: 'Sáb' }).nth(1)

Call log:
  - waiting for getByRole('button', { name: 'Sáb' })

```

# Page snapshot

```yaml
- generic [ref=e2]:
  - link "Saltar al contenido principal" [ref=e3] [cursor=pointer]:
    - /url: "#main-content"
  - generic [ref=e4]:
    - complementary [ref=e5]:
      - img [ref=e6]
    - generic [ref=e96]:
      - generic [ref=e97]:
        - banner [ref=e98]:
          - generic [ref=e99]:
            - heading "Calculadora de Horas Extra" [level=1] [ref=e100]
            - paragraph [ref=e101]: Colombia — Legislación 2026
          - button "Activar modo oscuro" [ref=e102]:
            - img [ref=e103]
        - navigation "Secciones" [ref=e105]:
          - button "Turno" [ref=e106]:
            - img [ref=e107]
            - text: Turno
          - button "Período" [ref=e110]:
            - img [ref=e111]
            - text: Período
          - button "Calculadora" [ref=e113]:
            - img [ref=e114]
            - text: Calculadora
        - main [ref=e116]:
          - region "Datos del cálculo" [ref=e117]:
            - heading "Datos del cálculo" [level=2] [ref=e118]
            - generic [ref=e119]:
              - generic [ref=e120]:
                - generic [ref=e121]: Salario mensual (COP)
                - textbox "Salario mensual (COP)" [active] [ref=e122]: 2.000.000
                - button "Usar salario mínimo ($ 1.750.905)" [ref=e123]
              - generic [ref=e124]:
                - generic [ref=e125]: Auxilio de transporte (opcional)
                - textbox "Auxilio de transporte (opcional)" [ref=e126]: "0"
                - paragraph [ref=e127]: Solo suma al total final
          - generic [ref=e128]:
            - heading "Jornada pactada" [level=2] [ref=e129]
            - paragraph [ref=e130]: Selecciona los días que trabajas habitualmente y tu horario por día.
            - generic [ref=e131]:
              - button "Lun" [ref=e132]
              - button "Mar" [ref=e133]
              - button "Mié" [ref=e134]
              - button "Jue" [ref=e135]
              - button "Vie" [ref=e136]
              - button "Sáb" [ref=e137]
              - button "Dom" [ref=e138]
            - generic [ref=e139]:
              - generic [ref=e140]: Lun
              - generic [ref=e141]: Lun inicio
              - textbox "Lun inicio" [ref=e142]: 08:00
              - generic [ref=e143]: a
              - generic [ref=e144]: Lun fin
              - textbox "Lun fin" [ref=e145]: 17:00
            - generic [ref=e146]:
              - generic [ref=e147]: Mar
              - generic [ref=e148]: Mar inicio
              - textbox "Mar inicio" [ref=e149]: 08:00
              - generic [ref=e150]: a
              - generic [ref=e151]: Mar fin
              - textbox "Mar fin" [ref=e152]: 17:00
            - generic [ref=e153]:
              - generic [ref=e154]: Mié
              - generic [ref=e155]: Mié inicio
              - textbox "Mié inicio" [ref=e156]: 08:00
              - generic [ref=e157]: a
              - generic [ref=e158]: Mié fin
              - textbox "Mié fin" [ref=e159]: 17:00
            - generic [ref=e160]:
              - generic [ref=e161]: Jue
              - generic [ref=e162]: Jue inicio
              - textbox "Jue inicio" [ref=e163]: 08:00
              - generic [ref=e164]: a
              - generic [ref=e165]: Jue fin
              - textbox "Jue fin" [ref=e166]: 17:00
            - generic [ref=e167]:
              - generic [ref=e168]: Vie
              - generic [ref=e169]: Vie inicio
              - textbox "Vie inicio" [ref=e170]: 08:00
              - generic [ref=e171]: a
              - generic [ref=e172]: Vie fin
              - textbox "Vie fin" [ref=e173]: 17:00
            - generic [ref=e174]:
              - alert [ref=e175]:
                - img [ref=e176]
                - generic [ref=e178]: La jornada semanal (45h) excede el límite legal de 42 horas.
              - paragraph [ref=e179]:
                - text: "Horas/semana:"
                - generic [ref=e180]: 45h
          - generic [ref=e183]:
            - heading "Período a calcular" [level=2] [ref=e184]
            - generic [ref=e185]:
              - generic [ref=e186]:
                - generic [ref=e187]: Fecha de inicio
                - textbox "Fecha de inicio" [ref=e188]: 2026-07-31
              - generic [ref=e189]:
                - generic [ref=e190]: Fecha de fin
                - textbox "Fecha de fin" [ref=e191]: 2026-07-31
            - generic [ref=e192]:
              - paragraph [ref=e193]: Bloques de horario
              - generic [ref=e194]:
                - generic [ref=e196]: Bloque 1
                - generic [ref=e197]:
                  - generic [ref=e198]:
                    - generic [ref=e199]: Desde
                    - textbox "Desde" [ref=e200]: 2026-07-31
                  - generic [ref=e201]:
                    - generic [ref=e202]: Hasta
                    - textbox "Hasta" [ref=e203]: 2026-07-31
                - generic [ref=e204]:
                  - generic [ref=e205]: Tipo de jornada
                  - generic [ref=e206]:
                    - button "Jornada estándar Descanso el domingo" [ref=e207]:
                      - text: Jornada estándar
                      - generic [ref=e208]: Descanso el domingo
                    - button "Turno rotativo Elegir día de descanso" [ref=e209]:
                      - text: Turno rotativo
                      - generic [ref=e210]: Elegir día de descanso
                  - paragraph [ref=e211]: El recargo dominical aplica sobre el día de descanso obligatorio pactado, no necesariamente el domingo (Art. 179 CST).
                - generic [ref=e212]:
                  - button "Lun" [ref=e213]
                  - button "Mar" [ref=e214]
                  - button "Mié" [ref=e215]
                  - button "Jue" [ref=e216]
                  - button "Vie" [ref=e217]
                  - button "Sáb" [ref=e218]
                  - button "Dom" [ref=e219]
                - generic [ref=e220]:
                  - generic [ref=e221]: Lun
                  - generic [ref=e222]: Lun inicio
                  - textbox "Lun inicio" [ref=e223]: 08:00
                  - generic [ref=e224]: a
                  - generic [ref=e225]: Lun fin
                  - textbox "Lun fin" [ref=e226]: 17:00
                - generic [ref=e227]:
                  - generic [ref=e228]: Mar
                  - generic [ref=e229]: Mar inicio
                  - textbox "Mar inicio" [ref=e230]: 08:00
                  - generic [ref=e231]: a
                  - generic [ref=e232]: Mar fin
                  - textbox "Mar fin" [ref=e233]: 17:00
                - generic [ref=e234]:
                  - generic [ref=e235]: Mié
                  - generic [ref=e236]: Mié inicio
                  - textbox "Mié inicio" [ref=e237]: 08:00
                  - generic [ref=e238]: a
                  - generic [ref=e239]: Mié fin
                  - textbox "Mié fin" [ref=e240]: 17:00
                - generic [ref=e241]:
                  - generic [ref=e242]: Jue
                  - generic [ref=e243]: Jue inicio
                  - textbox "Jue inicio" [ref=e244]: 08:00
                  - generic [ref=e245]: a
                  - generic [ref=e246]: Jue fin
                  - textbox "Jue fin" [ref=e247]: 17:00
                - generic [ref=e248]:
                  - generic [ref=e249]: Vie
                  - generic [ref=e250]: Vie inicio
                  - textbox "Vie inicio" [ref=e251]: 08:00
                  - generic [ref=e252]: a
                  - generic [ref=e253]: Vie fin
                  - textbox "Vie fin" [ref=e254]: 17:00
                - generic [ref=e255]:
                  - generic [ref=e256]: Descanso (almuerzo u otro)
                  - combobox "Descanso (almuerzo u otro)" [ref=e257]:
                    - option "Sin descanso (0 min)" [selected]
                    - option "15 minutos"
                    - option "30 minutos"
                    - option "45 minutos"
                    - option "1 hora (60 min)"
                    - option "1 hora 30 min (90 min)"
              - button "Añadir bloque" [ref=e258]:
                - img [ref=e259]
                - text: Añadir bloque
            - button "Calcular período" [ref=e260]
          - generic [ref=e261]:
            - heading "Cómo funciona el cálculo" [level=2] [ref=e262]
            - generic [ref=e264]:
              - tablist [ref=e265]:
                - tab "Cómo se calcula" [selected] [ref=e266]
                - tab "Tabla de recargos" [ref=e267]
                - tab "Recargo vs Extra" [ref=e268]
                - tab "Ley Emiliani" [ref=e269]
                - tab "Límites legales" [ref=e270]
                - tab "Preguntas frecuentes" [ref=e271]
              - tabpanel "Cómo se calcula" [ref=e272]:
                - list [ref=e273]:
                  - listitem [ref=e274]:
                    - text: Se calcula el
                    - strong [ref=e275]: valor de la hora ordinaria
                    - text: ": salario mensual ÷ 210."
                  - listitem [ref=e276]: Se genera una hora por cada hora del turno (incluyendo cruce de medianoche).
                  - listitem [ref=e277]:
                    - text: "Por cada hora se determina:"
                    - list [ref=e278]:
                      - listitem [ref=e279]:
                        - strong [ref=e280]: Dentro/fuera
                        - text: de jornada pactada (día + horario).
                      - listitem [ref=e281]:
                        - strong [ref=e282]: Nocturna
                        - text: (19:00 - 05:59) o diurna.
                      - listitem [ref=e283]:
                        - strong [ref=e284]: Festivo
                        - text: (domingo no laborable o festivo nacional).
                  - listitem [ref=e285]:
                    - text: Con esas 3 condiciones se aplica la
                    - strong [ref=e286]: tabla de 8 casos
                    - text: para determinar el tipo de hora y su recargo.
                  - listitem [ref=e287]:
                    - text: El
                    - strong [ref=e288]: valor por hora
                    - text: "se calcula como:"
                    - list [ref=e289]:
                      - listitem [ref=e290]:
                        - text: "Dentro de jornada:"
                        - code [ref=e291]: valorHoraOrd × recargo
                      - listitem [ref=e292]:
                        - text: "Fuera de jornada:"
                        - code [ref=e293]: valorHoraOrd × (1 + recargo)
                  - listitem [ref=e294]: Se suman todas las horas y se agrega el auxilio de transporte (si aplica).
        - contentinfo [ref=e295]:
          - paragraph [ref=e296]: Versión MVP — Solo validación diaria de horas extra.
          - paragraph [ref=e297]: Esta herramienta no constituye asesoría legal. Verifica con tu empleador o un contador.
      - generic [ref=e298]:
        - img [ref=e299]
        - img [ref=e357]
    - complementary [ref=e414]:
      - img [ref=e415]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test('flujo completo: carga → jornada → turno → calcular → verifica total', async ({ page }) => {
  4  |   await page.goto('/');
  5  | 
  6  |   // 1. Verificar que la página carga
  7  |   await expect(page.getByText('Calculadora de Horas Extra')).toBeVisible();
  8  | 
  9  |   // 2. Ingresar salario
  10 |   const salarioInput = page.getByLabel('Salario mensual (COP)');
  11 |   await salarioInput.fill('2000000');
  12 | 
  13 |   // 3. Jornada pactada: L-V (por defecto), añadir Sáb
> 14 |   await page.getByRole('button', { name: 'Sáb' }).click();
     |                                                   ^ Error: locator.click: Error: strict mode violation: getByRole('button', { name: 'Sáb' }) resolved to 2 elements:
  15 | 
  16 |   // 4. Cambiar horario de Lunes a 07:00-15:00
  17 |   const inicioLun = page.getByLabel('Lun inicio');
  18 |   await inicioLun.fill('07:00');
  19 | 
  20 |   // 5. Turno: fecha específica
  21 |   const fechaInput = page.getByLabel('Fecha del turno');
  22 |   await fechaInput.fill('2026-07-15');
  23 | 
  24 |   // 6. Configurar franja: 14:00-18:00
  25 |   const franjaInicio = page.getByLabel('Franja 1 inicio');
  26 |   await franjaInicio.fill('14:00');
  27 |   const franjaFin = page.getByLabel('Franja 1 fin');
  28 |   await franjaFin.fill('18:00');
  29 | 
  30 |   // 7. Click Calcular
  31 |   await page.getByRole('button', { name: 'Calcular' }).click();
  32 | 
  33 |   // 8. Verificar resultados visibles
  34 |   await expect(page.getByText('Total a pagar')).toBeVisible();
  35 |   await expect(page.getByText('Desglose por hora')).toBeVisible();
  36 |   await expect(page.getByText('Resumen por tipo')).toBeVisible();
  37 | 
  38 |   // 9. Verificar que hay 4 horas en el desglose (14-15, 15-16, 16-17, 17-18)
  39 |   const filas = page.locator('table tbody tr');
  40 |   await expect(filas).toHaveCount(4);
  41 | 
  42 |   // 10. Verificar botón copiar existe
  43 |   await expect(page.getByText('Copiar total')).toBeVisible();
  44 | });
  45 | 
```