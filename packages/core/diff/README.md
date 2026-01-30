# diff

Package for diff

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

- `watch`: bun --watch test
- `dev`: bun run src/index.ts
- `format`: dprint fmt
- `lint`: tsc --noEmit && oxlint --fix --type-aware
- `build`: bun build ./src/index.ts --outdir dist
- `test`: bun test
- `verify`: bun run format && bun run lint && bun run test && bun run build

## License

MIT