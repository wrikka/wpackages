import type { PluginOption } from 'vite';
import { analyzer } from 'vite-bundle-analyzer';
import Unused from 'unplugin-unused/vite';

export interface BuildPluginsOptions {
  analyzer?: boolean;
  unused?: boolean;
  unusedInclude?: RegExp[];
  unusedExclude?: RegExp[];
  unusedLevel?: 'error' | 'warning';
  unusedIgnore?: {
    peerDependencies?: string[];
  };
  unusedDepKinds?: ('dependencies' | 'peerDependencies')[];
}

export function buildPlugins(options: BuildPluginsOptions = {}): PluginOption[] {
  const {
    analyzer: enableAnalyzer = false,
    unused: enableUnused = true,
    unusedInclude = [/\.([cm]?[jt]sx?|vue|svelte)$/],
    unusedExclude = [/node_modules/],
    unusedLevel = 'warning',
    unusedIgnore,
    unusedDepKinds = ['dependencies', 'peerDependencies'],
  } = options;

  const plugins: PluginOption[] = [];

  if (enableAnalyzer) {
    plugins.push(analyzer());
  }

  if (enableUnused) {
    plugins.push(
      Unused({
        include: unusedInclude,
        exclude: unusedExclude,
        level: unusedLevel,
        ignore: unusedIgnore,
        depKinds: unusedDepKinds,
      })
    );
  }

  return plugins;
}
