# cleanup

Application for cleanup

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

- `watch`: bun lint && bun watch && bun test
- `start`: bun --watch dev && vitest:ui
- `dev`: bun run src/index.ts
- `format`: dprint fmt
- `lint`: tsc --noEmit && oxlint --fix --type-aware
- `build`: tsdown src/bin/cli.ts --out-dir dist
- `test`: vitest --run --config ./vitest.config.ts
- `verify`: bun format && bun lint && bun test && bun run build

## License

MIT