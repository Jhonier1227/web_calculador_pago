import { test, expect } from '@playwright/test';

test('flujo completo: carga → jornada → turno → calcular → verifica total', async ({ page }) => {
  await page.goto('/');

  // 1. Verificar que la página carga
  await expect(page.getByText('Calculadora de Horas Extra')).toBeVisible();

  // 2. Ingresar salario
  const salarioInput = page.getByLabel('Salario mensual (COP)');
  await salarioInput.fill('2000000');

  // 3. Jornada pactada: L-V (por defecto), añadir Sáb
  await page.getByRole('button', { name: 'Sáb' }).click();

  // 4. Cambiar horario de Lunes a 07:00-15:00
  const inicioLun = page.getByLabel('Lun inicio');
  await inicioLun.fill('07:00');

  // 5. Turno: fecha específica
  const fechaInput = page.getByLabel('Fecha del turno');
  await fechaInput.fill('2026-07-15');

  // 6. Configurar franja: 14:00-18:00
  const franjaInicio = page.getByLabel('Franja 1 inicio');
  await franjaInicio.fill('14:00');
  const franjaFin = page.getByLabel('Franja 1 fin');
  await franjaFin.fill('18:00');

  // 7. Click Calcular
  await page.getByRole('button', { name: 'Calcular' }).click();

  // 8. Verificar resultados visibles
  await expect(page.getByText('Total a pagar')).toBeVisible();
  await expect(page.getByText('Desglose por hora')).toBeVisible();
  await expect(page.getByText('Resumen por tipo')).toBeVisible();

  // 9. Verificar que hay 4 horas en el desglose (14-15, 15-16, 16-17, 17-18)
  const filas = page.locator('table tbody tr');
  await expect(filas).toHaveCount(4);

  // 10. Verificar botón copiar existe
  await expect(page.getByText('Copiar total')).toBeVisible();
});
