# cli-builder

Application for cli-builder

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

- `watch`: bun --watch verify
- `start`: bun --watch dev && vitest:ui
- `dev`: bun run src/app.ts
- `lint`: tsc --noEmit && oxlint --fix --type-aware
- `build`: tsdown src/index.ts --entry-points bin/cli.ts
- `format`: dprint fmt
- `test`: vitest --run
- `test:coverage`: vitest --run --coverage
- `verify`: bun format && bun lint && bun test && bun run build

## License

MIT