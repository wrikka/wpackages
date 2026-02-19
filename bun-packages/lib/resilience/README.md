# resilience

Package for resilience

Resilience patterns and fault tolerance utilities built with functional programming

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

- `build`: tsdown --exports --dts --minify
- `dev`: bun --watch src/index.ts
- `format`: dprint fmt
- `lint`: tsc --noEmit && oxlint --fix --type-aware
- `verify`: bun lint && bun test && bun build
- `test`: vitest
- `test:coverage`: vitest --coverage
- `test:ui`: vitest --ui
- `clean`: rm -rf dist .tsbuildinfo coverage
- `prepublishOnly`: bun run clean && bun run build
- `watch`: bun --watch src/index.ts

## License

MIT