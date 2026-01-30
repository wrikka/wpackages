# web-analytics

Application for web-analytics

Analytics service with Effect-TS for event tracking and batch sending

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
- `dev`: bun run src/main.ts
- `format`: dprint fmt
- `lint`: tsc --noEmit && oxlint --fix --type-aware
- `build`: bun build src/index.ts --outdir dist --target bun
- `test`: vitest run
- `test:watch`: vitest
- `test:coverage`: vitest run --coverage
- `verify`: bun run format && bun audit && bun run lint && bun run test:coverage && bun run build && bun run dev

## License

MIT