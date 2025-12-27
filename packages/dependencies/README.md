# dependencies

Universal package manager CLI that combines the best of `ni` and `taze` with enhanced features.

## Features

✨ **Better than ni + taze combined:**

- 🔍 **Auto-detect** package manager (npm, yarn, pnpm, bun, deno)
- 📦 **Universal commands** across all package managers
- 🎯 **Type-safe** with complete TypeScript definitions
- 🏗️ **Monorepo support** built-in
- 🎨 **Beautiful CLI** with colored output
- ⚡ **Fast** and lightweight
- 🔧 **Functional architecture** using Effect-TS
- 🧪 **Well-tested** with comprehensive test coverage

## Installation

```bash
bun add -g dependencies
```

## CLI Usage

### Install Dependencies

```bash
# Install all dependencies
wi

# Add packages
wi react vue svelte

# Add dev dependencies
wi -D vitest typescript

# Add with exact version
wi -E react@18.0.0

# Install globally
wi -g typescript

# Frozen lockfile (CI mode)
wi --frozen

# Production only
wi --production
```

### Run Scripts

```bash
# Run script
wr dev

# Run with arguments
wr test --coverage

# Interactive script selection
wr -i
```

### Execute Commands

```bash
# Execute command (like npx/bunx)
wx taze -r

# Execute with arguments
wx typescript --init
```

### Update Dependencies

```bash
# Update all
wu

# Update specific packages
wu react vue

# Interactive update
wu -i

# Update to latest (ignore semver)
wu --latest
```

### Remove Dependencies

```bash
# Remove packages
wun lodash

# Remove multiple
wun lodash axios

# Remove global
wun -g typescript
```

## CLI Commands

| Command | Alias | Description |
|---------|-------|-------------|
| `wi` | `wdep install` | Install or add dependencies |
| `wr` | `wdep run` | Run scripts |
| `wx` | `wdep exec` | Execute commands |
| `wu` | `wdep update` | Update dependencies |
| `wun` | `wdep uninstall` | Remove dependencies |

## Programmatic API

```typescript
import { install, add, remove, update, run } from 'dependencies'
import { Effect } from 'effect'

// Install dependencies
await Effect.runPromise(
  install({ cwd: process.cwd() })
)

// Add packages
await Effect.runPromise(
  add(['react', 'vue'], {
    cwd: process.cwd(),
    type: 'dependencies'
  })
)

// Add dev dependencies
await Effect.runPromise(
  add(['vitest'], {
    cwd: process.cwd(),
    type: 'devDependencies'
  })
)

// Remove packages
await Effect.runPromise(
  remove(['lodash'], { cwd: process.cwd() })
)

// Update packages
await Effect.runPromise(
  update(['react'], { cwd: process.cwd() })
)

// Run script
await Effect.runPromise(
  run('dev', {
    cwd: process.cwd(),
    args: ['--port=3000']
  })
)
```

## Package Manager Detection

The library automatically detects your package manager from:

1. **Lock files** (highest priority):
   - `bun.lockb` → bun
   - `pnpm-lock.yaml` → pnpm
   - `yarn.lock` → yarn
   - `deno.lock` → deno
   - `package-lock.json` → npm

2. **package.json** `packageManager` field (medium priority)

3. **Default** to `bun` (lowest priority)

## Comparison with ni and taze

| Feature | dependencies | ni | taze |
|---------|------------------|----|----|
| Auto-detect PM | ✅ | ✅ | ❌ |
| Universal commands | ✅ | ✅ | ❌ |
| Dependency updates | ✅ | ⚠️ Basic | ✅ |
| TypeScript first | ✅ | ❌ | ✅ |
| Effect-TS based | ✅ | ❌ | ❌ |
| Functional architecture | ✅ | ❌ | ❌ |
| Monorepo support | ✅ | ⚠️ Basic | ✅ |
| Interactive mode | ✅ | ✅ | ✅ |
| Beautiful CLI | ✅ | ⚠️ Basic | ✅ |
| Programmatic API | ✅ | ❌ | ⚠️ Limited |

## Architecture

Built with functional programming principles:

```
types/          Type definitions
constant/       Constants and mappings
utils/          Pure functions
services/       Effect-TS services
lib/            Third-party wrappers
cli.ts          CLI entry point
index.ts        Library entry point
```

## Supported Package Managers

- ✅ npm
- ✅ yarn (v1 and berry)
- ✅ pnpm
- ✅ bun
- ✅ deno

## Options

### Install Options

- `--frozen` - Use frozen lockfile (CI mode)
- `--production` - Install production dependencies only
- `--silent` - Silent mode

### Add Options

- `-D, --dev` - Add as dev dependency
- `-E, --exact` - Install exact version
- `-g, --global` - Install globally
- `--silent` - Silent mode

### Update Options

- `-i, --interactive` - Interactive mode
- `--latest` - Update to latest (ignore semver)
- `--silent` - Silent mode

### Remove Options

- `-g, --global` - Remove globally
- `--silent` - Silent mode

## Examples

### Monorepo Usage

```bash
# Install all workspace dependencies
wi

# Add workspace package
wi @workspace/package

# Update all packages in monorepo
wu -i
```

### CI/CD Usage

```bash
# Frozen lockfile
wi --frozen

# Production only
wi --production --frozen
```

### Development Workflow

```bash
# Add dev tools
wi -D vitest typescript @types/node

# Run dev server
wr dev

# Run tests with coverage
wr test --coverage

# Update dependencies interactively
wu -i
```

## License

Part of WTS framework monorepo.
