import type { DevServerConfig } from '../types';

export const createDefaultConfig = (overrides?: Partial<DevServerConfig>): DevServerConfig => {
  return {
    port: 5173,
    host: 'localhost',
    root: process.cwd(),
    base: '/',
    hmr: {
      enabled: true,
      port: 24678,
      host: 'localhost',
      path: '/@hmr',
      timeout: 30000,
      overlay: true,
    },
    cors: {
      enabled: true,
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
      credentials: false,
    },
    fs: {
      strict: false,
      allow: [],
      deny: [],
      serveIndex: true,
    },
    server: {
      headers: {},
      middleware: [],
    },
    build: {
      target: 'browser',
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: true,
      minify: false,
    },
    ...overrides,
  };
};
