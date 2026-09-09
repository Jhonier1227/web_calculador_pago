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
            - generic [ref=e132]:
              - generic [ref=e133]: ℹ️
              - paragraph [ref=e134]:
                - strong [ref=e135]: Referencial.
                - text: Si tienes un acuerdo escrito con tu empleador de trabajar menos de 8h diarias, indícalo aquí. De lo contrario, se usará el máximo legal de 8h.
            - generic [ref=e136]:
              - button "Lun" [ref=e137]
              - button "Mar" [ref=e138]
              - button "Mié" [ref=e139]
              - button "Jue" [ref=e140]
              - button "Vie" [ref=e141]
              - button "Sáb" [ref=e142]
              - button "Dom" [ref=e143]
            - generic [ref=e144]:
              - generic [ref=e145]: Lun
              - generic [ref=e146]: Lun inicio
              - textbox "Lun inicio" [ref=e147]: 08:00
              - generic [ref=e148]: a
              - generic [ref=e149]: Lun fin
              - textbox "Lun fin" [ref=e150]: 17:00
            - generic [ref=e151]:
              - generic [ref=e152]: Mar
              - generic [ref=e153]: Mar inicio
              - textbox "Mar inicio" [ref=e154]: 08:00
              - generic [ref=e155]: a
              - generic [ref=e156]: Mar fin
              - textbox "Mar fin" [ref=e157]: 17:00
            - generic [ref=e158]:
              - generic [ref=e159]: Mié
              - generic [ref=e160]: Mié inicio
              - textbox "Mié inicio" [ref=e161]: 08:00
              - generic [ref=e162]: a
              - generic [ref=e163]: Mié fin
              - textbox "Mié fin" [ref=e164]: 17:00
            - generic [ref=e165]:
              - generic [ref=e166]: Jue
              - generic [ref=e167]: Jue inicio
              - textbox "Jue inicio" [ref=e168]: 08:00
              - generic [ref=e169]: a
              - generic [ref=e170]: Jue fin
              - textbox "Jue fin" [ref=e171]: 17:00
            - generic [ref=e172]:
              - generic [ref=e173]: Vie
              - generic [ref=e174]: Vie inicio
              - textbox "Vie inicio" [ref=e175]: 08:00
              - generic [ref=e176]: a
              - generic [ref=e177]: Vie fin
              - textbox "Vie fin" [ref=e178]: 17:00
            - generic [ref=e179]:
              - generic [ref=e180]: Descanso diario (almuerzo u otro)
              - combobox "Descanso diario (almuerzo u otro)" [ref=e181]:
                - option "Sin descanso (0 min)" [selected]
                - option "15 minutos"
                - option "30 minutos"
                - option "45 minutos"
                - option "1 hora (60 min)"
                - option "1 hora 30 min (90 min)"
              - paragraph [ref=e182]: Se descuenta de las horas efectivas — Art. 167 CST
            - generic [ref=e183]:
              - generic [ref=e184]: Horas diarias pactadas (opcional)
              - spinbutton "Horas diarias pactadas (opcional)" [ref=e185]
              - paragraph [ref=e186]: Si no lo llenas, se usarán 8h como límite ordinario diario
            - generic [ref=e187]:
              - alert [ref=e188]:
                - img [ref=e189]
                - generic [ref=e191]: La jornada semanal (45h) excede el límite legal de 42 horas.
              - paragraph [ref=e192]:
                - text: "Horas brutas/semana:"
                - generic [ref=e193]: 45h
              - paragraph [ref=e194]: ℹ️ Este dato es orientativo — no afecta el cálculo de recargos
          - generic [ref=e197]:
            - heading "Período a calcular" [level=2] [ref=e198]
            - generic [ref=e199]:
              - generic [ref=e200]:
                - generic [ref=e201]: Fecha de inicio
                - textbox "Fecha de inicio" [ref=e202]: 2026-09-06
              - generic [ref=e203]:
                - generic [ref=e204]: Fecha de fin
                - textbox "Fecha de fin" [ref=e205]: 2026-09-30
            - generic [ref=e206]:
              - paragraph [ref=e207]: Bloques de horario
              - generic [ref=e208]:
                - generic [ref=e210]:
                  - generic [ref=e211]: Bloque 1
                  - generic [ref=e212]: Lun-Vie
                - generic [ref=e213]:
                  - generic [ref=e214]:
                    - generic [ref=e215]: Desde
                    - textbox "Desde" [ref=e216]: 2026-09-06
                  - generic [ref=e217]:
                    - generic [ref=e218]: Hasta
                    - textbox "Hasta" [ref=e219]: 2026-09-30
                - generic [ref=e220]:
                  - generic [ref=e221]: Tipo de jornada
                  - generic [ref=e222]:
                    - button "Jornada estándar Descanso el domingo" [ref=e223]:
                      - text: Jornada estándar
                      - generic [ref=e224]: Descanso el domingo
                    - button "Turno rotativo Elegir día(s) de descanso" [ref=e225]:
                      - text: Turno rotativo
                      - generic [ref=e226]: Elegir día(s) de descanso
                  - paragraph [ref=e227]: El recargo dominical aplica sobre el día(s) de descanso obligatorio pactado(s), no necesariamente el domingo (Art. 179 CST).
                - generic [ref=e228]:
                  - button "Lun" [ref=e229]
                  - button "Mar" [ref=e230]
                  - button "Mié" [ref=e231]
                  - button "Jue" [ref=e232]
                  - button "Vie" [ref=e233]
                  - button "Sáb" [ref=e234]
                  - button "Dom" [ref=e235]
                - generic [ref=e236]:
                  - generic [ref=e237]: Lun
                  - generic [ref=e238]: Lun inicio
                  - textbox "Lun inicio" [ref=e239]: 08:00
                  - generic [ref=e240]: a
                  - generic [ref=e241]: Lun fin
                  - textbox "Lun fin" [ref=e242]: 17:00
                - generic [ref=e243]:
                  - generic [ref=e244]: Mar
                  - generic [ref=e245]: Mar inicio
                  - textbox "Mar inicio" [ref=e246]: 08:00
                  - generic [ref=e247]: a
                  - generic [ref=e248]: Mar fin
                  - textbox "Mar fin" [ref=e249]: 17:00
                - generic [ref=e250]:
                  - generic [ref=e251]: Mié
                  - generic [ref=e252]: Mié inicio
                  - textbox "Mié inicio" [ref=e253]: 08:00
                  - generic [ref=e254]: a
                  - generic [ref=e255]: Mié fin
                  - textbox "Mié fin" [ref=e256]: 17:00
                - generic [ref=e257]:
                  - generic [ref=e258]: Jue
                  - generic [ref=e259]: Jue inicio
                  - textbox "Jue inicio" [ref=e260]: 08:00
                  - generic [ref=e261]: a
                  - generic [ref=e262]: Jue fin
                  - textbox "Jue fin" [ref=e263]: 17:00
                - generic [ref=e264]:
                  - generic [ref=e265]: Vie
                  - generic [ref=e266]: Vie inicio
                  - textbox "Vie inicio" [ref=e267]: 08:00
                  - generic [ref=e268]: a
                  - generic [ref=e269]: Vie fin
                  - textbox "Vie fin" [ref=e270]: 17:00
                - generic [ref=e271]:
                  - generic [ref=e272]: Descanso (almuerzo u otro)
                  - combobox "Descanso (almuerzo u otro)" [ref=e273]:
                    - option "Sin descanso (0 min)" [selected]
                    - option "15 minutos"
                    - option "30 minutos"
                    - option "45 minutos"
                    - option "1 hora (60 min)"
                    - option "1 hora 30 min (90 min)"
              - button "Añadir bloque" [ref=e274]:
                - img [ref=e275]
                - text: Añadir bloque
            - button "Calcular período" [ref=e276]
          - generic [ref=e277]:
            - heading "Cómo funciona el cálculo" [level=2] [ref=e278]
            - generic [ref=e280]:
              - tablist [ref=e281]:
                - tab "Cómo se calcula" [selected] [ref=e282]
                - tab "Tabla de recargos" [ref=e283]
                - tab "Recargo vs Extra" [ref=e284]
                - tab "Ley Emiliani" [ref=e285]
                - tab "Límites legales" [ref=e286]
                - tab "Preguntas frecuentes" [ref=e287]
              - tabpanel "Cómo se calcula" [ref=e288]:
                - list [ref=e289]:
                  - listitem [ref=e290]:
                    - text: Se calcula el
                    - strong [ref=e291]: valor de la hora ordinaria
                    - text: ": salario mensual ÷ 210."
                  - listitem [ref=e292]: Se genera una hora por cada hora del turno (incluyendo cruce de medianoche).
                  - listitem [ref=e293]:
                    - text: "Por cada hora se determina:"
                    - list [ref=e294]:
                      - listitem [ref=e295]:
                        - strong [ref=e296]: Dentro/fuera
                        - text: de jornada pactada (día + horario).
                      - listitem [ref=e297]:
                        - strong [ref=e298]: Nocturna
                        - text: (19:00 - 05:59) o diurna.
                      - listitem [ref=e299]:
                        - strong [ref=e300]: Festivo
                        - text: (domingo no laborable o festivo nacional).
                  - listitem [ref=e301]:
                    - text: Con esas 3 condiciones se aplica la
                    - strong [ref=e302]: tabla de 8 casos
                    - text: para determinar el tipo de hora y su recargo.
                  - listitem [ref=e303]:
                    - text: El
                    - strong [ref=e304]: valor por hora
                    - text: "se calcula como:"
                    - list [ref=e305]:
                      - listitem [ref=e306]:
                        - text: "Dentro de jornada:"
                        - code [ref=e307]: valorHoraOrd × recargo
                      - listitem [ref=e308]:
                        - text: "Fuera de jornada:"
                        - code [ref=e309]: valorHoraOrd × (1 + recargo)
                  - listitem [ref=e310]: Se suman todas las horas y se agrega el auxilio de transporte (si aplica).
        - contentinfo [ref=e311]:
          - paragraph [ref=e312]: Versión MVP — Solo validación diaria de horas extra.
          - paragraph [ref=e313]: Esta herramienta no constituye asesoría legal. Verifica con tu empleador o un contador.
      - generic [ref=e314]:
        - img [ref=e315]
        - img [ref=e373]
    - complementary [ref=e430]:
      - img [ref=e431]
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