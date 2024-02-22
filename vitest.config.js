import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      exclude: [
        'coverage/**',
        'dist/**',
        'load-test/**',
        'node_modules/**',
        'src/database/**',
        'src/libs/**',
        'src/middlewares/**',
        'src/server.js',
        'src/router.js',
        'src/cluster.js',
        'src/repositories/transactionRepository.js',
        'src/repositories/transactionRepositoryInMemory.js',
      ],
    },
  },
});
