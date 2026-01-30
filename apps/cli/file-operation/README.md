# file-operation

Application for file-operation

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
- `prepare`: lefthook install
- `dev`: bun run src/index.ts
- `cli`: bun run src/cli/index.ts
- `build`: bun build src/index.ts --outdir ./dist --target bun
- `lint`: tsc --noEmit && oxlint --fix --type-aware
- `test`: vitest
- `typecheck`: tsc --noEmit
- `verify`: bun run lint && bun run typecheck && bun run test && bun run build
- `format`: dprint fmt

## License

MIT