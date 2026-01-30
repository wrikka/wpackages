# linter

Application for linter

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
- `lint`: tsc --noEmit && oxlint --fix --type-aware
- `build`: tsc
- `test`: vitest --run
- `verify`: bun format && bun lint && bun test && bun audit && run build
- `format`: dprint fmt

## License

MIT