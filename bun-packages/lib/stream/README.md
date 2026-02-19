# stream

Package for stream

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

- `build`: bun build src/index.ts --outdir dist
- `dev`: bun --watch src/index.ts
- `format`: dprint fmt
- `lint`: tsc --noEmit && oxlint --fix --type-aware
- `lint:fix`: oxlint . --fix
- `typecheck`: tsc --noEmit
- `test`: vitest
- `verify`: bun format && bun lint && bun typecheck && bun test
- `watch`: bun --watch src/index.ts

## License

MIT