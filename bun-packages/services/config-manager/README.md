# config-manager

Package for config-manager

A comprehensive config manager with support for multiple file formats, environment variables, and schema validation.

## Installation

```bash
bun install
```

## Usage

```bash
bun run dev
```

## Development

```bash
bun run build
bun run test
```

## Available Scripts

- `build`: tsdown
- `dev`: tsdown --watch
- `test`: vitest run
- `lint`: tsc --noEmit && oxlint --fix --type-aware
- `verify`: bun run lint && bun run test && bun run build
- `watch`: bun --watch src/index.ts
- `format`: dprint fmt

## License

MIT
