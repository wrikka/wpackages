# generate-readme

Application for generate-readme

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

- `dev`: bun run src/index.ts
- `build`: bun build src/index.ts --outdir dist
- `start`: bun run dist/index.js
- `lint`: tsc --noEmit && oxlint --fix --type-aware
- `watch`: bun --watch src/index.ts
- `format`: dprint fmt
- `test`: vitest run

## License

MIT