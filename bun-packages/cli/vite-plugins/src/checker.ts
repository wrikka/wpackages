import type { PluginOption } from 'vite';
import checker from 'vite-plugin-checker';

export interface CheckerPluginsOptions {
  typescript?: boolean;
  eslint?: boolean;
  oxlint?: boolean;
  vueTsc?: boolean;
  overlay?: {
    initialIsOpen?: boolean;
  };
}

export function checkerPlugins(options: CheckerPluginsOptions = {}): PluginOption[] {
  const {
    typescript = true,
    eslint = true,
    oxlint = true,
    vueTsc = false,
    overlay = {
      initialIsOpen: false,
    },
  } = options;

  return [
    checker({
      overlay,
      typescript,
      eslint,
      oxlint,
      vueTsc,
    }),
  ];
}
