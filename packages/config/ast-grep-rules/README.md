# @wpackages/wvite-ast-grep-plugin

Vite plugin for ast-grep rules integration.

## Features

- Integrates ast-grep rules into Vite build process
- Provides built-in rules for Vite plugin development:
  - Plugin naming convention (w prefix)
  - Plugin structure validation
  - Plugin export patterns
- Configurable rules and config paths

## Installation

```bash
bun add @wpackages/wvite-ast-grep-plugin -D
```

## Usage

```typescript
import wviteAstGrepPlugin from "@wpackages/wvite-ast-grep-plugin";

export default {
  plugins: [
    wviteAstGrepPlugin({
      rulesPath: "./rules",
      configPath: "./sgconfig.yml",
    }),
  ],
};
```

## Rules

### Plugin Naming Rule

Ensures Vite plugins have 'w' prefix (e.g., wlinter, wformatter).

### Plugin Structure Rule

Ensures Vite plugins have a 'name' property.

### Plugin Export Rule

Ensures Vite plugins are exported correctly.

## Development

```bash
# Build
bun run build

# Watch mode
bun run dev

# Test
bun run test

# Lint
bun run lint

# Type check
bun run typecheck
```

## License

MIT
