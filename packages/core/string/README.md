# string

Package for string

String utilities and helpers

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
- `format`: bunx dprint fmt
- `lint`: tsc --noEmit && oxlint --fix --type-aware
- `build`: bun build src/index.ts --outdir dist --target bun
- `test`: bunx vitest run
- `verify`: bun run format && bun run lint && bun run test && bun run build

## License

MIT