# scripts

Package for scripts

Functional script management package for running and managing scripts

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
- `dev`: tsdown --watch
- `test`: vitest run
- `test:watch`: vitest
- `test:coverage`: vitest run --coverage
- `format`: dprint fmt
- `lint`: tsc --noEmit && oxlint --fix --type-aware
- `verify`: bun run format && bun run lint && bun run test && bun run build
- `watch`: bun --watch src/index.ts

## License

MIT