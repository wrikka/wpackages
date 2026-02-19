# worker

Package for worker

Web Worker management for Bun

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
- `dev`: bun run src/index.ts
- `format`: dprint fmt
- `lint`: tsc --noEmit && oxlint --fix --type-aware
- `build`: bun build ./src/index.ts --outdir ./dist --target bun --format esm && tsc --emitDeclarationOnly
- `test`: vitest
- `verify`: bun run format && bun run lint && bun run test && bun run build && bun run dev

## License

MIT