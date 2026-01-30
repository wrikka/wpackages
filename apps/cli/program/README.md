# program

Application for program

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

- `watch`: bun run dev
- `start`: bun run dev
- `dev`: bun run src/index.ts
- `format`: dprint fmt
- `lint`: tsc --noEmit && oxlint --fix --type-aware
- `build`: tsdown
- `test`: vitest run
- `test:ui`: vitest --ui
- `verify`: bun format && bun lint && bun run test && (bun audit || true) && bun run build

## License

MIT