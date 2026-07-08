import { test, expect } from '@playwright/test';

test('verifica que la app tiene meta tags PWA y manifest link', async ({ page }) => {
  await page.goto('/');

  const themeColor = page.locator('meta[name="theme-color"]');
  await expect(themeColor).toHaveAttribute('content', '#059669');

  const viewport = page.locator('meta[name="viewport"]');
  await expect(viewport).toHaveAttribute('content', /width=device-width/);

  await expect(page).toHaveTitle(/Calculadora/);

  const manifest = page.locator('link[rel="manifest"]');
  await expect(manifest).toHaveAttribute('href', '/manifest.json');
});
