import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.test.{ts,tsx}'],
    environment: 'jsdom',
    setupFiles: ['src/test-setup.ts'],
    css: { include: /.+/ },
    coverage: {
      provider: 'v8',
      include: ['src/lib/calculos/', 'src/components/', 'src/hooks/', 'src/lib/analytics.ts'],
      exclude: ['src/lib/calculos/index.ts', 'src/components/ui/index.ts', 'src/components/Calculadora/index.ts'],
      thresholds: {
        lines: 50,
      },
    },
  },
});
