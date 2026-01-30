# dependency

Package for dependency

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

- `dev`: bun --watch src/index.ts
- `build`: bun build ./src/index.ts --outdir ./dist
- `lint`: tsc --noEmit && oxlint --fix --type-aware
- `lint:fix`: oxlint . --fix
- `test`: bun test
- `watch`: bun --watch src/index.ts
- `format`: dprint fmt

## License

MIT