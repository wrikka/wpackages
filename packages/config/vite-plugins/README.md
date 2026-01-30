# @wpackages/vite-plugins

Collection of Vite plugins organized by category, following @[/follow-vite] workflow.

## Installation

```bash
bun install
bun run build
```

## Structure

- `base.ts` - Base plugins used in all projects
- `checker.ts` - Code checking plugins (TypeScript, ESLint, Oxlint)
- `development.ts` - Development plugins (TurboConsole, Terminal, Inspect)
- `build.ts` - Build plugins (Analyzer, Unused)

## Usage

### Use All Plugins

```ts
import { defineConfig } from 'vite';
import { allPlugins } from '@wpackages/vite-plugins';

export default defineConfig({
  plugins: allPlugins({
    base: {
      framework: 'vue',
      autoImportImports: ['vue', 'vue-router'],
      autoImportDts: true,
      iconsAutoInstall: true,
    },
    checker: {
      typescript: true,
      eslint: true,
      oxlint: true,
      vueTsc: true,
    },
    development: {
      turboConsole: true,
      terminal: true,
      inspect: true,
    },
    build: {
      analyzer: false,
      unused: true,
    },
  }),
});
```

### Use by Category

```ts
import { defineConfig } from 'vite';
import { basePlugins, checkerPlugins, developmentPlugins, buildPlugins } from '@wpackages/vite-plugins';

export default defineConfig({
  plugins: [
    ...basePlugins({ framework: 'vue' }),
    ...developmentPlugins(),
    ...buildPlugins(),
    ...checkerPlugins({ vueTsc: true }),
  ],
});
```

### Use Specific Plugins

```ts
import { defineConfig } from 'vite';
import { basePlugins } from '@wpackages/vite-plugins/base';

export default defineConfig({
  plugins: basePlugins({ framework: 'vue' }),
});
```

## Included Plugins

### Base Plugins
- `nitro` - Nitro integration
- `@unocss/vite` - UnoCSS
- `unplugin-auto-import` - Auto import APIs
- `unplugin-ast` - AST transformations
- `unplugin-icons` - Icon components
- `unplugin-isolated-decl` - Isolated declarations
- `unplugin-macros` - Macros
- `unplugin-replace` - Replace strings
- `vite-tsconfig-paths` - TypeScript paths

### Checker Plugins
- `vite-plugin-checker` - TypeScript, ESLint, Oxlint, VueTSC

### Development Plugins
- `unplugin-turbo-console` - Turbo console
- `vite-plugin-terminal` - Terminal in browser
- `vite-plugin-inspect` - Inspect plugins

### Build Plugins
- `vite-bundle-analyzer` - Bundle analyzer
- `unplugin-unused` - Unused code detection
