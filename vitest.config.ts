import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    env: {
      NODE_ENV: 'test',
    },
    envDir: '.',
    envPrefix: '',
    setupFiles: ['./tests/setup.ts'],
    testTimeout: 10000, // 10s timeout for DB operations
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'src/generated/', 'tests/'],
    },
  },
});
