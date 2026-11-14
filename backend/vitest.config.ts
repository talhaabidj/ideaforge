import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    exclude: ['**/node_modules/**', '**/dist/**'],
    // config/env.ts requires these at import time; tests never connect to them.
    env: {
      DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
      GEMINI_API_KEY: 'test-key',
      LOG_LEVEL: 'fatal',
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      exclude: ['src/index.ts'],
    },
  },
});
