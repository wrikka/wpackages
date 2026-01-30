# TypeScript Configuration Presets

TypeScript configuration presets for different environments in the wpackages monorepo.

## Available Presets

### Base Config (`tsconfig.base.json`)
Common settings shared across all projects. Extends this config for all environments.

**Features:**
- Modern: `target: "ESNext"`, `module: "ESNext"`, `moduleResolution: "bundler"`
- Type Safe: Strict mode with all type safety checks enabled
- Productivity: Incremental compilation, skip lib check
- Efficient: Path aliases for monorepo

### Node.js (`tsconfig.node.json`)
Configuration for Node.js runtime applications.

**Usage:**
```json
{
  "extends": "@wpackages/config-tsconfig/node"
}
```

### Bun (`tsconfig.bun.json`)
Configuration for Bun runtime applications.

**Usage:**
```json
{
  "extends": "@wpackages/config-tsconfig/bun"
}
```

### CLI (`tsconfig.cli.json`)
Configuration for command-line interface tools.

**Usage:**
```json
{
  "extends": "@wpackages/config-tsconfig/cli"
}
```

### Web (`tsconfig.web.json`)
Configuration for web/browser applications.

**Usage:**
```json
{
  "extends": "@wpackages/config-tsconfig/web"
}
```

### Turbo (`tsconfig.turbo.json`)
Configuration for Turborepo monorepo builds.

**Usage:**
```json
{
  "extends": "@wpackages/config-tsconfig/turbo"
}
```

## Features

### Modern
- Target: ESNext
- Module: ESNext
- Module Resolution: Bundler
- Verbatim Module Syntax

### Type Safe
- Strict mode enabled
- `noUncheckedIndexedAccess`
- `noImplicitOverride`
- `noPropertyAccessFromIndexSignature`
- `useUnknownInCatchVariables`
- `exactOptionalPropertyTypes`
- `noImplicitReturns`
- `noUncheckedSideEffectImports`

### Productivity
- Incremental compilation
- Skip lib check
- Isolated modules
- Assume changes only affect direct dependencies

### Efficient
- Composite mode for monorepo
- Project references support
- Explicit include/exclude patterns
- Path aliases for monorepo

## Monorepo Integration

All configs support monorepo workflow with:
- `composite: true` for build mode
- `references: []` for dependencies
- Path aliases: `@wpackages/*` and `@w/*`

## Usage

Install the package:
```bash
bun add -D @wpackages/config-tsconfig
```

Extend the appropriate preset in your `tsconfig.json`:
```json
{
  "extends": "@wpackages/config-tsconfig/node",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  }
}
```

## License

MIT
