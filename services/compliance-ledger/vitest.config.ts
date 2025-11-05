import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    dir: 'tests',
    coverage: {
      enabled: true,
      reporter: ['text', 'html'],
      statements: 80,
      branches: 70,
      functions: 80,
      lines: 80
    }
  }
});

