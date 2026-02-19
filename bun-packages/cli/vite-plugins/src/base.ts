import type { PluginOption } from 'vite';
import { nitro } from 'nitro/vite';
import Unocss from '@unocss/vite';
import AutoImport from 'unplugin-auto-import/vite';
import Replace from 'unplugin-replace/vite';
import AST from 'unplugin-ast/vite';
import Macros from 'unplugin-macros/vite';
import UnpluginIsolatedDecl from 'unplugin-isolated-decl/vite';
import Icons from 'unplugin-icons/vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export interface BasePluginsOptions {
  framework?: 'vue' | 'react' | 'svelte' | 'solid';
  autoImportImports?: (string | Record<string, any>)[];
  autoImportDts?: boolean;
  iconsAutoInstall?: boolean;
}

export function basePlugins(options: BasePluginsOptions = {}): PluginOption[] {
  const {
    framework = 'vue',
    autoImportImports = [framework],
    autoImportDts = true,
    iconsAutoInstall = true,
  } = options;

  return [
    nitro(),
    Unocss(),
    AutoImport({
      imports: autoImportImports,
      dts: autoImportDts,
    }),
    AST(),
    Icons({
      autoInstall: iconsAutoInstall,
    }),
    UnpluginIsolatedDecl(),
    Macros(),
    Replace(),
    tsconfigPaths(),
  ];
}
