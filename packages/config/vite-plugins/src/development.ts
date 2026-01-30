import type { PluginOption } from 'vite';
import TurboConsole from 'unplugin-turbo-console/vite';
import Terminal from 'vite-plugin-terminal';
import Inspect from 'vite-plugin-inspect';

export interface DevelopmentPluginsOptions {
  turboConsole?: boolean;
  terminal?: boolean;
  inspect?: boolean;
}

export function developmentPlugins(options: DevelopmentPluginsOptions = {}): PluginOption[] {
  const {
    turboConsole = true,
    terminal = true,
    inspect = true,
  } = options;

  const plugins: PluginOption[] = [];

  if (turboConsole) {
    plugins.push(TurboConsole({}));
  }

  if (terminal) {
    plugins.push(Terminal());
  }

  if (inspect) {
    plugins.push(Inspect());
  }

  return plugins;
}
