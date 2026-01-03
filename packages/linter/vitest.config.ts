import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
  },
  resolve: {
    alias: {
      '@wservices/parser': path.resolve(__dirname, '../../services/parser/src'),
      '@wpackages/bench': path.resolve(__dirname, '../bench/src'),
      '@wpackages/design-pattern': path.resolve(__dirname, '../../utils/design-pattern/src'),
    },
  },
});
