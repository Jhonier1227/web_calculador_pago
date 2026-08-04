# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: pwa.spec.ts >> verifica que la app tiene meta tags PWA y manifest link
- Location: e2e\pwa.spec.ts:3:1

# Error details

```
Error: expect(locator).toHaveAttribute(expected) failed

Locator: locator('link[rel="manifest"]')
Expected: "/manifest.json"
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toHaveAttribute" with timeout 5000ms
  - waiting for locator('link[rel="manifest"]')

```

```yaml
- link "Saltar al contenido principal":
  - /url: "#main-content"
- banner:
  - heading "Calculadora de Horas Extra" [level=1]
  - paragraph: Colombia — Legislación 2026
  - button "Activar modo oscuro":
    - img
- navigation "Secciones":
  - button "Turno":
    - img
    - text: Turno
  - button "Período":
    - img
    - text: Período
  - button "Calculadora":
    - img
    - text: Calculadora
- main:
  - region "Datos del cálculo":
    - heading "Datos del cálculo" [level=2]
    - text: Salario mensual (COP)
    - textbox "Salario mensual (COP)": 1.750.905
    - button "Usar salario mínimo ($ 1.750.905)"
    - text: Auxilio de transporte (opcional)
    - textbox "Auxilio de transporte (opcional)": "0"
    - paragraph: Solo suma al total final
  - heading "Jornada pactada" [level=2]
  - paragraph: Selecciona los días que trabajas habitualmente y tu horario por día.
  - button "Lun"
  - button "Mar"
  - button "Mié"
  - button "Jue"
  - button "Vie"
  - button "Sáb"
  - button "Dom"
  - text: Lun Lun inicio
  - textbox "Lun inicio": 08:00
  - text: Lun fin
  - textbox "Lun fin": 17:00
  - text: Mar Mar inicio
  - textbox "Mar inicio": 08:00
  - text: Mar fin
  - textbox "Mar fin": 17:00
  - text: Mié Mié inicio
  - textbox "Mié inicio": 08:00
  - text: Mié fin
  - textbox "Mié fin": 17:00
  - text: Jue Jue inicio
  - textbox "Jue inicio": 08:00
  - text: Jue fin
  - textbox "Jue fin": 17:00
  - text: Vie Vie inicio
  - textbox "Vie inicio": 08:00
  - text: Vie fin
  - textbox "Vie fin": 17:00
  - alert:
    - img
    - text: La jornada semanal (45h) excede el límite legal de 42 horas.
  - paragraph: "Horas/semana: 45h"
  - heading "Período a calcular" [level=2]
  - text: Fecha de inicio
  - textbox "Fecha de inicio": 2026-07-31
  - text: Fecha de fin
  - textbox "Fecha de fin": 2026-07-31
  - paragraph: Bloques de horario
  - text: Bloque 1 Desde
  - textbox "Desde": 2026-07-31
  - text: Hasta
  - textbox "Hasta": 2026-07-31
  - text: Tipo de jornada
  - button "Jornada estándar Descanso el domingo"
  - button "Turno rotativo Elegir día de descanso"
  - paragraph: El recargo dominical aplica sobre el día de descanso obligatorio pactado, no necesariamente el domingo (Art. 179 CST).
  - button "Lun"
  - button "Mar"
  - button "Mié"
  - button "Jue"
  - button "Vie"
  - button "Sáb"
  - button "Dom"
  - text: Lun Lun inicio
  - textbox "Lun inicio": 08:00
  - text: Lun fin
  - textbox "Lun fin": 17:00
  - text: Mar Mar inicio
  - textbox "Mar inicio": 08:00
  - text: Mar fin
  - textbox "Mar fin": 17:00
  - text: Mié Mié inicio
  - textbox "Mié inicio": 08:00
  - text: Mié fin
  - textbox "Mié fin": 17:00
  - text: Jue Jue inicio
  - textbox "Jue inicio": 08:00
  - text: Jue fin
  - textbox "Jue fin": 17:00
  - text: Vie Vie inicio
  - textbox "Vie inicio": 08:00
  - text: Vie fin
  - textbox "Vie fin": 17:00
  - text: Descanso (almuerzo u otro)
  - combobox "Descanso (almuerzo u otro)":
    - option "Sin descanso (0 min)" [selected]
    - option "15 minutos"
    - option "30 minutos"
    - option "45 minutos"
    - option "1 hora (60 min)"
    - option "1 hora 30 min (90 min)"
  - button "Añadir bloque":
    - img
    - text: Añadir bloque
  - button "Calcular período"
  - heading "Cómo funciona el cálculo" [level=2]
  - tablist:
    - tab "Cómo se calcula" [selected]
    - tab "Tabla de recargos"
    - tab "Recargo vs Extra"
    - tab "Ley Emiliani"
    - tab "Límites legales"
    - tab "Preguntas frecuentes"
  - tabpanel "Cómo se calcula":
    - list:
      - listitem:
        - text: Se calcula el
        - strong: valor de la hora ordinaria
        - text: ": salario mensual ÷ 210."
      - listitem: Se genera una hora por cada hora del turno (incluyendo cruce de medianoche).
      - listitem:
        - text: "Por cada hora se determina:"
        - list:
          - listitem:
            - strong: Dentro/fuera
            - text: de jornada pactada (día + horario).
          - listitem:
            - strong: Nocturna
            - text: (19:00 - 05:59) o diurna.
          - listitem:
            - strong: Festivo
            - text: (domingo no laborable o festivo nacional).
      - listitem:
        - text: Con esas 3 condiciones se aplica la
        - strong: tabla de 8 casos
        - text: para determinar el tipo de hora y su recargo.
      - listitem:
        - text: El
        - strong: valor por hora
        - text: "se calcula como:"
        - list:
          - listitem:
            - text: "Dentro de jornada:"
            - code: valorHoraOrd × recargo
          - listitem:
            - text: "Fuera de jornada:"
            - code: valorHoraOrd × (1 + recargo)
      - listitem: Se suman todas las horas y se agrega el auxilio de transporte (si aplica).
- contentinfo:
  - paragraph: Versión MVP — Solo validación diaria de horas extra.
  - paragraph: Esta herramienta no constituye asesoría legal. Verifica con tu empleador o un contador.
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test('verifica que la app tiene meta tags PWA y manifest link', async ({ page }) => {
  4  |   await page.goto('/');
  5  | 
  6  |   const themeColor = page.locator('meta[name="theme-color"]');
  7  |   await expect(themeColor).toHaveAttribute('content', '#059669');
  8  | 
  9  |   const viewport = page.locator('meta[name="viewport"]');
  10 |   await expect(viewport).toHaveAttribute('content', /width=device-width/);
  11 | 
  12 |   await expect(page).toHaveTitle(/Calculadora/);
  13 | 
  14 |   const manifest = page.locator('link[rel="manifest"]');
> 15 |   await expect(manifest).toHaveAttribute('href', '/manifest.json');
     |                          ^ Error: expect(locator).toHaveAttribute(expected) failed
  16 | });
  17 | 
```