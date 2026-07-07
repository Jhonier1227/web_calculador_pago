import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/lib/calculos/'],
      exclude: ['src/lib/calculos/index.ts'],
      thresholds: {
        lines: 90,
      },
    },
  },
});
