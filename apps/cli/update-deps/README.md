# update-deps

Application for update-deps

Update dependencies CLI - Better than taze using bun native API

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

- `build`: bun build --compile --outfile ./dist/update-deps ./src/index.ts
- `dev`: bun run --hot ./src/index.ts
- `format`: dprint fmt
- `lint`: tsc --noEmit && oxlint --fix --type-aware
- `test`: vitest
- `test:ui`: vitest --ui
- `test:cov`: vitest --coverage
- `check`: oxlint --fix --type-aware && vitest run
- `watch`: bun --watch src/index.ts

## License

MIT