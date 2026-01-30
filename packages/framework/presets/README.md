# presets

Package for presets

Presets and configurations for wpackages workspace with theme, config, and app composition

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

- `dev`: bun run src/index.ts
- `build`: bun build src/index.ts --outdir dist --target bun
- `test`: vitest run
- `test:watch`: vitest
- `test:coverage`: vitest run --coverage
- `lint`: tsc --noEmit && oxlint --fix --type-aware
- `format`: dprint fmt
- `verify`: bun run format && bun run lint && bun run test:coverage && bun run build
- `watch`: bun --watch src/index.ts

## License

MIT